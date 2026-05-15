const path = require("path");
const { fileExists, loadJson, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

const snapshotJsonPath = path.join(paths.dataRoot, "dashboard", "marketops-shareable-snapshot-v0.1.json");
const snapshotReportPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-shareable-snapshot-v0.1.md");

function buildShareableSnapshot() {
  const generatedAt = new Date().toISOString();
  const config = fileExists(paths.config) ? loadJson(paths.config) : {};
  const cycle = fileExists(paths.cycleLatestJson) ? loadJson(paths.cycleLatestJson) : {};
  const latestRun = fileExists(paths.latestRunSummaryJson) ? loadJson(paths.latestRunSummaryJson) : {};
  const signals = fileExists(paths.signalsJson) ? loadJson(paths.signalsJson) : {};
  const risk = fileExists(paths.riskJson) ? loadJson(paths.riskJson) : {};
  const trades = fileExists(paths.tradesJson) ? loadJson(paths.tradesJson) : {};
  const equity = fileExists(paths.equityJson) ? loadJson(paths.equityJson) : {};
  const refreshHealth = fileExists(path.join(paths.dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json")) ? loadJson(path.join(paths.dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json")) : {};

  const preset = config.paperAccount && config.paperAccount.paperAccountPreset || "standard";
  const presets = config.paperAccountPresets || {};
  const presetLabel = presets[preset] && presets[preset].label || `paper-account-preset-${preset}`;

  const startingBalance = cycle.startingBalance || null;
  const currentBalance = cycle.currentBalance || null;
  const paperPnl = latestRun.paperPnl != null ? round(latestRun.paperPnl) : null;
  const paperReturnPct = latestRun.paperReturnPct != null ? round(latestRun.paperReturnPct) : null;
  const maxDrawdownPct = latestRun.maxDrawdownPct != null ? round(latestRun.maxDrawdownPct) : null;

  const signalsReviewed = (signals.signals || []).length;
  const riskApproved = risk.approvedCount != null ? risk.approvedCount : (risk.decisions || []).filter((d) => d.approved).length;
  const riskBlocked = risk.blockedCount != null ? risk.blockedCount : (risk.decisions || []).filter((d) => !d.approved).length;
  const fakePaperTrades = trades.executedTrades || (trades.trades || []).length;

  return {
    schemaVersion: "marketops-shareable-snapshot-v0.1",
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: latestRun.sampleData !== false,
    fakeMoney: true,
    inDevelopment: true,
    notFinancialAdvice: true,
    notLiveTrading: true,
    notRealPerformance: true,
    notCopyTrading: true,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    externalEffects: false,
    publishAllowed: false,
    publicDisclaimer: "Paper simulation, fake-money, in-development sample-data preview only. Not real performance. Not financial advice. No guarantees. No copy-trading.",
    snapshot: {
      preset: {
        activePreset: preset,
        activePresetLabel: presetLabel,
        note: "Use config paperAccountPreset to switch: micro (100), small (250), standard (1000)."
      },
      paperCycle: {
        cycleId: cycle.cycleId || null,
        status: cycle.status || null,
        startingBalance,
        currentBalance,
        paperPnl,
        paperReturnPct,
        maxDrawdownPct,
        daysSurvived: cycle.daysSurvived != null ? round(cycle.daysSurvived) : null,
        depletionRisk: cycle.depletionRisk || null,
        approvedTrades: Number(cycle.approvedTrades || 0),
        rejectedTrades: Number(cycle.rejectedTrades || 0)
      },
      signalsAndRisk: {
        signalsReviewed,
        riskApproved,
        riskBlocked,
        fakePaperTrades,
        noTradeReason: fakePaperTrades === 0 ? "Risk Desk did not approve any candidate for fake paper execution." : null
      },
      refreshStatus: {
        lastRefreshAt: refreshHealth.lastAttemptAt || null,
        lastSuccessfulRefreshAt: refreshHealth.lastSuccessfulRefreshAt || null,
        lastStatus: refreshHealth.lastStatus || "UNKNOWN",
        staleWarning: refreshHealth.staleWarning || null,
        failureReason: refreshHealth.failureReason || null,
        refreshIntervalTargetHours: refreshHealth.refreshIntervalTargetHours || 2,
        schedulerInstalled: refreshHealth.schedulerInstalled === true,
        isDegraded: refreshHealth.lastStatus === "FAIL" && refreshHealth.staleWarning !== null
      },
      disclaimers: [
        "Paper simulation only.",
        "Fake-money, sample-data preview.",
        "Not live market data.",
        "Not financial advice.",
        "Not real trading performance.",
        "No broker, API, payment, or social auto-posting behavior is enabled.",
        "All signals blocked by Risk Desk — no fake trades were executed in the latest run."
      ]
    }
  };
}

function writeShareableSnapshot() {
  const snapshot = buildShareableSnapshot();
  writeJson(snapshotJsonPath, snapshot);
  const report = `# MarketOps Shareable Snapshot v0.1\n\nGenerated: ${snapshot.generatedAt}\n\n## Status\n\n- mode: ${snapshot.mode}\n- paperOnly: ${snapshot.paperOnly}\n- fakeMoney: ${snapshot.fakeMoney}\n- inDevelopment: ${snapshot.inDevelopment}\n- notFinancialAdvice: ${snapshot.notFinancialAdvice}\n\n## Snapshot\n\n- Active preset: ${snapshot.snapshot.preset.activePresetLabel}\n- Paper cycle: ${snapshot.snapshot.paperCycle.status} (${snapshot.snapshot.paperCycle.cycleId})\n- Starting balance: ${snapshot.snapshot.paperCycle.startingBalance}\n- Current balance: ${snapshot.snapshot.paperCycle.currentBalance}\n- Paper P&L: ${snapshot.snapshot.paperCycle.paperPnl}\n- Return: ${snapshot.snapshot.paperCycle.paperReturnPct}%\n- Max drawdown: ${snapshot.snapshot.paperCycle.maxDrawdownPct}%\n- Signals reviewed: ${snapshot.snapshot.signalsAndRisk.signalsReviewed}\n- Risk approved: ${snapshot.snapshot.signalsAndRisk.riskApproved}\n- Risk blocked: ${snapshot.snapshot.signalsAndRisk.riskBlocked}\n- Fake paper trades: ${snapshot.snapshot.signalsAndRisk.fakePaperTrades}\n- Last refresh: ${snapshot.snapshot.refreshStatus.lastStatus}\n- Stale warning: ${snapshot.snapshot.refreshStatus.staleWarning || "none"}\n- Scheduler installed: ${snapshot.snapshot.refreshStatus.schedulerInstalled}\n\n## Disclaimer\n\n${snapshot.publicDisclaimer}\n`;
  writeJson(snapshotReportPath, report);
  console.log("MarketOps shareable snapshot written");
  console.log(`snapshot: ${snapshotJsonPath}`);
  return { snapshotJsonPath, snapshotReportPath, snapshot };
}

module.exports = { snapshotJsonPath, snapshotReportPath, buildShareableSnapshot, writeShareableSnapshot };
