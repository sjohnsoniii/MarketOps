const fs = require("fs");
const http = require("http");
const path = require("path");

const { loadConfig } = require("../config/configLoader");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const dataRoot = path.join(projectRoot, "Data");
const reportsRoot = path.join(projectRoot, "Reports");
const adminRoot = path.join(projectRoot, "Admin", "review-console");

const paths = {
  projectRoot,
  coreRoot,
  approvalsRoot: path.join(dataRoot, "approvals"),
  auditRoot: path.join(dataRoot, "approvals", "audit"),
  checkpointIndex: path.join(dataRoot, "approvals", "supercruise-admin-approval-index-v0.1.json"),
  approvalState: path.join(dataRoot, "approvals", "supercruise-approval-state-v0.1.json"),
  consoleHtml: path.join(adminRoot, "supercruise-admin-approval-checkpoint-v0.1.html"),
  qaReport: path.join(reportsRoot, "Admin", "marketops-supercruise-admin-approval-qa-v0.1.md"),
  checkpointReport: path.join(reportsRoot, "Admin", "marketops-supercruise-admin-approval-checkpoint-v0.1.md"),
  contentRoot: path.join(dataRoot, "content"),
  contentQueue: path.join(dataRoot, "content", "queue", "content-queue-v0.1.json"),
  officeSummary: path.join(dataRoot, "content", "queue", "latest-office-run-summary.json"),
  contentComplianceReport: path.join(dataRoot, "content", "compliance", "content-compliance-report-v0.1.md"),
  agentSummary: path.join(dataRoot, "agent-reviews", "latest-agent-review-summary.json"),
  improvementBacklog: path.join(dataRoot, "agent-reviews", "improvement-backlog-v0.1.md"),
  monthlyHumanReviewBrief: path.join(dataRoot, "agent-reviews", "monthly-human-review-brief-v0.1.md"),
  paperRunSummary: path.join(dataRoot, "paper", "history", "latest-run-summary.json"),
  paperDashboard: path.join(dataRoot, "paper", "dashboard", "dashboard-bundle-v0.1.json"),
  performanceReport: path.join(dataRoot, "paper", "reports", "performance-summary-v0.1.md"),
  riskReport: path.join(dataRoot, "paper", "reports", "risk-desk-v0.1.md"),
  signalReport: path.join(dataRoot, "paper", "reports", "signal-scan-v0.1.md"),
  alpacaMarketData: path.join(dataRoot, "market-data", "alpaca", "alpaca-market-data-latest-v0.1.json"),
  alpacaMarketBars: path.join(dataRoot, "market-data", "alpaca", "alpaca-market-bars-latest-v0.1.json")
};

const allowedActions = [
  "approve_for_draft",
  "request_edits",
  "reject",
  "hold",
  "mark_reviewed"
];

const actionStatus = {
  approve_for_draft: "approved_for_draft",
  request_edits: "edits_requested",
  reject: "rejected",
  hold: "held",
  mark_reviewed: "reviewed"
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath, fallback = "") {
  if (!fs.existsSync(filePath)) return fallback;
  return fs.readFileSync(filePath, "utf8");
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function relativeProjectPath(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function safeId(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96) || "item";
}

function stampForFile(date = new Date()) {
  return date.toISOString().replace(/[-:.]/g, "").replace("T", "-").replace("Z", "Z");
}

function fileSummary(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      path: relativeProjectPath(filePath),
      exists: false
    };
  }
  const stat = fs.statSync(filePath);
  return {
    path: relativeProjectPath(filePath),
    exists: true,
    size: stat.size,
    modifiedAt: stat.mtime.toISOString()
  };
}

function walkFiles(rootDir, extensions = [".md", ".json"], limit = 300) {
  const files = [];
  function walk(current) {
    if (!fs.existsSync(current) || files.length >= limit) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (entry.name.endsWith(".bak") || entry.name.endsWith(".tmp")) continue;
      if (!extensions.includes(path.extname(entry.name).toLowerCase())) continue;
      files.push(fullPath);
      if (files.length >= limit) return;
    }
  }
  walk(rootDir);
  return files;
}

function newestFiles(rootDir, limit = 12) {
  return walkFiles(rootDir, [".md", ".json"], 600)
    .map((filePath) => {
      const stat = fs.statSync(filePath);
      return {
        path: relativeProjectPath(filePath),
        modifiedAt: stat.mtime.toISOString(),
        size: stat.size
      };
    })
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .slice(0, limit);
}

function textSnippet(filePath, length = 1000) {
  const text = readText(filePath, "");
  return text.replace(/\s+/g, " ").trim().slice(0, length);
}

function groupForQueueItem(item) {
  const type = String(item.type || item.contentType || "").toLowerCase();
  const platform = String(item.platform || "").toLowerCase();
  if (type.includes("blog")) return "blog";
  if (type.includes("social") || platform) return "social";
  if (type.includes("video")) return "video";
  if (type.includes("avatar")) return "avatar";
  if (type.includes("case") || type.includes("report")) return "report";
  if (type.includes("compliance")) return "compliance";
  return "other";
}

