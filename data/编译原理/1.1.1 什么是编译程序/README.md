# 编译原理 1.1.1 视频问答 Demo

基于 RAG-Anything 的多模态知识图谱，已对「1.1.1 什么是编译程序」视频完成预处理，可直接加载提问。

---

## 环境要求

- Python 3.10 ~ 3.13（**不支持 3.14**，推荐用 conda 创建 3.12 环境）
- 公司 AI Proxy 账号（OpenAI 兼容格式）

---

## 安装步骤

### 1. 创建 Python 环境

```bash
conda create -n raganything python=3.12
conda activate raganything
```

### 2. 安装依赖

```bash
pip install openai python-dotenv lightrag-hku raganything opencv-python imageio-ffmpeg
```

### 3. 配置 API

在 `video_rag_pipeline.py` 同目录下创建 `.env` 文件：

```
LLM_BINDING=openai
LLM_MODEL=gpt-4.1-2025-04-14
VISION_MODEL=gpt-4.1-2025-04-14
LLM_BINDING_HOST=https://aicore-llm-proxy.internal.cfapps.eu12.hana.ondemand.com/v1
LLM_BINDING_API_KEY=<你的 API Key>

EMBEDDING_BINDING=openai
EMBEDDING_MODEL=text-embedding-3-large-1
EMBEDDING_DIM=3072
EMBEDDING_BINDING_HOST=https://aicore-llm-proxy.internal.cfapps.eu12.hana.ondemand.com/v1
EMBEDDING_BINDING_API_KEY=<你的 API Key>
```

> API Key 从 Hyperspace AI 客户端获取，或向团队申请。

---

## 运行

知识图谱已预先构建，直接进入问答模式：

```bash
python video_rag_pipeline.py \
  --name compiler_ch1 \
  --out-dir "编译原理/1.1.1 什么是编译程序" \
  --query-only
```

然后直接输入问题，输入 `exit` 退出。

### 示例问题

- 什么是编译程序？
- 编译程序和解释程序有什么区别？
- 编译过程分为哪几个阶段？

---

## 目录结构说明

```
compiler_ch1_project/
├── .env                           ← 你需要创建这个文件（填入 API Key）
├── video_rag_pipeline.py          ← 运行脚本
├── compiler_ch1.srt               ← 视频字幕（Whisper 提取）
├── compiler_ch1_frames/           ← 视频帧截图（75张，每5秒一帧）
└── rag_storage_compiler_ch1/      ← 知识图谱（预构建，无需重新生成）
```

---

## 如果需要重新构建知识图谱

提供原始视频文件（`1.1.1 什么是编译程序.mp4`），放在 `编译原理/1.1.1 什么是编译程序/` 目录下，然后运行：

```bash
python video_rag_pipeline.py \
  --video "编译原理/1.1.1 什么是编译程序/1.1.1 什么是编译程序.mp4" \
  --name compiler_ch1 \
  --interval 5
```

首次运行会依次执行：Whisper 转录 → 抽帧 → 构建知识图谱（约需 10-20 分钟）。
