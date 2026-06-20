"""AgentOrchestrator — 轻量级多 Agent 编排器。

职责：
1. 注册所有 Agent
2. 维护一个共享上下文（dict），在 Agent 间传递
3. 根据任务类型将请求路由到正确的 Agent
4. 统一处理异常和错误
"""

from __future__ import annotations

import logging
import time
from typing import Any

from .base_agent import BaseAgent, AgentInput, AgentOutput

logger = logging.getLogger("orchestrator")


class AgentOrchestrator:
    """Agent 编排器。"""

    def __init__(self):
        self._agents: dict[str, BaseAgent] = {}
        self._context: dict[str, Any] = {}

    # ── 注册 ──────────────────────────────────────────────────────────────────

    def register_agent(self, agent: BaseAgent) -> None:
        if agent.name in self._agents:
            logger.warning("Agent '%s' 重复注册，将覆盖。", agent.name)
        self._agents[agent.name] = agent
        logger.info("Agent 已注册: %s (%s)", agent.name, agent.description)

    def get_agent(self, name: str) -> BaseAgent:
        agent = self._agents.get(name)
        if agent is None:
            raise KeyError(f"Agent '{name}' 未注册。已注册: {list(self._agents)}")
        return agent

    def list_agents(self) -> list[dict]:
        return [{"name": a.name, "description": a.description} for a in self._agents.values()]

    # ── 执行 ──────────────────────────────────────────────────────────────────

    async def run(
        self,
        agent_name: str,
        params: dict | None = None,
    ) -> AgentOutput:
        """运行指定 Agent。

        Args:
            agent_name: Agent 名称。
            params: 当前调用的参数（如用户问题、模式等）。

        Returns:
            AgentOutput。

        Raises:
            KeyError: Agent 未注册。
        """
        agent = self.get_agent(agent_name)
        input_data = AgentInput(context=dict(self._context), params=params or {})
        start = time.time()

        try:
            output = await agent.run(input_data)
        except Exception as exc:
            logger.error("Agent '%s' 执行失败: %s", agent_name, exc)
            output = AgentOutput(
                success=False,
                payload={},
                error=f"[{agent_name}] {exc}",
                metadata={"elapsed_seconds": round(time.time() - start, 3)},
            )

        # 执行成功后，将 output 中的信息合并到共享上下文
        if output.success and output.payload:
            self._update_context(agent_name, output.payload)

        return output

    async def run_pipeline(
        self,
        pipeline: list[dict],
    ) -> dict[str, AgentOutput]:
        """按顺序运行一组 Agent 流水线，前一个的输出上下文传给后一个。

        Args:
            pipeline: 列表，每项为 {"agent": str, "params": dict | None}。

        Returns:
            dict[agent_name -> AgentOutput]。
        """
        results: dict[str, AgentOutput] = {}
        for step in pipeline:
            name = step["agent"]
            params = step.get("params")
            output = await self.run(name, params)
            results[name] = output
            if not output.success:
                logger.error("流水线在 '%s' 步中断: %s", name, output.error)
                break
        return results

    # ── 上下文管理 ────────────────────────────────────────────────────────────

    def get_context(self, key: str, default=None) -> Any:
        return self._context.get(key, default)

    def set_context(self, key: str, value: Any) -> None:
        self._context[key] = value

    def update_context(self, updates: dict) -> None:
        self._context.update(updates)

    def clear_context(self) -> None:
        self._context.clear()

    def _update_context(self, agent_name: str, payload: dict) -> None:
        """Agent 执行完成后，将其输出合并到共享上下文。

        合并策略：每个 Agent 的输出按其 name 作为命名空间存入上下文，
        避免不同 Agent 输出同名 key 相互覆盖。同时将顶级常用字段
        （rag, answer, notes, mindmap, content_list 等）展开到根级，
        方便后续 Agent 直接通过 ctx.get("rag") 获取。
        """
        namespace = agent_name
        self._context.setdefault(namespace, {})
        self._context[namespace].update(payload)

        # 将常用字段同时展开到根级上下文（不覆盖已有值）
        _TOP_LEVEL_KEYS = {
            "rag", "answer", "notes", "mindmap", "content_list",
            "name", "out_dir", "rag_dir", "frames",
        }
        for key, value in payload.items():
            if key in _TOP_LEVEL_KEYS or key.startswith("catalog_"):
                if key not in self._context:
                    self._context[key] = value
