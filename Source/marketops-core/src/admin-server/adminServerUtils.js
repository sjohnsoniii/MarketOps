const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");

const paths = {
  coreRoot,
  projectRoot,
  approvalsLatest: path.join(projectRoot, "Data", "approvals", "approval-queue-latest.json"),
  reviewState: path.join(projectRoot, "Data", "approvals", "admin-review-state-v0.1.json"),
  socialPreviews: path.join(projectRoot, "Data", "social-previews", "social-preview-sandbox-v0.1.json"),
  igXPrep: path.join(projectRoot, "Data", "social-previews", "ig-x-publishing-prep-v0.1.json"),
  igXHype: path.join(projectRoot, "Data", "social-previews", "ig-x-hype-post-previews-v0.1.json"),
  signalPreviews: path.join(projectRoot, "Data", "signal-previews", "synthetic-signal-previews-v0.1.json"),
  alternateSignals: path.join(projectRoot, "Data", "signals", "synthetic-signal-previews-v0.1.json"),
  reportIndex: path.join(projectRoot, "Reports", "marketops-report-index-v0.1.md"),
  logsRoot: path.join(projectRoot, "Data", "logs"),
  step0Final: path.join(projectRoot, "Reports", "Step0", "marketops-step0-final-promotion-report-v0.1.md"),
  automationReport: path.join(projectRoot, "Reports", "Automation", "marketops-automation-readiness-v0.1.md"),
  serverReport: path.join(projectRoot, "Reports", "Admin", "marketops-private-admin-server-v0.1.md"),
  completionReport: path.join(projectRoot, "Reports", "Admin", "marketops-admin-console-completion-v0.2.md"),
  approvalDecisionsLatest: path.join(projectRoot, "Data", "approvals", "approval-decisions-latest.json"),
  approvalAuditLog: path.join(projectRoot, "Data", "approvals", "approval-audit-log.json"),
  humanInputTemplate: path.join(projectRoot, "Config", "marketops-human-input-needed.template.json"),
  humanInputLatest: path.join(projectRoot, "Data", "human-input-needed-latest.json"),
  publicDashboardBundle: path.join(projectRoot, "..", "sj3labs", "data", "marketops", "dashboard-bundle-public-v0.4.json"),
  publicDashboardCadenceReport: path.join(projectRoot, "Reports", "Dashboard", "marketops-public-dashboard-refresh-cadence-v0.1.md")
};

const allowedDecisions = ["YES_APPROVE", "NO_REJECT", "NEEDS_EDIT", "HOLD", "ESCALATE"];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function relativeProjectPath(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function getLatestFiles(dirPath, limit = 6) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const fullPath = path.join(dirPath, entry.name);
      const stat = fs.statSync(fullPath);
      return {
        name: entry.name,
        path: relativeProjectPath(fullPath),
        updatedAt: stat.mtime.toISOString(),
        size: stat.size
      };
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit);
}

function getReviewState() {
  return readJson(paths.reviewState, {
    schemaVersion: "0.1",
    mode: "local_admin_review_state",
    generatedAt: new Date().toISOString(),
    externalSendingEnabled: false,
    autoApprovalEnabled: false,
    publishAllowed: false,
    decisions: {}
  });
}

function getDecisionBundle() {
  return readJson(paths.approvalDecisionsLatest, {
    schemaVersion: "0.1",
    mode: "local_admin_approval_decisions",
    generatedAt: new Date().toISOString(),
    localOnly: true,
    externalSendingEnabled: false,
    autoApprovalEnabled: false,
    publishAllowed: false,
    decisions: []
  });
}

function getAuditLog() {
  return readJson(paths.approvalAuditLog, {
    schemaVersion: "0.1",
    mode: "local_admin_approval_audit",
    generatedAt: new Date().toISOString(),
    localOnly: true,
    externalSendingEnabled: false,
    entries: []
  });
}

function saveReviewState(state) {
  writeJson(paths.reviewState, {
    ...state,
    updatedAt: new Date().toISOString(),
    externalSendingEnabled: false,
    autoApprovalEnabled: false,
    publishAllowed: false
  });
}

