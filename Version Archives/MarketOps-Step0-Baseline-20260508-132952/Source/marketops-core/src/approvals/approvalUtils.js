const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const approvalsRoot = path.join(projectRoot, "Data", "approvals");
const reportsRoot = path.join(projectRoot, "Reports", "Approvals");
const adminRoot = path.join(projectRoot, "Admin", "review-console");

const paths = {
  projectRoot,
  approvalsRoot,
  reportsRoot,
  adminRoot,
  contentQueue: path.join(projectRoot, "Data", "content", "queue", "content-queue-v0.1.json"),
  socialPack: path.join(projectRoot, "Data", "content", "social", "social-pack-v0.1.json"),
  socialPreviews: path.join(projectRoot, "Data", "social-previews", "social-preview-sandbox-v0.1.json"),
  signalPreviews: path.join(projectRoot, "Data", "signal-previews", "synthetic-signal-previews-v0.1.json"),
  agentSummary: path.join(projectRoot, "Data", "agent-reviews", "latest-agent-review-summary.json"),
  dashboardReport: path.join(projectRoot, "Reports", "Dashboard", "marketops-dashboard-public-safe-v0.1.md"),
  analyticsReport: path.join(projectRoot, "Reports", "Analytics", "marketops-metrics-performance-analytics-v0.1.md"),
  signalReport: path.join(projectRoot, "Reports", "Signals", "marketops-signal-desk-architecture-v0.1.md"),
  approvalLatest: path.join(approvalsRoot, "approval-queue-latest.json"),
  reviewBundleLatest: path.join(approvalsRoot, "review-console-bundle-latest.json"),
  reviewBundleJs: path.join(adminRoot, "review-console-bundle-latest.js"),
  approvalReport: path.join(reportsRoot, "marketops-approval-queue-v0.1.md")
};

const defaultSafetyLabels = [
  "paper_simulation",
  "fake_money",
  "not_financial_advice",
  "sandbox_only",
  "human_review_required",
  "no_external_send",
  "no_live_execution",
  "draft_only",
  "not_public_yet"
];

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

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

