"""Agent 基类和输入/输出数据类。

每个 Agent 继承 BaseAgent，实现自己的 run() 方法。
Agent 之间不直接通信，通过 AgentOrchestrator 传递上下文。
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentInput:
    """Agent 的输入：包含上下文数据和任务相关参数"""

    context: dict = field(default_factory=dict)
    """共享上下文，由 Orchestrator 在 Agent 间传递"""

    params: dict = field(default_factory=dict)
    """当前调用的特定参数（如用户问题、模式选择等）"""


@dataclass
class AgentOutput:
    """Agent 的输出：包含执行结果和元信息"""

    success: bool = True
    payload: dict = field(default_factory=dict)
    """结构化输出数据"""

    raw: str = ""
    """原始文本输出（如 LLM 返回的纯文本）"""

    error: str = ""
    """失败时的错误信息"""

    metadata: dict = field(default_factory=dict)
    """执行元信息（耗时、tokens 用量等）"""


class BaseAgent(ABC):
    """所有 Agent 的基类。"""

    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description or name

    @abstractmethod
    async def run(self, input_data: AgentInput) -> AgentOutput:
        """执行 Agent 的核心逻辑。

        Args:
            input_data: AgentInput，包含共享上下文和当前调用参数。

        Returns:
            AgentOutput，包含执行结果。
        """
        ...

    def _make_metadata(self, start: float) -> dict:
        return {"elapsed_seconds": round(time.time() - start, 3), "agent": self.name}
