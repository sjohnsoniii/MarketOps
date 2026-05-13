const { printSimulationSummary, runSimulation } = require("./simulation/runSimulation");

const result = runSimulation({ writeOutputs: true });
printSimulationSummary(result);
