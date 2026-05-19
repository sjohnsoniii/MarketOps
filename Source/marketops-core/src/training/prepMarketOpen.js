const path = require("path");
const { fileExists, loadJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

function loadOptional(filePath) {
  try {
    return fileExists(filePath) ? loadJson(filePath) : null;
  } catch {
    return null;
  }
}

function safeNum(v, fallback) {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

function prepMarketOpen() {
  const now = new Date().toISOString();

  const dashRoot = path.join(paths.dataRoot, "dashboard");
  const publicRoot = path.join(paths.dataRoot, "public");

  const cycle = loadOptional(paths.cycleLatestJson) || {};
  const refresh = loadOptional(path.join(dashRoot, "dashboard-refresh-latest-v0.1.json")) || {};
  const health = loadOptional(path.join(dashRoot, "dashboard-refresh-health-v0.1.json")) || {};
  const trial = loadOptional(path.join(publicRoot, "marketops-public-trial-status-v0.1.json")) || {};
  const positions = loadOptional(paths.paperPositionsJson) || {};
  const equity = loadOptional(paths.equityJson) || {};
  const trades = loadOptional(paths.tradesJson) || {};
  const config = loadOptional(paths.config) || {};

  const cycleId = cycle.cycleId || "not_initialized";
  const paperBalance = safeNum(cycle.currentBalance, safeNum(trial.paperBalance, 1000));
  const startingBalance = safeNum(cycle.startingBalance, 1000);
  const openPositions = Array.isArray(positions.openPositions) ? positions.openPositions.length : 0;
  const fakeTrades = trades.executedTrades || 0;
  const refreshStatus = refresh.status || "UNKNOWN";
  const healthLastStatus = health.lastStatus || "UNKNOWN";
  const schedulerCadence = trial.schedulerCadence || "Mon-Fri 10:00, 12:00, 14:00, 15:50 ET";
  const schedulerInstalled = health.schedulerInstalled === true;
  const paperOnly = config.paperOnly !== false;
  const liveTrading = config.liveTradingEnabled === true;
  const brokerExecution = config.brokerExecutionEnabled === true;
  const marginEnabled = config.marginEnabled === true;
  const optionsEnabled = config.optionsEnabled === true;
  const futuresEnabled = config.futuresEnabled === true;
  const shortingEnabled = config.shortingEnabled === true;
  const depletionRisk = cycle.depletionRisk || "normal";
  const marketDataStatus = refresh.marketData?.barsLoaded > 0 ? "data_available" : "off_hours";
  const marketDataSource = refresh.marketData?.source || "unknown";

  const allSafe = !liveTrading && !brokerExecution && !marginEnabled && !optionsEnabled && !futuresEnabled && !shortingEnabled;
  const balanceHealthy = paperBalance > 0 && depletionRisk !== "critical";
  const cycleActive = cycle.status === "active" || cycle.status === "ready";

  const ready = allSafe && balanceHealthy && cycleActive;

  console.log("");
  console.log("=".repeat(60));
  console.log("MarketOps Market-Open Training Prep Report");
  console.log("=".repeat(60));
  console.log(`Generated: ${now}`);
  console.log("");

  console.log("--- Account ---");
  console.log(`  Active cycle ID:     ${cycleId}`);
  console.log(`  Starting balance:    $${startingBalance.toFixed(2)}`);
  console.log(`  Current balance:     $${paperBalance.toFixed(2)}`);
  console.log(`  Open positions:      ${openPositions}`);
  console.log(`  Fake trades:         ${fakeTrades}`);
  console.log(`  Depletion risk:      ${depletionRisk}`);
  console.log("");

  console.log("--- Safety Guardrails ---");
  console.log(`  Paper-only mode:     ${paperOnly ? "YES" : "NO — UNSAFE"}`);
  console.log(`  Live trading:        ${liveTrading ? "ENABLED — UNSAFE" : "disabled"}`);
  console.log(`  Broker execution:    ${brokerExecution ? "ENABLED — UNSAFE" : "disabled"}`);
  console.log(`  Margin:              ${marginEnabled ? "ENABLED — UNSAFE" : "disabled"}`);
  console.log(`  Options:             ${optionsEnabled ? "ENABLED — UNSAFE" : "disabled"}`);
  console.log(`  Futures:             ${futuresEnabled ? "ENABLED — UNSAFE" : "disabled"}`);
  console.log(`  Shorting:            ${shortingEnabled ? "ENABLED — UNSAFE" : "disabled"}`);
  console.log(`  All safe:            ${allSafe ? "YES" : "NO — REVIEW REQUIRED"}`);
  console.log("");

  console.log("--- Market Data ---");
  console.log(`  Status:              ${marketDataStatus}`);
  console.log(`  Source:              ${marketDataSource}`);
  console.log("");

  console.log("--- Scheduler ---");
  console.log(`  Cadence:             ${schedulerCadence}`);
  console.log(`  Last refresh status: ${refreshStatus}`);
  console.log(`  Health status:       ${healthLastStatus}`);
  console.log("");

  console.log("--- Readiness ---");
  console.log(`  Balance healthy:     ${balanceHealthy ? "YES" : "NO"}`);
  console.log(`  Cycle active:        ${cycleActive ? "YES" : "NO"}`);
  console.log(`  Safety guards:       ${allSafe ? "YES" : "NO"}`);
  console.log(`  Scenario ready:      ${ready ? "YES" : "NO — review issues above"}`);
  console.log("");

  if (ready) {
    console.log("MarketOps paper training scenario is ready for market open.");
    console.log(`Account: $${paperBalance.toFixed(2)} paper balance. No live execution. Sandbox only.`);
  } else {
    console.log("MarketOps paper training scenario is NOT ready.");
    if (!allSafe) console.log("  Reason: Safety guardrails are not fully enabled.");
    if (!balanceHealthy) console.log("  Reason: Paper balance is depleted or at critical risk.");
    if (!cycleActive) console.log("  Reason: Paper cycle is not active.");
  }
  console.log("");

  return {
    generatedAt: now,
    cycleId,
    paperBalance,
    startingBalance,
    openPositions,
    fakeTrades,
    paperOnly,
    allSafe,
    depletionRisk,
    marketDataStatus,
    marketDataSource,
    refreshStatus,
    healthLastStatus,
    schedulerCadence,
    ready
  };
}

async function runCli() {
  try {
    const result = prepMarketOpen();
    process.exitCode = result.ready ? 0 : 1;
  } catch (error) {
    console.error("Failed to check training readiness:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { prepMarketOpen };
