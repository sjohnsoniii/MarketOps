const fs = require("fs");
const path = require("path");
const { paths } = require("../utils/paths");
const { loadConfig } = require("../config/configLoader");
const { ensureOfficeContentDirs, readJson, writeJson, writeMarkdown } = require("./officeContentUtils");
const { listGeneratedContentFiles, scanFiles } = require("./officeSafety");

const requiredScripts = ["office:content", "office:queue", "office:qa", "office:run"];
const requiredFolders = [
  paths.contentRoot,
  paths.contentBlogsRoot,
  paths.contentReportsRoot,
  paths.contentSocialRoot,
  paths.contentSocialXRoot,
  paths.contentSocialInstagramRoot,
  paths.contentSocialFacebookRoot,
  paths.contentSocialLinkedinRoot,
  paths.contentVideoRoot,
  paths.contentVideoPackagesRoot,
  paths.contentAvatarRoot,
  paths.contentQueueRoot,
  paths.contentComplianceRoot,
  paths.contentArchiveRoot,
  paths.logsRoot
];
const requiredFiles = [
  paths.weeklyMarketOpsFieldReport,
  paths.monthlyMarketOpsLabReport,
  paths.tradeCaseStudyReport,
  paths.socialPackJson,
  paths.socialPackMarkdown,
  paths.facelessVideoPack,
  paths.avatarPresenterPack,
  paths.videoPackagesJson,
  paths.videoPackagesMarkdown,
  paths.videoSpecialistReport,
  paths.contentQueueJson,
  paths.latestOfficeRunSummaryJson,
  path.join(paths.contentQueueRoot, "approved-content-v0.1.json")
];

function pass(checks, name, details = "") {
  checks.push({ name, passed: true, details });
}

function fail(checks, name, details = "") {
  checks.push({ name, passed: false, details });
}

function ensureNoPostingDependencies(checks) {
  const packageJson = readJson(path.join(paths.coreRoot, "package.json"), {});
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };
  const names = Object.keys(dependencies).map((name) => name.toLowerCase());
  const risky = ["alpaca", "coinbase", "ibkr", "twilio", "sendgrid", "mailgun", "twitter-api", "x-api", "facebook-node", "instagram", "linkedin-api"];
  const hits = names.filter((name) => risky.some((term) => name.includes(term)));
  if (hits.length) {
    fail(checks, "No broker/live/social posting dependencies", `Found package(s): ${hits.join(", ")}`);
  } else {
    pass(checks, "No broker/live/social posting dependencies", "No risky integration packages found.");
  }
}

function updateQueueCompliance(status) {
  const queue = readJson(paths.contentQueueJson, null);
  if (!queue || !Array.isArray(queue.items)) return;
  queue.complianceStatus = status;
  queue.publishAllowed = false;
  queue.items = queue.items.map((item) => ({
    ...item,
    complianceStatus: status,
    status: "draft_review_required",
    publishAllowed: false
  }));
  writeJson(paths.contentQueueJson, queue);

  const summary = readJson(paths.latestOfficeRunSummaryJson, null);
  if (summary) {
    summary.complianceStatus = status;
    summary.publishAllowed = false;
    writeJson(paths.latestOfficeRunSummaryJson, summary);
  }
}

function writeComplianceReport({ checks, findings, status }) {
  const failed = checks.filter((check) => !check.passed);
  const scanSummary = findings.length
    ? findings.map((finding) => `- ${path.relative(paths.projectRoot, finding.filePath).replace(/\\/g, "/")} matched a restricted term.`).join("\n")
    : "No restricted terms were found in generated draft content.";

  const report = `# MarketOps Content Compliance Report v0.1

Status: ${status}
Generated at: ${new Date().toISOString()}
Publish allowed: false

## Scope

This report checks generated MarketOps content drafts, queue records, and public-facing content packs. Drafts remain local, review-gated, and disabled for publishing.

## Scan Result

${scanSummary}

## Checks

${checks.map((check) => `- ${check.passed ? "PASS" : "FAIL"}: ${check.name}${check.details ? ` - ${check.details}` : ""}`).join("\n")}

## Publishing Boundary

All generated items must remain status draft_review_required with publishAllowed false until a human review approves a separate manual publishing step. No social posting, email sending, payment flow, live data fetch, broker connection, or real-money action is enabled.`;

  writeMarkdown(paths.contentComplianceReport, report);
}

