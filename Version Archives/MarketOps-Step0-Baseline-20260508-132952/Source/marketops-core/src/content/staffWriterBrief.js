function buildStaffWriterBrief({ scan, riskReview, paperResults }) {
  const bestTrade = getBestTrade(paperResults.trades);
  const worstTrade = getWorstTrade(paperResults.trades);

  const lines = [
    "# MarketOps Staff Writer Brief v0.1",
    "",
    "Mode: paper_simulation",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Executive Summary",
    "",
    "MarketOps completed a paper-only simulation run using sample market data. The purpose of this run was not to prove trading edge yet. The purpose was to prove that the core operating loop works: load vehicles, read sample market movement, generate signal candidates, run Risk Desk review, execute fake paper trades, and produce reports.",
    "",
    "This is fake data, fake execution, and fake money. Tiny goblin training wheels remain attached.",
    "",
    "## Performance Snapshot",
    "",
    `Starting paper balance: $${paperResults.startingBalance.toFixed(2)}`,
    `Ending paper balance: $${paperResults.endingBalance.toFixed(2)}`,
    `Total paper P/L: $${paperResults.totalPnl.toFixed(2)}`,
    `Paper return: ${paperResults.totalReturnPct.toFixed(2)}%`,
    `Approved signals: ${paperResults.approvedSignals}`,
    `Executed fake paper trades: ${paperResults.executedTrades}`,
    "",
    "## Signal Snapshot",
    "",
    `Vehicles scanned: ${scan.totalVehicles}`,
    `Movement threshold: ${scan.movementThresholdPct}%`,
    `Candidate signals found: ${scan.candidateCount}`,
    `Risk approved: ${riskReview.approvedCount}`,
    `Risk blocked: ${riskReview.blockedCount}`,
    "",
    "## Best Trade",
    ""
  ];

  if (bestTrade) {
    lines.push(`Vehicle: ${bestTrade.symbol}`);
    lines.push(`Side: ${bestTrade.side}`);
    lines.push(`Entry: $${bestTrade.entryPrice}`);
    lines.push(`Exit: $${bestTrade.exitPrice}`);
    lines.push(`P/L: $${bestTrade.realizedPnl}`);
    lines.push(`Return: ${bestTrade.returnPct}%`);
    lines.push(`Note: ${bestTrade.notes}`);
  }
  else {
    lines.push("No fake paper trades were executed.");
  }

  lines.push("");
  lines.push("## Worst Trade");
  lines.push("");

  if (worstTrade) {
    lines.push(`Vehicle: ${worstTrade.symbol}`);
    lines.push(`Side: ${worstTrade.side}`);
    lines.push(`Entry: $${worstTrade.entryPrice}`);
    lines.push(`Exit: $${worstTrade.exitPrice}`);
    lines.push(`P/L: $${worstTrade.realizedPnl}`);
    lines.push(`Return: ${worstTrade.returnPct}%`);
    lines.push(`Note: ${worstTrade.notes}`);
  }
  else {
    lines.push("No fake paper trades were executed.");
  }

  lines.push("");
  lines.push("## What Happened");
  lines.push("");
  lines.push("MarketOps scanned the sample universe, classified movement, promoted qualified movers into signal candidates, sent every signal through Risk Desk, and only allowed approved signals into fake paper execution.");
  lines.push("");
  lines.push("The important win is architectural: the machine now has a working path from market data to paper P/L. It is still a baby system, but the loop exists.");
  lines.push("");
  lines.push("## What Worked");
  lines.push("");
  lines.push("- Vehicle loading worked.");
  lines.push("- Sample market-bar loading worked.");
  lines.push("- Signal scanning worked.");
  lines.push("- Risk Desk approval/block logic worked.");
  lines.push("- Fake paper execution worked.");
  lines.push("- P/L reporting worked.");
  lines.push("- Report generation worked.");
  lines.push("");
  lines.push("## What Failed / Needs Work");
  lines.push("");
  lines.push("- Market data is still fake/sample data.");
  lines.push("- Signals are based only on simple sample movement.");
  lines.push("- Risk Desk rules are still basic.");
  lines.push("- Trade execution is fake and simplistic.");
  lines.push("- No real strategy edge has been proven.");
  lines.push("- No benchmark comparison exists yet.");
  lines.push("- No equity curve exists yet.");
  lines.push("");
  lines.push("## Blog Draft Angle");
  lines.push("");
  lines.push("Suggested headline:");
  lines.push("");
  lines.push("MarketOps First Paper Simulation: The Trading Office Gets Its First Fake Blood");
  lines.push("");
  lines.push("Suggested summary:");
  lines.push("");
  lines.push("This post should explain that MarketOps has moved from planning into a runnable paper-only simulation skeleton. The article should walk through the first internal loop, explain why sample data is being used, show the fake paper P/L, and clearly state that this does not prove edge yet. The educational value is showing how a trading system gets built safely: data first, signals second, risk review third, paper execution fourth, real money nowhere near the room.");
  lines.push("");
  lines.push("## Social Post Seeds");
  lines.push("");
  lines.push("### X / Twitter");
  lines.push("");
  lines.push("MarketOps just ran its first paper-only simulation loop: vehicles -> sample market data -> signal scan -> Risk Desk -> fake paper trades -> P/L report. No APIs. No broker. No real money. Tiny goblin has a ledger now.");
  lines.push("");
  lines.push("### LinkedIn");
  lines.push("");
  lines.push("I started building MarketOps as a transparent AI trading office. The first milestone is not live trading. It is proving the internal safety loop: data ingestion, signal generation, risk review, paper execution, and honest reporting.");
  lines.push("");
  lines.push("### Instagram / Facebook");
  lines.push("");
  lines.push("MarketOps got its first fake-money test run. The goal is not hype. The goal is to build the trading lab safely, prove the process, log the results, and only let real money enter after the system earns it.");
  lines.push("");
  lines.push("## Compliance Notes");
  lines.push("");
  lines.push("- This was paper-only.");
  lines.push("- This used sample data.");
  lines.push("- This is not financial advice.");
  lines.push("- This does not prove future performance.");
  lines.push("- No broker was connected.");
  lines.push("- No real trades were placed.");
  lines.push("- No subscriber alerts were sent.");
  lines.push("");
  lines.push("## Next Recommended Build Step");
  lines.push("");
  lines.push("Add Equity Curve v0.1 so MarketOps can track paper balance over time and produce dashboard-ready performance data.");
  lines.push("");
  lines.push("Civilization trembles, but the lawyers remain bored.");
  
  return lines.join("\n");
}

function getBestTrade(trades) {
  if (!trades || trades.length === 0) return null;
  return [...trades].sort((a, b) => b.realizedPnl - a.realizedPnl)[0];
}

function getWorstTrade(trades) {
  if (!trades || trades.length === 0) return null;
  return [...trades].sort((a, b) => a.realizedPnl - b.realizedPnl)[0];
}

module.exports = { buildStaffWriterBrief };