"""
Dependency-free local web frontend for VideoScholar.

Run:
    python web_app.py

Then open:
    http://127.0.0.1:7860/

This server intentionally uses only Python standard-library HTTP utilities for
the web layer. It reuses video_rag_pipeline.py lazily for RAG operations and
does not change the existing CLI entrypoint.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import mimetypes
import os
import re
import sys
import threading
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


PROJECT_DIR = Path(__file__).resolve().parent
WEB_DIR = PROJECT_DIR / "web"
DATA_DIR = PROJECT_DIR / "data" / "videos"
DEMO_VIDEO = PROJECT_DIR / "编译原理" / "1.1.1 什么是编译程序" / "1.1.1 什么是编译程序.mp4"
RAG_ANYTHING_DIR = PROJECT_DIR / "RAG-Anything"
HOST = "127.0.0.1"
PORT = 7860

if str(RAG_ANYTHING_DIR) not in sys.path:
    sys.path.insert(0, str(RAG_ANYTHING_DIR))


NOTE_PROMPT = """
请基于当前视频知识库生成一份中文学习笔记。
要求：
1. 只依据视频内容，不要编造视频未提到的信息。
2. 使用 Markdown。
3. 包含：视频主题、章节划分、核心知识点、重要概念解释、复习总结。
4. 尽量保留关键时间点，方便回看视频。
"""

MINDMAP_PROMPT = """
请基于当前视频知识库生成一张中文学习思维导图。
要求：
1. 只依据视频内容，不要编造视频未提到的信息。
2. 使用 Mermaid graph TD 语法。
3. 根节点是视频主题，子节点体现章节、概念、过程和关系。
4. 节点文字简洁，适合课堂展示。
5. 只输出 Mermaid 代码块。
"""

QA_SYSTEM_PROMPT = """
你是 VideoScholar 的视频学习助手。请只依据当前视频知识库回答问题。
如果视频中没有明确依据，请说明“视频中未明确提到”或“根据已有片段无法判断”。
回答时尽量给出相关时间点或片段依据。
"""


class AppState:
    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.current_video: Path | None = DEMO_VIDEO if DEMO_VIDEO.exists() else None
        self.current_name = "compiler_ch1"
        self.rag = None
        self.rag_video_key = ""
        self.processing_status = "未选择视频" if self.current_video is None else "未加载知识库"


STATE = AppState()


def json_response(success: bool, message: str = "ok", data: dict | None = None) -> bytes:
    payload = {
        "success": success,
        "message": message,
        "data": data or {},
    }
    return json.dumps(payload, ensure_ascii=False).encode("utf-8")


def safe_name(raw_name: str) -> str:
    stem = Path(raw_name).stem.strip().lower()
    stem = re.sub(r"[^0-9a-zA-Z\u4e00-\u9fff_-]+", "_", stem)
    stem = re.sub(r"_+", "_", stem).strip("_")
    return stem or "video"


def video_name_for_path(path: Path) -> str:
    try:
        if DEMO_VIDEO.exists() and path.resolve() == DEMO_VIDEO.resolve():
            return "compiler_ch1"
    except OSError:
        pass
    return safe_name(path.stem)


def uploaded_dir(filename: str, content: bytes) -> Path:
    digest = hashlib.sha256(content).hexdigest()[:8]
    return DATA_DIR / f"{safe_name(filename)}_{digest}"


def is_video_filename(filename: str) -> bool:
    return Path(filename).suffix.lower() in {".mp4", ".mov", ".mkv", ".avi", ".webm"}


def parse_multipart_video(content_type: str, body: bytes) -> tuple[str, bytes]:
    boundary_match = re.search(r"boundary=(?P<boundary>[^;]+)", content_type)
    if not boundary_match:
        raise ValueError("上传请求缺少 boundary。")
    boundary = boundary_match.group("boundary").strip().strip('"').encode("utf-8")
    delimiter = b"--" + boundary
    for part in body.split(delimiter):
        part = part.strip()
        if not part or part == b"--":
            continue
        if part.endswith(b"--"):
            part = part[:-2].strip()
        header_blob, separator, content = part.partition(b"\r\n\r\n")
        if not separator:
            continue
        headers = header_blob.decode("utf-8", errors="replace")
        if 'name="video"' not in headers:
            continue
        filename_match = re.search(r'filename="([^"]+)"', headers)
        if not filename_match:
            raise ValueError("上传字段缺少文件名。")
        filename = Path(filename_match.group(1)).name
        return filename, content.rstrip(b"\r\n")
    raise ValueError("没有收到 video 文件字段。")


def detect_video_cache(video_path: Path, name: str) -> dict:
    out_dir = video_path.parent
    srt_path = out_dir / f"{name}.srt"
    frames_dir = out_dir / f"{name}_frames"
    rag_dir = out_dir / f"rag_storage_{name}"
    graph_file = rag_dir / "graph_chunk_entity_relation.graphml"
    frame_count = len(list(frames_dir.glob("*.jpg"))) if frames_dir.exists() else 0
    return {
        "out_dir": str(out_dir),
        "srt_path": str(srt_path),
        "frames_dir": str(frames_dir),
        "rag_dir": str(rag_dir),
        "graph_file": str(graph_file),
        "has_srt": srt_path.exists(),
        "has_frames": frame_count > 0,
        "frame_count": frame_count,
        "has_graph": graph_file.exists() and graph_file.stat().st_size > 1000,
        "ready": srt_path.exists() and frame_count > 0 and graph_file.exists() and graph_file.stat().st_size > 1000,
    }


def env_values() -> dict[str, str]:
    values: dict[str, str] = {}
    env_file = PROJECT_DIR / ".env"
    if env_file.exists():
        for raw_line in env_file.read_text(encoding="utf-8", errors="ignore").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip("'\"")
    for key, value in os.environ.items():
        values.setdefault(key, value)
    return values


def env_status() -> dict:
    values = env_values()
    required = [
        "LLM_BINDING_API_KEY",
        "LLM_BINDING_HOST",
        "EMBEDDING_BINDING_API_KEY",
        "EMBEDDING_BINDING_HOST",
    ]
    missing = []
    placeholders = []
    for key in required:
        value = values.get(key, "")
        if not value:
            missing.append(key)
        elif "PASTE_YOUR_API_KEY_HERE" in value or "your_api_key" in value.lower():
            placeholders.append(key)
    return {
        "ready": not missing and not placeholders,
        "missing": missing,
        "placeholders": placeholders,
    }


def current_video_payload() -> dict:
    with STATE.lock:
        video = STATE.current_video
        name = STATE.current_name
        rag_loaded = STATE.rag is not None and STATE.rag_video_key == f"{video}|{name}"
        processing_status = STATE.processing_status

    if video is None:
        return {
            "selected": False,
            "title": "",
            "name": name,
            "video_url": "",
            "cache": {},
            "rag_loaded": False,
            "processing_status": processing_status,
        }

    cache = detect_video_cache(video, name)
    return {
        "selected": True,
        "title": video.stem,
        "name": name,
        "path": str(video),
        "video_url": "/media/demo" if video.resolve() == DEMO_VIDEO.resolve() else "/media/current",
        "cache": cache,
        "rag_loaded": rag_loaded,
        "processing_status": "可问答" if rag_loaded else processing_status,
    }


def import_pipeline():
    from video_rag_pipeline import (
        build_content_list,
        build_graph,
        extract_frames,
        make_rag,
        merge_entries,
        parse_srt,
        transcribe,
    )

    return {
        "build_content_list": build_content_list,
        "build_graph": build_graph,
        "extract_frames": extract_frames,
        "make_rag": make_rag,
        "merge_entries": merge_entries,
        "parse_srt": parse_srt,
        "transcribe": transcribe,
    }


def run_async(coro):
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    if loop.is_running():
        result: dict = {}

        def runner():
            try:
                result["value"] = asyncio.run(coro)
            except Exception as exc:  # pragma: no cover - passed back to caller
                result["error"] = exc

        thread = threading.Thread(target=runner)
        thread.start()
        thread.join()
        if "error" in result:
            raise result["error"]
        return result.get("value")
    return loop.run_until_complete(coro)


def require_env_ready() -> tuple[bool, str]:
    status = env_status()
    if status["ready"]:
        return True, ""
    parts = []
    if status["missing"]:
        parts.append("缺少 " + ", ".join(status["missing"]))
    if status["placeholders"]:
        parts.append("API Key 仍是占位符 " + ", ".join(status["placeholders"]))
    return False, "；".join(parts)


def load_current_rag() -> tuple[bool, str, dict]:
    ok, message = require_env_ready()
    if not ok:
        return False, message, {}
    with STATE.lock:
        video = STATE.current_video
        name = STATE.current_name
    if video is None:
        return False, "请先选择视频。", {}
    cache = detect_video_cache(video, name)
    if not cache["ready"]:
        return False, "缓存不完整，请先处理视频。", {"cache": cache}
    pipeline = import_pipeline()
    rag = pipeline["make_rag"](Path(cache["rag_dir"]))
    run_async(rag._ensure_lightrag_initialized())
    with STATE.lock:
        STATE.rag = rag
        STATE.rag_video_key = f"{video}|{name}"
        STATE.processing_status = "知识库已加载"
    return True, "知识库已加载。", current_video_payload()


def process_current_video(interval: float = 5.0) -> tuple[bool, str, dict]:
    ok, message = require_env_ready()
    if not ok:
        return False, message, {}
    with STATE.lock:
        video = STATE.current_video
        name = STATE.current_name
        STATE.processing_status = "正在准备"
    if video is None:
        return False, "请先选择视频。", {}

    pipeline = import_pipeline()
    cache = detect_video_cache(video, name)
    api_key = env_values().get("LLM_BINDING_API_KEY")
    base_url = env_values().get("LLM_BINDING_HOST")

    try:
        if not cache["has_srt"]:
            with STATE.lock:
                STATE.processing_status = "正在转写"
            pipeline["transcribe"](video, Path(cache["srt_path"]), api_key, base_url)

        with STATE.lock:
            STATE.processing_status = "正在抽帧"
        entries = pipeline["parse_srt"](Path(cache["srt_path"]))
        chunks = pipeline["merge_entries"](entries, interval)
        frames = pipeline["extract_frames"](video, chunks, Path(cache["frames_dir"]))
        content_list = pipeline["build_content_list"](frames)

        with STATE.lock:
            STATE.processing_status = "正在构建知识库"
        rag = run_async(pipeline["build_graph"](content_list, Path(cache["rag_dir"]), video))
        with STATE.lock:
            STATE.rag = rag
            STATE.rag_video_key = f"{video}|{name}"
            STATE.processing_status = "知识库已加载"
        return True, "视频处理完成。", current_video_payload()
    except Exception as exc:
        with STATE.lock:
            STATE.processing_status = "处理失败"
        return False, f"处理失败：{exc}", current_video_payload()


def require_loaded_rag():
    with STATE.lock:
        video = STATE.current_video
        name = STATE.current_name
        rag = STATE.rag
        key = STATE.rag_video_key
    if video is None:
        raise RuntimeError("请先选择视频。")
    if rag is None or key != f"{video}|{name}":
        raise RuntimeError("知识库尚未加载。")
    return rag


def ask_current_video(question: str) -> str:
    rag = require_loaded_rag()
    return run_async(rag.aquery(question, mode="hybrid", system_prompt=QA_SYSTEM_PROMPT))


def generate_notes() -> str:
    rag = require_loaded_rag()
    return run_async(rag.aquery(NOTE_PROMPT, mode="hybrid"))


def generate_mindmap() -> str:
    rag = require_loaded_rag()
    return run_async(rag.aquery(MINDMAP_PROMPT, mode="hybrid"))


class VideoScholarHandler(BaseHTTPRequestHandler):
    server_version = "VideoScholarHTTP/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def send_json(self, success: bool, message: str = "ok", data: dict | None = None, status: int = 200) -> None:
        body = json_response(success, message, data)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_GET(self) -> None:  # noqa: N802
        path = unquote(urlparse(self.path).path)
        try:
            if path == "/api/status":
                self.send_json(True, "ok", {"env": env_status(), "video": current_video_payload()})
            elif path == "/api/demo":
                if not DEMO_VIDEO.exists():
                    self.send_json(False, "Demo 视频不存在。", status=404)
                    return
                with STATE.lock:
                    STATE.current_video = DEMO_VIDEO
                    STATE.current_name = "compiler_ch1"
                    STATE.rag = None
                    STATE.rag_video_key = ""
                    STATE.processing_status = "未加载知识库"
                self.send_json(True, "已加载 Demo 视频。", current_video_payload())
            elif path == "/media/demo":
                self.serve_media_file(DEMO_VIDEO)
            elif path == "/media/current":
                with STATE.lock:
                    video = STATE.current_video
                if video is None:
                    self.send_error(HTTPStatus.NOT_FOUND)
                    return
                self.serve_media_file(video)
            else:
                self.serve_static(path)
        except Exception as exc:
            self.send_json(False, f"请求失败：{exc}", status=500)

    def do_POST(self) -> None:  # noqa: N802
        path = unquote(urlparse(self.path).path)
        try:
            if path == "/api/upload_video":
                self.handle_upload_video()
            elif path == "/api/check_cache":
                payload = self.read_json()
                if payload.get("name"):
                    with STATE.lock:
                        STATE.current_name = safe_name(str(payload["name"]))
                        STATE.rag = None
                        STATE.rag_video_key = ""
                self.send_json(True, "缓存检测完成。", current_video_payload())
            elif path == "/api/process_video":
                payload = self.read_json()
                ok, message, data = process_current_video(float(payload.get("interval", 5.0)))
                self.send_json(ok, message, data, status=200 if ok else 400)
            elif path == "/api/load_rag":
                ok, message, data = load_current_rag()
                self.send_json(ok, message, data, status=200 if ok else 400)
            elif path == "/api/ask":
                payload = self.read_json()
                question = str(payload.get("question", "")).strip()
                if not question:
                    self.send_json(False, "请输入问题。", status=400)
                    return
                answer = ask_current_video(question)
                self.send_json(True, "ok", {"answer": answer})
            elif path == "/api/generate_notes":
                self.send_json(True, "ok", {"notes": generate_notes()})
            elif path == "/api/generate_mindmap":
                self.send_json(True, "ok", {"mindmap": generate_mindmap()})
            else:
                self.send_json(False, "接口不存在。", status=404)
        except Exception as exc:
            self.send_json(False, f"请求失败：{exc}", status=500)

    def handle_upload_video(self) -> None:
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self.send_json(False, "请使用 multipart/form-data 上传视频。", status=400)
            return
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            self.send_json(False, "上传内容为空。", status=400)
            return
        filename, content = parse_multipart_video(content_type, self.rfile.read(length))
        if not is_video_filename(filename):
            self.send_json(False, "只支持 mp4、mov、mkv、avi、webm 视频文件。", status=400)
            return
        target_dir = uploaded_dir(filename, content)
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / filename
        if not target.exists() or target.read_bytes() != content:
            target.write_bytes(content)
        with STATE.lock:
            STATE.current_video = target
            STATE.current_name = video_name_for_path(target)
            STATE.rag = None
            STATE.rag_video_key = ""
            STATE.processing_status = "缓存待检测"
        self.send_json(True, "视频已上传。", current_video_payload())

    def serve_static(self, request_path: str) -> None:
        rel = request_path.lstrip("/") or "index.html"
        if rel == "favicon.ico":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        target = (WEB_DIR / rel).resolve()
        try:
            target.relative_to(WEB_DIR.resolve())
        except ValueError:
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.serve_file(target)

    def serve_media_file(self, target: Path) -> None:
        if not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        self.serve_file(target, allow_range=True)

    def serve_file(self, target: Path, allow_range: bool = False) -> None:
        size = target.stat().st_size
        mime_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        range_header = self.headers.get("Range") if allow_range else None
        start = 0
        end = size - 1
        status = HTTPStatus.OK
        if range_header:
            match = re.match(r"bytes=(\d*)-(\d*)", range_header)
            if match:
                if match.group(1):
                    start = int(match.group(1))
                if match.group(2):
                    end = int(match.group(2))
                end = min(end, size - 1)
                if start <= end:
                    status = HTTPStatus.PARTIAL_CONTENT
        length = end - start + 1
        self.send_response(status)
        self.send_header("Content-Type", mime_type)
        self.send_header("Accept-Ranges", "bytes")
        if status == HTTPStatus.PARTIAL_CONTENT:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(length))
        self.end_headers()
        with target.open("rb") as file_obj:
            file_obj.seek(start)
            remaining = length
            while remaining > 0:
                chunk = file_obj.read(min(1024 * 1024, remaining))
                if not chunk:
                    break
                self.wfile.write(chunk)
                remaining -= len(chunk)


def main() -> None:
    if not WEB_DIR.exists():
        raise SystemExit(f"Web directory not found: {WEB_DIR}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer((HOST, PORT), VideoScholarHandler)
    print(f"VideoScholar web app running at http://{HOST}:{PORT}/")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
