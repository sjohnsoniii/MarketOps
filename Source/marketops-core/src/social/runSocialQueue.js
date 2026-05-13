const { runSocialPreview } = require("./runSocialPreview");
const { writeApprovalOutputs } = require("../approvals/approvalUtils");

function runSocialQueue() {
  const previewResult = runSocialPreview();
  const approvalResult = writeApprovalOutputs();
  console.log("MarketOps social approval routing updated");
  console.log(`social previews: ${previewResult.bundle.previews.length}`);
  console.log(`approval items: ${approvalResult.queue.items.length}`);
  console.log(`approval queue: ${approvalResult.timestampedPath}`);
  return { previewResult, approvalResult };
}

if (require.main === module) {
  try {
    runSocialQueue();
  } catch (error) {
    console.error(`social:queue failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runSocialQueue };