function saveDecisionArtifacts(state, entry) {
  const decisions = Object.values(state.decisions || {}).sort((a, b) => String(a.decidedAt).localeCompare(String(b.decidedAt)));
  writeJson(paths.approvalDecisionsLatest, {
    ...getDecisionBundle(),
    updatedAt: new Date().toISOString(),
    localOnly: true,
    externalSendingEnabled: false,
    autoApprovalEnabled: false,
    publishAllowed: false,
    decisions
  });

  const audit = getAuditLog();
  audit.entries.push(entry);
  writeJson(paths.approvalAuditLog, {
    ...audit,
    updatedAt: new Date().toISOString(),
    localOnly: true,
    externalSendingEnabled: false,
    entries: audit.entries.slice(-500)
  });
}

function operatorStatus(decision, item) {
  if (decision === "YES_APPROVE" && ["x", "instagram"].includes(item.platform)) return "approved_for_manual_post";
  if (decision === "YES_APPROVE") return "approved_for_api_later";
  if (decision === "NO_REJECT") return "rejected";
  if (decision === "NEEDS_EDIT") return "needs_edit";
  if (decision === "HOLD") return "hold";
  if (decision === "ESCALATE") return "escalate";
  return "draft_only";
}

function buildApprovalItems() {
  const queue = readJson(paths.approvalsLatest, { items: [], statusCounts: {} });
  const state = getReviewState();
  return (queue.items || []).map((item) => {
    const decision = state.decisions[item.id] || {};
    return {
      ...item,
      localDecision: decision.decision || null,
      localStatus: operatorStatus(decision.decision, item),
      decidedAt: decision.decidedAt || null,
      localReviewNotes: decision.reviewNotes || ""
    };
  });
}

function buildSocialItems() {
  const social = readJson(paths.socialPreviews, { previews: [] });
  const prep = readJson(paths.igXPrep, { platforms: [], deferredPlatforms: [] });
  const hype = readJson(paths.igXHype, { items: [] });
  return {
    previews: social.previews || [],
    igX: prep.platforms || [],
    hype: hype.items || [],
    deferred: prep.deferredPlatforms || social.deferred || []
  };
}

function buildSignalItems() {
  const filePath = fs.existsSync(paths.signalPreviews) ? paths.signalPreviews : paths.alternateSignals;
  const signals = readJson(filePath, { previews: [] });
  return {
    sourcePath: relativeProjectPath(filePath),
    previews: signals.previews || signals.signals || []
  };
}

function buildSystemStatus(authStatus) {
  const step0 = readText(paths.step0Final);
  const automation = readText(paths.automationReport);
  const approvalItems = buildApprovalItems();
  return {
    mode: "paper_simulation",
    localOnly: true,
    serverPurpose: "private_admin_review",
    step0Status: step0.includes("STEP0_COMPLETE_READY_FOR_STEP1_FAKE_REALTIME_DATA_SETUP")
      ? "STEP0_COMPLETE_READY_FOR_STEP1_FAKE_REALTIME_DATA_SETUP"
      : "CHECK_STEP0_REPORT",
    qaStatusSummary: {
      approvalItems: approvalItems.length,
      pendingItems: approvalItems.filter((item) => !item.localDecision).length,
      localDecisions: approvalItems.filter((item) => item.localDecision).length,
      signalPreviews: buildSignalItems().previews.length,
      socialPreviews: buildSocialItems().previews.length,
      hypePreviews: buildSocialItems().hype.length
    },
    scheduledTaskHeartbeat: {
      source: relativeProjectPath(paths.automationReport),
      paperInstalledApproved: automation.includes('"paper":"installed_approved"') || automation.includes("paper runner"),
      officeInstalledApproved: automation.includes('"office":"installed_approved"') || automation.includes("office")
    },
    latestLogs: getLatestFiles(paths.logsRoot),
    auth: authStatus
  };
}

