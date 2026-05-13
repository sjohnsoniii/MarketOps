const { mean } = require("./regimeClassifier");

function scoreBacktest({ period, classification, result }) {
  const tradeReturns = result.trades.map((trade) => trade.simulatedReturnPct);
  const totalStrategyReturnPct = result.equityCurve.length
    ? Number((((result.equityCurve[result.equityCurve.length - 1].equity - 10000) / 10000) * 100).toFixed(2))
    : 0;
  const wins = tradeReturns.filter((value) => value > 0).length;
  const losses = tradeReturns.filter((value) => value < 0).length;
  const winRatePct = tradeReturns.length ? Number(((wins / tradeReturns.length) * 100).toFixed(2)) : 0;
  const averageSimulatedTradeReturnPct = Number(mean(tradeReturns).toFixed(2));
  const benchmarkReturnPct = classification.totalReturnPct;
  const benchmarkComparisonPct = Number((totalStrategyReturnPct - benchmarkReturnPct).toFixed(2));

  const riskWarnings = [];
  if (classification.regime === "panic_drawdown") riskWarnings.push("Synthetic panic period showed elevated drawdown pressure.");
  if (result.strategyMaxDrawdownPct <= -4) riskWarnings.push("Strategy drawdown exceeded internal paper-lab comfort threshold.");
  if (tradeReturns.length === 0) riskWarnings.push("No sample events fired; strategy may be too inactive in this regime.");
  if (losses > wins) riskWarnings.push("Negative sample outcomes outnumbered positive outcomes.");

  const overfittingWarnings = [
    "Synthetic sample periods are too small for strategy claims.",
    "This lab validates workflow behavior, not profitability.",
    "Any parameter change must move through paper test, QA, and human review."
  ];

  let regimeScore = 50 + totalStrategyReturnPct * 2 + winRatePct / 4 + result.strategyMaxDrawdownPct;
  if (riskWarnings.length) regimeScore -= riskWarnings.length * 4;
  regimeScore = Math.max(0, Math.min(100, Number(regimeScore.toFixed(1))));

  return {
    regime: classification.regime,
    expectedRegime: period.expectedRegime,
    totalReturnPct: totalStrategyReturnPct,
    benchmarkReturnPct,
    benchmarkComparisonPct,
    maxDrawdownPct: result.strategyMaxDrawdownPct,
    tradeCount: tradeReturns.length,
    winRatePct,
    averageSimulatedTradeReturnPct,
    regimeScore,
    riskWarnings,
    overfittingWarnings,
    readinessNote: regimeScore >= 65 && riskWarnings.length <= 1 ? "paper_lab_watchlist" : "needs_more_paper_testing",
    passFailNote: regimeScore >= 60 ? "PASS_FOR_INFRASTRUCTURE_REVIEW_ONLY" : "FAIL_FOR_STRATEGY_READINESS"
  };
}

module.exports = { scoreBacktest };
