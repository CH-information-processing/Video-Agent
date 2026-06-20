"""Non-interactive sanity check for multi-video routing.

It exercises catalog_lib.route() against the existing video_catalog.json, so it
needs >=2 videos already registered (run the pipeline with --video/--name for
each first). It does NOT query the full graphs — only the cheap routing stage
(one embedding + one LLM tie-break per question), so it isolates "did routing
pick the right video(s)".

Run:
    python check_routing.py
"""

import asyncio

import catalog as catalog_lib
import video_rag_pipeline as v

# (question, what we expect). Edit to match the videos in your catalog.
PROBES = [
    ("残差连接是怎么解决深层网络退化问题的？",      "深度学习问题 → 只应命中 ResNet 视频"),
    ("ResNet 在 ImageNet 2015 比赛上的表现如何？",   "深度学习问题 → 只应命中 ResNet 视频"),
    ("什么是编译程序？它和翻译程序有什么区别？",      "编译原理问题 → 只应命中 编译原理 视频"),
    ("编译程序和解释程序有什么区别？",                "编译原理问题 → 只应命中 编译原理 视频"),
    ("今天北京的天气怎么样？",                        "无关问题 → 应返回 空(NONE)"),
]


async def main():
    catalog_path = v.DEFAULT_CATALOG
    cat = catalog_lib.load_catalog(catalog_path)
    print(f"catalog file : {catalog_path}")
    print(f"videos in it : {list(cat.keys())}\n")
    if len(cat) < 2:
        print("⚠ 目录里少于 2 个视频，无法验证路由。先登记至少两个视频再跑本脚本。")
        return

    embed = v.build_embed_func()
    llm = v.build_llm_func()

    passed = 0
    for q, expect in PROBES:
        names = await catalog_lib.route(q, cat, embed, llm, top_k=3, threshold=0.2)
        print(f"Q : {q}")
        print(f"   期望     : {expect}")
        print(f"   路由结果 : {names if names else '空（判定都不相关）'}\n")

    # 显式指定（@视频名）这条不依赖 route()，验证 selected 解析即可
    first = next(iter(cat))
    print(f"显式指定测试: 用户用 @{first} → 应直接锁定该视频，不经过自动路由")
    print(f"   selected=[{first}] → {[n for n in [first] if n in cat]}")


if __name__ == "__main__":
    asyncio.run(main())
