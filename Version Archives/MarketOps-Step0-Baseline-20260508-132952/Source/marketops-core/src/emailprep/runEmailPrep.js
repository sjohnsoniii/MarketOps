const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const docsRoot = path.join(projectRoot, "Docs", "Email");
const queueRoot = path.join(projectRoot, "Data", "email-queue");
const escalationRoot = path.join(projectRoot, "Reports", "Escalations");
const overnightRoot = path.join(projectRoot, "Reports", "Overnight");
const queuePath = path.join(queueRoot, "email-queue-latest.json");
const escalationItemsPath = path.join(escalationRoot, "escalation-items-latest.json");
const reportPath = path.join(overnightRoot, "marketops-supercruise-reporting-emailprep-v0.1.md");
const checklistPath = path.join(overnightRoot, "marketops-next-morning-review-checklist-v0.1.md");
const approvalQueuePath = path.join(projectRoot, "Data", "approvals", "approval-queue-latest.json");
const step0ReportPath = path.join(projectRoot, "Reports", "Step0", "marketops-step0-final-promotion-report-v0.1.md");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function stampForFile(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function templateBody(type, title, body) {
  return `# ${title}

Type: ${type}

Status: DRAFT ONLY

No email sending is enabled. This template is for future manual review only.

${body}

Safety:

- No SMTP/API credentials.
- No automatic sending.
- No external transmission.
- Human review required.
`;
}

function runEmailPrep() {
  const now = new Date();
  const generatedAt = now.toISOString();
  const stamp = stampForFile(now);
  const timestampedQueuePath = path.join(queueRoot, `email-queue-${stamp}.json`);
  const approvalQueue = readJson(approvalQueuePath, { items: [] });
  const pendingApprovals = (approvalQueue.items || []).filter((item) => item.status === "PENDING_REVIEW").length;
  const step0Ready = fs.existsSync(step0ReportPath);
  const templates = [
    ["morning_summary", "MarketOps Supercruise Morning Summary", "Summarize completed work, QA status, approval items, blockers, and next local run."],
    ["blocked_task", "MarketOps Blocked Task Notice", "Explain the blocked action, why it is blocked, and the safest next human action."],
    ["approval_needed", "MarketOps Approval Needed", "List review queue items needing YES / NO / NEEDS EDIT / HOLD / ESCALATE decisions."],
    ["step0_complete", "MarketOps Step 0 Complete", "Summarize final Step 0 readiness and recommended Step 1 preparation."],
    ["qa_failure", "MarketOps QA Failure", "Summarize failed checks, affected subsystem, and safe retry command."]
  ];

  const drafts = templates.map(([type, subject, body], index) => {
    const bodyPath = path.join(docsRoot, `${type}-email-template-v0.1.md`);
    writeText(bodyPath, templateBody(type, subject, body));
    return {
      id: `email-draft-${String(index + 1).padStart(3, "0")}`,
      type,
      subject,
      bodyPath: path.relative(projectRoot, bodyPath).replace(/\\/g, "/"),
      status: "DRAFT_ONLY",
      sendAllowed: false,
      reason: "Step 0 does not enable email sending."
    };
  });

  const queue = {
    schemaVersion: "0.1",
    mode: "local_email_draft_only",
    generatedAt,
    autoSendEnabled: false,
    sendAllowed: false,
    smtpConfigured: false,
    apiConfigured: false,
    credentialsRequired: false,
    drafts
  };

  const escalationItems = [
    {
      id: "escalation-human-approval-needed-001",
      type: "human_approval_needed",
      title: "Approval queue contains local review items",
      summary: `${pendingApprovals} approval item(s) are pending human review.`,
      status: pendingApprovals > 0 ? "OPEN_LOCAL_REVIEW" : "NO_ACTION_NEEDED",
      sourcePath: "Data/approvals/approval-queue-latest.json",
      recommendedAction: "Open the admin review console and decide YES / NO / NEEDS_EDIT / HOLD / ESCALATE locally.",
      emailDraftOnly: true,
      sendAllowed: false
    },
    {
      id: "escalation-step0-promotion-ready-001",
      type: "step0_promotion_ready",
      title: "Step 0 promotion readiness available",
      summary: step0Ready ? "Step 0 promotion report exists for human review." : "Step 0 promotion report was not found during this email prep pass.",
      status: step0Ready ? "OPEN_LOCAL_REVIEW" : "WAITING_FOR_REPORT",
      sourcePath: "Reports/Step0/marketops-step0-final-promotion-report-v0.1.md",
      recommendedAction: "Review Step 0 completion status before planning Step 1.",
      emailDraftOnly: true,
      sendAllowed: false
    },
    {
      id: "escalation-external-integration-needed-001",
      type: "external_integration_needed",
      title: "Future email integration remains gated",
      summary: "Verified sender, recipient, authentication, privacy review, limits, and content rules are required before email sending can exist.",
      status: "FUTURE_APPROVAL_REQUIRED",
      sourcePath: "Docs/Email",
      recommendedAction: "Do not add email sending until a later explicit integration task approves it.",
      emailDraftOnly: true,
      sendAllowed: false
    }
  ];

  writeJson(queuePath, queue);
  writeJson(timestampedQueuePath, queue);
  writeJson(escalationItemsPath, {
    schemaVersion: "0.1",
    mode: "local_escalation_review_only",
    generatedAt,
    autoSendEnabled: false,
    sendAllowed: false,
    escalationTypes: [
      "permission_block",
      "qa_failure",
      "thermal_warning",
      "missing_credential",
      "external_integration_needed",
      "human_approval_needed",
      "step0_promotion_ready"
    ],
    items: escalationItems
  });
  writeText(path.join(escalationRoot, "marketops-escalation-types-v0.1.md"), `# MarketOps Escalation Types v0.1

Generated: ${generatedAt}

- permission_block
- qa_failure
- thermal_warning
- missing_credential
- external_integration_needed
- human_approval_needed
- step0_promotion_ready

No automatic email, SMS, or external notification is enabled.

## Current Local Escalation Items

${escalationItems.map((item) => `- ${item.type}: ${item.title}. Status: ${item.status}. Send allowed: ${item.sendAllowed}.`).join("\n")}
`);
  writeText(checklistPath, `# MarketOps Next Morning Review Checklist v0.1

## First Look

- Open the approval queue.
- Open the admin review console.
- Review latest QA reports.
- Review Step 0 gap report.
- Check scheduled task observation status.

## Review Decisions

- YES_APPROVE means later manual/gated use only.
- NO_REJECT means keep local archive only.
- NEEDS_EDIT means return to local desk for revision.
- HOLD means do nothing yet.
- ESCALATE means user attention required.

## Safety Check

- No live trading.
- No broker/API connection.
- No social posting.
- No email sending.
- No push/deploy.
`);
  writeText(reportPath, `# MarketOps Reporting + Email Prep v0.1

Generated: ${generatedAt}

## Completed

- Created email template docs under Docs\\Email.
- Created local draft-only email queue under Data\\email-queue.
- Created timestamped local email queue: ${path.basename(timestampedQueuePath)}.
- Created escalation type report under Reports\\Escalations.
- Created local escalation items under Reports\\Escalations / Data\\email-queue context.
- Created next morning review checklist under Reports\\Overnight.

## Email Queue Status

- autoSendEnabled: false
- sendAllowed: false
- smtpConfigured: false
- apiConfigured: false
- Drafts: ${drafts.length}
- Local escalation items: ${escalationItems.length}
- Pending approval items observed: ${pendingApprovals}

## Safety

No email sending, SMTP credentials, API credentials, external transmission, SMS, external notification, social posting, broker connection, or live trading behavior was added.
`);

  console.log("MarketOps email prep generated");
  console.log(`drafts: ${drafts.length}`);
  console.log(`escalation items: ${escalationItems.length}`);
  console.log(`queue: ${queuePath}`);
  console.log(`timestamped queue: ${timestampedQueuePath}`);
  console.log(`escalations: ${escalationItemsPath}`);
  console.log(`report: ${reportPath}`);
  return { queue, queuePath, timestampedQueuePath, escalationItemsPath, reportPath };
}

if (require.main === module) {
  try {
    runEmailPrep();
  } catch (error) {
    console.error(`emailprep:build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runEmailPrep, queuePath, escalationItemsPath, reportPath, checklistPath };
