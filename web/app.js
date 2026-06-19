const state = {
  video: null,
  env: { ready: false },
  leftCollapsed: false,
  rightCollapsed: false,
  chatOpen: false,
  busy: false,
};

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
  eventLog: $("eventLog"),
  playerCard: document.querySelector(".player-card"),
  videoPlayer: $("videoPlayer"),
  chatFab: $("chatFab"),
  floatingChat: $("floatingChat"),
  chatBackdrop: $("chatBackdrop"),
  chatForm: $("chatForm"),
  chatInput: $("chatInput"),
  chatMessages: $("chatMessages"),
  notesOutput: $("notesOutput"),
  mindmapOutput: $("mindmapOutput"),
};

async function apiGet(path) {
  const response = await fetch(path);
  return response.json();
}

async function apiPost(path, payload = {}) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

function log(message) {
  const time = new Date().toLocaleTimeString();
  elements.eventLog.textContent = `[${time}] ${message}`;
}

function setBusy(isBusy, message = "") {
  state.busy = isBusy;
  document.body.classList.toggle("loading", isBusy);
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.id === "collapseLeft" || button.id === "collapseRight" || button.id === "expandLeft" || button.id === "expandRight") {
      return;
    }
    button.disabled = isBusy;
  });
  if (message) log(message);
  render();
}

function setText(element, value) {
  element.textContent = value || "-";
}

function renderEnv() {
  if (state.env.ready) {
    elements.envPill.textContent = ".env 已就绪";
    elements.envPill.classList.remove("bad");
    return;
  }
  const missing = [...(state.env.missing || []), ...(state.env.placeholders || [])];
  elements.envPill.textContent = missing.length ? "API 未配置" : "API 状态未知";
  elements.envPill.classList.add("bad");
}

