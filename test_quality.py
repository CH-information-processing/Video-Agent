"""
8.2 问答质量测试脚本 — VideoScholar

测试框架：RAGAS（LLM-as-judge）+ 手工分类评分

RAGAS 指标（无需 ground truth）：
  - faithfulness       回答是否有检索上下文支撑（防幻觉）
  - answer_relevancy   回答与问题的相关程度
  - context_precision  检索上下文与问题的精准度

手工分类指标（5 分制人工评分，仅占位留接口）：
  - accuracy           事实准确性
  - completeness       内容完整性
  - timestamp_quality  时间戳提供质量（视频 RAG 特有）

测试集：两个视频各 15 道题（事实定位 5 + 概念理解 5 + 全局摘要 5）

Evaluator LLM 配置（独立于 RAG 使用的 Doubao）：
  RAGAS_LLM_MODEL  / RAGAS_LLM_HOST / RAGAS_LLM_API_KEY  （来自 .env）

结果写入：
  test_results/quality_results.json    原始评测数据
  test_results/quality_report.md       格式化报告

用法：
  cd Video-Agent
  pip install ragas datasets  （首次需要安装）
  python test_quality.py
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path
from statistics import mean

# ── 路径设置 ──────────────────────────────────────────────────────────────────
PROJECT_DIR = Path(__file__).resolve().parent
_RAG_ANYTHING_DIR = PROJECT_DIR / "RAG-Anything"
if _RAG_ANYTHING_DIR.is_dir() and str(_RAG_ANYTHING_DIR) not in sys.path:
    sys.path.insert(0, str(_RAG_ANYTHING_DIR))

os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")

from dotenv import load_dotenv
load_dotenv(dotenv_path=PROJECT_DIR / ".env", override=False)
os.chdir(PROJECT_DIR)

import video_rag_pipeline as pipeline

RESULTS_DIR = PROJECT_DIR / "test_results"
RESULTS_DIR.mkdir(exist_ok=True)


# ── RAG 配置 ──────────────────────────────────────────────────────────────────
VIDEOS = {
    "compiler_ch1": {
        "label": "编译原理 1.1.1",
        "rag_dir": PROJECT_DIR / "编译原理/1.1.1 什么是编译程序/rag_storage_compiler_ch1",
    },
    "test_dedup": {
        "label": "ResNet 论文精读",
        "rag_dir": PROJECT_DIR / "ResNet论文精读/rag_storage_test_dedup",
    },
}


# ── 测试问答集 ─────────────────────────────────────────────────────────────────
# 每套 15 道题，分三类：
#   fact_locate   事实定位类（期待含时间戳）
#   concept       概念理解类
#   summary       全局摘要类

TEST_CASES = {
    "compiler_ch1": [
        # 事实定位类（5 题）
        {"id": "C01", "type": "fact_locate",
         "question": "视频中什么时候开始介绍编译程序的各个阶段？请给出大致时间点。"},
        {"id": "C02", "type": "fact_locate",
         "question": "词法分析器在视频的哪个时间段被提到？"},
        {"id": "C03", "type": "fact_locate",
         "question": "视频中提到了哪几种翻译程序？是在哪里提到的？"},
        {"id": "C04", "type": "fact_locate",
         "question": "视频中什么时候讲解了编译程序和解释程序的区别？"},
        {"id": "C05", "type": "fact_locate",
         "question": "课程的开头（前1分钟）介绍了哪些内容概要？"},

        # 概念理解类（5 题）
        {"id": "C06", "type": "concept",
         "question": "什么是编译程序？请用视频中的表述来解释。"},
        {"id": "C07", "type": "concept",
         "question": "编译程序和解释程序有什么本质区别？"},
        {"id": "C08", "type": "concept",
         "question": "编译过程一般分为哪几个阶段？各阶段的主要任务是什么？"},
        {"id": "C09", "type": "concept",
         "question": "什么是翻译程序？它与编译程序是什么关系？"},
        {"id": "C10", "type": "concept",
         "question": "词法分析的主要输入和输出是什么？"},

        # 全局摘要类（5 题）
        {"id": "C11", "type": "summary",
         "question": "这节课的主要内容是什么？请用 3-5 句话概括。"},
        {"id": "C12", "type": "summary",
         "question": "这个视频讲了几个核心知识点？分别是什么？"},
        {"id": "C13", "type": "summary",
         "question": "学完这节课，学生应该掌握哪些关于编译程序的基础知识？"},
        {"id": "C14", "type": "summary",
         "question": "请总结一下这节视频中关于编译程序结构的内容。"},
        {"id": "C15", "type": "summary",
         "question": "这节编译原理课程视频涉及了哪些主要话题？"},
    ],

    "test_dedup": [
        # 事实定位类（5 题）
        {"id": "R01", "type": "fact_locate",
         "question": "视频中在什么时间点开始介绍残差连接的核心思想？"},
        {"id": "R02", "type": "fact_locate",
         "question": "ResNet 在 ImageNet 2015 竞赛中取得的测试精度是多少？是在视频哪里提到的？"},
        {"id": "R03", "type": "fact_locate",
         "question": "视频中何时展示了 20 层和 56 层网络的对比实验？"},
        {"id": "R04", "type": "fact_locate",
         "question": "视频中提到 VGG 的地方在哪里？说了 ResNet 和 VGG 的什么关系？"},
        {"id": "R05", "type": "fact_locate",
         "question": "视频中什么时候开始介绍 ResNet 的作者信息？"},

        # 概念理解类（5 题）
        {"id": "R06", "type": "concept",
         "question": "ResNet 提出的核心动机是什么？它解决了什么问题？"},
        {"id": "R07", "type": "concept",
         "question": "残差学习（residual learning）的基本思想是什么？"},
        {"id": "R08", "type": "concept",
         "question": "为什么更深的网络（56层）在没有残差连接时表现反而比浅层网络（20层）差？"},
        {"id": "R09", "type": "concept",
         "question": "视频中提到 ResNet 使用了多少层？在不同任务上分别取得了什么结果？"},
        {"id": "R10", "type": "concept",
         "question": "视频是如何解释 ResNet 在目标检测任务上的改进效果的？"},

        # 全局摘要类（5 题）
        {"id": "R11", "type": "summary",
         "question": "请用 3-5 句话概括这个 ResNet 论文精读视频的主要内容。"},
        {"id": "R12", "type": "summary",
         "question": "视频中讨论了哪些主要的实验结果和数据集？"},
        {"id": "R13", "type": "summary",
         "question": "从这个视频来看，ResNet 对深度学习领域有哪些重要意义？"},
        {"id": "R14", "type": "summary",
         "question": "视频作者在介绍这篇论文时采用了什么阅读方式和结构？"},
        {"id": "R15", "type": "summary",
         "question": "这个视频讲解了哪些与 ResNet 相关的网络架构（如 VGG、GoogleNet 等）的对比？"},
    ],
}


# ── 第一步：调用 RAG 系统获取答案（同时提取 retrieved context） ────────────────

async def collect_answers(results: dict):
    """对每道测试题调用 RAG，记录问题/回答/检索上下文三元组。"""
    print("\n[Step 1] 收集 RAG 系统回答 ...")
    qa_data: dict[str, list[dict]] = {}

    QA_SYSTEM_PROMPT = """
