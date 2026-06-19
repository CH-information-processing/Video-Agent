# VideoScholar 前端功能整改指导

本文基于当前代码状态编写，重点检查范围：

- `web/index.html`
- `web/app.js`
- `web/style.css`
- `web_app.py`
- `README_frontend.md`

当前运行前端是 `Python 标准库 http.server + 原生 HTML/CSS/JS`，不是 `Frontend-figma参考代码` 下的 React/Vite 项目。`Frontend-figma参考代码` 目前只适合作为视觉参考，不参与实际运行。

## 1. 当前整体结论

前端不是完全没接功能。主要业务按钮已经接到了后端接口：

- 加载 Demo：`GET /api/demo`
- 上传视频：`POST /api/upload_video`
- 检测缓存：`POST /api/check_cache`
- 处理视频：`POST /api/process_video`
- 加载知识库：`POST /api/load_rag`
- AI 问答：`POST /api/ask`
- 生成学习笔记：`POST /api/generate_notes`
- 生成知识图谱：`POST /api/generate_mindmap`

但目前仍有明显“半成品体验”：

- 顶部 `Study / Knowledge` 导航只是静态按钮，没有页面切换逻辑。
- 右侧“知识图谱”只显示 Mermaid 文本，没有渲染成图。
- 学习笔记接口返回 Markdown，但前端直接用 `textContent` 显示，无法正常排版。
- 处理视频是一个长同步请求，前端期间只显示一句“正在处理”，没有阶段进度、轮询、取消、失败恢复。
- 错误处理很薄，`fetch` 网络失败或非 JSON 响应会直接抛错，界面不会给出友好提示。
- 知识库名称输入框和处理流程没有完全打通，用户改名后必须先点“检测缓存”，否则“开始处理视频”仍使用旧名称。
- 很多按钮禁用后没有解释原因，用户容易误以为按钮坏了。
- 上传视频会把整个文件读入内存，适合小 Demo，不适合大视频。

## 2. 功能清单与现状

| 区域 | 控件 | 当前状态 | 问题 |
|---|---|---|---|
| 左侧栏 | 加载编译原理 Demo | 已绑定 | 基本可用 |
| 左侧栏 | 选择本地视频副本 | 已绑定 | 上传走内存解析，大文件风险高 |
| 左侧栏 | 知识库名称 | 半成品 | 改名只在“检测缓存”时提交，处理/加载前不会自动同步 |
| 左侧栏 | 检测缓存 | 已绑定 | 只更新状态，无详细路径和修复建议 |
| 左侧栏 | 开始处理视频 | 已绑定 | 长任务无实时进度，无法取消，参数固定为 `interval: 5` |
| 左侧栏 | 加载知识库 | 已绑定 | 失败原因只在日志里，不够显眼 |
| 顶部栏 | Study / Knowledge | 未完成 | 没有 `id`、`data-*` 或事件监听，是纯视觉占位 |
| 顶部栏 | 刷新状态 | 已绑定 | 忙碌时会被禁用，长任务期间不能主动刷新 |
| 主区 | 三个 action card | 已绑定 | 与左侧按钮重复，但状态解释不足 |
| 右侧栏 | Study Notes / Knowledge Graph | 已绑定 | 只切右侧面板，不影响主工作区 |
| 右侧栏 | 生成学习笔记 | 已绑定 | Markdown 未渲染，输出不美观 |
| 右侧栏 | 生成知识图谱 | 已绑定 | Mermaid 未渲染，仅显示代码 |
| 右下角 | AI 悬浮助手 | 已绑定 | 未加载知识库时可打开，但输入被禁用，缺少明确引导 |

## 3. 优先级建议

### P0：先修“看起来像坏了”的功能

1. 给顶部 `Study / Knowledge` 加真实切换

当前代码位置：

- `web/index.html` 第 63-66 行：顶部两个 tab 没有 `id` 或 `data-main-tab`
- `web/app.js` 第 316-324 行：只绑定了右侧栏 `data-study-tab`

建议：

- 给顶部按钮加 `data-main-tab="study"` 和 `data-main-tab="knowledge"`。
- 新增两个主内容面板。
- `Study` 显示视频播放器、操作卡片、事件日志。
- `Knowledge` 显示缓存详情、知识库路径、字幕/帧/Graph 文件状态、可用操作。

验收标准：

- 点击 `Study` 和 `Knowledge`，主区域内容确实变化。
- 当前激活 tab 样式正确。
- 切换不会清空视频、聊天、缓存状态。

2. 改善按钮禁用原因

当前代码位置：

- `web/app.js` 第 115-135 行：统一计算按钮 disabled，但没有原因说明。

建议：

