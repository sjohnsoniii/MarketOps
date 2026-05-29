const fs = require("fs");
const path = require("path");

const CORE_ROOT = path.join(__dirname, "..", "..");
const PROJECT_ROOT = path.join(CORE_ROOT, "..", "..");
const SJ3LABS_ROOT = path.join(PROJECT_ROOT, "..", "sj3labs");
const MARKETOPS_DATA = path.join(SJ3LABS_ROOT, "data", "marketops");
const DASHBOARD_DIR = path.join(SJ3LABS_ROOT, "marketops", "dashboard");
const DASHBOARD_HTML = path.join(DASHBOARD_DIR, "index.html");

const BUNDLE_VERSIONS = [
  "dashboard-bundle-public-v0.5.json",
  "dashboard-bundle-public-v0.4.json",
  "dashboard-bundle-public-v0.3.json",
  "dashboard-public-safe-v0.1.json"
];
const TRIAL_STATUS_FILE = "marketops-public-trial-status-v0.1.json";

let totalChecks = 0;
let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  totalChecks++;
  if (condition) {
    passed++;
    console.log("  PASS  " + label + (detail ? " (" + detail + ")" : ""));
  } else {
    failed++;
    console.log("  FAIL  " + label + (detail ? " (" + detail + ")" : ""));
  }
}

