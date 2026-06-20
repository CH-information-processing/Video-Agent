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


class _PersistentLoop:
    """一个常驻后台线程上的单一事件循环。

    所有 RAG 协程必须跑在同一个事件循环上：LightRAG 会创建与「首次接触它的
    事件循环」绑定的共享 asyncio 锁，若每次请求都 asyncio.run 新建循环，第二次
    查询就会抛 'bound to a different event loop'。把所有协程提交到这一个循环上
    即可避免。
    """

    def __init__(self):
        self._loop = asyncio.new_event_loop()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def _run(self):
        asyncio.set_event_loop(self._loop)
        self._loop.run_forever()

    def run(self, coro):
        future = asyncio.run_coroutine_threadsafe(coro, self._loop)
        return future.result()


_RAG_LOOP = _PersistentLoop()


def run_async(coro):
    """在一个常驻事件循环上运行协程（见 _PersistentLoop）。"""
    return _RAG_LOOP.run(coro)


# ── 类导出（直接导入以避免 __getattr__ 复杂性） ─────────────────────────
from .base_agent import BaseAgent, AgentInput, AgentOutput  # noqa: E402
from .orchestrator import AgentOrchestrator  # noqa: E402