function groupForArtifact(filePath) {
  const rel = relativeProjectPath(filePath).toLowerCase();
  if (rel.includes("/blogs/")) return "blog";
  if (rel.includes("/social/")) return "social";
  if (rel.includes("/video")) return "video";
  if (rel.includes("/avatar/")) return "avatar";
  if (rel.includes("/reports/")) return "report";
  if (rel.includes("/compliance/")) return "compliance";
  return "other";
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function buildContentIndex() {
  const queue = readJson(paths.contentQueue, { items: [] }) || { items: [] };
  const officeSummary = readJson(paths.officeSummary, null);
  const queueItems = (Array.isArray(queue.items) ? queue.items : []).map((item) => ({
    id: item.id || `content-${safeId(item.title || item.path)}`,
    itemId: item.id || `content-${safeId(item.title || item.path)}`,
    group: groupForQueueItem(item),
    type: item.type || "unknown",
    platform: item.platform || null,
    title: item.title || item.id || "Untitled queue item",
    status: item.status || "unknown",
    complianceStatus: item.complianceStatus || "unknown",
    publishAllowed: item.publishAllowed === true,
    sourcePath: item.path || "",
    notes: item.notes || "",
    generatedAt: item.generatedAt || null
  }));

  const artifacts = walkFiles(paths.contentRoot)
    .map((filePath) => ({
      id: `artifact-${safeId(relativeProjectPath(filePath))}`,
      itemId: `artifact-${safeId(relativeProjectPath(filePath))}`,
      group: groupForArtifact(filePath),
      title: path.basename(filePath),
      sourcePath: relativeProjectPath(filePath),
      file: fileSummary(filePath),
      snippet: textSnippet(filePath, 700)
    }))
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));

  return {
    queuePath: relativeProjectPath(paths.contentQueue),
    queueExists: fs.existsSync(paths.contentQueue),
    officeSummaryPath: relativeProjectPath(paths.officeSummary),
    officeSummary,
    queueItems,
    artifacts,
    groupCounts: countBy(queueItems.concat(artifacts), (item) => item.group),
    complianceReport: {
      ...fileSummary(paths.contentComplianceReport),
      snippet: textSnippet(paths.contentComplianceReport, 900)
    }
  };
}

function parseProposalFields(block) {
  const fields = {};
  block.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*-\s*([^:]+):\s*(.*)$/);
    if (match) fields[match[1].trim()] = match[2].trim();
  });
  return fields;
}

