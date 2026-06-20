"""agent_framework — 轻量级多 Agent 编排框架。"""

from __future__ import annotations

import asyncio
import sys
import threading
from pathlib import Path

# ── 确保 RAG-Anything 可导入（全局只做一次）─────────────────────────────
_RAG_DIR = Path(__file__).resolve().parent.parent / "RAG-Anything"
if _RAG_DIR.is_dir() and str(_RAG_DIR) not in sys.path:
    sys.path.insert(0, str(_RAG_DIR))

# ── 公共工具（供 Agent 和 Orchestrator 使用） ────────────────────────────


def run_async(coro):
    """在已有事件循环或新线程中运行协程。

    兼容场景：
    - 没有运行中的事件循环 → 直接 asyncio.run
    - 有运行中的事件循环（如已在另一个线程中） → 新建线程执行
    """
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return asyncio.run(coro)
    if loop.is_running():
        result: dict = {}

        def runner():
            try:
                result["value"] = asyncio.run(coro)
            except Exception as exc:
                result["error"] = exc

        thread = threading.Thread(target=runner)
        thread.start()
        thread.join()
        if "error" in result:
            raise result["error"]
        return result.get("value")
    return loop.run_until_complete(coro)


# ── 类导出（直接导入以避免 __getattr__ 复杂性） ─────────────────────────
from .base_agent import BaseAgent, AgentInput, AgentOutput  # noqa: E402
from .orchestrator import AgentOrchestrator  # noqa: E402
