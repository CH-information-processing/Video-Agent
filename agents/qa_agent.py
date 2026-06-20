"""QA Agent — 视频问答 Agent。

负责：
  - 基于已加载的 RAG 知识图谱回答用户问题
  - 支持 hybrid / local / global / naive 等多种检索模式
  - 向量检索失败时使用文本缓存兜底

包装 web_app.py 中的现有函数。
"""

from __future__ import annotations

from pathlib import Path

from agent_framework import BaseAgent, AgentInput, AgentOutput, run_async

from lightrag import LightRAG

QA_SYSTEM_PROMPT = """
你是 VideoScholar 的视频学习助手。请只依据当前视频知识库回答问题。
如果视频中没有明确依据，请说明"视频中未明确提到"或"根据已有片段无法判断"。
回答时尽量给出相关时间点或片段依据。
"""


class QAAgent(BaseAgent):
    """问答 Agent。

    依赖 KnowledgeIndexAgent 构建的 RAG 实例（通过上下文传递）。

    Note: 不再提供 ask_multi_video 方法。多视频路由由调用方通过
    catalog.py 的路由函数自行实现后，再调用此 Agent 的单视频问答。
    """

    def __init__(self):
        super().__init__(
            name="qa",
            description="基于视频知识图谱回答用户问题",
        )

    async def run(self, input_data: AgentInput) -> AgentOutput:
        rag = input_data.params.get("rag") or input_data.context.get("rag")
        question: str = (input_data.params.get("question") or "").strip()
        mode: str = input_data.params.get("mode", "hybrid")

        if not question:
            return AgentOutput(success=False, error="问题不能为空。")

        if rag is None:
            return AgentOutput(success=False, error="知识库未加载。")

        if mode not in {"hybrid", "local", "global", "naive", "mix"}:
            mode = "hybrid"

        try:
            answer = run_async(
                rag.aquery(question, mode=mode, system_prompt=QA_SYSTEM_PROMPT)
            )
        except Exception as exc:
            return AgentOutput(
                success=False,
                error=f"RAG 查询失败：{exc}",
            )

        return AgentOutput(
            payload={"answer": answer, "question": question, "mode": mode},
            raw=answer,
        )
