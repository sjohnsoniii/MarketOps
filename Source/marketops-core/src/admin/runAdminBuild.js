const fs = require("fs");
const path = require("path");
const { writeApprovalOutputs, paths } = require("../approvals/approvalUtils");

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value.trim() + "\n", "utf8");
}

const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MarketOps Supercruise Admin Review</title>
  <link rel="stylesheet" href="review-console.css">
</head>
<body>
  <main class="shell">
    <header class="hero">
      <p class="eyebrow">Local-only review console</p>
      <h1>MarketOps Supercruise Admin Review</h1>
      <p>This page reviews sandbox outputs only. It cannot post, send, email, trade, publish, call APIs, or connect to brokers.</p>
      <p class="generated">Generated: <span id="generatedAt">loading local bundle</span></p>
    </header>

    <section class="status-grid" id="statusGrid" aria-label="Review status summary"></section>

    <section class="filters" aria-label="Filters">
      <label>Type <select id="typeFilter"><option value="all">All</option></select></label>
      <label>Risk <select id="riskFilter"><option value="all">All</option></select></label>
      <label>Status <select id="statusFilter"><option value="all">All</option></select></label>
      <label>Platform <select id="platformFilter"><option value="all">All</option></select></label>
    </section>

    <section id="cards" class="cards" aria-label="Review items"></section>

    <section class="instructions">
      <h2>How to use this console</h2>
      <p>Review each item and record the decision later in the local approval queue. YES means approved for later manual/gated use only. It never means post now, trade now, email now, signal now, or deploy now.</p>
    </section>
  </main>
  <script src="review-console-bundle-latest.js"></script>
  <script src="review-console.js"></script>