- 在禁用按钮旁边或 tooltip 中显示原因。
- 常见原因包括：
  - 未选择视频
  - `.env` 未配置
  - 缓存不完整
  - 知识库未加载
  - 正在处理，请稍候

验收标准：

- 用户看到灰色按钮时能知道下一步该做什么。
- `.env` 缺失时，界面明确提示缺少哪些 key。

3. 修复知识库名称同步

当前问题：

- `checkCache()` 会提交 `kbName`。
- `processVideo()` 和 `loadRag()` 不提交 `kbName`。
- 如果用户修改名称后直接点“开始处理视频”，后端仍使用旧的 `STATE.current_name`。

建议：

- 方案 A：`processVideo()` 和 `loadRag()` 都带上 `{ name: elements.kbName.value }`。
- 方案 B：后端新增 `sync_current_name(payload)`，在 `/api/check_cache`、`/api/process_video`、`/api/load_rag` 三个接口统一调用。

验收标准：

- 改知识库名后，不点“检测缓存”，直接处理或加载，也使用新名称。
- 页面刷新后显示的名称与后端状态一致。

### P1：让 AI 结果真正可读

4. 渲染 Markdown 学习笔记

当前代码位置：

- `web/app.js` 第 265-274 行：`notesOutput.textContent = ...`

问题：

- 模型返回 Markdown，但 `textContent` 会把标题、列表、代码块都当普通文本。

建议：

- 如果仍坚持零依赖，可以写一个小型安全 Markdown 渲染器，只支持标题、列表、段落、代码块。
- 如果允许引入前端本地库，可以使用 `marked` + DOMPurify，但这会改变“零依赖”定位。
- 折中方案：后端返回纯文本结构化 JSON，前端按字段渲染。

验收标准：

- `#`、`##`、列表、代码块可以正常显示。
- 输出不会通过 `innerHTML` 直接注入未清洗内容。

5. Mermaid 知识图谱可视化

当前代码位置：

- `web/index.html` 第 131-135 行：只放了 `<pre>`
- `web/app.js` 第 277-286 行：只写入 Mermaid 源码

建议：

- 增加“源码 / 图形”切换。
- 图形模式用 Mermaid 渲染。
- 如果不想联网，下载 Mermaid 静态文件到 `web/vendor/mermaid.min.js`，由本地服务加载。
- 如果继续零依赖，至少增加“复制 Mermaid 代码”和“下载 `.mmd` 文件”。

验收标准：

- 用户能直接看到图，而不是只看到代码。
- Mermaid 生成失败时显示错误和原始源码。

6. 聊天区补充状态引导

当前问题：

- 未加载知识库时，聊天可打开但输入禁用。
- 用户只能从默认欢迎语推断需要先加载知识库。

建议：

- 在聊天输入区上方加状态条：
  - 未选视频：请先加载或上传视频
  - 缓存缺失：请先处理视频
  - 缓存完整未加载：请加载知识库
  - 已加载：可以提问
- 加一个“加载知识库”快捷按钮，条件满足时可直接触发 `loadRag()`。

验收标准：

- 用户不需要离开聊天窗口也能知道下一步。

### P2：长任务体验和可靠性

7. 把视频处理改成可轮询任务

当前代码位置：

- `web/app.js` 第 213-224 行：发起 `/api/process_video` 后等待整个请求完成。
- `web_app.py` 第 311-351 行：`process_current_video()` 同步执行完整流水线。

问题：

- 处理可能很久，前端只能等待。
- 虽然后端更新了 `STATE.processing_status`，但请求未结束时前端没有轮询。
- “刷新状态”在 busy 时被禁用，也无法查看后端状态。

建议：

- 新增任务状态字段：
  - `job_id`
  - `status`: `queued | running | success | failed | cancelled`
  - `stage`: `transcribing | extracting_frames | building_graph`
  - `progress_message`
  - `started_at`
  - `finished_at`
  - `error`
- `/api/process_video` 只创建后台线程并立即返回。
- `/api/status` 返回当前任务状态。
- 前端在处理期间每 1-2 秒轮询 `/api/status`。
- 增加“取消处理”按钮。

验收标准：

- 点“开始处理视频”后页面不会长时间卡住。
- 阶段状态能实时变化。
- 失败时保留错误信息和可重试入口。

8. 强化前端 API 错误处理

当前代码位置：

- `web/app.js` 第 36-48 行：`apiGet` / `apiPost` 没有 `response.ok` 判断，也没有 `try/catch` 包装 JSON 解析。

建议：

- 封装统一错误结构：

