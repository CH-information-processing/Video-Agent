const state = {
  video: null,
  env: { ready: false, missing: [], placeholders: [] },
  task: null,
  leftCollapsed: false,
  rightCollapsed: false,
  chatOpen: false,
  busy: false,
  mainTab: "study",
  mindmapView: "visual",
  logs: [],
  notesRaw: "",
  mindmapRaw: `graph TD
  A[视频主题] --> B[章节]
  A --> C[核心概念]`,
  pollTimer: null,
  askScope: "current",
  catalog: [],
  selectedVideos: [],
};

const MAX_CLIENT_UPLOAD_BYTES = 500 * 1024 * 1024;
const $ = (id) => document.getElementById(id);

const elements = {
  shell: $("appShell"),
  videoTitle: $("videoTitle"),
  mainTitle: $("mainTitle"),
  mainSubtitle: $("mainSubtitle"),
  kbName: $("kbName"),
  srtStatus: $("srtStatus"),
  frameStatus: $("frameStatus"),
  ragStatus: $("ragStatus"),
  processStatus: $("processStatus"),
  envPill: $("envPill"),
  envDetails: $("envDetails"),
  cacheDetails: $("cacheDetails"),
  nextSteps: $("nextSteps"),
  workflowNotice: $("workflowNotice"),
  workflowTitle: $("workflowTitle"),
  workflowMessage: $("workflowMessage"),
  leftActionHint: $("leftActionHint"),
  taskPanel: $("taskPanel"),
  taskTitle: $("taskTitle"),
  taskMessage: $("taskMessage"),
  taskStage: $("taskStage"),
  taskElapsed: $("taskElapsed"),
  cancelTaskBtn: $("cancelTaskBtn"),
  eventLog: $("eventLog"),
  playerCard: document.querySelector(".player-card"),
  videoPlayer: $("videoPlayer"),
  intervalInput: $("intervalInput"),
  queryMode: $("queryMode"),
  chatFab: $("chatFab"),
  floatingChat: $("floatingChat"),
  chatBackdrop: $("chatBackdrop"),
  chatForm: $("chatForm"),
  chatInput: $("chatInput"),
  chatStatus: $("chatStatus"),
  chatLoadRagBtn: $("chatLoadRagBtn"),
  chatMessages: $("chatMessages"),
  askScope: $("askScope"),
  videoPicker: $("videoPicker"),
  notesOutput: $("notesOutput"),
  mindmapOutput: $("mindmapOutput"),
  mindmapVisual: $("mindmapVisual"),
};

function selectedVideo() {
  return state.video || {};
}

function selectedCache() {
  return selectedVideo().cache || {};
}

function isTaskRunning() {
  return state.task && ["queued", "running", "cancelling"].includes(state.task.status);
}

function currentKbName() {
  return elements.kbName.value.trim() || selectedVideo().name || "video";
}

async function readApiResponse(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = {
      success: false,
      message: `接口返回非 JSON：HTTP ${response.status}`,
      data: {},
    };
  }
  if (!response.ok && payload.success !== false) {
    payload.success = false;
    payload.message = payload.message || `请求失败：HTTP ${response.status}`;
  }
  payload.data = payload.data || {};
  payload.message = payload.message || "请求完成。";
  return payload;
}

async function apiGet(path) {
  try {
    return await readApiResponse(await fetch(path));
  } catch (error) {
    return { success: false, message: `网络请求失败：${error.message}`, data: {} };
  }
}

async function apiPost(path, payload = {}) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await readApiResponse(response);
  } catch (error) {
    return { success: false, message: `网络请求失败：${error.message}`, data: {} };
  }
}

function log(message, type = "info") {
  const time = new Date().toLocaleTimeString();
  state.logs.unshift({ time, message, type });
  state.logs = state.logs.slice(0, 50);
  renderLog();
}

function renderLog() {
  elements.eventLog.replaceChildren();
  if (state.logs.length === 0) {
    elements.eventLog.textContent = "等待操作。";
    return;
  }
  state.logs.forEach((item) => {
    const row = document.createElement("div");
    row.className = `log-entry ${item.type}`;
    const time = document.createElement("span");
    time.textContent = item.time;
    const message = document.createElement("p");
    message.textContent = item.message;
    row.append(time, message);
    elements.eventLog.appendChild(row);
  });
}

