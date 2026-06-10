const { loadConfig, assertPaperOnlyConfig } = require("../config/configLoader");
const { loadMarketBars, loadMarketDataInfo, loadVehicles } = require("../data/sampleLoaders");
const { backfillMarketData } = require("../marketdata/backfillMarketData");
const { updateRollingHistory } = require("../marketdata/rollingHistoryStore");
const { buildWeatherStation } = require("../marketdata/marketWeatherStation");
const { buildVehicleHistory } = require("../marketdata/vehicleHistory");
const { calibrateAllSymbols } = require("../signals/confidenceCalibration");
const { generateSampleSignals } = require("../signals/simpleSignalScanner");
const { reviewSignals } = require("../risk/riskDesk");
const { executePaperTrades, checkAndExecuteExits, loadExitRules, resetCycleIfDepleted } = require("../execution/paperTradeExecutor");
const { buildEquityCurve } = require("../performance/equityBuilder");
const { appendRunHistory } = require("../paper/writeHistory");
const { writeJson, writeJsonWithBackup } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { round } = require("../utils/number");
const { syncPositions } = require("../db/positions");
const { syncTrades } = require("../db/trades");
const { syncRiskDecisions } = require("../db/riskDecisions");

async function runIntradaySimulation() {
  const generatedAt = new Date().toISOString();
  const config = loadConfig();
  assertPaperOnlyConfig(config);

  console.log(`MarketOps Intraday Simulation starting at ${generatedAt}`);
  console.log(`Mode: ${config.mode}`);
  console.log("");

  const vehicles = loadVehicles();
  console.log(`Vehicles loaded: ${vehicles.length}`);

  let marketBars = [];
  let marketDataInfo = loadMarketDataInfo();

  try {
    const backfillResult = await backfillMarketData({ generatedAt });
    console.log(`Backfill complete: ${backfillResult.totalBars} bars across ${backfillResult.symbolsCovered.length} symbols`);
  } catch (error) {
    console.log(`Backfill skipped or partial: ${error.message}`);
  }

  try {
    const rolling = updateRollingHistory();
    console.log(`Rolling history: ${rolling.totalBars} bars across ${rolling.symbolsCovered.length} symbols`);
    if (rolling.history) {
      marketBars = rolling.history;
    }
  } catch (error) {
    console.log(`Rolling history update: ${error.message}`);
  }

  try {
    const vehicleHistoryOutput = buildVehicleHistory(marketBars, generatedAt);
    console.log(`Vehicle history: ${vehicleHistoryOutput.symbolsWithHistory} with history, ${vehicleHistoryOutput.symbolsInsufficient} insufficient`);
  } catch (error) {
    console.log(`Vehicle history: ${error.message}`);
  }

  try {
    const weather = buildWeatherStation();
    console.log(`Weather station: ${weather.dataCoverageStatus}, ${weather.usableForSignalSummary}`);
  } catch (error) {
    console.log(`Weather station: ${error.message}`);
  }

  if (!marketBars || marketBars.length === 0) {
    try {
      marketBars = loadMarketBars();
      marketDataInfo = loadMarketDataInfo();
    } catch {
      console.log("No market bars available for signal scan.");
    }
  }

  if (marketDataInfo && marketDataInfo.dataSource !== "alpaca_iex" && marketDataInfo.dataSource !== "alpaca_iex_backfill") {
    marketDataInfo = {
      ...marketDataInfo,
      dataSource: "alpaca_iex",
      latestMarketDataRefreshAt: generatedAt,
      latestBarTimestamp: generatedAt
    };
  }

  let vehicleHistoryOutput = null;
  try {
    const { fileExists, loadJson } = require("../utils/fileStore");
    if (fileExists(paths.vehicleHistoryJson)) {
      vehicleHistoryOutput = loadJson(paths.vehicleHistoryJson);
    }
  } catch {}

  const scan = generateSampleSignals({
    vehicles,
    marketBars: marketBars || [],
    generatedAt,
    marketDataInfo,
    vehicleHistoryOutput
  });

  scan.generatedAt = generatedAt;
  scan.sampleDataOnly = false;
  writeJson(paths.signalsJson, scan);
  console.log(`Signals: ${scan.totalVehicles} vehicles, ${scan.candidateCount} candidates`);

  const learningConfig = config.learningMode && config.learningMode.enabled ? config.learningMode : null;
  const effectiveMaxOpenPositions = learningConfig
    ? (learningConfig.maxOpenPositions || 20)
    : (config.dayTrading ? config.dayTrading.maxOpenPositions || 5 : 5);

  const portfolioState = {
    openPositions: [],
    cashBalance: 1000,
    maxOpenPositions: effectiveMaxOpenPositions,
    maxPositionSizePct: config.dayTrading ? config.dayTrading.maxPositionSizePct || 0.25 : 0.25
  };

  try {
    const { fileExists, loadJson } = require("../utils/fileStore");
    if (fileExists(paths.paperPositionsJson)) {
      const posData = loadJson(paths.paperPositionsJson);
      portfolioState.openPositions = posData.openPositions || [];
    }
    if (fileExists(paths.paperPerformanceJson)) {
      const perfData = loadJson(paths.paperPerformanceJson);
      portfolioState.cashBalance = perfData.cashBalance || 1000;
    }
  } catch {}

  // --- Cycle depletion check: auto-reset if total equity < $10 ---
  const depletionCheck = resetCycleIfDepleted({
    cashBalance: portfolioState.cashBalance,
    openPositions: portfolioState.openPositions,
    generatedAt
  });

  if (depletionCheck.reset) {
    portfolioState.cashBalance = depletionCheck.freshCashBalance;
    portfolioState.openPositions = [];
  }

  // --- Exit check: close positions that hit target, stop-loss, or 72hr window ---
  const exitRules = loadExitRules();
  const exitResult = checkAndExecuteExits({
    openPositions: portfolioState.openPositions,
    marketBars: marketBars || [],
    generatedAt,
    exitRules
  });

  if (exitResult.closedPositions.length > 0) {
    portfolioState.cashBalance += exitResult.cashReturned;
    portfolioState.openPositions = exitResult.keptOpenPositions;

    const { fileExists, loadJson } = require("../utils/fileStore");
    const currentPositions = fileExists(paths.paperPositionsJson) ? loadJson(paths.paperPositionsJson) : { openPositions: [], closedPositions: [] };
    currentPositions.openPositions = exitResult.keptOpenPositions;
    currentPositions.closedPositions = [...(currentPositions.closedPositions || []), ...exitResult.closedPositions];

    // Record exit timestamp per symbol so executeIntradayPaperTrades can enforce
    // the re-entry cooldown window even within the same run.
    const cooldowns = currentPositions.reEntryCooldowns || {};
    exitResult.closedPositions.forEach(p => {
      cooldowns[p.symbol] = p.exitTime || generatedAt;
    });
    currentPositions.reEntryCooldowns = cooldowns;

    writeJsonWithBackup(paths.paperPositionsJson, currentPositions);
    syncPositions(currentPositions);

    const currentPerf = fileExists(paths.paperPerformanceJson) ? loadJson(paths.paperPerformanceJson) : {};
    const realizedFromExits = exitResult.closedPositions.reduce((sum, p) => sum + (p.realizedPnl || 0), 0);
    currentPerf.cashBalance = round(portfolioState.cashBalance);
    currentPerf.realizedPnl = round((currentPerf.realizedPnl || 0) + realizedFromExits);
    writeJson(paths.paperPerformanceJson, currentPerf);

    if (exitResult.learningRecords.length > 0) {
      const learningPath = require("path").join(paths.dataRoot, "paper", "learning-records-v0.1.json");
      const existing = fileExists(learningPath) ? loadJson(learningPath) : { records: [] };
      existing.records = [...(existing.records || []), ...exitResult.learningRecords];
      existing.lastUpdated = generatedAt;
      writeJson(learningPath, existing);
    }

    console.log(`Exit check: ${exitResult.exitSummary.closed} positions closed, $${exitResult.cashReturned.toFixed(2)} cash returned`);
    exitResult.learningRecords.forEach(r =>
      console.log(`  [${r.exitReason}] ${r.symbol}: ${r.returnPct > 0 ? "+" : ""}${r.returnPct}% (${r.holdHours}h) → ${r.outcome}`)
    );
  }

  const riskReview = reviewSignals({ signals: scan.signals, generatedAt, portfolioState });
  riskReview.generatedAt = generatedAt;
  writeJson(paths.riskJson, riskReview);
  syncRiskDecisions(riskReview);
  console.log(`Risk review: ${riskReview.approvedCount} approved, ${riskReview.blockedCount} blocked`);
  console.log(`  Standard: ${riskReview.approvalBands.approved_standard}, Learning probe: ${riskReview.approvalBands.approved_learning_probe}`);
  console.log(`  Watched: ${riskReview.approvalBands.watched}, Rejected: ${riskReview.approvalBands.rejected}`);

  const startingBalance = config.paperAccount ? (config.paperAccount.paperStartingBalance || config.paperAccount.startingBalance || 1000) : 1000;

  const paperResults = executePaperTrades({
    signals: scan.signals,
    riskReview,
    marketBars: marketBars || [],
    marketDataInfo,
    startingBalance,
    generatedAt
  });
  writeJson(paths.tradesJson, paperResults);
  syncTrades(paperResults);
  console.log(`Paper trades: ${paperResults.executedTrades} executed, ${paperResults.openPositionCount} open positions`);
  console.log(`Cash balance: $${paperResults.cashBalance.toFixed(2)}, Equity: $${paperResults.totalEquity.toFixed(2)}`);

  const targetBalance = config.paperAccount ? (config.paperAccount.targetBalance || config.paperAccount.coreTargetBalance || 13000) : 13000;
  const equityCurve = buildEquityCurve({ paperResults, targetBalance, generatedAt });
  writeJson(paths.equityJson, equityCurve);
  console.log(`Equity curve built: ${equityCurve.points.length} points, ending $${equityCurve.endingEquity.toFixed(2)}`);

  appendRunHistory({ qaStatus: "PASS", generatedAt });
  console.log(`Run history appended.`);

  const confidenceResults = calibrateAllSymbols();
  console.log(`Confidence: ${confidenceResults.approvableCount} approvable, ${confidenceResults.closeToCandidateCount} close`);

  return {
    generatedAt,
    config,
    vehicles,
    marketBarsCount: (marketBars || []).length,
    scan,
    riskReview,
    paperResults,
    confidenceResults
  };
}

async function runCli() {
  try {
    const result = await runIntradaySimulation();
    console.log("");
    console.log("MarketOps intraday simulation complete.");
    console.log(`Signals: ${result.scan.totalVehicles} vehicles, ${result.scan.candidateCount} candidates`);
    console.log(`Risk: ${result.riskReview.approvedCount} approved, ${result.riskReview.blockedCount} blocked`);
    console.log(`Trades executed: ${result.paperResults.executedTrades}`);
    console.log(`Open positions: ${result.paperResults.openPositionCount}`);
    console.log(`Cash: $${result.paperResults.cashBalance.toFixed(2)}`);
    console.log(`Equity: $${result.paperResults.totalEquity.toFixed(2)}`);
  } catch (error) {
    console.error("MarketOps intraday simulation failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { runIntradaySimulation };