```js
async function readApiResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = { success: false, message: `接口返回非 JSON：HTTP ${response.status}` };
  }
  if (!response.ok && payload.success !== false) {
    payload.success = false;
    payload.message = payload.message || `请求失败：HTTP ${response.status}`;
  }
  return payload;
}
```

验收标准：

- 后端 400/500、网络断开、返回 HTML 错误页时，前端都能显示可理解错误。
- 控制台不出现未捕获异常。

9. 上传视频改成更稳的实现

当前代码位置：

- `web_app.py` 第 116-139 行：手写 multipart 解析。
- `web_app.py` 第 470-494 行：把上传内容整体读入内存。

问题：

- 大视频容易占用大量内存。
- 手写 multipart 容易漏边界情况。

建议：

- 短期：限制上传大小，例如 500MB，并在前端显示限制。
- 中期：用标准库 `cgi.FieldStorage` 已不推荐长期依赖，但比手写略稳；更推荐后续上轻量框架。
- 长期：若允许依赖，迁移到 FastAPI/Starlette 处理上传和流式写入。

验收标准：

- 超过限制时前端明确提示。
- 上传失败不会改变当前视频状态。

### P3：补齐产品体验

10. 增加参数设置

当前写死参数：

- `processVideo()` 固定提交 `{ interval: 5 }`
- 后端问答固定 `mode="hybrid"`

建议增加：

- 抽帧/合并间隔 `interval`
- 查询模式 `hybrid / local / global / naive`
- 是否自动加载知识库
- 是否处理完成后自动生成笔记

验收标准：

- 参数有默认值。
- 用户改动参数后，日志和请求体可追踪。

11. 增加操作历史日志

当前代码位置：

- `web/app.js` 第 50-53 行：日志只保留一行。

建议：

- 改成日志列表，保留最近 50 条。
- 错误日志高亮。
- 日志项包含时间、操作、结果。

验收标准：

- 连续操作后能回看发生了什么。

12. 增加复制和下载

建议给以下输出加按钮：

- 复制学习笔记
- 下载学习笔记 `.md`
- 复制 Mermaid
- 下载 Mermaid `.mmd`
- 复制 AI 回答

验收标准：

- 所有生成内容都能方便带走。

## 4. 建议改造顺序

推荐按下面顺序推进：

1. 修 `kbName` 同步问题。
2. 给顶部 `Study / Knowledge` 做真实切换。
3. 增加禁用原因提示和更明确的空状态。
4. 改造 API 错误处理。
5. 渲染 Markdown 学习笔记。
6. 渲染或至少增强 Mermaid 知识图谱。
7. 把视频处理改成后台任务 + 轮询。
8. 优化上传大文件。
9. 增加参数设置、复制、下载、历史日志。

## 5. 建议的文件改动范围

### `web/index.html`

需要改：

- 顶部 tab 加 `data-main-tab`
- 主内容拆成 `studyPanel` / `knowledgePanel`
- 添加禁用原因提示容器
- 添加任务进度区域
- 学习笔记和知识图谱区域增加工具栏按钮

### `web/app.js`

需要改：

- 增强 `apiGet` / `apiPost`
- 增加主 tab 状态和切换
- 把 `kbName` 同步到处理/加载接口
- 增加按钮禁用原因
- 增加 Markdown 渲染或结构化渲染
- 增加 Mermaid 渲染或复制下载
- 增加轮询任务状态
- 日志从单行改为列表

### `web/style.css`

需要改：

- 主 tab 面板显示/隐藏样式
- 状态提示、错误提示、任务进度样式
- 输出工具栏样式
- 日志列表样式
- 移动端下左右侧栏遮罩和层级优化

### `web_app.py`

需要改：

- `/api/process_video` 支持 `name`
- `/api/load_rag` 支持 `name`
- 抽出统一的名称同步逻辑
- 长任务后台化
- `/api/status` 返回任务状态
- 上传大小限制和更清晰的错误信息

## 6. 最小可交付版本定义

如果只想先做一轮小修，建议把目标定为：

- 所有可见按钮都要么能工作，要么显示明确不可用原因。
- 顶部 `Study / Knowledge` 不再是空按钮。
- 改知识库名称后，处理/加载都使用新名称。
- 学习笔记至少能按 Markdown 基本排版显示。
- 知识图谱至少能一键复制 Mermaid 代码。
- API 请求失败不会让页面静默或控制台报未捕获异常。

完成这 6 点后，前端就会从“Demo 壳子”变成“可以继续迭代的本地工具”。

## 7. 已做的静态验证

本次检查已确认：

- `python -m py_compile web_app.py` 通过。
- `node --check web/app.js` 通过。
- `README_frontend.md` 描述的页面能力与当前接口大体一致，但体验层还有上面列出的缺口。

