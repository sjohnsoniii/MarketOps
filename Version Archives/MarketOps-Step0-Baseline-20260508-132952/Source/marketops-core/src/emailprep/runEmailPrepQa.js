const fs = require("fs");
const path = require("path");
const { queuePath, escalationItemsPath, reportPath, checklistPath } = require("./runEmailPrep");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const qaReportPath = path.join(projectRoot, "Reports", "Escalations", "email-prep-qa-report-v0.1.md");

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

function walk(dirPath, visitor) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) walk(fullPath, visitor);
    else visitor(fullPath);
  }
}

function newestTimestampedEmailQueue() {
  const queueRoot = path.dirname(queuePath);
  if (!fs.existsSync(queueRoot)) return null;
  const candidates = fs.readdirSync(queueRoot)
    .filter((fileName) => /^email-queue-\d{8}-\d{6}\.json$/.test(fileName))
    .sort((a, b) => b.localeCompare(a));
  return candidates[0] ? path.join(queueRoot, candidates[0]) : null;
}

function runEmailPrepQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "emailprep:build script exists", Boolean(packageJson.scripts && packageJson.scripts["emailprep:build"]), packageJson.scripts && packageJson.scripts["emailprep:build"]);
  check(checks, "emailprep:qa script exists", Boolean(packageJson.scripts && packageJson.scripts["emailprep:qa"]), packageJson.scripts && packageJson.scripts["emailprep:qa"]);
  [queuePath, escalationItemsPath, reportPath, checklistPath].forEach((filePath) => check(checks, `file exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  const timestampedQueue = newestTimestampedEmailQueue();
  check(checks, "timestamped email queue exists", Boolean(timestampedQueue), timestampedQueue || "missing email-queue-YYYYMMDD-HHMMSS.json");

  let queue = null;
  try {
    queue = readJson(queuePath);
    check(checks, "email queue JSON valid", true, queuePath);
  } catch (error) {
    check(checks, "email queue JSON valid", false, error.message);
  }

  if (queue) {
    check(checks, "schemaVersion 0.1", queue.schemaVersion === "0.1", String(queue.schemaVersion));
    check(checks, "mode local draft only", queue.mode === "local_email_draft_only", queue.mode);
    check(checks, "generatedAt valid", Boolean(queue.generatedAt) && !Number.isNaN(Date.parse(queue.generatedAt)), String(queue.generatedAt));
    check(checks, "autoSendEnabled false", queue.autoSendEnabled === false, String(queue.autoSendEnabled));
    check(checks, "sendAllowed false", queue.sendAllowed === false, String(queue.sendAllowed));
    check(checks, "smtpConfigured false", queue.smtpConfigured === false, String(queue.smtpConfigured));
    check(checks, "apiConfigured false", queue.apiConfigured === false, String(queue.apiConfigured));
    check(checks, "drafts exist", Array.isArray(queue.drafts) && queue.drafts.length >= 5, String((queue.drafts || []).length));
    (queue.drafts || []).forEach((draft) => {
      check(checks, `${draft.id} draft only`, draft.status === "DRAFT_ONLY", draft.status);
      check(checks, `${draft.id} sendAllowed false`, draft.sendAllowed === false, String(draft.sendAllowed));
      check(checks, `${draft.id} body path exists`, fs.existsSync(path.join(projectRoot, draft.bodyPath)), draft.bodyPath);
    });
  }

  let escalations = null;
  try {
    escalations = readJson(escalationItemsPath);
    check(checks, "escalation items JSON valid", true, escalationItemsPath);
  } catch (error) {
    check(checks, "escalation items JSON valid", false, error.message);
  }

  if (escalations) {
    check(checks, "escalation mode local review only", escalations.mode === "local_escalation_review_only", escalations.mode);
    check(checks, "escalation autoSendEnabled false", escalations.autoSendEnabled === false, String(escalations.autoSendEnabled));
    check(checks, "escalation sendAllowed false", escalations.sendAllowed === false, String(escalations.sendAllowed));
    ["permission_block", "qa_failure", "thermal_warning", "missing_credential", "external_integration_needed", "human_approval_needed", "step0_promotion_ready"].forEach((type) => {
      check(checks, `escalation type supported: ${type}`, (escalations.escalationTypes || []).includes(type), type);
    });
    check(checks, "escalation items exist", Array.isArray(escalations.items) && escalations.items.length >= 3, String((escalations.items || []).length));
    (escalations.items || []).forEach((item) => {
      check(checks, `${item.id} sendAllowed false`, item.sendAllowed === false, String(item.sendAllowed));
      check(checks, `${item.id} draft only`, item.emailDraftOnly === true, String(item.emailDraftOnly));
    });
  }

  const docsEmailRoot = path.join(projectRoot, "Docs", "Email");
  const sourceEmailRoot = path.join(coreRoot, "src", "emailprep");
  const scannedFiles = [queuePath, escalationItemsPath, reportPath, checklistPath].filter((filePath) => fs.existsSync(filePath));
  walk(docsEmailRoot, (filePath) => {
    if (/\.(md|json|txt)$/i.test(filePath)) scannedFiles.push(filePath);
  });
  const text = scannedFiles.map(readText).join("\n").toLowerCase();
  const forbidden = ["smtp_password", "sendgrid", "mailgun", "api_key", "refresh_token", "autosendenabled\": true", "sendallowed\": true", "send email now", "webhook"];
  const hits = forbidden.filter((term) => text.includes(term));
  check(checks, "no credentials or enabled sending", hits.length === 0, hits.join("; "));

  const sourceHits = [];
  walk(sourceEmailRoot, (filePath) => {
    if (!/\.js$/i.test(filePath)) return;
    if (filePath === __filename) return;
    const sourceText = readText(filePath).toLowerCase();
    [
      ["node", "mailer"].join(""),
      ["smtp", "transport"].join(""),
      ["send", "grid"].join(""),
      ["mail", "gun"].join(""),
      ["create", "Transport"].join(""),
      [".send", "mail"].join(""),
      [".se", "nd("].join("")
    ].forEach((term) => {
      if (sourceText.includes(term.toLowerCase())) sourceHits.push(`${path.relative(projectRoot, filePath)} contains ${term}`);
    });
  });
  check(checks, "no external email sending code exists", sourceHits.length === 0, sourceHits.join("; "));

  const failed = checks.filter((item) => !item.passed);
  const report = `# MarketOps Email Prep QA v0.1

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
  console.log(failed.length ? "EMAIL PREP QA FAIL" : "EMAIL PREP QA PASS");
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
  runEmailPrepQa();
}

module.exports = { runEmailPrepQa };
