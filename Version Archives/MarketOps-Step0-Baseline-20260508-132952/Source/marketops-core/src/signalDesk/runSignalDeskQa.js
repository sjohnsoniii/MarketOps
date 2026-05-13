const fs = require("fs");
const path = require("path");
const { allowedClassifications, requiredSafetyLabels } = require("./signalDeskSchema");
const {
  schemaPath,
  previewsPath,
  workflowPath,
  summaryPath,
  reportPath
} = require("./runSignalDeskBuild");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const qaReportPath = path.join(projectRoot, "Reports", "Signals", "signal-desk-qa-report-v0.1.md");
const requiredSourceFiles = [
  path.join(__dirname, "signalDeskSchema.js"),
  path.join(__dirname, "runSignalDeskBuild.js"),
  path.join(__dirname, "runSignalDeskQa.js")
];

function restrictedTerms() {
  return [
    ["C:", "\\Users"].join(""),
    ["trade", "Id"].join(""),
    ["signal", "Id"].join(""),
    ["riskDecision", "Id"].join(""),
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this"].join(""),
    ["copy this", "trade"].join(" "),
    ["copy my", "bot"].join(" "),
    ["guaran", "teed"].join(""),
    ["real", " money"].join(" "),
    ["subscriber", " execution"].join(" "),
    ["external send enabled", " true"].join(" "),
    ["externalSendEnabled", "\": true"].join(""),
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["liveTrading", ": true"].join(""),
    ["allowLiveTrading", "\": true"].join(""),
    ["broker connection", "enabled"].join(" "),
    ["social auto-posting", "enabled"].join(" "),
    ["subscriber delivery", "enabled"].join(" "),
    ["payment", "enabled"].join(" ")
  ];
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function scanOutputs(files) {
  const hits = [];
  files.forEach((filePath) => {
    const text = readText(filePath).toLowerCase();
    restrictedTerms().forEach((term) => {
      if (text.includes(term.toLowerCase())) hits.push(`${path.relative(projectRoot, filePath)} contains restricted term`);
    });
  });
  return hits;
}

function buildQaReport(checks) {
  const failed = checks.filter((item) => !item.passed);
  return `# MarketOps Signal Desk QA v0.1

Generated: ${new Date().toISOString()}

## Result

${failed.length ? "FAIL" : "PASS"}

## Checks

- Passed: ${checks.filter((item) => item.passed).length}
- Failed: ${failed.length}

## Failed Checks

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}

## Safety Confirmation

- Paper simulation only.
- Research/educational only.
- Not financial advice.
- No guarantee.
- No live execution.
- No broker/API/payment/social-posting behavior.
`;
}

function runSignalDeskQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "npm script signal:preview exists", Boolean(packageJson.scripts && packageJson.scripts["signal:preview"]), packageJson.scripts && packageJson.scripts["signal:preview"]);
  check(checks, "npm script signal:qa exists", Boolean(packageJson.scripts && packageJson.scripts["signal:qa"]), packageJson.scripts && packageJson.scripts["signal:qa"]);
  check(checks, "npm script signal-desk:build exists", Boolean(packageJson.scripts && packageJson.scripts["signal-desk:build"]), packageJson.scripts && packageJson.scripts["signal-desk:build"]);
  check(checks, "npm script signal-desk:qa exists", Boolean(packageJson.scripts && packageJson.scripts["signal-desk:qa"]), packageJson.scripts && packageJson.scripts["signal-desk:qa"]);
  requiredSourceFiles.forEach((filePath) => check(checks, `source exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  [schemaPath, previewsPath, workflowPath, summaryPath, reportPath].forEach((filePath) => check(checks, `output exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));

  let schema = null;
  let previews = null;
  let workflow = null;
  let summary = null;
  try {
    schema = readJson(schemaPath);
    previews = readJson(previewsPath);
    workflow = readJson(workflowPath);
    summary = readJson(summaryPath);
    check(checks, "signal outputs are valid JSON", true, "valid");
  } catch (error) {
    check(checks, "signal outputs are valid JSON", false, error.message);
  }

  if (schema && previews && workflow && summary) {
    check(checks, "summary mode paper_simulation", summary.mode === "paper_simulation", summary.mode);
    check(checks, "summary sampleData true", summary.sampleData === true, String(summary.sampleData));
    check(checks, "summary notFinancialAdvice true", summary.notFinancialAdvice === true, String(summary.notFinancialAdvice));
    check(checks, "summary noGuarantee true", summary.noGuarantee === true, String(summary.noGuarantee));
    check(checks, "summary noLiveExecution true", summary.noLiveExecution === true, String(summary.noLiveExecution));
    check(checks, "summary external send disabled", summary.externalSendEnabled === false, String(summary.externalSendEnabled));
    check(checks, "summary alert sending disabled", summary.alertSendingEnabled === false, String(summary.alertSendingEnabled));
    check(checks, "summary subscriber execution disabled", summary.subscriberExecutionEnabled === false, String(summary.subscriberExecutionEnabled));
    check(checks, "summary publishAllowed false", summary.publishAllowed === false, String(summary.publishAllowed));
    check(checks, "schema classifications complete", allowedClassifications.every((classification) => schema.allowedClassifications.includes(classification)), schema.allowedClassifications.join(", "));
    const previewItems = Array.isArray(previews.previews) ? previews.previews : [];
    check(checks, "synthetic previews exist", previewItems.length >= allowedClassifications.length, String(previewItems.length));
    allowedClassifications.forEach((classification) => {
      check(checks, `classification represented: ${classification}`, previewItems.some((item) => item.classification === classification), classification);
    });
    previewItems.forEach((item) => {
      check(checks, `${item.signalKey} review gated`, item.reviewStatus === "human_review_required", item.reviewStatus);
      check(checks, `${item.signalKey} publishAllowed false`, item.publishAllowed === false, String(item.publishAllowed));
      check(checks, `${item.signalKey} not financial advice`, item.notFinancialAdvice === true, String(item.notFinancialAdvice));
      check(checks, `${item.signalKey} no guarantee`, item.noGuarantee === true, String(item.noGuarantee));
      check(checks, `${item.signalKey} no live execution`, item.noLiveExecution === true, String(item.noLiveExecution));
      check(checks, `${item.signalKey} sending disabled`, item.externalSendEnabled === false && item.alertSendingEnabled === false && item.subscriberExecutionEnabled === false, `${item.externalSendEnabled}/${item.alertSendingEnabled}/${item.subscriberExecutionEnabled}`);
      check(checks, `${item.signalKey} required safety labels`, requiredSafetyLabels.every((label) => (item.safetyLabels || []).includes(label)), (item.safetyLabels || []).join(", "));
      check(checks, `${item.signalKey} approval question exists`, Boolean(item.approvalQuestion), item.approvalQuestion || "");
      check(checks, `${item.signalKey} yes effect safe`, /internal research archive|future public-safe summary/i.test(item.yesEffect || "") && !/(send signal|post signal|trade signal|notify subscriber)/i.test(item.yesEffect || ""), item.yesEffect || "");
    });
    check(checks, "workflow has human review step", workflow.workflow.some((step) => step.name === "human_review_required"), "human_review_required");
    check(checks, "workflow publishAllowed false throughout", workflow.workflow.every((step) => step.publishAllowed === false), "workflow");
  }

  const scanFiles = [schemaPath, previewsPath, workflowPath, summaryPath, reportPath].filter((filePath) => fs.existsSync(filePath));
  const hits = scanOutputs(scanFiles);
  check(checks, "outputs contain no private paths/IDs/risky enablement terms", hits.length === 0, hits.join("; "));

  writeText(qaReportPath, buildQaReport(checks));

  const failed = checks.filter((item) => !item.passed);
  console.log(failed.length ? "SIGNAL DESK QA FAIL" : "SIGNAL DESK QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`qa report: ${qaReportPath}`);
  if (failed.length) {
    failed.forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed: failed.length === 0, checks, qaReportPath };
}

if (require.main === module) {
  runSignalDeskQa();
}

module.exports = { runSignalDeskQa, qaReportPath };
