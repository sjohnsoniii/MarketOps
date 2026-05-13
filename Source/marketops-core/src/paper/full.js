const { runQa } = require("../qa/runQa");
const { runPaperPipeline } = require("./runPaper");
const { appendRunHistory } = require("./writeHistory");
const { refreshSiteDashboard } = require("../site/refreshSiteDashboard");

async function runPaperFull() {
  await runPaperPipeline();
  const summary = appendRunHistory({ qaStatus: "PASS" });
  refreshSiteDashboard();
  const qa = runQa({ requireAutomationOutputs: true });

  if (!qa.passed) {
    throw new Error("MarketOps paper:full final QA failed.");
  }

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
