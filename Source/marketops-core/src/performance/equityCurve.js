const { loadConfig } = require("../config/configLoader");
const { buildEquityCurve } = require("./equityBuilder");
const { equityReport } = require("../reports/markdownReports");
const { loadJson, writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

function runEquity() {
  const config = loadConfig();
  const paperResults = loadJson(paths.tradesJson);
  const targetBalance = config.paperAccount.targetBalance || config.paperAccount.coreTargetBalance || 13000;
  const generatedAt = paperResults.generatedAt || new Date().toISOString();
  const equityCurve = buildEquityCurve({
    paperResults,
    targetBalance,
    generatedAt
  });

  writeJson(paths.equityJson, equityCurve);
  writeText(paths.equityReport, equityReport(equityCurve));
  return equityCurve;
}

if (require.main === module) {
  const curve = runEquity();
  console.log("");
  console.log("MarketOps equity curve complete.");
  console.log(`mode: ${curve.mode}`);
  console.log(`ending equity: $${curve.endingEquity.toFixed(2)}`);
  console.log(`paper P/L: $${curve.totalPnl.toFixed(2)}`);
  console.log(`report path: ${paths.equityReport}`);
  console.log("");
}

module.exports = { runEquity };
