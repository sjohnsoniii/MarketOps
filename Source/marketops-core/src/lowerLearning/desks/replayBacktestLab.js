const { clampConfidence } = require("../shared/lowerLearningScoring");

function simulateStrategy(bars, strategyName, initialCash) {
  if (!bars || bars.length < 20) {
    return {
      strategyName,
      trades: 0,
      finalCash: initialCash,
      totalReturn: 0,
      totalReturnPct: 0,
      maxDrawdown: 0,
      winRate: 0,
      sharpeApprox: 0,
      sampleSize: bars ? bars.length : 0,
      note: "Insufficient data for simulation"
    };
  }

  let cash = initialCash;
  let position = 0;
  let entryPrice = 0;
  let trades = 0;
  let wins = 0;
  let losses = 0;
  let peakEquity = initialCash;
  let maxDrawdown = 0;
  let returns = [];

  const sorted = [...bars].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  for (let i = 20; i < sorted.length; i++) {
    const bar = sorted[i];
    const prev20 = sorted.slice(i - 20, i);
    if (prev20.length < 20) continue;

    const closes = prev20.map(b => b.close).filter(c => c != null);
    const avgClose = closes.reduce((a, c) => a + c, 0) / closes.length;
    const currentPrice = bar.close || bar.open || 0;
    if (currentPrice <= 0) continue;

    let signal = 0;

    switch (strategyName) {
      case "trend_following":
        if (currentPrice > avgClose * 1.02) signal = 1;
        else if (currentPrice < avgClose * 0.98) signal = -1;
        break;
      case "mean_reversion":
        if (currentPrice < avgClose * 0.98) signal = 1;
        else if (currentPrice > avgClose * 1.02) signal = -1;
        break;
      case "breakout_confirmation":
        if (currentPrice > avgClose * 1.03 && bar.volume > 0) signal = 1;
        else if (currentPrice < avgClose * 0.97 && bar.volume > 0) signal = -1;
        break;
      case "pullback_entry":
        if (currentPrice < avgClose * 0.97 && currentPrice > avgClose * 0.90) signal = 1;
        break;
      default:
        break;
    }

    if (signal > 0 && position === 0 && cash > 0) {
      const qty = cash / currentPrice;
      position = qty;
      entryPrice = currentPrice;
      cash = 0;
    } else if (signal < 0 && position > 0) {
      const proceeds = position * currentPrice;
      const pnl = proceeds - (position * entryPrice);
      cash = proceeds;
      position = 0;
      trades++;
      if (pnl > 0) wins++;
      else losses++;
      returns.push(pnl / (position * entryPrice));
    } else if (signal === 0 && position > 0) {
      const equity = cash + position * currentPrice;
      if (equity > peakEquity) peakEquity = equity;
      const dd = (peakEquity - equity) / peakEquity;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  }

  if (position > 0) {
    const lastBar = sorted[sorted.length - 1];
    const finalPrice = lastBar.close || lastBar.open || 0;
    if (finalPrice > 0) {
      const proceeds = position * finalPrice;
      const pnl = proceeds - (position * entryPrice);
      cash = proceeds;
      trades++;
      if (pnl > 0) wins++;
      else losses++;
      returns.push(pnl / (position * entryPrice));
    }
    position = 0;
  }

  const totalReturn = cash - initialCash;
  const totalReturnPct = initialCash > 0 ? (totalReturn / initialCash) * 100 : 0;
  const winRate = trades > 0 ? wins / trades : 0;
  const avgReturn = returns.length > 0 ? returns.reduce((a, r) => a + r, 0) / returns.length : 0;
  const stdReturn = returns.length > 1 ? Math.sqrt(returns.reduce((a, r) => a + (r - avgReturn) ** 2, 0) / (returns.length - 1)) : 0;
  const sharpeApprox = stdReturn > 0 ? avgReturn / stdReturn : 0;

  return {
    strategyName,
    trades,
    finalCash: Math.round(cash * 100) / 100,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPct: Math.round(totalReturnPct * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
    winRate: Math.round(winRate * 1000) / 1000,
    sharpeApprox: Math.round(sharpeApprox * 100) / 100,
    sampleSize: sorted.length,
    note: trades > 0 ? "Simulation completed" : "No trades executed in simulation"
  };
}

function runReplayBacktestLab(inputs) {
  const report = {
    status: "operational",
    confidence: 0,
    findings: [],
    limitations: [],
    dataLimitations: [],
    summary: "",
    details: "",
    simulations: [],
    sampleSize: 0,
    dateRange: { start: null, end: null },
    assumptions: [
      "Sliding window of 20 bars used for strategy signal generation (approximate).",
      "Execution at close prices of each bar (no slippage model).",
      "Full position entry/exit (no fractional sizing beyond what price allows).",
      "No transaction costs modeled.",
      "No liquidity constraints modeled.",
      "Results are deterministic from the same input data.",
      "This is NOT predictive proof — it is a simplified replay for observation only."
    ],
    limitations: []
  };

  const details = [];
  details.push("## Replay / Backtest Lab v0.1 — Lower Environment");
  details.push("");

  const rolling = inputs.sources.rollingHistory;
  const trades = inputs.sources.paperTrades;
  const performance = inputs.sources.paperPerformance;

  const strategies = ["trend_following", "mean_reversion", "breakout_confirmation", "pullback_entry"];
  const initialCash = 1000;

  if (rolling.found && rolling.data) {
    const bars = rolling.data.history || [];
    const symbols = [...new Set(bars.map(b => b.symbol))];
    const timestamps = bars.map(b => b.timestamp).filter(Boolean).sort();
    report.sampleSize = bars.length;
    if (timestamps.length > 0) {
      report.dateRange.start = timestamps[0];
      report.dateRange.end = timestamps[timestamps.length - 1];
    }

    details.push(`### Data Summary`);
    details.push("");
    details.push(`- Total bars: ${bars.length}`);
    details.push(`- Unique symbols: ${symbols.length}`);
    details.push(`- Date range: ${report.dateRange.start || "N/A"} to ${report.dateRange.end || "N/A"}`);
    details.push(`- Initial cash per strategy: $${initialCash}`);
    details.push("");

    details.push(`### Strategy Simulations`);
    details.push("");
    details.push(`**Note:** Simulations are simplified and deterministic. Results are for observation only, not predictive proof.`);
    details.push("");

    for (const sym of symbols.slice(0, 5)) {
      const symBars = bars.filter(b => b.symbol === sym).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      if (symBars.length < 30) continue;

      details.push(`#### Symbol: ${sym} (${symBars.length} bars)`);
      details.push("");
      details.push(`| Strategy | Trades | Return % | Max DD % | Win Rate | Sharpe |`);
      details.push(`|----------|--------|----------|----------|----------|--------|`);

      for (const strat of strategies) {
        const result = simulateStrategy(symBars, strat, initialCash);
        report.simulations.push(result);
        details.push(`| ${strat} | ${result.trades} | ${result.totalReturnPct}% | ${result.maxDrawdown}% | ${result.winRate} | ${result.sharpeApprox} |`);
      }
      details.push("");
    }

    if (symbols.length > 5) {
      report.findings.push(`Limited replay to first 5 symbols (${symbols.length} total available) for v0.1 scope.`);
    }

    report.findings.push(`Replayed ${report.simulations.length} strategy-symbol combinations.`);
    report.limitations.push("Only first 5 symbols simulated; remaining symbols available for expanded runs.");
    report.limitations.push("Simplified strategy logic — not representative of MarketOps production signal/risk pipeline.");
    report.limitations.push("No transaction costs, slippage, or liquidity modeling.");
  } else {
    details.push(`### Data Summary`);
    details.push("");
    details.push(`- Rolling history: NOT AVAILABLE`);
    details.push(``);
    report.dataLimitations.push("Rolling market history unavailable. Cannot perform replay simulations.");
    report.status = "limited";
  }

  details.push("### Paper Trade Replay (Experimental)");
  details.push("");
  if (trades.found && trades.data) {
    const td = trades.data;
    details.push(`- Executed trades (historical): ${td.executedTrades || 0}`);
    details.push(`- Ledger entries: ${(td.ledger || []).length}`);
    details.push(`- Note: Paper trade replay requires sequential historical state. v0.1 replays OHLCV bars only.`);
    details.push("");
  } else {
    details.push(`- Paper trade data: NOT AVAILABLE`);
    details.push("");
  }

  details.push("### Assumptions");
  details.push("");
  for (const a of report.assumptions) {
    details.push(`- ${a}`);
  }
  details.push("");

  details.push("### Limitations");
  details.push("");
  for (const lim of [...report.limitations, ...report.dataLimitations]) {
    details.push(`- ${lim}`);
  }
  details.push("");

  const simCount = report.simulations.length;
  const tradedSims = report.simulations.filter(s => s.trades > 0).length;
  report.confidence = clampConfidence(simCount > 0 ? (tradedSims / simCount) * 0.5 : 0);

  details.push("### Summary");
  details.push("");
  details.push(`- Simulations run: ${simCount}`);
  details.push(`- Simulations with trades: ${tradedSims}`);
  details.push(`- Confidence: ${(report.confidence * 100).toFixed(0)}%`);
  details.push(`- Sample size: ${report.sampleSize} bars`);
  details.push(`- Date range: ${report.dateRange.start || "N/A"} to ${report.dateRange.end || "N/A"}`);
  details.push("");

  report.summary = `Replay/Backtest Lab completed ${simCount} simulation(s) across ${strategies.length} strategies and limited symbols. Results are advisory only and not predictive proof.`;

  details.push(report.summary);
  details.push("");
  details.push("---");
  details.push("*Replay/Backtest Lab is a lower-environment/shadow-mode component. No production systems were modified.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runReplayBacktestLab };
