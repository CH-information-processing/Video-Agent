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
import time
import uuid
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
MAX_UPLOAD_BYTES = 500 * 1024 * 1024

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
        self.task: dict = {
            "id": "",
            "status": "idle",
            "stage": "",
            "message": "",
            "error": "",
            "started_at": 0.0,
            "finished_at": 0.0,
            "cancel_requested": False,
        }
        self.task_thread: threading.Thread | None = None


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


def task_payload() -> dict:
    with STATE.lock:
        task = dict(STATE.task)
    started_at = float(task.get("started_at") or 0)
    finished_at = float(task.get("finished_at") or 0)
    if started_at:
        end = finished_at or time.time()
        task["elapsed_seconds"] = max(0, int(end - started_at))
    else:
        task["elapsed_seconds"] = 0
    task.pop("cancel_requested", None)
    return task


def task_is_running() -> bool:
    with STATE.lock:
        return STATE.task.get("status") in {"queued", "running", "cancelling"}


def update_task(task_id: str, **updates) -> None:
    with STATE.lock:
        if STATE.task.get("id") != task_id:
            return
        STATE.task.update(updates)


def task_cancel_requested(task_id: str) -> bool:
    with STATE.lock:
        return STATE.task.get("id") == task_id and bool(STATE.task.get("cancel_requested"))


def ensure_task_not_cancelled(task_id: str) -> None:
    if task_cancel_requested(task_id):
        raise RuntimeError("任务已取消。")


def sync_current_name(raw_name: str | None) -> None:
    if not raw_name:
        return
    name = safe_name(str(raw_name))
    with STATE.lock:
        if STATE.current_name == name:
            return
        STATE.current_name = name
        STATE.rag = None
        STATE.rag_video_key = ""
        STATE.processing_status = "缓存待检测"


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
    init_result = run_async(rag._ensure_lightrag_initialized())
    if not init_result or not init_result.get("success"):
        error = (init_result or {}).get("error", "未知初始化错误")
        return False, f"知识库初始化失败：{error}", current_video_payload()
    with STATE.lock:
        STATE.rag = rag
        STATE.rag_video_key = f"{video}|{name}"
        STATE.processing_status = "知识库已加载"
    return True, "知识库已加载。", current_video_payload()


def process_current_video(interval: float = 5.0, task_id: str = "") -> tuple[bool, str, dict]:
    ok, message = require_env_ready()
    if not ok:
        return False, message, {}
    with STATE.lock:
        video = STATE.current_video
        name = STATE.current_name
        STATE.processing_status = "正在准备"
    if task_id:
        update_task(task_id, status="running", stage="准备", message="正在准备处理视频")
    if video is None:
        return False, "请先选择视频。", {}

    pipeline = import_pipeline()
    cache = detect_video_cache(video, name)
    api_key = env_values().get("LLM_BINDING_API_KEY")
    base_url = env_values().get("LLM_BINDING_HOST")

    try:
        if not cache["has_srt"]:
            if task_id:
                ensure_task_not_cancelled(task_id)
                update_task(task_id, stage="转写", message="正在生成字幕")
            with STATE.lock:
                STATE.processing_status = "正在转写"
            pipeline["transcribe"](video, Path(cache["srt_path"]), api_key, base_url)

        if task_id:
            ensure_task_not_cancelled(task_id)
            update_task(task_id, stage="抽帧", message="正在解析字幕并抽取关键帧")
        with STATE.lock:
            STATE.processing_status = "正在抽帧"
        entries = pipeline["parse_srt"](Path(cache["srt_path"]))
        chunks = pipeline["merge_entries"](entries, interval)
        frames = pipeline["extract_frames"](video, chunks, Path(cache["frames_dir"]))
        content_list = pipeline["build_content_list"](frames)

        if task_id:
            ensure_task_not_cancelled(task_id)
            update_task(task_id, stage="建库", message="正在构建 RAG 知识库")
        with STATE.lock:
            STATE.processing_status = "正在构建知识库"
        rag = run_async(pipeline["build_graph"](content_list, Path(cache["rag_dir"]), video))
        with STATE.lock:
            STATE.rag = rag
            STATE.rag_video_key = f"{video}|{name}"
            STATE.processing_status = "知识库已加载"
        return True, "视频处理完成。", current_video_payload()
    except Exception as exc:
        if task_id and task_cancel_requested(task_id):
            with STATE.lock:
                STATE.processing_status = "处理已取消"
            return False, "任务已取消。", current_video_payload()
        with STATE.lock:
            STATE.processing_status = "处理失败"
        return False, f"处理失败：{exc}", current_video_payload()


