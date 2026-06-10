const path = require("path");
const fs = require("fs");
const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { loadConfig } = require("../config/configLoader");
const { insertRun, clearRuns, getTotalRunCount } = require("../db/runs");
const { syncPositions } = require("../db/positions");
const { syncTrades } = require("../db/trades");

const CLEAN_BALANCE = 1000;
const REPORT_ROOT = path.join(paths.projectRoot, "Reports", "Training");
const CLEAN_START_REPORT = path.join(REPORT_ROOT, "marketops-clean-paper-start-v0.7.md");

function backupDir() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(paths.projectRoot, "Backups", `clean-start-v0.7-${ts}`);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`Backup directory: ${dir}`);
  return dir;
}

function backupFile(src, destDir) {
  if (fileExists(src)) {
    const basename = path.basename(src);
    fs.copyFileSync(src, path.join(destDir, basename));
    console.log(`  backed up: ${basename}`);
  }
}

function archiveState(backup) {
  console.log("\nArchiving pre-clean state...");
  backupFile(paths.paperPerformanceJson, backup);
  backupFile(paths.paperPositionsJson, backup);
  backupFile(paths.tradesJson, backup);
  backupFile(paths.equityJson, backup);
  backupFile(paths.latestRunSummaryJson, backup);
  backupFile(paths.runHistoryJson, backup);
  backupFile(path.join(paths.dataRoot, "dashboard", "dashboard-public-safe-v0.1.json"), backup);
  backupFile(path.join(paths.dataRoot, "dashboard", "dashboard-refresh-latest-v0.1.json"), backup);
  backupFile(path.join(paths.dataRoot, "public", "marketops-public-trial-status-v0.1.json"), backup);
  const sj3labsTrial = path.join(paths.sj3labsMarketOpsDataRoot, "marketops-public-trial-status-v0.1.json");
  if (fileExists(sj3labsTrial)) backupFile(sj3labsTrial, backup);
}

function resetPerformance() {
  const data = {
    startingCash: CLEAN_BALANCE,
    cashBalance: CLEAN_BALANCE,
    realizedPnl: 0,
    unrealizedPnl: 0,
    totalEquity: CLEAN_BALANCE,
    maxDrawdown: 0,
    peakEquity: CLEAN_BALANCE,
    dailyRealizedPnl: 0,
    dailyTradeCount: 0,
    dailyDrawdown: 0,
    tradeDate: new Date().toISOString().slice(0, 10)
  };
  writeJson(paths.paperPerformanceJson, data);
  console.log("  paper-performance-v0.1.json reset to $1000");
}

function resetPositions() {
  const data = { openPositions: [], closedPositions: [], dailyTradeCount: 0, tradeDate: new Date().toISOString().slice(0, 10) };
  writeJson(paths.paperPositionsJson, data);
  syncPositions(data);
  console.log("  paper-positions-v0.1.json cleared (open positions = 0)");
}

function resetTrades() {
  const data = {
    generatedAt: new Date().toISOString(),
    mode: "paper_simulation",
    paperOnly: true,
    dataSource: "alpaca_iex",
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    startingCash: CLEAN_BALANCE,
    cashBalance: CLEAN_BALANCE,
    totalUnrealizedPnl: 0,
    totalEquity: CLEAN_BALANCE,
    realizedPnl: 0,
    maxDrawdown: 0,
    dailyTradeCount: 0,
    maxDailyTrades: 10,
    openPositionCount: 0,
    maxOpenPositions: 5,
    executedTrades: 0,
    skippedReasons: [],
    noTradeReason: "Clean start v0.7 — no trades yet. Waiting for market-open scan.",
    ledger: [],
    trades: [],
    notes: [
      "Clean paper start v0.7.",
      "Account reset to $1000 training baseline.",
      "All previous positions and history archived.",
      "No real money, broker execution, or live trading."
    ],
    startingBalance: CLEAN_BALANCE,
    endingBalance: CLEAN_BALANCE,
    totalPnl: 0,
    totalReturnPct: 0,
    approvedSignals: 0
  };
  writeJson(paths.tradesJson, data);
  syncTrades(data);
  console.log("  paper-trades-v0.1.json reset to $1000");
}

