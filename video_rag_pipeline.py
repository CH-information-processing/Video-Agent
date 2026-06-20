"""
General-purpose Video RAG pipeline:
  1. Transcribe video with Whisper (auto-split if >25MB)
  2. Extract frames every FRAME_INTERVAL_SEC seconds, dropping near-duplicate
     frames (e.g. unchanged lecture slides) so the VLM only analyses new visuals
  3. Build RAGAnything knowledge graph
  4. Interactive Q&A

Usage:
  python video_rag_pipeline.py --video "C:/path/to/video.mp4" --name my_topic
  python video_rag_pipeline.py --video "C:/path/to/video.mp4" --name my_topic --interval 5
  python video_rag_pipeline.py --video "C:/path/to/video.mp4" --name my_topic --dedup-threshold 5
  python video_rag_pipeline.py --video "C:/path/to/video.mp4" --name my_topic --no-dedup
  python video_rag_pipeline.py --name my_topic  # skip ingestion, load existing graph
"""

import argparse
import asyncio
import json
import math
import os
import re
import subprocess
import sys
import tempfile
from functools import partial
from pathlib import Path

# RAG-Anything is bundled as source in this repo. A stale editable install may
# point at an old location, so make the bundled copy importable first.
_RAG_ANYTHING_DIR = Path(__file__).resolve().parent / "RAG-Anything"
if _RAG_ANYTHING_DIR.is_dir() and str(_RAG_ANYTHING_DIR) not in sys.path:
    sys.path.insert(0, str(_RAG_ANYTHING_DIR))

import cv2
import numpy as np
from dotenv import load_dotenv
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.utils import EmbeddingFunc
from raganything import RAGAnything, RAGAnythingConfig

import imageio_ffmpeg

import catalog as catalog_lib

load_dotenv(dotenv_path=".env", override=False)

FFMPEG      = imageio_ffmpeg.get_ffmpeg_exe()
WHISPER_MAX_MB = 24          # stay under 25MB API limit
# Cross-video catalog lives next to this script so it is stable regardless of cwd
DEFAULT_CATALOG = Path(__file__).resolve().parent / "video_catalog.json"

# ── Whisper transcription ─────────────────────────────────────────────────────

def get_duration(video_path: Path) -> float:
    result = subprocess.run(
        [FFMPEG, "-i", str(video_path)],
        capture_output=True
    )
    stderr = result.stderr.decode("utf-8", errors="replace")
    for line in stderr.splitlines():
        if "Duration" in line:
            t = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = t.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    raise ValueError("Cannot parse video duration")


