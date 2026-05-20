const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const CORE_ROOT = path.join(__dirname, "..", "..");
const PROJECT_ROOT = path.join(CORE_ROOT, "..", "..");
const SJ3LABS_ROOT = path.join(PROJECT_ROOT, "..", "sj3labs");
const MARKETOPS_DATA = path.join(SJ3LABS_ROOT, "data", "marketops");
const DASHBOARD_HTML = path.join(SJ3LABS_ROOT, "marketops", "dashboard", "index.html");

const STALE_VALUES = ["4218.75", "4192.26"];
const HARDCODED_TRADE_ROWS = ["Trade 1", "Trade 2"];

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
console.log("=== MarketOps Production Update QA ===");
console.log("");

// 1. Dashboard HTML fetches current files
console.log("[1] Dashboard Fetch Configuration");
console.log("");

if (fileExists(DASHBOARD_HTML)) {
  const html = fs.readFileSync(DASHBOARD_HTML, "utf8");
  check("HTML references manifest URL", html.includes("marketops-public-update-manifest-v0.1.json"));
  check("HTML references bundle v0.4 URL", html.includes("dashboard-bundle-public-v0.4.json"));
  check("HTML references bundle v0.3 URL", html.includes("dashboard-bundle-public-v0.3.json"));
  check("HTML references safe bundle URL", html.includes("dashboard-public-safe-v0.1.json"));
  check("HTML references trial status URL", html.includes("marketops-public-trial-status-v0.1.json"));
  check("HTML uses version cache-busting", html.includes("getVersionCacheBust"));
  check("HTML has loadPublicUpdateManifest", html.includes("loadPublicUpdateManifest"));
  check("HTML has showManifestStatus", html.includes("showManifestStatus"));
  check("HTML has renderNoData", html.includes("renderNoData"));
  check("HTML has renderRiskMetrics", html.includes("renderRiskMetrics"));
  check("HTML has renderRecentTrades", html.includes("renderRecentTrades"));
  check("HTML has renderVehicleActivityFromBundle", html.includes("renderVehicleActivityFromBundle"));
} else {
  console.log("  SKIP  (dashboard HTML not found at " + DASHBOARD_HTML + ")");
}

// 2. Manifest file exists and is valid
console.log("");
console.log("[2] Public Update Manifest");
console.log("");

const manifestPath = path.join(MARKETOPS_DATA, "marketops-public-update-manifest-v0.1.json");
const manifest = readJSON(manifestPath);
check("Manifest file exists", !!manifest);
if (manifest) {
  check("Manifest has schemaVersion", !!manifest.schemaVersion);
  check("Manifest has generatedAt", !!manifest.generatedAt);
  check("Manifest has refreshStatus", !!manifest.refreshStatus);
  check("Manifest has publishStatus", !!manifest.publishStatus);
  check("Manifest has paperCycleId", !!manifest.paperCycleId);
  check("Manifest has universeProfile", !!manifest.universeProfile, JSON.stringify(manifest.universeProfile));
  check("Manifest has dataBundleFile", !!manifest.dataBundleFile);
  check("Manifest has publicTrialStatusFile", !!manifest.publicTrialStatusFile);
  check("Manifest has sourceCommitBeforePublish", !!manifest.sourceCommitBeforePublish);
  check("Manifest has sj3labsCommitBeforePublish", !!manifest.sj3labsCommitBeforePublish);
  check("Manifest has expectedVercelTrigger", manifest.expectedVercelTrigger === true || manifest.expectedVercelTrigger === false);
}

// 3. Bundle file exists and is current
console.log("");
console.log("[3] Public Dashboard Bundle");
console.log("");

const bundlePath = path.join(MARKETOPS_DATA, "dashboard-bundle-public-v0.4.json");
const bundle = readJSON(bundlePath);
check("Bundle file exists", !!bundle);
if (bundle) {
  check("Bundle has paperOnly === true", bundle.paperOnly === true);
  check("Bundle has liveTradingEnabled === false", bundle.liveTradingEnabled === false);
  check("Bundle has generatedAt", !!bundle.generatedAt);
  check("Bundle has startingBalance", (bundle.startingBalance || 0) > 0, "$" + bundle.startingBalance);
  check("Bundle has vehiclesScanned", (bundle.vehiclesScanned || 0) > 0, String(bundle.vehiclesScanned));
  check("Bundle has riskDeskSummary", !!bundle.riskDeskSummary);
  check("Bundle has signalFunnel", Array.isArray(bundle.signalFunnel));
  check("Bundle has riskDecisionMix", !!bundle.riskDecisionMix);
  check("Bundle has rollingMarketMovement", Array.isArray(bundle.rollingMarketMovement));
  check("Bundle has publicSafeVehicleContribution", Array.isArray(bundle.publicSafeVehicleContribution));
  check("Bundle has milestoneTargets", Array.isArray(bundle.milestoneTargets));
  check("Bundle has tradeOutcomeMix", !!bundle.tradeOutcomeMix);
  check("Bundle has dataProvenance.chartDataSources", !!(bundle.dataProvenance && bundle.dataProvenance.chartDataSources));
}