function setBusy(isBusy, message = "") {
  state.busy = isBusy;
  document.body.classList.toggle("loading", isBusy);
  if (message) log(message);
  render();
}

function setText(element, value) {
  element.textContent = value || "-";
}

function setButton(id, disabled, reason = "") {
  const button = $(id);
  if (!button) return;
  button.disabled = Boolean(disabled);
  button.title = reason || "";
}

function renderEnv() {
  const missing = [...(state.env.missing || []), ...(state.env.placeholders || [])];
  if (state.env.ready) {
    elements.envPill.textContent = ".env 已就绪";
    elements.envPill.title = "模型相关功能可用";
    elements.envPill.classList.remove("bad");
    return;
  }
  elements.envPill.textContent = missing.length ? "API 未配置" : "API 状态未知";
  elements.envPill.title = missing.length ? `待处理：${missing.join(", ")}` : "未获取到配置状态";
  elements.envPill.classList.add("bad");
}

function renderVideo() {
  const video = selectedVideo();
  const cache = selectedCache();
  const selected = Boolean(video.selected);

  elements.videoTitle.textContent = selected ? video.title : "未选择视频";
  elements.mainTitle.textContent = selected ? video.title : "编译原理视频学习助手";
  elements.mainSubtitle.textContent = selected
    ? `知识库名称：${video.name || "-"}`
    : "播放视频，加载知识库，然后通过右下角 AI 助手围绕当前视频提问。";

  if (document.activeElement !== elements.kbName) {
    elements.kbName.value = video.name || elements.kbName.value || "compiler_ch1";
  }
  setText(elements.srtStatus, cache.has_srt ? "已存在" : "缺失");
  setText(elements.frameStatus, cache.has_frames ? `${cache.frame_count} 张` : "缺失");
  setText(elements.ragStatus, cache.has_graph ? "已存在" : "缺失");
  setText(elements.processStatus, video.processing_status || "-");

  if (selected && video.video_url) {
    const currentSrc = elements.videoPlayer.getAttribute("src") || "";
    const nextSrc = `${video.video_url}?t=${encodeURIComponent(video.path || video.title || "")}`;
    if (currentSrc !== nextSrc) {
      elements.videoPlayer.setAttribute("src", nextSrc);
      elements.videoPlayer.load();
    }
    elements.playerCard.classList.add("has-video");
  } else {
    elements.videoPlayer.removeAttribute("src");
    elements.playerCard.classList.remove("has-video");
  }
}

function capabilityState() {
  const video = selectedVideo();
  const cache = selectedCache();
  const selected = Boolean(video.selected);
  const envReady = Boolean(state.env.ready);
  const cacheReady = Boolean(cache.ready);
  const ragLoaded = Boolean(video.rag_loaded);
  const taskRunning = isTaskRunning();

  const checkReason = !selected ? "请先加载 Demo 或上传视频" : "";
  const processReason = !selected
    ? "请先加载 Demo 或上传视频"
    : !envReady
      ? "请先配置 .env 中的模型 API"
      : cacheReady
        ? "缓存已完整，直接加载知识库"
      : taskRunning
        ? "已有视频处理任务正在运行"
        : "";
  const loadReason = !selected
    ? "请先加载 Demo 或上传视频"
    : !envReady
      ? "请先配置 .env 中的模型 API"
      : !cacheReady
        ? "缓存不完整，请先处理视频"
        : "";
  const aiReason = !ragLoaded ? "请先加载知识库" : "";

  return {
    selected,
    envReady,
    cacheReady,
    ragLoaded,
    taskRunning,
    checkReason,
    processReason,
    loadReason,
    aiReason,
  };
}

function chatReason() {
  const caps = capabilityState();
  if (state.askScope === "current") return caps.aiReason;
  if (!caps.envReady) return "请先配置 .env 中的模型 API";
  if (state.catalog.length === 0) return "目录为空，请先处理至少一个视频";
  if (state.askScope === "select" && state.selectedVideos.length === 0) return "请至少选择一个视频";
  return "";
}

async function loadCatalog() {
  const result = await apiGet("/api/catalog");
  if (!result.success) return;
  state.catalog = result.data.videos || [];
  const names = new Set(state.catalog.map((video) => video.name));
  state.selectedVideos = state.selectedVideos.filter((name) => names.has(name));
  renderVideoPicker();
  renderButtons();
}