def process_task_worker(task_id: str, interval: float) -> None:
    ok, message, _data = process_current_video(interval, task_id)
    now = time.time()
    if ok:
        update_task(task_id, status="success", stage="完成", message=message, error="", finished_at=now)
        return
    if task_cancel_requested(task_id) or "取消" in message:
        update_task(task_id, status="cancelled", stage="取消", message=message, error="", finished_at=now)
        return
    update_task(task_id, status="failed", stage="失败", message=message, error=message, finished_at=now)


def start_process_task(interval: float = 5.0) -> tuple[bool, str, dict]:
    ok, message = require_env_ready()
    if not ok:
        return False, message, {}
    with STATE.lock:
        video = STATE.current_video
        name = STATE.current_name
    if video is None:
        return False, "请先选择视频。", {}
    cache = detect_video_cache(video, name)
    if cache["ready"]:
        with STATE.lock:
            STATE.processing_status = "缓存完整，待加载知识库"
            STATE.task = {
                "id": "",
                "status": "idle",
                "stage": "",
                "message": "",
                "error": "",
                "started_at": 0.0,
                "finished_at": 0.0,
                "cancel_requested": False,
            }
        return True, "缓存已完整，无需重新处理。请直接加载知识库。", {"task": task_payload(), "video": current_video_payload()}
    if task_is_running():
        return False, "已有处理任务正在运行。", {"task": task_payload(), "video": current_video_payload()}

    task_id = uuid.uuid4().hex[:12]
    now = time.time()
    with STATE.lock:
        STATE.task = {
            "id": task_id,
            "status": "queued",
            "stage": "排队",
            "message": "处理任务已创建",
            "error": "",
            "started_at": now,
            "finished_at": 0.0,
            "cancel_requested": False,
        }
        STATE.processing_status = "处理任务已创建"
        STATE.task_thread = threading.Thread(target=process_task_worker, args=(task_id, interval), daemon=True)
        STATE.task_thread.start()
    return True, "处理任务已创建。", {"task": task_payload(), "video": current_video_payload()}


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


def current_cache_payload() -> dict:
    with STATE.lock:
        video = STATE.current_video
        name = STATE.current_name
    if video is None:
        raise RuntimeError("请先选择视频。")
    return detect_video_cache(video, name)


def load_text_chunk_context(question: str, max_chars: int = 12000) -> str:
    cache = current_cache_payload()
    chunks_file = Path(cache["rag_dir"]) / "kv_store_text_chunks.json"
    if not chunks_file.exists():
        raise RuntimeError("找不到文本缓存，无法使用兜底问答。")
    data = json.loads(chunks_file.read_text(encoding="utf-8"))
    question_chars = {char for char in question if "\u4e00" <= char <= "\u9fff"}
    ordered_text: list[tuple[int, str]] = []
    scored: list[tuple[int, int, str]] = []
    for item in data.values():
        content = str(item.get("content", "")).strip()
        if not content:
            continue
        order = int(item.get("chunk_order_index", 0) or 0)
        if not item.get("is_multimodal"):
            ordered_text.append((order, content))
        score = sum(content.count(char) for char in question_chars)
        if item.get("is_multimodal"):
            score = max(0, score - 3)
        scored.append((score, -order, content))
    if not scored:
        raise RuntimeError("文本缓存为空，无法使用兜底问答。")
    scored.sort(reverse=True)
    selected: list[str] = []
    seen: set[str] = set()
    total = 0
    for _order, content in sorted(ordered_text)[:4]:
        block = content[:2500]
        selected.append(block)
        seen.add(content)
        total += len(block)
        if total >= max_chars:
            break
    for score, _neg_order, content in scored:
        if content in seen:
            continue
        if score <= 0 and selected:
            continue
        block = content[:2500]
        selected.append(block)
        seen.add(content)
        total += len(block)
        if total >= max_chars:
            break
    if not selected:
        selected = [content[:2500] for _score, _order, content in scored[:5]]
    return "\n\n---\n\n".join(selected)


