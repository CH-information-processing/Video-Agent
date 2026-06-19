"""
General-purpose Video RAG pipeline:
  1. Transcribe video with Whisper (auto-split if >25MB)
  2. Extract frames every FRAME_INTERVAL_SEC seconds
  3. Build RAGAnything knowledge graph
  4. Interactive Q&A

Usage:
  python video_rag_pipeline.py --video "C:/path/to/video.mp4" --name my_topic
  python video_rag_pipeline.py --video "C:/path/to/video.mp4" --name my_topic --interval 5
  python video_rag_pipeline.py --name my_topic  # skip ingestion, load existing graph
"""

import argparse
import asyncio
import math
import os
import re
import subprocess
import tempfile
from functools import partial
from pathlib import Path

import cv2
from dotenv import load_dotenv
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.utils import EmbeddingFunc
from raganything import RAGAnything, RAGAnythingConfig

import imageio_ffmpeg

load_dotenv(dotenv_path=".env", override=False)

FFMPEG      = imageio_ffmpeg.get_ffmpeg_exe()
WHISPER_MAX_MB = 24          # stay under 25MB API limit

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


def extract_frames(video_path: Path, chunks: list[dict], frames_dir: Path) -> list[dict]:
    frames_dir.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS)
    results = []
    for i, chunk in enumerate(chunks):
        mid = (chunk["start"] + chunk["end"]) / 2
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(mid * fps))
        ok, frame = cap.read()
        if not ok:
            continue
        frame_path = frames_dir / f"frame_{i:04d}_{int(mid)}s.jpg"
        if not frame_path.exists():
            # cv2.imwrite fails silently on Windows with non-ASCII paths
            # Use imencode + Python file write instead
            ok2, buf = cv2.imencode(".jpg", frame)
            if ok2:
                frame_path.write_bytes(buf.tobytes())
        results.append({"frame_path": str(frame_path.resolve()),
                         "timestamp": mid, "text": chunk["text"]})
    cap.release()
    print(f"  {len(results)} frames → {frames_dir}")
    return results

# ── Build content list ────────────────────────────────────────────────────────

def build_content_list(frames: list[dict]) -> list[dict]:
    content = []
    for i, f in enumerate(frames):
        mins = int(f["timestamp"] // 60); secs = int(f["timestamp"] % 60)
        ts = f"{mins:02d}:{secs:02d}"
        content.append({"type": "text",  "text": f"[{ts}] {f['text']}", "page_idx": i})
        content.append({"type": "image", "img_path": f["frame_path"],
                         "image_caption": [f"Video frame at {ts}"],
                         "image_footnote": [], "page_idx": i})
    return content

# ── RAG ───────────────────────────────────────────────────────────────────────

def make_rag(rag_dir: Path) -> RAGAnything:
    api_key      = os.getenv("LLM_BINDING_API_KEY")
    base_url     = os.getenv("LLM_BINDING_HOST")
    llm_model    = os.getenv("LLM_MODEL",       "gpt-4.1-2025-04-14")
    vision_model = os.getenv("VISION_MODEL",    "gpt-4.1-2025-04-14")
    embed_model  = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large-1")
    embed_dim    = int(os.getenv("EMBEDDING_DIM", "3072"))

    def llm_func(prompt, system_prompt=None, history_messages=[], **kwargs):
        return openai_complete_if_cache(llm_model, prompt,
            system_prompt=system_prompt, history_messages=history_messages,
            api_key=api_key, base_url=base_url, **kwargs)

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
            func=partial(openai_embed.func, model=embed_model,
                         api_key=api_key, base_url=base_url),
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


async def query_loop(rag: RAGAnything):
    print("\nReady. Type 'exit' to quit.\n")
    while True:
        q = input("Your question: ").strip()
        if q.lower() in ("exit", "quit", "q"):
            break
        if not q:
            continue
        result = await rag.aquery(q, mode="hybrid")
        print(f"\nAnswer: {result}\n")

# ── Main ──────────────────────────────────────────────────────────────────────

async def main(args: argparse.Namespace):
    name       = args.name
    video_path = Path(args.video) if args.video else None
    interval   = args.interval

    # Output goes next to the video file, not in the current working directory
    out_dir    = video_path.parent if video_path else Path(args.out_dir)
    frames_dir = out_dir / f"{name}_frames"
    rag_dir    = out_dir / f"rag_storage_{name}"
    srt_path   = out_dir / f"{name}.srt"

    api_key  = os.getenv("LLM_BINDING_API_KEY")
    base_url = os.getenv("LLM_BINDING_HOST")

    if video_path and not args.query_only:
        # Step 1: Transcribe
        if srt_path.exists():
            print(f"[1/3] SRT already exists: {srt_path}")
        else:
            print(f"[1/3] Transcribing {video_path.name}...")
            transcribe(video_path, srt_path, api_key, base_url)

        # Step 2: Extract frames
        print(f"\n[2/3] Extracting frames (every {interval}s)...")
        entries = parse_srt(srt_path)
        chunks  = merge_entries(entries, interval)
        print(f"  {len(entries)} subtitle entries → {len(chunks)} chunks")
        frames  = extract_frames(video_path, chunks, frames_dir)
        content_list = build_content_list(frames)
        print(f"  content_list: {len(content_list)} items")

        # Step 3: Build graph
        print(f"\n[3/3] Building knowledge graph → {rag_dir}...")
        rag = await build_graph(content_list, rag_dir, video_path)
    else:
        # Load existing graph
        print(f"Loading existing graph from {rag_dir}...")
        if not (args.video or args.out_dir):
            print("ERROR: provide --video or --out-dir when using --query-only")
            return
        out_dir = Path(args.video).parent if args.video else Path(args.out_dir)
        rag_dir = out_dir / f"rag_storage_{name}"
        if not rag_dir.exists():
            print(f"ERROR: {rag_dir} not found. Run without --query-only first.")
            return
        rag = make_rag(rag_dir)
        await rag._ensure_lightrag_initialized()

    await query_loop(rag)


def parse_args():
    parser = argparse.ArgumentParser(description="Video RAG pipeline")
    parser.add_argument("--video",      help="Path to video file")
    parser.add_argument("--name",       required=True,
                        help="Short name for this video (used for output dirs, e.g. compiler_ch1)")
    parser.add_argument("--interval",   type=float, default=5.0,
                        help="Frame extraction interval in seconds (default: 5)")
    parser.add_argument("--query-only", action="store_true",
                        help="Skip ingestion, load existing graph and query")
    parser.add_argument("--out-dir",    default=None,
                        help="Override output directory (default: same folder as video)")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
