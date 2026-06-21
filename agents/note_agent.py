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
5. 只保留课程知识点、概念、方法、结论、对比关系；不要把平台名称、水印、截图帧、人物外观、PPT配色当成核心内容。
6. 根据当前视频的实际主题选择合适结构，不要套用其他视频或固定模板。
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

        cache_config = None
        old_cache_enabled = None
        try:
            lightrag = getattr(rag, "lightrag", None)
            cache = getattr(lightrag, "llm_response_cache", None)
            cache_config = getattr(cache, "global_config", None)
            if isinstance(cache_config, dict):
                old_cache_enabled = cache_config.get("enable_llm_cache", True)
                cache_config["enable_llm_cache"] = False
            notes = await rag.aquery(
                NOTE_PROMPT,
                mode="hybrid",
                vlm_enhanced=False,
                response_type="Markdown study notes",
            )
        except Exception as exc:
            return AgentOutput(
                success=False,
                error=f"学习笔记生成失败：{exc}",
            )
        finally:
            if isinstance(cache_config, dict) and old_cache_enabled is not None:
                cache_config["enable_llm_cache"] = old_cache_enabled

        notes_text = str(notes or "").strip()
        return AgentOutput(payload={"notes": notes_text}, raw=notes_text)
