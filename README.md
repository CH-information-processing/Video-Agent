# 编译原理视频问答 Demo

基于 RAG-Anything 多模态知识图谱，已对「1.1.1 什么是编译程序」完成预处理，可直接加载提问，无需重新构建知识图谱。

---

## 目录结构

```
compiler_rag_package/
├── README.md                          ← 本文件
├── video_rag_pipeline.py              ← 主运行脚本
├── RAG-Anything/                      ← RAG-Anything 核心代码
│   ├── raganything/
│   ├── requirements.txt
│   ├── setup.py
│   └── env.example                    ← .env 配置模板
└── 编译原理/
    └── 1.1.1 什么是编译程序/
        ├── 1.1.1 什么是编译程序.mp4   ← 原始视频
        ├── compiler_ch1.srt           ← Whisper 提取的字幕
        ├── compiler_ch1_frames/       ← 视频帧截图（75张，每5秒一帧）
        └── rag_storage_compiler_ch1/  ← 预构建的知识图谱（直接可用）
```

---

## 环境要求

- Python 3.10 ~ 3.13（**不支持 3.14**，推荐使用 conda 创建 3.12 环境）
- 公司 AI Proxy 账号（OpenAI 兼容格式）

---

## 安装步骤

### 第一步：创建 Python 3.12 环境

```bash
conda create -n raganything python=3.12
conda activate raganything
```

### 第二步：安装 RAG-Anything 及依赖

在 `compiler_rag_package/` 目录下执行：

```bash
pip install -e RAG-Anything/
pip install openai python-dotenv opencv-python imageio-ffmpeg
```

### 第三步：配置 API

在 `compiler_rag_package/` 目录下创建 `.env` 文件（参考 `RAG-Anything/env.example`）：

```env
LLM_MODEL=gpt-4.1-2025-04-14
VISION_MODEL=gpt-4.1-2025-04-14
LLM_BINDING_HOST=https://aicore-llm-proxy.internal.cfapps.eu12.hana.ondemand.com/v1
LLM_BINDING_API_KEY=<你的 API Key>

EMBEDDING_MODEL=text-embedding-3-large-1
EMBEDDING_DIM=3072
EMBEDDING_BINDING_HOST=https://aicore-llm-proxy.internal.cfapps.eu12.hana.ondemand.com/v1
EMBEDDING_BINDING_API_KEY=<你的 API Key>
```

> API Key 从 Hyperspace AI 客户端获取。

---

## 运行问答

知识图谱已预先构建，在 `compiler_rag_package/` 目录下直接运行：

```bash
python video_rag_pipeline.py \
  --video "编译原理/1.1.1 什么是编译程序/1.1.1 什么是编译程序.mp4" \
  --name compiler_ch1 \
  --query-only
```

输入问题后回车，输入 `exit` 退出。

### 示例问题

- 什么是编译程序？
- 编译程序和解释程序有什么区别？
- 编译过程分为哪几个阶段？
- 什么是翻译程序？

---

## 添加更多视频

如需对新的编译原理视频建立知识图谱，将视频放入对应目录后运行：

```bash
python video_rag_pipeline.py \
  --video "编译原理/<章节目录>/<视频文件名>.mp4" \
  --name <章节名称> \
  --interval 5
```

脚本会自动完成：Whisper 语音转录 → 抽帧 → 构建知识图谱，结果保存在视频同目录下。

---

## 常见问题

**Q: 出现 `No module named 'raganything'` 错误**
A: 确认在 `compiler_rag_package/` 目录下运行了 `pip install -e RAG-Anything/`

**Q: 出现 API Key 相关错误**
A: 检查 `.env` 文件是否在 `compiler_rag_package/` 目录下，且 Key 填写正确

**Q: 出现 Python 版本相关报错**
A: 确认使用的是 Python 3.10~3.13，运行 `python --version` 检查
