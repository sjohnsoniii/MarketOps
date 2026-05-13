const fs = require("fs");
const path = require("path");
const { paths } = require("../approvals/approvalUtils");

const coreRoot = path.join(__dirname, "..", "..");
const qaReportPath = path.join(paths.projectRoot, "Reports", "Admin", "admin-review-console-qa-report-v0.1.md");
const adminReportPath = path.join(paths.projectRoot, "Reports", "Admin", "marketops-admin-review-console-v0.1.md");
const adminFiles = [
  path.join(paths.adminRoot, "index.html"),
  path.join(paths.adminRoot, "review-console.css"),
  path.join(paths.adminRoot, "review-console.js"),
  paths.reviewBundleJs,
  paths.reviewBundleLatest,
  paths.approvalLatest,
  adminReportPath
];

const supportedReviewTypes = [
  "social_post",
  "x_post",
  "instagram_post",
  "short_video_script",
  "still_image_prompt",
  "avatar_script",
  "signal_preview",
  "report_summary",
  "blog_draft",
  "agent_improvement_proposal",
  "qa_warning",
  "system_blocker"
];

const supportedStatuses = [
  "PENDING_REVIEW",
  "YES_APPROVE",
  "NO_REJECT",
  "NEEDS_EDIT",
  "HOLD",
  "ESCALATE"
];

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function runAdminQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "admin:build script exists", Boolean(packageJson.scripts && packageJson.scripts["admin:build"]), packageJson.scripts && packageJson.scripts["admin:build"]);
  check(checks, "admin:qa script exists", Boolean(packageJson.scripts && packageJson.scripts["admin:qa"]), packageJson.scripts && packageJson.scripts["admin:qa"]);
  adminFiles.forEach((filePath) => check(checks, `file exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));

  let queue = null;
  try {
    queue = readJson(paths.approvalLatest);
    check(checks, "approval queue valid JSON", true, paths.approvalLatest);
  } catch (error) {
    check(checks, "approval queue valid JSON", false, error.message);
  }

  if (queue) {
    check(checks, "queue external sending disabled", queue.externalSendingEnabled === false, String(queue.externalSendingEnabled));
    check(checks, "queue auto approval disabled", queue.autoApprovalEnabled === false, String(queue.autoApprovalEnabled));
    check(checks, "all queue items require review", queue.items.every((item) => item.status === "PENDING_REVIEW"), "items");
    check(checks, "all queue items have safety labels", queue.items.every((item) => Array.isArray(item.safetyLabels) && item.safetyLabels.length >= 5), "items");
    check(checks, "all queue items have required review fields", queue.items.every((item) => (
      item.id
      && item.createdAt
      && item.type
      && item.title
      && item.summary
      && item.sourcePath
      && item.previewPath
      && item.riskLevel
      && item.recommendedAction
      && item.status
      && Object.prototype.hasOwnProperty.call(item, "reviewNotes")
      && item.approvalQuestion
      && item.yesEffect
      && item.noEffect
      && item.needsEditEffect
    )), "required fields");
  }

  const text = adminFiles.map(readText).join("\n").toLowerCase();
  const forbidden = ["http://", "https://", "fetch(", "xmlhttprequest", "sendemail", "smtp", "webhook", "postmessage", "alpaca_api_key", "coinbase_api_key"];
  const hits = forbidden.filter((term) => text.includes(term));
  check(checks, "admin console has no external/API/posting code", hits.length === 0, hits.join("; "));
  check(checks, "admin console states local only", text.includes("local-only"), "local-only");
  check(checks, "admin console states cannot post", text.includes("cannot post"), "cannot post");
  check(checks, "admin console displays generated timestamp", text.includes("generatedat"), "generatedAt");
  check(checks, "admin console displays recommended action", text.includes("recommended action"), "recommended action");
  check(checks, "admin console displays preview path", text.includes("preview:"), "preview");
  supportedReviewTypes.forEach((type) => {
    check(checks, `admin report documents type: ${type}`, text.includes(type.toLowerCase()), type);
  });
  supportedStatuses.forEach((status) => {
    check(checks, `admin report documents status: ${status}`, text.includes(status.toLowerCase()), status);
  });

  const failed = checks.filter((item) => !item.passed);
  const report = `# MarketOps Admin Review Console QA v0.1

Generated: ${new Date().toISOString()}

## Result

${failed.length ? "FAIL" : "PASS"}

## Checks

- Passed: ${checks.filter((item) => item.passed).length}
- Failed: ${failed.length}

## Failed Checks

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}
`;
  writeText(qaReportPath, report);

  console.log(failed.length ? "ADMIN QA FAIL" : "ADMIN QA PASS");
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
  runAdminQa();
}

module.exports = { runAdminQa };
