function money(value) {
  return `$${Number(value).toFixed(2)}`;
}

function pct(value) {
  return `${Number(value).toFixed(2)}%`;
}

function signalReport(scan) {
  const lines = [
    "# MarketOps Signal Scan v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${scan.generatedAt}`,
    `Vehicles scanned: ${scan.totalVehicles}`,
    `Market bars scanned: ${scan.totalMarketBars}`,
    `Movement threshold: ${scan.movementThresholdPct}%`,
    `Candidate signals: ${scan.candidateCount}`,
    "",
    "| Vehicle | Type | Bias | Change | Status | Confidence | Risk |",
    "|---|---|---|---:|---|---:|---|"
  ];

  scan.signals.forEach((signal) => {
    lines.push(`| ${signal.symbol} | ${signal.assetType} | ${signal.directionBias} | ${signal.sampleChangePct}% | ${signal.status} | ${signal.confidence} | ${signal.riskLevel} |`);
  });

  return withSafety(lines);
}

function riskReport(riskReview) {
  const lines = [
    "# MarketOps Risk Desk v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${riskReview.generatedAt}`,
    `Total signals reviewed: ${riskReview.totalSignals}`,
    `Approved: ${riskReview.approvedCount}`,
    `Blocked: ${riskReview.blockedCount}`,
    "",
    "| Vehicle | Bias | Confidence | Approved | Final Risk | Block Reasons |",
    "|---|---|---:|---|---|---|"
  ];

  riskReview.decisions.forEach((decision) => {
    lines.push(`| ${decision.symbol} | ${decision.directionBias} | ${decision.confidence} | ${decision.approved} | ${decision.finalRiskLevel} | ${decision.blockReasons.join(" ") || "None"} |`);
  });

  return withSafety(lines);
}

function tradesReport(paperResults) {
  const lines = [
    "# MarketOps Paper Trades v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${paperResults.generatedAt}`,
    `Starting balance: ${money(paperResults.startingBalance)}`,
    `Ending balance: ${money(paperResults.endingBalance)}`,
    `Paper P/L: ${money(paperResults.totalPnl)}`,
    `Paper return: ${pct(paperResults.totalReturnPct)}`,
    `Fake paper trades: ${paperResults.executedTrades}`,
    "",
    "| Vehicle | Side | Entry | Exit | P/L | Return | Balance After | Mode |",
    "|---|---|---:|---:|---:|---:|---:|---|"
  ];

  if (paperResults.trades.length === 0) {
    lines.push("| None | - | - | - | - | - | - | paper_simulation |");
  }

  paperResults.trades.forEach((trade) => {
    lines.push(`| ${trade.symbol} | ${trade.side} | ${money(trade.entryPrice)} | ${money(trade.exitPrice)} | ${money(trade.realizedPnl)} | ${pct(trade.returnPct)} | ${money(trade.balanceAfterTrade)} | ${trade.mode} |`);
  });

  return withSafety(lines);
}

function equityReport(equityCurve) {
  const lines = [
    "# MarketOps Equity Curve v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${equityCurve.generatedAt}`,
    `Starting balance: ${money(equityCurve.startingBalance)}`,
    `Target balance: ${money(equityCurve.targetBalance)}`,
    `Ending equity: ${money(equityCurve.endingEquity)}`,
    `Total return: ${pct(equityCurve.totalReturnPct)}`,
    `Max drawdown: ${pct(equityCurve.maxDrawdownPct)}`,
    `Target met: ${equityCurve.targetMet}`,
    "",
    "| Step | Time | Event | Symbol | P/L | Equity | Drawdown | Target Progress |",
    "|---:|---|---|---|---:|---:|---:|---:|"
  ];

  equityCurve.points.forEach((point) => {
    lines.push(`| ${point.step} | ${point.timestamp} | ${point.event} | ${point.symbol} | ${money(point.pnl)} | ${money(point.equity)} | ${pct(point.drawdownPct)} | ${pct(point.targetProgressPct)} |`);
  });

  return withSafety(lines);
}

