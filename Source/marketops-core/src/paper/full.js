const { runQa } = require("../qa/runQa");
const { runPaperPipeline } = require("./runPaper");
const { loadJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { refreshSiteDashboard } = require("../site/refreshSiteDashboard");

async function runPaperFull() {
  await runPaperPipeline();
  refreshSiteDashboard();
  const qa = runQa({ requireAutomationOutputs: true });

  if (!qa.passed) {
    throw new Error("MarketOps paper:full final QA failed.");
  }

  const summary = loadJson(paths.latestRunSummaryJson);
  console.log("MarketOps paper:full complete.");
  console.log(`runId: ${summary.runId}`);
  console.log(`ending paper equity: $${summary.endingEquity.toFixed(2)}`);
  console.log(`paper P/L: $${summary.paperPnl.toFixed(2)}`);
  console.log("final QA: PASS");
  console.log("");
  return { summary, qa };
}

if (require.main === module) {
  runPaperFull().catch((error) => {
    console.error("MarketOps paper:full failed.");
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { runPaperFull };
