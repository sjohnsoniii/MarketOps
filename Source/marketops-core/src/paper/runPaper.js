const { runQa } = require("../qa/runQa");
const { runEquity } = require("../performance/equityCurve");
const { printSimulationSummary, runSimulation } = require("../simulation/runSimulation");
const { refreshAlpacaMarketData } = require("../marketdata/alpacaMarketDataAdapter");
const { parseLocalEnv } = require("../marketdata/localEnv");
const { paths } = require("../utils/paths");

const LEGACY_KEY_NAME = ["ALPACA", "API", "KEY"].join("_");
const LEGACY_SECRET_NAME = ["ALPACA", "SECRET", "KEY"].join("_");

async function refreshMarketDataWhenConfigured() {
  const localEnv = {
    ...parseLocalEnv(paths.localEnv),
    ...parseLocalEnv(paths.coreLocalEnv)
  };
  const hasKey = Boolean(localEnv.APCA_API_KEY_ID || localEnv[LEGACY_KEY_NAME]);
  const hasSecret = Boolean(localEnv.APCA_API_SECRET_KEY || localEnv[LEGACY_SECRET_NAME]);
  if (!hasKey || !hasSecret) {
    console.log("Alpaca market data refresh skipped: local .env.local credentials not configured.");
    return null;
  }

  const result = await refreshAlpacaMarketData();
  console.log(`Alpaca market data refreshed for paper simulation: ${result.bundle.bars.length} bars, ${result.bundle.quotes.length} quotes.`);
  return result;
}

async function runPaperPipeline() {
  await refreshMarketDataWhenConfigured();
  const simulation = runSimulation({ writeOutputs: true });
  printSimulationSummary(simulation);
  const equityCurve = runEquity();
  const qa = runQa({ requireAutomationOutputs: false });

  if (!qa.passed) {
    throw new Error("MarketOps paper pipeline QA failed.");
  }

  console.log("MarketOps paper:run complete.");
  console.log(`mode: ${simulation.config.mode}`);
  console.log(`ending paper equity: $${equityCurve.endingEquity.toFixed(2)}`);
  console.log(`QA checks passed: ${qa.checks.filter((check) => check.passed).length}`);
  console.log("");

  return { simulation, equityCurve, qa };
}

if (require.main === module) {
  runPaperPipeline().catch((error) => {
    console.error("MarketOps paper:run failed.");
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { runPaperPipeline };
