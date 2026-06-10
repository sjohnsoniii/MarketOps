const path = require("path");

const { loadJson, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");
const { insertRun, pruneRuns, getRecentRuns, getTotalRunCount, RUN_HISTORY_RETENTION_DAYS } = require("../db/runs");

function buildRunSummary({ generatedAt = new Date().toISOString(), qaStatus = "UNKNOWN" } = {}) {
  const signals = loadJson(paths.signalsJson);
  const riskReview = loadJson(paths.riskJson);
  const paperResults = loadJson(paths.tradesJson);
  const equityCurve = loadJson(paths.equityJson);
  const safeStamp = generatedAt.replace(/[-:.]/g, "").replace("T", "-").replace("Z", "Z");

  const dataSource = paperResults.dataSource || "";
  const isRealData = dataSource && (dataSource.includes("alpaca") || dataSource.includes("iex") || dataSource.includes("backfill"));

  // Use the epoch starting capital (set at clean-start or depletion reset) so that
  // paperPnl reflects the true change from configured starting capital, not the
  // post-exit cashBalance snapshot that executePaperTrades captured mid-run.
  let epochStartingBalance = null;
  try {
    const { fileExists } = require("../utils/fileStore");
    if (fileExists(paths.paperPerformanceJson)) {
      const perf = loadJson(paths.paperPerformanceJson);
      epochStartingBalance = perf.startingCash || null;
    }
  } catch {}

  const startingBalance = epochStartingBalance
    || equityCurve.startingBalance
    || paperResults.startingBalance;
  const endingEquity = equityCurve.endingEquity || paperResults.endingBalance;
  const paperPnl = round(endingEquity - startingBalance);
  const paperReturnPct = startingBalance > 0
    ? round((paperPnl / startingBalance) * 100)
    : (equityCurve.totalReturnPct || paperResults.totalReturnPct);

  return {
    runId: `paper-${safeStamp}`,
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: !isRealData,
    startingBalance,
    endingEquity,
    paperPnl,
    paperReturnPct,
    maxDrawdownPct: equityCurve.maxDrawdownPct,
    vehiclesScanned: signals.totalVehicles || 0,
    signalsReviewed: (signals.signals || []).length,
    riskApproved: riskReview.approvedCount,
    riskBlocked: riskReview.blockedCount,
    fakePaperTrades: paperResults.executedTrades,
    openPositionCount: paperResults.openPositionCount || 0,
    realizedPnl: paperResults.realizedPnl || 0,
    unrealizedPnl: paperResults.totalUnrealizedPnl || 0,
    cashBalance: paperResults.cashBalance || 0,
    totalEquity: paperResults.totalEquity || 0,
    qaStatus,
    notes: [
      "Paper simulation summary only.",
      isRealData ? "Real market-data-derived paper simulation (Alpaca IEX)." : "Sample data preview, not real performance.",
      "No broker connection, live trading, or real-money execution."
    ]
  };
}

// Run history is stored in the `runs` SQLite table (Data/marketops.db). The
// run-history.json file remains as a lightweight rolling window (retention
// days) for any downstream code that checks file existence / recent runs
// without querying SQLite.
function appendRunHistory({ qaStatus = "PASS", generatedAt = new Date().toISOString() } = {}) {
  const summary = buildRunSummary({ generatedAt, qaStatus });

  insertRun(summary);
  pruneRuns(RUN_HISTORY_RETENTION_DAYS);

  const history = {
    updatedAt: generatedAt,
    totalRuns: getTotalRunCount(),
    retentionDays: RUN_HISTORY_RETENTION_DAYS,
    runs: getRecentRuns(RUN_HISTORY_RETENTION_DAYS),
    storage: "sqlite:runs"
  };

  writeJson(paths.runHistoryJson, history);
  writeJson(paths.latestRunSummaryJson, summary);
  writeJson(path.join(paths.historyRoot, "runs", `${summary.runId}.json`), summary);

  console.log("MarketOps paper history updated.");
  console.log(`runId: ${summary.runId}`);
  console.log(`history file: ${paths.runHistoryJson}`);
  console.log("");

  return summary;
}

if (require.main === module) {
  try {
    appendRunHistory({ qaStatus: "PASS" });
  } catch (error) {
    console.error("MarketOps paper:history failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { appendRunHistory, buildRunSummary };
