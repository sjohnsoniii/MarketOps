const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const analyticsRoot = path.join(projectRoot, "Data", "analytics");
const latestSummaryPath = path.join(analyticsRoot, "latest-analytics-summary.json");
const reportPath = path.join(projectRoot, "Reports", "Analytics", "marketops-metrics-performance-analytics-v0.1.md");
const requiredSourceFiles = [
  path.join(__dirname, "metricsEngine.js"),
  path.join(__dirname, "runAnalytics.js"),
  path.join(__dirname, "runAnalyticsQa.js")
];
const requiredTopLevelFields = [
  "generatedAt",
  "mode",
  "paperOnly",
  "sampleData",
  "analyticsVersion",
  "equityAnalytics",
  "tradeAnalytics",
  "regimeAnalytics",
  "riskAdjustedScore",
  "benchmarkComparisonPlaceholder",
  "publicSafety",
  "warnings"
];
const requiredEquityFields = [
  "startingEquity",
  "endingEquity",
  "totalPnl",
  "totalReturnPct",
  "maxDrawdownPct",
  "peakEquity",
  "troughEquity",
  "recoveryNeededPct",
  "stepVolatilityPct",
  "sharpeLikePlaceholder"
];
const requiredTradeFields = [
  "tradeCount",
  "wins",
  "losses",
  "flats",
  "winRatePct",
  "averageTradePnl",
  "longestWinStreak",
  "longestLossStreak",
  "sanitizedTradeOutcomes"
];
const requiredRegimes = ["trend_up", "trend_down", "choppy_sideways", "panic_drawdown", "low_volatility_drift", "melt_up"];

function restrictedTerms() {
  return [
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this", "trade"].join(" "),
    ["copy my", "bot"].join(" "),
    ["guaran", "teed"].join(""),
    ["quit your", "job"].join(" "),
    ["money", "printer"].join(" "),
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["liveTrading", ": true"].join(""),
    ["allowLiveTrading", "\": true"].join(""),
    ["broker connection", "enabled"].join(" "),
    ["live market data", "enabled"].join(" "),
    ["social auto-posting", "enabled"].join(" "),
    ["sms sending", "enabled"].join(" "),
    ["email sending", "enabled"].join(" "),
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

function newestRunFile() {
  if (!fs.existsSync(analyticsRoot)) return null;
  const files = fs.readdirSync(analyticsRoot).filter((file) => /^analytics-run-.*\.json$/.test(file));
  if (!files.length) return null;
  return files.map((file) => path.join(analyticsRoot, file)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function scanFiles(files) {
  const hits = [];
  files.forEach((filePath) => {
    const text = readText(filePath).toLowerCase();
    restrictedTerms().forEach((term) => {
      if (text.includes(term.toLowerCase())) hits.push(`${path.relative(projectRoot, filePath)} contains restricted term`);
    });
  });
  return hits;
}

function runAnalyticsQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "npm script analytics:run exists", Boolean(packageJson.scripts && packageJson.scripts["analytics:run"]), packageJson.scripts && packageJson.scripts["analytics:run"]);
  check(checks, "npm script analytics:qa exists", Boolean(packageJson.scripts && packageJson.scripts["analytics:qa"]), packageJson.scripts && packageJson.scripts["analytics:qa"]);
  requiredSourceFiles.forEach((filePath) => check(checks, `source exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  check(checks, "latest analytics summary exists", fs.existsSync(latestSummaryPath), latestSummaryPath);
  const runPath = newestRunFile();
  check(checks, "timestamped analytics run exists", Boolean(runPath), runPath || "missing");
  check(checks, "analytics report exists", fs.existsSync(reportPath), reportPath);

  let summary = null;
  try {
    summary = readJson(latestSummaryPath);
    check(checks, "latest analytics JSON valid", true, latestSummaryPath);
  } catch (error) {
    check(checks, "latest analytics JSON valid", false, error.message);
  }

  if (summary) {
    requiredTopLevelFields.forEach((field) => check(checks, `summary field exists: ${field}`, Object.prototype.hasOwnProperty.call(summary, field), field));
    check(checks, "mode is paper_simulation", summary.mode === "paper_simulation", summary.mode);
    check(checks, "paperOnly true", summary.paperOnly === true, String(summary.paperOnly));
    check(checks, "sampleData true", summary.sampleData === true, String(summary.sampleData));
    check(checks, "not financial advice flag true", summary.publicSafety && summary.publicSafety.notFinancialAdvice === true, JSON.stringify(summary.publicSafety || {}));
    check(checks, "no live market data flag true", summary.publicSafety && summary.publicSafety.noLiveMarketData === true, JSON.stringify(summary.publicSafety || {}));
    check(checks, "no broker flag true", summary.publicSafety && summary.publicSafety.noBrokerConnection === true, JSON.stringify(summary.publicSafety || {}));
    check(checks, "no social auto-posting flag true", summary.publicSafety && summary.publicSafety.noSocialAutoPosting === true, JSON.stringify(summary.publicSafety || {}));

    requiredEquityFields.forEach((field) => check(checks, `equity metric exists: ${field}`, summary.equityAnalytics && Object.prototype.hasOwnProperty.call(summary.equityAnalytics, field), field));
    requiredTradeFields.forEach((field) => check(checks, `trade metric exists: ${field}`, summary.tradeAnalytics && Object.prototype.hasOwnProperty.call(summary.tradeAnalytics, field), field));
    check(checks, "riskAdjustedScore is numeric", typeof summary.riskAdjustedScore === "number", String(summary.riskAdjustedScore));

    const regimes = new Set(((summary.regimeAnalytics && summary.regimeAnalytics.regimeRows) || []).map((row) => row.regime));
    requiredRegimes.forEach((regime) => check(checks, `regime represented: ${regime}`, regimes.has(regime), Array.from(regimes).join(", ")));
    check(checks, "overfitting warnings exist", Array.isArray(summary.regimeAnalytics && summary.regimeAnalytics.overfittingWarnings) && summary.regimeAnalytics.overfittingWarnings.length >= 2, "warnings");
    check(checks, "no raw trade ids in sanitized outcomes", !JSON.stringify(summary.tradeAnalytics && summary.tradeAnalytics.sanitizedTradeOutcomes || []).toLowerCase().includes("tradeid"), "sanitized outcomes");
  }

  const filesToScan = requiredSourceFiles.concat([latestSummaryPath, reportPath].filter((filePath) => fs.existsSync(filePath)));
  if (runPath) filesToScan.push(runPath);
  const hits = scanFiles(filesToScan);
  check(checks, "no restricted live/broker/promo terms", hits.length === 0, hits.join("; "));

  const passed = checks.every((item) => item.passed);
  console.log(passed ? "ANALYTICS QA PASS" : "ANALYTICS QA FAIL");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${checks.filter((item) => !item.passed).length}`);
  console.log(`latest summary: ${latestSummaryPath}`);
  console.log(`report: ${reportPath}`);
  if (!passed) {
    checks.filter((item) => !item.passed).forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed, checks };
}

if (require.main === module) {
  runAnalyticsQa();
}

module.exports = { runAnalyticsQa };
