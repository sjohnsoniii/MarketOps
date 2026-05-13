const fs = require("fs");
const path = require("path");
const { buildBootstrap, applyDecision } = require("./adminServerUtils");
const { getAuthStatus, requireAuth } = require("./adminAuth");
const {
  buildConsoleModel,
  applyContentReviewDecision
} = require("../admin-console/contentApprovalConsole");

function send(res, status, type, body) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}

function sendJson(res, status, value) {
  send(res, status, "application/json; charset=utf-8", JSON.stringify(value, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

function html() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MarketOps Private Admin</title>
  <style>
    :root { color-scheme: dark; --bg:#05080c; --panel:#111a24; --panel2:#162230; --line:rgba(150,170,190,.22); --text:#e8edf2; --muted:#a7b0ba; --accent:#f05a3c; }
    * { box-sizing: border-box; }
    body { margin:0; background:radial-gradient(circle at top right, rgba(240,90,60,.12), transparent 34%), var(--bg); color:var(--text); font-family:Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif; }
    main { width:min(1240px, calc(100% - 28px)); margin:0 auto; padding:32px 0; }
    .hero,.panel,.card { background:linear-gradient(145deg, rgba(22,34,48,.96), rgba(8,13,18,.96)); border:1px solid var(--line); border-radius:10px; box-shadow:0 18px 48px rgba(0,0,0,.26); }
    .hero { padding:26px; margin-bottom:16px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
    .panel,.card { padding:16px; }
    .eyebrow { color:var(--accent); text-transform:uppercase; letter-spacing:.12em; font-size:.76rem; margin:0 0 8px; }
    h1,h2,h3,p { margin-top:0; }
    p,li { color:var(--muted); line-height:1.55; }
    button,select,input,textarea { background:#080d12; color:var(--text); border:1px solid var(--line); border-radius:8px; padding:9px 10px; }
    button { cursor:pointer; }
    button:hover { border-color:rgba(240,90,60,.65); }
    .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
    .pill { display:inline-flex; margin:0 6px 6px 0; border:1px solid var(--line); border-radius:999px; padding:4px 8px; color:var(--muted); font-size:.75rem; }
    .accent { color:#ffb09f; }
    .warning { border-color:rgba(240,90,60,.55); }
    .path,.mono { font-family:ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap:anywhere; font-size:.78rem; }
    .tabs { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 14px; }
    .tab.active { background:rgba(240,90,60,.16); border-color:rgba(240,90,60,.5); }
    textarea { width:100%; min-height:58px; margin-top:8px; }
    .hidden { display:none; }
  </style>
</head>
<body>
  <main>
    <header class="hero">
      <p class="eyebrow">Local/private operator console</p>
      <h1>MarketOps Private Admin</h1>
      <p>This console reads local paper-simulation outputs and writes local review-state only. It cannot post, send, email, trade, publish, call APIs, or connect brokers.</p>
      <p id="authWarning" class="accent"></p>
    </header>
    <section class="tabs">
      <button class="tab active" data-tab="dashboard">Dashboard</button>
      <button class="tab" data-tab="approvals">Approval Queue</button>
      <button class="tab" data-tab="contentqueue">Content Queue</button>
      <button class="tab" data-tab="social">Social Previews</button>
      <button class="tab" data-tab="signals">Signal Previews</button>
      <button class="tab" data-tab="media">Media Prompts</button>
      <button class="tab" data-tab="publicprep">Public Dashboard Prep</button>
      <button class="tab" data-tab="reports">Reports</button>
      <button class="tab" data-tab="human">Needs Human Input</button>
    </section>
    <section id="dashboard"></section>
    <section id="approvals" class="hidden"></section>
    <section id="contentqueue" class="hidden"></section>
    <section id="social" class="hidden"></section>
    <section id="signals" class="hidden"></section>
    <section id="media" class="hidden"></section>
    <section id="publicprep" class="hidden"></section>
    <section id="reports" class="hidden"></section>
    <section id="human" class="hidden"></section>
  </main>
  <script>
    const pin = sessionStorage.getItem("marketops_admin_pin") || "";
    let model = null;
    const $ = (id) => document.getElementById(id);
    async function api(path, options = {}) {
      const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
      if (pin) headers["X-MarketOps-Admin-Pin"] = pin;
      const response = await fetch(path, { ...options, headers });
      if (response.status === 401) {
        const value = prompt("Enter local MarketOps admin PIN");
        if (value) {
          sessionStorage.setItem("marketops_admin_pin", value);
          location.reload();
        }
      }
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    }
    function pills(values) { return (values || []).map((v) => '<span class="pill">' + v + '</span>').join(""); }
    function card(title, body, extra = "") { return '<article class="card"><h3>' + title + '</h3>' + body + extra + '</article>'; }
    function renderDashboard() {
      const s = model.systemStatus;
      $("dashboard").innerHTML = '<div class="grid">'
        + card("System Status", '<p><strong>Mode:</strong> ' + s.mode + '</p><p><strong>Step 0:</strong> ' + s.step0Status + '</p><p><strong>Local only:</strong> ' + s.localOnly + '</p>')
        + card("QA / Reviews", '<p><strong>Approval items:</strong> ' + s.qaStatusSummary.approvalItems + '</p><p><strong>Pending:</strong> ' + s.qaStatusSummary.pendingItems + '</p><p><strong>Local decisions:</strong> ' + s.qaStatusSummary.localDecisions + '</p>')
        + card("Preview Inventory", '<p><strong>Signals:</strong> ' + s.qaStatusSummary.signalPreviews + '</p><p><strong>Social drafts:</strong> ' + s.qaStatusSummary.socialPreviews + '</p><p><strong>IG/X hype drafts:</strong> ' + s.qaStatusSummary.hypePreviews + '</p>')
        + card("Scheduled Heartbeat", '<p><strong>Paper task:</strong> ' + s.scheduledTaskHeartbeat.paperInstalledApproved + '</p><p><strong>Office task:</strong> ' + s.scheduledTaskHeartbeat.officeInstalledApproved + '</p><p class="path">' + s.scheduledTaskHeartbeat.source + '</p>')
        + card("Latest Logs", (s.latestLogs || []).map((log) => '<p class="path">' + log.path + '<br>' + log.updatedAt + '</p>').join("") || '<p>No logs found.</p>')
        + '</div>';
    }
    function decisionButtons(item) {
      const buttons = ["YES_APPROVE","NO_REJECT","NEEDS_EDIT","HOLD","ESCALATE"].map((d) => '<button data-decision="' + d + '" data-id="' + item.id + '">' + d.replace("_", " ") + '</button>').join("");
      return '<textarea placeholder="Local review notes only" id="notes-' + item.id + '">' + (item.localReviewNotes || "") + '</textarea><div class="actions">' + buttons + '</div>';
    }
    function renderApprovals() {
      $("approvals").innerHTML = '<div class="grid">' + model.approvalItems.map((item) => card(item.title,
        '<p>' + item.summary + '</p><p>' + pills([item.type, item.platform, item.riskLevel, item.localStatus, item.localDecision || "PENDING_LOCAL_DECISION"]) + '</p><p class="path"><strong>Source:</strong> ' + item.sourcePath + '</p><p><strong>Question:</strong> ' + item.approvalQuestion + '</p>',
        decisionButtons(item))).join("") + '</div>';
    }
    function contentDecisionButtons(item) {
      const buttons = ["approve","reject","defer","needs_edit","regenerate_requested"].map((d) => '<button data-content-action="' + d + '" data-id="' + item.id + '">' + d.replace("_", " ") + '</button>').join("");
      return '<textarea placeholder="Local content review notes only" id="content-notes-' + item.id + '">' + (item.reviewNotes || "") + '</textarea><div class="actions">' + buttons + '</div>';
    }
    function renderContentQueue() {
      const items = (model.contentQueue && model.contentQueue.items) || [];
      $("contentqueue").innerHTML = '<div class="grid">' + items.map((item) => card(item.title,
        '<p>' + pills([item.type, item.platform, item.status, item.complianceStatus, item.reviewDecision || "pending_review"]) + '</p><p class="path">' + item.sourcePath + '</p><p>' + item.notes + '</p><pre class="path">' + String(item.previewText || "").slice(0, 700).replace(/[&<>]/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c])) + '</pre>',
        contentDecisionButtons(item))).join("") + '</div>';
    }
    function renderSocial() {
      const igx = model.social.igX.map((item) => card(item.title,
        '<p>' + item.caption + '</p><p>' + pills([item.platform, item.status, item.publishMode, "api_off"]) + '</p><p><strong>Hashtags:</strong> ' + (item.hashtags || []).join(" ") + '</p><p class="path"><strong>Link:</strong> ' + item.link + '</p><p><strong>Image prompt:</strong> ' + item.imagePrompt + '</p><p class="accent">' + item.paperMoneyDisclosure + ' ' + item.notFinancialAdviceDisclosure + '</p>')).join("");
      const hype = (model.social.hype || []).map((item) => card(item.title, '<p>' + item.caption + '</p><p>' + pills([item.platform, item.approvalStatus, item.publishMode, item.apiPosting]) + '</p><p><strong>Hashtags:</strong> ' + (item.hashtags || []).join(" ") + '</p><p><strong>Image prompt:</strong> ' + item.imagePrompt + '</p><p><strong>Layout:</strong> ' + item.stillCardLayoutIdea + '</p>')).join("");
      const other = (model.social.previews || []).filter((item) => ["tiktok","youtube"].includes(item.platform)).map((item) => card(item.title, '<p>' + item.draftText + '</p><p>' + pills([item.platform, item.phase, "simulated_deferred"]) + '</p>')).join("");
      const deferred = (model.social.deferred || []).map((item) => card(item.platform, '<p>' + (item.reason || item.mode || "Deferred") + '</p><p>' + pills(["deferred", "no_posting"]) + '</p>')).join("");
      $("social").innerHTML = '<div class="grid">' + igx + hype + other + deferred + '</div>';
    }
    function renderSignals() {
      $("signals").innerHTML = '<p class="path">Source: ' + model.signals.sourcePath + '</p><div class="grid">' + (model.signals.previews || []).map((item) => card(item.title || item.classification || item.id, '<p>' + (item.researchSummary || item.summary || item.description || "") + '</p><p>' + pills([item.classification, item.riskLabel, "research_only", "no_live_execution"]) + '</p>')).join("") + '</div>';
    }
    function renderMedia() {
      const hype = (model.social.hype || []).map((item) => card(item.title, '<p><strong>Prompt:</strong> ' + item.imagePrompt + '</p><p><strong>Still card:</strong> ' + item.stillCardLayoutIdea + '</p><p><strong>Video hook:</strong> ' + item.videoHook + '</p><p>' + pills(item.disclosureFlags) + '</p>')).join("");
      const future = (model.social.previews || []).filter((item) => ["tiktok","youtube"].includes(item.platform)).map((item) => card(item.title, '<p>' + item.draftText + '</p><p><strong>B-roll:</strong> ' + (item.brollIdeas || []).join("; ") + '</p><p>' + pills([item.platform, "future_prep_only", "no_upload"]) + '</p>')).join("");
      $("media").innerHTML = '<div class="grid">' + hype + future + '</div>';
    }
    function renderReports() {
      $("reports").innerHTML = '<div class="grid">' + (model.reports || []).map((item) => card(item.title, '<p>' + item.summary + '</p><p class="path">' + item.path + '</p><p class="path">' + item.updatedAt + '</p>')).join("") + '</div>';
    }
    function renderPublicPrep() {
      const prep = model.publicDashboardPublishPrep;
      $("publicprep").innerHTML = '<div class="grid">'
        + card("Public Dashboard Publish Prep", '<p><strong>Latest sanitized bundle:</strong> ' + (prep.latestSanitizedBundleTimestamp || "missing") + '</p><p><strong>Safety QA:</strong> ' + prep.safetyQaStatus + '</p><p><strong>Public publish recommended:</strong> ' + prep.publicPublishRecommended + '</p><p>' + prep.recommendation + '</p><p class="path">' + prep.sourcePath + '</p>')
        + card("What Changed", (prep.whatChangedSincePreviousBundle || []).map((item) => '<p>' + item + '</p>').join("") || '<p>No change notes available.</p>')
        + card("Local-Only Review Actions", '<p>' + pills(prep.localOnlyActions || []) + '</p><p>These are review labels only. They do not commit, push, deploy, upload, or publish.</p>')
        + '</div>';
    }
    function renderHuman() {
      $("human").innerHTML = '<div class="grid">' + (model.humanInput || []).map((item) => card(item.area + ': ' + item.question, '<p>' + item.whyNeeded + '</p><p>' + pills([item.blocking ? "blocking" : "not_blocking", item.safeDefault || "safe_default"]) + '</p><p><strong>Options:</strong> ' + (item.options || []).join(", ") + '</p><p><strong>Recommended:</strong> ' + item.recommendedChoice + '</p>')).join("") + '</div>';
    }
    function render() { renderDashboard(); renderApprovals(); renderContentQueue(); renderSocial(); renderSignals(); renderMedia(); renderPublicPrep(); renderReports(); renderHuman(); }
    document.addEventListener("click", async (event) => {
      if (event.target.matches(".tab")) {
        document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
        event.target.classList.add("active");
        ["dashboard","approvals","contentqueue","social","signals","media","publicprep","reports","human"].forEach((id) => $(id).classList.toggle("hidden", id !== event.target.dataset.tab));
      }
      if (event.target.dataset.decision) {
        const id = event.target.dataset.id;
        const reviewNotes = $("notes-" + id).value;
        await api("/api/decision", { method: "POST", body: JSON.stringify({ id, decision: event.target.dataset.decision, reviewNotes }) });
        model = await api("/api/bootstrap");
        render();
      }
      if (event.target.dataset.contentAction) {
        const id = event.target.dataset.id;
        const reviewNotes = $("content-notes-" + id).value;
        await api("/api/content-decision", { method: "POST", body: JSON.stringify({ itemId: id, action: event.target.dataset.contentAction, reviewNotes }) });
        model = await api("/api/bootstrap");
        render();
      }
    });
    api("/api/bootstrap").then((data) => {
      model = data;
      $("authWarning").textContent = data.systemStatus.auth.warning;
      render();
    }).catch((error) => { document.body.innerHTML = '<main><section class="hero warning"><h1>Admin server error</h1><p>' + error.message + '</p></section></main>'; });
  </script>
</body>
</html>`;
}

async function handleRequest(req, res, options) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method === "GET" && url.pathname === "/") return send(res, 200, "text/html; charset=utf-8", html());
  if (req.method === "GET" && url.pathname === "/health") return sendJson(res, 200, { ok: true, localOnly: true, externalSendingEnabled: false });
  if (req.method === "GET" && url.pathname === "/api/bootstrap") {
    const authStatus = getAuthStatus(req, options.host);
    return sendJson(res, 200, { ...buildBootstrap(authStatus), contentQueue: buildConsoleModel() });
  }
  if (req.method === "POST" && url.pathname === "/api/decision") {
    const body = await readBody(req);
    const auth = requireAuth(req, body, options.host);
    if (!auth.ok) return sendJson(res, auth.status, { error: auth.message });
    const decision = applyDecision(body);
    return sendJson(res, 200, { ok: true, decision });
  }
  if (req.method === "POST" && url.pathname === "/api/content-decision") {
    const body = await readBody(req);
    const auth = requireAuth(req, body, options.host);
    if (!auth.ok) return sendJson(res, auth.status, { error: auth.message });
    const decision = applyContentReviewDecision(body);
    return sendJson(res, 200, { ok: true, decision });
  }
  if (req.method === "GET" && url.pathname.startsWith("/static/")) {
    return send(res, 404, "text/plain; charset=utf-8", "No static external assets are required.");
  }
  return send(res, 404, "text/plain; charset=utf-8", "Not found");
}

module.exports = { handleRequest, html };
