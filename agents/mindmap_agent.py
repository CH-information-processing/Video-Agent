"""MindMap Agent — 思维导图 Agent。

负责基于视频知识库自动生成知识结构图（Mermaid graph TD 语法）。
"""

from __future__ import annotations

from agent_framework import BaseAgent, AgentInput, AgentOutput, run_async

MINDMAP_PROMPT = """
请基于当前视频知识库生成一张中文学习思维导图。
要求：
1. 只依据视频内容，不要编造视频未提到的信息。
2. 使用 Mermaid graph TD 语法。
3. 根节点是视频主题，子节点体现章节、概念、过程和关系。
4. 节点文字简洁，适合课堂展示。
5. 只输出 Mermaid 代码块。
"""


class MindMapAgent(BaseAgent):
    """思维导图 Agent。"""

    def __init__(self):
        super().__init__(
            name="mindmap",
            description="基于视频知识库自动生成 Mermaid 思维导图",
        )

    async def run(self, input_data: AgentInput) -> AgentOutput:
        rag = input_data.params.get("rag") or input_data.context.get("rag")
        if rag is None:
            return AgentOutput(success=False, error="知识库未加载。")

        try:
            mindmap = run_async(rag.aquery(MINDMAP_PROMPT, mode="hybrid"))
        except TypeError as exc:
            if "expected string or bytes-like object" in str(exc):
                return AgentOutput(
                    success=False,
                    error="模型接口连接失败，请检查 LLM_BINDING_HOST 和 LLM_BINDING_API_KEY。",
                )
            raise

        return AgentOutput(payload={"mindmap": mindmap}, raw=mindmap)