function runOfficeQa() {
  ensureOfficeContentDirs();
  const checks = [];
  const config = loadConfig();

  if (config.mode === "paper_simulation") pass(checks, "Config mode is paper_simulation");
  else fail(checks, "Config mode is paper_simulation", `Found ${config.mode}`);

  const safety = config.safety || {};
  ["allowBrokerConnection", "allowLiveTrading", "allowSmsAlerts", "allowSubscriberSignals"].forEach((flag) => {
    if (safety[flag] === false) pass(checks, `${flag} is false`);
    else fail(checks, `${flag} is false`, `Found ${safety[flag]}`);
  });

  const packageJson = readJson(path.join(paths.coreRoot, "package.json"), {});
  requiredScripts.forEach((scriptName) => {
    if (packageJson.scripts && packageJson.scripts[scriptName]) pass(checks, `Required script exists: ${scriptName}`);
    else fail(checks, `Required script exists: ${scriptName}`);
  });

  requiredFolders.forEach((folderPath) => {
    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) pass(checks, `Required content folder exists: ${path.basename(folderPath)}`);
    else fail(checks, `Required content folder exists: ${folderPath}`);
  });

  requiredFiles.forEach((filePath) => {
    if (fs.existsSync(filePath)) pass(checks, `Required generated file exists: ${path.basename(filePath)}`);
    else fail(checks, `Required generated file exists: ${filePath}`);
  });

  const queue = readJson(paths.contentQueueJson, { items: [] }) || { items: [] };
  if (Array.isArray(queue.items) && queue.items.length >= 33) pass(checks, "Content queue contains report, social, video, avatar, and video package drafts", `${queue.items.length} items`);
  else fail(checks, "Content queue contains report, social, video, avatar, and video package drafts", `${Array.isArray(queue.items) ? queue.items.length : 0} items`);

  const videoPackageQueueItems = (queue.items || []).filter((item) => item.type === "video_generation_package");
  if (videoPackageQueueItems.length >= 16) pass(checks, "Video Generation Specialist queue items exist", `${videoPackageQueueItems.length} item(s)`);
  else fail(checks, "Video Generation Specialist queue items exist", `${videoPackageQueueItems.length} item(s)`);

  const badStatuses = (queue.items || []).filter((item) => item.status !== "draft_review_required");
  if (badStatuses.length === 0) pass(checks, "Every queue item requires draft review");
  else fail(checks, "Every queue item requires draft review", `${badStatuses.length} item(s) did not match.`);

  const publishEnabled = (queue.items || []).filter((item) => item.publishAllowed !== false);
  if (queue.publishAllowed === false && publishEnabled.length === 0) pass(checks, "Every queue item has publishAllowed false");
  else fail(checks, "Every queue item has publishAllowed false", `${publishEnabled.length} item(s) enabled publishing.`);

  const approvedContent = readJson(path.join(paths.contentQueueRoot, "approved-content-v0.1.json"), null);
  if (approvedContent && approvedContent.publishAllowed === false && Array.isArray(approvedContent.items) && approvedContent.items.every((item) => item.publishAllowed === false && item.complianceStatus)) {
    pass(checks, "Approved content output preserves compliance and publishAllowed false", `${approvedContent.items.length} item(s)`);
  } else {
    fail(checks, "Approved content output preserves compliance and publishAllowed false", "missing or unsafe");
  }

  ensureNoPostingDependencies(checks);

  const videoBundle = readJson(paths.videoPackagesJson, null);
  if (videoBundle && Array.isArray(videoBundle.packages)) {
    pass(checks, "Video package bundle is valid JSON", `${videoBundle.packages.length} package(s)`);
    if (videoBundle.publishAllowed === false && videoBundle.uploadAllowed === false && videoBundle.externalApiAllowed === false) pass(checks, "Video package bundle disables publish/upload/API");
    else fail(checks, "Video package bundle disables publish/upload/API");
    const unsafeVideoPackages = videoBundle.packages.filter((item) => item.publishAllowed !== false || item.status !== "draft_review_required" || !String(item.paperTradingDisclaimer || "").toLowerCase().includes("paper-trading simulation"));
    if (unsafeVideoPackages.length === 0) pass(checks, "Every video package is review-gated with paper labels");
    else fail(checks, "Every video package is review-gated with paper labels", `${unsafeVideoPackages.length} unsafe item(s)`);
  } else {
    fail(checks, "Video package bundle is valid JSON", "missing or invalid");
  }

  const files = listGeneratedContentFiles();
  const findings = scanFiles(files);
  if (findings.length === 0) pass(checks, "Generated content compliance scan passed", `${files.length} file(s) scanned.`);
  else fail(checks, "Generated content compliance scan passed", `${findings.length} finding(s).`);

  const failed = checks.filter((check) => !check.passed);
  const status = failed.length || findings.length ? "failed" : "passed";
  updateQueueCompliance(status);
  writeComplianceReport({ checks, findings, status });

  console.log(status === "passed" ? "OFFICE QA PASS" : "OFFICE QA FAIL");
  console.log(`checks passed: ${checks.filter((check) => check.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`compliance report path: ${paths.contentComplianceReport}`);

  if (status !== "passed") {
    process.exitCode = 1;
  }

  return { status, checks, findings };
}

if (require.main === module) {
  runOfficeQa();
}

module.exports = { runOfficeQa };
