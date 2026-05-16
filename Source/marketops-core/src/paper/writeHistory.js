const path = require("path");

const { loadJson, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function buildRunSummary({ generatedAt = new Date().toISOString(), qaStatus = "UNKNOWN" } = {}) {
  const signals = loadJson(paths.signalsJson);
  const riskReview = loadJson(paths.riskJson);
  const paperResults = loadJson(paths.tradesJson);
  const equityCurve = loadJson(paths.equityJson);
  const safeStamp = generatedAt.replace(/[-:.]/g, "").replace("T", "-").replace("Z", "Z");

  const dataSource = paperResults.dataSource || "";
  const isRealData = dataSource && (dataSource.includes("alpaca") || dataSource.includes("iex") || dataSource.includes("backfill"));

  return {
    runId: `paper-${safeStamp}`,
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: !isRealData,
    startingBalance: equityCurve.startingBalance || paperResults.startingBalance,
    endingEquity: equityCurve.endingEquity || paperResults.endingBalance,
    paperPnl: equityCurve.totalPnl || paperResults.totalPnl,
    paperReturnPct: equityCurve.totalReturnPct || paperResults.totalReturnPct,
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

function appendRunHistory({ qaStatus = "PASS", generatedAt = new Date().toISOString() } = {}) {
  const summary = buildRunSummary({ generatedAt, qaStatus });
  let history = { updatedAt: generatedAt, runs: [] };

  try {
    history = loadJson(paths.runHistoryJson);
    if (!Array.isArray(history.runs)) history.runs = [];
  } catch (error) {
    history = { updatedAt: generatedAt, runs: [] };
  }

  history.updatedAt = generatedAt;
  history.runs.push(summary);
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
