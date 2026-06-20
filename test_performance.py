"""
8.1 性能测试脚本 — VideoScholar

测试项目：
  T1  dHash 去重效果分析（阈值 3 / 5 / 10，两个视频）
  T2  知识库冷加载 vs 缓存加载耗时对比
  T3  四种检索模式（hybrid / local / global / naive）响应时延
  T4  视频处理流水线分阶段耗时（SRT 解析 → 分段 → 抽帧）

结果写入：
  test_results/performance_results.json   原始数据
  test_results/performance_report.md      格式化报告（含 ASCII 表格）

用法：
  cd Video-Agent
  python test_performance.py
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from pathlib import Path
from statistics import mean, stdev

# ── 路径设置 ──────────────────────────────────────────────────────────────────
PROJECT_DIR = Path(__file__).resolve().parent
_RAG_ANYTHING_DIR = PROJECT_DIR / "RAG-Anything"
if _RAG_ANYTHING_DIR.is_dir() and str(_RAG_ANYTHING_DIR) not in sys.path:
    sys.path.insert(0, str(_RAG_ANYTHING_DIR))

os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")

from dotenv import load_dotenv
load_dotenv(dotenv_path=PROJECT_DIR / ".env", override=False)

# 在 import pipeline 之前切换到项目目录，让 catalog.py 找到 video_catalog.json
os.chdir(PROJECT_DIR)

import cv2
import numpy as np
import video_rag_pipeline as pipeline

RESULTS_DIR = PROJECT_DIR / "test_results"
RESULTS_DIR.mkdir(exist_ok=True)

# ── 测试数据配置 ───────────────────────────────────────────────────────────────
VIDEOS = {
    "compiler_ch1": {
        "label": "编译原理 1.1.1",
        "srt":   PROJECT_DIR / "编译原理/1.1.1 什么是编译程序/compiler_ch1.srt",
        "frames_dir": PROJECT_DIR / "编译原理/1.1.1 什么是编译程序/compiler_ch1_frames",
        "video": PROJECT_DIR / "编译原理/1.1.1 什么是编译程序/1.1.1 什么是编译程序.mp4",
        "rag_dir": PROJECT_DIR / "编译原理/1.1.1 什么是编译程序/rag_storage_compiler_ch1",
    },
    "test_dedup": {
        "label": "ResNet 论文精读",
        "srt":   PROJECT_DIR / "ResNet论文精读/test_dedup.srt",
        "frames_dir": PROJECT_DIR / "ResNet论文精读/test_dedup_frames",
        "video": PROJECT_DIR / "ResNet论文精读/ResNet【上】论文精读.mp4",
        "rag_dir": PROJECT_DIR / "ResNet论文精读/rag_storage_test_dedup",
    },
}

# 每个视频各测 5 个不同类型的问题（T3 用）
QA_QUESTIONS = {
    "compiler_ch1": [
        "什么是编译程序？",
        "编译程序和解释程序有什么区别？",
        "编译过程分为哪几个阶段？",
        "什么是翻译程序？",
        "词法分析的主要任务是什么？",
    ],
    "test_dedup": [
        "ResNet 解决了什么问题？",
        "残差连接是如何工作的？",
        "视频中提到了哪些网络层数的实验对比？",
        "ResNet 在 ImageNet 竞赛中取得了什么成绩？",
        "这个视频主要讲了什么内容？",
    ],
}


# ── 工具函数 ───────────────────────────────────────────────────────────────────

def fmt_table(headers: list[str], rows: list[list]) -> str:
    cols = [headers] + [[str(c) for c in r] for r in rows]
    widths = [max(len(col[i]) for col in cols) for i in range(len(headers))]
    sep = "+" + "+".join("-" * (w + 2) for w in widths) + "+"
    def row_str(r):
        return "|" + "|".join(f" {str(c):<{w}} " for c, w in zip(r, widths)) + "|"
    lines = [sep, row_str(headers), sep]
    for r in rows:
        lines += [row_str(r), sep]
    return "\n".join(lines)


def seconds_fmt(s: float) -> str:
    return f"{s:.3f}s"


# ── T1  dHash 去重效果分析 ──────────────────────────────────────────────────────

def run_t1_dhash(results: dict):
    print("\n[T1] dHash 去重效果分析 ...")
    thresholds = [3, 5, 10]
    t1_data = {}

    for name, cfg in VIDEOS.items():
        srt_path = cfg["srt"]
        video_path = cfg["video"]
        label = cfg["label"]

        if not srt_path.exists():
            print(f"  跳过 {label}：SRT 不存在")
            continue
        if not video_path.exists():
            print(f"  跳过 {label}：视频文件不存在，只统计现有帧目录")
            # 仅统计现有帧目录
            frames_dir = cfg["frames_dir"]
            existing = len(list(frames_dir.glob("*.jpg"))) if frames_dir.exists() else 0
            entries = pipeline.parse_srt(srt_path)
            chunks = pipeline.merge_entries(entries, 5.0)
            t1_data[name] = {
                "label": label,
                "total_chunks": len(chunks),
                "existing_frames": existing,
                "thresholds": {},
            }
            continue

        entries = pipeline.parse_srt(srt_path)
        chunks = pipeline.merge_entries(entries, 5.0)
        total = len(chunks)

        video_path_obj = video_path
        cap = cv2.VideoCapture(str(video_path_obj))
        fps = cap.get(cv2.CAP_PROP_FPS)

        # 预提取所有中间帧的 dHash
        hashes = []
        for chunk in chunks:
            mid = (chunk["start"] + chunk["end"]) / 2
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(mid * fps))
            ok, frame = cap.read()
            if ok:
                hashes.append(pipeline.compute_dhash(frame))
            else:
                hashes.append(None)
        cap.release()

        thresh_results = {}
        for thresh in thresholds:
            kept = 0
            prev_hash = None
            for h in hashes:
                if h is None:
                    continue
                if prev_hash is None or pipeline.hamming(h, prev_hash) >= thresh:
                    kept += 1
                    prev_hash = h
            dedup_rate = (total - kept) / total * 100 if total > 0 else 0
            thresh_results[thresh] = {
                "kept_frames": kept,
                "deduped": total - kept,
                "dedup_rate_pct": round(dedup_rate, 1),
            }
            print(f"  {label} | threshold={thresh}: {kept}/{total} 帧保留，去重率 {dedup_rate:.1f}%")

        t1_data[name] = {
            "label": label,
            "total_chunks": total,
            "thresholds": thresh_results,
        }

    results["T1_dhash"] = t1_data


# ── T2  冷加载 vs 缓存加载耗时 ────────────────────────────────────────────────

async def run_t2_load(results: dict):
    print("\n[T2] 知识库加载耗时（冷加载 vs 缓存）...")
    t2_data = {}

    for name, cfg in VIDEOS.items():
        rag_dir = cfg["rag_dir"]
        label = cfg["label"]
        if not rag_dir.exists():
            print(f"  跳过 {label}：RAG 目录不存在")
            continue

        timings = []
        # 连续加载 3 次：第 1 次为冷启动（Python 进程已有，但 LightRAG 对象未初始化）
        for i in range(3):
            t0 = time.perf_counter()
            rag = pipeline.make_rag(rag_dir)
            await rag._ensure_lightrag_initialized()
            elapsed = time.perf_counter() - t0
            timings.append(round(elapsed, 3))
            label_round = "冷加载" if i == 0 else f"热加载{i}"
            print(f"  {label} | 第{i+1}次加载: {elapsed:.3f}s  [{label_round}]")
            del rag

        t2_data[name] = {
            "label": label,
            "cold_load_s": timings[0],
            "warm_load_avg_s": round(mean(timings[1:]), 3),
            "speedup_x": round(timings[0] / mean(timings[1:]), 1) if mean(timings[1:]) > 0 else "∞",
            "raw_timings": timings,
        }

    results["T2_load"] = t2_data


# ── T3  四种检索模式响应延迟 ──────────────────────────────────────────────────

async def run_t3_query(results: dict):
    print("\n[T3] 四种检索模式延迟测试...")
    modes = ["hybrid", "local", "global", "naive"]
    t3_data = {}

    for name, cfg in VIDEOS.items():
        rag_dir = cfg["rag_dir"]
        label = cfg["label"]
        questions = QA_QUESTIONS.get(name, [])
        if not rag_dir.exists() or not questions:
            print(f"  跳过 {label}")
            continue

        rag = pipeline.make_rag(rag_dir)
        await rag._ensure_lightrag_initialized()

        mode_stats = {}
        for mode in modes:
            timings = []
            print(f"  {label} | mode={mode} ...", end="", flush=True)
            for q in questions:
                t0 = time.perf_counter()
                try:
                    await rag.aquery(q, mode=mode, vlm_enhanced=False)
                except Exception as e:
                    print(f"\n    !! {mode} 查询出错: {e}")
                    continue
                elapsed = time.perf_counter() - t0
                timings.append(round(elapsed, 3))
            if timings:
                avg = round(mean(timings), 3)
                mn  = round(min(timings), 3)
                mx  = round(max(timings), 3)
                sd  = round(stdev(timings), 3) if len(timings) > 1 else 0.0
                print(f" avg={avg:.3f}s  min={mn:.3f}s  max={mx:.3f}s")
                mode_stats[mode] = {
                    "avg_s": avg, "min_s": mn, "max_s": mx, "std_s": sd,
                    "n": len(timings), "raw": timings,
                }
            else:
                mode_stats[mode] = None

        t3_data[name] = {"label": label, "modes": mode_stats}
        del rag

    results["T3_query"] = t3_data


# ── T4  流水线分阶段耗时（SRT → 分段 → 抽帧） ─────────────────────────────────

def run_t4_pipeline(results: dict):
    print("\n[T4] 流水线分阶段耗时（本地操作，不调用 API）...")
    t4_data = {}

    for name, cfg in VIDEOS.items():
        srt_path = cfg["srt"]
        label = cfg["label"]
        if not srt_path.exists():
            print(f"  跳过 {label}：SRT 不存在")
            continue

        # 阶段 A：SRT 解析
        t0 = time.perf_counter()
        entries = pipeline.parse_srt(srt_path)
        t_parse = time.perf_counter() - t0

        # 阶段 B：时间片合并（interval=5s）
        t0 = time.perf_counter()
        chunks = pipeline.merge_entries(entries, 5.0)
        t_merge = time.perf_counter() - t0

        # 阶段 C：关键帧读取与 dHash 计算（用已有帧目录测实际 dHash 计算速度）
        frames_dir = cfg["frames_dir"]
        video_path = cfg["video"]
        t_frame = None
        kept_count = 0

        if video_path.exists():
            t0 = time.perf_counter()
            cap = cv2.VideoCapture(str(video_path))
            fps = cap.get(cv2.CAP_PROP_FPS)
            prev_hash = None
            for chunk in chunks:
                mid = (chunk["start"] + chunk["end"]) / 2
                cap.set(cv2.CAP_PROP_POS_FRAMES, int(mid * fps))
                ok, frame = cap.read()
                if not ok:
                    continue
                h = pipeline.compute_dhash(frame)
                if prev_hash is None or pipeline.hamming(h, prev_hash) >= 5:
                    kept_count += 1
                    prev_hash = h
            cap.release()
            t_frame = round(time.perf_counter() - t0, 3)
        else:
            # 视频不存在：统计现有帧目录
            kept_count = len(list(frames_dir.glob("*.jpg"))) if frames_dir.exists() else 0

        print(f"  {label}: SRT解析={t_parse*1000:.1f}ms  "
              f"分段合并={t_merge*1000:.2f}ms  "
              f"抽帧+dHash={'N/A' if t_frame is None else f'{t_frame:.3f}s'}  "
              f"字幕段={len(entries)}  分段={len(chunks)}  关键帧={kept_count}")

        t4_data[name] = {
            "label": label,
            "subtitle_entries": len(entries),
            "merged_chunks": len(chunks),
            "keyframes_kept": kept_count,
            "srt_parse_ms": round(t_parse * 1000, 2),
            "merge_ms": round(t_merge * 1000, 2),
            "frame_extraction_s": t_frame,
        }

    results["T4_pipeline"] = t4_data


# ── 报告生成 ───────────────────────────────────────────────────────────────────

def generate_report(results: dict) -> str:
    lines = ["# VideoScholar 性能测试报告", ""]
    lines += ["**测试时间：** " + results.get("test_time", ""), ""]

    # T1
    lines += ["## T1  dHash 去重效果分析", ""]
    t1 = results.get("T1_dhash", {})
    for name, d in t1.items():
        lines += [f"### {d['label']}（总分段数：{d['total_chunks']}）", ""]
        rows = []
        for thresh, s in d.get("thresholds", {}).items():
            rows.append([
                str(thresh),
                str(d["total_chunks"]),
                str(s["kept_frames"]),
                str(s["deduped"]),
                f"{s['dedup_rate_pct']}%",
            ])
        if rows:
            lines.append(fmt_table(["阈值", "总分段", "保留帧", "去重帧", "去重率"], rows))
        lines.append("")

    # T2
    lines += ["## T2  知识库加载耗时", ""]
    t2 = results.get("T2_load", {})
    rows = []
    for name, d in t2.items():
        rows.append([
            d["label"],
            f"{d['cold_load_s']:.3f}s",
            f"{d['warm_load_avg_s']:.3f}s",
            f"{d['speedup_x']}×",
        ])
    if rows:
        lines.append(fmt_table(["视频", "冷加载耗时", "热加载均值", "加速比"], rows))
    lines.append("")

    # T3
    lines += ["## T3  四种检索模式响应延迟（每模式 5 次查询均值）", ""]
    t3 = results.get("T3_query", {})
    for name, d in t3.items():
        lines += [f"### {d['label']}", ""]
        rows = []
        for mode, s in d.get("modes", {}).items():
            if s:
                rows.append([mode, f"{s['avg_s']:.3f}s", f"{s['min_s']:.3f}s",
                              f"{s['max_s']:.3f}s", f"{s['std_s']:.3f}s"])
            else:
                rows.append([mode, "失败", "-", "-", "-"])
        if rows:
            lines.append(fmt_table(["检索模式", "平均延迟", "最短", "最长", "标准差"], rows))
        lines.append("")

    # T4
    lines += ["## T4  流水线分阶段耗时", ""]
    t4 = results.get("T4_pipeline", {})
    rows = []
    for name, d in t4.items():
        rows.append([
            d["label"],
            str(d["subtitle_entries"]),
            str(d["merged_chunks"]),
            str(d["keyframes_kept"]),
            f"{d['srt_parse_ms']:.1f}ms",
            f"{d['merge_ms']:.2f}ms",
            f"{d['frame_extraction_s']}s" if d["frame_extraction_s"] else "N/A",
        ])
    if rows:
        lines.append(fmt_table(
            ["视频", "字幕段", "合并段", "关键帧", "SRT解析", "分段合并", "抽帧+dHash"],
            rows,
        ))
    lines.append("")

    return "\n".join(lines)


# ── 主入口 ────────────────────────────────────────────────────────────────────

async def main():
    print("=" * 60)
    print("VideoScholar 性能测试")
    print("=" * 60)

    results: dict = {
        "test_time": time.strftime("%Y-%m-%d %H:%M:%S"),
    }

    run_t1_dhash(results)
    await run_t2_load(results)
    await run_t3_query(results)
    run_t4_pipeline(results)

    # 保存 JSON
    json_path = RESULTS_DIR / "performance_results.json"
    json_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n原始数据已保存: {json_path}")

    # 生成报告
    report = generate_report(results)
    report_path = RESULTS_DIR / "performance_report.md"
    report_path.write_text(report, encoding="utf-8")
    print(f"报告已保存: {report_path}")
    print("\n" + report)


if __name__ == "__main__":
    asyncio.run(main())
