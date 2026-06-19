# Doubao-Seed-2.0-lite 接入说明

本项目的模型调用采用 OpenAI-compatible 形式，因此火山方舟 Ark 可以直接通过 `base_url + api_key + model` 接入。

## 推荐配置

在项目根目录创建 `.env`：

```env
LLM_BINDING=openai
LLM_MODEL=Doubao-Seed-2.0-lite
VISION_MODEL=Doubao-Seed-2.0-lite
LLM_BINDING_HOST=https://ark.cn-beijing.volces.com/api/v3
LLM_BINDING_API_KEY=<你的 Ark API Key>

EMBEDDING_BINDING=openai
EMBEDDING_MODEL=embedding-3
EMBEDDING_DIM=2048
EMBEDDING_BINDING_HOST=https://open.bigmodel.cn/api/paas/v4
EMBEDDING_BINDING_API_KEY=<你的智谱 API Key>
```

如果方舟控制台要求传 endpoint id，请把 `LLM_MODEL` 和 `VISION_MODEL` 改成对应 endpoint id，而不是展示名。

## 为什么还需要 embedding

Doubao-Seed-2.0-lite 可用于文字问答和图像/视频理解，但不能提供 embedding。本项目的 RAG 检索和知识图谱构建需要向量化能力，因此仍必须单独配置一个 embedding 模型。

代码中已经将 LLM/Vision 与 Embedding 的 `base_url` 和 `api_key` 分离：

- `LLM_*`：用于文本问答、学习笔记、思维导图、关键帧视觉理解。
- `EMBEDDING_*`：用于 RAG 检索、建库和查询。

## 当前视频理解方式

当前流水线不是直接把完整视频传给模型，而是：

```text
视频 -> 字幕转写 -> 关键帧抽取 -> 图文内容列表 -> RAG-Anything 建库 -> 问答
```

因此 `VISION_MODEL` 主要用于理解抽取出的关键帧图片。如果后续要改成直接输入视频，需要另外增加视频文件上传/URL 输入到 Ark 模型的调用逻辑。

## 当前组合

推荐第一版使用：

- 豆包 `Doubao-Seed-2.0-lite`：文字问答、学习笔记、思维导图、关键帧视觉理解。
- 智谱 `embedding-3`：RAG 检索和知识库向量化，默认维度 `2048`。

如果智谱控制台返回模型名或维度不匹配，请只调整 `.env` 中的 `EMBEDDING_MODEL` 和 `EMBEDDING_DIM`。

## 注意事项

- `.env` 是本机密钥文件，已经被 `.gitignore` 忽略，不要提交。
- 如果 API Key 曾经暴露在聊天、截图或公开文档中，建议在方舟控制台轮换。
- 新视频建库和旧知识库查询通常都需要 embedding；只配置豆包 LLM/Vision 还不能完整运行 RAG 查询。
