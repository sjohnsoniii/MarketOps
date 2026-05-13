const { round } = require("../utils/number");

function buildEquityCurve({ paperResults, targetBalance, generatedAt }) {
  const startingBalance = paperResults.startingBalance;
  let peakEquity = startingBalance;

  const points = paperResults.ledger.map((entry, index) => {
    peakEquity = Math.max(peakEquity, entry.balance);
    const drawdownPct = peakEquity === 0 ? 0 : ((entry.balance - peakEquity) / peakEquity) * 100;

    return {
      step: index,
      timestamp: entry.timestamp,
      event: entry.eventType,
      symbol: entry.symbol,
      pnl: round(entry.amount || 0),
      equity: round(entry.balance),
      drawdownPct: round(drawdownPct),
      targetProgressPct: round((entry.balance / targetBalance) * 100),
      mode: "paper_simulation",
      paperOnly: true
    };
  });

  const endingEquity = points.length ? points[points.length - 1].equity : startingBalance;
  const maxDrawdownPct = Math.min(...points.map((point) => point.drawdownPct));

  return {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    startingBalance,
    targetBalance,
    endingEquity: round(endingEquity),
    totalPnl: round(endingEquity - startingBalance),
    totalReturnPct: round(((endingEquity - startingBalance) / startingBalance) * 100),
    maxDrawdownPct: round(maxDrawdownPct),
    targetMet: endingEquity >= targetBalance,
    points
  };
}

module.exports = { buildEquityCurve };
