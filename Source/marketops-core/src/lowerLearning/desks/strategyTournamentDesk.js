const { clampConfidence } = require("../shared/lowerLearningScoring");

function computeReturn(bars, strategyName) {
  if (!bars || bars.length < 20) return null;

  const sorted = [...bars].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let cash = 1000;
  let position = 0;
  let entryPrice = 0;
  let trades = 0;
  let wins = 0;
  let peakEquity = 1000;
  let maxDrawdown = 0;
  let returns = [];

  for (let i = 20; i < sorted.length; i++) {
    const bar = sorted[i];
    const prev20 = sorted.slice(i - 20, i);
    const closes = prev20.map(b => b.close).filter(c => c != null);
    if (closes.length < 10) continue;
    const avgClose = closes.reduce((a, c) => a + c, 0) / closes.length;
    const price = bar.close || bar.open || 0;
    if (price <= 0) continue;

    let signal = 0;
    switch (strategyName) {
      case "baseline_current_behavior":
        break;
      case "trend_following":
        if (price > avgClose * 1.02) signal = 1;
        else if (price < avgClose * 0.98) signal = -1;
        break;
      case "mean_reversion":
        if (price < avgClose * 0.98) signal = 1;
        else if (price > avgClose * 1.02) signal = -1;
        break;
      case "breakout_confirmation":
        if (price > avgClose * 1.03 && bar.volume > 0) signal = 1;
        else if (price < avgClose * 0.97 && bar.volume > 0) signal = -1;
        break;
      case "pullback_entry":
        if (price < avgClose * 0.97 && price > avgClose * 0.90) signal = 1;
        break;
      case "operator_defense_filtered":
        if (price > avgClose * 1.02 && bar.volume > 0) signal = 1;
        break;
      case "defensive_cash_preservation":
        break;
      default:
        break;
    }

    if (signal > 0 && position === 0 && cash > 0) {
      position = cash / price;
      entryPrice = price;
      cash = 0;
    } else if (signal < 0 && position > 0) {
      const proceeds = position * price;
      const pnl = proceeds - (position * entryPrice);
      cash = proceeds;
      position = 0;
      trades++;
      if (pnl > 0) wins++;
      returns.push(pnl / (position * entryPrice || 1));
    } else if (position > 0) {
      const equity = cash + position * price;
      if (equity > peakEquity) peakEquity = equity;
      const dd = (peakEquity - equity) / peakEquity;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  }

  if (position > 0 && sorted.length > 0) {
    const lastBar = sorted[sorted.length - 1];
    const finalPrice = lastBar.close || lastBar.open || 0;
    if (finalPrice > 0) {
      const proceeds = position * finalPrice;
      cash = proceeds;
      trades++;
      if (proceeds > position * entryPrice) wins++;
      returns.push((proceeds - position * entryPrice) / (position * entryPrice || 1));
    }
    position = 0;
  }

  const totalReturn = cash - 1000;
  const totalReturnPct = (totalReturn / 1000) * 100;
  const winRate = trades > 0 ? wins / trades : 0;

  return {
    strategyName,
    totalReturnPct: Math.round(totalReturnPct * 100) / 100,
    trades,
    winRate: Math.round(winRate * 1000) / 1000,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 100
  };
}

function runStrategyTournamentDesk(inputs) {
  const report = {
    status: "operational",
    confidence: 0,
    findings: [],
    limitations: [],
    dataLimitations: [],
    summary: "",
    details: "",
    ranking: [],
    tournamentLabel: "ADVISORY ONLY — No winner auto-promoted",
    families: [
      "baseline_current_behavior",
      "trend_following",
      "mean_reversion",
      "breakout_confirmation",
      "pullback_entry",
      "operator_defense_filtered",
      "defensive_cash_preservation"
    ]
  };

  const details = [];
  details.push("## Strategy Tournament Desk v0.1 — Lower Environment");
  details.push("");
  details.push("**Labels:** ADVISORY ONLY — No winner will be auto-promoted.");
  details.push("");

  const rolling = inputs.sources.rollingHistory;
  const signals = inputs.sources.signalScan;
  const riskDecisions = inputs.sources.riskDecisions;

  if (rolling.found && rolling.data) {
    const bars = rolling.data.history || [];
    const symbols = [...new Set(bars.map(b => b.symbol))];

    details.push(`### Tournament Data`);
    details.push("");
    details.push(`- Total bars: ${bars.length}`);
    details.push(`- Symbols available: ${symbols.length}`);
    details.push(`- Strategy families: ${report.families.length}`);
    details.push("- Initial capital per strategy: $1,000");
    details.push("");

    const allResults = [];

    for (const sym of symbols.slice(0, 5)) {
      const symBars = bars.filter(b => b.symbol === sym).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      if (symBars.length < 30) continue;

      details.push(`#### ${sym} — Tournament Results`);
      details.push("");
      details.push(`| Strategy | Return % | Trades | Win Rate | Max DD % |`);
      details.push(`|----------|----------|--------|----------|----------|`);

      for (const fam of report.families) {
        const result = computeReturn(symBars, fam);
        if (result) {
          allResults.push(result);
          details.push(`| ${fam} | ${result.totalReturnPct}% | ${result.trades} | ${result.winRate} | ${result.maxDrawdown}% |`);
        }
      }
      details.push("");
    }

    if (allResults.length > 0) {
      const byStrategy = {};
      for (const r of allResults) {
        if (!byStrategy[r.strategyName]) {
          byStrategy[r.strategyName] = { returns: [], trades: 0, wins: 0 };
        }
        byStrategy[r.strategyName].returns.push(r.totalReturnPct);
        byStrategy[r.strategyName].trades += r.trades || 0;
      }

      const avgScores = Object.entries(byStrategy).map(([name, data]) => {
        const avgReturn = data.returns.reduce((a, r) => a + r, 0) / data.returns.length;
        return { strategyName: name, avgReturn, totalTrades: data.trades };
      }).sort((a, b) => b.avgReturn - a.avgReturn);

      report.ranking = avgScores.map((s, i) => ({
        rank: i + 1,
        strategyName: s.strategyName,
        avgReturnPct: Math.round(s.avgReturn * 100) / 100,
        totalTrades: s.totalTrades
      }));

      details.push("### Overall Ranking (Advisory)");
      details.push("");
      details.push("| Rank | Strategy | Avg Return % | Total Trades |");
      details.push("|------|----------|-------------|--------------|");
      for (const r of report.ranking) {
        details.push(`| ${r.rank} | ${r.strategyName} | ${r.avgReturnPct}% | ${r.totalTrades} |`);
      }
      details.push("");
      details.push("*Ranking is advisory only. No strategy will be auto-promoted.*");
      details.push("");

      const topStrategy = report.ranking[0];
      report.findings.push(`Top-ranked strategy: ${topStrategy.strategyName} (avg return ${topStrategy.avgReturnPct}%)`);
      report.findings.push(`Total strategy-symbol combinations scored: ${allResults.length}`);

      const hasDefensive = report.ranking.find(r => r.strategyName === "defensive_cash_preservation");
      if (hasDefensive) {
        report.findings.push(`Defensive/cash-preservation strategy ranked #${hasDefensive.rank} — ${hasDefensive.avgReturnPct > 0 ? "positive" : "negative"} return`);
      }
    } else {
      details.push("*No tournament results computed. Insufficient bar data per symbol.*");
      report.findings.push("No tournament results — insufficient data.");
    }

    if (symbols.length > 5) {
      report.limitations.push("Tournament limited to first 5 symbols for v0.1 scope.");
    }
  } else {
    details.push(`### Data`);
    details.push("");
    details.push(`- Rolling history: NOT AVAILABLE`);
    details.push("");
    report.dataLimitations.push("Rolling market history unavailable. Cannot run strategy tournament.");
    report.status = "limited";
  }

  if (signals.found || riskDecisions.found) {
    details.push("### Context from Existing Pipeline");
    details.push("");
    if (signals.found && signals.data) {
      details.push(`- Signal scan: ${(signals.data.signals || []).length} signals available for reference.`);
    }
    if (riskDecisions.found && riskDecisions.data) {
      details.push(`- Risk decisions: ${(riskDecisions.data.decisions || []).length} decisions available for reference.`);
    }
    details.push("- Note: Tournament uses simplified OHLCV-only strategies, not the full MarketOps signal/risk pipeline.");
    details.push("");
  }

  let dataRatio = 0;
  if (rolling.found) dataRatio += 0.5;
  if (signals.found) dataRatio += 0.25;
  if (riskDecisions.found) dataRatio += 0.25;
  report.confidence = clampConfidence(dataRatio * 0.7);

  details.push("### Limitations");
  details.push("");
  for (const lim of [...report.limitations, ...report.dataLimitations]) {
    details.push(`- ${lim}`);
  }
  details.push("- Simplified OHLCV-only strategies — not representative of full MarketOps pipeline.");
  details.push("- No transaction costs, slippage, or liquidity modeled.");
  details.push("- Ranking is statistical only and may not persist across different market conditions.");
  details.push("");

  details.push("### Summary");
  details.push("");
  details.push(`- Families evaluated: ${report.families.length}`);
  details.push(`- Ranking produced: ${report.ranking.length > 0 ? "yes" : "no"}`);
  details.push(`- Confidence: ${(report.confidence * 100).toFixed(0)}%`);
  details.push(`- Auto-promotion: DISABLED`);
  details.push("");

  report.summary = `Strategy tournament completed. ${report.ranking.length > 0 ? `Top-ranked: ${report.ranking[0].strategyName}. ` : ""}All results are advisory only — no winner will be auto-promoted.`;

  details.push(report.summary);
  details.push("");
  details.push("---");
  details.push("*Strategy Tournament Desk is a lower-environment/shadow-mode component. No production systems were modified.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runStrategyTournamentDesk };
