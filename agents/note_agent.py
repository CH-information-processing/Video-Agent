"""Note Agent — 学习笔记 Agent。

负责基于视频知识库自动生成结构化学习笔记（Markdown 格式）。
"""

from __future__ import annotations

from agent_framework import BaseAgent, AgentInput, AgentOutput, run_async

NOTE_PROMPT = """
请基于当前视频知识库生成一份中文学习笔记。
要求：
1. 只依据视频内容，不要编造视频未提到的信息。
2. 使用 Markdown。
3. 包含：视频主题、章节划分、核心知识点、重要概念解释、复习总结。
4. 尽量保留关键时间点，方便回看视频。
"""


class NoteAgent(BaseAgent):
    """学习笔记 Agent。"""

    def __init__(self):
        super().__init__(
            name="note",
            description="基于视频知识库自动生成结构化学习笔记",
        )

    async def run(self, input_data: AgentInput) -> AgentOutput:
        rag = input_data.params.get("rag") or input_data.context.get("rag")
        if rag is None:
            return AgentOutput(success=False, error="知识库未加载。")

        try:
            notes = run_async(rag.aquery(NOTE_PROMPT, mode="hybrid"))
        except TypeError as exc:
            if "expected string or bytes-like object" in str(exc):
                return AgentOutput(
                    success=False,
                    error="模型接口连接失败，请检查 LLM_BINDING_HOST 和 LLM_BINDING_API_KEY。",
                )
            raise

        return AgentOutput(payload={"notes": notes}, raw=notes)