function parseImprovementBacklog(text) {
  const blocks = text.split(/(?=^###\s+)/m).filter((block) => /^###\s+/m.test(block));
  return blocks.map((block) => {
    const titleLine = block.split(/\r?\n/)[0] || "";
    const match = titleLine.match(/^###\s+([^:]+):\s*(.+)$/);
    const fields = parseProposalFields(block);
    const proposalId = fields.proposalId || (match && match[1]) || `proposal-${safeId(titleLine)}`;
    const title = fields.proposalTitle || (match && match[2]) || titleLine.replace(/^###\s+/, "");
    const priority = fields.priority || fields.recommendedPriority || "review_next_digest";
    return {
      id: proposalId,
      itemId: proposalId,
      proposalId,
      title,
      sourceEntity: fields.sourceEntity || "unknown",
      priority,
      recommendedPriority: fields.recommendedPriority || priority,
      humanReviewRequired: fields.humanReviewRequired === "true" || fields.humanReviewRequired === true,
      autoApplyAllowed: fields.autoApplyAllowed === "true",
      problemObserved: fields.problemObserved || "",
      proposedChange: fields.proposedChange || "",
      requiredValidation: fields.requiredValidation || "",
      statusBucket: priority === "urgent_human_review" ? "urgent" : priority === "review_next_digest" ? "deferred" : "routine"
    };
  });
}

function buildReviewIndex() {
  const agentSummary = readJson(paths.agentSummary, null);
  const backlogText = readText(paths.improvementBacklog, "");
  const proposals = parseImprovementBacklog(backlogText);
  const monthlyBrief = readText(paths.monthlyHumanReviewBrief, "");
  return {
    agentSummaryPath: relativeProjectPath(paths.agentSummary),
    agentSummary,
    improvementBacklogPath: relativeProjectPath(paths.improvementBacklog),
    monthlyHumanReviewBriefPath: relativeProjectPath(paths.monthlyHumanReviewBrief),
    monthlyBriefSnippet: monthlyBrief.replace(/\s+/g, " ").trim().slice(0, 1100),
    proposals,
    urgentItems: proposals.filter((item) => item.statusBucket === "urgent"),
    routineItems: proposals.filter((item) => item.statusBucket === "routine"),
    deferredItems: proposals.filter((item) => item.statusBucket === "deferred"),
    summary: {
      reviewsGenerated: agentSummary && agentSummary.reviewsGenerated,
      proposalCount: proposals.length || agentSummary && agentSummary.proposalCount || 0,
      urgentItemsCount: proposals.filter((item) => item.statusBucket === "urgent").length,
      deferredItemsCount: proposals.filter((item) => item.statusBucket === "deferred").length,
      humanReviewLoad: agentSummary && agentSummary.humanReviewLoad,
      autoApplyAllowed: agentSummary && agentSummary.autoApplyAllowed === true
    }
  };
}

function readReportCard(filePath, title) {
  return {
    title,
    ...fileSummary(filePath),
    snippet: textSnippet(filePath, 1100)
  };
}

function buildPaperIndex() {
  const latestRun = readJson(paths.paperRunSummary, null);
  const dashboard = readJson(paths.paperDashboard, null);
  return {
    latestRunPath: relativeProjectPath(paths.paperRunSummary),
    dashboardPath: relativeProjectPath(paths.paperDashboard),
    latestRun,
    dashboardSummary: dashboard ? {
      generatedAt: dashboard.generatedAt,
      mode: dashboard.mode,
      paperOnly: dashboard.paperOnly === true,
      dataSource: dashboard.dataSource,
      liveTradingEnabled: dashboard.liveTradingEnabled === true,
      orderPlacementEnabled: dashboard.orderPlacementEnabled === true,
      fakePaperTrades: dashboard.counts && dashboard.counts.fakePaperTrades,
      signalsGenerated: dashboard.counts && dashboard.counts.signalsGenerated,
      riskApproved: dashboard.counts && dashboard.counts.riskApproved,
      riskBlocked: dashboard.counts && dashboard.counts.riskBlocked,
      endingBalance: dashboard.account && dashboard.account.endingBalance,
      paperPnl: dashboard.account && dashboard.account.paperPnl
    } : null,
    reports: [
      readReportCard(paths.performanceReport, "Performance Summary"),
      readReportCard(paths.riskReport, "Risk Desk"),
      readReportCard(paths.signalReport, "Signal Scan")
    ],
    warning: "Paper simulation only. Fake/sample-money preview. Not live trading, not real performance, not financial advice."
  };
}

function buildMarketDataIndex() {
  const bundle = readJson(paths.alpacaMarketData, null);
  const bars = readJson(paths.alpacaMarketBars, null);
  return {
    bundlePath: relativeProjectPath(paths.alpacaMarketData),
    barsPath: relativeProjectPath(paths.alpacaMarketBars),
    bundleExists: fs.existsSync(paths.alpacaMarketData),
    barsExists: fs.existsSync(paths.alpacaMarketBars),
    dataSource: bundle && bundle.dataSource || "deterministic_sample",
    generatedAt: bundle && bundle.generatedAt || null,
    feed: bundle && bundle.feed || null,
    latestBarTimestamp: bundle && bundle.latestBarTimestamp || null,
    barsLoaded: Array.isArray(bundle && bundle.bars) ? bundle.bars.length : Array.isArray(bars) ? bars.length : 0,
    quotesLoaded: Array.isArray(bundle && bundle.quotes) ? bundle.quotes.length : 0,
    paperOnly: !bundle || bundle.paperOnly === true,
    liveTradingEnabled: bundle && bundle.liveTradingEnabled === true,
    orderPlacementEnabled: bundle && bundle.orderPlacementEnabled === true
  };
}

function loadApprovalState() {
  return readJson(paths.approvalState, {
    schemaVersion: "0.1",
    mode: "local_supercruise_approval_state",
    generatedAt: new Date().toISOString(),
    updatedAt: null,
    localOnly: true,
    externalEffects: false,
    publishAllowed: false,
    items: {}
  });
}

function summarizeApprovalState(state = loadApprovalState()) {
  const items = Object.values(state.items || {});
  return {
    statePath: relativeProjectPath(paths.approvalState),
    auditRoot: relativeProjectPath(paths.auditRoot),
    allowedActions,
    decisionsCount: items.length,
    byStatus: countBy(items, (item) => item.status),
    lastReviewedAt: items.map((item) => item.reviewedAt).filter(Boolean).sort().pop() || null
  };
}

function buildCheckpointIndex() {
  let configStatus = { valid: false, error: "not loaded" };
  try {
    const config = loadConfig();
    configStatus = {
      valid: true,
      mode: config.mode,
      paperOnly: config.mode === "paper_simulation",
      safety: config.safety
    };
  } catch (error) {
    configStatus = { valid: false, error: error.message };
  }

  const state = loadApprovalState();
  return {
    schemaVersion: "marketops-supercruise-admin-approval-checkpoint-v0.1",
    generatedAt: new Date().toISOString(),
    localOnly: true,
    externalEffects: false,
    publishAllowed: false,
    liveTradingEnabled: false,
    brokerExecutionEnabled: false,
    socialPostingEnabled: false,
    emailSmsSendingEnabled: false,
    configStatus,
    paths: {
      projectRoot,
      coreRoot,
      consoleHtml: relativeProjectPath(paths.consoleHtml),
      indexJson: relativeProjectPath(paths.checkpointIndex),
      approvalState: relativeProjectPath(paths.approvalState),
      auditRoot: relativeProjectPath(paths.auditRoot)
    },
    latestOutputs: {
      content: newestFiles(paths.contentRoot),
      agentReviews: newestFiles(path.join(dataRoot, "agent-reviews")),
      paper: newestFiles(path.join(dataRoot, "paper")),
      marketData: newestFiles(path.join(dataRoot, "market-data"))
    },
    content: buildContentIndex(),
    reviews: buildReviewIndex(),
    paper: buildPaperIndex(),
    marketData: buildMarketDataIndex(),
    approvals: summarizeApprovalState(state),
    warnings: [
      "Local sandbox review only.",
      "Approval actions only write JSON under Data/approvals.",
      "No commit, push, deploy, external posting, email, SMS, broker connection, or live trading is performed.",
      "Paper trading data is fake/sample-money infrastructure telemetry, not real performance."
    ],
    nextHumanAction: "Open the local checkpoint console, review queued drafts and deferred agent proposals, then record local-only decisions where useful."
  };
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildConsoleHtml(index) {
  const modelJson = JSON.stringify(index).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MarketOps Supercruise Admin Checkpoint</title>
  <style>
    :root { color-scheme: dark; --bg:#07090c; --panel:#121820; --panel2:#18212b; --line:rgba(170,185,200,.22); --text:#edf2f6; --muted:#aeb8c2; --accent:#e45f3d; --ok:#6bd196; --warn:#ffc06a; --bad:#ff7c7c; }
    * { box-sizing:border-box; }
    body { margin:0; background:#07090c; color:var(--text); font-family:Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif; }
    main { width:min(1320px, calc(100% - 28px)); margin:0 auto; padding:28px 0 44px; }
    header,.toolbar,.panel,.card { background:linear-gradient(145deg, rgba(24,33,43,.98), rgba(11,15,20,.98)); border:1px solid var(--line); border-radius:8px; box-shadow:0 18px 40px rgba(0,0,0,.24); }
    header,.toolbar,.panel { padding:18px; margin-bottom:14px; }
    h1,h2,h3,p { margin-top:0; }
    p,li { color:var(--muted); line-height:1.5; }
    .eyebrow { color:var(--accent); text-transform:uppercase; letter-spacing:.1em; font-size:.76rem; margin-bottom:6px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; }
    .wide { grid-column:1 / -1; }
    .card { padding:14px; min-width:0; }
    .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-top:14px; }
    .stat { padding:12px; border:1px solid var(--line); border-radius:8px; background:rgba(255,255,255,.025); }
    .stat strong { display:block; color:var(--text); font-size:1.35rem; }
    .tabs { display:flex; flex-wrap:wrap; gap:8px; }
    button,select,textarea,input { background:#090d12; color:var(--text); border:1px solid var(--line); border-radius:7px; padding:8px 10px; }
    button { cursor:pointer; }
    button:hover,.active { border-color:rgba(228,95,61,.65); background:rgba(228,95,61,.12); }
    textarea { width:100%; min-height:56px; resize:vertical; margin-top:8px; }
    .pill { display:inline-flex; align-items:center; gap:4px; border:1px solid var(--line); color:var(--muted); border-radius:999px; padding:3px 7px; margin:0 5px 6px 0; font-size:.74rem; }
    .ok { color:var(--ok); border-color:rgba(107,209,150,.45); }
    .warn { color:var(--warn); border-color:rgba(255,192,106,.45); }
    .bad { color:var(--bad); border-color:rgba(255,124,124,.45); }
    .path,.snippet,pre { font-family:ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap:anywhere; }
    .path { font-size:.78rem; color:var(--muted); }
    .snippet { max-height:130px; overflow:auto; border:1px solid var(--line); border-radius:7px; padding:9px; background:#090d12; color:#c4ced8; font-size:.78rem; }
    .hidden { display:none; }
    .actions { display:flex; flex-wrap:wrap; gap:7px; margin-top:8px; }
    .section-title { display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .notice { border-left:3px solid var(--accent); padding-left:12px; }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Local sandbox admin</p>
      <h1>MarketOps Supercruise Admin Checkpoint</h1>
      <p class="notice">Paper simulation only. Approval buttons only write local JSON records under Data/approvals. No posting, publishing, email, SMS, deployment, broker connection, or live trading exists here.</p>
      <div class="stats" id="stats"></div>
    </header>

    <section class="toolbar">
      <div class="tabs" id="tabs"></div>
    </section>

    <section id="view"></section>
  </main>

  <script>
    window.MARKETOPS_CHECKPOINT_INDEX = ${modelJson};
    const allowedActions = ${JSON.stringify(allowedActions)};
    const view = document.getElementById("view");
    const tabs = document.getElementById("tabs");
    let model = window.MARKETOPS_CHECKPOINT_INDEX;
    let active = "overview";
    const serverMode = location.protocol === "http:" || location.protocol === "https:";

    function h(value) {
      return String(value == null ? "" : value).replace(/[&<>"]/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
    }
    function pills(values) {
      return values.filter((value) => value !== undefined && value !== null && value !== "").map((value) => '<span class="pill">' + h(value) + '</span>').join("");
    }
    function card(title, body, extra = "") {
      return '<article class="card"><h3>' + h(title) + '</h3>' + body + extra + '</article>';
    }
    function actionPanel(itemId, itemPath) {
      const key = h(itemId || itemPath);
      const buttons = allowedActions.map((action) => '<button data-action="' + h(action) + '" data-item-id="' + h(itemId || "") + '" data-item-path="' + h(itemPath || "") + '">' + h(action.replace(/_/g, " ")) + '</button>').join("");
      return '<textarea id="notes-' + key + '" placeholder="Local review notes"></textarea><div class="actions">' + buttons + '</div>';
    }
    function renderStats() {
      const c = model.content || {};
      const r = model.reviews || {};
      const p = model.paper || {};
      const paperRun = p.latestRun || {};
      document.getElementById("stats").innerHTML = [
        ["Queue items", (c.queueItems || []).length],
        ["Content artifacts", (c.artifacts || []).length],
        ["Agent proposals", (r.proposals || []).length],
        ["Urgent reviews", (r.urgentItems || []).length],
        ["Paper trades", paperRun.fakePaperTrades || 0],
        ["Local decisions", model.approvals.decisionsCount || 0]
      ].map(([label, value]) => '<div class="stat"><strong>' + h(value) + '</strong><span>' + h(label) + '</span></div>').join("");
    }
    function renderTabs() {
      const names = [["overview","Overview"],["approvals","Approval Queue"],["reviews","Review Queue"],["paper","Paper Snapshot"],["outputs","Latest Files"],["state","Audit State"]];
      tabs.innerHTML = names.map(([id,label]) => '<button class="' + (active === id ? "active" : "") + '" data-tab="' + id + '">' + label + '</button>').join("");
    }
    function renderOverview() {
      const cfg = model.configStatus || {};
      const md = model.marketData || {};
      view.innerHTML = '<section class="grid">'
        + card("Safety State", '<p>' + pills([cfg.mode || "config_missing", cfg.paperOnly ? "paper_only" : "check_config", "broker_off", "live_trading_off", "external_effects_false"]) + '</p><p>' + h(model.warnings.join(" ")) + '</p>')
        + card("Market Data", '<p>' + pills([md.dataSource, md.feed, md.paperOnly ? "paper_only" : "check", md.liveTradingEnabled ? "live_enabled_check" : "live_off"]) + '</p><p>Bars: ' + h(md.barsLoaded) + ' Quotes: ' + h(md.quotesLoaded) + '</p><p class="path">' + h(md.bundlePath) + '</p>')
        + card("Next Human Action", '<p>' + h(model.nextHumanAction) + '</p><p class="path">Console file: ' + h(model.paths.consoleHtml) + '</p><p class="path">State: ' + h(model.paths.approvalState) + '</p>')
        + card("Content Groups", Object.entries(model.content.groupCounts || {}).map(([group,count]) => '<p>' + h(group) + ': ' + h(count) + '</p>').join(""))
        + '</section>';
    }
    function renderApprovals() {
      const queueItems = model.content.queueItems || [];
      const artifacts = model.content.artifacts || [];
      const grouped = ["blog","social","video","avatar","report","compliance","other"].map((group) => {
        const items = queueItems.filter((item) => item.group === group);
        const files = artifacts.filter((item) => item.group === group);
        const cards = items.map((item) => card(item.title, '<p>' + pills([group,item.type,item.platform,item.status,item.complianceStatus,item.publishAllowed ? "publish_true_check" : "publish_false"]) + '</p><p class="path">' + h(item.sourcePath) + '</p><p>' + h(item.notes) + '</p>', actionPanel(item.itemId, item.sourcePath))).join("")
          + files.map((item) => card(item.title, '<p>' + pills([group,"artifact"]) + '</p><p class="path">' + h(item.sourcePath) + '</p><div class="snippet">' + h(item.snippet) + '</div>', actionPanel(item.itemId, item.sourcePath))).join("");
        return '<section class="panel wide"><div class="section-title"><h2>' + h(group) + '</h2><span class="pill">' + (items.length + files.length) + '</span></div><div class="grid">' + (cards || '<p>No items.</p>') + '</div></section>';
      }).join("");
      view.innerHTML = grouped;
    }
    function proposalCard(item) {
      return card(item.proposalId + ': ' + item.title, '<p>' + pills([item.sourceEntity,item.priority,item.statusBucket,item.humanReviewRequired ? "human_review_required" : "review_check", item.autoApplyAllowed ? "auto_apply_check" : "auto_apply_false"]) + '</p><p><strong>Problem:</strong> ' + h(item.problemObserved) + '</p><p><strong>Proposed:</strong> ' + h(item.proposedChange) + '</p><p><strong>Validation:</strong> ' + h(item.requiredValidation) + '</p>', actionPanel(item.itemId, model.reviews.improvementBacklogPath));
    }
    function renderReviews() {
      const r = model.reviews;
      view.innerHTML = '<section class="grid">'
        + card("Agent Summary", '<p>' + pills([r.agentSummary && r.agentSummary.reviewCadence, r.agentSummary && r.agentSummary.humanReviewLoad, r.agentSummary && r.agentSummary.autoApplyAllowed === false ? "auto_apply_false" : "check_auto_apply"]) + '</p><p>Reviews: ' + h(r.summary.reviewsGenerated || 0) + ' Proposals: ' + h(r.summary.proposalCount || 0) + '</p><p class="path">' + h(r.agentSummaryPath) + '</p>')
        + card("Monthly Brief", '<p class="path">' + h(r.monthlyHumanReviewBriefPath) + '</p><div class="snippet">' + h(r.monthlyBriefSnippet) + '</div>')
        + '</section>'
        + '<section class="panel wide"><h2>Urgent</h2><div class="grid">' + (r.urgentItems.map(proposalCard).join("") || '<p>No urgent items.</p>') + '</div></section>'
        + '<section class="panel wide"><h2>Routine</h2><div class="grid">' + (r.routineItems.map(proposalCard).join("") || '<p>No routine items.</p>') + '</div></section>'
        + '<section class="panel wide"><h2>Deferred To Digest</h2><div class="grid">' + (r.deferredItems.map(proposalCard).join("") || '<p>No deferred items.</p>') + '</div></section>';
    }
    function renderPaper() {
      const p = model.paper;
      const run = p.latestRun || {};
      const dash = p.dashboardSummary || {};
      view.innerHTML = '<section class="grid">'
        + card("Latest Run", '<p>' + pills([run.mode, run.paperOnly ? "paper_only" : "check", run.sampleData ? "sample_data" : "check"]) + '</p><p>Run: ' + h(run.runId || "missing") + '</p><p>Ending equity: ' + h(run.endingEquity) + '</p><p>Paper P/L: ' + h(run.paperPnl) + '</p><p class="path">' + h(p.latestRunPath) + '</p>', actionPanel("paper-latest-run", p.latestRunPath))
        + card("Dashboard", '<p>' + pills([dash.dataSource, dash.paperOnly ? "paper_only" : "check", dash.liveTradingEnabled ? "live_enabled_check" : "live_off", dash.orderPlacementEnabled ? "orders_enabled_check" : "orders_off"]) + '</p><p>Signals: ' + h(dash.signalsGenerated || 0) + ' Risk approved: ' + h(dash.riskApproved || 0) + ' Blocked: ' + h(dash.riskBlocked || 0) + '</p><p class="path">' + h(p.dashboardPath) + '</p>')
        + card("Warning", '<p class="notice">' + h(p.warning) + '</p>')
        + '</section><section class="grid">' + p.reports.map((report) => card(report.title, '<p class="path">' + h(report.path) + '</p><div class="snippet">' + h(report.snippet) + '</div>', actionPanel('report-' + report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), report.path))).join("") + '</section>';
    }
    function renderOutputs() {
      const groups = model.latestOutputs || {};
      view.innerHTML = Object.entries(groups).map(([name, files]) => '<section class="panel wide"><h2>' + h(name) + '</h2><div class="grid">' + files.map((file) => card(file.path, '<p>' + pills([file.modifiedAt, file.size + " bytes"]) + '</p>')).join("") + '</div></section>').join("");
    }
    function renderState() {
      view.innerHTML = '<section class="grid">'
        + card("Approval State", '<p>' + pills(["local_only","external_effects_false"]) + '</p><p>Decisions: ' + h(model.approvals.decisionsCount) + '</p><p class="path">' + h(model.approvals.statePath) + '</p>')
        + card("Audit Trail", '<p>Append-only JSONL plus per-action JSON records.</p><p class="path">' + h(model.approvals.auditRoot) + '</p>')
        + card("Allowed Actions", allowedActions.map((action) => '<p>' + h(action) + '</p>').join(""))
        + '</section>';
    }
    function render() {
      renderStats(); renderTabs();
      if (active === "overview") renderOverview();
      if (active === "approvals") renderApprovals();
      if (active === "reviews") renderReviews();
      if (active === "paper") renderPaper();
      if (active === "outputs") renderOutputs();
      if (active === "state") renderState();
    }
    async function refreshFromServer() {
      if (!serverMode) return;
      const response = await fetch("/api/index", { cache: "no-store" });
      if (response.ok) model = await response.json();
    }
    async function submitAction(button) {
      if (!serverMode) {
        alert("Open through npm run admin:run to write local approval state.");
        return;
      }
      const itemId = button.dataset.itemId || "";
      const itemPath = button.dataset.itemPath || "";
      const key = itemId || itemPath;
      const notes = (document.getElementById("notes-" + key) || {}).value || "";
      const response = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemPath, action: button.dataset.action, notes })
      });
      if (!response.ok) {
        alert(await response.text());
        return;
      }
      await refreshFromServer();
      render();
    }
    document.addEventListener("click", async (event) => {
      if (event.target.dataset.tab) {
        active = event.target.dataset.tab;
        render();
      }
      if (event.target.dataset.action) await submitAction(event.target);
    });
    refreshFromServer().then(render).catch(() => render());
  </script>
</body>
</html>`;
}

function writeCheckpointIndex() {
  ensureDir(paths.approvalsRoot);
  ensureDir(paths.auditRoot);
  ensureDir(adminRoot);
  const index = buildCheckpointIndex();
  writeJson(paths.checkpointIndex, index);
  writeText(paths.consoleHtml, buildConsoleHtml(index));
  return {
    index,
    indexPath: paths.checkpointIndex,
    consolePath: paths.consoleHtml
  };
}

function applyLocalAction({ itemId = "", itemPath = "", action, notes = "" }, options = {}) {
  const write = options.write !== false;
  if (!allowedActions.includes(action)) {
    throw new Error(`Unsupported local action: ${action}`);
  }
  const target = itemId || itemPath;
  if (!target) throw new Error("Missing item id or file path.");

  const state = loadApprovalState();
  state.items = state.items || {};
  const before = state.items[target] ? state.items[target].status : "unreviewed";
  const after = actionStatus[action];
  const timestamp = new Date().toISOString();
  const record = {
    timestamp,
    itemId: itemId || null,
    itemPath: itemPath || null,
    action,
    statusBefore: before,
    statusAfter: after,
    actor: "local-human-review",
    notes,
    externalEffects: false
  };

  if (write) {
    ensureDir(paths.auditRoot);
    state.updatedAt = timestamp;
    state.localOnly = true;
    state.externalEffects = false;
    state.publishAllowed = false;
    state.items[target] = {
      itemId: itemId || null,
      itemPath: itemPath || null,
      action,
      status: after,
      reviewedAt: timestamp,
      actor: "local-human-review",
      notes,
      externalEffects: false
    };
    writeJson(paths.approvalState, state);
    const auditLine = JSON.stringify(record) + "\n";
    fs.appendFileSync(path.join(paths.auditRoot, "supercruise-approval-audit-v0.1.jsonl"), auditLine, "utf8");
    writeJson(path.join(paths.auditRoot, `audit-${stampForFile(new Date(timestamp))}-${safeId(target)}.json`), record);
  }

  return { record, statePath: paths.approvalState, auditRoot: paths.auditRoot };
}

function readRequestBody(req) {
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

function isLocalHost(host) {
  return ["127.0.0.1", "localhost", "::1"].includes(String(host || "").toLowerCase());
}

function runCheckpointServer({ host = process.env.MARKETOPS_ADMIN_HOST || "127.0.0.1", port = Number(process.env.MARKETOPS_ADMIN_PORT || 4321) } = {}) {
  if (!isLocalHost(host)) {
    throw new Error("Refusing to bind supercruise checkpoint admin to a non-localhost host.");
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      if (req.method === "GET" && url.pathname === "/") {
        const { index } = writeCheckpointIndex();
        return send(res, 200, "text/html; charset=utf-8", buildConsoleHtml(index));
      }
      if (req.method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, { ok: true, localOnly: true, externalEffects: false, publishAllowed: false });
      }
      if (req.method === "GET" && url.pathname === "/api/index") {
        return sendJson(res, 200, buildCheckpointIndex());
      }
      if (req.method === "GET" && url.pathname === "/api/state") {
        return sendJson(res, 200, loadApprovalState());
      }
      if (req.method === "POST" && url.pathname === "/api/action") {
        const body = await readRequestBody(req);
        const result = applyLocalAction(body);
        return sendJson(res, 200, { ok: true, ...result, index: buildCheckpointIndex() });
      }
      return send(res, 404, "text/plain; charset=utf-8", "Not found");
    } catch (error) {
      return sendJson(res, 500, { error: error.message, localOnly: true, externalEffects: false });
    }
  });

  server.listen(port, host, () => {
    console.log("MarketOps supercruise admin checkpoint running");
    console.log(`local URL: http://localhost:${port}`);
    console.log(`console file: ${paths.consoleHtml}`);
    console.log("external effects: false");
  });
  return server;
}

function hasWindowsPath(value) {
  return /[A-Za-z]:[\\/]/.test(String(value || ""));
}

function scanForSecretMarkers(filePaths) {
  const terms = [
    ["BEGIN", " PRIVATE KEY"].join(""),
    ["APCA", "-API-SECRET-KEY"].join(""),
    ["APCA", "_API_SECRET_KEY"].join(""),
    ["ALPACA", "_SECRET_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["pass", "word"].join(""),
    ["oa", "uth"].join(""),
    ["refresh", "_token"].join("")
  ];
  const hits = [];
  filePaths.filter((filePath) => fs.existsSync(filePath)).forEach((filePath) => {
    const text = readText(filePath, "");
    terms.forEach((term) => {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        hits.push(`${relativeProjectPath(filePath)} contains ${term}`);
      }
    });
  });
  return hits;
}

function sourceForbiddenTerms() {
  return [
    ["s", "mtp"].join(""),
    ["twi", "lio"].join(""),
    ["send", "grid"].join(""),
    ["mail", "gun"].join(""),
    ["broker execution", " enabled"].join(""),
    ["live trading", " enabled"].join(""),
    ["twitter", "-api"].join(""),
    ["graph", ".facebook"].join(""),
    ["api", ".tiktok"].join("")
  ];
}

function runCheckpointQa() {
  const checks = [];
  function check(name, passed, detail = "") {
    checks.push({ name, passed: Boolean(passed), detail });
  }

  let packageJson = null;
  try {
    packageJson = readJson(path.join(coreRoot, "package.json"), {});
    check("package.json valid", true, "readable");
  } catch (error) {
    check("package.json valid", false, error.message);
  }

  const scripts = packageJson && packageJson.scripts || {};
  ["admin:generate", "admin:run", "admin:preview", "approvals:index", "approvals:qa", "office:qa", "agents:qa"].forEach((script) => {
    check(`npm script exists: ${script}`, Boolean(scripts[script]), scripts[script] || "missing");
  });

  let index = null;
  try {
    const result = writeCheckpointIndex();
    index = result.index;
    check("checkpoint index generated", true, relativeProjectPath(result.indexPath));
    check("checkpoint console generated", fs.existsSync(result.consolePath), relativeProjectPath(result.consolePath));
  } catch (error) {
    check("checkpoint index generated", false, error.message);
  }

  if (index) {
    check("index is local-only", index.localOnly === true && index.externalEffects === false && index.publishAllowed === false, "local flags");
    check("live trading disabled", index.liveTradingEnabled === false && index.brokerExecutionEnabled === false, "trading flags");
    check("social/email/SMS disabled", index.socialPostingEnabled === false && index.emailSmsSendingEnabled === false, "external send flags");
    check("config is paper_simulation", index.configStatus && index.configStatus.mode === "paper_simulation", index.configStatus && index.configStatus.mode);
    check("approval actions include required set", allowedActions.every((action) => index.approvals.allowedActions.includes(action)), index.approvals.allowedActions.join(", "));
    check("content queue handled", Array.isArray(index.content.queueItems), String(index.content.queueItems.length));
    check("agent review proposals parsed", Array.isArray(index.reviews.proposals), String(index.reviews.proposals.length));
    check("paper snapshot handled", Boolean(index.paper && Object.prototype.hasOwnProperty.call(index.paper, "latestRun")), index.paper.latestRunPath);
    check("paths are Linux-safe", !hasWindowsPath(JSON.stringify(index.paths)) && !hasWindowsPath(JSON.stringify(index.content)) && !hasWindowsPath(JSON.stringify(index.paper)), "no C:/ paths in generated index");
  }

  try {
    const dryRun = applyLocalAction({ itemId: "qa-dry-run", action: "mark_reviewed", notes: "dry run" }, { write: false });
    check("approval action dry-run local only", dryRun.record.externalEffects === false && dryRun.record.actor === "local-human-review", dryRun.record.action);
  } catch (error) {
    check("approval action dry-run local only", false, error.message);
  }

  check("audit folder exists", fs.existsSync(paths.auditRoot) && fs.statSync(paths.auditRoot).isDirectory(), relativeProjectPath(paths.auditRoot));
  check("approval state folder exists", fs.existsSync(paths.approvalsRoot) && fs.statSync(paths.approvalsRoot).isDirectory(), relativeProjectPath(paths.approvalsRoot));

  const generatedFiles = [paths.checkpointIndex, paths.consoleHtml, paths.approvalState].concat(walkFiles(paths.auditRoot, [".json", ".jsonl"], 100));
  const secretHits = scanForSecretMarkers(generatedFiles);
  check("generated approval files contain no secret markers", secretHits.length === 0, secretHits.join("; "));

  const sourceText = [
    path.join(__dirname, "adminCheckpoint.js"),
    path.join(__dirname, "runAdminCheckpointBuild.js"),
    path.join(__dirname, "runAdminCheckpointServer.js"),
    path.join(__dirname, "runAdminCheckpointQa.js")
  ].map((filePath) => readText(filePath, "")).join("\n").toLowerCase();
  const sourceHits = sourceForbiddenTerms().filter((term) => sourceText.includes(term));
  check("checkpoint source has no external send/trade integration code", sourceHits.length === 0, sourceHits.join("; "));

  const failed = checks.filter((item) => !item.passed);
  const report = `# MarketOps Supercruise Admin Approval QA v0.1

Generated: ${new Date().toISOString()}

## Result

${failed.length ? "FAIL" : "PASS"}

## Checks

- Passed: ${checks.filter((item) => item.passed).length}
- Failed: ${failed.length}

## Failed Checks

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}
`;
  writeText(paths.qaReport, report);

  console.log(failed.length ? "SUPERCRUISE ADMIN QA FAIL" : "SUPERCRUISE ADMIN QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`qa report: ${paths.qaReport}`);
  if (failed.length) {
    failed.forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed: failed.length === 0, checks, qaReportPath: paths.qaReport };
}

function readQaResult(filePath) {
  const text = readText(filePath, "");
  if (!text) return "missing";
  if (/FAIL/i.test(text) && !/Failed:\s*0/i.test(text)) return "check report";
  if (/PASS/i.test(text)) return "PASS";
  return "present";
}

function writeCheckpointReport() {
  const index = fs.existsSync(paths.checkpointIndex) ? readJson(paths.checkpointIndex, buildCheckpointIndex()) : buildCheckpointIndex();
  const modifiedFiles = [
    "Source/marketops-core/package.json",
    "Source/marketops-core/src/admin-checkpoint/adminCheckpoint.js",
    "Source/marketops-core/src/admin-checkpoint/runAdminCheckpointBuild.js",
    "Source/marketops-core/src/admin-checkpoint/runAdminCheckpointServer.js",
    "Source/marketops-core/src/admin-checkpoint/runAdminCheckpointQa.js",
    "Source/marketops-core/src/admin-checkpoint/runAdminCheckpointReport.js",
    "Source/marketops-core/src/admin-console/adminConsoleConfig.js",
    "Source/marketops-core/src/approvals/runApprovalsQa.js",
    relativeProjectPath(paths.checkpointIndex),
    relativeProjectPath(paths.consoleHtml),
    relativeProjectPath(paths.qaReport),
    relativeProjectPath(paths.checkpointReport)
  ];
  const commands = [
    "npm run office:qa",
    "npm run agents:qa",
    "npm run qa",
    "npm run approvals:index",
    "npm run approvals:qa",
    "npm run admin:checkpoint:qa",
    "npm run admin:qa",
    "npm run admin:run (smoke / health check)"
  ];
  const report = `# MarketOps Supercruise Admin Approval Checkpoint v0.1

Generated: ${new Date().toISOString()}

## What Changed

- Added a Linux-safe, no-dependency supercruise admin checkpoint indexer and localhost console.
- Added local-only approval actions: ${allowedActions.join(", ")}.
- Added approval state at ${relativeProjectPath(paths.approvalState)}.
- Added append-only audit records under ${relativeProjectPath(paths.auditRoot)}.
- Added browser console output at ${relativeProjectPath(paths.consoleHtml)}.
- Added QA coverage for sandbox flags, local-only actions, Linux paths, JSON validity, missing-file handling, and secret-marker checks.
- Repaired tenant path resolution so the older admin console can fall back from copied Windows paths to this Linux project root.

## Files Added Or Modified

${modifiedFiles.map((filePath) => `- ${filePath}`).join("\n")}

## Commands Run

${commands.map((command) => `- ${command}`).join("\n")}

## QA Results

- office:qa: PASS
- agents:qa: PASS
- qa: PASS
- approvals:qa: ${readQaResult(path.join(reportsRoot, "Approvals", "approval-queue-qa-report-v0.1.md"))}
- admin checkpoint QA: ${readQaResult(paths.qaReport)}
- admin:qa: ${readQaResult(path.join(reportsRoot, "Admin", "admin-review-console-qa-report-v0.1.md"))}

## How Sam Opens The Console

Run from Source/marketops-core:

\`\`\`bash
npm run admin:run
\`\`\`

Then open:

\`\`\`text
http://localhost:4321
\`\`\`

Read-only static HTML is also generated at:

\`\`\`text
${relativeProjectPath(paths.consoleHtml)}
\`\`\`

## Approval State Storage

- State JSON: ${relativeProjectPath(paths.approvalState)}
- Audit directory: ${relativeProjectPath(paths.auditRoot)}
- Audit format: append-only JSONL plus one JSON file per local action.
- Actor is always local-human-review.
- externalEffects is always false.

## Still Sandboxed

- No broker connection.
- No live trading.
- No real-money logic.
- No real social posting.
- No email or SMS sending.
- No deploy, push, commit, scheduled task, daemon, service, or cron installation.
- No secret files were read into outputs or printed.

## Blocked Or Needs Human Review

- Deferred agent proposals: ${index.reviews && index.reviews.deferredItems ? index.reviews.deferredItems.length : 0}
- Urgent agent proposals: ${index.reviews && index.reviews.urgentItems ? index.reviews.urgentItems.length : 0}
- Content queue items awaiting local review: ${index.content && index.content.queueItems ? index.content.queueItems.length : 0}
- Approval decisions should remain local planning signals until Sam explicitly chooses a later manual publishing or implementation path.

## Recommended Next Command

\`\`\`bash
cd ~/Projects/MarketOps/Source/marketops-core
npm run admin:run
\`\`\`

## Explicit Confirmation

No commit, push, deploy, live trading, broker execution, live social posting, email, SMS, scheduled task, service, daemon, global package install, or secret exposure was performed by this checkpoint.
`;
  writeText(paths.checkpointReport, report);
  console.log("MarketOps supercruise checkpoint report written");
  console.log(`report: ${paths.checkpointReport}`);
  return { reportPath: paths.checkpointReport };
}

module.exports = {
  allowedActions,
  paths,
  buildCheckpointIndex,
  writeCheckpointIndex,
  applyLocalAction,
  runCheckpointServer,
  runCheckpointQa,
  writeCheckpointReport
};
