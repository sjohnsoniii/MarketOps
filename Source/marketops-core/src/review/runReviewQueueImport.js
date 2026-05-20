const path = require("path");
const { fileExists, loadJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const {
  loadQueue, saveQueue,
  loadEvents, saveEvents,
  importProposals
} = require("./reviewQueue");

function runReviewQueueImport() {
  const reviewDir = path.join(paths.dataRoot, "review");
  const queuePath = path.join(reviewDir, "review-queue-v0.1.json");
  const eventsPath = path.join(reviewDir, "review-events-v0.1.json");

  const paperRoot = path.join(paths.dataRoot, "paper");
  const riskLearningPath = path.join(paperRoot, "risk", "risk-desk-learning-v0.1.json");
  const riskReportPath = path.join(paths.projectRoot, "Reports", "Risk", "marketops-risk-desk-learning-v0.1.md");

  if (!fileExists(riskLearningPath)) {
    console.log("Risk Desk learning data not found. Run risk:learning first.");
    console.log(`expected: ${riskLearningPath}`);
    return { imported: 0, skipped: 0, errors: ["Risk learning data not found"] };
  }

  const riskData = loadJson(riskLearningPath);
  const queue = loadQueue(queuePath);
  const events = loadEvents(eventsPath);

  const proposalsToImport = [];

  if (riskData.proposals && Array.isArray(riskData.proposals)) {
    for (const prop of riskData.proposals) {
      proposalsToImport.push(prop);
    }
  }

  if (riskData.recommendations && Array.isArray(riskData.recommendations)) {
    for (const rec of riskData.recommendations) {
      proposalsToImport.push({
        proposalId: rec.recommendationId,
        entityId: "risk-desk",
        entityName: rec.entity || "Risk Desk",
        entityType: "risk",
        projectId: "marketops",
        proposalType: "threshold_adjustment",
        title: rec.title,
        summary: rec.summary,
        currentBehavior: "See evidence for current behavior.",
        proposedChange: rec.recommendedAction || "Review and adjust.",
        evidence: rec.evidence,
        expectedBenefit: rec.expectedBenefit,
        riskLevel: rec.riskLevel || "low",
        safetyImpact: "none",
        affectedFilesOrConfig: "src/risk/riskDesk.js, src/risk/riskDeskLearningBuilder.js",
        recommendedAction: rec.recommendedAction || "",
        status: "pending_future_review_queue",
        createdAt: riskData.generatedAt || new Date().toISOString(),
        autoApply: false
      });
    }
  }

  const sourcePaths = {
    dataPath: riskLearningPath,
    reportPath: riskReportPath
  };

  const results = importProposals(queue, events, proposalsToImport, sourcePaths);

  saveQueue(queue, queuePath);
  saveEvents(events, eventsPath);

  console.log("MarketOps Review Queue Import Complete");
  console.log(`queue: ${queuePath}`);
  console.log(`events: ${eventsPath}`);
  console.log(`imported: ${results.imported}`);
  console.log(`skipped (duplicates): ${results.skipped}`);
  if (results.errors.length > 0) {
    console.log(`errors: ${results.errors.length}`);
    for (const err of results.errors) {
      console.log(`  ${err.proposalId}: ${err.errors.join(", ")}`);
    }
  }

  return results;
}

if (require.main === module) {
  try {
    runReviewQueueImport();
  } catch (error) {
    console.error(`review:import failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runReviewQueueImport };
