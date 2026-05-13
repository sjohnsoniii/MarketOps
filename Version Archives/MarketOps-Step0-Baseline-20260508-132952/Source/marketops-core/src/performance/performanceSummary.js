const { round } = require("../utils/number");

function buildPerformanceSummary({ scan, riskReview, paperResults, equityCurve, generatedAt }) {
  const winningTrades = paperResults.trades.filter((trade) => trade.realizedPnl > 0).length;
  const losingTrades = paperResults.trades.filter((trade) => trade.realizedPnl < 0).length;
  const winRatePct = paperResults.executedTrades === 0
    ? 0
    : (winningTrades / paperResults.executedTrades) * 100;

  return {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleDataOnly: true,
    vehiclesScanned: scan.totalVehicles,
    marketBarsScanned: scan.totalMarketBars,
    signalsGenerated: scan.candidateCount,
    riskApproved: riskReview.approvedCount,
    riskBlocked: riskReview.blockedCount,
    fakePaperTrades: paperResults.executedTrades,
    winningTrades,
    losingTrades,
    winRatePct: round(winRatePct),
    startingBalance: paperResults.startingBalance,
    endingBalance: paperResults.endingBalance,
    paperPnl: paperResults.totalPnl,
    paperReturnPct: paperResults.totalReturnPct,
    maxDrawdownPct: equityCurve.maxDrawdownPct,
    targetProgressPct: equityCurve.points.length
      ? equityCurve.points[equityCurve.points.length - 1].targetProgressPct
      : 0,
    notes: [
      "Performance is based on deterministic sample data only.",
      "No broker, live data, margin, leverage, shorting, options, futures, SMS, or subscriber alerts are enabled.",
      "This does not prove trading edge. It proves the Phase 1 paper simulation loop runs end-to-end."
    ]
  };
}

module.exports = { buildPerformanceSummary };
