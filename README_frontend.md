# VideoScholar 前端说明

本前端是现有 `video_rag_pipeline.py` 命令行流程之外的本地可视化入口，不会改变原来的命令行运行方式。

## 技术路线

正式运行前端使用：

```text
Python 标准库 http.server + HTML + CSS + JavaScript
```

不需要安装：

```text
Streamlit / Gradio / Vue / React / Node / npm
```

`Frontend/` 目录是 Stitch 导出的参考代码，只用于视觉和布局参考，不作为运行依赖。

## 启动

在项目目录下执行：

```bash
python web_app.py
```

然后打开：

```text
http://127.0.0.1:7860/
```

## 页面能力

- 默认加载编译原理 Demo 视频
- 上传本地视频副本
- 播放当前视频
- 检测字幕、关键帧和 RAG 知识库缓存
- 调用现有流水线处理视频
- 加载当前视频知识库
- 通过右下角悬浮 AI 助手进行视频问答
- 生成学习笔记
- 生成 Mermaid 学习思维导图
- 左右侧栏可收起和展开

## API Key

不配置 `.env` 时，页面仍可打开并播放视频，但以下能力不可用：

- 处理新视频
- 加载知识库并问答
- 生成学习笔记
- 生成知识图谱

请在 `.env` 中填入真实 API Key 后使用模型相关功能。

## 缓存规则

前端会优先检测视频同目录下是否存在：

```text
<name>.srt
<name>_frames/
rag_storage_<name>/graph_chunk_entity_relation.graphml
```

如果缓存完整，可以直接加载知识库并问答；如果缓存缺失，需要点击“开始处理视频”。

## 保留命令行入口

原命令仍然可用：

```bash
python video_rag_pipeline.py \
  --video "编译原理/1.1.1 什么是编译程序/1.1.1 什么是编译程序.mp4" \
  --name compiler_ch1 \
  --query-only
```