function renderVideoPicker() {
  const picker = elements.videoPicker;
  picker.hidden = state.askScope !== "select";
  if (state.askScope !== "select") return;
  picker.replaceChildren();
  if (state.catalog.length === 0) {
    const empty = document.createElement("p");
    empty.className = "picker-empty";
    empty.textContent = "目录为空，请先处理至少一个视频。";
    picker.appendChild(empty);
    return;
  }
  state.catalog.forEach((video) => {
    const row = document.createElement("label");
    row.className = "picker-row";
    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = video.name;
    box.checked = state.selectedVideos.includes(video.name);
    box.addEventListener("change", () => {
      if (box.checked && !state.selectedVideos.includes(video.name)) {
        state.selectedVideos.push(video.name);
      } else if (!box.checked) {
        state.selectedVideos = state.selectedVideos.filter((name) => name !== video.name);
      }
      renderButtons();
    });
    const text = document.createElement("span");
    text.textContent = video.title || video.name;
    text.title = video.summary || "";
    row.append(box, text);
    picker.appendChild(row);
  });
}

function renderButtons() {
  const caps = capabilityState();
  const busy = state.busy;

  setButton("checkCacheBtn", busy || Boolean(caps.checkReason), caps.checkReason);
  setButton("actionCheck", busy || Boolean(caps.checkReason), caps.checkReason);
  setButton("processBtn", busy || Boolean(caps.processReason), caps.processReason);
  setButton("actionProcess", busy || Boolean(caps.processReason), caps.processReason);
  setButton("loadRagBtn", busy || Boolean(caps.loadReason), caps.loadReason);
  setButton("actionLoad", busy || Boolean(caps.loadReason), caps.loadReason);
  setButton("notesBtn", busy || Boolean(caps.aiReason), caps.aiReason);
  setButton("mindmapBtn", busy || Boolean(caps.aiReason), caps.aiReason);
  setButton("chatLoadRagBtn", busy || Boolean(caps.loadReason), caps.loadReason);

  const chatBlock = chatReason();
  elements.chatInput.disabled = busy || Boolean(chatBlock);
  elements.chatForm.querySelector("button").disabled = busy || Boolean(chatBlock);
  elements.cancelTaskBtn.hidden = !caps.taskRunning;
  elements.cancelTaskBtn.disabled = state.task?.status === "cancelling";

  $("actionCheckHint").textContent = caps.checkReason || "检测字幕、关键帧和知识库";
  $("actionLoadHint").textContent = caps.loadReason || (caps.ragLoaded ? "知识库已加载" : "加载当前视频 RAG");
  $("actionProcessHint").textContent = caps.processReason || "转写、抽帧、建库";
  elements.leftActionHint.textContent =
    caps.loadReason || caps.processReason || caps.checkReason || "当前操作可用。";
  const scopeReadyMsg =
    state.askScope === "current"
      ? "知识库已加载，可以围绕当前视频提问。"
      : state.askScope === "auto"
        ? "将自动选择相关视频回答（不必先加载知识库）。"
        : "将只参考你勾选的视频回答。";
  elements.chatStatus.textContent = chatBlock || scopeReadyMsg;
  elements.chatLoadRagBtn.hidden =
    state.askScope !== "current" || Boolean(caps.aiReason && caps.loadReason) || caps.ragLoaded;
}

function renderLayout() {
  elements.shell.classList.toggle("left-collapsed", state.leftCollapsed);
  elements.shell.classList.toggle("right-collapsed", state.rightCollapsed);
  elements.floatingChat.classList.toggle("open", state.chatOpen);
  elements.chatBackdrop.classList.toggle("open", state.chatOpen);
  elements.floatingChat.setAttribute("aria-hidden", String(!state.chatOpen));

  document.querySelectorAll("[data-main-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mainTab === state.mainTab);
  });
  document.querySelectorAll(".main-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${state.mainTab}Panel`);
  });
  document.querySelectorAll("[data-mindmap-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mindmapView === state.mindmapView);
  });
  elements.mindmapVisual.classList.toggle("hidden", state.mindmapView !== "visual");
  elements.mindmapOutput.classList.toggle("hidden", state.mindmapView !== "source");
}

