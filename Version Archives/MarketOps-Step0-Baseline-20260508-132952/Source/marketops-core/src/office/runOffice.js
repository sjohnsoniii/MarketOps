const { runPaperFull } = require("../paper/full");
const { generateOfficeContent } = require("./generateContent");
const { buildContentQueue } = require("./buildQueue");
const { runOfficeQa } = require("./runOfficeQa");
const { paths } = require("../utils/paths");

async function runOffice() {
  console.log("MarketOps Autonomous Office v0.1 starting");
  await runPaperFull();
  const contentSummary = generateOfficeContent();
  const queueSummary = buildContentQueue();
  const qaResult = runOfficeQa();

  if (qaResult.status !== "passed") {
    throw new Error("office:qa failed");
  }

  console.log("MarketOps Autonomous Office v0.1 complete");
  console.log(`content generated: ${contentSummary.contentGenerated}`);
  console.log(`queue items: ${queueSummary.queue.items.length}`);
  console.log(`queue path: ${paths.contentQueueJson}`);
  console.log(`compliance report path: ${paths.contentComplianceReport}`);
  console.log("publish allowed: false");
}

if (require.main === module) {
  runOffice().catch((error) => {
    console.error(`office:run failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runOffice };
