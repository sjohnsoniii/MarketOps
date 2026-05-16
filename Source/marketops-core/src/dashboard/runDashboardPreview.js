const path = require("path");

const { ensureDir, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

const previewRoot = path.join(paths.projectRoot, "Admin", "dashboard-preview");
const previewHtmlPath = path.join(previewRoot, "marketops-dashboard-preview-v0.1.html");
const previewReportPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-dashboard-preview-v0.1.md");
const localDashboardPath = path.join(paths.projectRoot, "Data", "dashboard", "dashboard-public-safe-v0.1.json");
const snapshotJsonPath = path.join(paths.dataRoot, "dashboard", "marketops-shareable-snapshot-v0.1.json");

function h(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(value, suffix) {
  if (value == null) return '<span class="muted">Not available yet</span>';
  const s = suffix || "";
  return h(value) + s;
}

function provenanceLabel(source) {
  const colors = {
    real_paper: "ok",
    real_market: "ok",
    real_alpaca_iex: "ok",
    synthetic_analytics: "warn",
    sample_fallback: "warn",
    "sample_fallback_from_signal_sampleChangePct": "warn",
    no_trades: "info",
    empty: "info",
    "no_trades_executed": "info"
  };
  for (const [prefix, cls] of Object.entries(colors)) {
    if (String(source || "").startsWith(prefix)) {
      return `<span class="pill ${cls}">${h(source)}</span>`;
    }
  }
  return `<span class="pill">${h(source || "unknown")}</span>`;
}

function barRows(items, labelKey, valueKey, maxLabel) {
  const mx = Math.max(1, ...items.map((item) => Math.abs(Number(item[valueKey] || 0))));
  const lp = maxLabel || 80;
  return items.map((item) => {
    const value = Number(item[valueKey] || 0);
    const width = Math.max(4, Math.round((Math.abs(value) / mx) * 100));
    return `<div class="bar-row"><span class="bar-label" style="min-width:${lp}px">${h(item[labelKey])}</span><div class="track"><div class="bar ${value < 0 ? "neg" : ""}" style="width:${width}%"></div></div><strong class="bar-val">${h(value)}</strong></div>`;
  }).join("");
}

function timelineRows(items) {
  return items.slice(-8).reverse().map((item) => (
    `<li><strong>${h(item.generatedAt)}</strong><span>Equity ${h(item.endingEquity)} / P&L ${h(item.paperPnl)} / Risk ${h(item.riskApproved)} approved, ${h(item.riskBlocked)} blocked</span></li>`
  )).join("");
}

function reasonRows(items) {
  return items.slice(0, 6).map((item) => (
    `<li><strong>${h(item.reason)}</strong><span>${h(item.count)} rejection(s)</span></li>`
  )).join("");
}

function buildHtml(localBundle, snapshot) {
  const perf = localBundle.dashboardCards && localBundle.dashboardCards.currentPaperPerformance || {};
  const freshness = localBundle.dashboardCards && localBundle.dashboardCards.marketDataFreshnessPanel || {};
  const chartDS = localBundle.chartDataSources || {};
  const provenance = localBundle.dataProvenance || {};
  const disclaimers = Array.isArray(localBundle.disclaimers) ? localBundle.disclaimers : [];
  const warnings = localBundle.charts && localBundle.charts.staleDataWarningPanel || [];
  const cycle = localBundle.dashboardCards && localBundle.dashboardCards.paperCycleStatus || {};
  const refreshHealth = localBundle.dashboardCards && localBundle.dashboardCards.dashboardRefreshHealth || {};
  const signalFunnel = localBundle.dashboardCards && localBundle.dashboardCards.signalFunnel || {};
  const tradeOutcome = localBundle.dashboardCards && localBundle.dashboardCards.tradeOutcomeDistribution || {};
  const movers = localBundle.charts && localBundle.charts.recentMarketMovementPanel || [];
  const equity = localBundle.charts && localBundle.charts.paperPnlSeries || [];
  const risks = localBundle.charts && localBundle.charts.signalRiskCounts || [];
  const directionCounts = localBundle.charts && localBundle.charts.vehicleDirectionCounts || [];
  const movementBuckets = localBundle.charts && localBundle.charts.movementBuckets || [];
  const rejectionReasons = localBundle.charts && localBundle.charts.riskRejectionReasons || [];
  const almostApproved = localBundle.charts && localBundle.charts.almostApprovedCandidates || [];
  const botTimeline = localBundle.charts && localBundle.charts.botActivityTimeline || [];
  const staleWarning = localBundle.charts && localBundle.charts.staleDataWarningPanel || [];

  const ss = snapshot && snapshot.snapshot || {};
  const presetLabel = ss.preset && ss.preset.activePresetLabel || "standard";
  const refreshStatus = ss.refreshStatus || {};
  const sp = ss.paperCycle || {};
  const sr = ss.signalsAndRisk || {};

  const isDegraded = refreshStatus.isDegraded || false;
  const isStale = refreshStatus.staleWarning !== null && refreshStatus.staleWarning !== undefined;
  const badgeClass = isDegraded || isStale ? "bad" : (refreshStatus.lastStatus === "PASS" ? "ok" : "warn");
  const statusText = isDegraded ? "Degraded" : (isStale ? "Stale" : (refreshStatus.lastStatus === "PASS" ? "Healthy" : "Unknown"));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MarketOps Paper Dashboard</title>
  <style>
    :root{color-scheme:dark;--bg:#070a0e;--panel:#11171f;--panel2:#18212b;--line:rgba(160,180,200,.18);--text:#e8edf2;--muted:#8fa0b0;--accent:#d4533a;--ok:#5bbf8a;--warn:#e8b85e;--bad:#d96b6b;--info:#6a9ec4;--card-bg:#0f151d}
    *{box-sizing:border-box;margin:0}
    body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,sans-serif;font-size:15px;line-height:1.5}
    main{width:min(1320px,calc(100% - 32px));margin:0 auto;padding:28px 0 48px}
    header{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:20px 24px;margin-bottom:16px}
    header h1{font-size:1.5rem;font-weight:600;margin-bottom:4px}
    header p{color:var(--muted);font-size:.92rem;margin-bottom:12px}
    .badge-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
    .badge{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:.75rem;font-weight:500;color:var(--muted)}
    .badge.ok{color:var(--ok);border-color:rgba(91,191,138,.5)}
    .badge.warn{color:var(--warn);border-color:rgba(232,184,94,.5)}
    .badge.bad{color:var(--bad);border-color:rgba(217,107,107,.5)}
    .badge.info{color:var(--info);border-color:rgba(106,158,196,.5)}
    .badge strong{font-weight:600}
    .status-line{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;padding-top:12px;border-top:1px solid var(--line);font-size:.85rem;color:var(--muted)}
    .status-line .label{color:var(--muted)}
    .status-line .value{color:var(--text);font-weight:500}
    .status-line .value.ok{color:var(--ok)}
    .status-line .value.warn{color:var(--warn)}
    .status-line .value.bad{color:var(--bad)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:16px}
    .card{background:var(--card-bg);border:1px solid var(--line);border-radius:8px;padding:14px 16px}
    .card .val{font-size:1.35rem;font-weight:600;display:block}
    .card .lbl{font-size:.78rem;color:var(--muted);display:block;margin-top:2px}
    .card .probe{font-size:.7rem;color:var(--muted);display:block;margin-top:4px;opacity:.7}
    .panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px 20px;margin-bottom:14px}
    .panel h2{font-size:1.05rem;font-weight:600;margin-bottom:10px}
    .panel h2 .probe{font-weight:400;font-size:.75rem;opacity:.7;margin-left:8px}
    .panel p{color:var(--muted);font-size:.88rem;margin-bottom:8px}
    .panel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
    .bar-row{display:grid;grid-template-columns:auto 1fr 60px;gap:8px;align-items:center;margin:6px 0}
    .bar-label{font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)}
    .bar-val{font-size:.82rem;text-align:right;font-weight:500}
    .track{height:10px;background:#0a1018;border:1px solid var(--line);border-radius:999px;overflow:hidden}
    .bar{height:100%;background:var(--ok);border-radius:999px;transition:width .2s}
    .bar.neg{background:var(--bad)}
    .bar.flat{background:var(--muted);opacity:.4}
    ul{padding-left:16px;list-style:none}
    li{margin:5px 0;font-size:.85rem;color:var(--muted);line-height:1.4}
    li strong{display:block;color:var(--text);font-size:.82rem}
    .pill{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:2px 8px;margin:0 4px 4px 0;color:var(--muted);font-size:.72rem}
    .pill.ok{color:var(--ok);border-color:rgba(91,191,138,.5)}
    .pill.warn{color:var(--warn);border-color:rgba(232,184,94,.5)}
    .pill.bad{color:var(--bad);border-color:rgba(217,107,107,.5)}
    .pill.info{color:var(--info);border-color:rgba(106,158,196,.5)}
    .warn-box{background:rgba(232,184,94,.08);border:1px solid rgba(232,184,94,.25);border-radius:8px;padding:12px 14px;margin-bottom:12px;font-size:.85rem;color:var(--warn)}
    .warn-box strong{display:block;color:var(--warn);font-weight:600;margin-bottom:2px}
    .disclaimer-box{background:rgba(106,158,196,.06);border:1px solid rgba(106,158,196,.15);border-radius:8px;padding:14px 16px;margin-top:14px;font-size:.8rem;color:var(--muted);line-height:1.5}
    .disclaimer-box strong{color:var(--info);display:block;margin-bottom:4px;font-size:.82rem}
    .empty-state{padding:20px;text-align:center;color:var(--muted);font-size:.88rem;font-style:italic}
    hr{border:none;border-top:1px solid var(--line);margin:14px 0}
    @media(max-width:600px){.grid{grid-template-columns:1fr 1fr}.panel-grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <header>
      <h1>MarketOps Paper Dashboard</h1>
      <p>Local, paper-only simulation preview. Not real trading. Not financial advice. No broker execution. No live market data publishing.</p>
      <div class="badge-row">
        <span class="badge ok">Paper simulation only</span>
        <span class="badge ok">externalEffects false</span>
        <span class="badge ok">publishAllowed false</span>
        <span class="badge">${h(localBundle.dataSource || "deterministic_sample")}</span>
        <span class="badge ${badgeClass}">${statusText}</span>
        <span class="badge">Preset: ${h(presetLabel)}</span>
      </div>
      <div class="status-line">
        <span><span class="label">Last refresh:</span> <span class="value ${refreshStatus.lastStatus === "PASS" ? "ok" : "warn"}">${h(refreshStatus.lastStatus)}</span></span>
        <span><span class="label">Last attempt:</span> <span class="value">${h(refreshStatus.lastRefreshAt || "never")}</span></span>
        <span><span class="label">Last success:</span> <span class="value">${h(refreshStatus.lastSuccessfulRefreshAt || "none")}</span></span>
        <span><span class="label">Scheduler:</span> <span class="value">not installed</span></span>
      </div>
    </header>

    ${(isDegraded || isStale) ? `<div class="warn-box"><strong>Refresh Notice</strong>${h(refreshStatus.staleWarning || "")}${refreshStatus.failureReason ? "<br><br>Failure reason: " + h(refreshStatus.failureReason) : ""}</div>` : ""}

    <section class="grid">
      <div class="card"><span class="val">${fmt(sp.startingBalance)}</span><span class="lbl">Starting paper balance</span><span class="probe">from paper cycle</span></div>
      <div class="card"><span class="val">${fmt(sp.currentBalance)}</span><span class="lbl">Current paper balance</span><span class="probe">from paper cycle</span></div>
      <div class="card"><span class="val">${fmt(sp.paperPnl)}</span><span class="lbl">Paper P&L</span><span class="probe">${sp.paperPnl == null ? "no trades yet" : "cumulative"}</span></div>
      <div class="card"><span class="val">${fmt(sp.paperReturnPct, "%")}</span><span class="lbl">Paper return</span><span class="probe">${sp.paperReturnPct == null ? "no trades yet" : "since start"}</span></div>
      <div class="card"><span class="val">${fmt(sp.maxDrawdownPct, "%")}</span><span class="lbl">Max drawdown</span><span class="probe">peak-to-trough</span></div>
      <div class="card"><span class="val">${fmt(cycle.daysSurvived, "d")}</span><span class="lbl">Cycle days survived</span><span class="probe">${h(cycle.status || "unknown")}</span></div>
      <div class="card"><span class="val">${fmt(sr.signalsReviewed)}</span><span class="lbl">Signals reviewed</span><span class="probe">${h(sr.riskBlocked || 0)} blocked, ${h(sr.riskApproved || 0)} approved</span></div>
      <div class="card"><span class="val">${fmt(sr.fakePaperTrades)}</span><span class="lbl">Fake paper trades</span><span class="probe">${sr.noTradeReason ? "all blocked by Risk Desk" : "executed"}</span></div>
    </section>

    <div class="panel">
      <h2>Paper Cycle <span class="probe">${h(cycle.activePreset || "standard")} preset</span></h2>
      <p>Cycle ${h(sp.cycleId)} is <strong>${h(sp.status)}</strong>. Started ${h(sp.startingBalance)} paper USD, current ${h(sp.currentBalance)} paper USD. Does not reset daily — continues while balance is above depletion threshold.</p>
      <span class="pill">${h(sp.approvedTrades || 0)} approved</span>
      <span class="pill">${h(sp.rejectedTrades || 0)} rejected</span>
      <span class="pill ${sp.depletionRisk === "normal" ? "ok" : "warn"}">Risk: ${h(sp.depletionRisk)}</span>
      <span class="pill">${h(sp.daysSurvived || 0)} days survived</span>
    </div>

    <div class="panel-grid">
      <div class="panel">
        <h2>Recent Market Movement ${provenanceLabel(chartDS.recentMarketMovementPanel)}</h2>
        ${movers.length ? barRows(movers.slice(0, 8), "symbol", "changePct", 60) : '<div class="empty-state">No market movement data available yet.</div>'}
        <p style="margin-top:8px">Real Alpaca IEX price movement for the latest trading session.</p>
      </div>
      <div class="panel">
        <h2>Up / Down / Flat ${provenanceLabel(chartDS.vehicleDirectionCounts)}</h2>
        ${directionCounts.length ? barRows(directionCounts, "label", "value", 60) : '<div class="empty-state">No direction data yet.</div>'}
      </div>
      <div class="panel">
        <h2>Movement Buckets ${provenanceLabel(chartDS.movementBuckets)}</h2>
        ${movementBuckets.length ? barRows(movementBuckets, "label", "value", 110) : '<div class="empty-state">No bucket data yet.</div>'}
      </div>
      <div class="panel">
        <h2>Paper P&L Timeline ${provenanceLabel(chartDS.paperPnlSeries)}</h2>
        ${equity.length ? barRows(equity.slice(-12), "sequence", "paperPnl", 50) : '<div class="empty-state">No P&L history yet — no trades executed.</div>'}
      </div>
      <div class="panel">
        <h2>Signal/Risk Counts ${provenanceLabel(chartDS.signalRiskCounts)}</h2>
        ${risks.length ? barRows(risks.slice(-12), "sequence", "riskBlocked", 50) : '<div class="empty-state">No signal history yet.</div>'}
      </div>
      <div class="panel">
        <h2>Bot Activity Timeline ${provenanceLabel(chartDS.botActivityTimeline)}</h2>
        ${botTimeline.length ? '<ul>' + timelineRows(botTimeline) + '</ul>' : '<div class="empty-state">No activity recorded yet.</div>'}
      </div>
    </div>

    <div class="panel-grid">
      <div class="panel">
        <h2>Risk Rejections ${provenanceLabel(chartDS.riskRejectionReasons)}</h2>
        ${rejectionReasons.length ? '<ul>' + reasonRows(rejectionReasons) + '</ul>' : '<div class="empty-state">No rejections recorded.</div>'}
        <p style="margin-top:8px">Top reasons the Risk Desk blocked signals. All paper/simulation only.</p>
      </div>
      <div class="panel">
        <h2>Candidate Review ${provenanceLabel(chartDS.almostApprovedCandidates)}</h2>
        ${almostApproved.length ? '<ul>' + almostApproved.slice(0, 6).map((c) => `<li><strong>${h(c.symbol)}: ${h(c.status)}</strong><span>Confidence ${h(c.confidence)} / ${h(c.primaryBlockReason)}</span></li>`).join("") + '</ul>' : '<div class="empty-state">No candidates to review.</div>'}
      </div>
    </div>

    <div class="panel">
      <h2>Market Data Freshness</h2>
      <p>Feed ${h(freshness.feed || "sample")} / bars loaded ${h(freshness.barsLoaded || 0)} / quotes ${h(freshness.quotesLoaded || 0)}</p>
      <span class="pill ${freshness.refreshFreshnessLabel === "fresh" ? "ok" : "warn"}">Refresh: ${h(freshness.refreshFreshnessLabel)}</span>
      <span class="pill ${freshness.latestBarFreshnessLabel === "fresh" ? "ok" : "warn"}">Latest bar: ${h(freshness.latestBarFreshnessLabel)}</span>
      <span class="pill ok">rawMarketDataPublished false</span>
      <span class="pill ok">publicSafeDerivedOnly true</span>
    </div>

    ${staleWarning.length ? `<div class="panel"><h2>Stale & Fallback Warnings</h2>${staleWarning.map((w) => `<div class="warn-box" style="margin-bottom:6px"><strong>${h(w.item)}: ${h(w.status)}</strong>${h(w.detail)}</div>`).join("")}</div>` : ""}

    <div class="panel">
      <h2>Dashboard Refresh Health</h2>
      <span class="pill ${badgeClass}">${statusText}</span>
      <span class="pill">${h(refreshHealth.consecutiveFailures || 0)} consecutive failures</span>
      <span class="pill">${h(refreshHealth.refreshIntervalTargetHours || 2)}h refresh target</span>
      <span class="pill ${refreshHealth.schedulerInstalled ? "warn" : "ok"}">schedulerInstalled: ${h(refreshHealth.schedulerInstalled)}</span>
      ${refreshHealth.staleWarning ? `<p style="margin-top:8px;color:var(--warn);font-size:.85rem">&#9888; ${h(refreshHealth.staleWarning)}</p>` : ""}
    </div>

    <div class="disclaimer-box">
      <strong>&#9432; Important Disclaimers</strong>
      ${disclaimers.map((d) => `<div>&bull; ${h(d)}</div>`).join("")}
      <hr>
      <div>&bull; This is a local preview file. It has not been published or deployed.</div>
      <div>&bull; All data is paper simulation only. No real money has been traded.</div>
      <div>&bull; All 64 signal rejections show the Risk Desk is operating in a deliberately cautious Phase 1 configuration.</div>
      <div>&bull; No broker, API, payment, or social auto-posting behavior is enabled.</div>
      <div>&bull; Refresh timestamp: ${h(localBundle.generatedAt)}</div>
    </div>
  </main>
</body>
</html>`;
}

function buildReport() {
  return `# MarketOps Dashboard Preview v0.2

Generated: ${new Date().toISOString()}

## Preview File

${path.relative(paths.projectRoot, previewHtmlPath).replace(/\\/g, "/")}

## Open Command

\`\`\`bash
xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html
\`\`\`

## Data Sources

- Local dashboard bundle: Data/dashboard/dashboard-public-safe-v0.1.json
- Shareable snapshot: Data/dashboard/marketops-shareable-snapshot-v0.1.json

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
  const snapshot = loadJson(snapshotJsonPath);
  writeText(previewHtmlPath, buildHtml(localBundle, snapshot));
  writeText(previewReportPath, buildReport());
  console.log("MarketOps dashboard preview v0.2 generated");
  console.log(`preview: ${previewHtmlPath}`);
  console.log(`report: ${previewReportPath}`);
  console.log("open: xdg-open ~/Projects/MarketOps/Admin/dashboard-preview/marketops-dashboard-preview-v0.1.html");
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