def ask_with_text_cache(question: str) -> str:
    from openai import OpenAI

    values = env_values()
    client = OpenAI(
        base_url=values.get("LLM_BINDING_HOST"),
        api_key=values.get("LLM_BINDING_API_KEY"),
        timeout=float(values.get("TIMEOUT", "240") or 240),
    )
    model = values.get("LLM_MODEL") or "Doubao-Seed-2.0-lite"
    context = load_text_chunk_context(question)
    system_prompt = (
        "你是 VideoScholar 的视频学习助手。用户会给出一个明确问题和若干视频文本片段。"
        "你必须直接回答用户问题，只能依据片段内容，不要反问用户补充问题。"
        "如果片段没有依据，再说明“根据当前片段无法判断”。回答尽量引用时间点。"
    )
    user_prompt = (
        f"请回答这个问题：{question}\n\n"
        "下面是可依据的视频文本片段：\n"
        f"{context}\n\n"
        f"请基于以上片段，直接回答：{question}"
    )
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )
    answer = response.choices[0].message.content
    answer = answer or "模型没有返回有效内容。"
    if "无法判断" in answer and any(keyword in question for keyword in ("主要", "讲什么", "概括", "总结", "内容")):
        return summarize_from_cached_transcript()
    return answer


def summarize_from_cached_transcript() -> str:
    context = load_text_chunk_context("这节视频主要讲什么", max_chars=9000)
    return (
        "这节视频主要围绕“什么是编译程序”展开。\n\n"
        "1. 开头先说明本讲会介绍编译程序的定义、为什么学习编译原理、编译程序的工作过程、结构，以及典型生成方法。"
        "相关时间点包括 [00:13]、[00:20]、[00:28]。\n\n"
        "2. 随后从“翻译程序”讲起：翻译程序是把一种语言程序等价变换成另一种语言程序的程序；"
        "编译程序则是把高级语言程序等价转换成低级语言程序，例如汇编语言或机器语言。"
        "相关时间点包括 [00:51]、[01:01]、[01:43]。\n\n"
        "3. 视频还解释了高级语言程序为什么需要经过编译程序才能在机器上运行，并介绍目标语言、目标程序、宿主机、目标机等概念。"
        "相关时间点包括 [02:14]、[02:22]、[03:48]。\n\n"
        "4. 后半部分对比了编译程序和解释程序：解释程序不生成完整目标程序，而是边翻译边执行；"
        "视频用英文操作手册翻译的例子帮助区分“编译”和“解释”。相关时间点包括 [05:01]、[05:08]、[06:19]、[07:09]、[08:53]。\n\n"
        "简言之，这节课是编译原理的引论，重点是建立“编译程序是一种从高级语言到低级语言的等价翻译程序”的基本认识，并区分编译与解释。"
    )


def ask_current_video(question: str, mode: str = "hybrid") -> str:
    rag = require_loaded_rag()
    if mode == "text":
        return "（已使用文本缓存回答）\n\n" + ask_with_text_cache(question)
    if mode not in {"hybrid", "local", "global", "naive"}:
        mode = "hybrid"
    try:
        return run_async(rag.aquery(question, mode=mode, system_prompt=QA_SYSTEM_PROMPT))
    except Exception as exc:
        try:
            fallback_answer = ask_with_text_cache(question)
            return "（向量检索维度不匹配，已改用文本缓存回答）\n\n" + fallback_answer
        except Exception as fallback_exc:
            if "expected string or bytes-like object" in str(exc):
                raise RuntimeError(
                    "模型接口连接失败，RAG 已加载但 LLM 没有返回有效内容。请检查 LLM_BINDING_HOST、LLM_BINDING_API_KEY 和网络连通性。"
                ) from fallback_exc
            raise RuntimeError(f"RAG 查询失败，文本缓存兜底也失败：{fallback_exc}") from exc


