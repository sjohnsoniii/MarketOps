const { writeCheckpointIndex } = require("./adminCheckpoint");

function runAdminCheckpointBuild() {
  const result = writeCheckpointIndex();
  console.log("MarketOps supercruise admin checkpoint generated");
  console.log(`index: ${result.indexPath}`);
  console.log(`console: ${result.consolePath}`);
  console.log(`content queue items: ${result.index.content.queueItems.length}`);
  console.log(`agent proposals: ${result.index.reviews.proposals.length}`);
  console.log("external effects: false");
  return result;
}

if (require.main === module) {
  try {
    runAdminCheckpointBuild();
  } catch (error) {
    console.error(`admin:checkpoint:build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runAdminCheckpointBuild };
