const { round } = require("../utils/number");

function buildPerformanceSummary({ scan, riskReview, paperResults, equityCurve, generatedAt }) {
  const winningTrades = paperResults.trades.filter((trade) => trade.realizedPnl > 0).length;
  const losingTrades = paperResults.trades.filter((trade) => trade.realizedPnl < 0).length;
  const winRatePct = paperResults.executedTrades === 0
    ? 0
    : (winningTrades / paperResults.executedTrades) * 100;

  const dataSource = paperResults.dataSource || "unknown";
  const isRealMarketData = dataSource && (dataSource.includes("alpaca") || dataSource.includes("iex") || dataSource.includes("backfill"));
  const closedTrades = (paperResults.trades || []).filter((t) => t.status === "closed").length;

  const maxDrawdownVal = equityCurve.maxDrawdownPct;
  const drawdownStatus = maxDrawdownVal === null || maxDrawdownVal === undefined
    ? "not enough history yet"
    : maxDrawdownVal === 0 ? "no drawdown"
    : `${round(maxDrawdownVal)}%`;

  return {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleDataOnly: !isRealMarketData,
    dataSource,
    vehiclesScanned: scan.totalVehicles || 0,
    marketBarsScanned: scan.totalMarketBars || 0,
    signalsGenerated: scan.candidateCount || 0,
    riskApproved: riskReview.approvedCount || 0,
    riskBlocked: riskReview.blockedCount || 0,
    fakePaperTrades: paperResults.executedTrades || 0,
    newTrades: paperResults.executedTrades || 0,
    openPositionCount: paperResults.openPositionCount || 0,
    closedTrades,
    winningTrades,
    losingTrades,
    winRatePct: round(winRatePct),
    startingBalance: paperResults.startingBalance || 0,
    endingBalance: paperResults.endingBalance || 0,
    cashBalance: paperResults.cashBalance || paperResults.endingBalance || 0,
    totalEquity: paperResults.totalEquity || paperResults.endingBalance || 0,
    realizedPnl: paperResults.realizedPnl || 0,
    unrealizedPnl: paperResults.totalUnrealizedPnl || 0,
    paperPnl: paperResults.totalPnl || 0,
    paperReturnPct: paperResults.totalReturnPct || 0,
    maxDrawdownPct: maxDrawdownVal,
    drawdownStatus,
    targetProgressPct: equityCurve.points.length
      ? equityCurve.points[equityCurve.points.length - 1].targetProgressPct
      : 0,
    notes: [
      isRealMarketData
        ? "Performance is based on real market-data-derived paper simulation."
        : "Performance is based on deterministic sample data only.",
      "No broker, live trading, order placement, margin, leverage, shorting, options, futures, SMS, or subscriber alerts are enabled.",
      "Not investment performance."
    ]
  };
}

module.exports = { buildPerformanceSummary };