function stampForFile(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function relativeProjectPath(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

function approvalItem({
  id,
  createdAt,
  type,
  platform = null,
  title,
  summary,
  sourcePath,
  previewPath = sourcePath,
  riskLevel = "low",
  approvalQuestion,
  recommendedAction = "NEEDS_REVIEW",
  safetyLabels = defaultSafetyLabels,
  yesEffect = "Mark approved for later manual review use only. Does not post, send, trade, email, or publish automatically.",
  noEffect = "Mark rejected and keep local archive only.",
  needsEditEffect = "Route back to the relevant MarketOps desk for a local revision.",
  blockedReason = null
}) {
  return {
    id,
    createdAt,
    type,
    platform,
    title,
    summary,
    sourcePath,
    previewPath,
    riskLevel,
    safetyLabels,
    approvalQuestion,
    recommendedAction,
    status: "PENDING_REVIEW",
    yesEffect,
    noEffect,
    needsEditEffect,
    reviewNotes: "",
    blockedReason
  };
}

function mapContentType(type, platform) {
  if (platform === "x") return "x_post";
  if (platform === "instagram") return "instagram_post";
  if (type === "faceless_video_script") return "short_video_script";
  if (type === "avatar_presenter_script") return "avatar_script";
  if (type === "blog_report") return "blog_draft";
  if (type === "case_study") return "report_summary";
  return type || "report_summary";
}

function buildApprovalItems(generatedAt) {
  const items = [];
  const contentQueue = readJson(paths.contentQueue, { items: [] });
  const signalPreviews = readJson(paths.signalPreviews, { previews: [] });
  const socialPreviews = readJson(paths.socialPreviews, { previews: [] });
  const agentSummary = readJson(paths.agentSummary, {});

  (contentQueue.items || []).forEach((item, index) => {
    items.push(approvalItem({
      id: `approval-content-${String(index + 1).padStart(3, "0")}`,
      createdAt: generatedAt,
      type: mapContentType(item.type, item.platform),
      platform: item.platform || null,
      title: item.title,
      summary: item.notes || "Review local draft before any future manual use.",
      sourcePath: item.path,
      riskLevel: item.platform ? "medium" : "low",
      approvalQuestion: `Approve "${item.title}" for later manual use?`
    }));
  });

  (signalPreviews.previews || []).forEach((preview, index) => {
    items.push(approvalItem({
      id: `approval-signal-${String(index + 1).padStart(3, "0")}`,
      createdAt: generatedAt,
      type: "signal_preview",
      title: preview.title,
      summary: `${preview.classification}: ${preview.researchSummary}`,
      sourcePath: "Data/signal-previews/synthetic-signal-previews-v0.1.json",
      riskLevel: preview.riskLabel && preview.riskLabel.includes("elevated") ? "medium" : "low",
      approvalQuestion: `Approve this ${preview.classification} item for local research archive only?`,
      yesEffect: "Mark approved for internal research archive only. Does not send alerts, publish, trade, or notify anyone."
    }));
  });

  (socialPreviews.previews || []).forEach((preview, index) => {
    const type = preview.platform === "x"
      ? "x_post"
      : preview.platform === "instagram"
        ? "instagram_post"
        : preview.contentType && preview.contentType.includes("video")
          ? "short_video_script"
          : "social_post";
    items.push(approvalItem({
      id: `approval-social-preview-${String(index + 1).padStart(3, "0")}`,
      createdAt: generatedAt,
      type,
      platform: preview.platform,
      title: preview.title,
      summary: preview.draftText,
      sourcePath: "Data/social-previews/social-preview-sandbox-v0.1.json",
      riskLevel: preview.phase === "active_preview" ? "medium" : "low",
      approvalQuestion: preview.approvalQuestion || `Review ${preview.platform} preview?`,
      yesEffect: "Mark approved for later manual review use only. Does not post or publish automatically."
    }));
  });

  if (agentSummary.proposalCount) {
    items.push(approvalItem({
      id: "approval-agent-improvement-digest-001",
      createdAt: generatedAt,
      type: "agent_improvement_proposal",
      title: "Review agent improvement proposal digest",
      summary: `${agentSummary.proposalCount} agent proposals are deferred to the ${agentSummary.reviewCadence || "biweekly_digest"} cadence.`,
      sourcePath: "Data/agent-reviews/improvement-backlog-v0.1.md",
      riskLevel: agentSummary.urgentItemsCount > 0 ? "high" : "medium",
      approvalQuestion: "Review the agent improvement backlog for possible future experiments?",
      yesEffect: "Mark reviewed for planning only. Does not auto-apply agent proposals."
    }));
  }

  [
    ["approval-report-dashboard-001", "Dashboard infrastructure report", paths.dashboardReport],
    ["approval-report-analytics-001", "Analytics report", paths.analyticsReport],
    ["approval-report-signal-desk-001", "Signal Desk architecture report", paths.signalReport]
  ].forEach(([id, title, filePath]) => {
    if (!fs.existsSync(filePath)) return;
    items.push(approvalItem({
      id,
      createdAt: generatedAt,
      type: "report_summary",
      title,
      summary: "Review local report summary for Step 0 readiness context.",
      sourcePath: relativeProjectPath(filePath),
      riskLevel: "low",
      approvalQuestion: `Mark "${title}" reviewed for Step 0?`
    }));
  });

  return items;
}

function buildQueue() {
  const generatedAt = new Date().toISOString();
  const stamp = stampForFile(new Date(generatedAt));
  const items = buildApprovalItems(generatedAt).map((item, index) => ({
    ...item,
    id: `approval-${stamp}-${String(index + 1).padStart(3, "0")}`
  }));
  return {
    schemaVersion: "0.1",
    mode: "supercruise_local_only",
    generatedAt,
    externalSendingEnabled: false,
    autoApprovalEnabled: false,
    publishAllowed: false,
    supportedActions: ["YES_APPROVE", "NO_REJECT", "NEEDS_EDIT", "HOLD", "ESCALATE"],
    statusCounts: {
      PENDING_REVIEW: items.filter((item) => item.status === "PENDING_REVIEW").length,
      YES_APPROVE: 0,
      NO_REJECT: 0,
      NEEDS_EDIT: 0,
      HOLD: 0,
      ESCALATE: 0
    },
    items
  };
}

function buildReviewBundle(queue) {
  return {
    generatedAt: queue.generatedAt,
    mode: queue.mode,
    localOnly: true,
    noExternalSending: true,
    noPublishing: true,
    noTrading: true,
    totalItems: queue.items.length,
    statusCounts: queue.statusCounts,
    items: queue.items.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      type: item.type,
      platform: item.platform,
      title: item.title,
      summary: item.summary,
      sourcePath: item.sourcePath,
      previewPath: item.previewPath,
      riskLevel: item.riskLevel,
      safetyLabels: item.safetyLabels,
      approvalQuestion: item.approvalQuestion,
      recommendedAction: item.recommendedAction,
      status: item.status,
      reviewNotes: item.reviewNotes,
      yesEffect: item.yesEffect,
      noEffect: item.noEffect,
      needsEditEffect: item.needsEditEffect,
      blockedReason: item.blockedReason
    }))
  };
}

function buildApprovalReport(queue) {
  const typeCounts = queue.items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  const typeRows = Object.entries(typeCounts).map(([type, count]) => `| ${type} | ${count} |`).join("\n");
  return `# MarketOps Approval Queue v0.1

Generated: ${queue.generatedAt}

## Safety

- Mode: ${queue.mode}
- External sending enabled: ${queue.externalSendingEnabled}
- Auto approval enabled: ${queue.autoApprovalEnabled}
- Publish allowed: ${queue.publishAllowed}

## Queue Summary

- Total items: ${queue.items.length}
- Pending review: ${queue.statusCounts.PENDING_REVIEW}

## Item Types

| Type | Count |
|---|---:|
${typeRows}

## Review Actions

YES means approved for later manual/local gated use only. It does not post, trade, email, signal, deploy, or publish.

Available actions:

${queue.supportedActions.map((action) => `- ${action}`).join("\n")}
`;
}

function writeApprovalOutputs() {
  const queue = buildQueue();
  const stamp = stampForFile(new Date(queue.generatedAt));
  const timestampedPath = path.join(approvalsRoot, `approval-queue-${stamp}.json`);
  const bundle = buildReviewBundle(queue);

  writeJson(paths.approvalLatest, queue);
  writeJson(timestampedPath, queue);
  writeJson(paths.reviewBundleLatest, bundle);
  writeText(paths.reviewBundleJs, `window.MARKETOPS_REVIEW_BUNDLE = ${JSON.stringify(bundle, null, 2)};`);
  writeText(paths.approvalReport, buildApprovalReport(queue));

  return { queue, bundle, timestampedPath };
}

module.exports = {
  paths,
  defaultSafetyLabels,
  buildQueue,
  buildReviewBundle,
  buildApprovalReport,
  writeApprovalOutputs
};
