const { runQa } = require("../qa/runQa");
const { runEquity } = require("../performance/equityCurve");
const { printSimulationSummary, runSimulation } = require("../simulation/runSimulation");

function runPaperPipeline() {
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
  try {
    runPaperPipeline();
  } catch (error) {
    console.error("MarketOps paper:run failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { runPaperPipeline };
