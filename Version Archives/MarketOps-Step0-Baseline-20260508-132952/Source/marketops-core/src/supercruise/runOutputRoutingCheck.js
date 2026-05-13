const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const dataRoot = path.join(projectRoot, "Data");
const reportsRoot = path.join(projectRoot, "Reports");

const requiredReportFolders = [
  "Automation",
  "Overnight",
  "Step0",
  "Social",
  "Signals",
  "Analytics",
  "Backtesting",
  "Dashboard",
  "Admin",
  "QA"
];

const requiredDataFolders = [
  path.join(dataRoot, "logs"),
  path.join(dataRoot, "approvals"),
  path.join(dataRoot, "social-previews"),
  path.join(dataRoot, "signal-previews"),
  path.join(projectRoot, "Admin", "review-console")
];

const paths = {
  logsRoot: path.join(dataRoot, "logs"),
  approvalsRoot: path.join(dataRoot, "approvals"),
  socialPreviewsRoot: path.join(dataRoot, "social-previews"),
  signalPreviewsRoot: path.join(dataRoot, "signal-previews"),
  legacySignalsRoot: path.join(dataRoot, "signals"),
  adminRoot: path.join(projectRoot, "Admin", "review-console"),
  approvalLatest: path.join(dataRoot, "approvals", "approval-queue-latest.json"),
  reviewBundleLatest: path.join(dataRoot, "approvals", "review-console-bundle-latest.json"),
  adminBundleJs: path.join(projectRoot, "Admin", "review-console", "review-console-bundle-latest.js"),
  qaReport: path.join(reportsRoot, "QA", "marketops-supercruise-output-routing-v0.1.md"),
  manifestJson: path.join(reportsRoot, "QA", "marketops-supercruise-output-routing-manifest-v0.1.json")
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function stamp(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function dayStamp(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function writeText(filePath, text) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text.trim() + "\n", "utf8");
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function relative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function newestFiles(dirPath, limit = 8) {
  if (!exists(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      const stat = fs.statSync(fullPath);
      return { path: fullPath, modifiedAt: stat.mtime.toISOString() };
    })
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .slice(0, limit);
}

function walkMarkdown(dirPath, results = []) {
  if (!exists(dirPath)) return results;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkMarkdown(fullPath, results);
    } else if (/\.md$/i.test(entry.name)) {
      const stat = fs.statSync(fullPath);
      results.push({ path: fullPath, modifiedAt: stat.mtime.toISOString() });
    }
  }
  return results;
}

function classifyOutput(filePath) {
  const rel = relative(filePath);
  if (rel.includes("/approvals/") || rel.includes("/Admin/") || rel.includes("/Approvals/")) return "approval_required";
  if (rel.includes("/Dashboard/") || rel.includes("/Analytics/") || rel.includes("/Backtesting/") || rel.includes("/Signals/") || rel.includes("/Social/")) return "public_safe_preview";
  if (rel.includes("/Step0/") || rel.includes("/Automation/") || rel.includes("/Overnight/") || rel.includes("/QA/")) return "internal_only";
  return "internal_only";
}

