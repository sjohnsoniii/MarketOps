const { runOffice } = require("../office/runOffice");
const { runAgentReviews } = require("./runAgentReviews");
const { runAgentsQa } = require("./runAgentsQa");

async function runOfficeWithAgents() {
  await runOffice();
  const reviewResult = runAgentReviews();
  const qaResult = runAgentsQa();
  if (!qaResult.passed) {
    throw new Error("agents:qa failed");
  }
  console.log("MarketOps office run completed with agent reviews.");
  console.log(`agent reviews: ${reviewResult.reviews.length}`);
  console.log(`agent proposals: ${reviewResult.proposals.length}`);
}

if (require.main === module) {
  runOfficeWithAgents().catch((error) => {
    console.error(`office:run with agents failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runOfficeWithAgents };
