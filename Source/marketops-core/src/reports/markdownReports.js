function money(value) {
  if (value === null || value === undefined || !isFinite(Number(value))) {
    return "$0.00";
  }
  return `$${Number(value).toFixed(2)}`;
}

function pct(value) {
  if (value === null || value === undefined || !isFinite(Number(value))) {
    return "N/A";
  }
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

  return withSafety(lines, { dataSource: scan.dataSource });
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

  return withSafety(lines, { dataSource: riskReview.dataSource });
}

function tradesReport(paperResults) {
  const dataSource = paperResults.dataSource || "";
  const lines = [
    "# MarketOps Paper Trades v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${paperResults.generatedAt}`,
    `Starting balance: ${money(paperResults.startingBalance)}`,
    `Cash balance: ${money(paperResults.cashBalance || paperResults.endingBalance)}`,
    `Total equity: ${money(paperResults.totalEquity || paperResults.endingBalance)}`,
    `Realized P/L: ${money(paperResults.realizedPnl || 0)}`,
    `Unrealized P/L: ${money(paperResults.totalUnrealizedPnl || 0)}`,
    `Paper return: ${pct(paperResults.totalReturnPct)}`,
    `New trades executed this run: ${paperResults.executedTrades}`,
    `Open positions: ${paperResults.openPositionCount || 0}`,
    `Max drawdown: ${pct(paperResults.maxDrawdown)}`,
    "",
  ];

  if (paperResults.openPositionCount > 0 && Array.isArray(paperResults.trades)) {
    lines.push("### Open Positions");
    lines.push("");
    lines.push("| Vehicle | Side | Entry Price | Quantity | Position Value | Unrealized P/L |");
    lines.push("|---|---:|---:|---:|---:|---|");
    paperResults.trades.filter((t) => t.status === "open").forEach((trade) => {
      lines.push(`| ${trade.symbol} | ${trade.side} | ${money(trade.entryPrice)} | ${trade.quantity} | ${money(trade.positionValue)} | ${money(trade.cashBalanceAfterEntry ? 0 : 0)} |`);
    });
    lines.push("");
  }

  lines.push("### Trade History");
  lines.push("");
  lines.push("| Vehicle | Side | Entry | Exit | P/L | Return | Balance After | Mode |");
  lines.push("|---|---|---:|---:|---:|---:|---:|---|");

  if (paperResults.trades.length === 0 || !paperResults.trades.some((t) => t.status === "closed")) {
    lines.push("| None closed this run | - | - | - | - | - | - | paper_simulation |");
  }

  paperResults.trades.forEach((trade) => {
    if (trade.status === "closed") {
      lines.push(`| ${trade.symbol} | ${trade.side} | ${money(trade.entryPrice)} | ${money(trade.exitPrice)} | ${money(trade.realizedPnl)} | ${pct(trade.returnPct)} | ${money(trade.balanceAfterTrade)} | ${trade.mode} |`);
    }
  });

  if (paperResults.skippedReasons && paperResults.skippedReasons.length > 0) {
    lines.push("");
    lines.push("### Skipped / No-Trade Reasons");
    lines.push("");
    paperResults.skippedReasons.forEach((reason) => lines.push(`- ${reason}`));
  }

  if (paperResults.noTradeReason) {
    lines.push("");
    lines.push(`- ${paperResults.noTradeReason}`);
  }

  return withSafety(lines, { dataSource });
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
    `Equity curve points: ${equityCurve.points.length}`,
    "",
    "| Step | Time | Event | Symbol | P/L | Equity | Drawdown | Target Progress |",
    "|---:|---|---|---|---:|---:|---:|---:|"
  ];

  equityCurve.points.forEach((point) => {
    lines.push(`| ${point.step} | ${point.timestamp} | ${point.event} | ${point.symbol} | ${money(point.pnl)} | ${money(point.equity)} | ${pct(point.drawdownPct)} | ${pct(point.targetProgressPct)} |`);
  });

  if (equityCurve.points.length === 0) {
    lines.push("| No equity history yet — no trades executed this run | - | - | - | - | - | - | - |");
  }

  return withSafety(lines);
}

function performanceReport(summary) {
  const lines = [
    "# MarketOps Performance Summary v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${summary.generatedAt}`,
    `Data source: ${summary.dataSource || "unknown"}`,
    `Vehicles scanned: ${summary.vehiclesScanned}`,
    `Market bars scanned: ${summary.marketBarsScanned}`,
    `Signals generated: ${summary.signalsGenerated}`,
    `Risk approved: ${summary.riskApproved}`,
    `Risk blocked: ${summary.riskBlocked}`,
    `New trades this run: ${summary.newTrades}`,
    `Open positions: ${summary.openPositionCount}`,
    `Closed trades: ${summary.closedTrades}`,
    `Win rate: ${pct(summary.winRatePct)}`,
    `Cash balance: ${money(summary.cashBalance)}`,
    `Total equity: ${money(summary.totalEquity)}`,
    `Realized P/L: ${money(summary.realizedPnl)}`,
    `Unrealized P/L: ${money(summary.unrealizedPnl)}`,
    `Paper return: ${pct(summary.paperReturnPct)}`,
    `Max drawdown: ${pct(summary.maxDrawdownPct)}`,
    `Drawdown status: ${summary.drawdownStatus}`,
    "",
    "## Notes",
    ""
  ];

  summary.notes.forEach((note) => lines.push(`- ${note}`));
  return withSafety(lines, { dataSource: summary.dataSource });
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

function withSafety(lines, opts = {}) {
  const { dataSource } = opts;
  const isRealMarketData = dataSource && (dataSource.includes("alpaca") || dataSource.includes("iex") || dataSource.includes("backfill"));
  lines.push("");
  lines.push("## Safety Notes");
  lines.push("");
  lines.push("- Paper simulation only.");
  if (isRealMarketData) {
    lines.push("- Real market-data-derived paper simulation (Alpaca IEX).");
  } else {
    lines.push("- Sample data only.");
  }
  lines.push("- No broker connection.");
  lines.push("- Not live trading.");
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
