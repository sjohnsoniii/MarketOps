const fs = require("fs");
const path = require("path");
const { buildDashboardBundle } = require("./dashboardAggregator");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const outputRoot = path.join(projectRoot, "Data", "dashboard");
const reportRoot = path.join(projectRoot, "Reports", "Dashboard");
const latestBundlePath = path.join(outputRoot, "dashboard-public-safe-v0.1.json");
const latestSummaryPath = path.join(outputRoot, "latest-dashboard-summary.json");
const reportPath = path.join(reportRoot, "marketops-dashboard-public-safe-v0.1.md");

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

function buildReport(bundle) {
  const performance = bundle.dashboardCards.currentPaperPerformance;
  const funnel = bundle.dashboardCards.signalFunnel;
  const risk = bundle.dashboardCards.riskEventSummary;
  const regimes = bundle.dashboardCards.regimeSummary;
  const content = bundle.dashboardCards.contentGenerationStats;
  const agents = bundle.dashboardCards.agentReviewStats;

  return `# MarketOps Public-Safe Dashboard Infrastructure v0.1

Generated at: ${bundle.generatedAt}

## Scope

This dashboard bundle is local and preview-safe. It contains paper simulation metrics, sample-data analytics, synthetic regime summaries, and review-gated operations stats. It does not include live market data, broker integrations, local paths, raw internal IDs, social posting, payments, or private execution details.

## Safety Labels

- Mode: ${bundle.mode}
- Paper only: ${bundle.paperOnly}
- Sample data: ${bundle.sampleData}
- Not financial advice: ${bundle.notFinancialAdvice}
- Not live market data: ${bundle.notLiveMarketData}

## Paper Performance Cards

- Starting paper equity: ${performance.startingEquity}
- Ending paper equity: ${performance.endingEquity}
- Paper P/L: ${performance.paperPnl}
- Paper return: ${performance.paperReturnPct}%
- Max drawdown: ${performance.maxDrawdownPct}%
- Risk-adjusted score: ${performance.riskAdjustedScore}

## Signal Funnel

- Vehicles scanned: ${funnel.vehiclesScanned}
- Signals reviewed: ${funnel.signalsReviewed}
- Candidates: ${funnel.candidates}
- Risk approved: ${funnel.riskApproved}
- Risk blocked: ${funnel.riskBlocked}
- Fake paper trades: ${funnel.fakePaperTrades}

## Risk Events

- Approval rate: ${risk.approvalRatePct}%
- Blocked rate: ${risk.blockedRatePct}%
- Risk posture: ${risk.blockedCount > risk.approvedCount ? "Risk Desk is blocking more than it approves." : "Risk Desk approvals are higher than blocks."}

## Regime Summary

- Regimes compared: ${regimes.regimesCompared}
- Strongest paper regime: ${regimes.strongestPaperRegime}
- Weakest paper regime: ${regimes.weakestPaperRegime}
- Worst synthetic drawdown regime: ${regimes.worstSyntheticDrawdownRegime}
- Inactive regimes: ${regimes.inactiveRegimes.join(", ") || "none"}

## Content + Agent Review Stats

- Content generated: ${content.contentGenerated}
- Queue items: ${content.queueItems}
- Compliance status: ${content.complianceStatus}
- Publish allowed: ${content.publishAllowed}
- Agent reviews generated: ${agents.reviewsGenerated}
- Improvement proposals: ${agents.proposalCount}
- Human review load: ${agents.humanReviewLoad}
- Auto-apply allowed: ${agents.autoApplyAllowed}

## Chart-Ready Sections

- Equity curve points: ${bundle.charts.equityCurve.length}
- Rolling equity points: ${bundle.charts.rollingEquity.length}
- Drawdown visual sections: current run and rolling runs
- Signal funnel steps: ${bundle.charts.signalFunnel.length}
- Trade outcome bars: ${bundle.charts.tradeOutcomeBars.length}
- Regime score bars: ${bundle.charts.regimeScoreBars.length}
- Synthetic benchmark comparison rows: ${bundle.charts.syntheticBenchmarkComparison.length}

## Notes

- This is dashboard infrastructure, not a public performance claim.
- All IDs and local paths are intentionally excluded.
- Future public pages should keep the same paper/sample/not-financial-advice labels visible.
`;
}

function runDashboardBuild() {
  const bundle = buildDashboardBundle();
  const timestampedPath = path.join(outputRoot, `dashboard-public-safe-${stampForFile()}.json`);
  const summary = {
    generatedAt: bundle.generatedAt,
    mode: bundle.mode,
    paperOnly: bundle.paperOnly,
    sampleData: bundle.sampleData,
    notFinancialAdvice: bundle.notFinancialAdvice,
    notLiveMarketData: bundle.notLiveMarketData,
    publicSafe: bundle.publicSafe,
    cardsGenerated: Object.keys(bundle.dashboardCards).length,
    chartSectionsGenerated: Object.keys(bundle.charts).length,
    rollingRunsReviewed: bundle.rollingAnalytics.runsReviewed,
    strongestPaperRegime: bundle.dashboardCards.regimeSummary.strongestPaperRegime,
    weakestPaperRegime: bundle.dashboardCards.regimeSummary.weakestPaperRegime
  };

  writeJson(timestampedPath, bundle);
  writeJson(latestBundlePath, bundle);
  writeJson(latestSummaryPath, summary);
  writeText(reportPath, buildReport(bundle));

  console.log("MarketOps public-safe dashboard bundle complete");
  console.log(`cards generated: ${summary.cardsGenerated}`);
  console.log(`chart sections generated: ${summary.chartSectionsGenerated}`);
  console.log(`rolling runs reviewed: ${summary.rollingRunsReviewed}`);
  console.log(`strongest paper regime: ${summary.strongestPaperRegime}`);
  console.log(`weakest paper regime: ${summary.weakestPaperRegime}`);
  console.log(`bundle: ${latestBundlePath}`);
  console.log(`timestamped bundle: ${timestampedPath}`);
  console.log(`report: ${reportPath}`);

  return { bundle, summary, latestBundlePath, timestampedPath, reportPath };
}

if (require.main === module) {
  try {
    runDashboardBuild();
  } catch (error) {
    console.error(`dashboard:build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runDashboardBuild, outputRoot, latestBundlePath, latestSummaryPath, reportPath };