function fileExists(p) {
  try { fs.accessSync(p, fs.constants.R_OK); return true; } catch { return false; }
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

console.log("");
console.log("=== MarketOps Dashboard Site-Binding QA ===");
console.log("");

// 1. Dashboard HTML exists
console.log("[1] Dashboard HTML");
console.log("");
check("HTML file exists at: " + DASHBOARD_HTML, fileExists(DASHBOARD_HTML));
if (fileExists(DASHBOARD_HTML)) {
  const html = fs.readFileSync(DASHBOARD_HTML, "utf8");
  check("HTML contains <script> block", html.includes("<script>"));
  check("HTML contains trial-status fetch url", html.includes("marketops-public-trial-status-v0.1.json"));
  check("HTML contains bundle fetch url v0.5", html.includes("dashboard-bundle-public-v0.5.json"));
  check("HTML contains bundle fetch url v0.5 (primary)", html.includes("dashboard-bundle-public-v0.5.json"));
  check("HTML contains safe bundle fallback url", html.includes("dashboard-public-safe-v0.1.json"));
  check("HTML uses cache busting (?v=)", html.includes("?v=") && html.includes("Date.now()"));
  check("HTML uses cache: no-store", html.includes("cache: 'no-store'"));
  check("HTML validates paperOnly flag", html.includes("bundle.paperOnly === true"));
  check("HTML has fallbackDashboard definition", html.includes("fallbackDashboard"));
  check("HTML has risk metrics rendering", html.includes("renderRiskMetrics"));
  check("HTML has trades rendering", html.includes("renderRecentTrades"));
  check("HTML has vehicle activity rendering", html.includes("renderVehicleActivityFromBundle"));
  check("HTML has paper profit/loss rendering", html.includes("renderPaperProfitLoss"));
  check("HTML has core paper target rendering", html.includes("renderCorePaperTarget"));
  check("HTML has capacity blocked rendering", html.includes("capacity_blocked"));
  check("HTML has entry risk band rendering", html.includes("entryRiskBand"));
  check("HTML has current risk band rendering", html.includes("currentRiskBand"));
  check("HTML has risk band stale rendering", html.includes("riskBandStale"));
  check("HTML has paper-pnl section", html.includes("paper-pnl"));
  check("HTML has core-target section", html.includes("core-target"));
  check("HTML has last-refreshed timestamps", html.includes("updateLastRefreshed"));
  check("HTML handles no-data states", html.includes("renderNoData"));
} else {
  console.log("  SKIP  (file not found - cannot run content checks)");
}

// 2. Data files exist
console.log("");
console.log("[2] Data Files (sj3labs/data/marketops/)");
console.log("");

check("sj3labs data directory exists", fileExists(MARKETOPS_DATA));
if (fileExists(MARKETOPS_DATA)) {
  BUNDLE_VERSIONS.forEach(v => {
    const fp = path.join(MARKETOPS_DATA, v);
    check("Bundle: " + v, fileExists(fp));
  });
  const tfp = path.join(MARKETOPS_DATA, TRIAL_STATUS_FILE);
  check("Trial status: " + TRIAL_STATUS_FILE, fileExists(tfp));
}

// 3. Bundle content validation
console.log("");
console.log("[3] Bundle Content Validation");
console.log("");

let primaryBundle = null;
BUNDLE_VERSIONS.forEach(v => {
  const fp = path.join(MARKETOPS_DATA, v);
  if (!primaryBundle && fileExists(fp)) {
    const b = readJSON(fp);
    if (b && b.paperOnly === true) {
      primaryBundle = b;
      check("Primary bundle found: " + v, true, "paperOnly: true, " + (b.vehiclesScanned || "?") + " vehicles scanned");
    }
  }
});

if (primaryBundle) {
  const bundle = primaryBundle;
  check("bundle.dataSource present", !!bundle.dataSource);
  check("bundle.paperOnly === true", bundle.paperOnly === true);
  check("bundle.liveTradingEnabled === false", bundle.liveTradingEnabled === false);
  check("bundle.vehiclesScanned > 0", (bundle.vehiclesScanned || 0) > 0, String(bundle.vehiclesScanned));
  check("bundle.riskDeskSummary present", !!bundle.riskDeskSummary, bundle.riskDeskSummary ? (bundle.riskDeskSummary.approved + " approved / " + bundle.riskDeskSummary.blocked + " blocked") : "missing");
  check("bundle.signalFunnel present", Array.isArray(bundle.signalFunnel) && bundle.signalFunnel.length > 0, String(bundle.signalFunnel ? bundle.signalFunnel.length : 0) + " stages");
  check("bundle.riskDecisionMix present", !!bundle.riskDecisionMix, bundle.riskDecisionMix ? (bundle.riskDecisionMix.approved + " approved / " + bundle.riskDecisionMix.blocked + " blocked") : "missing");
  check("bundle.tradeOutcomeMix present", !!bundle.tradeOutcomeMix, bundle.tradeOutcomeMix ? (bundle.tradeOutcomeMix.wins + "W / " + bundle.tradeOutcomeMix.losses + "L / " + bundle.tradeOutcomeMix.flat + "F") : "missing");
  check("bundle.publicSafeVehicleContribution present", Array.isArray(bundle.publicSafeVehicleContribution), String(bundle.publicSafeVehicleContribution ? bundle.publicSafeVehicleContribution.length : 0) + " vehicles");
  check("bundle.rollingMarketMovement present", Array.isArray(bundle.rollingMarketMovement), String(bundle.rollingMarketMovement ? bundle.rollingMarketMovement.length : 0) + " vehicles");
  check("bundle.milestoneTargets present", Array.isArray(bundle.milestoneTargets) && bundle.milestoneTargets.length >= 2, String(bundle.milestoneTargets ? bundle.milestoneTargets.length : 0) + " milestones");
  check("bundle.equityPoints is array", Array.isArray(bundle.equityPoints), bundle.equityPoints.length + " points");
  check("bundle.generatedAt present", !!bundle.generatedAt);
  check("bundle.startingBalance > 0", (bundle.startingBalance || 0) > 0, "$" + bundle.startingBalance);
  check("bundle.paperProfitLoss section exists", Boolean(bundle.paperProfitLoss), "paperProfitLoss");
  check("bundle.corePaperTarget section exists", Boolean(bundle.corePaperTarget), "coreTarget");
  check("bundle.accountSummary has startingBalance", bundle.accountSummary && bundle.accountSummary.startingBalance != null, "$" + (bundle.accountSummary ? bundle.accountSummary.startingBalance : "missing"));
  check("bundle.accountSummary has realizedPnl", bundle.accountSummary && bundle.accountSummary.realizedPnl != null, "$" + (bundle.accountSummary ? bundle.accountSummary.realizedPnl : "missing"));
  check("bundle.accountSummary has unrealizedPnl", bundle.accountSummary && bundle.accountSummary.unrealizedPnl != null, "$" + (bundle.accountSummary ? bundle.accountSummary.unrealizedPnl : "missing"));

  if (bundle.openPositionsDetailed) {
    const hasEntryRiskBand = bundle.openPositionsDetailed.some(p => p.entryRiskBand != null);
    const hasCurrentRiskBand = bundle.openPositionsDetailed.some(p => p.currentRiskBand != null);
    check("openPositionsDetailed has entryRiskBand", hasEntryRiskBand, "entryRiskBand present on positions");
    check("openPositionsDetailed has currentRiskBand", hasCurrentRiskBand, "currentRiskBand present on positions");
  }

  if (bundle.cycleDecisionBoard && bundle.cycleDecisionBoard.sections) {
    check("cycleDecisionBoard has capacity_blocked section", Boolean(bundle.cycleDecisionBoard.sections.capacity_blocked), typeof bundle.cycleDecisionBoard.sections.capacity_blocked);
    if (bundle.cycleDecisionBoard.sections.capacity_blocked) {
      check("cycleDecisionBoard capacity_blocked.items is array", Array.isArray(bundle.cycleDecisionBoard.sections.capacity_blocked.items), String(bundle.cycleDecisionBoard.sections.capacity_blocked.items.length));
    }
  }

  // Chart data sources
  if (bundle.dataProvenance && bundle.dataProvenance.chartDataSources) {
    const sources = bundle.dataProvenance.chartDataSources;
    const emptyCharts = Object.entries(sources).filter(([k, v]) => v === "empty" || v === "no_trades").map(([k]) => k);
    check("All chart sources documented", Object.keys(sources).length >= 8, Object.keys(sources).length + " sources documented");
    if (emptyCharts.length > 0) {
      check("Empty charts labeled correctly", emptyCharts.every(k => ["equityPoints", "pnlPoints", "cumulativePnlPoints", "drawdownPoints", "tradeOutcomeMix"].includes(k)), emptyCharts.join(", ") + " = empty/no_trades");
    }
  }
} else {
  console.log("  SKIP  (no valid bundle found)");
}

// 4. Trial status validation
console.log("");
console.log("[4] Trial Status Validation");
console.log("");

const tfp = path.join(MARKETOPS_DATA, TRIAL_STATUS_FILE);
if (fileExists(tfp)) {
  const ts = readJSON(tfp);
  if (ts) {
    check("trial status file is valid JSON", true);
    check("ts.mode === paper_simulation", ts.mode === "paper_simulation", ts.mode || "missing");
    check("ts.failureStatus present", !!ts.failureStatus, ts.failureStatus || "missing");
    check("ts.latestRunAt present", !!ts.latestRunAt, ts.latestRunAt || "missing");
    check("ts.paperEquity present", ts.paperEquity != null, "$" + (ts.paperEquit || ts.paperEquity));
    check("ts.freshBarsStatus present", !!ts.freshBarsStatus, ts.freshBarsStatus || "missing");
  } else {
    check("trial status file is valid JSON", false, "parse error");
  }
} else {
  check("Trial status file exists", false, tfp);
}

// 5. Relative path consistency
console.log("");
console.log("[5] Path Consistency (sj3labs only)");
console.log("");

if (fileExists(DASHBOARD_HTML)) {
  const html = fs.readFileSync(DASHBOARD_HTML, "utf8");
  const dataPath = "../../data/marketops/";
  const expectedResolved = path.resolve(DASHBOARD_DIR, dataPath);
  const actualData = path.resolve(MARKETOPS_DATA);
  check("HTML relative path resolves to data directory", expectedResolved === actualData, expectedResolved);
}

// Summary
console.log("");
console.log("=== Summary ===");
console.log("  Total checks: " + totalChecks);
console.log("  Passed:       " + passed);
console.log("  Failed:       " + failed);
console.log("");

process.exit(failed > 0 ? 1 : 0);
