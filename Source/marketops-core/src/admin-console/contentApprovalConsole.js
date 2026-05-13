const fs = require("fs");
const path = require("path");
const { resolveTenant } = require("./adminConsoleConfig");

const allowedActions = ["approve", "reject", "defer", "needs_edit", "regenerate_requested"];
const typeLabels = {
  all: "All",
  blog_report: "Blog reports",
  social_post: "Social posts",
  faceless_video_script: "Faceless video scripts",
  avatar_presenter_script: "Avatar presenter scripts",
  video_generation_package: "Video generation packages",
  case_study: "Blog reports"
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);
  }
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2) + "\n", "utf8");
  fs.renameSync(tmpPath, filePath);
}

function writeJsonDirect(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function readText(filePath, fallback = "") {
  if (!fs.existsSync(filePath)) return fallback;
  return fs.readFileSync(filePath, "utf8");
}

function toProjectPath(tenant, absolutePath) {
  return path.relative(tenant.projectRoot, absolutePath).replace(/\\/g, "/");
}

function resolveSafeSourcePath(tenant, itemPath) {
  const resolved = path.resolve(tenant.projectRoot, itemPath || "");
  if (!resolved.toLowerCase().startsWith(tenant.projectRoot.toLowerCase())) {
    throw new Error(`Unsafe source path outside tenant root: ${itemPath}`);
  }
  return resolved;
}

function loadQueue(tenant = resolveTenant()) {
  const queue = readJson(tenant.contentQueuePath, { items: [] });
  return {
    ...queue,
    items: Array.isArray(queue.items) ? queue.items : []
  };
}

function loadReviewState(tenant = resolveTenant()) {
  return readJson(tenant.reviewStatePath, {
    schemaVersion: "0.1",
    mode: "local_content_review_state",
    tenantId: tenant.tenantId,
    generatedAt: new Date().toISOString(),
    externalSendingEnabled: false,
    autoApprovalEnabled: false,
    publishAllowed: false,
    decisions: {}
  });
}

function previewForItem(tenant, item) {
  try {
    const sourcePath = resolveSafeSourcePath(tenant, item.path);
    const ext = path.extname(sourcePath).toLowerCase();
    if (![".md", ".json", ".txt"].includes(ext)) {
      return { sourceExists: fs.existsSync(sourcePath), previewText: "Preview unavailable for this file type." };
    }
    const text = readText(sourcePath, "");
    return {
      sourceExists: Boolean(text),
      previewText: text.slice(0, 2200)
    };
  } catch (error) {
    return { sourceExists: false, previewText: `Preview blocked: ${error.message}` };
  }
}

function decorateItem(tenant, item, state) {
  const decision = (state.decisions || {})[item.id] || null;
  return {
    ...item,
    sourcePath: item.path,
    filterGroup: item.type === "case_study" ? "blog_report" : item.type,
    reviewDecision: decision ? decision.action : null,
    reviewNotes: decision ? decision.reviewNotes : "",
    reviewedAt: decision ? decision.reviewedAt : null,
    ...previewForItem(tenant, item)
  };
}

function buildConsoleModel(tenant = resolveTenant()) {
  const queue = loadQueue(tenant);
  const state = loadReviewState(tenant);
  const items = queue.items.map((item) => decorateItem(tenant, item, state));
  const approved = buildApprovedContent(tenant, queue, state, false);
  return {
    schemaVersion: "0.1",
    generatedAt: new Date().toISOString(),
    tenantId: tenant.tenantId,
    tenantName: tenant.displayName,
    localOnly: true,
    externalSendingEnabled: false,
    publishAllowed: false,
    queuePath: toProjectPath(tenant, tenant.contentQueuePath),
    reviewStatePath: toProjectPath(tenant, tenant.reviewStatePath),
    approvedContentPath: toProjectPath(tenant, tenant.approvedContentPath),
    allowedActions,
    filters: {
      typeLabels,
      platforms: [...new Set(items.map((item) => item.platform).filter(Boolean))].sort()
    },
    counts: {
      total: items.length,
      approved: items.filter((item) => item.reviewDecision === "approve").length,
      rejected: items.filter((item) => item.reviewDecision === "reject").length,
      deferred: items.filter((item) => item.reviewDecision === "defer").length,
      needsEdit: items.filter((item) => item.reviewDecision === "needs_edit").length,
      regenerateRequested: items.filter((item) => item.reviewDecision === "regenerate_requested").length,
      approvedContentItems: approved.items.length
    },
    items
  };
}

function getItemDetail(itemId, tenant = resolveTenant()) {
  const state = loadReviewState(tenant);
  const queue = loadQueue(tenant);
  const item = queue.items.find((entry) => entry.id === itemId);
  if (!item) throw new Error(`Unknown queue item: ${itemId}`);
  return decorateItem(tenant, item, state);
}

function applyContentReviewDecision({ itemId, action, reviewNotes = "" }, tenant = resolveTenant()) {
  if (!itemId) throw new Error("Missing itemId.");
  if (!allowedActions.includes(action)) throw new Error(`Unsupported review action: ${action}`);
  const queue = loadQueue(tenant);
  const item = queue.items.find((entry) => entry.id === itemId);
  if (!item) throw new Error(`Unknown queue item: ${itemId}`);
  const state = loadReviewState(tenant);
  state.decisions[itemId] = {
    itemId,
    action,
    title: item.title,
    type: item.type,
    platform: item.platform || null,
    complianceStatus: item.complianceStatus,
    sourcePath: item.path,
    reviewNotes,
    reviewer: "local_user",
    reviewedAt: new Date().toISOString(),
    publishAllowed: false,
    localOnly: true,
    effect: "Local review-state update only. Does not publish, post, send, upload, deploy, trade, or call APIs."
  };
  state.updatedAt = new Date().toISOString();
  state.externalSendingEnabled = false;
  state.autoApprovalEnabled = false;
  state.publishAllowed = false;
  writeJson(tenant.reviewStatePath, state);
  const approved = buildApprovedContent(tenant, queue, state, true);
  return { decision: state.decisions[itemId], approved };
}

function buildApprovedContent(tenant = resolveTenant(), queue = loadQueue(tenant), state = loadReviewState(tenant), write = true) {
  const items = queue.items
    .filter((item) => state.decisions && state.decisions[item.id] && state.decisions[item.id].action === "approve")
    .map((item) => ({
      id: item.id,
      type: item.type,
      platform: item.platform || null,
      title: item.title,
      path: item.path,
      status: "approved_for_manual_review_use",
      complianceStatus: item.complianceStatus,
      sourceGeneratedAt: item.generatedAt,
      reviewedAt: state.decisions[item.id].reviewedAt,
      reviewNotes: state.decisions[item.id].reviewNotes,
      publishAllowed: false
    }));
  const output = {
    schemaVersion: "0.1",
    mode: "local_approved_content_review",
    tenantId: tenant.tenantId,
    generatedAt: new Date().toISOString(),
    externalSendingEnabled: false,
    autoPublishEnabled: false,
    publishAllowed: false,
    items
  };
  if (write) writeJson(tenant.approvedContentPath, output);
  return output;
}

function htmlForModel(model) {
  if (!model) {
    return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>The Office Admin Console Diagnostic</title></head>
<body style="background:#05080c;color:#e8edf2;font-family:Segoe UI,system-ui,sans-serif;padding:32px">
  <h1>The Office Admin Console Diagnostic</h1>
  <p>No tenant model was provided to the renderer. Start with <code>npm run admin:live -- --tenant marketops</code> or use the default MarketOps tenant.</p>
  <p>This page is local-only and cannot post, send, upload, deploy, trade, or call external APIs.</p>
</body>
</html>`;
  }
  const modelJson = JSON.stringify(model || null).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The Office Admin Approval Console</title>
  <style>
    :root { color-scheme: dark; --bg:#05080c; --panel:#111a24; --line:rgba(150,170,190,.22); --text:#e8edf2; --muted:#a7b0ba; --accent:#f05a3c; }
    * { box-sizing:border-box; }
    body { margin:0; background:radial-gradient(circle at top right, rgba(240,90,60,.12), transparent 34%), var(--bg); color:var(--text); font-family:Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif; }
    main { width:min(1240px, calc(100% - 28px)); margin:0 auto; padding:32px 0; }
    .hero,.toolbar,.card,.stat,.detail { background:linear-gradient(145deg, rgba(22,34,48,.96), rgba(8,13,18,.96)); border:1px solid var(--line); border-radius:10px; box-shadow:0 18px 48px rgba(0,0,0,.24); }
    .hero,.toolbar,.detail { padding:20px; margin-bottom:14px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; }
    .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin:14px 0; }
    .stat,.card { padding:14px; }
    h1,h2,h3,p { margin-top:0; }
    p,pre { color:var(--muted); line-height:1.5; }
    pre { white-space:pre-wrap; max-height:360px; overflow:auto; background:#080d12; border:1px solid var(--line); border-radius:8px; padding:12px; }
    button,select,textarea { background:#080d12; color:var(--text); border:1px solid var(--line); border-radius:8px; padding:9px 10px; }
    button { cursor:pointer; margin:0 6px 6px 0; }
    button:hover { border-color:rgba(240,90,60,.65); }
    .eyebrow { color:var(--accent); text-transform:uppercase; letter-spacing:.12em; font-size:.76rem; margin:0 0 8px; }
    .pill { display:inline-flex; border:1px solid var(--line); color:var(--muted); border-radius:999px; padding:4px 8px; margin:0 6px 6px 0; font-size:.74rem; }
    .path { font-family:ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap:anywhere; font-size:.78rem; }
    textarea { width:100%; min-height:60px; }
    .hidden { display:none; }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Local-only / The Office reusable console</p>
      <h1>The Office Admin Approval Console</h1>
      <p>Tenant: <strong>${model.tenantName}</strong>. This console reviews generated queue items and writes local review-state only. It cannot post, send, upload, deploy, trade, or call external APIs.</p>
      <p class="path">Queue: ${model.queuePath}</p>
    </section>
    <section class="stats" id="stats"></section>
    <section class="toolbar">
      <label>Type <select id="typeFilter"></select></label>
      <label>Platform <select id="platformFilter"></select></label>
      <label>Review <select id="reviewFilter"></select></label>
    </section>
    <section class="detail hidden" id="detail"></section>
    <section class="grid" id="cards"></section>
  </main>
  <script>
    window.OFFICE_ADMIN_CONSOLE_MODEL = ${modelJson};
    let model = window.OFFICE_ADMIN_CONSOLE_MODEL;
    const liveMode = !model;
    const cards = document.getElementById("cards");
    const detail = document.getElementById("detail");
    const typeFilter = document.getElementById("typeFilter");
    const platformFilter = document.getElementById("platformFilter");
    const reviewFilter = document.getElementById("reviewFilter");
    function option(select, value, label) { const o = document.createElement("option"); o.value = value; o.textContent = label || value; select.appendChild(o); }
    function pills(values) { return values.filter(Boolean).map((v) => '<span class="pill">' + v + '</span>').join(""); }
    function passes(item) {
      return (typeFilter.value === "all" || item.filterGroup === typeFilter.value)
        && (platformFilter.value === "all" || item.platform === platformFilter.value)
        && (reviewFilter.value === "all" || (reviewFilter.value === "pending" ? !item.reviewDecision : item.reviewDecision === reviewFilter.value));
    }
    async function api(path, options = {}) {
      const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    }
    async function loadModel() {
      if (model) return model;
      model = await api("/api/queue");
      return model;
    }
    function renderStats() {
      document.getElementById("stats").innerHTML = Object.entries(model.counts).map(([k,v]) => '<article class="stat"><h3>' + v + '</h3><p>' + k + '</p></article>').join("");
    }
    async function showDetail(id) {
      const item = liveMode ? await api("/api/item/" + encodeURIComponent(id)) : model.items.find((entry) => entry.id === id);
      detail.classList.remove("hidden");
      const actions = liveMode ? '<textarea id="reviewNotes" placeholder="Local review notes only">' + (item.reviewNotes || "") + '</textarea><p>' + ["approve","reject","defer","needs_edit","regenerate_requested"].map((a) => '<button data-review-action="' + a + '" data-id="' + item.id + '">' + a.replace("_"," ") + '</button>').join("") + '</p>' : '';
      detail.innerHTML = '<h2>' + item.title + '</h2><p>' + pills([item.type,item.platform,item.status,item.complianceStatus,item.reviewDecision || "pending_review"]) + '</p><p class="path">' + item.sourcePath + '</p><p>' + item.notes + '</p>' + actions + '<pre>' + item.previewText.replace(/[&<>]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c])) + '</pre>';
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function renderCards() {
      cards.innerHTML = model.items.filter(passes).map((item) => '<article class="card"><h3>' + item.title + '</h3><p>' + pills([item.type,item.platform,item.complianceStatus,item.reviewDecision || "pending_review"]) + '</p><p class="path">' + item.sourcePath + '</p><p>' + item.notes + '</p><button data-detail="' + item.id + '">View details</button></article>').join("") || "<p>No items match.</p>";
    }
    option(typeFilter, "all", "All");
    [["blog_report","Blog reports"],["social_post","Social posts"],["faceless_video_script","Faceless video scripts"],["avatar_presenter_script","Avatar presenter scripts"],["video_generation_package","Video generation packages"]].forEach(([v,l]) => option(typeFilter,v,l));
    option(platformFilter, "all", "All platforms");
    model.filters.platforms.forEach((p) => option(platformFilter,p,p));
    [["all","All"],["pending","Pending"],["approve","Approved"],["reject","Rejected"],["defer","Deferred"],["needs_edit","Needs edit"],["regenerate_requested","Regenerate requested"]].forEach(([v,l]) => option(reviewFilter,v,l));
    [typeFilter, platformFilter, reviewFilter].forEach((el) => el.addEventListener("change", renderCards));
    document.addEventListener("click", async (event) => {
      if (event.target.dataset.detail) await showDetail(event.target.dataset.detail);
      if (event.target.dataset.reviewAction) {
        await api("/api/review", { method: "POST", body: JSON.stringify({ itemId: event.target.dataset.id, action: event.target.dataset.reviewAction, reviewNotes: document.getElementById("reviewNotes").value }) });
        model = await api("/api/queue");
        renderStats(); renderCards();
        await showDetail(event.target.dataset.id);
      }
    });
    loadModel().then(() => { renderStats(); renderCards(); }).catch((error) => { document.body.innerHTML = '<main><section class="hero"><h1>Console error</h1><p>' + error.message + '</p></section></main>'; });
  </script>
</body>
</html>`;
}

function writeStaticConsole(tenant = resolveTenant()) {
  const model = buildConsoleModel(tenant);
  ensureDir(path.dirname(tenant.consoleOutputPath));
  fs.writeFileSync(tenant.consoleOutputPath, htmlForModel(model), "utf8");
  buildApprovedContent(tenant, loadQueue(tenant), loadReviewState(tenant), true);
  return { model, consolePath: tenant.consoleOutputPath };
}

module.exports = {
  allowedActions,
  typeLabels,
  loadQueue,
  loadReviewState,
  buildConsoleModel,
  applyContentReviewDecision,
  buildApprovedContent,
  getItemDetail,
  htmlForModel,
  writeStaticConsole,
  resolveTenant
};