function performanceReport(summary) {
  const lines = [
    "# MarketOps Performance Summary v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${summary.generatedAt}`,
    `Vehicles scanned: ${summary.vehiclesScanned}`,
    `Market bars scanned: ${summary.marketBarsScanned}`,
    `Signals generated: ${summary.signalsGenerated}`,
    `Risk approved: ${summary.riskApproved}`,
    `Risk blocked: ${summary.riskBlocked}`,
    `Fake paper trades: ${summary.fakePaperTrades}`,
    `Win rate: ${pct(summary.winRatePct)}`,
    `Ending balance: ${money(summary.endingBalance)}`,
    `Paper P/L: ${money(summary.paperPnl)}`,
    `Paper return: ${pct(summary.paperReturnPct)}`,
    `Max drawdown: ${pct(summary.maxDrawdownPct)}`,
    "",
    "## Notes",
    ""
  ];

  summary.notes.forEach((note) => lines.push(`- ${note}`));
  return withSafety(lines);
}

function staffWriterBrief({ scan, riskReview, paperResults, performanceSummary, generatedAt }) {
  const lines = [
    "# MarketOps Staff Writer Brief v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Executive Summary",
    "",
    "MarketOps completed a deterministic paper-only simulation using sample vehicles and sample market bars. The point of this run is not to claim edge. The point is to prove the local office loop: load data, scan signals, send candidates through Risk Desk, execute fake paper trades, update the ledger, build an equity curve, and produce reviewable reports.",
    "",
    "## Snapshot",
    "",
    `Vehicles scanned: ${scan.totalVehicles}`,
    `Candidate signals: ${scan.candidateCount}`,
    `Risk approved: ${riskReview.approvedCount}`,
    `Risk blocked: ${riskReview.blockedCount}`,
    `Fake paper trades: ${paperResults.executedTrades}`,
    `Ending paper balance: ${money(paperResults.endingBalance)}`,
    `Paper P/L: ${money(paperResults.totalPnl)}`,
    `Win rate: ${pct(performanceSummary.winRatePct)}`,
    "",
    "## What It Means",
    "",
    "The machine has a repeatable Phase 1 test path now. It is still simple, still fake-money, and still sample-data only. That is exactly the point: MarketOps should earn complexity slowly, with a ledger and safety gates already in place.",
    "",
    "## Next Build Targets",
    "",
    "- Persist more strategy versions.",
    "- Expand sample scenarios before live data exists.",
    "- Add more Risk Desk checks.",
    "- Improve dashboard views from the generated bundle.",
    "- Keep real money nowhere near Phase 1."
  ];

  return withSafety(lines);
}

function qaReport({ generatedAt, passed, checks }) {
  const lines = [
    "# MarketOps QA Report v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${generatedAt}`,
    `Result: ${passed ? "QA PASS" : "QA FAIL"}`,
    "",
    "| Check | Status | Detail |",
    "|---|---|---|"
  ];

  checks.forEach((check) => {
    lines.push(`| ${check.name} | ${check.passed ? "PASS" : "FAIL"} | ${check.detail} |`);
  });

  return withSafety(lines);
}

function withSafety(lines) {
  lines.push("");
  lines.push("## Safety Notes");
  lines.push("");
  lines.push("- Paper simulation only.");
  lines.push("- Sample data only.");
  lines.push("- No broker connection.");
  lines.push("- No live market data.");
  lines.push("- No real-money trading.");
  lines.push("- No SMS or subscriber alerts.");
  lines.push("- No margin, leverage, options, futures, shorting, or exchange execution.");
  return lines.join("\n");
}

module.exports = {
  equityReport,
  performanceReport,
  qaReport,
  riskReport,
  signalReport,
  staffWriterBrief,
  tradesReport
};