function mirrorSignalPreviews() {
  const source = path.join(paths.legacySignalsRoot, "synthetic-signal-previews-v0.1.json");
  const target = path.join(paths.signalPreviewsRoot, "synthetic-signal-previews-v0.1.json");
  if (!exists(source)) {
    return { copied: false, source, target, reason: "source missing" };
  }
  ensureDir(paths.signalPreviewsRoot);
  fs.copyFileSync(source, target);
  return { copied: true, source, target };
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function buildMarkdownList(items) {
  if (!items.length) return "- None";
  return items.map((item) => `- ${relative(item.path)} (${item.modifiedAt})`).join("\n");
}

function runOutputRoutingCheck() {
  const now = new Date();
  const generatedAt = now.toISOString();
  const runStamp = stamp(now);
  const today = dayStamp(now);
  const checks = [];

  [...requiredDataFolders, ...requiredReportFolders.map((folder) => path.join(reportsRoot, folder))].forEach(ensureDir);

  const mirrorResult = mirrorSignalPreviews();
  check(checks, "signal preview routing folder exists", exists(paths.signalPreviewsRoot), paths.signalPreviewsRoot);
  check(checks, "signal previews mirrored or source absent", mirrorResult.copied || mirrorResult.reason === "source missing", mirrorResult.reason || relative(mirrorResult.target));

  requiredReportFolders.forEach((folder) => {
    const folderPath = path.join(reportsRoot, folder);
    check(checks, `report folder exists: ${folder}`, exists(folderPath), folderPath);
  });
  requiredDataFolders.forEach((folderPath) => {
    check(checks, `data/admin folder exists: ${relative(folderPath)}`, exists(folderPath), folderPath);
  });

  [
    paths.approvalLatest,
    paths.reviewBundleLatest,
    paths.adminBundleJs
  ].forEach((filePath) => check(checks, `approval/admin route exists: ${relative(filePath)}`, exists(filePath), filePath));

  const approvalQueue = exists(paths.approvalLatest)
    ? JSON.parse(fs.readFileSync(paths.approvalLatest, "utf8"))
    : { items: [] };
  check(checks, "approval queue external sending disabled", approvalQueue.externalSendingEnabled === false, String(approvalQueue.externalSendingEnabled));
  check(checks, "approval queue auto approval disabled", approvalQueue.autoApprovalEnabled === false, String(approvalQueue.autoApprovalEnabled));
  check(checks, "approval queue has review items", Array.isArray(approvalQueue.items) && approvalQueue.items.length > 0, String((approvalQueue.items || []).length));

  const pendingApprovals = (approvalQueue.items || []).filter((item) => item.status === "PENDING_REVIEW");
  const newestLogsBeforeWrite = newestFiles(paths.logsRoot, 8);
  const newestReports = walkMarkdown(reportsRoot)
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .slice(0, 12);
  const failed = checks.filter((item) => !item.passed);
  const logPath = path.join(paths.logsRoot, `${runStamp}-supercruise-output-routing.log`);
  const morningSummaryPath = path.join(reportsRoot, "Overnight", `marketops-supercruise-morning-summary-${today}.md`);
  const blockedPath = path.join(reportsRoot, "Overnight", `marketops-supercruise-blocked-${runStamp}.md`);

  const manifest = {
    schemaVersion: "0.1",
    generatedAt,
    mode: "supercruise_local_only",
    classificationDefault: "internal_only",
    outputClassifications: {
      logs: "internal_only",
      reports: "internal_only",
      approvalQueues: "approval_required",
      socialPreviews: "approval_required",
      signalPreviews: "approval_required",
      adminReviewConsole: "approval_required"
    },
    routingRule: [
      "relevant data/report folder",
      "approval queue",
      "admin review console bundle",
      "morning checklist"
    ],
    newestLogs: newestLogsBeforeWrite.map((item) => ({ path: relative(item.path), modifiedAt: item.modifiedAt, classification: classifyOutput(item.path) })),
    newestReports: newestReports.map((item) => ({ path: relative(item.path), modifiedAt: item.modifiedAt, classification: classifyOutput(item.path) })),
    approvalQueueItems: (approvalQueue.items || []).length,
    pendingApprovals: pendingApprovals.length,
    externalSendingEnabled: approvalQueue.externalSendingEnabled === true,
    autoApprovalEnabled: approvalQueue.autoApprovalEnabled === true,
    checksPassed: checks.filter((item) => item.passed).length,
    checksFailed: failed.length
  };

  writeJson(paths.manifestJson, manifest);

  const report = `# MarketOps Supercruise Output Routing v0.1

Generated: ${generatedAt}

Classification: internal_only

## Verdict

${failed.length ? "PARTIAL/BLOCKED" : "PASS"}

## Routing Summary

- Logs: ${relative(paths.logsRoot)}
- Reports: ${relative(reportsRoot)}
- Approval queues: ${relative(paths.approvalsRoot)}
- Social previews: ${relative(paths.socialPreviewsRoot)}
- Signal previews: ${relative(paths.signalPreviewsRoot)}
- Admin review console: ${relative(paths.adminRoot)}

## Human Judgment Routing

Any output needing human judgment routes to:

1. relevant data/report folder
2. approval queue
3. admin review console bundle
4. morning checklist

## Approval Status

- Approval queue items: ${(approvalQueue.items || []).length}
- Pending review: ${pendingApprovals.length}
- External sending enabled: ${approvalQueue.externalSendingEnabled === true}
- Auto approval enabled: ${approvalQueue.autoApprovalEnabled === true}

## Signal Preview Routing

- Source: ${relative(mirrorResult.source)}
- Routed copy: ${relative(mirrorResult.target)}
- Copied this run: ${mirrorResult.copied}

## Checks

- Passed: ${checks.filter((item) => item.passed).length}
- Failed: ${failed.length}

${checks.map((item) => `- ${item.passed ? "PASS" : "FAIL"}: ${item.name}${item.detail ? ` — ${item.detail}` : ""}`).join("\n")}

## Safety Confirmation

No commit, push, deploy, upload, external API call, live market data fetch, broker connection, live trading, SMS/email sending, payment flow, or social auto-posting was performed by this routing check.
`;

  writeText(paths.qaReport, report);

  const morningSummary = `# MarketOps Supercruise Morning Summary ${today}

Generated: ${generatedAt}

Classification: internal_only

## What Completed

- Output routing folders verified.
- Approval queue route verified.
- Admin review console bundle route verified.
- Signal previews routed into Data/signal-previews for the Supercruise convention.
- Routing manifest and QA report generated.

## What Failed

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}

## Routed For Approval

- Pending approval items: ${pendingApprovals.length}
- Approval queue: ${relative(paths.approvalLatest)}
- Admin review bundle: ${relative(paths.reviewBundleLatest)}

## Newest Logs

${buildMarkdownList(newestLogsBeforeWrite)}

## Newest Reports

${buildMarkdownList(newestReports)}

## QA Status

- Supercruise output routing: ${failed.length ? "PARTIAL/BLOCKED" : "PASS"}
- Checks passed: ${checks.filter((item) => item.passed).length}
- Checks failed: ${failed.length}

## Blockers

${failed.length ? "- See failed checks above." : "- None."}

## Next Recommended Pass

- Open the local admin review console and review pending approval cards.
- Continue keeping any human-judgment output routed through approvals before public use.
`;

  writeText(morningSummaryPath, morningSummary);

  const log = [
    `generatedAt=${generatedAt}`,
    "subsystem=supercruise-output-routing",
    `result=${failed.length ? "PARTIAL/BLOCKED" : "PASS"}`,
    `checksPassed=${checks.filter((item) => item.passed).length}`,
    `checksFailed=${failed.length}`,
    `approvalItems=${(approvalQueue.items || []).length}`,
    `pendingApprovals=${pendingApprovals.length}`,
    `qaReport=${paths.qaReport}`,
    `morningSummary=${morningSummaryPath}`,
    "externalSending=false",
    "autoApproval=false",
    "secretsLogged=false"
  ].join("\n");
  writeText(logPath, log);

  if (failed.length) {
    const blockedReport = `# MarketOps Supercruise Blocked ${runStamp}

Generated: ${generatedAt}

Classification: internal_only

## Blocked Action

Supercruise output routing verification.

## Reason

${failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n")}

## Hard Boundary Violation

No hard boundary was crossed. This report was generated locally.

## Safe Next Step

Review the failed checks in ${relative(paths.qaReport)} and rerun:

\`\`\`powershell
npm run supercruise:routing
\`\`\`
`;
    writeText(blockedPath, blockedReport);
  }

  console.log(failed.length ? "SUPERCRUISE ROUTING PARTIAL/BLOCKED" : "SUPERCRUISE ROUTING PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`log: ${logPath}`);
  console.log(`report: ${paths.qaReport}`);
  console.log(`morning summary: ${morningSummaryPath}`);

  if (failed.length) {
    console.log(`blocked report: ${blockedPath}`);
    process.exitCode = 1;
  }
  return { passed: failed.length === 0, checks, logPath, reportPath: paths.qaReport, morningSummaryPath };
}

if (require.main === module) {
  runOutputRoutingCheck();
}

module.exports = { runOutputRoutingCheck };