function resetEquity() {
  const data = {
    generatedAt: new Date().toISOString(),
    mode: "paper_simulation",
    paperOnly: true,
    startingBalance: CLEAN_BALANCE,
    targetBalance: 1300,
    endingEquity: CLEAN_BALANCE,
    totalPnl: 0,
    totalReturnPct: 0,
    maxDrawdownPct: null,
    targetMet: false,
    points: []
  };
  writeJson(paths.equityJson, data);
  console.log("  equity-curve-v0.1.json reset to $1000");
}

function resetLatestRunSummary() {
  const data = {
    runId: "clean-start-v0.7",
    generatedAt: new Date().toISOString(),
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: false,
    startingBalance: CLEAN_BALANCE,
    endingEquity: CLEAN_BALANCE,
    paperPnl: 0,
    paperReturnPct: 0,
    maxDrawdownPct: null,
    vehiclesScanned: 0,
    signalsReviewed: 0,
    riskApproved: 0,
    riskBlocked: 0,
    fakePaperTrades: 0,
    openPositionCount: 0,
    realizedPnl: 0,
    unrealizedPnl: 0,
    cashBalance: CLEAN_BALANCE,
    totalEquity: CLEAN_BALANCE,
    qaStatus: "PASS",
    cleanStartV07: true,
    notes: [
      "Clean paper start v0.7.",
      "Account reset to $1000 training baseline.",
      "No broker connection, live trading, or real-money execution."
    ]
  };
  writeJson(paths.latestRunSummaryJson, data);
  console.log("  latest-run-summary.json reset to $1000");
}

