const path = require("path");

const { ensureDir, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

const previewRoot = path.join(paths.projectRoot, "Admin", "dashboard-preview");
const previewHtmlPath = path.join(previewRoot, "marketops-dashboard-preview-v0.1.html");
const previewReportPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-dashboard-preview-v0.1.md");
const localDashboardPath = path.join(paths.projectRoot, "Data", "dashboard", "dashboard-public-safe-v0.1.json");

function h(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function barRows(items, labelKey, valueKey) {
  const max = Math.max(1, ...items.map((item) => Math.abs(Number(item[valueKey] || 0))));
  return items.map((item) => {
    const value = Number(item[valueKey] || 0);
    const width = Math.max(4, Math.round((Math.abs(value) / max) * 100));
    return `<div class="bar-row"><span>${h(item[labelKey])}</span><div class="track"><div class="bar ${value < 0 ? "neg" : ""}" style="width:${width}%"></div></div><strong>${h(value)}</strong></div>`;
  }).join("");
}

function timelineRows(items) {
  return items.slice(-10).reverse().map((item) => (
    `<li><strong>${h(item.generatedAt)}</strong><span>Equity ${h(item.endingEquity)} / P&L ${h(item.paperPnl)} / Risk ${h(item.riskApproved)} approved, ${h(item.riskBlocked)} blocked / ${h(item.cadenceLabel)}</span></li>`
  )).join("");
}

function reasonRows(items) {
  return items.slice(0, 8).map((item) => (
    `<li><strong>${h(item.reason)}</strong><span>${h(item.count)} rejection(s)</span></li>`
  )).join("");
}

function candidateRows(items) {
  return items.slice(0, 8).map((item) => (
    `<li><strong>${h(item.symbol)}: ${h(item.status)}</strong><span>Confidence ${h(item.confidence)} / ${h(item.primaryBlockReason)} / ${h(item.wouldNeed)}</span></li>`
  )).join("");
}

function buildHtml(localBundle, publicBundle) {
  const perf = localBundle.dashboardCards.currentPaperPerformance;
  const freshness = localBundle.dashboardCards.marketDataFreshnessPanel;
  const movers = localBundle.charts.recentMarketMovementPanel || [];
  const equity = localBundle.charts.paperPnlSeries || [];
  const risks = localBundle.charts.signalRiskCounts || [];
  const warnings = localBundle.charts.staleDataWarningPanel || [];
  const directionCounts = localBundle.charts.vehicleDirectionCounts || [];
  const movementBuckets = localBundle.charts.movementBuckets || [];
  const rejectionReasons = localBundle.charts.riskRejectionReasons || publicBundle.riskRejectionReasons || [];
  const almostApproved = localBundle.charts.almostApprovedCandidates || publicBundle.almostApprovedCandidates || [];
  const cycle = localBundle.dashboardCards.paperCycleStatus || publicBundle.paperCycleStatus || {};
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MarketOps Dashboard Movement Preview</title>
  <style>
    :root { color-scheme: dark; --bg:#080b0f; --panel:#121920; --panel2:#17222c; --line:rgba(170,185,200,.24); --text:#eef3f7; --muted:#aab6c2; --accent:#e85f3f; --ok:#64d28f; --warn:#f7be61; --bad:#f47b7b; }
    * { box-sizing:border-box; }
    body { margin:0; background:#080b0f; color:var(--text); font-family:Inter, ui-sans-serif, system-ui, Segoe UI, sans-serif; }
    main { width:min(1260px, calc(100% - 28px)); margin:0 auto; padding:24px 0 42px; }
    header,.panel { background:var(--panel); border:1px solid var(--line); border-radius:8px; padding:16px; margin-bottom:14px; }
    h1,h2,h3,p { margin-top:0; }
    p,li,span { color:var(--muted); line-height:1.45; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; }
    .metric { background:var(--panel2); border:1px solid var(--line); border-radius:8px; padding:14px; }
    .metric strong { display:block; font-size:1.4rem; color:var(--text); }
    .pill { display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:4px 8px; margin:0 5px 6px 0; color:var(--muted); font-size:.78rem; }
    .ok { color:var(--ok); border-color:rgba(100,210,143,.5); }
    .warn { color:var(--warn); border-color:rgba(247,190,97,.5); }
    .bar-row { display:grid; grid-template-columns:80px 1fr 70px; gap:10px; align-items:center; margin:8px 0; }
    .track { height:12px; background:#080d12; border:1px solid var(--line); border-radius:999px; overflow:hidden; }
    .bar { height:100%; background:var(--ok); }
    .bar.neg { background:var(--bad); }
    ul { padding-left:18px; }
    li { margin:8px 0; }
    li strong { display:block; color:var(--text); font-size:.88rem; }
    .path { font-family:ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap:anywhere; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>MarketOps Dashboard Movement Preview</h1>
      <p>Local paper-simulation preview using public-safe derived outputs. No broker execution, live trading, posting, email, SMS, deploy, or raw market-data publishing.</p>
      <span class="pill ok">paperOnly ${h(localBundle.paperOnly)}</span>
      <span class="pill ok">externalEffects ${h(localBundle.externalEffects)}</span>
      <span class="pill ok">publishAllowed ${h(localBundle.publishAllowed)}</span>
      <span class="pill">${h(localBundle.dataSource)}</span>
      <span class="pill">${h(localBundle.marketDataMode)}</span>
    </header>

    <section class="grid">
      <div class="metric"><strong>${h(perf.endingEquity)}</strong><span>Ending paper equity</span></div>
      <div class="metric"><strong>${h(perf.paperPnl)}</strong><span>Paper P&L</span></div>
      <div class="metric"><strong>${h(perf.paperReturnPct)}%</strong><span>Paper return</span></div>
      <div class="metric"><strong>${h(perf.maxDrawdownPct)}%</strong><span>Max drawdown</span></div>
      <div class="metric"><strong>${h(freshness.barsLoaded)}</strong><span>Market bars loaded</span></div>
      <div class="metric"><strong>${h(freshness.quotesLoaded)}</strong><span>Quotes loaded</span></div>
      <div class="metric"><strong>${h(cycle.currentBalance)}</strong><span>Cycle balance</span></div>
      <div class="metric"><strong>${h(cycle.daysSurvived)}</strong><span>Cycle days survived</span></div>
    </section>

    <section class="panel">
      <h2>Market Data Freshness</h2>
      <p>Feed ${h(freshness.feed)} / refreshed ${h(freshness.generatedAt)} / latest bar ${h(freshness.latestBarTimestamp)}.</p>
      <span class="pill">${h(freshness.refreshFreshnessLabel)}</span>
      <span class="pill">${h(freshness.latestBarFreshnessLabel)}</span>
      <span class="pill ok">rawMarketDataPublished false</span>
    </section>

    <section class="panel">
      <h2>$1,000 Paper Cycle</h2>
      <p>Cycle ${h(cycle.cycleId)} is ${h(cycle.status)}. It does not reset daily; it continues while balance remains above ${h(cycle.depletionThreshold || 0)}.</p>
      <span class="pill">Start ${h(cycle.cycleStartTimestamp)}</span>
      <span class="pill">Approved ${h(cycle.approvedTrades)}</span>
      <span class="pill">Rejected ${h(cycle.rejectedTrades)}</span>
      <span class="pill">Risk ${h(cycle.depletionRisk)}</span>
    </section>

    <section class="grid">
      <article class="panel">
        <h2>Recent Market Movement</h2>
        ${barRows(movers.slice(0, 8), "symbol", "changePct")}
      </article>
      <article class="panel">
        <h2>Up / Down / Flat</h2>
        ${barRows(directionCounts, "label", "value")}
      </article>
      <article class="panel">
        <h2>Movement Buckets</h2>
        ${barRows(movementBuckets, "label", "value")}
      </article>
      <article class="panel">
        <h2>Paper P&L Timeline</h2>
        ${barRows(equity.slice(-12), "sequence", "paperPnl")}
      </article>
      <article class="panel">
        <h2>Signal/Risk Counts</h2>
        ${barRows(risks.slice(-12), "sequence", "riskBlocked")}
      </article>
      <article class="panel">
        <h2>Bot Activity Timeline</h2>
        <ul>${timelineRows(localBundle.charts.botActivityTimeline || publicBundle.botActivityTimeline || [])}</ul>
      </article>
    </section>

    <section class="grid">
      <article class="panel">
        <h2>Risk Rejections</h2>
        <ul>${reasonRows(rejectionReasons)}</ul>
      </article>
      <article class="panel">
        <h2>Almost Approved</h2>
        <ul>${candidateRows(almostApproved)}</ul>
      </article>
    </section>

    <section class="panel">
      <h2>Stale/Fallback Warnings</h2>
      <ul>${warnings.map((item) => `<li><strong>${h(item.item)}: ${h(item.status)}</strong><span>${h(item.detail)}</span></li>`).join("")}</ul>
    </section>

    <section class="panel">
      <h2>Files</h2>
      <p class="path">Local dashboard bundle: Data/dashboard/dashboard-public-safe-v0.1.json</p>
      <p class="path">Public-safe local site bundle: ${h(path.relative(paths.projectRoot, paths.siteDashboardPublicV04Json).replace(/\\/g, "/"))}</p>
    </section>
  </main>
</body>
</html>`;
}

function buildReport() {
  return `# MarketOps Dashboard Preview v0.1

Generated: ${new Date().toISOString()}

## Preview File

${path.relative(paths.projectRoot, previewHtmlPath).replace(/\\/g, "/")}

## Open Command

\`\`\`bash
xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
\`\`\`

## Safety

- Local file only.
- externalEffects: false.
- publishAllowed: false.
- No push, deploy, posting, email, SMS, broker execution, or live trading.
`;
}

function runDashboardPreview() {
  ensureDir(previewRoot);
  const localBundle = loadJson(localDashboardPath);
  const publicBundle = loadJson(paths.siteDashboardPublicV04Json);
  writeText(previewHtmlPath, buildHtml(localBundle, publicBundle));
  writeText(previewReportPath, buildReport());
  console.log("MarketOps dashboard preview generated");
  console.log(`preview: ${previewHtmlPath}`);
  console.log(`report: ${previewReportPath}`);
  console.log("open command: xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html");
  return { previewHtmlPath, previewReportPath };
}

if (require.main === module) {
  try {
    runDashboardPreview();
  } catch (error) {
    console.error(`dashboard:preview failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { previewHtmlPath, previewReportPath, runDashboardPreview };
