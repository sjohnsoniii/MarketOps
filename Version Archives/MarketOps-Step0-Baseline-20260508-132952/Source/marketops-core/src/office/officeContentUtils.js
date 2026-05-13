const fs = require("fs");
const path = require("path");
const { paths } = require("../utils/paths");
const { ensureDir, writeJson, loadJson, fileExists } = require("../utils/fileStore");

function readJson(filePath, fallback = null) {
  if (!fileExists(filePath)) return fallback;
  return loadJson(filePath);
}

function ensureOfficeContentDirs() {
  [
    paths.contentRoot,
    paths.contentBlogsRoot,
    paths.contentReportsRoot,
    paths.contentSocialRoot,
    paths.contentSocialXRoot,
    paths.contentSocialInstagramRoot,
    paths.contentSocialFacebookRoot,
    paths.contentSocialLinkedinRoot,
    paths.contentVideoRoot,
    paths.contentAvatarRoot,
    paths.contentQueueRoot,
    paths.contentComplianceRoot,
    paths.contentArchiveRoot,
    paths.logsRoot
  ].forEach(ensureDir);
}

function writeMarkdown(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
}

function formatMoney(value) {
  const number = Number(value || 0);
  return `$${number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value) {
  const number = Number(value || 0);
  return `${number.toFixed(2)}%`;
}

function loadOfficeInputs() {
  const dashboard = readJson(paths.siteDashboardPublicV04Json, readJson(paths.dashboardJson, {})) || {};
  const risk = readJson(paths.riskJson, {}) || {};
  const trades = readJson(paths.tradesJson, {}) || {};
  const latestRun = readJson(paths.latestRunSummaryJson, {}) || {};

  return {
    dashboard,
    risk,
    trades,
    latestRun,
    generatedAt: new Date().toISOString()
  };
}

function buildStats(inputs) {
  const dashboard = inputs.dashboard || {};
  const pnlPoints = Array.isArray(dashboard.pnlPoints) ? dashboard.pnlPoints : [];
  const riskMix = dashboard.riskDecisionMix || {};
  const notablePnl = pnlPoints.length
    ? pnlPoints.slice().sort((a, b) => Math.abs(Number(b.paperPnl || 0)) - Math.abs(Number(a.paperPnl || 0)))[0]
    : null;

  return {
    mode: dashboard.mode || "paper_simulation",
    paperOnly: dashboard.paperOnly !== false,
    sampleData: dashboard.sampleData !== false,
    generatedAt: inputs.generatedAt,
    startingBalance: Number(dashboard.startingBalance || 0),
    endingEquity: Number(dashboard.endingEquity || 0),
    paperPnl: Number(dashboard.paperPnl || 0),
    paperReturnPct: Number(dashboard.paperReturnPct || 0),
    maxDrawdownPct: Number(dashboard.maxDrawdownPct || 0),
    vehiclesScanned: Number(dashboard.vehiclesScanned || 0),
    signalsReviewed: Number(dashboard.signalsReviewed || 0),
    riskApproved: Number(dashboard.riskApproved ?? riskMix.approved ?? 0),
    riskBlocked: Number(dashboard.riskBlocked ?? riskMix.blocked ?? 0),
    fakePaperTrades: Number(dashboard.fakePaperTrades || pnlPoints.length || 0),
    notableVehicle: notablePnl ? notablePnl.vehicle : "the sample basket",
    notablePaperPnl: notablePnl ? Number(notablePnl.paperPnl || 0) : 0,
    runId: inputs.latestRun.runId || (dashboard.runHistorySummary && dashboard.runHistorySummary.runId) || "latest-paper-run"
  };
}

function publicDisclaimer() {
  return "Paper simulation and sample-data preview only. Not real performance. Not financial advice.";
}

function queueDefaults() {
  return {
    status: "draft_review_required",
    publishAllowed: false,
    complianceStatus: "pending_scan"
  };
}

function safeContentItem({ id, platform, postText, sourceReport, contentType, riskLevel }) {
  return {
    id,
    platform,
    postText,
    sourceReport,
    contentType,
    riskLevel,
    status: "draft_review_required",
    publishAllowed: false,
    disclaimerShort: "Paper simulation/sample-data preview only. Not financial advice."
  };
}

module.exports = {
  ensureOfficeContentDirs,
  writeMarkdown,
  writeJson,
  readJson,
  formatMoney,
  formatPct,
  loadOfficeInputs,
  buildStats,
  publicDisclaimer,
  queueDefaults,
  safeContentItem
};


