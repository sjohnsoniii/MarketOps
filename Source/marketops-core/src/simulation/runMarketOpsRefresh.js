const { runIntradaySimulation } = require("./runIntradaySimulation");
const { runCycleBuild, runCycleQa } = require("../cycles/paperCycle");
const { runTradeRejectionExplainability } = require("../risk/runTradeRejectionExplainability");
const { runDashboardBuild } = require("../dashboard/runDashboardBuild");
const { runDashboardQa } = require("../dashboard/runDashboardQa");
const { runDashboardRefresh } = require("../dashboard/runDashboardRefresh");
const { runMarketDataQa } = require("../marketdata/runMarketDataQa");
const { runAutomationCheck } = require("../automation/runAutomationCheck");
const { runSchedulerCheck } = require("../automation/runSchedulerCheck");
const { refreshAlpacaMarketData } = require("../marketdata/alpacaMarketDataAdapter");

const STEPS = [
  { name: "marketdata:backfill", description: "Backfill past 7 days of market data" },
  { name: "marketdata:rolling", description: "Merge bars into rolling history" },
  { name: "marketdata:weather", description: "Build market weather station report" },
  { name: "intraday:simulate", description: "Run intraday paper simulation (signals, risk, trades, positions, P&L)" },
  { name: "confidence:calibrate", description: "Calibrate confidence from rolling data" },
  { name: "risk:explain", description: "Trade rejection explainability report" },
  { name: "cycle:build", description: "Update paper cycle state" },
  { name: "approvals:generate", description: "Generate approval waterfall" },
  { name: "marketdata:qa", description: "Market data QA" },
  { name: "cycle:qa", description: "Cycle QA" },
  { name: "dashboard:build", description: "Build dashboard bundle" },
  { name: "dashboard:refresh", description: "Refresh dashboard outputs" },
  { name: "automation:check", description: "Automation readiness check" }
];

async function runStep(name, description, fn) {
  const start = Date.now();
  try {
    const result = await fn();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const isHonestFailure = result && typeof result === "object" && result.status === "FAIL";
    if (isHonestFailure) {
      const msg = result.errorMessage || result.failureReason || "step returned FAIL status";
      console.log(`[FAIL] ${name}: ${description} - ${msg} (${elapsed}s)`);
      return { name, status: "FAIL", error: msg, elapsed };
    }
    console.log(`[PASS] ${name}: ${description} (${elapsed}s)`);
    return { name, status: "PASS", elapsed, result };
  } catch (error) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const msg = String(error.message || error).replace(/APCA[-_A-Z0-9]*=([^&\s]+)/gi, "APCA_REDACTED");
    console.log(`[FAIL] ${name}: ${description} - ${msg} (${elapsed}s)`);
    return { name, status: "FAIL", error: msg, elapsed };
  }
}

async function runMarketOpsRefresh() {
  const generatedAt = new Date().toISOString();
  const stepResults = [];

  console.log("=".repeat(60));
  console.log("MarketOps Super-Mega-Cruise: MarketOps Refresh v0.1");
  console.log(`Started: ${generatedAt}`);
  console.log("=".repeat(60));
  console.log("");

  stepResults.push(await runStep("marketdata:refresh", "Fetch latest Alpaca market data", () => refreshAlpacaMarketData({ generatedAt })));

  stepResults.push(await runStep("marketdata:backfill", "Backfill past 7 days", () => {
    const { backfillMarketData } = require("../marketdata/backfillMarketData");
    return backfillMarketData({ generatedAt });
  }));

  stepResults.push(await runStep("marketdata:rolling", "Rolling history merge", () => {
    const { updateRollingHistory } = require("../marketdata/rollingHistoryStore");
    return updateRollingHistory();
  }));

  stepResults.push(await runStep("marketdata:weather", "Market weather station", () => {
    const { buildWeatherStation } = require("../marketdata/marketWeatherStation");
    return buildWeatherStation();
  }));

  stepResults.push(await runStep("intraday:simulate", "Intraday simulation", () => runIntradaySimulation()));

  stepResults.push(await runStep("confidence:calibrate", "Confidence calibration", () => {
    const { calibrateAllSymbols } = require("../signals/confidenceCalibration");
    return calibrateAllSymbols();
  }));

  stepResults.push(await runStep("risk:explain", "Risk explainability", () => runTradeRejectionExplainability()));

  stepResults.push(await runStep("cycle:build", "Cycle build", () => runCycleBuild()));

  stepResults.push(await runStep("marketdata:qa", "Market data QA", () => runMarketDataQa()));

  stepResults.push(await runStep("cycle:qa", "Cycle QA", () => runCycleQa()));

  stepResults.push(await runStep("dashboard:build", "Dashboard build", () => runDashboardBuild()));

  stepResults.push(await runStep("dashboard:refresh", "Dashboard refresh", () => runDashboardRefresh()));

  stepResults.push(await runStep("automation:check", "Automation check", () => runAutomationCheck()));

  stepResults.push(await runStep("scheduler:check", "Scheduler check", () => runSchedulerCheck()));

  const passed = stepResults.filter((s) => s.status === "PASS").length;
  const failed = stepResults.filter((s) => s.status === "FAIL").length;
  const total = stepResults.length;

  console.log("");
  console.log("=".repeat(60));
  console.log("MarketOps Refresh Summary");
  console.log("=".repeat(60));
  console.log(`Total steps: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("");

  for (const step of stepResults) {
    const icon = step.status === "PASS" ? "OK" : "XX";
    console.log(`  [${icon}] ${step.name} (${step.elapsed}s)`);
    if (step.status === "FAIL" && step.error) {
      console.log(`       error: ${step.error}`);
    }
  }

  console.log("");
  if (failed === 0) {
    console.log("MarketOps refresh: ALL PASS");
  } else {
    console.log(`MarketOps refresh: ${failed} step(s) failed`);
  }
  console.log("");

  return { generatedAt, stepResults, passed, failed };
}

async function runCli() {
  try {
    await runMarketOpsRefresh();
  } catch (error) {
    console.error("MarketOps refresh failed unexpectedly.");
    console.error(String(error.message || error).replace(/APCA[-_A-Z0-9]*=([^&\s]+)/gi, "APCA_REDACTED"));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { runMarketOpsRefresh };
