const { loadConfig } = require("../config/configLoader");
const { loadMarketBars, loadMarketDataInfo, loadVehicles } = require("../data/sampleLoaders");
const { buildDashboardBundle } = require("../dashboard/dashboardBundle");
const { executePaperTrades } = require("../execution/paperTradeExecutor");
const { buildEquityCurve } = require("../performance/equityBuilder");
const { buildPerformanceSummary } = require("../performance/performanceSummary");
const { equityReport, performanceReport, riskReport, signalReport, staffWriterBrief, tradesReport } = require("../reports/markdownReports");
const { reviewSignals } = require("../risk/riskDesk");
const { DEFAULT_GENERATED_AT, generateSampleSignals } = require("../signals/simpleSignalScanner");
const { writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

function runSimulation({ writeOutputs = true } = {}) {
  const generatedAt = DEFAULT_GENERATED_AT;
  const config = loadConfig();
  const vehicles = loadVehicles();
  const marketBars = loadMarketBars();
  const marketDataInfo = loadMarketDataInfo();
  if (marketDataInfo.paperOnly !== true || marketDataInfo.liveTradingEnabled === true || marketDataInfo.orderPlacementEnabled === true) {
    throw new Error("Unsafe market data state detected. MarketOps simulation must remain paper-only and data-only.");
  }
  const targetBalance = config.paperAccount.targetBalance || config.paperAccount.coreTargetBalance || 13000;

  const scan = generateSampleSignals({ vehicles, marketBars, generatedAt, marketDataInfo });
  const riskReview = reviewSignals({ signals: scan.signals, generatedAt });
  const paperResults = executePaperTrades({
    signals: scan.signals,
    riskReview,
    marketBars,
    marketDataInfo,
    startingBalance: config.paperAccount.startingBalance,
    generatedAt
  });
  const equityCurve = buildEquityCurve({ paperResults, targetBalance, generatedAt });
  const performanceSummary = buildPerformanceSummary({ scan, riskReview, paperResults, equityCurve, generatedAt });
  const dashboardBundle = buildDashboardBundle({
    config,
    vehicles,
    marketBars,
    marketDataInfo,
    scan,
    riskReview,
    paperResults,
    equityCurve,
    performanceSummary,
    generatedAt
  });

  const outputs = {
    config,
    vehicles,
    marketBars,
    marketDataInfo,
    scan,
    riskReview,
    paperResults,
    equityCurve,
    performanceSummary,
    dashboardBundle,
    reportPaths: {
      signalReport: paths.signalReport,
      riskReport: paths.riskReport,
      tradesReport: paths.tradesReport,
      equityReport: paths.equityReport,
      performanceReport: paths.performanceReport,
      staffWriterReport: paths.staffWriterReport
    }
  };

  if (writeOutputs) {
    writeJson(paths.signalsJson, scan);
    writeJson(paths.riskJson, riskReview);
    writeJson(paths.tradesJson, paperResults);
    writeJson(paths.equityJson, equityCurve);
    writeJson(paths.dashboardJson, dashboardBundle);
    writeText(paths.signalReport, signalReport(scan));
    writeText(paths.riskReport, riskReport(riskReview));
    writeText(paths.tradesReport, tradesReport(paperResults));
    writeText(paths.equityReport, equityReport(equityCurve));
    writeText(paths.performanceReport, performanceReport(performanceSummary));
    writeText(paths.staffWriterReport, staffWriterBrief({ scan, riskReview, paperResults, performanceSummary, generatedAt }));
  }

  return outputs;
}

function printSimulationSummary(result) {
  console.log("");
  console.log("MarketOps Core Phase 1 paper simulation complete.");
  console.log(`mode: ${result.config.mode}`);
  console.log(`vehicles loaded: ${result.vehicles.length}`);
  console.log(`market bars loaded: ${result.marketBars.length}`);
  console.log(`market data source: ${result.marketDataInfo.dataSource}`);
  console.log(`latest market data refresh: ${result.marketDataInfo.latestMarketDataRefreshAt || "sample fallback"}`);
  console.log(`signals generated: ${result.scan.candidateCount}`);
  console.log(`risk approved: ${result.riskReview.approvedCount}`);
  console.log(`risk blocked: ${result.riskReview.blockedCount}`);
  console.log(`fake paper trades: ${result.paperResults.executedTrades}`);
  console.log(`ending paper balance: $${result.paperResults.endingBalance.toFixed(2)}`);
  console.log(`paper P/L: $${result.paperResults.totalPnl.toFixed(2)}`);
  console.log("report paths:");
  Object.values(result.reportPaths).forEach((reportPath) => console.log(`- ${reportPath}`));
  console.log("");
}

if (require.main === module) {
  const result = runSimulation({ writeOutputs: true });
  printSimulationSummary(result);
}

module.exports = { printSimulationSummary, runSimulation };
