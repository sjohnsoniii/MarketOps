const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const outputRoot = path.join(projectRoot, "Data", "dashboard");
const latestBundlePath = path.join(outputRoot, "dashboard-public-safe-v0.1.json");
const latestSummaryPath = path.join(outputRoot, "latest-dashboard-summary.json");
const reportPath = path.join(projectRoot, "Reports", "Dashboard", "marketops-dashboard-public-safe-v0.1.md");
const requiredSourceFiles = [
  path.join(__dirname, "dashboardAggregator.js"),
  path.join(__dirname, "runDashboardBuild.js"),
  path.join(__dirname, "runDashboardQa.js")
];
const requiredChartSections = [
  "equityCurve",
  "rollingEquity",
  "drawdownVisualData",
  "signalFunnel",
  "tradeOutcomeBars",
  "regimeScoreBars",
  "syntheticBenchmarkComparison"
];
const requiredCards = [
  "currentPaperPerformance",
  "signalFunnel",
  "tradeOutcomeDistribution",
  "riskEventSummary",
  "regimeSummary",
  "contentGenerationStats",
  "agentReviewStats"
];

function restrictedTerms() {
  return [
    ["C:", "\\Users"].join(""),
    ["trade", "Id"].join(""),
    ["signal", "Id"].join(""),
    ["riskDecision", "Id"].join(""),
    ["ledger", "Id"].join(""),
    ["position", "Value"].join(""),
    "quantity",
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this", "trade"].join(" "),
    ["copy my", "bot"].join(" "),
    ["guaran", "teed"].join(""),
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["liveTrading", ": true"].join(""),
    ["allowLiveTrading", "\": true"].join(""),
    ["broker connection", "enabled"].join(" "),
    ["live market data", "enabled"].join(" "),
    ["social auto-posting", "enabled"].join(" "),
    ["payment", "enabled"].join(" ")
  ];
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function newestBundleFile() {
  if (!fs.existsSync(outputRoot)) return null;
  const files = fs.readdirSync(outputRoot).filter((file) => /^dashboard-public-safe-\d{8}-\d{6}\.json$/.test(file));
  if (!files.length) return null;
  return files.map((file) => path.join(outputRoot, file)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function scanOutputFiles(files) {
  const hits = [];
  files.forEach((filePath) => {
    const text = readText(filePath).toLowerCase();
    restrictedTerms().forEach((term) => {
      if (text.includes(term.toLowerCase())) hits.push(`${path.relative(projectRoot, filePath)} contains restricted term`);
    });
  });
  return hits;
}

function runDashboardQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "npm script dashboard:build exists", Boolean(packageJson.scripts && packageJson.scripts["dashboard:build"]), packageJson.scripts && packageJson.scripts["dashboard:build"]);
  check(checks, "npm script dashboard:qa exists", Boolean(packageJson.scripts && packageJson.scripts["dashboard:qa"]), packageJson.scripts && packageJson.scripts["dashboard:qa"]);
  requiredSourceFiles.forEach((filePath) => check(checks, `source exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  check(checks, "latest dashboard bundle exists", fs.existsSync(latestBundlePath), latestBundlePath);
  check(checks, "latest dashboard summary exists", fs.existsSync(latestSummaryPath), latestSummaryPath);
  const timestampedBundle = newestBundleFile();
  check(checks, "timestamped dashboard bundle exists", Boolean(timestampedBundle), timestampedBundle || "missing");
  check(checks, "dashboard report exists", fs.existsSync(reportPath), reportPath);

  let bundle = null;
  try {
    bundle = readJson(latestBundlePath);
    check(checks, "latest dashboard bundle JSON valid", true, latestBundlePath);
  } catch (error) {
    check(checks, "latest dashboard bundle JSON valid", false, error.message);
  }

  if (bundle) {
    check(checks, "mode is paper_simulation", bundle.mode === "paper_simulation", bundle.mode);
    check(checks, "paperOnly true", bundle.paperOnly === true, String(bundle.paperOnly));
    check(checks, "sampleData true", bundle.sampleData === true, String(bundle.sampleData));
    check(checks, "notFinancialAdvice true", bundle.notFinancialAdvice === true, String(bundle.notFinancialAdvice));
    check(checks, "notLiveMarketData true", bundle.notLiveMarketData === true, String(bundle.notLiveMarketData));
    check(checks, "publicSafe true", bundle.publicSafe === true, String(bundle.publicSafe));
    check(checks, "no social auto-posting true", bundle.noSocialAutoPosting === true, String(bundle.noSocialAutoPosting));
    requiredCards.forEach((card) => check(checks, `dashboard card exists: ${card}`, bundle.dashboardCards && Object.prototype.hasOwnProperty.call(bundle.dashboardCards, card), card));
    requiredChartSections.forEach((section) => check(checks, `chart section exists: ${section}`, bundle.charts && Object.prototype.hasOwnProperty.call(bundle.charts, section), section));
    check(checks, "rolling equity is array", Array.isArray(bundle.charts && bundle.charts.rollingEquity), "rollingEquity");
    check(checks, "drawdown visual data has current run", Array.isArray(bundle.charts && bundle.charts.drawdownVisualData && bundle.charts.drawdownVisualData.currentRun), "currentRun");
    check(checks, "signal funnel has steps", Array.isArray(bundle.charts && bundle.charts.signalFunnel) && bundle.charts.signalFunnel.length >= 4, "signalFunnel");
    check(checks, "agent review auto apply false", bundle.dashboardCards && bundle.dashboardCards.agentReviewStats && bundle.dashboardCards.agentReviewStats.autoApplyAllowed === false, "agentReviewStats");
    check(checks, "content publish allowed false", bundle.dashboardCards && bundle.dashboardCards.contentGenerationStats && bundle.dashboardCards.contentGenerationStats.publishAllowed === false, "contentGenerationStats");
    check(checks, "disclaimers include paper simulation", Array.isArray(bundle.disclaimers) && bundle.disclaimers.some((item) => item.toLowerCase().includes("paper simulation")), "disclaimers");
    check(checks, "disclaimers include not financial advice", Array.isArray(bundle.disclaimers) && bundle.disclaimers.some((item) => item.toLowerCase().includes("not financial advice")), "disclaimers");
  }

  const filesToScan = [latestBundlePath, latestSummaryPath, reportPath].filter((filePath) => fs.existsSync(filePath));
  if (timestampedBundle) filesToScan.push(timestampedBundle);
  const hits = scanOutputFiles(filesToScan);
  check(checks, "dashboard outputs contain no private IDs/paths/risky terms", hits.length === 0, hits.join("; "));

  const passed = checks.every((item) => item.passed);
  console.log(passed ? "DASHBOARD QA PASS" : "DASHBOARD QA FAIL");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${checks.filter((item) => !item.passed).length}`);
  console.log(`bundle: ${latestBundlePath}`);
  console.log(`report: ${reportPath}`);
  if (!passed) {
    checks.filter((item) => !item.passed).forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed, checks };
}

if (require.main === module) {
  runDashboardQa();
}

module.exports = { runDashboardQa };
