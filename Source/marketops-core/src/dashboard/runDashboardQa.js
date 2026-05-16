const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const outputRoot = path.join(projectRoot, "Data", "dashboard");
const latestBundlePath = path.join(outputRoot, "dashboard-public-safe-v0.1.json");
const latestSummaryPath = path.join(outputRoot, "latest-dashboard-summary.json");
const reportPath = path.join(projectRoot, "Reports", "Dashboard", "marketops-dashboard-public-safe-v0.1.md");
const sj3labsPublicBundlePath = path.join(projectRoot, "..", "sj3labs", "data", "marketops", "dashboard-bundle-public-v0.4.json");
const requiredSourceFiles = [
  path.join(__dirname, "dashboardAggregator.js"),
  path.join(__dirname, "runDashboardBuild.js"),
  path.join(__dirname, "runDashboardQa.js")
];
const requiredChartSections = [
  "equityCurve",
  "paperEquityCurve",
  "paperPnlSeries",
  "rollingEquity",
  "drawdownVisualData",
  "drawdownSeries",
  "watchlistMovementSummary",
  "vehicleDirectionCounts",
  "movementBuckets",
  "signalCandidatesGenerated",
  "signalConfidenceDistribution",
  "riskRejectionReasons",
  "almostApprovedCandidates",
  "vehicleActivity",
  "signalRiskCounts",
  "cumulativePaperPnl",
  "targetProgress",
  "signalFunnel",
  "tradeOutcomeBars",
  "tradeOutcomeMix",
  "riskDecisionMix",
  "vehicleContribution",
  "returnVsDrawdownSnapshot",
  "paperAccountMilestoneStrip",
  "marketDataFreshnessPanel",
  "recentMarketMovementPanel",
  "marketMovementSeries",
  "botActivityTimeline",
  "staleDataWarningPanel",
  "marketRegimeSummary",
  "paperCycleStatus",
  "regimeScoreBars",
  "syntheticBenchmarkComparison"
];
const requiredPublicMovementFields = [
  "generatedAt",
  "lastRefreshAt",
  "nextExpectedRefreshAt",
  "refreshCadenceMinutes",
  "dataSource",
  "marketDataMode",
  "latestMarketDataRefresh",
  "latestAlpacaBarTimestamp",
  "barsLoaded",
  "quotesLoaded",
  "watchlistQuoteSnapshot",
  "symbolMovementPreview",
  "topWatchlistMovers",
  "rollingMarketMovement",
  "rollingSignalCounts",
  "rollingRiskCounts",
  "marketActivityHeartbeat",
  "riskDeskSummary",
  "noTradeReason",
  "marketDataFreshnessPanel",
  "watchlistMovementSummary",
  "vehicleDirectionCounts",
  "upDownFlatVehicleCounts",
  "movementBuckets",
  "topMovementBuckets",
  "signalCandidatesGenerated",
  "signalConfidenceDistribution",
  "riskRejectionReasons",
  "riskRejectionCountsByReason",
  "almostApprovedCandidates",
  "marketRegimeSummary",
  "recentMarketMovementPanel",
  "botActivityTimeline",
  "staleDataWarningPanel",
  "paperCycleStatus",
  "paperAccountMilestoneStrip",
  "vehicleContribution",
  "returnVsDrawdownSnapshot",
  "externalEffects",
  "publishAllowed",
  "rawMarketDataPublished"
];
const requiredCards = [
  "currentPaperPerformance",
  "signalFunnel",
  "tradeOutcomeDistribution",
  "riskEventSummary",
  "regimeSummary",
  "contentGenerationStats",
  "agentReviewStats"
];