function buildReportSummaries() {
  const reports = [
    paths.step0Final,
    paths.automationReport,
    paths.serverReport,
    path.join(projectRoot, "Reports", "Social", "marketops-ig-x-hype-post-previews-v0.1.md"),
    path.join(projectRoot, "Reports", "Signals", "marketops-signal-sandbox-v0.1.md"),
    path.join(projectRoot, "Reports", "Approvals", "marketops-approval-queue-v0.1.md")
  ];
  return reports.filter((filePath) => fs.existsSync(filePath)).map((filePath) => {
    const stat = fs.statSync(filePath);
    const text = readText(filePath).split(/\r?\n/).filter(Boolean).slice(0, 6).join(" ");
    return {
      title: path.basename(filePath, ".md"),
      path: relativeProjectPath(filePath),
      updatedAt: stat.mtime.toISOString(),
      summary: text.slice(0, 280)
    };
  });
}

function buildHumanInputItems() {
  return readJson(paths.humanInputLatest, { items: [] }).items || [];
}

function buildPublicDashboardPublishPrep() {
  const bundle = readJson(paths.publicDashboardBundle, null);
  return {
    sourcePath: relativeProjectPath(paths.publicDashboardBundle),
    cadenceReportPath: relativeProjectPath(paths.publicDashboardCadenceReport),
    exists: Boolean(bundle),
    latestSanitizedBundleTimestamp: bundle ? bundle.latestPublicRefreshAt || bundle.generatedAt : null,
    safetyQaStatus: bundle && bundle.paperOnly === true && bundle.fakeMoney === true && bundle.notFinancialAdvice === true ? "PASS_READY_FOR_REVIEW" : "CHECK_REQUIRED",
    publicPublishRecommended: false,
    recommendation: "Prepare local sanitized bundle now; manual commit/push/deploy approval is still required before public publishing.",
    whatChangedSincePreviousBundle: bundle && bundle.buildInPublic ? bundle.buildInPublic.whatChangedSinceLastUpdate : [],
    localOnlyActions: ["APPROVE_FOR_MANUAL_PUBLIC_SYNC", "HOLD_PUBLIC_SYNC", "NEEDS_COPY_REVIEW", "NEEDS_SAFETY_REVIEW"]
  };
}

function buildBootstrap(authStatus) {
  return {
    generatedAt: new Date().toISOString(),
    externalSendingEnabled: false,
    apiPostingEnabled: false,
    liveTradingEnabled: false,
    emailSendingEnabled: false,
    smsSendingEnabled: false,
    publicExposureEnabled: false,
    systemStatus: buildSystemStatus(authStatus),
    approvalItems: buildApprovalItems(),
    social: buildSocialItems(),
    signals: buildSignalItems(),
    reports: buildReportSummaries(),
    humanInput: buildHumanInputItems(),
    publicDashboardPublishPrep: buildPublicDashboardPublishPrep(),
    reportIndex: {
      path: relativeProjectPath(paths.reportIndex),
      exists: fs.existsSync(paths.reportIndex)
    },
    allowedDecisions
  };
}

