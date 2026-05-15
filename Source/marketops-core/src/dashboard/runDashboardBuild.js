const fs = require("fs");
const path = require("path");
const { buildDashboardBundle } = require("./dashboardAggregator");
const { writeShareableSnapshot } = require("./shareableSnapshot");

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
  const market = bundle.dashboardCards.marketDataFreshnessPanel;
  const stale = bundle.dashboardCards.staleDataWarningPanel;

  return `# MarketOps Public-Safe Dashboard Infrastructure v0.1

Generated at: ${bundle.generatedAt}

## Scope

This dashboard bundle is local and preview-safe. It contains paper simulation metrics, derived Alpaca IEX market-data movement where available, synthetic regime summaries, and review-gated operations stats. It does not include broker integrations, local paths, raw internal IDs, social posting, payments, secrets, or private execution details.

## Safety Labels

- Mode: ${bundle.mode}
- Paper only: ${bundle.paperOnly}
- Sample data: ${bundle.sampleData}
- Real market data inputs: ${bundle.realMarketDataInputs}
- Data source: ${bundle.dataSource}
- Market data mode: ${bundle.marketDataMode}
- Not financial advice: ${bundle.notFinancialAdvice}
- Not live market data publishing: ${bundle.notLiveMarketData}
- External effects: ${bundle.externalEffects}
- Publish allowed: ${bundle.publishAllowed}

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
- Paper P&L timeline points: ${bundle.charts.paperPnlSeries.length}
- Rolling equity points: ${bundle.charts.rollingEquity.length}
- Drawdown visual sections: current run and rolling runs
- Vehicle activity rows: ${bundle.charts.vehicleActivity.length}
- Signal/risk count rows: ${bundle.charts.signalRiskCounts.length}
- Cumulative paper P&L points: ${bundle.charts.cumulativePaperPnl.length}
- Target progress milestones: ${bundle.charts.targetProgress.length}
- Signal funnel steps: ${bundle.charts.signalFunnel.length}
- Trade outcome bars: ${bundle.charts.tradeOutcomeBars.length}
- Risk decision bars: ${bundle.charts.riskDecisionMix.length}
- Vehicle contribution rows: ${bundle.charts.vehicleContribution.length}
- Return vs drawdown rows: ${bundle.charts.returnVsDrawdownSnapshot.length}
- Paper account milestone strip points: ${bundle.charts.paperAccountMilestoneStrip.length}
- Market data freshness rows: ${bundle.charts.marketDataFreshnessPanel.length}
- Recent market movement rows: ${bundle.charts.recentMarketMovementPanel.length}
- Bot activity timeline rows: ${bundle.charts.botActivityTimeline.length}
- Stale data warning rows: ${bundle.charts.staleDataWarningPanel.length}
- Regime score bars: ${bundle.charts.regimeScoreBars.length}
- Synthetic benchmark comparison rows: ${bundle.charts.syntheticBenchmarkComparison.length}

## Market Data Freshness

- Source/feed: ${market.dataSource} / ${market.feed}
- Market refresh timestamp: ${market.generatedAt}
- Latest bar timestamp: ${market.latestBarTimestamp}
- Bars loaded: ${market.barsLoaded}
- Quotes loaded: ${market.quotesLoaded}
- Refresh freshness: ${market.refreshFreshnessLabel}
- Latest bar freshness: ${market.latestBarFreshnessLabel}
- Raw market data published: ${market.rawMarketDataPublished}

## Stale/Fallback Notes

${stale.warnings.map((item) => `- ${item.item}: ${item.status} - ${item.detail}`).join("\n")}

## Notes

- This is dashboard infrastructure, not a public performance claim.
- All IDs and local paths are intentionally excluded.
- Public pages should keep the paper-only, fake-money, public-safe derived-data, and not-financial-advice labels visible.
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
    realMarketDataInputs: bundle.realMarketDataInputs,
    dataSource: bundle.dataSource,
    marketDataMode: bundle.marketDataMode,
    latestMarketDataRefreshAt: bundle.latestMarketDataRefreshAt,
    latestAlpacaBarTimestamp: bundle.latestAlpacaBarTimestamp,
    notFinancialAdvice: bundle.notFinancialAdvice,
    notLiveMarketData: bundle.notLiveMarketData,
    publicSafe: bundle.publicSafe,
    externalEffects: bundle.externalEffects,
    publishAllowed: bundle.publishAllowed,
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
  console.log(`bundle: ${latestBundlePath}`);
  console.log(`timestamped bundle: ${timestampedPath}`);
  console.log(`report: ${reportPath}`);

  const snapshot = writeShareableSnapshot();
  console.log(`shareable snapshot: ${snapshot.snapshotJsonPath}`);

  return { bundle, summary, latestBundlePath, timestampedPath, reportPath, snapshot };
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
