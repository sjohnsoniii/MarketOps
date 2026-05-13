const fs = require("fs");
const path = require("path");
const { paths, defaultSafetyLabels } = require("./approvalUtils");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const qaReportPath = path.join(projectRoot, "Reports", "Approvals", "approval-queue-qa-report-v0.1.md");

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

function restrictedTerms() {
  return [
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this", "trade"].join(" "),
    ["copy my", "bot"].join(" "),
    ["guaran", "teed"].join(""),
    ["post", " automatically"].join(""),
    ["trade", " automatically"].join(""),
    ["send", " automatically"].join(""),
    ["email", " automatically"].join(""),
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join("")
  ];
}

function newestTimestampedQueue() {
  if (!fs.existsSync(paths.approvalsRoot)) return null;
  const candidates = fs.readdirSync(paths.approvalsRoot)
    .filter((fileName) => /^approval-queue-\d{8}-\d{6}\.json$/.test(fileName))
    .map((fileName) => ({
      fileName,
      fullPath: path.join(paths.approvalsRoot, fileName)
    }))
    .sort((a, b) => b.fileName.localeCompare(a.fileName));
  return candidates[0] || null;
}

function itemText(item) {
  return [
    item.title,
    item.summary,
    item.approvalQuestion,
    item.yesEffect,
    item.noEffect,
    item.needsEditEffect,
    item.reviewNotes,
    item.blockedReason
  ].filter(Boolean).join("\n").toLowerCase();
}

function buildQaReport(checks) {
  const failed = checks.filter((item) => !item.passed);
  return `# MarketOps Approval Queue QA v0.1

Generated: ${new Date().toISOString()}

## Result

${failed.length ? "FAIL" : "PASS"}

## Checks

- Passed: ${checks.filter((item) => item.passed).length}
- Failed: ${failed.length}

## Failed Checks

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}
`;
}

function runApprovalsQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "approvals:generate script exists", Boolean(packageJson.scripts && packageJson.scripts["approvals:generate"]), packageJson.scripts && packageJson.scripts["approvals:generate"]);
  check(checks, "approvals:qa script exists", Boolean(packageJson.scripts && packageJson.scripts["approvals:qa"]), packageJson.scripts && packageJson.scripts["approvals:qa"]);
  [paths.approvalLatest, paths.reviewBundleLatest, paths.reviewBundleJs, paths.approvalReport].forEach((filePath) => check(checks, `file exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  const timestampedQueue = newestTimestampedQueue();
  check(checks, "timestamped approval queue exists", Boolean(timestampedQueue), timestampedQueue ? timestampedQueue.fullPath : "missing approval-queue-YYYYMMDD-HHMMSS.json");

  let queue = null;
  try {
    queue = readJson(paths.approvalLatest);
    check(checks, "approval queue JSON valid", true, paths.approvalLatest);
  } catch (error) {
    check(checks, "approval queue JSON valid", false, error.message);
  }

  if (queue) {
    check(checks, "schemaVersion is 0.1", queue.schemaVersion === "0.1", String(queue.schemaVersion));
    check(checks, "mode is supercruise_local_only", queue.mode === "supercruise_local_only", String(queue.mode));
    check(checks, "generatedAt is valid timestamp", Boolean(queue.generatedAt) && !Number.isNaN(Date.parse(queue.generatedAt)), String(queue.generatedAt));
    check(checks, "external sending disabled", queue.externalSendingEnabled === false, String(queue.externalSendingEnabled));
    check(checks, "auto approval disabled", queue.autoApprovalEnabled === false, String(queue.autoApprovalEnabled));
    check(checks, "publishAllowed false", queue.publishAllowed === false, String(queue.publishAllowed));
    check(checks, "items exist", Array.isArray(queue.items) && queue.items.length > 0, String((queue.items || []).length));
    check(checks, "supported approval actions present", ["YES_APPROVE", "NO_REJECT", "NEEDS_EDIT", "HOLD", "ESCALATE"].every((action) => (queue.supportedActions || []).includes(action)), (queue.supportedActions || []).join(", "));

    const requiredFields = [
      "id",
      "createdAt",
      "type",
      "platform",
      "title",
      "summary",
      "sourcePath",
      "previewPath",
      "riskLevel",
      "safetyLabels",
      "approvalQuestion",
      "recommendedAction",
      "status",
      "yesEffect",
      "noEffect",
      "needsEditEffect",
      "reviewNotes",
      "blockedReason"
    ];
    const autoApprovedStatuses = new Set(["YES_APPROVE", "APPROVED", "approved_for_manual_posting"]);
    const signalRestricted = ["buy now", "sell now", "copy this trade", "copy my bot", "copy trade"];
    const socialRealMoneyClaims = ["real money results", "real-money results", "actual returns", "guaranteed returns", "guaranteed profit"];

    (queue.items || []).forEach((item) => {
      requiredFields.forEach((field) => {
        check(checks, `${item.id || "approval item"} has field ${field}`, Object.prototype.hasOwnProperty.call(item, field), field);
      });
      check(checks, `${item.id} id follows approval timestamp schema`, /^approval-\d{8}-\d{6}-\d{3}$/.test(item.id || ""), item.id || "");
      check(checks, `${item.id} createdAt valid`, Boolean(item.createdAt) && !Number.isNaN(Date.parse(item.createdAt)), String(item.createdAt));
      check(checks, `${item.id} pending review`, item.status === "PENDING_REVIEW", item.status);
      check(checks, `${item.id} not auto-approved`, !autoApprovedStatuses.has(item.status), item.status);
      check(checks, `${item.id} recommended action needs review`, item.recommendedAction === "NEEDS_REVIEW", item.recommendedAction);
      check(checks, `${item.id} safety labels`, Array.isArray(item.safetyLabels) && defaultSafetyLabels.every((label) => item.safetyLabels.includes(label)), item.id);
      check(checks, `${item.id} approval question`, Boolean(item.approvalQuestion), item.id);
      check(checks, `${item.id} source path`, Boolean(item.sourcePath), item.id);
      check(checks, `${item.id} preview path`, Boolean(item.previewPath), item.id);
      check(checks, `${item.id} yes effect safe`, !/(post|trade|send|email|publish)\s+now/i.test(item.yesEffect || ""), item.yesEffect || "");
      check(checks, `${item.id} yes approval remains manual/gated`, /(manual|archive|planning|research|review)/i.test(item.yesEffect || "") && !/(automatically post|automatically publish|automatically trade|automatically send|automatically email)/i.test(item.yesEffect || ""), item.yesEffect || "");
      if ((item.type || "").includes("signal")) {
        const hits = signalRestricted.filter((term) => itemText(item).includes(term));
        check(checks, `${item.id} signal item has no buy/sell/copy language`, hits.length === 0, hits.join("; "));
      }
      if (["social_post", "x_post", "instagram_post", "short_video_script", "avatar_script"].includes(item.type)) {
        const hits = socialRealMoneyClaims.filter((term) => itemText(item).includes(term));
        check(checks, `${item.id} social item has no real-money result claims`, hits.length === 0, hits.join("; "));
      }
    });
  }

  const text = [paths.approvalLatest, paths.reviewBundleLatest, paths.reviewBundleJs, paths.approvalReport].map(readText).join("\n").toLowerCase();
  const hits = restrictedTerms().filter((term) => text.includes(term.toLowerCase()));
  check(checks, "no restricted queue language", hits.length === 0, hits.join("; "));

  writeText(qaReportPath, buildQaReport(checks));
  const failed = checks.filter((item) => !item.passed);
  console.log(failed.length ? "APPROVALS QA FAIL" : "APPROVALS QA PASS");
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
  runApprovalsQa();
}

module.exports = { runApprovalsQa };
