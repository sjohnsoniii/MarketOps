const { clampConfidence } = require("../shared/lowerLearningScoring");

function runPerformanceAttributionDesk(inputs) {
  const report = {
    status: "operational",
    confidence: 0,
    findings: [],
    dataLimitations: [],
    summary: "",
    details: ""
  };

  const details = [];
  details.push("## Performance Attribution Desk v0.1 — Lower Environment");
  details.push("");

  const positions = inputs.sources.paperPositions;
  const performance = inputs.sources.paperPerformance;
  const trades = inputs.sources.paperTrades;
  const equity = inputs.sources.equityCurve;
  const signals = inputs.sources.signalScan;
  const riskDecisions = inputs.sources.riskDecisions;
  const rolling = inputs.sources.rollingHistory;
  const riskDeskLearning = inputs.sources.riskDeskLearning;

  let attrCount = 0;

  details.push("### Performance Overview");
  details.push("");
  if (performance.found && performance.data) {
    const pd = performance.data;
    details.push(`- Starting cash: ${pd.startingCash !== undefined ? `$${pd.startingCash}` : "N/A"}`);
    details.push(`- Cash balance: ${pd.cashBalance !== undefined ? `$${pd.cashBalance}` : "N/A"}`);
    details.push(`- Realized P&L: ${pd.realizedPnl !== undefined ? `$${pd.realizedPnl}` : "N/A"}`);
    details.push(`- Unrealized P&L: ${pd.unrealizedPnl !== undefined ? `$${pd.unrealizedPnl}` : "N/A"}`);
    details.push(`- Total equity: ${pd.totalEquity !== undefined ? `$${pd.totalEquity}` : "N/A"}`);
    details.push(`- Max drawdown: ${pd.maxDrawdown !== undefined ? `${pd.maxDrawdown}%` : "N/A"}`);
    details.push(`- Daily trade count: ${pd.dailyTradeCount !== undefined ? pd.dailyTradeCount : "N/A"}`);

    if (pd.realizedPnl === 0 && pd.dailyTradeCount > 0) {
      report.findings.push("Daily trade count > 0 but realized P&L is $0 — possible attribution gap");
    }
    if (pd.maxDrawdown > 50) {
      report.findings.push(`High max drawdown (${pd.maxDrawdown}%) — significant risk event in window`);
    }
    attrCount++;
  } else {
    details.push(`- Performance data: NOT AVAILABLE`);
    report.dataLimitations.push("Paper performance data unavailable for performance overview.");
  }
  details.push("");

  details.push("### Position-Level Attribution");
  details.push("");
  if (positions.found && positions.data) {
    const posList = positions.data.openPositions || [];
    details.push(`- Open positions: ${posList.length}`);
    details.push("");

    if (posList.length > 0) {
      details.push("| Symbol | Side | Entry Price | Quantity | Unrealized P&L | Unrealized % | Band |");
      details.push("|--------|------|-------------|----------|----------------|--------------|------|");
      for (const pos of posList) {
        details.push(`| ${pos.symbol} | ${pos.side || "N/A"} | $${pos.entryPrice || "N/A"} | ${pos.quantity || "N/A"} | $${(pos.unrealizedPnl || 0).toFixed(2)} | ${(pos.unrealizedPnlPct || 0).toFixed(2)}% | ${pos.approvalBand || "N/A"} |`);
      }
      details.push("");

      const bySymbol = {};
      for (const pos of posList) {
        bySymbol[pos.symbol] = (bySymbol[pos.symbol] || 0) + 1;
      }
      const topSymbols = Object.entries(bySymbol).sort((a, b) => b[1] - a[1]).slice(0, 5);
      report.findings.push(`Position concentration: top symbols — ${topSymbols.map(([s, c]) => `${s}(${c})`).join(", ")}`);
      attrCount++;
    } else {
      details.push("No open positions to attribute.");
      report.findings.push("No open positions — cannot perform position-level attribution.");
    }
  } else {
    details.push(`- Positions data: NOT AVAILABLE`);
    report.dataLimitations.push("Paper positions data unavailable for position-level attribution.");
  }
  details.push("");

  details.push("### Equity Curve Attribution");
  details.push("");
  if (equity.found && equity.data) {
    const eq = equity.data;
    const pts = eq.points || [];
    details.push(`- Equity points: ${pts.length}`);
    if (pts.length > 0) {
      const values = pts.map(p => p.totalAccountValue).filter(v => v != null);
      if (values.length > 1) {
        const startVal = values[0];
        const endVal = values[values.length - 1];
        const change = endVal - startVal;
        const changePct = startVal > 0 ? (change / startVal) * 100 : 0;
        details.push(`- Window start: $${startVal.toFixed(2)}`);
        details.push(`- Window end: $${endVal.toFixed(2)}`);
        details.push(`- Change: $${change.toFixed(2)} (${changePct.toFixed(2)}%)`);

        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        details.push(`- Min value: $${minVal.toFixed(2)}`);
        details.push(`- Max value: $${maxVal.toFixed(2)}`);
        details.push(`- Range: $${(maxVal - minVal).toFixed(2)}`);
        attrCount++;
      }
    }
  } else {
    details.push(`- Equity curve: NOT AVAILABLE`);
    report.dataLimitations.push("Equity curve unavailable for attribution.");
  }
  details.push("");

  details.push("### Sector Attribution (Experimental)");
  details.push("");
  if (positions.found && positions.data) {
    const posList = positions.data.openPositions || [];
    if (posList.length > 0) {
      const symbols = posList.map(p => p.symbol);
      details.push(`- Symbols held: ${symbols.join(", ")}`);
      details.push(`- Note: Sector mapping not available in v0.1. Symbols listed for manual sector lookup.`);
      report.dataLimitations.push("Sector mapping data not available; sector-level attribution skipped.");
    } else {
      details.push("No positions to attribute by sector.");
    }
  } else {
    details.push(`- Positions data unavailable for sector attribution.`);
  }
  details.push("");

  details.push("### Trade Outcome Attribution");
  details.push("");
  if (trades.found && trades.data) {
    const td = trades.data;
    const executedTrades = td.executedTrades || 0;
    const ledger = td.ledger || [];
    const tradeList = td.trades || [];

    details.push(`- Executed trades: ${executedTrades}`);
    details.push(`- Ledger entries: ${ledger.length}`);
    details.push(`- Trade records: ${tradeList.length}`);

    if (ledger.length > 0) {
      details.push("");
      details.push("**Ledger entries:**");
      for (const entry of ledger) {
        details.push(`  - ${JSON.stringify(entry)}`);
      }
    }

    if (executedTrades === 0) {
      report.findings.push("No executed trades recorded — cannot perform trade outcome attribution.");
    }
    attrCount++;
  } else {
    details.push(`- Trade data: NOT AVAILABLE`);
    report.dataLimitations.push("Paper trades data unavailable for trade outcome attribution.");
  }
  details.push("");

  if (riskDeskLearning.found && riskDeskLearning.data) {
    details.push("### Risk Desk Learning Attribution");
    details.push("");
    const rl = riskDeskLearning.data;
    const approvedTrades = rl.approvedTrades || [];
    details.push(`- Approved learning trades: ${approvedTrades.length}`);
    if (approvedTrades.length > 0) {
      const outcomes = {};
      for (const t of approvedTrades) {
        const o = t.outcomeLabel || "unknown";
        outcomes[o] = (outcomes[o] || 0) + 1;
      }
      details.push(`- Outcome distribution: ${JSON.stringify(outcomes)}`);
      attrCount++;
    }
    details.push("");
  }

  const availableData = [positions.found, performance.found, trades.found, equity.found].filter(Boolean).length;
  report.confidence = clampConfidence(availableData / 4 * 0.7);

  if (attrCount > 0) {
    report.confidence = clampConfidence(report.confidence + 0.1);
  }

  details.push("### Summary");
  details.push("");
  details.push(`- Confidence: ${(report.confidence * 100).toFixed(0)}%`);
  details.push(`- Attribution dimensions available: ${attrCount}`);
  details.push(`- Data limitations: ${report.dataLimitations.length}`);
  details.push("");

  if (attrCount < 2) {
    report.summary = "Limited performance attribution possible due to insufficient data. See limitations for details.";
  } else {
    report.summary = `Performance attribution completed across ${attrCount} dimension(s). ${performance.found && performance.data ? `Account equity: $${performance.data.totalEquity || "N/A"}.` : ""}`;
  }

  details.push(report.summary);
  details.push("");
  details.push("---");
  details.push("*Performance Attribution Desk is a lower-environment/shadow-mode component. No production systems were modified.*");

  report.details = details.join("\n");

  return report;
}

module.exports = { runPerformanceAttributionDesk };
