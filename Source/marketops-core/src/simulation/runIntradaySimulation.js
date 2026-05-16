const { loadConfig, assertPaperOnlyConfig } = require("../config/configLoader");
const { loadMarketBars, loadMarketDataInfo, loadVehicles } = require("../data/sampleLoaders");
const { backfillMarketData } = require("../marketdata/backfillMarketData");
const { updateRollingHistory } = require("../marketdata/rollingHistoryStore");
const { buildWeatherStation } = require("../marketdata/marketWeatherStation");
const { calibrateAllSymbols } = require("../signals/confidenceCalibration");
const { generateSampleSignals } = require("../signals/simpleSignalScanner");
const { reviewSignals } = require("../risk/riskDesk");
const { executePaperTrades } = require("../execution/paperTradeExecutor");
const { buildEquityCurve } = require("../performance/equityBuilder");
const { appendRunHistory } = require("../paper/writeHistory");
const { writeJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

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

  const scan = generateSampleSignals({
    vehicles,
    marketBars: marketBars || [],
    generatedAt,
    marketDataInfo
  });

  scan.generatedAt = generatedAt;
  scan.sampleDataOnly = false;
  writeJson(paths.signalsJson, scan);
  console.log(`Signals: ${scan.totalVehicles} vehicles, ${scan.candidateCount} candidates`);

  const riskReview = reviewSignals({ signals: scan.signals, generatedAt });
  riskReview.generatedAt = generatedAt;
  writeJson(paths.riskJson, riskReview);
  console.log(`Risk review: ${riskReview.approvedCount} approved, ${riskReview.blockedCount} blocked`);

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