function restrictedTerms() {
  return [
    ["C:", "\\Users"].join(""),
    ["trade", "Id"].join(""),
    ["signal", "Id"].join(""),
    ["riskDecision", "Id"].join(""),
    ["ledger", "Id"].join(""),
    ["position", "Value"].join(""),
    "quantity",
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this", "trade"].join(" "),
    ["copy my", "bot"].join(" "),
    ["guaran", "teed"].join(""),
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["liveTrading", ": true"].join(""),
    ["allowLiveTrading", "\": true"].join(""),
    ["broker connection", "enabled"].join(" "),
    ["live market data", "enabled"].join(" "),
    ["social auto-posting", "enabled"].join(" "),
    ["payment", "enabled"].join(" ")
  ];
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function newestBundleFile() {
  if (!fs.existsSync(outputRoot)) return null;
  const files = fs.readdirSync(outputRoot).filter((file) => /^dashboard-public-safe-\d{8}-\d{6}\.json$/.test(file));
  if (!files.length) return null;
  return files.map((file) => path.join(outputRoot, file)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function scanOutputFiles(files) {
  const hits = [];
  files.forEach((filePath) => {
    const text = readText(filePath).toLowerCase();
    restrictedTerms().forEach((term) => {
      if (text.includes(term.toLowerCase())) hits.push(`${path.relative(projectRoot, filePath)} contains restricted term`);
    });
  });
  return hits;
}

function runDashboardQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "npm script dashboard:build exists", Boolean(packageJson.scripts && packageJson.scripts["dashboard:build"]), packageJson.scripts && packageJson.scripts["dashboard:build"]);
  check(checks, "npm script dashboard:qa exists", Boolean(packageJson.scripts && packageJson.scripts["dashboard:qa"]), packageJson.scripts && packageJson.scripts["dashboard:qa"]);
  requiredSourceFiles.forEach((filePath) => check(checks, `source exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  check(checks, "latest dashboard bundle exists", fs.existsSync(latestBundlePath), latestBundlePath);
  check(checks, "latest dashboard summary exists", fs.existsSync(latestSummaryPath), latestSummaryPath);
  const timestampedBundle = newestBundleFile();
  check(checks, "timestamped dashboard bundle exists", Boolean(timestampedBundle), timestampedBundle || "missing");
  check(checks, "dashboard report exists", fs.existsSync(reportPath), reportPath);
  check(checks, "public v0.4 dashboard bundle exists", fs.existsSync(sj3labsPublicBundlePath), sj3labsPublicBundlePath);

  let bundle = null;
  try {
    bundle = readJson(latestBundlePath);
    check(checks, "latest dashboard bundle JSON valid", true, latestBundlePath);
  } catch (error) {
    check(checks, "latest dashboard bundle JSON valid", false, error.message);
  }

  if (bundle) {
    check(checks, "mode is paper_simulation", bundle.mode === "paper_simulation", bundle.mode);
    check(checks, "paperOnly true", bundle.paperOnly === true, String(bundle.paperOnly));
    check(checks, "sampleData true", bundle.sampleData === true, String(bundle.sampleData));
    check(checks, "notFinancialAdvice true", bundle.notFinancialAdvice === true, String(bundle.notFinancialAdvice));
    check(checks, "notLiveMarketData true", bundle.notLiveMarketData === true, String(bundle.notLiveMarketData));
    check(checks, "publicSafe true", bundle.publicSafe === true, String(bundle.publicSafe));
    check(checks, "externalEffects false", bundle.externalEffects === false, String(bundle.externalEffects));
    check(checks, "publishAllowed false", bundle.publishAllowed === false, String(bundle.publishAllowed));
    check(checks, "rawMarketDataPublished false", bundle.rawMarketDataPublished === false, String(bundle.rawMarketDataPublished));
    check(checks, "no social auto-posting true", bundle.noSocialAutoPosting === true, String(bundle.noSocialAutoPosting));
    requiredCards.forEach((card) => check(checks, `dashboard card exists: ${card}`, bundle.dashboardCards && Object.prototype.hasOwnProperty.call(bundle.dashboardCards, card), card));
    requiredChartSections.forEach((section) => check(checks, `chart section exists: ${section}`, bundle.charts && Object.prototype.hasOwnProperty.call(bundle.charts, section), section));
    check(checks, "rolling equity is array", Array.isArray(bundle.charts && bundle.charts.rollingEquity), "rollingEquity");
    check(checks, "paper equity curve is array", Array.isArray(bundle.charts && bundle.charts.paperEquityCurve), `paperEquityCurve (${((bundle.charts && bundle.charts.paperEquityCurve) || []).length} points)`);
    check(checks, "paper P&L series has points", Array.isArray(bundle.charts && bundle.charts.paperPnlSeries) && bundle.charts.paperPnlSeries.length > 0, "paperPnlSeries");
    check(checks, "drawdown visual data has current run", Array.isArray(bundle.charts && bundle.charts.drawdownVisualData && bundle.charts.drawdownVisualData.currentRun), "currentRun");
    check(checks, "watchlist movement summary has rows", Array.isArray(bundle.charts && bundle.charts.watchlistMovementSummary) && bundle.charts.watchlistMovementSummary.length > 0, "watchlistMovementSummary");
    check(checks, "up/down/flat counts exist", Array.isArray(bundle.charts && bundle.charts.vehicleDirectionCounts) && bundle.charts.vehicleDirectionCounts.length === 3, "vehicleDirectionCounts");
    check(checks, "movement buckets exist", Array.isArray(bundle.charts && bundle.charts.movementBuckets) && bundle.charts.movementBuckets.length > 0, "movementBuckets");
    check(checks, "signal candidates generated section exists", Array.isArray(bundle.charts && bundle.charts.signalCandidatesGenerated) && bundle.charts.signalCandidatesGenerated.length > 0, "signalCandidatesGenerated");
    check(checks, "signal confidence distribution exists", Array.isArray(bundle.charts && bundle.charts.signalConfidenceDistribution) && bundle.charts.signalConfidenceDistribution.length > 0, "signalConfidenceDistribution");
    check(checks, "risk rejection reasons exist", Array.isArray(bundle.charts && bundle.charts.riskRejectionReasons) && bundle.charts.riskRejectionReasons.length > 0, "riskRejectionReasons");
    check(checks, "almost-approved candidates exist", Array.isArray(bundle.charts && bundle.charts.almostApprovedCandidates) && bundle.charts.almostApprovedCandidates.length > 0, "almostApprovedCandidates");
    check(checks, "vehicle activity has rows", Array.isArray(bundle.charts && bundle.charts.vehicleActivity) && bundle.charts.vehicleActivity.length > 0, "vehicleActivity");
    check(checks, "signal/risk counts have rows", Array.isArray(bundle.charts && bundle.charts.signalRiskCounts) && bundle.charts.signalRiskCounts.length > 0, "signalRiskCounts");
    check(checks, "cumulative paper P&L has points", Array.isArray(bundle.charts && bundle.charts.cumulativePaperPnl) && bundle.charts.cumulativePaperPnl.length > 0, "cumulativePaperPnl");
    check(checks, "target progress has milestones", Array.isArray(bundle.charts && bundle.charts.targetProgress) && bundle.charts.targetProgress.length > 0, "targetProgress");
    check(checks, "signal funnel has steps", Array.isArray(bundle.charts && bundle.charts.signalFunnel) && bundle.charts.signalFunnel.length >= 4, "signalFunnel");
    check(checks, "risk decision mix has bars", Array.isArray(bundle.charts && bundle.charts.riskDecisionMix) && bundle.charts.riskDecisionMix.length > 0, "riskDecisionMix");
    check(checks, "vehicle contribution has rows", Array.isArray(bundle.charts && bundle.charts.vehicleContribution) && bundle.charts.vehicleContribution.length > 0, "vehicleContribution");
    check(checks, "return vs drawdown has rows", Array.isArray(bundle.charts && bundle.charts.returnVsDrawdownSnapshot) && bundle.charts.returnVsDrawdownSnapshot.length > 0, "returnVsDrawdownSnapshot");
    check(checks, "market data freshness exists", Array.isArray(bundle.charts && bundle.charts.marketDataFreshnessPanel) && bundle.charts.marketDataFreshnessPanel.length > 0 && bundle.dashboardCards.marketDataFreshnessPanel && bundle.dashboardCards.marketDataFreshnessPanel.refreshFreshnessLabel, "marketDataFreshnessPanel");
    check(checks, "recent market movement exists", Array.isArray(bundle.charts && bundle.charts.recentMarketMovementPanel) && bundle.charts.recentMarketMovementPanel.length > 0, "recentMarketMovementPanel");
    check(checks, "bot activity timeline exists", Array.isArray(bundle.charts && bundle.charts.botActivityTimeline) && bundle.charts.botActivityTimeline.length > 0, "botActivityTimeline");
    check(checks, "stale data warning panel exists", Array.isArray(bundle.charts && bundle.charts.staleDataWarningPanel) && bundle.charts.staleDataWarningPanel.length > 0, "staleDataWarningPanel");
    check(checks, "market regime summary exists", Array.isArray(bundle.charts && bundle.charts.marketRegimeSummary) && bundle.charts.marketRegimeSummary.length > 0, "marketRegimeSummary");
    check(checks, "paper cycle status exists", Array.isArray(bundle.charts && bundle.charts.paperCycleStatus) && bundle.charts.paperCycleStatus.length > 0, "paperCycleStatus");
    check(checks, "agent review auto apply false", bundle.dashboardCards && bundle.dashboardCards.agentReviewStats && bundle.dashboardCards.agentReviewStats.autoApplyAllowed === false, "agentReviewStats");
    check(checks, "content publish allowed false", bundle.dashboardCards && bundle.dashboardCards.contentGenerationStats && bundle.dashboardCards.contentGenerationStats.publishAllowed === false, "contentGenerationStats");
    check(checks, "disclaimers include paper simulation", Array.isArray(bundle.disclaimers) && bundle.disclaimers.some((item) => item.toLowerCase().includes("paper simulation")), "disclaimers");
    check(checks, "disclaimers include not financial advice", Array.isArray(bundle.disclaimers) && bundle.disclaimers.some((item) => item.toLowerCase().includes("not financial advice")), "disclaimers");
  }

  let publicBundle = null;
  try {
    publicBundle = readJson(sj3labsPublicBundlePath);
    check(checks, "public v0.4 dashboard JSON valid", true, sj3labsPublicBundlePath);
  } catch (error) {
    check(checks, "public v0.4 dashboard JSON valid", false, error.message);
  }

  if (publicBundle) {
    check(checks, "public v0.4 dataSource is alpaca_iex", publicBundle.dataSource === "alpaca_iex", publicBundle.dataSource);
    check(checks, "public v0.4 paperOnly true", publicBundle.paperOnly === true, String(publicBundle.paperOnly));
    check(checks, "public v0.4 liveTradingEnabled false", publicBundle.liveTradingEnabled === false, String(publicBundle.liveTradingEnabled));
    check(checks, "public v0.4 orderPlacementEnabled false", publicBundle.orderPlacementEnabled === false, String(publicBundle.orderPlacementEnabled));
    check(checks, "public v0.4 externalEffects false", publicBundle.externalEffects === false, String(publicBundle.externalEffects));
    check(checks, "public v0.4 publishAllowed false", publicBundle.publishAllowed === false, String(publicBundle.publishAllowed));
    check(checks, "public v0.4 rawMarketDataPublished false", publicBundle.rawMarketDataPublished === false, String(publicBundle.rawMarketDataPublished));
    requiredPublicMovementFields.forEach((field) => {
      check(checks, `public movement field exists: ${field}`, Object.prototype.hasOwnProperty.call(publicBundle, field), field);
    });
    check(checks, "public v0.4 refresh cadence is 2 hours", publicBundle.refreshCadenceMinutes === 120, String(publicBundle.refreshCadenceMinutes));
    check(checks, "public v0.4 timestamps are populated", Boolean(publicBundle.generatedAt && publicBundle.lastRefreshAt && publicBundle.nextExpectedRefreshAt), `${publicBundle.generatedAt} / ${publicBundle.lastRefreshAt} / ${publicBundle.nextExpectedRefreshAt}`);
    check(checks, "public v0.4 bars and quotes loaded", Number(publicBundle.barsLoaded || 0) > 0 && Number(publicBundle.quotesLoaded || 0) > 0, `${publicBundle.barsLoaded}/${publicBundle.quotesLoaded}`);
    check(checks, "public v0.4 movers available without trades", Array.isArray(publicBundle.topWatchlistMovers) && publicBundle.topWatchlistMovers.length > 0, `${(publicBundle.topWatchlistMovers || []).length} mover(s)`);
    check(checks, "public v0.4 market freshness labels exist", publicBundle.marketDataFreshnessPanel && publicBundle.marketDataFreshnessPanel.refreshFreshnessLabel && publicBundle.marketDataFreshnessPanel.latestBarFreshnessLabel, "marketDataFreshnessPanel");
    check(checks, "public v0.4 watchlist movement summary exists", publicBundle.watchlistMovementSummary && Array.isArray(publicBundle.watchlistMovementSummary.summaryRows) && publicBundle.watchlistMovementSummary.summaryRows.length > 0, "watchlistMovementSummary");
    check(checks, "public v0.4 movement buckets exist", Array.isArray(publicBundle.movementBuckets) && publicBundle.movementBuckets.length > 0, "movementBuckets");
    check(checks, "public v0.4 rejection reasons exist", Array.isArray(publicBundle.riskRejectionReasons) && publicBundle.riskRejectionReasons.length > 0, "riskRejectionReasons");
    check(checks, "public v0.4 almost-approved candidates exist", Array.isArray(publicBundle.almostApprovedCandidates) && publicBundle.almostApprovedCandidates.length > 0, "almostApprovedCandidates");
    check(checks, "public v0.4 paper cycle status exists", publicBundle.paperCycleStatus && publicBundle.paperCycleStatus.doesNotResetDaily === true, "paperCycleStatus");
    check(checks, "public v0.4 bot activity timeline exists", Array.isArray(publicBundle.botActivityTimeline) && publicBundle.botActivityTimeline.length > 0, `${(publicBundle.botActivityTimeline || []).length} rows`);
    check(checks, "public v0.4 stale warning labels exist", Array.isArray(publicBundle.staleDataWarningPanel) && publicBundle.staleDataWarningPanel.length > 0, `${(publicBundle.staleDataWarningPanel || []).length} rows`);
    check(checks, "public v0.4 vehicle contribution exists", Array.isArray(publicBundle.vehicleContribution) && publicBundle.vehicleContribution.length > 0, `${(publicBundle.vehicleContribution || []).length} rows`);
    check(checks, "public v0.4 no-trade reason available when no trades", publicBundle.fakePaperTradeCount > 0 || Boolean(publicBundle.noTradeReason), publicBundle.noTradeReason || "trades present");
  }

  const filesToScan = [latestBundlePath, latestSummaryPath, reportPath, sj3labsPublicBundlePath].filter((filePath) => fs.existsSync(filePath));
  if (timestampedBundle) filesToScan.push(timestampedBundle);
  const hits = scanOutputFiles(filesToScan);
  check(checks, "dashboard outputs contain no private IDs/paths/risky terms", hits.length === 0, hits.join("; "));

  const passed = checks.every((item) => item.passed);
  console.log(passed ? "DASHBOARD QA PASS" : "DASHBOARD QA FAIL");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${checks.filter((item) => !item.passed).length}`);
  console.log(`bundle: ${latestBundlePath}`);
  console.log(`report: ${reportPath}`);
  if (!passed) {
    checks.filter((item) => !item.passed).forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed, checks };
}

if (require.main === module) {
  runDashboardQa();
}

module.exports = { runDashboardQa };
