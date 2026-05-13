const fs = require("fs");
const path = require("path");
const { reviewPaths, reviewFiles, readJson, readText } = require("./reviewUtils");

const requiredFiles = [
  reviewPaths.latestAgentSummary,
  reviewPaths.improvementBacklog,
  reviewPaths.monthlyBrief,
  reviewPaths.biweeklyDigest,
  ...reviewFiles.map((item) => item.path)
];

const bannedPhrases = [
  "buy" + " now",
  "sell" + " now",
  "copy this" + " trade",
  "copy my" + " bot",
  "guaranteed",
  "quit your" + " job",
  "money" + " printer",
  "boat",
  "yacht",
  "Sam" + "-only",
  "my" + " account",
  "front" + "-run",
  "ALPACA" + "_API_KEY",
  "COINBASE" + "_API_KEY",
  "liveTrading" + ": true",
  "allowLiveTrading" + "\": true",
  "trade" + "Id",
  "signal" + "Id",
  "riskDecision" + "Id",
  "position" + "Value",
  "quantity"
];

const forbiddenAttempts = [
  "enable real-money",
  "connect broker",
  "connect exchange",
  "add api key",
  "auto-post",
  "send sms",
  "send email",
  "enable payments",
  "subscriber execution",
  "bypass qa"
];

function pass(checks, name, details = "") {
  checks.push({ name, passed: true, details });
}

function fail(checks, name, details = "") {
  checks.push({ name, passed: false, details });
}

function scanReviewFiles(files) {
  const findings = [];
  for (const filePath of files) {
    const text = readText(filePath, "");
    const lower = text.toLowerCase();
    for (const phrase of bannedPhrases) {
      if (lower.includes(phrase.toLowerCase())) {
        findings.push({ filePath, phrase: "restricted term" });
      }
    }
    for (const phrase of forbiddenAttempts) {
      if (lower.includes(phrase)) {
        findings.push({ filePath, phrase: "forbidden action attempt" });
      }
    }
  }
  return findings;
}

function countInFile(filePath, pattern) {
  const text = readText(filePath, "");
  const matches = text.match(new RegExp(pattern, "g"));
  return matches ? matches.length : 0;
}

function runAgentsQa() {
  const checks = [];

  for (const filePath of requiredFiles) {
    if (fs.existsSync(filePath)) pass(checks, `Required review file exists: ${path.basename(filePath)}`);
    else fail(checks, `Required review file exists: ${filePath}`);
  }

  const summary = readJson(reviewPaths.latestAgentSummary, null);
  if (summary) {
    pass(checks, "latest-agent-review-summary.json is readable");
    if (summary.reviewCadence === "biweekly_digest") pass(checks, "Review cadence is biweekly_digest");
    else fail(checks, "Review cadence is biweekly_digest", `Found ${summary.reviewCadence}`);
    if (summary.autoApplyAllowed === false) pass(checks, "Summary autoApplyAllowed is false");
    else fail(checks, "Summary autoApplyAllowed is false");
    if (summary.humanReviewRequired === true) pass(checks, "Summary humanReviewRequired is true");
    else fail(checks, "Summary humanReviewRequired is true");
    if (summary.urgentItemsCount === 0) pass(checks, "No urgent human-review items for routine run");
    else fail(checks, "No urgent human-review items for routine run", `${summary.urgentItemsCount} urgent item(s)`);
  } else {
    fail(checks, "latest-agent-review-summary.json is readable");
  }

  for (const reviewFile of reviewFiles) {
    const text = readText(reviewFile.path, "");
    if (text.includes("humanReviewRequired: true")) pass(checks, `${reviewFile.fileName} has humanReviewRequired true`);
    else fail(checks, `${reviewFile.fileName} has humanReviewRequired true`);
    if (text.includes("autoApplyAllowed: false")) pass(checks, `${reviewFile.fileName} has autoApplyAllowed false`);
    else fail(checks, `${reviewFile.fileName} has autoApplyAllowed false`);
    if (text.includes("reviewCadence: biweekly_digest")) pass(checks, `${reviewFile.fileName} has biweekly cadence`);
    else fail(checks, `${reviewFile.fileName} has biweekly cadence`);
  }

  const backlog = readText(reviewPaths.improvementBacklog, "");
  const proposalCount = countInFile(reviewPaths.improvementBacklog, "proposalId:");
  const proposalAutoApplyFalseCount = countInFile(reviewPaths.improvementBacklog, "autoApplyAllowed: false");
  const proposalHumanReviewCount = countInFile(reviewPaths.improvementBacklog, "humanReviewRequired: true");
  if (proposalCount > 0) pass(checks, "Improvement proposals exist", `${proposalCount} proposals`);
  else fail(checks, "Improvement proposals exist");
  if (proposalAutoApplyFalseCount >= proposalCount) pass(checks, "Every proposal has autoApplyAllowed false");
  else fail(checks, "Every proposal has autoApplyAllowed false", `${proposalAutoApplyFalseCount}/${proposalCount}`);
  if (proposalHumanReviewCount >= proposalCount) pass(checks, "Every proposal has humanReviewRequired true");
  else fail(checks, "Every proposal has humanReviewRequired true", `${proposalHumanReviewCount}/${proposalCount}`);
  if (backlog.includes("priority: review_next_digest")) pass(checks, "Routine proposals default to review_next_digest");
  else fail(checks, "Routine proposals default to review_next_digest");

  const filesToScan = requiredFiles.filter((filePath) => fs.existsSync(filePath));
  const findings = scanReviewFiles(filesToScan);
  if (findings.length === 0) pass(checks, "Agent review banned phrase and forbidden action scan passed", `${filesToScan.length} file(s) scanned.`);
  else fail(checks, "Agent review banned phrase and forbidden action scan passed", `${findings.length} finding(s).`);

  const failed = checks.filter((check) => !check.passed);
  console.log(failed.length ? "AGENTS QA FAIL" : "AGENTS QA PASS");
  console.log(`checks passed: ${checks.filter((check) => check.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`proposal count: ${proposalCount}`);
  console.log(`review summary path: ${reviewPaths.latestAgentSummary}`);

  if (failed.length) {
    failed.forEach((check) => console.log(`FAIL: ${check.name}${check.details ? ` - ${check.details}` : ""}`));
    process.exitCode = 1;
  }

  return { passed: failed.length === 0, checks, proposalCount, findings };
}

if (require.main === module) {
  runAgentsQa();
}

module.exports = { runAgentsQa };
