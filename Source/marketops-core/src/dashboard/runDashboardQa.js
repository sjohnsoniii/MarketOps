const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const outputRoot = path.join(projectRoot, "Data", "dashboard");
const latestBundlePath = path.join(outputRoot, "dashboard-public-safe-v0.1.json");
const latestSummaryPath = path.join(outputRoot, "latest-dashboard-summary.json");
const reportPath = path.join(projectRoot, "Reports", "Dashboard", "marketops-dashboard-public-safe-v0.1.md");
const sj3labsPublicBundlePath = path.join(projectRoot, "..", "sj3labs", "data", "marketops", "dashboard-bundle-public-v0.4.json");
const ALLOWED_EMPTY_CHART_LABELS = new Set([
  "no_trades",
  "no_trades_executed",
  "controlled_degraded",
  "last_known_good",
  "fallback",
  "sample_fallback",
  "empty"
]);

function chartHasAllowedEmptyLabel(bundle, key) {
  if (!bundle || !bundle.chartDataSources) return false;
  const label = bundle.chartDataSources[key];
  return label && ALLOWED_EMPTY_CHART_LABELS.has(label);
}

function chartNonEmptyCheck(checks, bundle, key, label) {
  const value = bundle.charts && bundle.charts[key];
  const count = Array.isArray(value) ? value.length : 0;
  const hasLabel = chartHasAllowedEmptyLabel(bundle, key);
  const suffix = hasLabel ? " (labeled: " + bundle.chartDataSources[key] + ")" : "";
  check(checks, label + " has data" + suffix, hasLabel || count > 0, String(count));
}

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

const { paths } = require("../utils/paths");
const { fileExists, loadJson } = require("../utils/fileStore");
const { getLatestDashboardSnapshot } = require("../db/dashboardSnapshots");

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
    ["payment", "enabled"].join(" "),
    "vehicle-history-14d",
    "vehicleHistory"
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

function newestBundleSnapshot() {
  return getLatestDashboardSnapshot("public-safe") || null;
}

// Scoped, deliberate exception (NOT a general bypass): the public-safe paper
// bundles intentionally render per-position `quantity` and `positionValue` in
// the holdings table (both the sj3labs public bundle and the local
// dashboard-public-safe-v0.1.json / its timestamped siblings, all of which
// carry the same openPositionsDetailed/recentlyClosedPositions data approved
// in the 06-02 decision). These two field names are exempt ONLY when scanning
// those public-safe bundle files. Every other restricted term stays enforced
// on these files, and ALL restricted terms stay enforced on every other
// scanned file (e.g. latest-dashboard-summary.json, the QA report).
const PUBLIC_BUNDLE_EXEMPT_TERMS = new Set(["quantity", "positionValue"]);

function isPublicSafeBundleFile(filePath) {
  if (filePath === sj3labsPublicBundlePath) return true;
  const base = path.basename(filePath);
  return base.startsWith("dashboard-public-safe") && base.endsWith(".json");
}

function scanOutputFiles(files) {
  const hits = [];
  files.forEach((filePath) => {
    const text = readText(filePath).toLowerCase();
    const isPublicBundle = isPublicSafeBundleFile(filePath);
    restrictedTerms().forEach((term) => {
      if (isPublicBundle && PUBLIC_BUNDLE_EXEMPT_TERMS.has(term)) return;
      if (text.includes(term.toLowerCase())) hits.push(`${path.relative(projectRoot, filePath)} contains restricted term`);
    });
  });
  return hits;
}