function applyDecision({ id, decision, reviewNotes = "" }) {
  if (!id) throw new Error("Missing review item id.");
  if (!allowedDecisions.includes(decision)) throw new Error(`Unsupported decision: ${decision}`);
  const items = buildApprovalItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown review item id: ${id}`);

  const state = getReviewState();
  const entry = {
    id,
    title: item.title,
    type: item.type,
    platform: item.platform || null,
    decision,
    operatorStatus: operatorStatus(decision, item),
    reviewNotes,
    decidedAt: new Date().toISOString(),
    localOnly: true,
    publishAllowed: false,
    externalSendingEnabled: false,
    effect: decision === "YES_APPROVE"
      ? "Approved for later manual/gated use only. No posting, sending, trading, email, signal, publish, or deploy action occurred."
      : "Local review-state update only. No external action occurred."
  };
  state.decisions[id] = entry;
  saveReviewState(state);
  saveDecisionArtifacts(state, entry);
  return state.decisions[id];
}

function writeReport() {
  const generatedAt = new Date().toISOString();
  const report = `# MarketOps Private Admin Server v0.1

Generated: ${generatedAt}

## Server

- Local URL: http://localhost:3131
- Default host binding: 127.0.0.1 / localhost only
- Default port: 3131
- Future private-network access: Tailscale device access after a separate review

## Auth Behavior

- Reads MARKETOPS_ADMIN_PIN or ADMIN_PIN from local environment or .env.local.
- Does not print secrets.
- If no PIN exists, localhost-only development mode is allowed with a visible warning.
- Non-localhost access requires a PIN.

## Data Sources

- Data\\approvals\\approval-queue-latest.json
- Data\\approvals\\admin-review-state-v0.1.json
- Data\\social-previews\\social-preview-sandbox-v0.1.json
- Data\\social-previews\\ig-x-publishing-prep-v0.1.json
- Data\\signal-previews\\synthetic-signal-previews-v0.1.json
- Reports\\marketops-report-index-v0.1.md
- Data\\logs

## Review Buttons

YES, NO, NEEDS EDIT, HOLD, and ESCALATE update local review-state JSON only. They do not post, send, publish, email, signal, trade, deploy, call APIs, or connect to brokers.

## IG/X Manual-Post Readiness

IG and X drafts can be marked approved_for_manual_post inside local review state. The server shows copy/paste captions, links, image prompts, and paper-money / not-financial-advice disclosure checks. API posting remains disabled.

## Disabled Features

- Public internet exposure
- Social platform API posting
- TikTok/YouTube posting
- LinkedIn/Facebook posting
- Email/SMS sending
- Broker/live trading
- Payment/subscription logic
- External API calls

## Next Recommended Pass

Use the localhost server for manual review. Add Tailscale reachability only after confirming device ACLs, admin PIN configuration, and a fresh safety check.`;
  writeJson(path.join(projectRoot, "Data", "approvals", "admin-server-report-marker.json"), {
    generatedAt,
    localOnly: true,
    externalSendingEnabled: false
  });
  ensureDir(path.dirname(paths.serverReport));
  fs.writeFileSync(paths.serverReport, report.trim() + "\n", "utf8");
  return paths.serverReport;
}

function writeCompletionReport() {
  const generatedAt = new Date().toISOString();
  const bootstrap = buildBootstrap({ warning: "Report generation context", pinConfigured: false, localRequest: true, localhostBinding: true });
  const report = `# MarketOps Admin Console Completion v0.2

Generated: ${generatedAt}

## Completion Status

ADMIN_CONSOLE_SANDBOX_APPROVAL_SYSTEM_READY

## Complete

- Private localhost admin server exists.
- Approval queue loads in browser.
- Local decision buttons write review-state JSON only.
- Approval decisions bundle and audit log paths are configured.
- IG/X draft previews and hype-post previews are generated locally.
- Signal previews are visible as research-only cards.
- Report summaries and human-input items are surfaced.
- Media prompt/resource gaps are documented.

## Partial

- Tailscale access is documented only; localhost remains the default binding.
- Media generation is prompts/layouts only; no local image/video rendering pipeline is connected.
- IG/X posting is manual-copy/paste prep only; API posting remains disabled.

## Counts

- Approval items: ${bootstrap.approvalItems.length}
- Social previews: ${bootstrap.social.previews.length}
- IG/X hype previews: ${bootstrap.social.hype.length}
- Signal previews: ${bootstrap.signals.previews.length}
- Report summaries: ${bootstrap.reports.length}
- Human-input items: ${bootstrap.humanInput.length}

## Admin Console URL

http://localhost:3131

## Start / Stop

Start: npm run admin:serve

Stop: Ctrl+C in the terminal running the server.

## Saved Decisions

- Data\\approvals\\admin-review-state-v0.1.json
- Data\\approvals\\approval-decisions-latest.json
- Data\\approvals\\approval-audit-log.json

## Safety

No external send/post/API/trade/deploy behavior is implemented. All approval decisions are local review guidance only.`;
  ensureDir(path.dirname(paths.completionReport));
  fs.writeFileSync(paths.completionReport, report.trim() + "\n", "utf8");
  return paths.completionReport;
}

module.exports = {
  paths,
  allowedDecisions,
  buildBootstrap,
  applyDecision,
  getReviewState,
  writeReport,
  writeCompletionReport,
  relativeProjectPath
};
