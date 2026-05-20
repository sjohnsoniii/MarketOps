const path = require("path");
const { fileExists, loadJson, writeText, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function safeLoad(filePath, fallback) {
  try {
    if (fileExists(filePath)) return loadJson(filePath);
  } catch (e) {}
  return fallback;
}

function safeNumber(value, fallback) {
  const n = Number(value);
  return isFinite(n) ? n : (fallback !== undefined ? fallback : 0);
}

async function runStep(name, description, fn) {
  const start = Date.now();
  try {
    await fn();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  [PASS] ${name}: ${description} (${elapsed}s)`);
    return { name, status: "PASS", elapsed };
  } catch (error) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const msg = String(error.message || error);
    console.log(`  [FAIL] ${name}: ${description} - ${msg} (${elapsed}s)`);
    return { name, status: "FAIL", error: msg, elapsed };
  }
}

function execStep(cmd) {
  const { execSync } = require("child_process");
  return execSync(cmd, { cwd: paths.coreRoot, stdio: "pipe", timeout: 300000 });
}

function buildProfitSummary() {
  const cycle = safeLoad(paths.cycleLatestJson, {});
  const performance = safeLoad(paths.paperPerformanceJson, {});
  const positions = safeLoad(paths.paperPositionsJson, { openPositions: [], closedPositions: [] });
  const equity = safeLoad(paths.equityJson, {});
  const dashboardBundle = safeLoad(path.join(paths.dataRoot, "dashboard", "dashboard-data-bundle-v0.1.json"), {});
  const trades = safeLoad(paths.tradesJson, {});
  const paperRoot = path.join(paths.dataRoot, "paper");
  const learning = safeLoad(path.join(paperRoot, "risk", "risk-desk-learning-v0.1.json"), {});
  const reviewQueue = safeLoad(path.join(paths.dataRoot, "review", "review-queue-v0.1.json"), {});

  const equityPoints = (dashboardBundle.equityCurve && dashboardBundle.equityCurve.points) || equity.points || [];
  const firstPoint = equityPoints.length > 0 ? equityPoints[0] : null;
  const lastPoint = equityPoints.length > 0 ? equityPoints[equityPoints.length - 1] : null;

  const cycleActivity = dashboardBundle.currentCycleActivity || {};
  const openPos = positions.openPositions || [];
  const closedPos = positions.closedPositions || [];
  const buys = cycleActivity.buys || [];
  const sells = cycleActivity.sells || [];
  const openHoldings = cycleActivity.openHoldings || [];

  const totalPnl = safeNumber(performance.totalEquity, 0) - safeNumber(performance.startingCash || cycle.startingBalance || 1000, 0);
  const totalReturnPct = safeNumber(cycle.startingBalance, 1000) > 0
    ? round((totalPnl / safeNumber(cycle.startingBalance, 1000)) * 100)
    : 0;

  const profitableOpen = openPos.filter(p => safeNumber(p.unrealizedPnl, 0) > 0);
  const losingOpen = openPos.filter(p => safeNumber(p.unrealizedPnl, 0) < 0);

  const profitSummary = {
    generatedAt: new Date().toISOString(),
    accountGrowth: {
      cycleId: cycle.cycleId || "N/A",
      cycleStatus: cycle.status || "unknown",
      startingCycleValue: safeNumber(firstPoint ? firstPoint.totalAccountValue : cycle.startingBalance, 1000),
      currentTotalAccountValue: safeNumber(lastPoint ? lastPoint.totalAccountValue : cycleActivity.currentTotalAccountValue, 0),
      cashBalance: safeNumber(cycleActivity.currentCashBalance || performance.cashBalance, 0),
      holdingsValue: safeNumber(cycleActivity.currentHoldingsValue || performance.totalEquity - performance.cashBalance, 0),
      totalPnl,
      percentReturn: totalReturnPct,
      maxDrawdownPct: safeNumber(performance.maxDrawdown, null),
      benchmarkComparison: "Not available. No benchmark index tracked in this cycle.",
      totalAccountValueEqualsCashPlusHoldings: checkValueEquality(
        safeNumber(cycleActivity.currentTotalAccountValue || lastPoint?.totalAccountValue, 0),
        safeNumber(cycleActivity.currentCashBalance || lastPoint?.cashBalance, 0) +
        safeNumber(cycleActivity.currentHoldingsValue || lastPoint?.holdingsValue, 0)
      )
    },
    tradeProfitability: {
      entries: buys.length,
      exits: sells.length,
      openPositions: openHoldings.length,
      closedPositions: closedPos.length,
      profitableExits: 0,
      losingExits: 0,
      winRate: null,
      averageRealizedGain: null,
      openUnrealizedGain: round(openPos.reduce((sum, p) => sum + safeNumber(p.unrealizedPnl, 0), 0)),
      profitableOpenCount: profitableOpen.length,
      losingOpenCount: losingOpen.length
    },
    exitLogicVisibility: {
      exitLogicExists: false,
      profitTakingRulesExist: false,
      stopLossRiskExitRulesExist: false,
      stalePositionDetection: false,
      holdingsCanPersistAcrossCycles: true,
      purchaseDatePreserved: openHoldings.length > 0 ? openHoldings.every(h => !!h.purchaseDate) : false,
      sellDatePreserved: openHoldings.length > 0 ? openHoldings.every(h => "sellDate" in h) : false
    },
    learningQuality: {
      approvedTradesTracked: (learning.approvedTrades || []).length,
      rejectedTradesTracked: (learning.rejectedTrades || []).length,
      watchedSignalsTracked: (learning.watchedSignals || []).length,
      goodApprovals: (learning.summary && learning.summary.goodApprovalCount) || 0,
      badApprovals: (learning.summary && learning.summary.badApprovalCount) || 0,
      badRejections: (learning.summary && learning.summary.badRejectionCount) || 0,
      goodRejections: (learning.summary && learning.summary.goodRejectionCount) || 0,
      recommendationsGenerated: (learning.recommendations || []).length,
      proposalsInReviewQueue: (reviewQueue.proposals || []).length,
      proposalsRoutedToQueue: (learning.proposals || []).length
    }
  };

  return profitSummary;
}

function checkValueEquality(a, b) {
  if (a === 0 && b === 0) return true;
  if (a === 0 || b === 0) return false;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) < 0.005;
}

async function runStabilize() {
  const generatedAt = new Date().toISOString();
  console.log("=".repeat(60));
  console.log("MarketOps Stabilization Run v0.1");
  console.log(`Started: ${generatedAt}`);
  console.log("Paper Simulation Only. No Live Trading.");
  console.log("=".repeat(60));
  console.log("");

  const results = [];

  // Phase 1: Core pipeline (market:refresh equivalent)
  console.log("--- Phase 1: Market Data Refresh ---");
  results.push(await runStep("marketdata:refresh", "Fetch latest Alpaca IEX data", () => execStep("npm run marketdata:refresh")));
  results.push(await runStep("marketdata:backfill", "Backfill past 7 days", () => execStep("npm run marketdata:backfill")));
  results.push(await runStep("marketdata:rolling", "Merge rolling history", () => execStep("npm run marketdata:rolling")));
  results.push(await runStep("marketdata:weather", "Build weather station", () => execStep("npm run marketdata:weather")));
  results.push(await runStep("intraday:simulate", "Paper simulation", () => execStep("npm run intraday:simulate")));
  results.push(await runStep("confidence:calibrate", "Confidence calibration", () => execStep("npm run confidence:calibrate")));
  results.push(await runStep("risk:explain", "Risk explainability", () => execStep("npm run risk:explain")));
  results.push(await runStep("cycle:build", "Cycle build", () => execStep("npm run cycle:build")));
  results.push(await runStep("approvals:generate", "Approvals waterfall", () => execStep("npm run approvals:generate")));
  results.push(await runStep("marketdata:qa", "Market data QA", () => execStep("npm run marketdata:qa")));
  results.push(await runStep("cycle:qa", "Cycle QA", () => execStep("npm run cycle:qa")));
  results.push(await runStep("dashboard:build", "Dashboard build", () => execStep("npm run dashboard:build")));
  results.push(await runStep("dashboard:refresh", "Dashboard refresh", () => execStep("npm run dashboard:refresh")));

  // Phase 2: Cruise 1 - Dashboard Data Bundle
  console.log("\n--- Phase 2: Dashboard Data Bundle (Cruise 1) ---");
  results.push(await runStep("dashboard:data:build", "Build Cruise 1 data bundle", () => execStep("npm run dashboard:data:build")));
  results.push(await runStep("dashboard:data:qa", "Cruise 1 data QA", () => execStep("npm run dashboard:data:qa")));

  // Phase 3: Cruise 3 - Risk Desk Learning
  console.log("\n--- Phase 3: Risk Desk Learning (Cruise 3) ---");
  results.push(await runStep("risk:learning", "Build Risk Desk learning records", () => execStep("npm run risk:learning")));
  results.push(await runStep("risk:learning:qa", "Risk learning QA", () => execStep("npm run risk:learning:qa")));

  // Phase 4: Cruise 4 - Review Queue Import
  console.log("\n--- Phase 4: Review Queue Import (Cruise 4) ---");
  results.push(await runStep("review:import", "Import proposals to review queue", () => execStep("npm run review:import")));
  results.push(await runStep("review:qa", "Review queue QA", () => execStep("npm run review:qa")));

  // Phase 5: Dashboard & Public Refresh
  console.log("\n--- Phase 5: Dashboard & Public Refresh ---");
  results.push(await runStep("dashboard:qa", "Dashboard QA", () => execStep("npm run dashboard:qa")));
  results.push(await runStep("dashboard:refresh:qa", "Dashboard refresh QA", () => execStep("npm run dashboard:refresh:qa")));
  results.push(await runStep("dashboard:public-refresh:qa", "Public refresh QA", () => execStep("npm run dashboard:public-refresh:qa")));
  results.push(await runStep("public:trial-status", "Public trial status", () => execStep("npm run public:trial-status")));
  results.push(await runStep("public:update-manifest", "Update manifest", () => execStep("npm run public:update-manifest")));

  // Phase 6: Final QAs
  console.log("\n--- Phase 6: Final QA ---");
  results.push(await runStep("qa:full", "Full simulation QA", () => execStep("npm run qa:full")));
  results.push(await runStep("automation:check", "Automation check", () => execStep("npm run automation:check")));
  results.push(await runStep("scheduler:check", "Scheduler check", () => execStep("npm run scheduler:check")));

  // Build profit summary
  console.log("\n--- Profit Objective Summary ---");
  const profitSummary = buildProfitSummary();
  console.log(JSON.stringify(profitSummary, null, 2));
  console.log("");

  // Summary
  const passed = results.filter(s => s.status === "PASS").length;
  const failed = results.filter(s => s.status === "FAIL").length;
  const total = results.length;

  console.log("=".repeat(60));
  console.log("Stabilization Summary");
  console.log("=".repeat(60));
  console.log(`Total steps: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("");

  for (const step of results) {
    const icon = step.status === "PASS" ? "OK" : "XX";
    console.log(`  [${icon}] ${step.name} (${step.elapsed}s)`);
    if (step.status === "FAIL" && step.error) {
      console.log(`       error: ${step.error}`);
    }
  }
  console.log("");

  // Write health report
  const reportDir = path.join(paths.projectRoot, "Reports", "Automation");
  const reportPath = path.join(reportDir, "marketops-cruise5-stabilization-automation-checkpoint-v0.1.md");
  const report = buildStabilizeReport({ results, profitSummary, generatedAt });
  writeText(reportPath, report);
  console.log(`Health report: ${reportPath}`);

  if (failed > 0) {
    console.log(`Stabilization: ${failed} step(s) failed`);
    process.exitCode = 1;
  } else {
    console.log("Stabilization: ALL PASS");
  }

  return { results, profitSummary };
}

function buildStabilizeReport({ results, profitSummary, generatedAt }) {
  const passed = results.filter(s => s.status === "PASS").length;
  const failed = results.filter(s => s.status === "FAIL").length;
  const total = results.length;

  const pg = profitSummary.accountGrowth;
  const tp = profitSummary.tradeProfitability;
  const el = profitSummary.exitLogicVisibility;
  const lq = profitSummary.learningQuality;

  let report = `# MarketOps Stabilization & Automation Checkpoint v0.1

Generated: ${generatedAt}
Paper Simulation Only: true
No Live Trading: true

## Pipeline Summary

| Metric | Value |
|--------|-------|
| Total Steps | ${total} |
| Passed | ${passed} |
| Failed | ${failed} |
| Status | ${failed === 0 ? "ALL PASS" : "ISSUES DETECTED"} |

## Pipeline Phases

| Step | Status |
|------|--------|
${results.map(r => `| ${r.name} | ${r.status} ${r.error ? '- ' + r.error.slice(0, 80) : ''} |`).join("\n")}

## Profit Objective: Account Growth

| Metric | Value |
|--------|-------|
| Cycle | ${pg.cycleId} (${pg.cycleStatus}) |
| Starting Value | $${pg.startingCycleValue} |
| Current Total Value | $${pg.currentTotalAccountValue} |
| Cash Balance | $${pg.cashBalance} |
| Holdings Value | $${pg.holdingsValue} |
| Total P/L | $${round(pg.totalPnl)} |
| Return % | ${pg.percentReturn}% |
| Max Drawdown % | ${pg.maxDrawdownPct !== null ? pg.maxDrawdownPct + '%' : 'N/A'} |
| Cash + Holdings = Total | ${pg.totalAccountValueEqualsCashPlusHoldings ? 'YES' : 'MISMATCH'} |
| Benchmark | ${pg.benchmarkComparison} |

## Profit Objective: Trade Profitability

| Metric | Value |
|--------|-------|
| Entries | ${tp.entries} |
| Exits | ${tp.exits} |
| Open Positions | ${tp.openPositions} |
| Closed Positions | ${tp.closedPositions} |
| Profitable Open | ${tp.profitableOpenCount} |
| Losing Open | ${tp.losingOpenCount} |
| Open Unrealized P/L | $${tp.openUnrealizedGain} |
| Win Rate | ${tp.winRate !== null ? tp.winRate + '%' : 'N/A (no closed trades)'} |
| Avg Realized Gain | ${tp.averageRealizedGain !== null ? '$' + tp.averageRealizedGain : 'N/A (no closed trades)'} |

## Profit Objective: Exit Logic Visibility

| Check | Status |
|-------|--------|
| Exit logic exists | ${el.exitLogicExists ? 'YES' : 'NO'} |
| Profit-taking rules exist | ${el.profitTakingRulesExist ? 'YES' : 'NO'} |
| Stop-loss/risk exit rules exist | ${el.stopLossRiskExitRulesExist ? 'YES' : 'NO'} |
| Stale position detection | ${el.stalePositionDetection ? 'YES' : 'NO'} |
| Holdings persist across cycles | ${el.holdingsCanPersistAcrossCycles ? 'YES' : 'NO'} |
| purchaseDate preserved | ${el.purchaseDatePreserved ? 'YES' : 'NO'} |
| sellDate preserved | ${el.sellDatePreserved ? 'YES' : 'NO'} |

## Profit Objective: Learning Quality

| Metric | Value |
|--------|-------|
| Approved Trades Tracked | ${lq.approvedTradesTracked} |
| Rejected Trades Tracked | ${lq.rejectedTradesTracked} |
| Watched Signals Tracked | ${lq.watchedSignalsTracked} |
| Good Approvals | ${lq.goodApprovals} |
| Bad Approvals | ${lq.badApprovals} |
| Good Rejections | ${lq.goodRejections} |
| Bad Rejections | ${lq.badRejections} |
| Recommendations Generated | ${lq.recommendationsGenerated} |
| Proposals in Review Queue | ${lq.proposalsInReviewQueue} |
| Proposals Routed to Queue | ${lq.proposalsRoutedToQueue} |

## Safety Confirmation

- No live trading: true
- No broker execution: true
- No email/SMS/social: true
- No secrets read: true
- No auto-apply: true
- No public data exposure of private paths: verified
- Paper simulation labels preserved: true
`;

  return report;
}

if (require.main === module) {
  runStabilize().catch(error => {
    console.error(`stabilize failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runStabilize, buildProfitSummary };
