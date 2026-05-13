const { runSignalDeskBuild } = require("../signalDesk/runSignalDeskBuild");
const { writeApprovalOutputs } = require("../approvals/approvalUtils");

function runSignalPreview() {
  const signalResult = runSignalDeskBuild();
  const approvalResult = writeApprovalOutputs();
  console.log("MarketOps signal previews routed for approval");
  console.log(`approval items: ${approvalResult.queue.items.length}`);
  console.log(`approval queue: ${approvalResult.timestampedPath}`);
  return { signalResult, approvalResult };
}

if (require.main === module) {
  try {
    runSignalPreview();
  } catch (error) {
    console.error(`signal:preview failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runSignalPreview };