你是 VideoScholar 的视频学习助手。请只依据当前视频知识库回答问题。
如果视频中没有明确依据，请说明"视频中未明确提到"或"根据已有片段无法判断"。
回答时尽量给出相关时间点或片段依据。
"""

    for video_name, cfg in VIDEOS.items():
        rag_dir = cfg["rag_dir"]
        label = cfg["label"]
        cases = TEST_CASES.get(video_name, [])

        if not rag_dir.exists():
            print(f"  跳过 {label}：RAG 目录不存在")
            continue

        print(f"\n  加载知识库: {label} ...")
        rag = pipeline.make_rag(rag_dir)
        await rag._ensure_lightrag_initialized()

        video_qa = []
        for case in cases:
            qid = case["id"]
            question = case["question"]
            qtype = case["type"]
            print(f"  [{qid}] {question[:40]}...", end="", flush=True)

            t0 = time.perf_counter()
            try:
                # hybrid 模式获得回答（vlm_enhanced=False 避免无效的二次查询）
                answer = await rag.aquery(
                    question, mode="hybrid",
                    system_prompt=QA_SYSTEM_PROMPT,
                    vlm_enhanced=False,
                )
                # naive 模式获得检索片段（用于 RAGAS context）
                ctx_raw = await rag.aquery(
                    question, mode="naive",
                    system_prompt="请只输出相关的原文片段，不要总结，保留时间戳。",
                    vlm_enhanced=False,
                )
            except Exception as e:
                answer = f"[查询失败: {e}]"
                ctx_raw = ""
            elapsed = time.perf_counter() - t0
            print(f" {elapsed:.2f}s")

            video_qa.append({
                "id": qid,
                "type": qtype,
                "question": question,
                "answer": answer,
                "contexts": [ctx_raw] if ctx_raw else ["[无检索结果]"],
                "response_time_s": round(elapsed, 3),
                "has_timestamp": bool(re.search(r"\d{1,2}:\d{2}", answer)),
            })

        qa_data[video_name] = video_qa
        del rag
        print(f"  {label} 完成，共 {len(video_qa)} 道题")

    results["qa_raw"] = qa_data
    return qa_data


# ── 第二步：RAGAS 自动评测 ─────────────────────────────────────────────────────

def build_ragas_evaluator():
    """用 RAGAS_LLM_* env 变量构建 RAGAS 所需的 LLM/Embeddings 对象。"""
    try:
        from ragas.llms import LangchainLLMWrapper
        from ragas.embeddings import LangchainEmbeddingsWrapper
        from langchain_openai import ChatOpenAI, OpenAIEmbeddings
    except ImportError:
        raise ImportError(
            "缺少依赖，请先运行：pip install ragas langchain-openai datasets"
        )

    model   = os.getenv("RAGAS_LLM_MODEL",  "gpt-4.1-2025-04-14")
    api_key = os.getenv("RAGAS_LLM_API_KEY")
    base_url = os.getenv("RAGAS_LLM_HOST")

    llm = ChatOpenAI(
        model=model,
        api_key=api_key,
        base_url=base_url,
        temperature=0,
    )

    # RAGAS 的 context_precision 也需要 embeddings；复用同一个 endpoint
    embed = OpenAIEmbeddings(
        model="text-embedding-ada-002",   # 该端点支持的 embedding 模型
        api_key=api_key,
        base_url=base_url,
    )

    return LangchainLLMWrapper(llm), LangchainEmbeddingsWrapper(embed)


async def run_ragas_eval(qa_data: dict, results: dict):
    """对每个视频的 QA 集跑 RAGAS 评测，写入 results。"""
    print("\n[Step 2] RAGAS 自动评测 ...")

    try:
        from ragas import evaluate
        from ragas.metrics import Faithfulness, ResponseRelevancy
        try:
            from ragas.metrics import LLMContextPrecisionWithoutReference as CtxPrec
        except ImportError:
            from ragas.metrics import ContextPrecision as CtxPrec
        from datasets import Dataset
    except ImportError:
        print("  !! ragas / datasets 未安装，跳过自动评测。")
        print("     请运行: pip install ragas datasets langchain-openai")
        results["ragas"] = {"error": "ragas 未安装"}
        return

    try:
        ragas_llm, ragas_embed = build_ragas_evaluator()
    except Exception as e:
        print(f"  !! RAGAS LLM 初始化失败: {e}")
        results["ragas"] = {"error": str(e)}
        return

    # RAGAS 0.2+ 必须在实例化时传入 llm/embeddings，不能事后赋值
    metrics = [
        Faithfulness(llm=ragas_llm),
        ResponseRelevancy(llm=ragas_llm, embeddings=ragas_embed),
        CtxPrec(llm=ragas_llm),
    ]

    ragas_scores: dict[str, dict] = {}

    for video_name, qa_list in qa_data.items():
        label = VIDEOS[video_name]["label"]
        print(f"\n  评测: {label} ({len(qa_list)} 题) ...")

        dataset_rows = {
            "question":  [r["question"] for r in qa_list],
            "answer":    [r["answer"] for r in qa_list],
            "contexts":  [r["contexts"] for r in qa_list],
        }
        ds = Dataset.from_dict(dataset_rows)

        try:
            score_result = evaluate(ds, metrics=metrics)
            df = score_result.to_pandas()

            # RAGAS 0.2+ 把 answer_relevancy 列重命名为 response_relevancy
            # 做一次兼容性映射，统一用 answer_relevancy 作为内部 key
            col_map = {
                "faithfulness":      "faithfulness",
                "answer_relevancy":  "answer_relevancy"  if "answer_relevancy"  in df.columns else "response_relevancy",
                "context_precision": "context_precision" if "context_precision" in df.columns else "llm_context_precision_without_reference",
            }

            video_scores: dict[str, list] = {
                "faithfulness":      df[col_map["faithfulness"]].tolist(),
                "answer_relevancy":  df[col_map["answer_relevancy"]].tolist(),
                "context_precision": df[col_map["context_precision"]].tolist(),
            }

            # 按题型聚合
            type_map: dict[str, list] = {}
            for i, row in enumerate(qa_list):
                t = row["type"]
                type_map.setdefault(t, [])
                type_map[t].append(i)

            type_avg: dict[str, dict] = {}
            for qtype, idxs in type_map.items():
                type_avg[qtype] = {
                    metric: round(mean(video_scores[metric][i] for i in idxs), 4)
                    for metric in video_scores
                }

            # 全集均值
            overall = {
                metric: round(mean(v for v in vals if v is not None), 4)
                for metric, vals in video_scores.items()
            }

            ragas_scores[video_name] = {
                "label": label,
                "overall": overall,
                "by_type": type_avg,
                "per_question": [
                    {
                        "id": qa_list[i]["id"],
                        "type": qa_list[i]["type"],
                        "faithfulness":      round(float(df[col_map["faithfulness"]][i]),      4),
                        "answer_relevancy":  round(float(df[col_map["answer_relevancy"]][i]),  4),
                        "context_precision": round(float(df[col_map["context_precision"]][i]), 4),
                    }
                    for i in range(len(qa_list))
                ],
            }

            print(f"  整体均值: faithfulness={overall['faithfulness']:.3f}  "
                  f"relevancy={overall['answer_relevancy']:.3f}  "
                  f"context_precision={overall['context_precision']:.3f}")

        except Exception as e:
            print(f"  !! RAGAS 评测失败: {e}")
            ragas_scores[video_name] = {"label": label, "error": str(e)}

    results["ragas"] = ragas_scores


# ── 第三步：手工分类评分占位（生成评分表格供人工填写） ───────────────────────────

def generate_manual_scorecard(qa_data: dict, results: dict):
    """生成供人工打分的 CSV 格式表格（默认分数为 -1 表示待填）。"""
    print("\n[Step 3] 生成手工评分表（需人工填写 accuracy / completeness / timestamp_quality）")

    scorecard_lines = ["video_name,id,type,accuracy,completeness,timestamp_quality,notes"]
    for video_name, qa_list in qa_data.items():
        for row in qa_list:
            # 对于摘要类，timestamp_quality 设为 N/A
            ts_score = "-1" if row["type"] != "summary" else "N/A"
            scorecard_lines.append(
                f"{video_name},{row['id']},{row['type']},-1,-1,{ts_score},"
            )

    csv_path = RESULTS_DIR / "manual_scorecard.csv"
    csv_path.write_text("\n".join(scorecard_lines), encoding="utf-8")
    print(f"  已生成评分表: {csv_path}  （用 Excel 打开，填入 1-5 分后保存）")
    results["manual_scorecard_path"] = str(csv_path)


# ── 第四步：时间戳覆盖率统计 ─────────────────────────────────────────────────────

def analyze_timestamps(qa_data: dict, results: dict):
    """统计回答中含时间戳的比例（按题型分类）。"""
    print("\n[Step 4] 时间戳覆盖率统计 ...")
    ts_stats: dict[str, dict] = {}

    for video_name, qa_list in qa_data.items():
        label = VIDEOS[video_name]["label"]
        by_type: dict[str, dict] = {}
        for row in qa_list:
            t = row["type"]
            by_type.setdefault(t, {"total": 0, "has_ts": 0})
            by_type[t]["total"] += 1
            if row["has_timestamp"]:
                by_type[t]["has_ts"] += 1

        total_all = sum(v["total"] for v in by_type.values())
        has_ts_all = sum(v["has_ts"] for v in by_type.values())
        overall_rate = round(has_ts_all / total_all * 100, 1) if total_all > 0 else 0

        for t, v in by_type.items():
            v["rate_pct"] = round(v["has_ts"] / v["total"] * 100, 1) if v["total"] > 0 else 0

        ts_stats[video_name] = {
            "label": label,
            "overall_rate_pct": overall_rate,
            "by_type": by_type,
        }
        print(f"  {label}: 整体时间戳覆盖率 {overall_rate}%")
        for t, v in by_type.items():
            print(f"    {t}: {v['has_ts']}/{v['total']} = {v['rate_pct']}%")

    results["timestamp_stats"] = ts_stats


# ── 报告生成 ───────────────────────────────────────────────────────────────────

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


def generate_report(results: dict) -> str:
    lines = ["# VideoScholar 问答质量测试报告", ""]
    lines += ["**测试时间：** " + results.get("test_time", ""), ""]
    lines += ["**测试集：** 编译原理 1.1.1（15题） + ResNet 论文精读（15题），共 30 题", ""]
    lines += ["**题型分布：** 事实定位类 5 题 / 概念理解类 5 题 / 全局摘要类 5 题（每视频）", ""]

    # RAGAS
    lines += ["## RAGAS 自动评测结果", ""]
    ragas = results.get("ragas", {})
    if "error" in ragas:
        lines += [f"> 评测跳过：{ragas['error']}", ""]
    else:
        # 全集汇总表
        rows = []
        for vname, vd in ragas.items():
            if "overall" in vd:
                o = vd["overall"]
                rows.append([
                    vd["label"],
                    f"{o.get('faithfulness', 'N/A'):.3f}",
                    f"{o.get('answer_relevancy', 'N/A'):.3f}",
                    f"{o.get('context_precision', 'N/A'):.3f}",
                ])
        if rows:
            lines += ["### 整体评分汇总（0–1，越高越好）", ""]
            lines.append(fmt_table(
                ["视频", "Faithfulness", "Answer Relevancy", "Context Precision"],
                rows,
            ))
            lines.append("")

        # 各视频按题型细分
        for vname, vd in ragas.items():
            if "by_type" not in vd:
                continue
            lines += [f"### {vd['label']} — 按题型细分", ""]
            rows = []
            type_labels = {"fact_locate": "事实定位", "concept": "概念理解", "summary": "全局摘要"}
            for qtype, scores in vd["by_type"].items():
                rows.append([
                    type_labels.get(qtype, qtype),
                    f"{scores.get('faithfulness', 0):.3f}",
                    f"{scores.get('answer_relevancy', 0):.3f}",
                    f"{scores.get('context_precision', 0):.3f}",
                ])
            lines.append(fmt_table(
                ["题型", "Faithfulness", "Answer Relevancy", "Context Precision"],
                rows,
            ))
            lines.append("")

        # 逐题明细
        for vname, vd in ragas.items():
            if "per_question" not in vd:
                continue
            lines += [f"### {vd['label']} — 逐题 RAGAS 评分", ""]
            rows = []
            type_labels = {"fact_locate": "事实定位", "concept": "概念理解", "summary": "摘要"}
            for pq in vd["per_question"]:
                rows.append([
                    pq["id"],
                    type_labels.get(pq["type"], pq["type"]),
                    f"{pq['faithfulness']:.3f}",
                    f"{pq['answer_relevancy']:.3f}",
                    f"{pq['context_precision']:.3f}",
                ])
            lines.append(fmt_table(
                ["题号", "题型", "Faithfulness", "Relevancy", "Context Prec."],
                rows,
            ))
            lines.append("")

    # 时间戳覆盖率
    lines += ["## 时间戳覆盖率分析", ""]
    ts = results.get("timestamp_stats", {})
    rows = []
    type_labels = {"fact_locate": "事实定位", "concept": "概念理解", "summary": "全局摘要"}
    for vname, vd in ts.items():
        for qtype, v in vd.get("by_type", {}).items():
            rows.append([
                vd["label"],
                type_labels.get(qtype, qtype),
                f"{v['has_ts']}/{v['total']}",
                f"{v['rate_pct']}%",
            ])
    if rows:
        lines.append(fmt_table(["视频", "题型", "含时间戳题数", "覆盖率"], rows))
    lines.append("")

    # 手工评分说明
    lines += ["## 手工评分（人工填写）", ""]
    lines += [
        "评分表已生成至 `test_results/manual_scorecard.csv`，",
        "请用 Excel 打开，对 `accuracy`（事实准确性）、`completeness`（完整性）、",
        "`timestamp_quality`（时间戳质量，仅事实定位/概念题）三项",
        "按 1-5 分评分后填入。",
        "",
        "评分标准：",
        "- 5分：完全正确/完整/时间戳精准",
        "- 4分：基本正确，有小瑕疵",
        "- 3分：部分正确或遗漏关键内容",
        "- 2分：有明显错误或严重遗漏",
        "- 1分：完全错误或无关",
        "",
    ]

    # 回答样例展示
    lines += ["## 回答样例（各视频各题型各取 1 例）", ""]
    qa_raw = results.get("qa_raw", {})
    type_labels = {"fact_locate": "事实定位", "concept": "概念理解", "summary": "全局摘要"}
    for vname, qa_list in qa_raw.items():
        label = VIDEOS[vname]["label"]
        lines += [f"### {label}", ""]
        shown = set()
        for row in qa_list:
            if row["type"] in shown:
                continue
            shown.add(row["type"])
            lines += [
                f"**[{row['id']}] {type_labels.get(row['type'], row['type'])}**",
                f"> 问：{row['question']}",
                "",
                f"答：{row['answer'][:600]}{'...' if len(row['answer']) > 600 else ''}",
                f"_含时间戳：{'是' if row['has_timestamp'] else '否'}  "
                f"响应时延：{row['response_time_s']}s_",
                "",
            ]
        lines.append("")

    return "\n".join(lines)


# ── 主入口 ────────────────────────────────────────────────────────────────────

async def main():
    print("=" * 60)
    print("VideoScholar 问答质量测试")
    print("=" * 60)

    json_path = RESULTS_DIR / "quality_results.json"

    # 如果已有 Step 1 的结果，直接加载跳过重新收集（节省约 30 分钟）
    if json_path.exists():
        existing = json.loads(json_path.read_text(encoding="utf-8"))
        if "qa_raw" in existing:
            print(f"  检测到已有结果文件，跳过 Step 1，直接从 {json_path} 加载回答数据")
            results = existing
            results["test_time"] = time.strftime("%Y-%m-%d %H:%M:%S")
            qa_data = existing["qa_raw"]
        else:
            results = {"test_time": time.strftime("%Y-%m-%d %H:%M:%S")}
            qa_data = await collect_answers(results)
    else:
        results = {"test_time": time.strftime("%Y-%m-%d %H:%M:%S")}
        qa_data = await collect_answers(results)

    # Step 2: RAGAS 自动评测
    await run_ragas_eval(qa_data, results)

    # Step 3: 生成手工评分表
    generate_manual_scorecard(qa_data, results)

    # Step 4: 时间戳覆盖率统计
    analyze_timestamps(qa_data, results)

    # 保存 JSON
    json_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n原始数据已保存: {json_path}")

    # 生成报告
    report = generate_report(results)
    report_path = RESULTS_DIR / "quality_report.md"
    report_path.write_text(report, encoding="utf-8")
    print(f"报告已保存: {report_path}")
    print("\n" + "=" * 60)
    print(report[:3000])
    if len(report) > 3000:
        print(f"... [报告较长，完整内容见 {report_path}]")


if __name__ == "__main__":
    asyncio.run(main())