</body>
</html>`;

const css = `:root {
  color-scheme: dark;
  --bg: #05080c;
  --panel: #101720;
  --panel-2: #151e29;
  --text: #e8edf2;
  --muted: #a7b0ba;
  --line: rgba(140, 160, 175, 0.22);
  --accent: #f05a3c;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: radial-gradient(circle at top right, rgba(240, 90, 60, 0.12), transparent 34%), var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0; }
.hero, .instructions, .card, .stat, .filters {
  background: linear-gradient(145deg, rgba(21, 30, 41, 0.94), rgba(10, 16, 24, 0.94));
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 18px 48px rgba(0,0,0,0.28);
}
.hero { padding: 28px; margin-bottom: 18px; }
.generated { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 0.82rem; }
.eyebrow { color: var(--accent); text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.76rem; margin: 0 0 8px; }
h1, h2, h3, p { margin-top: 0; }
p { color: var(--muted); line-height: 1.55; }
.status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 18px; }
.stat { padding: 16px; }
.stat strong { display: block; font-size: 1.8rem; }
.stat span { color: var(--muted); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.08em; }
.filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; padding: 16px; margin-bottom: 18px; }
label { color: var(--muted); font-size: 0.85rem; display: grid; gap: 6px; }
select { background: #080d12; color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 10px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
.card { padding: 18px; }
.meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.pill { border: 1px solid var(--line); color: var(--muted); padding: 4px 8px; border-radius: 999px; font-size: 0.75rem; }
.risk-medium { border-color: rgba(240,90,60,0.55); color: #ffb09f; }
.operator-status { border-color: rgba(240,90,60,0.4); color: #ffd2c8; }
.question { color: var(--text); font-weight: 650; }
.labels { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.label { background: rgba(240, 90, 60, 0.1); color: #ffb09f; padding: 4px 7px; border-radius: 6px; font-size: 0.72rem; }
.path { color: var(--muted); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 0.76rem; overflow-wrap: anywhere; }
.instructions { padding: 20px; margin-top: 18px; }
`;

const js = `const bundle = window.MARKETOPS_REVIEW_BUNDLE || { items: [], statusCounts: {} };
const cards = document.getElementById("cards");
const statusGrid = document.getElementById("statusGrid");
const generatedAt = document.getElementById("generatedAt");
const filters = {
  type: document.getElementById("typeFilter"),
  risk: document.getElementById("riskFilter"),
  status: document.getElementById("statusFilter"),
  platform: document.getElementById("platformFilter")
};

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function addOptions(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function renderStats() {
  const stats = [
    ["Total", bundle.totalItems || bundle.items.length],
    ["Pending", (bundle.statusCounts && bundle.statusCounts.PENDING_REVIEW) || 0],
    ["Approved", (bundle.statusCounts && bundle.statusCounts.YES_APPROVE) || 0],
    ["Rejected", (bundle.statusCounts && bundle.statusCounts.NO_REJECT) || 0],
    ["Needs Edit", (bundle.statusCounts && bundle.statusCounts.NEEDS_EDIT) || 0],
    ["Held", (bundle.statusCounts && bundle.statusCounts.HOLD) || 0],
    ["Escalated", (bundle.statusCounts && bundle.statusCounts.ESCALATE) || 0],
    ["External Send", bundle.noExternalSending ? "OFF" : "CHECK"]
  ];
  statusGrid.innerHTML = stats.map(([label, value]) => \`<article class="stat"><strong>\${value}</strong><span>\${label}</span></article>\`).join("");
}

function operatorStatus(item) {
  if (item.status === "YES_APPROVE" && ["x", "instagram"].includes(item.platform)) return "approved_for_manual_post";
  if (item.status === "YES_APPROVE") return "approved_for_api_later";
  if (item.status === "NO_REJECT") return "rejected";
  if (item.status === "NEEDS_EDIT") return "needs_edit";
  if (item.status === "HOLD") return "hold";
  return "draft_only";
}

function passes(item) {
  return (filters.type.value === "all" || item.type === filters.type.value)
    && (filters.risk.value === "all" || item.riskLevel === filters.risk.value)
    && (filters.status.value === "all" || item.status === filters.status.value)
    && (filters.platform.value === "all" || item.platform === filters.platform.value);
}

function renderCards() {
  const visible = bundle.items.filter(passes);
  cards.innerHTML = visible.map((item) => \`
    <article class="card">
      <div class="meta">
        <span class="pill">\${item.type}</span>
        \${item.platform ? \`<span class="pill">\${item.platform}</span>\` : ""}
        <span class="pill risk-\${item.riskLevel}">\${item.riskLevel}</span>
        <span class="pill">\${item.status}</span>
        <span class="pill operator-status">\${operatorStatus(item)}</span>
      </div>
      <h3>\${item.title}</h3>
      <p>\${item.summary}</p>
      <p><strong>Recommended action:</strong> \${item.recommendedAction}</p>
      <p class="question">\${item.approvalQuestion}</p>
      <p><strong>YES:</strong> \${item.yesEffect}</p>
      <p><strong>NO:</strong> \${item.noEffect}</p>
      <p><strong>NEEDS EDIT:</strong> \${item.needsEditEffect}</p>
      <p class="path"><strong>Source:</strong> \${item.sourcePath}</p>
      <p class="path"><strong>Preview:</strong> \${item.previewPath}</p>
      <p class="path"><strong>Created:</strong> \${item.createdAt}</p>
      <div class="labels">\${item.safetyLabels.map((label) => \`<span class="label">\${label}</span>\`).join("")}</div>
    </article>
  \`).join("") || "<p>No review items match the current filters.</p>";
}

addOptions(filters.type, unique(bundle.items.map((item) => item.type)));
addOptions(filters.risk, unique(bundle.items.map((item) => item.riskLevel)));
addOptions(filters.status, unique(bundle.items.map((item) => item.status)));
addOptions(filters.platform, unique(bundle.items.map((item) => item.platform)));
Object.values(filters).forEach((select) => select.addEventListener("change", renderCards));
generatedAt.textContent = bundle.generatedAt || "unknown";
renderStats();
renderCards();`;

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

function privateAdminPlan(generatedAt) {
  return `# MarketOps Private Admin Console Plan v0.1

Generated: ${generatedAt}

## Purpose

MarketOps needs a private operator console for reviewing local sandbox outputs, approval queues, social drafts, signal previews, reports, and video/avatar scripts. This console is not a public website and must never become an external posting, alerting, trading, email, or deployment surface.

## Why MAC Address Allowlisting Is Not The Right Internet Control

MAC addresses are link-local network identifiers. A browser request from an internet-hosted app does not reliably expose the visitor device MAC address to the server, and routers, VPNs, and cellular networks do not forward it as an application-level identity. MAC addresses can also be spoofed on local networks. For an internet-accessible admin console, device identity should come from authenticated private-network access, not MAC filtering.

## Recommended Access Path

### Phase 1: Localhost / Private Local Console

- Keep the console as static local files under Admin\\review-console.
- Open it directly on the operator machine or through a localhost-only static server.
- No public DNS, no public hosting, no external posting controls.

### Phase 2: Tailscale Private Access

- Put the MarketOps operator machine and approved devices on a private Tailnet.
- Serve the console only on a private Tailscale address or localhost forwarded through Tailscale.
- Use Tailscale device identity, user identity, ACLs, and device approval.
- Add the future Beast PC as a named approved device before it can reach the console.

### Phase 3: Cloudflare Access / WARP Later

- Consider Cloudflare Access only after the local and Tailscale phases are stable.
- Require identity provider login, device posture, and explicit allow policies.
- Keep the admin console private; do not convert it into a public route.

## Admin Auth Requirements

- Human login or private-network identity required before remote access is allowed.
- Device approval required for any new workstation.
- Approval actions remain local review guidance only.
- YES approval never means post now, send now, trade now, email now, publish now, or deploy now.

## No Public Exposure Rule

The admin console is private infrastructure. It must not be copied to sj3labs, deployed publicly, linked from public pages, or exposed without a private access layer and a fresh safety review.`;
}

function runAdminBuild() {
  writeApprovalOutputs();
  const generatedAt = new Date().toISOString();
  writeText(path.join(paths.adminRoot, "index.html"), indexHtml);
  writeText(path.join(paths.adminRoot, "review-console.css"), css);
  writeText(path.join(paths.adminRoot, "review-console.js"), js);
  const report = `# MarketOps Admin Review Console v0.1

Generated: ${generatedAt}

## Output

- Console: Admin\\review-console\\index.html
- CSS: Admin\\review-console\\review-console.css
- JS: Admin\\review-console\\review-console.js
- Bundle: Data\\approvals\\review-console-bundle-latest.json

## Supported Review Item Types

${supportedReviewTypes.map((type) => `- ${type}`).join("\n")}

## Supported Statuses

${supportedStatuses.map((status) => `- ${status}`).join("\n")}

## Operator Status Badges

${operatorStatusBadges.map((status) => `- ${status}`).join("\n")}

## Safety

The console is local-only and static. It does not post, send, email, trade, publish, call APIs, connect brokers, or use external services.

YES approval means later manual/gated use only. It never means post now, send now, email now, trade now, signal now, publish now, or deploy now.
`;
  writeText(path.join(paths.projectRoot, "Reports", "Admin", "marketops-admin-review-console-v0.1.md"), report);
  writeText(path.join(paths.projectRoot, "Reports", "Admin", "marketops-private-admin-console-plan-v0.1.md"), privateAdminPlan(generatedAt));
  console.log("MarketOps admin review console generated");
  console.log(`console: ${path.join(paths.adminRoot, "index.html")}`);
  console.log(`bundle: ${paths.reviewBundleLatest}`);
}

if (require.main === module) {
  try {
    runAdminBuild();
  } catch (error) {
    console.error(`admin:build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runAdminBuild };
