const path = require("path");
const { fileExists, loadJson, writeJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

const PUBLIC_TRIAL_VERSION = "marketops-public-trial-status-v0.1";
const outputPath = path.join(paths.dataRoot, "public", `${PUBLIC_TRIAL_VERSION}.json`);
const sj3labsOutputPath = path.join(paths.sj3labsMarketOpsDataRoot, `${PUBLIC_TRIAL_VERSION}.json`);

function loadOptional(filePath) {
  try {
    return fileExists(filePath) ? loadJson(filePath) : null;
  } catch {
    return null;
  }
}

function generatePublicTrialStatus() {
  const generatedAt = new Date().toISOString();
  const refreshLatest = loadOptional(path.join(paths.dataRoot, "dashboard", "dashboard-refresh-latest-v0.1.json"));
  const refreshHealth = loadOptional(path.join(paths.dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json"));
  const dashboardBundle = loadOptional(path.join(paths.dataRoot, "dashboard", "dashboard-public-safe-v0.1.json"));
  const shareableSnapshot = loadOptional(path.join(paths.dataRoot, "dashboard", "marketops-shareable-snapshot-v0.1.json"));
  const paperPerformance = loadOptional(paths.paperPerformanceJson);
  const paperPositions = loadOptional(paths.paperPositionsJson);
  const paperTrades = loadOptional(paths.tradesJson);

  const refreshStatus = refreshLatest ? refreshLatest.status : "UNKNOWN";
  const isControlledDegraded = refreshStatus === "CONTROLLED_DEGRADED";
  const isFailed = refreshStatus === "FAIL";

  const freshBarsStatus = refreshLatest?.marketData?.latestBarTimestamp
    ? "FRESH_BARS_AVAILABLE"
    : refreshLatest?.marketData?.barsLoaded > 0
      ? "STALE_BARS"
      : "OFF_HOURS_NO_FRESH_BARS";

  const performance = paperPerformance || {};
  const trades = paperTrades || {};
  const positions = paperPositions || { openPositions: [], closedPositions: [] };

  const snapshot = shareableSnapshot?.snapshot || {};
  const paperCycle = snapshot.paperCycle || {};

  const approvedCount = paperCycle.approvedTrades ?? trades.approvedSignals ?? 0;
  const rejectedCount = paperCycle.rejectedTrades ?? 0;
  const openPositionsCount = positions.openPositions ? positions.openPositions.length : 0;
  const fakeTradesCount = trades.executedTrades ?? 0;

  const statusData = {
    schemaVersion: PUBLIC_TRIAL_VERSION,
    generatedAt,
    mode: "paper_simulation",
    publicTrial: true,
    liveMoney: false,
    brokerOrdersEnabled: false,
    latestRunAt: refreshLatest?.generatedAt || null,
    latestMarketDataStatus: refreshStatus,
    freshBarsStatus,
    controlledDegraded: isControlledDegraded || isFailed,
    lastSuccessfulRefreshAt: refreshHealth?.lastSuccessfulRefreshAt || refreshLatest?.lastKnownGoodGeneratedAt || null,
    lastFailureAt: refreshHealth?.lastFailureAt || null,
    schedulerCadence: "Mon-Fri 10:00, 12:00, 14:00, 15:50 America/New_York",
    nextScheduledRun: null,
    paperBalance: performance.totalEquity ?? null,
    paperEquity: performance.totalEquity ?? null,
    realizedPnl: performance.realizedPnl ?? 0,
    unrealizedPnl: performance.unrealizedPnl ?? trades.totalUnrealizedPnl ?? 0,
    openPositionsCount,
    fakeTradesCount,
    rejectedSignalsCount: rejectedCount,
    approvedSignalsCount: approvedCount,
    noTradeReason: trades.noTradeReason || null,
    failureStatus: isFailed ? "FAIL" : isControlledDegraded ? "CONTROLLED_DEGRADED" : "OK",
    publicFailureSummary: isFailed
      ? (refreshLatest?.errorMessage || "MarketOps refresh failed. Dashboard preserved last-known-good data.")
      : isControlledDegraded
        ? "Market data unavailable (off-hours or market closed). Simulation steps skipped. Last-known-good data preserved."
        : null,
    lastKnownGoodPreserved: refreshLatest?.lastKnownGoodPreserved || false,
    lastKnownGoodGeneratedAt: refreshLatest?.lastKnownGoodGeneratedAt || null,
    dataProvenance: dashboardBundle?.dataProvenance || {
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

  writeJson(outputPath, statusData);
  writeJson(sj3labsOutputPath, statusData);

  console.log(`Public trial status generated: ${outputPath}`);
  console.log(`Public trial status copied to sj3labs: ${sj3labsOutputPath}`);
  console.log(`Status: ${statusData.failureStatus}`);
  console.log(`Open positions: ${statusData.openPositionsCount}`);
  console.log(`Fake trades: ${statusData.fakeTradesCount}`);
  console.log(`Approved signals: ${statusData.approvedSignalsCount}`);
  console.log(`Rejected signals: ${statusData.rejectedSignalsCount}`);

  return statusData;
}

async function runCli() {
  try {
    generatePublicTrialStatus();
  } catch (error) {
    const msg = String(error.message || error).replace(/APCA[-_A-Z0-9]*=([^&\s]+)/gi, "APCA_REDACTED");
    console.error(`Failed to generate public trial status: ${msg}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { generatePublicTrialStatus };
