"""Knowledge Index Agent — 知识索引 Agent。

负责：
  1. 基于视频内容列表构建 RAG 知识图谱
  2. 将视频注册到跨视频目录（catalog）
  3. 提供已构建 RAG 实例的加载

包装 video_rag_pipeline.py 和 catalog.py 中的现有函数。
"""

from __future__ import annotations

import os
from pathlib import Path

from agent_framework import BaseAgent, AgentInput, AgentOutput

import catalog as catalog_lib
from video_rag_pipeline import build_graph, make_rag


class KnowledgeIndexAgent(BaseAgent):
    """知识索引 Agent。

    依赖 VideoAnalysisAgent 的输出（content_list, name, out_dir 等）。
    """

    def __init__(self):
        super().__init__(
            name="knowledge_index",
            description="知识图谱构建、跨视频目录注册",
        )

    async def run(self, input_data: AgentInput) -> AgentOutput:
        ctx = input_data.context
        params = input_data.params

        # ── 模式 1: 直接加载已有知识库（通过 rag_dir 参数） ──────────────
        rag_dir_param = params.get("rag_dir") or ctx.get("rag_dir")
        if rag_dir_param:
            return await self._load_existing(rag_dir_param)

        # ── 模式 2: 基于内容列表构建新知识库 ──────────────────────────────
        content_list = params.get("content_list") or ctx.get("content_list", [])
        name = params.get("name") or ctx.get("name", "")
        video_path = Path(params.get("video_path") or ctx.get("video_path", ""))
        out_dir = Path(params.get("out_dir") or ctx.get("out_dir", video_path.parent))
        rag_dir = out_dir / f"rag_storage_{name}"
        transcript_text = params.get("transcript_text") or ctx.get("transcript_text", "")
        catalog_path = Path(
            params.get("catalog_path")
            or ctx.get("catalog_path")
            or str(Path(__file__).resolve().parent.parent / "video_catalog.json")
        )

        if not content_list:
            return AgentOutput(
                success=False,
                error="缺少 content_list，请先运行 VideoAnalysisAgent。",
            )

        # Step 1: 构建图谱
        rag = await build_graph(content_list, rag_dir, video_path)

        # Step 2: 注册到跨视频目录
        if transcript_text:
            from video_rag_pipeline import build_embed_func, build_llm_func

            entry = await catalog_lib.register_video(
                catalog_path,
                name,
                rag_dir,
                transcript_text,
                build_llm_func(),
                build_embed_func(),
                extra={"video": str(video_path.resolve())},
            )
        else:
            entry = {"name": name, "rag_dir": str(rag_dir.resolve())}

        return AgentOutput(
            payload={
                "rag": rag,
                "rag_dir": str(rag_dir),
                "catalog_entry": entry,
                "name": name,
            }
        )

    async def _load_existing(self, rag_dir: str) -> AgentOutput:
        """加载已有知识库（不重新构建）。"""
        rag = make_rag(Path(rag_dir))
        await rag._ensure_lightrag_initialized()
        return AgentOutput(
            payload={
                "rag": rag,
                "rag_dir": rag_dir,
            }
        )
