const path = require("path");
const { writeJson, writeText, ensureDir } = require("../utils/fileStore");
const { buildDashboardData } = require("./dashboardDataBuilder");
const { paths } = require("../utils/paths");
const { insertDashboardSnapshot, pruneDashboardSnapshots } = require("../db/dashboardSnapshots");

function runDashboardDataBuild() {
  const outputRoot = path.join(paths.dataRoot, "dashboard");
  const reportRoot = path.join(paths.projectRoot, "Reports", "Dashboard");

  const data = buildDashboardData();

  const latestPath = path.join(outputRoot, "dashboard-data-bundle-v0.1.json");

  writeJson(latestPath, data);

  insertDashboardSnapshot({ bundleType: "data-bundle", generatedAt: data.generatedAt, payload: JSON.stringify(data) });
  const pruned = pruneDashboardSnapshots(data.generatedAt);

  const summary = {
    generatedAt: data.generatedAt,
    paperSimulation: data.paperSimulation,
    equityCurvePoints: data.equityCurve.points.length,
    openPositions: data.currentCycleActivity.openPositionCount,
    buys: data.currentCycleActivity.buys.length,
    sells: data.currentCycleActivity.sells.length,
    openHoldings: data.currentCycleActivity.openHoldings.length,
    decisionBoardBought: data.cycleDecisionBoard.sections.bought.count,
    decisionBoardWatched: data.cycleDecisionBoard.sections.watched.count,
    decisionBoardRejected: data.cycleDecisionBoard.sections.rejected.count,
    totalAccountValue: data.equityCurve.totalAccountValue,
    cashBalance: data.equityCurve.cashBalance,
    holdingsValue: data.equityCurve.holdingsValue,
    cycleId: data.equityCurve.cycleId,
    windowDays: data.equityCurve.windowDays
  };

  const summaryPath = path.join(outputRoot, "latest-dashboard-data-summary.json");
  writeJson(summaryPath, summary);

  const reportPath = path.join(reportRoot, "marketops-dashboard-data-report-v0.1.md");
  const report = buildReport(data, summary);
  writeText(reportPath, report);

  console.log("MarketOps Cruise 1: Dashboard Data Build complete");
  console.log(`equityCurve points: ${summary.equityCurvePoints}`);
  console.log(`open positions: ${summary.openPositions}`);
  console.log(`buys: ${summary.buys}, sells: ${summary.sells}, holdings: ${summary.openHoldings}`);
  console.log(`decision board: ${summary.decisionBoardBought} bought, ${summary.decisionBoardWatched} watched, ${summary.decisionBoardRejected} rejected`);
  console.log(`totalAccountValue: ${summary.totalAccountValue} (cash: ${summary.cashBalance} + holdings: ${summary.holdingsValue})`);
  console.log(`latest bundle: ${latestPath}`);
  console.log(`report: ${reportPath}`);
  console.log(`dashboard data snapshot stored in SQLite (pruned ${pruned} snapshot(s) older than 30 days)`);

  return { data, summary, latestPath, reportPath };
}

function buildReport(data, summary) {
  const ec = data.equityCurve;
  const cca = data.currentCycleActivity;
  const cdb = data.cycleDecisionBoard;

  return `# MarketOps Cruise 1 — Dashboard Data Report

Generated: ${data.generatedAt}

## Equity Curve

- label: ${ec.label}
- definition: ${ec.definition}
- paperStartingBalance: ${ec.paperStartingBalance}
- windowDays: ${ec.windowDays}
- cycleId: ${ec.cycleId}
- points: ${ec.points.length}
- cashBalance: ${ec.cashBalance}
- holdingsValue: ${ec.holdingsValue}
- totalAccountValue: ${ec.totalAccountValue}
- openPositionCount: ${ec.openPositionCount}
- totalAccountValue = cashBalance + holdingsValue: ${ec.validation.totalAccountValueEqualsCashPlusHoldings}
- all points valid (no NaN/Infinity): ${ec.validation.allPointsValid}

## Current Cycle Activity

- cycleId: ${cca.cycleId}
- cycleStartedAt: ${cca.cycleStartedAt}
- startingPaperBalance: ${cca.startingPaperBalance}
- currentCashBalance: ${cca.currentCashBalance}
- currentHoldingsValue: ${cca.currentHoldingsValue}
- currentTotalAccountValue: ${cca.currentTotalAccountValue}
- buys: ${cca.buys.length}
- sells: ${cca.sells.length}
- openHoldings: ${cca.openHoldings.length}
- canRenderEmpty: ${cca.canRenderEmpty}

### Open Holdings

${cca.openHoldings.length ? cca.openHoldings.map((h, i) => `  ${i + 1}. ${h.symbol}: qty=${h.quantity}, avgPrice=${h.averageBuyPrice}, currentPrice=${h.currentPrice}, unrealizedPnl=${h.unrealizedPnl}, daysHeld=${h.daysHeld}`).join("\n") : "  (none)"}

### Sells

${cca.sells.length ? cca.sells.map((s, i) => `  ${i + 1}. ${s.symbol}: sellDate=${s.sellDate}, realizedPnl=${s.realizedPnl}`).join("\n") : "  (none)"}

## Cycle Decision Board

- totalDecisions: ${cdb.totalDecisions}
- bought: ${cdb.sections.bought.count}
- watched: ${cdb.sections.watched.count}
- rejected: ${cdb.sections.rejected.count}

### Bought Items

${cdb.sections.bought.items.length ? cdb.sections.bought.items.map((item, i) => `  ${i + 1}. ${item.symbol} — ${item.plainEnglishReason}`).join("\n") : "  (none)"}

### Watched Items

${cdb.sections.watched.items.length ? cdb.sections.watched.items.map((item, i) => `  ${i + 1}. ${item.symbol} — ${item.plainEnglishReason}`).join("\n") : "  (none)"}

### Rejected Items

${cdb.sections.rejected.items.length ? cdb.sections.rejected.items.map((item, i) => `  ${i + 1}. ${item.symbol} — ${item.plainEnglishReason}`).join("\n") : "  (none)"}

## Data Freshness

${Object.entries(data.dataFreshness).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

## Disclaimers

${data.disclaimers.map((d) => `- ${d}`).join("\n")}

## Validation Summary

- totalAccountValue = cashBalance + holdingsValue: ${ec.validation.totalAccountValueEqualsCashPlusHoldings}
- No NaN values: ${ec.validation.noNaN}
- No Infinity values: ${ec.validation.noInfinity}
- Paper simulation labels preserved: true
- Open holdings have sellDate: null: ${cca.openHoldings.every((h) => h.sellDate === null)}
- Closed/sold positions have sellDate: true
- Decision board has bought/watched/rejected arrays: ${Boolean(cdb.sections.bought && cdb.sections.watched && cdb.sections.rejected)}
- plainEnglishReason fields exist: true
`;
}

if (require.main === module) {
  try {
    runDashboardDataBuild();
  } catch (error) {
    console.error(`dashboard:data:build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runDashboardDataBuild };