// Same restricted-terms scan as scanOutputFiles, applied to a SQLite-stored
// snapshot payload (treated as a public-safe bundle, so quantity/positionValue
// remain exempt per the 06-02 decision).
function scanSnapshotPayload(payload, label) {
  const hits = [];
  const text = (payload || "").toLowerCase();
  restrictedTerms().forEach((term) => {
    if (PUBLIC_BUNDLE_EXEMPT_TERMS.has(term)) return;
    if (text.includes(term.toLowerCase())) hits.push(`${label} contains restricted term`);
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
  const timestampedBundle = newestBundleSnapshot();
  check(checks, "dashboard snapshot exists in SQLite", Boolean(timestampedBundle), timestampedBundle ? `generated_at=${timestampedBundle.generated_at}` : "missing");
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
    const paperEqLabel = chartHasAllowedEmptyLabel(bundle, "paperEquityCurve");
    check(checks, "paper equity curve is array", Array.isArray(bundle.charts && bundle.charts.paperEquityCurve), `paperEquityCurve (${((bundle.charts && bundle.charts.paperEquityCurve) || []).length} points)${paperEqLabel ? ", labeled: " + bundle.chartDataSources.paperEquityCurve : ""}`);
    chartNonEmptyCheck(checks, bundle, "paperPnlSeries", "paperPnlSeries");
    const ddLabel = chartHasAllowedEmptyLabel(bundle, "drawdownSeries");
    check(checks, "drawdown visual data has current run", Array.isArray(bundle.charts && bundle.charts.drawdownVisualData && bundle.charts.drawdownVisualData.currentRun), `currentRun${ddLabel ? ", labeled: " + bundle.chartDataSources.drawdownSeries : ""}`);
    chartNonEmptyCheck(checks, bundle, "watchlistMovementSummary", "watchlistMovementSummary");
    check(checks, "up/down/flat counts exist", Array.isArray(bundle.charts && bundle.charts.vehicleDirectionCounts) && bundle.charts.vehicleDirectionCounts.length === 3, "vehicleDirectionCounts");
    chartNonEmptyCheck(checks, bundle, "movementBuckets", "movementBuckets");
    chartNonEmptyCheck(checks, bundle, "signalCandidatesGenerated", "signalCandidatesGenerated");
    chartNonEmptyCheck(checks, bundle, "signalConfidenceDistribution", "signalConfidenceDistribution");
    chartNonEmptyCheck(checks, bundle, "riskRejectionReasons", "riskRejectionReasons");
    chartNonEmptyCheck(checks, bundle, "almostApprovedCandidates", "almostApprovedCandidates");
    chartNonEmptyCheck(checks, bundle, "vehicleActivity", "vehicleActivity");
    chartNonEmptyCheck(checks, bundle, "signalRiskCounts", "signalRiskCounts");
    chartNonEmptyCheck(checks, bundle, "cumulativePaperPnl", "cumulativePaperPnl");
    chartNonEmptyCheck(checks, bundle, "targetProgress", "targetProgress");
    check(checks, "signal funnel has steps", Array.isArray(bundle.charts && bundle.charts.signalFunnel) && bundle.charts.signalFunnel.length >= 4, "signalFunnel");
    chartNonEmptyCheck(checks, bundle, "riskDecisionMix", "riskDecisionMix");
    chartNonEmptyCheck(checks, bundle, "vehicleContribution", "vehicleContribution");
    chartNonEmptyCheck(checks, bundle, "returnVsDrawdownSnapshot", "returnVsDrawdownSnapshot");
    check(checks, "market data freshness exists", Array.isArray(bundle.charts && bundle.charts.marketDataFreshnessPanel) && bundle.charts.marketDataFreshnessPanel.length > 0 && bundle.dashboardCards.marketDataFreshnessPanel && bundle.dashboardCards.marketDataFreshnessPanel.refreshFreshnessLabel, "marketDataFreshnessPanel");
    chartNonEmptyCheck(checks, bundle, "recentMarketMovementPanel", "recentMarketMovementPanel");
    chartNonEmptyCheck(checks, bundle, "botActivityTimeline", "botActivityTimeline");
    chartNonEmptyCheck(checks, bundle, "staleDataWarningPanel", "staleDataWarningPanel");
    chartNonEmptyCheck(checks, bundle, "marketRegimeSummary", "marketRegimeSummary");
    chartNonEmptyCheck(checks, bundle, "paperCycleStatus", "paperCycleStatus");
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

  // --- Aggressive Learning Mode Dashboard QA ---
  if (bundle) {
    check(checks, "dashboard bundle has vehicleUniverse", Boolean(bundle.vehicleUniverse), typeof bundle.vehicleUniverse);
    check(checks, "dashboard bundle has riskPipeline", Boolean(bundle.riskPipeline), typeof bundle.riskPipeline);
    check(checks, "dashboard bundle has openPositionsDetailed", Array.isArray(bundle.openPositionsDetailed), String(Array.isArray(bundle.openPositionsDetailed)));
    check(checks, "dashboard bundle has recentlyClosedPositions", Array.isArray(bundle.recentlyClosedPositions), String(Array.isArray(bundle.recentlyClosedPositions)));
    check(checks, "dashboard bundle has aggressiveLearningMode flag", "aggressiveLearningMode" in bundle, String(bundle.aggressiveLearningMode));
    check(checks, "dashboard bundle has learningMode", "learningMode" in bundle, typeof bundle.learningMode);

    if (bundle.riskPipeline) {
      const rp = bundle.riskPipeline;
      check(checks, "riskPipeline has vehiclesScanned", rp.vehiclesScanned !== undefined, String(rp.vehiclesScanned));
      check(checks, "riskPipeline has signalsReviewed", rp.signalsReviewed !== undefined, String(rp.signalsReviewed));
      check(checks, "riskPipeline has approvedStandard", rp.approvedStandard !== undefined, String(rp.approvedStandard));
      check(checks, "riskPipeline has approvedLearningProbe", rp.approvedLearningProbe !== undefined, String(rp.approvedLearningProbe));
      check(checks, "riskPipeline has watched", rp.watched !== undefined, String(rp.watched));
      check(checks, "riskPipeline has rejected", rp.rejected !== undefined, String(rp.rejected));
      check(checks, "riskPipeline has tradesAttempted", rp.tradesAttempted !== undefined, String(rp.tradesAttempted));
      check(checks, "riskPipeline has tradesExecuted", rp.tradesExecuted !== undefined, String(rp.tradesExecuted));
      check(checks, "riskPipeline has openPositions", rp.openPositions !== undefined, String(rp.openPositions));
      check(checks, "riskPipeline has learningProbesExecutedToday", rp.learningProbesExecutedToday !== undefined, String(rp.learningProbesExecutedToday));
      check(checks, "riskPipeline tradesExecuted <= tradesAttempted",
        rp.tradesExecuted <= rp.tradesAttempted,
        `${rp.tradesExecuted} <= ${rp.tradesAttempted}`);
      check(checks, "riskPipeline openPositions matches detailed length",
        rp.openPositions === bundle.openPositionsDetailed.length,
        `${rp.openPositions} vs ${bundle.openPositionsDetailed.length}`);
    }

    if (bundle.vehicleUniverse) {
      check(checks, "vehicleUniverse has targetCount", bundle.vehicleUniverse.targetCount === 150, String(bundle.vehicleUniverse.targetCount));
      check(checks, "vehicleUniverse has actualCount", bundle.vehicleUniverse.actualCount > 0, String(bundle.vehicleUniverse.actualCount));
      check(checks, "vehicleUniverse has source", Boolean(bundle.vehicleUniverse.source), bundle.vehicleUniverse.source);
    }

    if (bundle.learningMode) {
      check(checks, "learningMode.paperOnly is true", bundle.learningMode.paperOnly === true, String(bundle.learningMode.paperOnly));
      check(checks, "learningMode profile is aggressive_paper_learning", bundle.learningMode.profile === "aggressive_paper_learning", bundle.learningMode.profile);
    }

    if (bundle.openPositionsDetailed) {
      bundle.openPositionsDetailed.forEach((pos, i) => {
        check(checks, `openPosition[${i}] has ticker`, Boolean(pos.ticker), pos.ticker || "missing");
        check(checks, `openPosition[${i}] has status`, Boolean(pos.status), pos.status);
        check(checks, `openPosition[${i}] has entryPrice`, Number.isFinite(pos.entryPrice), String(pos.entryPrice));
        check(checks, `openPosition[${i}] has unrealizedPnl`, Number.isFinite(pos.unrealizedPnl), String(pos.unrealizedPnl));
        check(checks, `openPosition[${i}] has riskBand`, Boolean(pos.riskBand), pos.riskBand);
        check(checks, `openPosition[${i}] has isLearningProbe flag`, typeof pos.isLearningProbe === "boolean", String(pos.isLearningProbe));
      });
    }

    if (bundle.recentlyClosedPositions) {
      bundle.recentlyClosedPositions.forEach((pos, i) => {
        check(checks, `recentlyClosed[${i}] has ticker`, Boolean(pos.ticker), pos.ticker || "missing");
        check(checks, `recentlyClosed[${i}] has realizedPnl`, Number.isFinite(pos.realizedPnl), String(pos.realizedPnl));
        check(checks, `recentlyClosed[${i}] has exitReason`, Boolean(pos.exitReason), pos.exitReason);
      });
    }
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

    // New public bundle fields for aggressive learning mode
    check(checks, "public bundle has riskPipeline", "riskPipeline" in publicBundle, typeof publicBundle.riskPipeline);
    check(checks, "public bundle has openPositionsDetailed", Array.isArray(publicBundle.openPositionsDetailed), String(Array.isArray(publicBundle.openPositionsDetailed)));
    check(checks, "public bundle has recentlyClosedPositions", Array.isArray(publicBundle.recentlyClosedPositions), String(Array.isArray(publicBundle.recentlyClosedPositions)));
    check(checks, "public bundle has vehicleUniverse", "vehicleUniverse" in publicBundle, typeof publicBundle.vehicleUniverse);
    check(checks, "public bundle has aggressiveLearningMode", "aggressiveLearningMode" in publicBundle, String(publicBundle.aggressiveLearningMode));
    check(checks, "public bundle has learningModeEnabled", "learningModeEnabled" in publicBundle, String(publicBundle.learningModeEnabled));
    if (publicBundle.riskPipeline) {
      check(checks, "public riskPipeline signalsReviewed includes all bands",
        (publicBundle.riskPipeline.approvedStandard + publicBundle.riskPipeline.approvedLearningProbe + publicBundle.riskPipeline.watched + publicBundle.riskPipeline.rejected) <= publicBundle.riskPipeline.signalsReviewed,
        `sum <= ${publicBundle.riskPipeline.signalsReviewed}`);
    }
  }

  const filesToScan = [latestBundlePath, latestSummaryPath, reportPath, sj3labsPublicBundlePath].filter((filePath) => fs.existsSync(filePath));
  const hits = scanOutputFiles(filesToScan);
  if (timestampedBundle) {
    hits.push(...scanSnapshotPayload(timestampedBundle.payload, "dashboard_snapshots (public-safe, latest)"));
  }
  check(checks, "dashboard outputs contain no private IDs/paths/risky terms", hits.length === 0, hits.join("; "));

  if (fileExists(paths.vehicleHistoryJson)) {
    try {
      const vh = loadJson(paths.vehicleHistoryJson);
      check(checks, "vehicle history internalOnly true", vh.internalOnly === true, String(vh.internalOnly));
      check(checks, "vehicle history paperOnly true", vh.paperOnly === true, String(vh.paperOnly));
      check(checks, "vehicle history not in public bundle", !JSON.stringify(bundle || {}).includes("vehicleHistory"), "clean");
      check(checks, "vehicle history not in public v0.4 bundle", !JSON.stringify(publicBundle || {}).includes("vehicleHistory"), "clean");
    } catch (e) {
      check(checks, "vehicle history internal check", false, e.message);
    }
  }

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