function renderVideo() {
  const video = state.video || {};
  const cache = video.cache || {};
  const selected = Boolean(video.selected);

  elements.videoTitle.textContent = selected ? video.title : "未选择视频";
  elements.mainTitle.textContent = selected ? video.title : "编译原理视频学习助手";
  elements.mainSubtitle.textContent = selected
    ? `知识库名称：${video.name || "-"}`
    : "播放视频，加载知识库，然后通过右下角 AI 助手围绕当前视频提问。";

  elements.kbName.value = video.name || "compiler_ch1";
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

function renderButtons() {
  const video = state.video || {};
  const cache = video.cache || {};
  const envReady = Boolean(state.env.ready);
  const selected = Boolean(video.selected);
  const ragLoaded = Boolean(video.rag_loaded);
  const cacheReady = Boolean(cache.ready);

  const processDisabled = state.busy || !selected || !envReady;
  const loadDisabled = state.busy || !selected || !envReady || !cacheReady;
  const aiDisabled = state.busy || !ragLoaded;

  ["processBtn", "actionProcess"].forEach((id) => ($(id).disabled = processDisabled));
  ["loadRagBtn", "actionLoad"].forEach((id) => ($(id).disabled = loadDisabled));
  $("notesBtn").disabled = aiDisabled;
  $("mindmapBtn").disabled = aiDisabled;
  elements.chatInput.disabled = aiDisabled;
  elements.chatForm.querySelector("button").disabled = aiDisabled;
  $("checkCacheBtn").disabled = state.busy || !selected;
  $("actionCheck").disabled = state.busy || !selected;
}

function renderLayout() {
  elements.shell.classList.toggle("left-collapsed", state.leftCollapsed);
  elements.shell.classList.toggle("right-collapsed", state.rightCollapsed);
  elements.floatingChat.classList.toggle("open", state.chatOpen);
  elements.chatBackdrop.classList.toggle("open", state.chatOpen);
  elements.floatingChat.setAttribute("aria-hidden", String(!state.chatOpen));
}

function render() {
  renderEnv();
  renderVideo();
  renderLayout();
  renderButtons();
}

async function refreshStatus() {
  const result = await apiGet("/api/status");
  if (!result.success) {
    log(result.message);
    return;
  }
  state.env = result.data.env;
  state.video = result.data.video;
  render();
}

async function loadDemo() {
  setBusy(true, "正在加载 Demo 视频...");
  try {
    const result = await apiGet("/api/demo");
    if (result.success) {
      state.video = result.data;
      log(result.message);
    } else {
      log(result.message);
    }
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function uploadVideo(file) {
  if (!file) return;
  setBusy(true, "正在上传视频副本...");
  try {
    const form = new FormData();
    form.append("video", file);
    const response = await fetch("/api/upload_video", { method: "POST", body: form });
    const result = await response.json();
    if (result.success) {
      state.video = result.data;
      log(result.message);
    } else {
      log(result.message);
    }
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function checkCache() {
  setBusy(true, "正在检测缓存...");
  try {
    const result = await apiPost("/api/check_cache", { name: elements.kbName.value });
    if (result.success) {
      state.video = result.data;
    }
    log(result.message);
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function processVideo() {
  setBusy(true, "正在处理视频，这可能需要较长时间...");
  try {
    const result = await apiPost("/api/process_video", { interval: 5 });
    if (result.success) {
      state.video = result.data;
    }
    log(result.message);
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function loadRag() {
  setBusy(true, "正在加载知识库...");
  try {
    const result = await apiPost("/api/load_rag");
    if (result.success) {
      state.video = result.data;
      addMessage("assistant", "知识库已加载。现在可以围绕当前视频提问。");
    }
    log(result.message);
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

function addMessage(role, content) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  const paragraph = document.createElement("p");
  paragraph.textContent = content;
  wrapper.appendChild(paragraph);
  elements.chatMessages.appendChild(wrapper);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function askQuestion(question) {
  addMessage("user", question);
  setBusy(true, "正在检索视频知识库...");
  try {
    const result = await apiPost("/api/ask", { question });
    addMessage("assistant", result.success ? result.data.answer : result.message);
    log(result.success ? "AI 已回答。" : result.message);
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function generateNotes() {
  setBusy(true, "正在生成学习笔记...");
  try {
    const result = await apiPost("/api/generate_notes");
    elements.notesOutput.textContent = result.success ? result.data.notes : result.message;
    log(result.success ? "学习笔记已生成。" : result.message);
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function generateMindmap() {
  setBusy(true, "正在生成知识图谱...");
  try {
    const result = await apiPost("/api/generate_mindmap");
    elements.mindmapOutput.textContent = result.success ? result.data.mindmap : result.message;
    log(result.success ? "知识图谱已生成。" : result.message);
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

function bindEvents() {
  $("loadDemoBtn").addEventListener("click", loadDemo);
  $("refreshBtn").addEventListener("click", refreshStatus);
  $("videoUpload").addEventListener("change", (event) => uploadVideo(event.target.files[0]));
  ["checkCacheBtn", "actionCheck"].forEach((id) => $(id).addEventListener("click", checkCache));
  ["processBtn", "actionProcess"].forEach((id) => $(id).addEventListener("click", processVideo));
  ["loadRagBtn", "actionLoad"].forEach((id) => $(id).addEventListener("click", loadRag));
  $("notesBtn").addEventListener("click", generateNotes);
  $("mindmapBtn").addEventListener("click", generateMindmap);

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

  document.querySelectorAll("[data-study-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-study-tab]").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".study-content").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      const target = button.dataset.studyTab === "mindmap" ? "mindmapPanel" : "notesPanel";
      $(target).classList.add("active");
    });
  });

  elements.chatFab.addEventListener("click", () => {
    state.chatOpen = !state.chatOpen;
    render();
    if (state.chatOpen) elements.chatInput.focus();
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
  bindEvents();
  await refreshStatus();
  log("页面已就绪。");
}

init();