def seconds_to_srt(s: float) -> str:
    h = int(s // 3600); m = int((s % 3600) // 60)
    sec = int(s % 60);  ms = int((s - int(s)) * 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def transcribe(video_path: Path, out_srt: Path, api_key: str, base_url: str):
    from openai import OpenAI
    client = OpenAI(base_url=base_url, api_key=api_key)

    duration = get_duration(video_path)
    file_mb  = video_path.stat().st_size / (1024 * 1024)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)

        if file_mb <= WHISPER_MAX_MB:
            # Small file: send directly
            chunks = [(video_path, 0.0)]
        else:
            # Large file: split into audio chunks
            chunk_sec = int(WHISPER_MAX_MB * 1024 * 1024 / (64 * 1024))  # 64kbps mp3
            chunk_sec = max(60, min(chunk_sec, 600))
            n = math.ceil(duration / chunk_sec)
            print(f"  Splitting into {n} chunks of ~{chunk_sec}s...")
            chunks = []
            for i in range(n):
                start = i * chunk_sec
                cp = tmp_path / f"chunk_{i:03d}.mp3"
                subprocess.run([
                    FFMPEG, "-y", "-ss", str(start), "-t", str(chunk_sec),
                    "-i", str(video_path), "-vn", "-ar", "16000", "-ac", "1", "-b:a", "64k",
                    str(cp),
                ], capture_output=True)
                chunks.append((cp, float(start)))

        all_segments = []
        for idx, (chunk_path, offset) in enumerate(chunks):
            print(f"  Transcribing {idx+1}/{len(chunks)}: {chunk_path.name}...")
            with open(chunk_path, "rb") as f:
                resp = client.audio.transcriptions.create(
                    model="whisper-001",
                    file=f,
                    response_format="verbose_json",
                    timestamp_granularities=["segment"],
                )
            for seg in resp.segments:
                all_segments.append({
                    "start": seg.start + offset,
                    "end":   seg.end   + offset,
                    "text":  seg.text.strip(),
                })

    lines = []
    for i, seg in enumerate(all_segments, 1):
        lines += [str(i), f"{seconds_to_srt(seg['start'])} --> {seconds_to_srt(seg['end'])}", seg["text"], ""]
    out_srt.write_text("\n".join(lines), encoding="utf-8")
    print(f"  SRT saved: {out_srt} ({len(all_segments)} segments)")
    return all_segments

# ── Frame extraction ──────────────────────────────────────────────────────────

def srt_time_to_seconds(t: str) -> float:
    h, m, rest = t.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def parse_srt(srt_path: Path) -> list[dict]:
    text   = srt_path.read_text(encoding="utf-8")
    blocks = re.split(r"\n{2,}", text.strip())
    entries = []
    for block in blocks:
        lines = block.strip().splitlines()
        if len(lines) < 3:
            continue
        try:
            s, e = lines[1].split(" --> ")
            content = " ".join(l.strip() for l in lines[2:] if l.strip())
            if content:
                entries.append({"start": srt_time_to_seconds(s.strip()),
                                 "end":   srt_time_to_seconds(e.strip()),
                                 "text":  content})
        except Exception:
            continue
    return entries


def merge_entries(entries: list[dict], interval: float) -> list[dict]:
    if not entries:
        return []
    chunks, cur_start, cur_texts = [], entries[0]["start"], []
    for e in entries:
        cur_texts.append(e["text"])
        if e["end"] - cur_start >= interval:
            chunks.append({"start": cur_start, "end": e["end"],
                            "text": " ".join(dict.fromkeys(cur_texts))})
            cur_start, cur_texts = e["end"], []
    if cur_texts:
        chunks.append({"start": cur_start, "end": entries[-1]["end"],
                        "text": " ".join(dict.fromkeys(cur_texts))})
    return chunks


def compute_dhash(frame, hash_size: int = 8) -> np.ndarray:
    """Perceptual difference-hash: robust to tiny encoding/lighting jitter,
    sensitive to real visual changes (slide flips, new diagrams). Returns a
    boolean array of length hash_size*hash_size."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (hash_size + 1, hash_size), interpolation=cv2.INTER_AREA)
    diff = resized[:, 1:] > resized[:, :-1]
    return diff.flatten()


def hamming(a: np.ndarray, b: np.ndarray) -> int:
    return int(np.count_nonzero(a != b))


def extract_frames(video_path: Path, chunks: list[dict], frames_dir: Path,
                   dedup_threshold: int = 5) -> list[dict]:
    """Extract one frame per chunk, but only save/keep the image when it is
    visually different (dHash Hamming distance >= dedup_threshold) from the
    previously kept keyframe. Near-duplicate frames keep their transcript text
    but get no image, so the VLM never re-analyses an unchanged slide.

    Set dedup_threshold <= 0 to disable deduplication (keep every frame).
    """
    frames_dir.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    results = []
    prev_hash = None
    kept = 0
    for i, chunk in enumerate(chunks):
        mid = (chunk["start"] + chunk["end"]) / 2
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(mid * fps))
        ok, frame = cap.read()
        if not ok:
            continue

        cur_hash = compute_dhash(frame)
        is_keyframe = (
            dedup_threshold <= 0
            or prev_hash is None
            or hamming(cur_hash, prev_hash) >= dedup_threshold
        )

        if is_keyframe:
            prev_hash = cur_hash
            kept += 1
            frame_path = frames_dir / f"frame_{i:04d}_{int(mid)}s.jpg"
            if not frame_path.exists():
                # cv2.imwrite fails silently on Windows with non-ASCII paths
                # Use imencode + Python file write instead
                ok2, buf = cv2.imencode(".jpg", frame)
                if ok2:
                    frame_path.write_bytes(buf.tobytes())
            results.append({"frame_path": str(frame_path.resolve()),
                            "timestamp": mid, "text": chunk["text"]})
        else:
            # Visually identical to the last kept frame: keep the words, drop the
            # image so it is not sent to the VLM again.
            results.append({"frame_path": None,
                            "timestamp": mid, "text": chunk["text"]})

    cap.release()
    deduped = len(results) - kept
    print(f"  {len(results)} chunks → {kept} keyframes saved "
          f"({deduped} near-duplicates skipped) → {frames_dir}")
    return results

# ── Build content list ────────────────────────────────────────────────────────

def build_content_list(frames: list[dict]) -> list[dict]:
    content = []
    for i, f in enumerate(frames):
        mins = int(f["timestamp"] // 60); secs = int(f["timestamp"] % 60)
        ts = f"{mins:02d}:{secs:02d}"
        content.append({"type": "text",  "text": f"[{ts}] {f['text']}", "page_idx": i})
        # Near-duplicate chunks have no image (frame_path is None): the transcript
        # is kept, but no redundant frame is sent to the VLM.
        if f.get("frame_path"):
            content.append({"type": "image", "img_path": f["frame_path"],
                            "image_caption": [f"Video frame at {ts}"],
                            "image_footnote": [], "page_idx": i})
    return content

# ── RAG ───────────────────────────────────────────────────────────────────────

def infer_cached_embedding_dim(rag_dir: Path, fallback: int) -> int:
    """Prefer the dimension stored in an existing vector DB over .env defaults."""
    for filename in ("vdb_entities.json", "vdb_chunks.json", "vdb_relationships.json"):
        path = rag_dir / filename
        if not path.exists():
            continue
        try:
            with path.open("r", encoding="utf-8") as file_obj:
                data = json.load(file_obj)
            dim = int(data.get("embedding_dim") or 0)
            if dim > 0:
                return dim
        except Exception:
            continue
    return fallback

def build_llm_func():
    """Plain text LLM callable, reusable outside RAGAnything (catalog/routing)."""
    api_key   = os.getenv("LLM_BINDING_API_KEY")
    base_url  = os.getenv("LLM_BINDING_HOST")
    llm_model = os.getenv("LLM_MODEL", "gpt-4.1-2025-04-14")

    def llm_func(prompt, system_prompt=None, history_messages=[], **kwargs):
        return openai_complete_if_cache(llm_model, prompt,
            system_prompt=system_prompt, history_messages=history_messages,
            api_key=api_key, base_url=base_url, **kwargs)
    return llm_func


def build_embed_func():
    """Embedding callable: takes list[str], returns np.ndarray (n, dim)."""
    embed_model    = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large-1")
    embed_api_key  = os.getenv("EMBEDDING_BINDING_API_KEY") or os.getenv("LLM_BINDING_API_KEY")
    embed_base_url = os.getenv("EMBEDDING_BINDING_HOST") or os.getenv("LLM_BINDING_HOST")
    return partial(openai_embed.func, model=embed_model,
                   api_key=embed_api_key, base_url=embed_base_url)


def make_rag(rag_dir: Path) -> RAGAnything:
    api_key        = os.getenv("LLM_BINDING_API_KEY")
    base_url       = os.getenv("LLM_BINDING_HOST")
    vision_model   = os.getenv("VISION_MODEL",    "gpt-4.1-2025-04-14")
    embed_dim      = infer_cached_embedding_dim(rag_dir, int(os.getenv("EMBEDDING_DIM", "3072")))

    llm_func = build_llm_func()

    def vision_func(prompt, system_prompt=None, history_messages=[], image_data=None, messages=None, **kwargs):
        if messages:
            return openai_complete_if_cache(vision_model, "",
                system_prompt=None, history_messages=[],
                messages=messages, api_key=api_key, base_url=base_url, **kwargs)
        if image_data:
            return openai_complete_if_cache(vision_model, "",
                system_prompt=None, history_messages=[],
                messages=[
                    {"role": "system", "content": system_prompt} if system_prompt else None,
                    {"role": "user", "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}},
                    ]},
                ],
                api_key=api_key, base_url=base_url, **kwargs)
        return llm_func(prompt, system_prompt, history_messages, **kwargs)

    rag = RAGAnything(
        config=RAGAnythingConfig(
            working_dir=str(rag_dir), parser=None,
            enable_image_processing=True,
            enable_table_processing=False,
            enable_equation_processing=False,
        ),
        llm_model_func=llm_func,
        vision_model_func=vision_func,
        embedding_func=EmbeddingFunc(
            embedding_dim=embed_dim, max_token_size=8192,
            func=build_embed_func(),
        ),
    )
    rag._parser_installation_checked = True
    return rag


async def build_graph(content_list: list[dict], rag_dir: Path, video_path: Path):
    rag = make_rag(rag_dir)
    graph_file = rag_dir / "graph_chunk_entity_relation.graphml"
    if graph_file.exists() and graph_file.stat().st_size > 1000:
        print("  Existing graph found — loading cached graph")
        await rag._ensure_lightrag_initialized()
    else:
        print("  Building knowledge graph (this may take a while)...")
        await rag.insert_content_list(content_list=content_list,
                                      file_path=str(video_path))
    print("  Graph ready")
    return rag


# ── Multi-video querying (catalog routing + fusion) ───────────────────────────

class MultiVideoQuerier:
    """Routes a question to the relevant video graphs and fuses their answers.

    Loaded RAGAnything instances are cached (LRU) so repeated questions don't
    reload graphs from disk every time.
    """

    def __init__(self, catalog_path, top_k: int = 3, threshold: float = 0.2,
                 use_llm_router: bool = True, cache_size: int = 4):
        self.catalog_path = catalog_path
        self.catalog = catalog_lib.load_catalog(catalog_path)
        self.llm_func = build_llm_func()
        self.embed_func = build_embed_func()
        self.top_k = top_k
        self.threshold = threshold
        self.use_llm_router = use_llm_router
        self._cache_size = cache_size
        self._rag_cache: dict = {}
        self._cache_order: list = []

    def reload_catalog(self):
        self.catalog = catalog_lib.load_catalog(self.catalog_path)

    def prime(self, name: str, rag: RAGAnything):
        """Reuse an already-initialised graph (e.g. just after ingestion)."""
        self._touch(name, rag)

    def _touch(self, name: str, rag: RAGAnything):
        self._rag_cache[name] = rag
        if name in self._cache_order:
            self._cache_order.remove(name)
        self._cache_order.append(name)
        while len(self._cache_order) > self._cache_size:
            self._rag_cache.pop(self._cache_order.pop(0), None)

    async def _get_rag(self, name: str) -> RAGAnything:
        if name in self._rag_cache:
            self._touch(name, self._rag_cache[name])
            return self._rag_cache[name]
        entry = self.catalog[name]
        rag = make_rag(Path(entry["rag_dir"]))
        await rag._ensure_lightrag_initialized()
        self._touch(name, rag)
        return rag

    async def answer(self, query: str, selected: list = None) -> str:
        if selected:
            names = [n for n in selected if n in self.catalog]
            missing = [n for n in selected if n not in self.catalog]
            if missing:
                print(f"  (目录中没有: {', '.join(missing)}  —— 用 /videos 查看可用视频)")
            if not names:
                return "指定的视频都不在目录中。用 /videos 查看可用视频。"
        else:
            names = await catalog_lib.route(
                query, self.catalog, self.embed_func, self.llm_func,
                top_k=self.top_k, threshold=self.threshold,
                use_llm=self.use_llm_router)

        if not names:
            return ("没有找到与该问题相关的视频。可以用 @视频名 指定要参考的视频，"
                    "或先用 /videos 查看已导入的视频。")

        print(f"  参考视频: {', '.join(names)}")
        rags = [(n, await self._get_rag(n)) for n in names]
        answers = await asyncio.gather(
            *[rag.aquery(query, mode="hybrid") for _, rag in rags],
            return_exceptions=True,
        )
        results = []
        for (name, _), ans in zip(rags, answers):
            results.append((name, f"(查询失败: {ans})" if isinstance(ans, Exception) else ans))

        if len(results) == 1:
            return results[0][1]
        return await self._fuse(query, results)

    async def _fuse(self, query: str, results: list) -> str:
        blocks = []
        for name, ans in results:
            title = self.catalog.get(name, {}).get("title", name)
            blocks.append(f"【来源：{name}（{title}）】\n{ans}")
        prompt = (
            "用户问题：" + query +
            "\n\n以下是来自多个视频的检索回答，请综合成一个连贯的中文答案；"
            "在引用具体内容处标注来源视频名，若不同来源有冲突请指出。\n\n" +
            "\n\n".join(blocks)
        )
        return await self.llm_func(prompt)


async def multi_query_loop(querier: MultiVideoQuerier):
    print("\nReady. 用法：")
    print("  直接提问            → AI 自动选择相关视频")
    print("  @视频名 你的问题     → 指定视频（多个用逗号分隔，如 @a,b 问题）")
    print("  /videos             → 列出已导入的视频")
    print("  exit                → 退出\n")
    while True:
        q = input("Your question: ").strip()
        if q.lower() in ("exit", "quit", "q"):
            break
        if not q:
            continue
        if q in ("/videos", "/list"):
            querier.reload_catalog()
            if not querier.catalog:
                print("  目录为空。先用 --video 导入视频。\n")
                continue
            for n, e in querier.catalog.items():
                print(f"  @{n}  {e.get('title', '')}")
                if e.get("summary"):
                    print(f"        {e['summary']}")
            print()
            continue

        selected = None
        if q.startswith("@"):
            head, _, rest = q[1:].partition(" ")
            selected = [s for s in re.split(r"[,，]", head) if s.strip()]
            q = rest.strip()
            if not q:
                print("  请在 @视频名 后面跟上你的问题。\n")
                continue

        ans = await querier.answer(q, selected=selected)
        print(f"\nAnswer: {ans}\n")

# ── Main ──────────────────────────────────────────────────────────────────────

async def main(args: argparse.Namespace):
    catalog_path = Path(args.catalog) if args.catalog else DEFAULT_CATALOG
    video_path   = Path(args.video) if args.video else None
    interval     = args.interval
    dedup_threshold = 0 if args.no_dedup else args.dedup_threshold

    querier = MultiVideoQuerier(
        catalog_path, top_k=args.top_k, threshold=args.threshold,
        use_llm_router=not args.no_llm_router)

    # ── Chat-only over the whole catalog (no ingestion) ──────────────────────
    if args.chat or (args.query_only and not video_path):
        # If --name points at an existing graph not yet in the catalog, expose it
        # so @name still works (it just won't be auto-routed until re-imported).
        if args.query_only and args.name and args.name not in querier.catalog:
            _try_register_existing(querier, args, catalog_path)
        if not querier.catalog:
            print(f"目录为空: {catalog_path}\n先用 --video ... --name ... 导入视频。")
            return
        await multi_query_loop(querier)
        return

    # ── Ingestion path (requires --video and --name) ─────────────────────────
    if not (video_path and args.name):
        print("ERROR: 导入视频需要同时提供 --video 和 --name；"
              "只想问答请加 --chat。")
        return

    name       = args.name
    out_dir    = Path(args.out_dir) if args.out_dir else video_path.parent
    frames_dir = out_dir / f"{name}_frames"
    rag_dir    = out_dir / f"rag_storage_{name}"
    srt_path   = out_dir / f"{name}.srt"
    api_key    = os.getenv("LLM_BINDING_API_KEY")
    base_url   = os.getenv("LLM_BINDING_HOST")

    # Step 1: Transcribe
    if srt_path.exists():
        print(f"[1/4] SRT already exists: {srt_path}")
    else:
        print(f"[1/4] Transcribing {video_path.name}...")
        transcribe(video_path, srt_path, api_key, base_url)

    # Step 2: Extract frames (with near-duplicate removal)
    dedup_note = "dedup off" if dedup_threshold <= 0 else f"dedup ≥{dedup_threshold}"
    print(f"\n[2/4] Extracting frames (every {interval}s, {dedup_note})...")
    entries = parse_srt(srt_path)
    chunks  = merge_entries(entries, interval)
    print(f"  {len(entries)} subtitle entries → {len(chunks)} chunks")
    frames  = extract_frames(video_path, chunks, frames_dir, dedup_threshold)
    content_list = build_content_list(frames)
    print(f"  content_list: {len(content_list)} items")

    # Step 3: Build graph
    print(f"\n[3/4] Building knowledge graph → {rag_dir}...")
    rag = await build_graph(content_list, rag_dir, video_path)

    # Step 4: Register into the cross-video catalog
    print(f"\n[4/4] Registering in catalog → {catalog_path}...")
    transcript = " ".join(e["text"] for e in entries)
    entry = await catalog_lib.register_video(
        catalog_path, name, rag_dir, transcript,
        build_llm_func(), build_embed_func(),
        extra={"video": str(video_path.resolve())})
    print(f"  标题: {entry['title']}")
    print(f"  摘要: {entry['summary']}")
    querier.reload_catalog()
    querier.prime(name, rag)   # reuse the just-built graph

    await multi_query_loop(querier)


def _try_register_existing(querier: MultiVideoQuerier, args, catalog_path):
    """Best-effort: add a pre-existing graph (built before the catalog feature)
    to the catalog as a minimal entry so it can be referenced with @name."""
    name = args.name
    base = Path(args.out_dir) if args.out_dir else (
        Path(args.video).parent if args.video else None)
    if base is None:
        print(f"  (无法定位 {name} 的图谱：请提供 --out-dir 或 --video)")
        return
    rag_dir = base / f"rag_storage_{name}"
    if not rag_dir.exists():
        print(f"  (未找到图谱: {rag_dir})")
        return
    cat = catalog_lib.load_catalog(catalog_path)
    cat[name] = {"name": name, "rag_dir": str(rag_dir.resolve()),
                 "title": name, "summary": "", "keywords": [],
                 "summary_embedding": []}
    catalog_lib.save_catalog(catalog_path, cat)
    querier.reload_catalog()
    print(f"  已将 {name} 加入目录（无摘要，暂不参与自动路由，可用 @{name} 指定）")


def parse_args():
    parser = argparse.ArgumentParser(description="Video RAG pipeline")
    parser.add_argument("--video",      help="Path to video file (omit to just chat)")
    parser.add_argument("--name",       default=None,
                        help="Short name for this video (required for ingestion, "
                             "used for output dirs, e.g. compiler_ch1)")
    parser.add_argument("--chat",       action="store_true",
                        help="Skip ingestion: chat across all videos in the catalog")
    parser.add_argument("--interval",   type=float, default=5.0,
                        help="Frame extraction interval in seconds (default: 5)")
    parser.add_argument("--dedup-threshold", type=int, default=5,
                        help="dHash Hamming distance below which a frame is treated "
                             "as a duplicate of the last kept frame and its image is "
                             "dropped (0-64; higher = more aggressive merging; default: 5)")
    parser.add_argument("--no-dedup",   action="store_true",
                        help="Disable frame deduplication (keep every frame)")
    parser.add_argument("--query-only", action="store_true",
                        help="Skip ingestion, load existing graph(s) and query")
    parser.add_argument("--out-dir",    default=None,
                        help="Override output directory (default: same folder as video)")
    parser.add_argument("--catalog",    default=None,
                        help=f"Path to the cross-video catalog JSON "
                             f"(default: {DEFAULT_CATALOG})")
    parser.add_argument("--top-k",      type=int, default=3,
                        help="Max number of videos to consult per question (default: 3)")
    parser.add_argument("--threshold",  type=float, default=0.2,
                        help="Min cosine similarity for a video to be a routing "
                             "candidate (default: 0.2)")
    parser.add_argument("--no-llm-router", action="store_true",
                        help="Route by embedding similarity only, skip the LLM tie-break")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
