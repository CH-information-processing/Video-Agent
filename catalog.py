"""Cross-video catalog + router for multi-video RAG.

Each video keeps its own knowledge graph (rag_storage_{name}). This module adds
a lightweight catalog on top: one entry per video holding a title / summary /
keywords plus the embedding of that summary.

At query time we route in two cheap stages instead of scanning every graph:
  1. embed the question and rank videos by cosine similarity to their summary
     embedding  (scales to thousands of videos — just dot products);
  2. hand the few top candidates to the LLM, which picks the truly relevant
     ones (or answers NONE).
Only the selected videos' full graphs are then queried.
"""

import json
import re
from pathlib import Path

import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parent


def to_project_relative(path) -> str:
    """Store portable paths for files inside this project.

    Paths outside the project are left absolute because there is no stable
    project-relative representation for them.
    """
    path = Path(path).resolve()
    try:
        return str(path.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(path)


def from_project_path(path) -> Path:
    """Resolve a stored catalog/path value against the project root."""
    path = Path(path)
    if path.is_absolute():
        return path
    return PROJECT_ROOT / path


def _normalize_extra_paths(extra: dict | None) -> dict:
    if not extra:
        return {}
    normalized = dict(extra)
    for key in ("video", "video_path", "srt_path", "frames_dir", "rag_dir"):
        value = normalized.get(key)
        if value:
            normalized[key] = to_project_relative(value)
    return normalized


# ── persistence ───────────────────────────────────────────────────────────────

def load_catalog(path) -> dict:
    path = Path(path)
    if path.exists():
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_catalog(path, catalog: dict):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)


# ── registration ──────────────────────────────────────────────────────────────

def _extract_json(text: str) -> dict:
    """Tolerate ```json fences / surrounding prose around the JSON object."""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return {}


async def summarize_video(transcript: str, llm_func, max_chars: int = 12000) -> dict:
    snippet = transcript[:max_chars]
    prompt = (
        "下面是一个视频的转写文本。请基于内容用中文输出一个 JSON 对象，字段：\n"
        '  "title": 一句话标题(<=30字),\n'
        '  "summary": 2-4句话概括视频的主题与涵盖的主要内容,\n'
        '  "keywords": 5-10个主题关键词组成的数组。\n'
        "只输出 JSON 本身，不要任何额外文字或代码块标记。\n\n转写文本：\n" + snippet
    )
    raw = await llm_func(prompt)
    data = _extract_json(raw or "")
    return {
        "title":   str(data.get("title", "")).strip(),
        "summary": str(data.get("summary", "")).strip(),
        "keywords": [str(k).strip() for k in data.get("keywords", []) if str(k).strip()],
    }


async def register_video(catalog_path, name, rag_dir, transcript,
                         llm_func, embed_func, extra: dict = None) -> dict:
    """Summarize a video and (over)write its catalog entry."""
    catalog = load_catalog(catalog_path)
    meta = await summarize_video(transcript, llm_func)

    embed_text = " ".join(filter(None, [
        meta["title"], meta["summary"], " ".join(meta["keywords"])
    ])) or transcript[:2000]
    vec = (await embed_func([embed_text]))[0]

    entry = {
        "name":     name,
        "rag_dir":  to_project_relative(rag_dir),
        "title":    meta["title"],
        "summary":  meta["summary"],
        "keywords": meta["keywords"],
        "summary_embedding": [float(x) for x in vec],
    }
    if extra:
        entry.update(_normalize_extra_paths(extra))
    catalog[name] = entry
    save_catalog(catalog_path, catalog)
    return entry


# ── routing ───────────────────────────────────────────────────────────────────

def _cosine(a, b) -> float:
    a = np.asarray(a, dtype=float)
    b = np.asarray(b, dtype=float)
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


async def route(query, catalog, embed_func, llm_func=None,
                top_k: int = 3, threshold: float = 0.2, use_llm: bool = True) -> list:
    """Return the names of the videos to query for this question."""
    if not catalog:
        return []

    qvec = (await embed_func([query]))[0]
    scored = []
    for name, entry in catalog.items():
        emb = entry.get("summary_embedding")
        if emb:
            scored.append((name, _cosine(qvec, emb)))
    scored.sort(key=lambda x: x[1], reverse=True)
    if not scored:
        return []

    # Pure-vector mode: similarity threshold + top_k, with a best-match fallback.
    if not use_llm or llm_func is None:
        picked = [n for n, s in scored if s >= threshold][:top_k]
        return picked or [scored[0][0]]

    # Vector pre-filter → LLM tie-break. Give the LLM a few top candidates and
    # let it decide which are actually relevant (or NONE).
    candidates = [n for n, _ in scored[: max(top_k * 2, 4)]]
    lines = []
    for n in candidates:
        e = catalog[n]
        kws = "、".join(e.get("keywords", []))
        lines.append(f"- {n}: {e.get('title', '')} | {e.get('summary', '')} | 关键词: {kws}")
    prompt = (
        "用户问题：" + query + "\n\n候选视频：\n" + "\n".join(lines) +
        "\n\n请判断哪些视频与回答该问题相关。只返回相关视频的 name，多个用英文逗号分隔，"
        "按相关度从高到低排列；如果没有任何相关视频，返回 NONE。只输出结果，不要解释。"
    )
    raw = (await llm_func(prompt) or "").strip()
    if not raw or raw.upper().startswith("NONE"):
        return []
    # Keep candidate order by relevance as the LLM listed them.
    picked = []
    for token in re.split(r"[,，\s]+", raw):
        token = token.strip()
        if token in candidates and token not in picked:
            picked.append(token)
    if not picked:
        picked = [c for c in candidates if c in raw]
    return picked[:top_k] or candidates[:1]
