const { maxDrawdownFromPrices } = require("./regimeClassifier");

function runSimpleStrategy(period) {
  const prices = period.priceSeries;
  const events = [];
  const trades = [];
  let inPosition = false;
  let entryPrice = 0;
  let entryDay = null;
  let entryMomentum = 0;
  const equity = [10000];
  let currentEquity = 10000;

  for (let i = 2; i < prices.length; i += 1) {
    const recentMomentum = prices[i - 2].returnPct + prices[i - 1].returnPct;
    const current = prices[i];
    const previous = prices[i - 1];
    const drawdownFromRecent = ((current.close - Math.max(prices[i - 1].close, prices[i - 2].close)) / Math.max(prices[i - 1].close, prices[i - 2].close)) * 100;

    if (!inPosition && recentMomentum > 0.45 && drawdownFromRecent > -2.5) {
      inPosition = true;
      entryPrice = current.close;
      entryDay = current.day;
      entryMomentum = Number(recentMomentum.toFixed(2));
      events.push({ day: current.day, eventType: "sample_entry", reason: "positive sample momentum", price: current.close });
      continue;
    }

    if (inPosition) {
      const tradeReturnPct = ((current.close - entryPrice) / entryPrice) * 100;
      const holdDays = current.day - entryDay;
      const exitForStop = tradeReturnPct <= -2.25;
      const exitForFade = previous.returnPct < -0.4 && current.returnPct < 0;
      const exitForTime = holdDays >= 4;
      if (exitForStop || exitForFade || exitForTime || i === prices.length - 1) {
        const roundedReturn = Number(tradeReturnPct.toFixed(2));
        trades.push({
          label: `Sample event ${trades.length + 1}`,
          entryDay,
          exitDay: current.day,
          entryMomentum,
          simulatedReturnPct: roundedReturn,
          outcome: roundedReturn > 0 ? "positive" : roundedReturn < 0 ? "negative" : "flat",
          exitReason: exitForStop ? "sample_risk_exit" : exitForFade ? "sample_momentum_fade" : "sample_time_exit"
        });
        currentEquity = Number((currentEquity * (1 + roundedReturn / 100)).toFixed(2));
        equity.push(currentEquity);
        events.push({ day: current.day, eventType: "sample_exit", reason: trades[trades.length - 1].exitReason, price: current.close, simulatedReturnPct: roundedReturn });
        inPosition = false;
      }
    }
  }

  if (inPosition) {
    const last = prices[prices.length - 1];
    const tradeReturnPct = ((last.close - entryPrice) / entryPrice) * 100;
    const roundedReturn = Number(tradeReturnPct.toFixed(2));
    trades.push({
      label: `Sample event ${trades.length + 1}`,
      entryDay,
      exitDay: last.day,
      entryMomentum,
      simulatedReturnPct: roundedReturn,
      outcome: roundedReturn > 0 ? "positive" : roundedReturn < 0 ? "negative" : "flat",
      exitReason: "sample_period_end"
    });
    currentEquity = Number((currentEquity * (1 + roundedReturn / 100)).toFixed(2));
    equity.push(currentEquity);
  }

  return {
    strategyName: "sample_momentum_guardrail_v0.1",
    mode: "paper_simulation",
    sampleData: true,
    syntheticHistoricalPreview: true,
    notLiveMarketData: true,
    events,
    trades,
    equityCurve: equity.map((value, index) => ({ step: index, equity: value })),
    strategyMaxDrawdownPct: maxDrawdownFromPrices(equity)
  };
}

module.exports = { runSimpleStrategy };
