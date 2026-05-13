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

  return {
    runId: `paper-${safeStamp}`,
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
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
    qaStatus,
    notes: [
      "Paper simulation summary only.",
      "Sample data preview, not real performance.",
      "No broker connection, live trading, subscriber alerts, or real-money execution."
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
