const fs = require("fs");
const path = require("path");
const { getSampleHistoricalPeriods } = require("./sampleHistoricalSeries");
const { classifyRegime } = require("./regimeClassifier");
const { runSimpleStrategy } = require("./backtestEngine");
const { scoreBacktest } = require("./backtestScoring");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const dataRoot = path.join(projectRoot, "Data");
const outputRoot = path.join(dataRoot, "backtests");
const reportRoot = path.join(projectRoot, "Reports", "Backtesting");
const latestSummaryPath = path.join(outputRoot, "latest-backtest-summary.json");
const reportPath = path.join(reportRoot, "marketops-backtesting-regime-lab-v0.1.md");

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
  const sorted = summary.regimeResults.slice().sort((a, b) => b.score.regimeScore - a.score.regimeScore);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const rows = summary.regimeResults.map((item) => `| ${item.periodId} | ${item.classification.regime} | ${item.score.totalReturnPct}% | ${item.score.maxDrawdownPct}% | ${item.score.tradeCount} | ${item.score.winRatePct}% | ${item.score.regimeScore} | ${item.score.passFailNote} |`).join("\n");

  return `# MarketOps Backtesting + Regime Lab v0.1

Generated at: ${summary.generatedAt}

## Synthetic-Data Disclaimer

This is a paper/simulation-only backtesting lab using deterministic synthetic historical-style sample data. It is not live market data, not real historical market data, not real performance, and not financial advice.

## Regimes Tested

${summary.regimesTested.map((regime) => `- ${regime}`).join("\n")}

## Strategy Behavior By Regime

| Period | Classified Regime | Strategy Return | Max Drawdown | Sample Events | Win Rate | Regime Score | Readiness Note |
|---|---:|---:|---:|---:|---:|---:|---|
${rows}

## Strongest Synthetic Regime

${strongest.classification.regime} produced the highest infrastructure score (${strongest.score.regimeScore}). This means the simple paper harness behaved most cleanly in that synthetic condition. It does not mean the strategy is ready for real capital.

## Weakest Synthetic Regime

${weakest.classification.regime} produced the weakest score (${weakest.score.regimeScore}). Review the warning list before promoting any experiment.

## Drawdown Notes

${summary.regimeResults.map((item) => `- ${item.classification.regime}: strategy max drawdown ${item.score.maxDrawdownPct}%; synthetic period drawdown ${item.classification.maxDrawdownPct}%.`).join("\n")}

## Overfitting Warnings

- Synthetic sample periods are intentionally small.
- Any improvement from this lab must be treated as a paper-only idea.
- No parameter change should be promoted without QA and human review.
- This report should never be used as a performance claim.

## What This Means

The lab can now run a repeatable sample strategy across multiple synthetic regimes, score behavior, and identify weak conditions. That is infrastructure progress.

## What This Does Not Mean

It does not prove profitability, readiness for live execution, or suitability for anyone to follow. It does not use live market data.

## Next Recommended Improvements

- Add more deterministic sample periods.
- Add rolling regime transitions instead of isolated periods.
- Compare multiple paper-only strategy harnesses.
- Add a QA check that prevents public dashboard claims from referencing backtest scores as performance.
`;
}

function runBacktestLab() {
  const generatedAt = new Date().toISOString();
  const periods = getSampleHistoricalPeriods();
  const regimeResults = periods.map((period) => {
    const classification = classifyRegime(period);
    const result = runSimpleStrategy(period);
    const score = scoreBacktest({ period, classification, result });
    return {
      periodId: period.periodId,
      description: period.description,
      expectedRegime: period.expectedRegime,
      mode: "paper_simulation",
      sampleData: true,
      syntheticHistoricalPreview: true,
      notLiveMarketData: true,
      classification,
      strategyResult: result,
      score
    };
  });

  const summary = {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    syntheticHistoricalPreview: true,
    notLiveMarketData: true,
    labVersion: "backtesting-regime-lab-v0.1",
    strategyName: "sample_momentum_guardrail_v0.1",
    regimesTested: regimeResults.map((item) => item.classification.regime),
    expectedRegimes: periods.map((period) => period.expectedRegime),
    periodsTested: periods.length,
    regimeResults,
    strongestRegime: regimeResults.slice().sort((a, b) => b.score.regimeScore - a.score.regimeScore)[0].classification.regime,
    weakestRegime: regimeResults.slice().sort((a, b) => a.score.regimeScore - b.score.regimeScore)[0].classification.regime,
    publicSafety: {
      notFinancialAdvice: true,
      noLiveMarketData: true,
      noBrokerConnection: true,
      liveExecutionDisabled: true,
      noProfitabilityClaim: true
    }
  };

  const runPath = path.join(outputRoot, `backtest-run-${stampForFile()}.json`);
  writeJson(runPath, summary);
  writeJson(latestSummaryPath, { ...summary, latestRunPath: runPath });
  writeText(reportPath, buildReport(summary));

  console.log("MarketOps Backtesting + Regime Lab v0.1 complete");
  console.log(`periods tested: ${summary.periodsTested}`);
  console.log(`regimes tested: ${summary.regimesTested.join(", ")}`);
  console.log(`strongest synthetic regime: ${summary.strongestRegime}`);
  console.log(`weakest synthetic regime: ${summary.weakestRegime}`);
  console.log(`latest summary: ${latestSummaryPath}`);
  console.log(`run output: ${runPath}`);
  console.log(`report: ${reportPath}`);

  return { summary, runPath, latestSummaryPath, reportPath };
}

if (require.main === module) {
  try {
    runBacktestLab();
  } catch (error) {
    console.error(`backtest:run failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runBacktestLab, outputRoot, latestSummaryPath, reportPath };

