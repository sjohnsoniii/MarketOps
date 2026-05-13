function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function mean(values) {
  return values.length ? sum(values) / values.length : 0;
}

function stdev(values) {
  if (!values.length) return 0;
  const avg = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)));
}

function maxDrawdownFromPrices(prices) {
  let peak = prices[0] || 0;
  let maxDrawdown = 0;
  prices.forEach((price) => {
    if (price > peak) peak = price;
    const drawdown = peak ? ((price - peak) / peak) * 100 : 0;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  });
  return Number(maxDrawdown.toFixed(2));
}

function trendConsistency(returns) {
  if (!returns.length) return 0;
  const positive = returns.filter((value) => value > 0).length;
  const negative = returns.filter((value) => value < 0).length;
  return Number((Math.max(positive, negative) / returns.length).toFixed(2));
}

function classifyRegime(period) {
  const returns = period.priceSeries.map((point) => point.returnPct);
  const prices = period.priceSeries.map((point) => point.close);
  const totalReturn = ((prices[prices.length - 1] - period.startPrice) / period.startPrice) * 100;
  const volatility = stdev(returns);
  const maxDrawdown = maxDrawdownFromPrices(prices);
  const positiveRatio = returns.filter((value) => value > 0).length / returns.length;
  const consistency = trendConsistency(returns);

  let regime = "choppy_sideways";
  if (maxDrawdown <= -12 || volatility > 1.15 && totalReturn < -8) regime = "panic_drawdown";
  else if (totalReturn > 18 || (totalReturn > 12 && volatility > 0.65 && positiveRatio >= 0.65)) regime = "melt_up";
  else if (totalReturn > 0.5 && volatility < 0.15) regime = "low_volatility_drift";
  else if (totalReturn > 4 && positiveRatio >= 0.62) regime = "trend_up";
  else if (totalReturn < -4 && positiveRatio <= 0.42) regime = "trend_down";

  return {
    regime,
    totalReturnPct: Number(totalReturn.toFixed(2)),
    volatilityPct: Number(volatility.toFixed(2)),
    maxDrawdownPct: maxDrawdown,
    trendConsistency: consistency,
    positiveDayRatio: Number(positiveRatio.toFixed(2)),
    negativeDayRatio: Number((1 - positiveRatio).toFixed(2))
  };
}

module.exports = { classifyRegime, maxDrawdownFromPrices, mean };