// 4. Trial status file exists
console.log("");
console.log("[4] Public Trial Status");
console.log("");

const trialPath = path.join(MARKETOPS_DATA, "marketops-public-trial-status-v0.1.json");
const trial = readJSON(trialPath);
check("Trial status file exists", !!trial);
if (trial) {
  check("ts.mode === paper_simulation", trial.mode === "paper_simulation");
  check("ts.failureStatus present", !!trial.failureStatus);
  check("ts.paperEquity present", trial.paperEquity != null);
  check("ts.latestRunAt present", !!trial.latestRunAt);
}

// 5. No stale hardcoded values
console.log("");
console.log("[5] Stale Value Detection");
console.log("");

if (fileExists(DASHBOARD_HTML)) {
  const html = fs.readFileSync(DASHBOARD_HTML, "utf8");
  for (const val of STALE_VALUES) {
    check("No stale value '" + val + "' in HTML", !html.includes(val));
  }
  for (const val of HARDCODED_TRADE_ROWS) {
    if (html.includes(val)) {
      const cleaned = html.replace(/<script[\s\S]*?<\/script>/g, "");
      const count = (cleaned.match(new RegExp(val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")) || []).length;
      check("Hardcoded '" + val + "' in visible HTML", count <= 1, count + " occurrences");
    }
  }
}

// 6. sj3labs git status
console.log("");
console.log("[6] sj3labs Git Status");
console.log("");

if (fileExists(path.join(SJ3LABS_ROOT, ".git"))) {
  try {
    const status = execSync("git status --short", { cwd: SJ3LABS_ROOT, encoding: "utf8", stdio: "pipe" }).trim();
    const lastCommit = execSync("git log --oneline -1", { cwd: SJ3LABS_ROOT, encoding: "utf8", stdio: "pipe" }).trim();
    check("sj3labs git repo exists", true);
    check("sj3labs last commit", !!lastCommit, lastCommit);

    const changedFiles = status ? status.split("\n").filter(Boolean).map(l => l.trim().split(/\s+/).pop()) : [];
    const nonAllowlisted = changedFiles.filter(f => !f.startsWith("data/marketops/") || !f.endsWith(".json"));
    check("All changed files are allowlisted", nonAllowlisted.length === 0, nonAllowlisted.length > 0 ? "Non-allowlisted: " + nonAllowlisted.join(", ") : "clean");
  } catch (e) {
    check("sj3labs git check", false, e.message);
  }
} else {
  check("sj3labs git repo", false, "no .git directory");
}

// 7. Cache-busting path exists
console.log("");
console.log("[7] Cache-Busting Validation");
console.log("");

if (fileExists(DASHBOARD_HTML)) {
  const html = fs.readFileSync(DASHBOARD_HTML, "utf8");
  const scriptSection = html.substring(html.lastIndexOf("<script"), html.lastIndexOf("</script>"));
  check("Cache-busting uses generatedAt when available", scriptSection.includes("dashboardBundleGeneratedAt"));
  check("Fallback to Date.now() exists", scriptSection.includes("Date.now()"));
  check("'cache: no-store' used", scriptSection.includes("cache: 'no-store'"));
}

// 8. Dashboard rendering capability
console.log("");
console.log("[8] Rendering Capability");
console.log("");

if (fileExists(DASHBOARD_HTML)) {
  const html = fs.readFileSync(DASHBOARD_HTML, "utf8");
  check("Can render Performance Charts", html.includes("equity-chart") && html.includes("pnl-chart"));
  check("Can render Risk and Pipeline", html.includes("risk-metrics") && html.includes("risk-mix-chart"));
  check("Can render Vehicle Activity", html.includes("activity-chart") && html.includes("vehicle-contribution-chart"));
  check("Can render Recent Paper Trades", html.includes("trades-tbody") && html.includes("trades-empty-row"));
  check("Can render empty states", html.includes("renderNoData") && html.includes("No paper trades"));
}

// Summary
console.log("");
console.log("=== Summary ===");
console.log("  Total checks: " + totalChecks);
console.log("  Passed:       " + passed);
console.log("  Failed:       " + failed);
console.log("");

process.exit(failed > 0 ? 1 : 0);
