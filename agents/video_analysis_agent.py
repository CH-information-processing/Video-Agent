"""Video Analysis Agent — 视频分析 Agent。

负责处理视频的底层操作：
  - 转写（Whisper API）
  - 字幕解析与时间片合并
  - 关键帧提取（dHash 去重）
  - 构建内容列表（文本 + 图像条目交替）

包装 video_rag_pipeline.py 中的现有函数。
"""

from __future__ import annotations

import os
from pathlib import Path

from agent_framework import BaseAgent, AgentInput, AgentOutput

from video_rag_pipeline import (
    build_content_list,
    extract_frames,
    merge_entries,
    parse_srt,
    transcribe,
)


class VideoAnalysisAgent(BaseAgent):
    """视频分析 Agent。

    对输入视频执行：
    1. 转写（如果 SRT 不存在）
    2. 解析 SRT 并合并时间片
    3. 提取关键帧（dHash 去重）
    4. 构建内容列表
    """

    def __init__(self):
        super().__init__(
            name="video_analysis",
            description="视频转写、字幕解析、关键帧提取、内容列表构建",
        )

    async def run(self, input_data: AgentInput) -> AgentOutput:
        params = input_data.params
        video_path = Path(params["video_path"])
        name = params.get("name", video_path.stem)
        out_dir = Path(params.get("out_dir", video_path.parent))
        interval = float(params.get("interval", 5.0))
        dedup_threshold = int(params.get("dedup_threshold", 5))

        srt_path = out_dir / f"{name}.srt"
        frames_dir = out_dir / f"{name}_frames"
        api_key = params.get("api_key") or os.getenv("LLM_BINDING_API_KEY", "")
        base_url = params.get("base_url") or os.getenv("LLM_BINDING_HOST", "")

        # Step 1: 转写
        if srt_path.exists():
            raw_segments = parse_srt(srt_path)
        else:
            raw_segments = transcribe(video_path, srt_path, api_key, base_url)

        # Step 2: 合并时间片
        chunks = merge_entries(raw_segments, interval)

        # Step 3: 提取关键帧
        frames = extract_frames(video_path, chunks, frames_dir, dedup_threshold)

        # Step 4: 构建内容列表
        content_list = build_content_list(frames)

        return AgentOutput(
            payload={
                "video_path": str(video_path),
                "name": name,
                "out_dir": str(out_dir),
                "srt_path": str(srt_path),
                "frames_dir": str(frames_dir),
                "raw_segments": raw_segments,
                "chunks": chunks,
                "frames": frames,
                "content_list": content_list,
                "transcript_text": " ".join(e["text"] for e in raw_segments),
            }
        )
