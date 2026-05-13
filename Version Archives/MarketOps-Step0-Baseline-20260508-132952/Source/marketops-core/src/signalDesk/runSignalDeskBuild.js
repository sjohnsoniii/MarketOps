const fs = require("fs");
const path = require("path");
const {
  allowedClassifications,
  syntheticSignalSchema,
  buildSyntheticSignalPreviews,
  buildReviewWorkflow
} = require("./signalDeskSchema");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const outputRoot = path.join(projectRoot, "Data", "signal-previews");
const legacyOutputRoot = path.join(projectRoot, "Data", "signals");
const reportRoot = path.join(projectRoot, "Reports", "Signals");
const schemaPath = path.join(outputRoot, "signal-desk-schema-v0.1.json");
const previewsPath = path.join(outputRoot, "synthetic-signal-previews-v0.1.json");
const workflowPath = path.join(outputRoot, "signal-desk-review-workflow-v0.1.json");
const summaryPath = path.join(outputRoot, "latest-signal-desk-summary.json");
const legacySchemaPath = path.join(legacyOutputRoot, "signal-desk-schema-v0.1.json");
const legacyPreviewsPath = path.join(legacyOutputRoot, "synthetic-signal-previews-v0.1.json");
const legacyWorkflowPath = path.join(legacyOutputRoot, "signal-desk-review-workflow-v0.1.json");
const legacySummaryPath = path.join(legacyOutputRoot, "latest-signal-desk-summary.json");
const reportPath = path.join(reportRoot, "marketops-signal-desk-architecture-v0.1.md");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function countBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item) || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function buildReport({ generatedAt, previews, workflow }) {
  const rows = previews.map((preview) => `| ${preview.classification} | ${preview.title} | ${preview.vehicle} | ${preview.riskLabel} | ${preview.reviewStatus} | ${preview.publishAllowed} |`).join("\n");
  return `# MarketOps Signal Desk Architecture v0.1

Generated: ${generatedAt}

## Purpose

The Signal Desk is a local-only architecture layer for future research commentary. It defines how MarketOps may later structure research summaries, market observations, risk alerts, regime notes, synthetic signal previews, and public-safe watchlist commentary.

It does not create trade execution, subscriber systems, real-time alerts, financial advice, or social posting.

## Required Labels

- Mode: paper simulation
- Use: research/educational only
- Financial advice: no
- Guarantee: no
- Order execution: no
- Publishing: manual review required

## Classifications

${allowedClassifications.map((item) => `- ${item}`).join("\n")}

## Synthetic Preview Items

| Classification | Title | Vehicle | Risk Label | Review Status | Publish Allowed |
|---|---|---|---|---|---:|
${rows}

## Review-Gated Workflow

${workflow.workflow.map((step) => `${step.step}. ${step.name}: ${step.output}. Publish allowed: ${step.publishAllowed}.`).join("\n")}

## Compliance Guardrails

${workflow.guardrails.map((item) => `- ${item}`).join("\n")}

## What This Enables Later

- Safer research-note formatting.
- Public-safe watchlist commentary structure.
- Compliance labels before anything becomes public.
- Dashboard-ready summaries for future pages.

## What This Does Not Enable

- Order execution.
- Broker or account connection.
- Real-time public alerting.
- Social auto-posting.
- Subscriber delivery.
- Any instruction to enter or exit a position.
`;
}

function runSignalDeskBuild() {
  const generatedAt = new Date().toISOString();
  const previews = buildSyntheticSignalPreviews(generatedAt);
  const workflow = buildReviewWorkflow(generatedAt);
  const summary = {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    researchEducationalOnly: true,
    notFinancialAdvice: true,
    noGuarantee: true,
    notLiveMarketData: true,
    noLiveExecution: true,
    externalSendEnabled: false,
    alertSendingEnabled: false,
    subscriberExecutionEnabled: false,
    noBrokerConnection: true,
    noSocialAutoPosting: true,
    reviewGated: true,
    publishAllowed: false,
    classificationsSupported: allowedClassifications,
    previewCount: previews.length,
    classificationCounts: countBy(previews, (preview) => preview.classification),
    workflowSteps: workflow.workflow.length,
    nextHumanAction: "Review architecture and synthetic previews before any future public-facing signal commentary is drafted."
  };

  writeJson(schemaPath, syntheticSignalSchema);
  const previewsBundle = {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    researchEducationalOnly: true,
    notFinancialAdvice: true,
    noGuarantee: true,
    notLiveMarketData: true,
    noLiveExecution: true,
    externalSendEnabled: false,
    alertSendingEnabled: false,
    subscriberExecutionEnabled: false,
    reviewGated: true,
    publishAllowed: false,
    previews
  };
  writeJson(previewsPath, previewsBundle);
  writeJson(workflowPath, workflow);
  writeJson(summaryPath, summary);
  writeJson(legacySchemaPath, syntheticSignalSchema);
  writeJson(legacyPreviewsPath, previewsBundle);
  writeJson(legacyWorkflowPath, workflow);
  writeJson(legacySummaryPath, summary);
  writeText(reportPath, buildReport({ generatedAt, previews, workflow }));

  console.log("MarketOps Signal Desk architecture v0.1 complete");
  console.log(`classifications: ${allowedClassifications.length}`);
  console.log(`synthetic previews: ${previews.length}`);
  console.log(`schema: ${schemaPath}`);
  console.log(`previews: ${previewsPath}`);
  console.log(`workflow: ${workflowPath}`);
  console.log(`summary: ${summaryPath}`);
  console.log(`report: ${reportPath}`);

  return { summary, schemaPath, previewsPath, workflowPath, summaryPath, reportPath };
}

if (require.main === module) {
  try {
    runSignalDeskBuild();
  } catch (error) {
    console.error(`signal-desk:build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  runSignalDeskBuild,
  outputRoot,
  legacyOutputRoot,
  reportRoot,
  schemaPath,
  previewsPath,
  workflowPath,
  summaryPath,
  reportPath
};