function renderWorkflow() {
  const caps = capabilityState();
  const cache = selectedCache();
  if (!caps.selected) {
    elements.workflowTitle.textContent = "还没有选择视频";
    elements.workflowMessage.textContent = "先加载 Demo，或上传一个本地视频副本。";
    elements.workflowNotice.className = "notice-panel warn";
  } else if (!caps.envReady) {
    elements.workflowTitle.textContent = "模型 API 尚未配置";
    elements.workflowMessage.textContent = "视频可以播放，缓存也可以检测；处理、加载知识库和 AI 功能需要补齐 .env。";
    elements.workflowNotice.className = "notice-panel warn";
  } else if (!cache.ready) {
    elements.workflowTitle.textContent = "缓存还不完整";
    elements.workflowMessage.textContent = "请先处理视频，生成字幕、关键帧和 RAG 知识库。";
    elements.workflowNotice.className = "notice-panel warn";
  } else if (!caps.ragLoaded) {
    elements.workflowTitle.textContent = "知识库可加载";
    elements.workflowMessage.textContent = "缓存完整，可以点击“加载知识库”进入问答和生成学习材料。";
    elements.workflowNotice.className = "notice-panel";
  } else {
    elements.workflowTitle.textContent = "学习工作台已就绪";
    elements.workflowMessage.textContent = "现在可以问答、生成笔记、生成知识图谱。";
    elements.workflowNotice.className = "notice-panel ok";
  }
}

function renderTask() {
  const task = state.task;
  const visible = Boolean(task && task.status && task.status !== "idle");
  elements.taskPanel.hidden = !visible;
  if (!visible) return;
  const statusMap = {
    queued: "排队中",
    running: "处理中",
    cancelling: "正在取消",
    success: "处理完成",
    failed: "处理失败",
    cancelled: "已取消",
  };
  elements.taskTitle.textContent = statusMap[task.status] || task.status;
  elements.taskMessage.textContent = task.message || "-";
  elements.taskStage.textContent = task.stage || "-";
  elements.taskElapsed.textContent = task.elapsed_seconds ? `${task.elapsed_seconds}s` : "-";
  elements.taskPanel.classList.toggle("bad", task.status === "failed");
  elements.taskPanel.classList.toggle("ok", task.status === "success");
}

function createDetail(label, value, options = {}) {
  const row = document.createElement("div");
  row.className = "detail-row";
  const key = document.createElement("span");
  key.textContent = label;
  const content = document.createElement("code");
  content.textContent = value || "-";
  row.append(key, content);
  if (options.copy && value) {
    const button = document.createElement("button");
    button.className = "tiny-button";
    button.type = "button";
    button.textContent = "复制";
    button.addEventListener("click", () => copyText(value, `${label}已复制。`));
    row.appendChild(button);
  }
  return row;
}

function renderKnowledge() {
  const cache = selectedCache();
  const missing = state.env.missing || [];
  const placeholders = state.env.placeholders || [];
  elements.envDetails.replaceChildren(
    createDetail("API 状态", state.env.ready ? "已就绪" : "未就绪"),
    createDetail("缺少变量", missing.length ? missing.join(", ") : "无"),
    createDetail("占位变量", placeholders.length ? placeholders.join(", ") : "无"),
  );

  elements.cacheDetails.replaceChildren(
    createDetail("视频路径", selectedVideo().path || "-", { copy: true }),
    createDetail("输出目录", cache.out_dir || "-", { copy: true }),
    createDetail("字幕文件", cache.srt_path || "-", { copy: true }),
    createDetail("关键帧目录", cache.frames_dir || "-", { copy: true }),
    createDetail("知识库目录", cache.rag_dir || "-", { copy: true }),
    createDetail("Graph 文件", cache.graph_file || "-", { copy: true }),
  );

  elements.nextSteps.replaceChildren();
  getNextSteps().forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    elements.nextSteps.appendChild(item);
  });
}

function getNextSteps() {
  const caps = capabilityState();
  const steps = [];
  if (!caps.selected) steps.push("加载 Demo 视频，或上传本地视频副本。");
  if (caps.selected) steps.push("确认知识库名称；如果需要改名，直接修改输入框即可。");
  if (!caps.envReady) steps.push("补齐 .env 中的 LLM 和 Embedding 配置。");
  if (caps.envReady && !caps.cacheReady) steps.push("点击“开始处理视频”，生成字幕、关键帧和知识库。");
  if (caps.cacheReady && !caps.ragLoaded) steps.push("点击“加载知识库”，启用问答和学习材料生成。");
  if (caps.ragLoaded) steps.push("使用 AI 助手提问，或生成学习笔记与知识图谱。");
  return steps;
}

