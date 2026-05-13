const fs = require("fs");
const path = require("path");
const { paths } = require("../approvals/approvalUtils");

const coreRoot = path.join(__dirname, "..", "..");
const qaReportPath = path.join(paths.projectRoot, "Reports", "Admin", "admin-review-console-qa-report-v0.1.md");
const adminReportPath = path.join(paths.projectRoot, "Reports", "Admin", "marketops-admin-review-console-v0.1.md");
const privateAdminPlanPath = path.join(paths.projectRoot, "Reports", "Admin", "marketops-private-admin-console-plan-v0.1.md");
const contentConsolePath = path.join(paths.projectRoot, "Admin", "content-approval-console", "index.html");
const contentReviewStatePath = path.join(paths.projectRoot, "Data", "content", "queue", "content-review-state-v0.1.json");
const approvedContentPath = path.join(paths.projectRoot, "Data", "content", "queue", "approved-content-v0.1.json");
const contentLiveServerPath = path.join(coreRoot, "src", "admin-console", "runAdminServer.js");
const adminConsoleConfigPath = path.join(coreRoot, "src", "admin-console", "adminConsoleConfig.js");
const adminFiles = [
  path.join(paths.adminRoot, "index.html"),
  path.join(paths.adminRoot, "review-console.css"),
  path.join(paths.adminRoot, "review-console.js"),
  paths.reviewBundleJs,
  paths.reviewBundleLatest,
  paths.approvalLatest,
  adminReportPath,
  privateAdminPlanPath,
  contentConsolePath,
  approvedContentPath,
  contentLiveServerPath
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

const operatorStatusBadges = [
  "draft_only",
  "approved_for_manual_post",
  "approved_for_api_later",
  "rejected",
  "needs_edit",
  "hold"
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
  check(checks, "admin:console script exists", Boolean(packageJson.scripts && packageJson.scripts["admin:console"]), packageJson.scripts && packageJson.scripts["admin:console"]);
  check(checks, "admin:live script exists", Boolean(packageJson.scripts && packageJson.scripts["admin:live"]), packageJson.scripts && packageJson.scripts["admin:live"]);
  check(checks, "admin:qa script exists", Boolean(packageJson.scripts && packageJson.scripts["admin:qa"]), packageJson.scripts && packageJson.scripts["admin:qa"]);
  adminFiles.forEach((filePath) => check(checks, `file exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));

  try {
    const { resolveTenant } = require(adminConsoleConfigPath);
    const { buildConsoleModel } = require(contentLiveServerPath.replace("runAdminServer.js", "contentApprovalConsole.js"));
    const tenant = resolveTenant();
    check(checks, "default admin tenant resolves to marketops", tenant && tenant.tenantId === "marketops", tenant && tenant.tenantId);
    check(checks, "default tenant queue path exists", tenant && fs.existsSync(tenant.contentQueuePath), tenant && tenant.contentQueuePath);
    check(checks, "default tenant review state path resolves", tenant && tenant.reviewStatePath.endsWith("content-review-state-v0.1.json"), tenant && tenant.reviewStatePath);
    check(checks, "default tenant approved content path resolves", tenant && tenant.approvedContentPath.endsWith("approved-content-v0.1.json"), tenant && tenant.approvedContentPath);
    const model = buildConsoleModel(tenant);
    check(checks, "live console model has tenantName", Boolean(model && model.tenantName), model && model.tenantName);
    check(checks, "live console model keeps publishAllowed false", model && model.publishAllowed === false, String(model && model.publishAllowed));
  } catch (error) {
    check(checks, "default admin tenant resolves to marketops", false, error.message);
  }

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
  const forbidden = ["https://", "xmlhttprequest", "sendemail", "smtp", "webhook", "postmessage", "alpaca_api_key", "coinbase_api_key"];
  const hits = forbidden.filter((term) => text.includes(term));
  check(checks, "admin console has no external/API/posting code", hits.length === 0, hits.join("; "));
  check(checks, "admin console states local only", text.includes("local-only"), "local-only");
  check(checks, "admin console states cannot post", text.includes("cannot post"), "cannot post");
  check(checks, "admin console displays generated timestamp", text.includes("generatedat"), "generatedAt");
  check(checks, "admin console displays recommended action", text.includes("recommended action"), "recommended action");
  check(checks, "admin console displays preview path", text.includes("preview:"), "preview");
  check(checks, "content approval console exists", fs.existsSync(contentConsolePath), contentConsolePath);
  check(checks, "approved content output exists", fs.existsSync(approvedContentPath), approvedContentPath);
  check(checks, "content approval console is local-only", text.includes("the office admin approval console") && text.includes("local-only"), "content console");
  check(checks, "content approval actions are present", ["approve", "reject", "defer", "needs_edit", "regenerate_requested"].every((action) => text.includes(action)), "content actions");
  check(checks, "live admin server exposes local endpoints", ["/api/queue", "/api/item/", "/api/review", "/api/approved"].every((route) => text.includes(route)), "live endpoints");
  check(checks, "live admin server defaults to localhost", text.includes('process.env.office_admin_host || "127.0.0.1"') && text.includes("refusing to bind admin live console to a non-localhost host"), "localhost guard");
  check(checks, "live admin server documents local URL", text.includes("http://localhost:4317") || text.includes("local url"), "local URL");
  const approvedContent = fs.existsSync(approvedContentPath) ? readJson(approvedContentPath) : null;
  check(checks, "approved content keeps publishAllowed false", approvedContent && approvedContent.publishAllowed === false && (approvedContent.items || []).every((item) => item.publishAllowed === false), approvedContentPath);
  check(checks, "content review state can be absent or valid", !fs.existsSync(contentReviewStatePath) || Boolean(readJson(contentReviewStatePath)), contentReviewStatePath);
  if (fs.existsSync(contentReviewStatePath)) {
    const reviewState = readJson(contentReviewStatePath);
    const decisions = Object.values(reviewState.decisions || {});
    check(checks, "review state decisions keep reviewer local_user when present", decisions.every((item) => !item.reviewer || item.reviewer === "local_user"), "reviewer");
    check(checks, "review state keeps publishAllowed false", reviewState.publishAllowed === false && decisions.every((item) => item.publishAllowed === false), "publishAllowed");
  }
  check(checks, "private admin plan documents MAC limitation", text.includes("mac addresses are link-local"), "MAC limitation");
  check(checks, "private admin plan recommends Tailscale", text.includes("tailscale private access"), "Tailscale");
  check(checks, "private admin plan keeps console private", text.includes("no public exposure rule"), "no public exposure");
  supportedReviewTypes.forEach((type) => {
    check(checks, `admin report documents type: ${type}`, text.includes(type.toLowerCase()), type);
  });
  supportedStatuses.forEach((status) => {
    check(checks, `admin report documents status: ${status}`, text.includes(status.toLowerCase()), status);
  });
  operatorStatusBadges.forEach((status) => {
    check(checks, `admin report documents operator badge: ${status}`, text.includes(status.toLowerCase()), status);
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
