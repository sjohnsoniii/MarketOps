const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const dataRoot = path.join(projectRoot, "Data");
const reviewRoot = path.join(dataRoot, "agent-reviews");
const archiveRoot = path.join(reviewRoot, "archive");

const reviewPaths = {
  coreRoot,
  projectRoot,
  dataRoot,
  reviewRoot,
  archiveRoot,
  packageJson: path.join(coreRoot, "package.json"),
  dashboardBundle: path.join(projectRoot, "..", "sj3labs", "data", "marketops", "dashboard-bundle-public-v0.4.json"),
  officeSummary: path.join(dataRoot, "content", "queue", "latest-office-run-summary.json"),
  contentQueue: path.join(dataRoot, "content", "queue", "content-queue-v0.1.json"),
  complianceReport: path.join(dataRoot, "content", "compliance", "content-compliance-report-v0.1.md"),
  latestPaperRun: path.join(dataRoot, "paper", "history", "latest-run-summary.json"),
  dashboardRefreshHealth: path.join(dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json"),
  latestAgentSummary: path.join(reviewRoot, "latest-agent-review-summary.json"),
  improvementBacklog: path.join(reviewRoot, "improvement-backlog-v0.1.md"),
  monthlyBrief: path.join(reviewRoot, "monthly-human-review-brief-v0.1.md"),
  biweeklyDigest: path.join(reviewRoot, "biweekly-review-digest-v0.1.md"),
  observationHistory: path.join(archiveRoot, "agent-observation-history-v0.1.json")
};

const reviewFiles = [
  { key: "coordinator", entityName: "Coordinator", fileName: "coordinator-review-v0.1.md", category: "Automation / QA" },
  { key: "marketData", entityName: "Market Data Desk", fileName: "market-data-review-v0.1.md", category: "Data Quality" },
  { key: "signal", entityName: "Signal Desk", fileName: "signal-review-v0.1.md", category: "Trading / Signals" },
  { key: "risk", entityName: "Risk Desk", fileName: "risk-desk-review-v0.1.md", category: "Risk" },
  { key: "paperTrader", entityName: "Paper Trader", fileName: "paper-trader-review-v0.1.md", category: "Paper Execution" },
  { key: "performance", entityName: "Performance Desk", fileName: "performance-review-v0.1.md", category: "Dashboard / Reporting" },
  { key: "staffWriter", entityName: "Staff Writer", fileName: "staff-writer-review-v0.1.md", category: "Staff Writer / Blogs" },
  { key: "growth", entityName: "Growth Desk", fileName: "growth-desk-review-v0.1.md", category: "Growth Desk / Social" },
  { key: "video", entityName: "Video Desk", fileName: "video-desk-review-v0.1.md", category: "Video / Avatar Content" },
  { key: "videoGenerationSpecialist", entityName: "Video Generation Specialist", fileName: "video-generation-specialist-review-v0.1.md", category: "Video / Avatar Content" },
  { key: "avatar", entityName: "Avatar Desk", fileName: "avatar-desk-review-v0.1.md", category: "Video / Avatar Content" },
  { key: "compliance", entityName: "Compliance Desk", fileName: "compliance-desk-review-v0.1.md", category: "Compliance" }
].map((item) => ({ ...item, path: path.join(reviewRoot, item.fileName) }));

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
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

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function loadReviewInputs() {
  const dashboard = readJson(reviewPaths.dashboardBundle, {});
  const officeSummary = readJson(reviewPaths.officeSummary, {});
  const queue = readJson(reviewPaths.contentQueue, { items: [] });
  const paperRun = readJson(reviewPaths.latestPaperRun, {});
  const complianceText = readText(reviewPaths.complianceReport, "");
  const refreshHealth = readJson(reviewPaths.dashboardRefreshHealth, {});
  const generatedAt = new Date().toISOString();

  return {
    generatedAt,
    dashboard,
    officeSummary,
    queue,
    paperRun,
    complianceText,
    runId: paperRun.runId || (dashboard.runHistorySummary && dashboard.runHistorySummary.runId) || "latest-paper-run",
    mode: dashboard.mode || officeSummary.mode || "paper_simulation",
    paperOnly: dashboard.paperOnly !== false,
    sampleData: dashboard.sampleData !== false,
    queueItems: Array.isArray(queue.items) ? queue.items.length : 0,
    complianceStatus: officeSummary.complianceStatus || (complianceText.includes("Status: passed") ? "passed" : "unknown"),
    nextSuggestedReviewWindow: addDaysIso(14),
    refreshHealth: {
      lastStatus: refreshHealth.lastStatus || "UNKNOWN",
      lastAttemptAt: refreshHealth.lastAttemptAt || null,
      lastSuccessfulRefreshAt: refreshHealth.lastSuccessfulRefreshAt || null,
      lastFailureAt: refreshHealth.lastFailureAt || null,
      consecutiveFailures: typeof refreshHealth.consecutiveFailures === "number" ? refreshHealth.consecutiveFailures : 0,
      staleWarning: refreshHealth.staleWarning || null,
      refreshIntervalTargetHours: refreshHealth.refreshIntervalTargetHours || 2,
      schedulerInstalled: refreshHealth.schedulerInstalled === true,
      paperOnly: true
    }
  };
}

function proposal(id, sourceEntity, category, title, problemObserved, proposedChange, expectedBenefit, riskOfChange, requiredValidation, priority = "review_next_digest") {
  return {
    proposalId: id,
    sourceEntity,
    category,
    proposalTitle: title,
    problemObserved,
    proposedChange,
    expectedBenefit,
    riskOfChange,
    requiredValidation,
    recommendedPriority: priority === "urgent_human_review" ? "high" : priority === "routine" ? "low" : "medium",
    priority,
    promotionPath: "idea -> experiment -> paper test -> QA -> human review -> approved change",
    humanReviewRequired: true,
    autoApplyAllowed: false
  };
}

function proposalMarkdown(items) {
  return items.map((item) => `### ${item.proposalId}: ${item.proposalTitle}\n\n- proposalId: ${item.proposalId}\n- sourceEntity: ${item.sourceEntity}\n- problemObserved: ${item.problemObserved}\n- proposedChange: ${item.proposedChange}\n- expectedBenefit: ${item.expectedBenefit}\n- riskOfChange: ${item.riskOfChange}\n- requiredValidation: ${item.requiredValidation}\n- recommendedPriority: ${item.recommendedPriority}\n- priority: ${item.priority}\n- promotionPath: ${item.promotionPath}\n- humanReviewRequired: ${item.humanReviewRequired}\n- autoApplyAllowed: ${item.autoApplyAllowed}`).join("\n\n");
}

module.exports = {
  reviewPaths,
  reviewFiles,
  ensureDir,
  readJson,
  readText,
  writeJson,
  writeText,
  formatMoney,
  formatPct,
  loadReviewInputs,
  proposal,
  proposalMarkdown
};

