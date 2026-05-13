const { writeApprovalOutputs, paths } = require("./approvalUtils");

function runApprovalsGenerate() {
  const { queue, timestampedPath } = writeApprovalOutputs();
  console.log("MarketOps approval queue generated");
  console.log(`items: ${queue.items.length}`);
  console.log(`pending: ${queue.statusCounts.PENDING_REVIEW}`);
  console.log(`latest queue: ${paths.approvalLatest}`);
  console.log(`timestamped queue: ${timestampedPath}`);
  console.log(`review bundle: ${paths.reviewBundleLatest}`);
  console.log(`admin bundle js: ${paths.reviewBundleJs}`);
  console.log(`report: ${paths.approvalReport}`);
  return { queue, timestampedPath };
}

if (require.main === module) {
  try {
    runApprovalsGenerate();
  } catch (error) {
    console.error(`approvals:generate failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runApprovalsGenerate };
