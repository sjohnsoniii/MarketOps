const fs = require("fs");
const path = require("path");

const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { refreshJsonPath, refreshReportPath } = require("./runDashboardRefresh");
const { healthJsonPath } = require("./refreshHealthTracker");

const qaReportPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-dashboard-refresh-qa-v0.1.md");
const localDashboardPath = path.join(paths.projectRoot, "Data", "dashboard", "dashboard-public-safe-v0.1.json");
const previewHtmlPath = path.join(paths.projectRoot, "Admin", "dashboard-preview", "marketops-dashboard-preview-v0.1.html");
const shareableSnapshotPath = path.join(paths.dataRoot, "dashboard", "marketops-shareable-snapshot-v0.1.json");
const sharePacketPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-public-share-packet-v0.1.md");
const shareableReportPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-shareable-snapshot-v0.1.md");
const contentPackPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-content-pack-draft-v0.1.md");
const siteIntegrationPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-site-integration-handoff-v0.1.md");

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function restrictedTerms() {
  return [
    ["APCA", "-API-KEY-ID"].join(""),
    ["APCA", "-API-SECRET-KEY"].join(""),
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["BEGIN", " PRIVATE KEY"].join(""),
    ["C:", "\\Users"].join(""),
    "bidPrice",
    "askPrice",
    "firstClose",
    "latestClose",
    ["liveTrading", ": true"].join(""),
    ["orderPlacement", "Enabled\": true"].join("")
  ];
}

function scanFiles(files) {
  const hits = [];
  files.filter((filePath) => fs.existsSync(filePath)).forEach((filePath) => {
    const text = readText(filePath);
    restrictedTerms().forEach((term) => {
      if (text.includes(term)) hits.push(`${path.relative(paths.projectRoot, filePath)} contains restricted marker`);
    });
  });
  return hits;
}

function buildReport(checks) {
  const failed = checks.filter((item) => !item.passed);
  return `# MarketOps Dashboard Refresh QA v0.1

Generated: ${new Date().toISOString()}

## Result

${failed.length ? "FAIL" : "PASS"}

## Checks

- Passed: ${checks.filter((item) => item.passed).length}
- Failed: ${failed.length}

## Failed Checks

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}
`;
}