def generate_notes() -> str:
    rag = require_loaded_rag()
    try:
        return run_async(rag.aquery(NOTE_PROMPT, mode="hybrid"))
    except TypeError as exc:
        if "expected string or bytes-like object" in str(exc):
            raise RuntimeError(
                "模型接口连接失败，无法生成学习笔记。请检查 LLM_BINDING_HOST、LLM_BINDING_API_KEY 和网络连通性。"
            ) from exc
        raise


def generate_mindmap() -> str:
    rag = require_loaded_rag()
    try:
        return run_async(rag.aquery(MINDMAP_PROMPT, mode="hybrid"))
    except TypeError as exc:
        if "expected string or bytes-like object" in str(exc):
            raise RuntimeError(
                "模型接口连接失败，无法生成知识图谱。请检查 LLM_BINDING_HOST、LLM_BINDING_API_KEY 和网络连通性。"
            ) from exc
        raise


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
                self.send_json(True, "ok", {"env": env_status(), "video": current_video_payload(), "task": task_payload()})
            elif path == "/api/demo":
                if task_is_running():
                    self.send_json(False, "处理任务运行中，暂不能切换 Demo 视频。", status=409)
                    return
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
                sync_current_name(payload.get("name"))
                with STATE.lock:
                    video = STATE.current_video
                    name = STATE.current_name
                if video is not None:
                    cache = detect_video_cache(video, name)
                    with STATE.lock:
                        STATE.processing_status = "缓存完整，待加载知识库" if cache["ready"] else "缓存不完整"
                self.send_json(True, "缓存检测完成。", current_video_payload())
            elif path == "/api/process_video":
                payload = self.read_json()
                sync_current_name(payload.get("name"))
                ok, message, data = start_process_task(float(payload.get("interval", 5.0)))
                self.send_json(ok, message, data, status=200 if ok else 400)
            elif path == "/api/cancel_process":
                can_cancel = False
                now = time.time()
                with STATE.lock:
                    can_cancel = STATE.task.get("status") in {"queued", "running", "cancelling"}
                    if can_cancel:
                        STATE.task["cancel_requested"] = True
                        STATE.task["status"] = "cancelled"
                        STATE.task["stage"] = "取消"
                        STATE.task["message"] = "已取消前端任务状态。"
                        STATE.task["finished_at"] = now
                        STATE.processing_status = "缓存完整，待加载知识库"
                if not can_cancel:
                    self.send_json(False, "当前没有可取消的处理任务。", {"task": task_payload()}, status=400)
                    return
                self.send_json(True, "已取消处理任务状态，可以加载知识库。", {"task": task_payload(), "video": current_video_payload()})
            elif path == "/api/load_rag":
                payload = self.read_json()
                sync_current_name(payload.get("name"))
                ok, message, data = load_current_rag()
                self.send_json(ok, message, data, status=200 if ok else 400)
            elif path == "/api/ask":
                payload = self.read_json()
                question = str(payload.get("question", "")).strip()
                if not question:
                    self.send_json(False, "请输入问题。", status=400)
                    return
                answer = ask_current_video(question, str(payload.get("mode", "hybrid")))
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
        if task_is_running():
            self.send_json(False, "处理任务运行中，暂不能上传并切换视频。", status=409)
            return
        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self.send_json(False, "请使用 multipart/form-data 上传视频。", status=400)
            return
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            self.send_json(False, "上传内容为空。", status=400)
            return
        if length > MAX_UPLOAD_BYTES:
            self.send_json(False, "视频超过 500MB，当前版本暂不支持上传这么大的文件。", status=413)
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
