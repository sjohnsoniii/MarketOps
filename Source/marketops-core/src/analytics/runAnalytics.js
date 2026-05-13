const fs = require("fs");
const path = require("path");
const { runMetricsEngine } = require("./metricsEngine");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const analyticsRoot = path.join(projectRoot, "Data", "analytics");
const reportsRoot = path.join(projectRoot, "Reports", "Analytics");
const latestSummaryPath = path.join(analyticsRoot, "latest-analytics-summary.json");
const reportPath = path.join(reportsRoot, "marketops-metrics-performance-analytics-v0.1.md");

function stampForFile(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function buildReport(summary) {
  const regimeRows = summary.regimeAnalytics.regimeRows
    .map((row) => `| ${row.regime} | ${row.strategyReturnPct}% | ${row.syntheticPeriodDrawdownPct}% | ${row.tradeCount} | ${row.winRatePct}% | ${row.regimeScore} |`)
    .join("\n");
  const tradeRows = summary.tradeAnalytics.sanitizedTradeOutcomes.length
    ? summary.tradeAnalytics.sanitizedTradeOutcomes.map((trade) => `| ${trade.sequence} | ${trade.symbol} | ${trade.outcome} | ${trade.realizedPnl} | ${trade.returnPct}% |`).join("\n")
    : "| none | none | none | 0 | 0% |";

  return `# MarketOps Metrics + Performance Analytics v0.1

Generated at: ${summary.generatedAt}

## Safety + Scope

This analytics layer uses local paper/sample data and deterministic synthetic regime outputs only. It is not live market data, not real trading performance, not financial advice, and not a prompt to copy any trade.

## Paper Equity Analytics

- Starting paper equity: ${summary.equityAnalytics.startingEquity}
- Ending paper equity: ${summary.equityAnalytics.endingEquity}
- Paper P/L: ${summary.equityAnalytics.totalPnl}
- Paper return: ${summary.equityAnalytics.totalReturnPct}%
- Max paper drawdown: ${summary.equityAnalytics.maxDrawdownPct}%
- Step volatility: ${summary.equityAnalytics.stepVolatilityPct}%
- Sharpe-like placeholder: ${summary.equityAnalytics.sharpeLikePlaceholder}
- Risk-adjusted paper score: ${summary.riskAdjustedScore}

${summary.equityAnalytics.drawdownObservation}

## Paper Trade Analytics

| Sequence | Vehicle | Outcome | Paper P/L | Paper Return |
|---:|---|---|---:|---:|
${tradeRows}

- Win rate: ${summary.tradeAnalytics.winRatePct}%
- Longest win streak: ${summary.tradeAnalytics.longestWinStreak}
- Longest loss streak: ${summary.tradeAnalytics.longestLossStreak}
- Average paper trade P/L: ${summary.tradeAnalytics.averageTradePnl}
- Worst paper trade P/L: ${summary.tradeAnalytics.worstPaperTradePnl}

## Regime Comparison Analytics

| Synthetic Regime | Paper Strategy Return | Synthetic Period Drawdown | Sample Events | Win Rate | Regime Score |
|---|---:|---:|---:|---:|---:|
${regimeRows}

- Strongest paper regime: ${summary.regimeAnalytics.strongestPaperRegime}
- Weakest paper regime: ${summary.regimeAnalytics.weakestPaperRegime}
- Worst synthetic drawdown regime: ${summary.regimeAnalytics.worstSyntheticDrawdownRegime}
- Inactive regimes: ${summary.regimeAnalytics.inactiveRegimes.join(", ") || "none"}
- Average benchmark comparison placeholder: ${summary.benchmarkComparisonPlaceholder.averageRegimeBenchmarkComparisonPct}%

## Drawdown Observations

- Paper account drawdown is currently ${summary.equityAnalytics.maxDrawdownPct}% across ${summary.equityAnalytics.equityPointCount} equity points.
- The worst synthetic regime drawdown came from ${summary.regimeAnalytics.worstSyntheticDrawdownRegime}.
- Drawdown metrics are diagnostic only because all inputs are paper/sample or synthetic.

## Overfitting Warnings

${summary.regimeAnalytics.overfittingWarnings.map((warning) => `- ${warning}`).join("\n")}
- The current paper trade sample is too small for confidence.
- Benchmark comparisons are placeholders from deterministic synthetic regimes.

## Next Useful Improvements

- Add longer paper histories before trusting streak or volatility metrics.
- Add more synthetic transition regimes, especially noisy reversal periods.
- Compare multiple paper-only strategy harnesses before promoting any experiment.
- Keep all changes review-gated and QA-checked before they affect production behavior.
`;
}

function runAnalytics() {
  const summary = runMetricsEngine();
  const runPath = path.join(analyticsRoot, `analytics-run-${stampForFile()}.json`);
  writeJson(runPath, summary);
  writeJson(latestSummaryPath, { ...summary, latestRunPath: runPath });
  writeText(reportPath, buildReport(summary));

  console.log("MarketOps Metrics + Performance Analytics v0.1 complete");
  console.log(`paper return: ${summary.equityAnalytics.totalReturnPct}%`);
  console.log(`max drawdown: ${summary.equityAnalytics.maxDrawdownPct}%`);
  console.log(`risk-adjusted paper score: ${summary.riskAdjustedScore}`);
  console.log(`strongest paper regime: ${summary.regimeAnalytics.strongestPaperRegime}`);
  console.log(`weakest paper regime: ${summary.regimeAnalytics.weakestPaperRegime}`);
  console.log(`latest summary: ${latestSummaryPath}`);
  console.log(`run output: ${runPath}`);
  console.log(`report: ${reportPath}`);

  return { summary, runPath, latestSummaryPath, reportPath };
}

if (require.main === module) {
  try {
    runAnalytics();
  } catch (error) {
    console.error(`analytics:run failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runAnalytics, analyticsRoot, latestSummaryPath, reportPath };