function render() {
  renderEnv();
  renderVideo();
  renderWorkflow();
  renderTask();
  renderKnowledge();
  renderMindmap();
  renderLayout();
  renderButtons();
}

async function refreshStatus(options = {}) {
  const result = await apiGet("/api/status");
  if (!result.success) {
    log(result.message, "error");
    return result;
  }
  state.env = result.data.env || state.env;
  state.video = result.data.video || state.video;
  state.task = result.data.task || state.task;
  render();
  if (isTaskRunning()) startPolling();
  if (!isTaskRunning() && options.fromPoll) {
    stopPolling();
    loadCatalog();   // a finished processing task may have added a new video
  }
  return result;
}

async function loadDemo() {
  setBusy(true, "正在加载 Demo 视频...");
  try {
    const result = await apiGet("/api/demo");
    if (result.success) {
      state.video = result.data;
      log(result.message);
    } else {
      log(result.message, "error");
    }
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function uploadVideo(file) {
  if (!file) return;
  if (file.size > MAX_CLIENT_UPLOAD_BYTES) {
    log("视频超过 500MB，当前版本暂不上传这么大的文件。", "error");
    $("videoUpload").value = "";
    return;
  }
  setBusy(true, "正在上传视频副本...");
  try {
    const form = new FormData();
    form.append("video", file);
    const result = await readApiResponse(await fetch("/api/upload_video", { method: "POST", body: form }));
    if (result.success) {
      state.video = result.data;
      log(result.message);
    } else {
      log(result.message, "error");
    }
  } catch (error) {
    log(`上传失败：${error.message}`, "error");
  } finally {
    $("videoUpload").value = "";
    setBusy(false);
    await refreshStatus();
  }
}

async function checkCache() {
  setBusy(true, "正在检测缓存...");
  try {
    const result = await apiPost("/api/check_cache", { name: currentKbName() });
    if (result.success) {
      state.video = result.data;
      log(result.message);
    } else {
      log(result.message, "error");
    }
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function processVideo() {
  setBusy(true, "正在创建处理任务...");
  try {
    const interval = Math.max(1, Number(elements.intervalInput.value || 5));
    const result = await apiPost("/api/process_video", { name: currentKbName(), interval });
    if (result.success) {
      state.task = result.data.task || state.task;
      state.video = result.data.video || state.video;
      log(result.message);
      startPolling();
    } else {
      log(result.message, "error");
    }
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function cancelTask() {
  const result = await apiPost("/api/cancel_process");
  if (result.success) {
    state.task = result.data.task || state.task;
    log(result.message);
  } else {
    log(result.message, "error");
  }
  await refreshStatus();
}

async function loadRag() {
  setBusy(true, "正在加载知识库...");
  try {
    const result = await apiPost("/api/load_rag", { name: currentKbName() });
    if (result.success) {
      state.video = result.data;
      addMessage("assistant", "知识库已加载。现在可以围绕当前视频提问。");
      log(result.message);
    } else {
      log(result.message, "error");
    }
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

function addMessage(role, content, sources) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = content;
  wrapper.appendChild(paragraph);
  if (Array.isArray(sources) && sources.length) {
    const src = document.createElement("div");
    src.className = "msg-sources";
    src.textContent = `参考视频：${sources.join("、")}`;
    wrapper.appendChild(src);
  }
  elements.chatMessages.appendChild(wrapper);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function askQuestion(question) {
  addMessage("user", question);
  setBusy(true, "正在检索视频知识库...");
  try {
    const payload = { question, scope: state.askScope };
    if (state.askScope === "current") {
      payload.mode = elements.queryMode.value;
      payload.name = currentKbName();
    } else if (state.askScope === "select") {
      payload.videos = state.selectedVideos.slice();
    }
    const result = await apiPost("/api/ask", payload);
    if (result.success) {
      addMessage("assistant", result.data.answer, result.data.sources);
    } else {
      addMessage("assistant", result.message);
    }
    log(result.success ? "AI 已回答。" : result.message, result.success ? "info" : "error");
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function appendInlineText(parent, text) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  parts.forEach((part) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      const code = document.createElement("code");
      code.textContent = part.slice(1, -1);
      parent.appendChild(code);
    } else if (part.startsWith("**") && part.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = part.slice(2, -2);
      parent.appendChild(strong);
    } else {
      parent.appendChild(document.createTextNode(part));
    }
  });
}

function renderMarkdown(markdown, target) {
  clearNode(target);
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  let list = null;
  let inCode = false;
  let codeLines = [];

  function flushCode() {
    if (!inCode) return;
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = codeLines.join("\n");
    pre.appendChild(code);
    target.appendChild(pre);
    inCode = false;
    codeLines = [];
  }

  function flushList() {
    if (list) {
      target.appendChild(list);
      list = null;
    }
  }

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode();
      } else {
        flushList();
        inCode = true;
        codeLines = [];
      }
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = Math.min(4, heading[1].length + 2);
      const el = document.createElement(`h${level}`);
      appendInlineText(el, heading[2]);
      target.appendChild(el);
      return;
    }
    const listItem = trimmed.match(/^[-*]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
    if (listItem) {
      if (!list) list = document.createElement("ul");
      const item = document.createElement("li");
      appendInlineText(item, listItem[1]);
      list.appendChild(item);
      return;
    }
    flushList();
    const paragraph = document.createElement("p");
    appendInlineText(paragraph, trimmed);
    target.appendChild(paragraph);
  });
  flushCode();
  flushList();
}

async function generateNotes() {
  setBusy(true, "正在生成学习笔记...");
  try {
    const result = await apiPost("/api/generate_notes");
    state.notesRaw = result.success ? result.data.notes : result.message;
    renderMarkdown(state.notesRaw, elements.notesOutput);
    log(result.success ? "学习笔记已生成。" : result.message, result.success ? "info" : "error");
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

function stripMermaidCodeFence(text) {
  return String(text || "")
    .replace(/^```(?:mermaid)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function parseMermaidGraph(raw) {
  const source = stripMermaidCodeFence(raw);
  const labels = new Map();
  const edges = [];
  const nodePattern = /([A-Za-z0-9_\u4e00-\u9fff-]+)(?:\[(.+?)\]|\((.+?)\)|\{(.+?)\})?/g;

  source.split("\n").forEach((line) => {
    const clean = line.trim();
    if (!clean || clean.startsWith("graph") || clean.startsWith("flowchart")) return;
    const parts = clean.split(/-->|---|==>/);
    if (parts.length < 2) return;
    const parsed = parts.slice(0, 2).map((part) => {
      nodePattern.lastIndex = 0;
      const match = nodePattern.exec(part.trim());
      if (!match) return null;
      const id = match[1];
      const label = match[2] || match[3] || match[4] || id;
      labels.set(id, label.replace(/^"|"$/g, ""));
      return id;
    });
    if (parsed[0] && parsed[1]) edges.push([parsed[0], parsed[1]]);
  });
  return { labels, edges };
}

function renderMindmap() {
  elements.mindmapOutput.textContent = stripMermaidCodeFence(state.mindmapRaw);
  clearNode(elements.mindmapVisual);
  const { labels, edges } = parseMermaidGraph(state.mindmapRaw);
  if (!edges.length) {
    const empty = document.createElement("p");
    empty.textContent = "暂无可视化节点，请生成或粘贴 Mermaid graph TD 内容。";
    elements.mindmapVisual.appendChild(empty);
    return;
  }

  const children = new Map();
  const incoming = new Set();
  edges.forEach(([from, to]) => {
    if (!children.has(from)) children.set(from, []);
    children.get(from).push(to);
    incoming.add(to);
  });
  const roots = [...labels.keys()].filter((id) => !incoming.has(id));
  const root = roots[0] || edges[0][0];

  function renderNode(id, depth = 0, seen = new Set()) {
    const wrapper = document.createElement("div");
    wrapper.className = `mindmap-node depth-${Math.min(depth, 3)}`;
    const label = document.createElement("span");
    label.textContent = labels.get(id) || id;
    wrapper.appendChild(label);
    if (seen.has(id)) return wrapper;
    seen.add(id);
    const next = children.get(id) || [];
    if (next.length) {
      const group = document.createElement("div");
      group.className = "mindmap-children";
      next.forEach((child) => group.appendChild(renderNode(child, depth + 1, new Set(seen))));
      wrapper.appendChild(group);
    }
    return wrapper;
  }

  elements.mindmapVisual.appendChild(renderNode(root));
}

async function generateMindmap() {
  setBusy(true, "正在生成知识图谱...");
  try {
    const result = await apiPost("/api/generate_mindmap");
    state.mindmapRaw = result.success ? result.data.mindmap : result.message;
    renderMindmap();
    log(result.success ? "知识图谱已生成。" : result.message, result.success ? "info" : "error");
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function copyText(text, successMessage) {
  const value = String(text || "");
  if (!value.trim()) {
    log("没有可复制的内容。", "error");
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    log(successMessage || "内容已复制。");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    log(successMessage || "内容已复制。");
  }
}

function downloadText(filename, text) {
  const blob = new Blob([String(text || "")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function startPolling() {
  if (state.pollTimer) return;
  state.pollTimer = window.setInterval(() => refreshStatus({ fromPoll: true }), 1500);
}

function stopPolling() {
  if (!state.pollTimer) return;
  window.clearInterval(state.pollTimer);
  state.pollTimer = null;
}

function bindEvents() {
  $("loadDemoBtn").addEventListener("click", loadDemo);
  $("refreshBtn").addEventListener("click", () => refreshStatus());
  $("videoUpload").addEventListener("change", (event) => uploadVideo(event.target.files[0]));
  ["checkCacheBtn", "actionCheck"].forEach((id) => $(id).addEventListener("click", checkCache));
  ["processBtn", "actionProcess"].forEach((id) => $(id).addEventListener("click", processVideo));
  ["loadRagBtn", "actionLoad", "chatLoadRagBtn"].forEach((id) => $(id).addEventListener("click", loadRag));
  $("cancelTaskBtn").addEventListener("click", cancelTask);
  $("notesBtn").addEventListener("click", generateNotes);
  $("mindmapBtn").addEventListener("click", generateMindmap);
  $("copyNotesBtn").addEventListener("click", () => copyText(state.notesRaw || elements.notesOutput.innerText, "学习笔记已复制。"));
  $("downloadNotesBtn").addEventListener("click", () => downloadText(`${currentKbName()}_notes.md`, state.notesRaw || elements.notesOutput.innerText));
  $("copyMindmapBtn").addEventListener("click", () => copyText(stripMermaidCodeFence(state.mindmapRaw), "知识图谱源码已复制。"));
  $("downloadMindmapBtn").addEventListener("click", () => downloadText(`${currentKbName()}_mindmap.mmd`, stripMermaidCodeFence(state.mindmapRaw)));

  $("collapseLeft").addEventListener("click", () => {
    state.leftCollapsed = true;
    render();
  });
  $("expandLeft").addEventListener("click", () => {
    state.leftCollapsed = false;
    render();
  });
  $("collapseRight").addEventListener("click", () => {
    state.rightCollapsed = true;
    render();
  });
  $("expandRight").addEventListener("click", () => {
    state.rightCollapsed = false;
    render();
  });

  document.querySelectorAll("[data-main-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mainTab = button.dataset.mainTab;
      render();
    });
  });

  document.querySelectorAll("[data-study-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-study-tab]").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".study-content").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      const target = button.dataset.studyTab === "mindmap" ? "mindmapPanel" : "notesPanel";
      $(target).classList.add("active");
    });
  });

  document.querySelectorAll("[data-mindmap-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.mindmapView = button.dataset.mindmapView;
      render();
    });
  });

  elements.kbName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkCache();
  });

  elements.askScope.addEventListener("change", () => {
    state.askScope = elements.askScope.value;
    renderVideoPicker();
    renderButtons();
    if (state.askScope !== "current") loadCatalog();
  });

  elements.chatFab.addEventListener("click", () => {
    state.chatOpen = !state.chatOpen;
    render();
    if (state.chatOpen) loadCatalog();
    if (state.chatOpen && !elements.chatInput.disabled) elements.chatInput.focus();
  });
  $("closeChat").addEventListener("click", () => {
    state.chatOpen = false;
    render();
  });
  elements.chatBackdrop.addEventListener("click", () => {
    state.chatOpen = false;
    render();
  });
  elements.floatingChat.addEventListener("click", (event) => event.stopPropagation());
  elements.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = elements.chatInput.value.trim();
    if (!question) return;
    elements.chatInput.value = "";
    await askQuestion(question);
  });
}

async function init() {
  state.notesRaw = elements.notesOutput.innerText;
  bindEvents();
  renderMindmap();
  await refreshStatus();
  await loadCatalog();
  log("页面已就绪。");
}

init();
