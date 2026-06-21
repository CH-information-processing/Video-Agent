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
5. 只保留课程知识点、概念、方法、结论、对比关系；不要把平台名称、水印、截图帧、时间戳画面、人物外观、PPT配色当成节点。
6. 不要使用 A --> B & C 这种 Mermaid 简写；每条边单独写一行。
7. 只输出 Mermaid 代码块，不要输出解释文字。
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

        cache_config = None
        old_cache_enabled = None
        try:
            lightrag = getattr(rag, "lightrag", None)
            cache = getattr(lightrag, "llm_response_cache", None)
            cache_config = getattr(cache, "global_config", None)
            if isinstance(cache_config, dict):
                old_cache_enabled = cache_config.get("enable_llm_cache", True)
                cache_config["enable_llm_cache"] = False
            mindmap = await rag.aquery(
                MINDMAP_PROMPT,
                mode="hybrid",
                vlm_enhanced=False,
                response_type="Mermaid graph TD code block only",
            )
        except Exception as exc:
            return AgentOutput(
                success=False,
                error=f"知识图谱生成失败：{exc}",
            )
        finally:
            if isinstance(cache_config, dict) and old_cache_enabled is not None:
                cache_config["enable_llm_cache"] = old_cache_enabled

        mindmap_text = str(mindmap or "").strip()
        return AgentOutput(payload={"mindmap": mindmap_text}, raw=mindmap_text)