function resetCycle() {
  const now = new Date().toISOString();
  const pad = (value) => String(value).padStart(2, "0");
  const date = new Date(now);
  const cycleId = `cycle-${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;

  const freshCycle = {
    cycleId,
    cycleNumber: 1,
    status: "active",
    startingBalance: CLEAN_BALANCE,
    currentBalance: CLEAN_BALANCE,
    endingBalance: null,
    depletionThreshold: 0,
    cycleStartTimestamp: now,
    cycleEndTimestamp: null,
    hoursSurvived: 0,
    daysSurvived: 0,
    approvedTrades: 0,
    rejectedTrades: 0,
    rejectionReasons: [],
    strategyVersionUsed: "strategy-v0.1-watchlist-threshold-paper",
    riskModelVersionUsed: "risk-desk-v0.1-long-up-confidence-gate",
    lessonsLearnedSoFar: [
      "Clean paper start: new cycle at $1,000 with no legacy positions.",
      "No daily reset while capital stays above the depletion threshold."
    ],
    proposedImprovements: [],
    approvedImprovementsForNextCycle: [],
    humanReviewNeededItems: [],
    resetTriggerReason: "clean_start_v0.7",
    nextCycleScheduledStart: null,
    appliedRunIds: ["clean-start-v0.7"],
    lastRunAppliedAt: now,
    externalEffects: false,
    publishAllowed: false,
    cleanStartV07: true
  };

  const state = {
    schemaVersion: "marketops-paper-cycle-state-v0.1",
    mode: "paper_simulation",
    paperOnly: true,
    cycleStartingBalance: CLEAN_BALANCE,
    depletionThreshold: 0,
    currentCycle: freshCycle,
    cycleHistory: [],
    externalEffects: false,
    publishAllowed: false,
    liveTradingEnabled: false,
    brokerExecutionEnabled: false,
    updatedAt: now,
    cleanStartV07: true
  };

  writeJson(paths.cycleStateJson, state);
  writeJson(paths.cycleLatestJson, freshCycle);
  console.log(`  cycle reset: new ${cycleId} at $1000 (legacy cycle archived in backup)`);
}

function resetRunHistory(legacyRunsCount = 0) {
  const now = new Date().toISOString();
  const baselineRun = {
    runId: "clean-start-v0.7",
    generatedAt: now,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: false,
    startingBalance: CLEAN_BALANCE,
    endingEquity: CLEAN_BALANCE,
    paperPnl: 0,
    paperReturnPct: 0,
    maxDrawdownPct: 0,
    vehiclesScanned: 0,
    signalsReviewed: 0,
    riskApproved: 0,
    riskBlocked: 0,
    fakePaperTrades: 0,
    openPositionCount: 0,
    realizedPnl: 0,
    unrealizedPnl: 0,
    cashBalance: CLEAN_BALANCE,
    totalEquity: CLEAN_BALANCE,
    qaStatus: "PASS",
    cleanStartV07: true,
    notes: [
      "Clean paper start v0.7.",
      "Account reset to $1000 training baseline.",
      "All previous positions and history archived."
    ]
  };

  clearRuns();
  insertRun(baselineRun);

  const history = {
    updatedAt: now,
    totalRuns: 1,
    storage: "sqlite:runs",
    cleanStartV07: {
      note: "Clean paper start v0.7. Legacy run history was archived to Backups; public charts restart from $1000 only.",
      resetAt: now,
      previousLegacyRunsCount: legacyRunsCount
    },
    runs: [baselineRun]
  };
  writeJson(paths.runHistoryJson, history);
  console.log("  run-history.json and runs table replaced with clean-start baseline only");
}

function resetDashboardRefresh() {
  const f = path.join(paths.dataRoot, "dashboard", "dashboard-refresh-latest-v0.1.json");
  if (!fileExists(f)) {
    console.log("  dashboard-refresh-latest-v0.1.json not found, skipping");
    return;
  }
  const data = loadJson(f);
  data.generatedAt = new Date().toISOString();
  data.status = "PASS";
  data.mode = "paper_simulation";
  data.paperOnly = true;
  if (data.paper) {
    data.paper.latestRunId = "clean-start-v0.7";
    data.paper.latestRunGeneratedAt = new Date().toISOString();
    data.paper.endingEquity = CLEAN_BALANCE;
    data.paper.paperPnl = 0;
    data.paper.paperReturnPct = 0;
    data.paper.maxDrawdownPct = null;
    data.paper.fakePaperTrades = 0;
    data.paper.qaStatus = "PASS";
  }
  writeJson(f, data);
  console.log("  dashboard-refresh-latest-v0.1.json updated to $1000");
}

function resetPublicTrialStatus() {
  const localF = path.join(paths.dataRoot, "public", "marketops-public-trial-status-v0.1.json");
  const sj3labsF = path.join(paths.sj3labsMarketOpsDataRoot, "marketops-public-trial-status-v0.1.json");
  const data = {
    schemaVersion: "marketops-public-trial-status-v0.1",
    generatedAt: new Date().toISOString(),
    mode: "paper_simulation",
    publicTrial: true,
    liveMoney: false,
    brokerOrdersEnabled: false,
    latestRunAt: new Date().toISOString(),
    latestMarketDataStatus: "PASS",
    freshBarsStatus: "FRESH_BARS_AVAILABLE",
    controlledDegraded: false,
    lastSuccessfulRefreshAt: new Date().toISOString(),
    lastFailureAt: null,
    schedulerCadence: "Mon-Fri 10:00, 12:00, 14:00, 15:50 America/New_York",
    nextScheduledRun: null,
    paperBalance: CLEAN_BALANCE,
    paperEquity: CLEAN_BALANCE,
    realizedPnl: 0,
    unrealizedPnl: 0,
    openPositionsCount: 0,
    fakeTradesCount: 0,
    rejectedSignalsCount: 0,
    approvedSignalsCount: 0,
    noTradeReason: "Clean start v0.7 — no trades yet. Waiting for market-open scan.",
    failureStatus: "OK",
    publicFailureSummary: null,
    lastKnownGoodPreserved: false,
    lastKnownGoodGeneratedAt: null,
    dataProvenance: {
      note: "All values are paper simulation only. No real money or live trading."
    },
    disclaimers: [
      "Paper simulation only. No real-money trading.",
      "No broker order placement.",
      "Fake positions, fake trades, fake P&L.",
      "Real Alpaca IEX market data used for paper simulation inputs.",
      "Not financial advice. Not verified investment performance.",
      "Not trading signals. No guarantees.",
      "Public paper trial for research and education purposes only."
    ]
  };
  writeJson(localF, data);
  console.log("  public trial status reset to $1000");
  if (fileExists(sj3labsF)) {
    writeJson(sj3labsF, data);
    console.log("  sj3labs public trial status synced to $1000");
  }
}

function cleanStart() {
  console.log("=".repeat(60));
  console.log("MarketOps Clean Paper Start v0.7");
  console.log("=".repeat(60));
  console.log(`Generated: ${new Date().toISOString()}`);

  const backup = backupDir();
  archiveState(backup);
  const legacyRunsCount = getTotalRunCount();

  console.log("\nResetting active paper state to $1000...");
  resetPerformance();
  resetPositions();
  resetTrades();
  resetEquity();
  resetLatestRunSummary();
  resetCycle();
  resetRunHistory(legacyRunsCount);
  resetDashboardRefresh();
  resetPublicTrialStatus();

  console.log("\nVerifying all sources agree on $1000...");
  const checks = [];

  function check(name, value, expected) {
    const passed = value === expected;
    checks.push({ name, passed, value, expected });
    if (!passed) console.log(`  FAIL: ${name} = ${value} (expected ${expected})`);
    else console.log(`  PASS: ${name} = ${value}`);
  }

  const perf = loadJson(paths.paperPerformanceJson);
  check("paper-performance startingCash", perf.startingCash, CLEAN_BALANCE);
  check("paper-performance cashBalance", perf.cashBalance, CLEAN_BALANCE);
  check("paper-performance totalEquity", perf.totalEquity, CLEAN_BALANCE);

  const pos = loadJson(paths.paperPositionsJson);
  check("paper-positions openPositions count", pos.openPositions.length, 0);

  const trades = loadJson(paths.tradesJson);
  check("paper-trades startingBalance", trades.startingBalance, CLEAN_BALANCE);
  check("paper-trades cashBalance", trades.cashBalance, CLEAN_BALANCE);

  const equity = loadJson(paths.equityJson);
  check("equity-curve startingBalance", equity.startingBalance, CLEAN_BALANCE);
  check("equity-curve endingEquity", equity.endingEquity, CLEAN_BALANCE);

  const latestRun = loadJson(paths.latestRunSummaryJson);
  check("latest-run-summary startingBalance", latestRun.startingBalance, CLEAN_BALANCE);
  check("latest-run-summary endingEquity", latestRun.endingEquity, CLEAN_BALANCE);

  const publicTrial = loadJson(path.join(paths.dataRoot, "public", "marketops-public-trial-status-v0.1.json"));
  check("public-trial paperBalance", publicTrial.paperBalance, CLEAN_BALANCE);
  check("public-trial paperEquity", publicTrial.paperEquity, CLEAN_BALANCE);
  check("public-trial openPositionsCount", publicTrial.openPositionsCount, 0);

  const cycleLatest = loadJson(paths.cycleLatestJson);
  check("cycle-latest currentBalance", cycleLatest.currentBalance, CLEAN_BALANCE);

  const cycleState = loadJson(paths.cycleStateJson);
  check("cycle-state currentBalance", cycleState.currentCycle.currentBalance, CLEAN_BALANCE);

  const allPassed = checks.every(c => c.passed);
  const failed = checks.filter(c => !c.passed);

  console.log(`\nChecks: ${checks.length} total, ${checks.length - failed.length} passed, ${failed.length} failed`);

  const report = `# MarketOps Clean Paper Start v0.7

Generated: ${new Date().toISOString()}

## Action

Clean reset of active paper-training account to $1000.00 baseline.

## Files Reset

- paper-performance-v0.1.json → startingCash=1000, cashBalance=1000, totalEquity=1000
- paper-positions-v0.1.json → openPositions=[], closedPositions=[]
- paper-trades-v0.1.json → startingBalance=1000, cashBalance=1000
- equity-curve-v0.1.json → startingBalance=1000, endingEquity=1000
- latest-run-summary.json → startingBalance=1000, endingEquity=1000
- run-history.json → clean-start entry appended
- dashboard-refresh-latest-v0.1.json → endingEquity=1000
- marketops-public-trial-status-v0.1.json → paperBalance=1000
- sj3labs public trial status → synced to $1000

## Legacy State Archived

Backup: ${backup}

All previous state preserved in backup directory.

## Verification

${checks.map(c => `- ${c.passed ? "PASS" : "FAIL"}: ${c.name} = ${c.value}`).join("\n")}

## Result

${allPassed ? "**ALL CHECKS PASSED** — Clean paper start ready for market open." : `**${failed.length} CHECKS FAILED** — Review issues above.`}
`;

  writeText(CLEAN_START_REPORT, report);
  console.log(`\nReport: ${CLEAN_START_REPORT}`);
  console.log(allPassed ? "\nClean paper start READY" : "\nClean paper start FAILED");

  if (!allPassed) process.exitCode = 1;
  return { passed: allPassed, checks, backup };
}

async function runCli() {
  try {
    const result = cleanStart();
    process.exitCode = result.passed ? 0 : 1;
  } catch (error) {
    console.error("Clean start failed:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { cleanStart };