function runDashboardRefreshQa() {
  const checks = [];
  const packageJson = loadJson(path.join(paths.coreRoot, "package.json"));
  ["dashboard:refresh", "dashboard:refresh:qa", "dashboard:preview", "cycle:build", "cycle:qa", "cycle:status"].forEach((scriptName) => {
    check(checks, `script exists: ${scriptName}`, Boolean(packageJson.scripts && packageJson.scripts[scriptName]), packageJson.scripts && packageJson.scripts[scriptName]);
  });

  check(checks, "refresh JSON exists", fileExists(refreshJsonPath), refreshJsonPath);
  check(checks, "refresh report exists", fileExists(refreshReportPath), refreshReportPath);
  check(checks, "local dashboard bundle exists", fileExists(localDashboardPath), localDashboardPath);
  check(checks, "public dashboard bundle exists", fileExists(paths.siteDashboardPublicV04Json), paths.siteDashboardPublicV04Json);

  let summary = null;
  try {
    summary = loadJson(refreshJsonPath);
    check(checks, "refresh JSON valid", true, refreshJsonPath);
  } catch (error) {
    check(checks, "refresh JSON valid", false, error.message);
  }

  if (summary) {
    check(checks, "refresh status PASS", summary.status === "PASS", summary.status);
    check(checks, "paperOnly true", summary.paperOnly === true, String(summary.paperOnly));
    check(checks, "externalEffects false", summary.externalEffects === false, String(summary.externalEffects));
    check(checks, "publishAllowed false", summary.publishAllowed === false, String(summary.publishAllowed));
    check(checks, "liveTradingEnabled false", summary.liveTradingEnabled === false, String(summary.liveTradingEnabled));
    check(checks, "brokerExecutionEnabled false", summary.brokerExecutionEnabled === false, String(summary.brokerExecutionEnabled));
    check(checks, "socialPostingEnabled false", summary.socialPostingEnabled === false, String(summary.socialPostingEnabled));
    check(checks, "emailSmsSendingEnabled false", summary.emailSmsSendingEnabled === false, String(summary.emailSmsSendingEnabled));
    check(checks, "rawMarketDataPublished false", summary.rawMarketDataPublished === false, String(summary.rawMarketDataPublished));
    check(checks, "cycle summary present", Boolean(summary.cycle && summary.cycle.cycleId && summary.cycle.status), JSON.stringify(summary.cycle || {}));
    check(checks, "market data source/feed present", Boolean(summary.marketData && summary.marketData.source && summary.marketData.feed), JSON.stringify(summary.marketData || {}));
    check(checks, "market data bars and quotes loaded", Number(summary.marketData && summary.marketData.barsLoaded || 0) > 0 && Number(summary.marketData && summary.marketData.quotesLoaded || 0) > 0, `${summary.marketData && summary.marketData.barsLoaded}/${summary.marketData && summary.marketData.quotesLoaded}`);
    check(checks, "steps captured", Array.isArray(summary.steps) && summary.steps.length >= 7 && summary.steps.every((step) => step.status === "PASS"), `${summary.steps && summary.steps.length} step(s)`);
    check(checks, "chart statuses present", Array.isArray(summary.dashboard && summary.dashboard.chartStatuses) && summary.dashboard.chartStatuses.length >= 17, `${summary.dashboard && summary.dashboard.chartStatuses && summary.dashboard.chartStatuses.length}`);
    check(checks, "required charts updated or fallback-labeled", (summary.dashboard.chartStatuses || []).every((item) => item.status === "updated" || item.fallback === true), "chart status set");
    if (summary.status !== "PASS") {
      check(checks, "FAIL summary has failureReason", Boolean(summary.failureReason), summary.failureReason || "missing");
      check(checks, "FAIL summary has lastKnownGoodPreserved flag", "lastKnownGoodPreserved" in summary, String(summary.lastKnownGoodPreserved));
    }
  }

  check(checks, "refresh health JSON exists", fileExists(healthJsonPath), healthJsonPath);

  let health = null;
  try {
    health = loadJson(healthJsonPath);
    check(checks, "refresh health JSON valid", true, healthJsonPath);
  } catch (error) {
    check(checks, "refresh health JSON valid", false, error.message);
  }

  if (health) {
    check(checks, "health lastStatus present", Boolean(health.lastStatus), health.lastStatus || "missing");
    check(checks, "health lastAttemptAt present", Boolean(health.lastAttemptAt), health.lastAttemptAt || "missing");
    check(checks, "health consecutiveFailures is number", typeof health.consecutiveFailures === "number", String(health.consecutiveFailures));
    check(checks, "health refreshIntervalTargetHours is 2", health.refreshIntervalTargetHours === 2, String(health.refreshIntervalTargetHours));
    check(checks, "health schedulerInstalled is false", health.schedulerInstalled === false, String(health.schedulerInstalled));
    if (health.staleWarning) {
      check(checks, "health staleWarning present when stale", true, health.staleWarning);
    }
    if (health.lastStatus !== "PASS") {
      check(checks, "health failureReason present when not PASS", Boolean(health.failureReason), health.failureReason || "missing");
    }
  }

  let localBundle = null;
  try {
    localBundle = loadJson(localDashboardPath);
    check(checks, "local dashboard JSON valid", true, localDashboardPath);
  } catch (error) {
    check(checks, "local dashboard JSON valid", false, error.message);
  }

  if (localBundle) {
    ["paperEquityCurve", "paperPnlSeries", "drawdownSeries", "watchlistMovementSummary", "vehicleDirectionCounts", "movementBuckets", "signalCandidatesGenerated", "signalConfidenceDistribution", "riskRejectionReasons", "almostApprovedCandidates", "vehicleActivity", "signalRiskCounts", "cumulativePaperPnl", "targetProgress", "tradeOutcomeMix", "riskDecisionMix", "vehicleContribution", "returnVsDrawdownSnapshot", "paperAccountMilestoneStrip", "signalFunnel", "marketDataFreshnessPanel", "recentMarketMovementPanel", "botActivityTimeline", "staleDataWarningPanel", "marketRegimeSummary", "paperCycleStatus"].forEach((key) => {
      const value = localBundle.charts && localBundle.charts[key];
      const count = Array.isArray(value) ? value.length : value && Array.isArray(value.currentRun) ? value.currentRun.length : 0;
      check(checks, `chart non-empty: ${key}`, count > 0, String(count));
    });
    check(checks, "local dashboard data source label exists", Boolean(localBundle.dataSource && localBundle.marketDataMode), `${localBundle.dataSource}/${localBundle.marketDataMode}`);
    check(checks, "freshness labels exist", Boolean(localBundle.dashboardCards && localBundle.dashboardCards.marketDataFreshnessPanel && localBundle.dashboardCards.marketDataFreshnessPanel.refreshFreshnessLabel), "marketDataFreshnessPanel");
  }

  let publicBundle = null;
  try {
    publicBundle = loadJson(paths.siteDashboardPublicV04Json);
    check(checks, "public dashboard JSON valid", true, paths.siteDashboardPublicV04Json);
  } catch (error) {
    check(checks, "public dashboard JSON valid", false, error.message);
  }

  if (publicBundle) {
    check(checks, "public paperOnly true", publicBundle.paperOnly === true, String(publicBundle.paperOnly));
    check(checks, "public externalEffects false", publicBundle.externalEffects === false, String(publicBundle.externalEffects));
    check(checks, "public publishAllowed false", publicBundle.publishAllowed === false, String(publicBundle.publishAllowed));
    check(checks, "public liveTradingEnabled false", publicBundle.liveTradingEnabled === false, String(publicBundle.liveTradingEnabled));
    check(checks, "public bot activity visible", Array.isArray(publicBundle.botActivityTimeline) && publicBundle.botActivityTimeline.length > 0, `${(publicBundle.botActivityTimeline || []).length}`);
    check(checks, "public freshness visible", Boolean(publicBundle.marketDataFreshnessPanel && publicBundle.marketDataFreshnessPanel.refreshFreshnessLabel), "marketDataFreshnessPanel");
    check(checks, "public movement summaries visible", Boolean(publicBundle.watchlistMovementSummary && publicBundle.watchlistMovementSummary.summaryRows && publicBundle.watchlistMovementSummary.summaryRows.length), "watchlistMovementSummary");
    check(checks, "public rejection explanations summarized", Array.isArray(publicBundle.riskRejectionReasons) && publicBundle.riskRejectionReasons.length > 0, "riskRejectionReasons");
    check(checks, "public cycle status visible", publicBundle.paperCycleStatus && publicBundle.paperCycleStatus.doesNotResetDaily === true, "paperCycleStatus");
  }

  check(checks, "trade rejection explainability report exists", fileExists(paths.tradeRejectionExplainabilityReport), paths.tradeRejectionExplainabilityReport);
  check(checks, "cycle latest exists", fileExists(paths.cycleLatestJson), paths.cycleLatestJson);
  check(checks, "cycle QA report exists", fileExists(paths.cycleQaReport), paths.cycleQaReport);

  check(checks, "shareable snapshot JSON exists", fileExists(shareableSnapshotPath), shareableSnapshotPath);
  check(checks, "shareable snapshot report exists", fileExists(shareableReportPath), shareableReportPath);
  check(checks, "share packet exists", fileExists(sharePacketPath), sharePacketPath);
  check(checks, "data provenance report exists", fileExists(path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-data-provenance-v0.1.md")), "marketops-data-provenance-v0.1.md");

  if (publicBundle) {
    check(checks, "public bundle has dataProvenance field", Boolean(publicBundle.dataProvenance), "dataProvenance");
    check(checks, "public bundle dataProvenance has disclaimer", Boolean(publicBundle.dataProvenance && publicBundle.dataProvenance.disclaimer), "dataProvenance.disclaimer");
    check(checks, "public bundle dataProvenance has chartDataSources", Boolean(publicBundle.dataProvenance && publicBundle.dataProvenance.chartDataSources), "dataProvenance.chartDataSources");
  }

  if (localBundle) {
    check(checks, "local bundle has dataProvenance field", Boolean(localBundle.dataProvenance), "dataProvenance");
    check(checks, "local bundle has chartDataSources field", Boolean(localBundle.chartDataSources), "chartDataSources");
    check(checks, "local bundle chartDataSources has equityCurve label", Boolean(localBundle.chartDataSources && localBundle.chartDataSources.equityCurve), "chartDataSources.equityCurve");
  }

  let snapshot = null;
  try {
    snapshot = loadJson(shareableSnapshotPath);
    check(checks, "shareable snapshot JSON valid", true, shareableSnapshotPath);
  } catch (error) {
    check(checks, "shareable snapshot JSON valid", false, error.message);
  }

  if (snapshot) {
    check(checks, "snapshot mode is paper_simulation", snapshot.mode === "paper_simulation", snapshot.mode);
    check(checks, "snapshot paperOnly true", snapshot.paperOnly === true, String(snapshot.paperOnly));
    check(checks, "snapshot notFinancialAdvice true", snapshot.notFinancialAdvice === true, String(snapshot.notFinancialAdvice));
    check(checks, "snapshot has paperCycle status", Boolean(snapshot.snapshot && snapshot.snapshot.paperCycle && snapshot.snapshot.paperCycle.status), snapshot.snapshot.paperCycle.status);
    check(checks, "snapshot has refresh status", Boolean(snapshot.snapshot && snapshot.snapshot.refreshStatus && snapshot.snapshot.refreshStatus.lastStatus), snapshot.snapshot.refreshStatus.lastStatus);
    check(checks, "snapshot has active preset", Boolean(snapshot.snapshot && snapshot.snapshot.preset && snapshot.snapshot.preset.activePreset), snapshot.snapshot.preset.activePreset);
    check(checks, "snapshot has disclaimers", Array.isArray(snapshot.snapshot.disclaimers) && snapshot.snapshot.disclaimers.length > 0, String(snapshot.snapshot.disclaimers.length));
    check(checks, "snapshot schedulerInstalled false", snapshot.snapshot.refreshStatus.schedulerInstalled === false, String(snapshot.snapshot.refreshStatus.schedulerInstalled));
    if (snapshot.snapshot && snapshot.snapshot.refreshStatus) {
      check(checks, "snapshot refreshStatus has failureReason field", "failureReason" in snapshot.snapshot.refreshStatus, snapshot.snapshot.refreshStatus.failureReason || "null");
      check(checks, "snapshot refreshStatus has isDegraded field", "isDegraded" in snapshot.snapshot.refreshStatus, String(snapshot.snapshot.refreshStatus.isDegraded));
    }
  }

  check(checks, "data provenance report exists", fileExists(path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-data-provenance-v0.1.md")), "data provenance report");
  check(checks, "share packet exists", fileExists(sharePacketPath), sharePacketPath);
  check(checks, "content pack exists", fileExists(contentPackPath), contentPackPath);
  check(checks, "site integration handoff exists", fileExists(siteIntegrationPath), siteIntegrationPath);

  const previewText = readText(previewHtmlPath);
  if (previewText) {
    check(checks, "preview HTML contains paper simulation label", previewText.includes("Paper simulation only") || previewText.includes("paper simulation"), "preview HTML");
    check(checks, "preview HTML contains not financial advice", previewText.includes("Not financial advice") || previewText.includes("not financial advice"), "preview HTML");
    check(checks, "preview HTML contains no private home path", !previewText.includes("/home/") && !previewText.includes("/Users/"), "preview HTML");
    check(checks, "preview HTML contains no live trading claims", !previewText.includes("live trading") || previewText.includes("Not live") || previewText.includes("not live"), "preview HTML");
    check(checks, "preview HTML contains scheduler not installed state", previewText.includes("not installed") || previewText.includes("schedulerInstalled"), "preview HTML");
  }

  const contentPackText = readText(contentPackPath);
  if (contentPackText) {
    check(checks, "content pack is marked draft-only", contentPackText.includes("DRAFT ONLY") || contentPackText.includes("draft-only"), contentPackPath);
    check(checks, "content pack has not financial advice", contentPackText.includes("not financial advice"), contentPackPath);
    check(checks, "content pack has paper simulation labels", contentPackText.includes("paper") && contentPackText.includes("simulation"), contentPackPath);
  }

  const hits = scanFiles([paths.siteDashboardPublicV04Json, localDashboardPath, refreshJsonPath, previewHtmlPath, healthJsonPath, paths.tradeRejectionExplainabilityReport, paths.cycleLatestJson, shareableSnapshotPath, sharePacketPath, contentPackPath, siteIntegrationPath]);
  check(checks, "public/preview/dashboard outputs contain no restricted markers", hits.length === 0, hits.join("; "));

  writeText(qaReportPath, buildReport(checks));
  const failed = checks.filter((item) => !item.passed);
  console.log(failed.length ? "DASHBOARD REFRESH QA FAIL" : "DASHBOARD REFRESH QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`qa report: ${qaReportPath}`);
  if (failed.length) {
    failed.forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed: failed.length === 0, checks, qaReportPath };
}

if (require.main === module) {
  runDashboardRefreshQa();
}

module.exports = { qaReportPath, runDashboardRefreshQa };
