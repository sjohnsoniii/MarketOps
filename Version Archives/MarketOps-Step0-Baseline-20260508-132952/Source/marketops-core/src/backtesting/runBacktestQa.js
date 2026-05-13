const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const outputRoot = path.join(projectRoot, "Data", "backtests");
const latestSummaryPath = path.join(outputRoot, "latest-backtest-summary.json");
const reportPath = path.join(projectRoot, "Reports", "Backtesting", "marketops-backtesting-regime-lab-v0.1.md");
const requiredSourceFiles = [
  "runBacktestLab.js",
  "runBacktestQa.js",
  "regimeClassifier.js",
  "backtestEngine.js",
  "backtestScoring.js",
  "sampleHistoricalSeries.js"
].map((file) => path.join(__dirname, file));
const expectedRegimes = ["trend_up", "trend_down", "choppy_sideways", "panic_drawdown", "low_volatility_drift", "melt_up"];
const requiredScoreFields = ["totalReturnPct", "maxDrawdownPct", "tradeCount", "winRatePct", "averageSimulatedTradeReturnPct", "regimeScore", "riskWarnings", "overfittingWarnings", "benchmarkReturnPct", "benchmarkComparisonPct", "passFailNote"];
function restrictedTerms() {
  return [
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this", "trade"].join(" "),
    ["copy my", "bot"].join(" "),
    ["guaran", "teed"].join(""),
    ["profitability", "proven"].join(" "),
    ["profitable", "strategy"].join(" "),
    ["quit your", "job"].join(" "),
    ["money", "printer"].join(" "),
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["liveTrading", ": true"].join(""),
    ["allowLiveTrading", "\": true"].join(""),
    ["broker connection", "enabled"].join(" "),
    ["real-money trading", "enabled"].join(" "),
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
  if (!fs.existsSync(outputRoot)) return null;
  const files = fs.readdirSync(outputRoot).filter((file) => /^backtest-run-.*\.json$/.test(file));
  if (!files.length) return null;
  return files.map((file) => path.join(outputRoot, file)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
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

function runBacktestQa() {
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "npm script backtest:run exists", Boolean(packageJson.scripts && packageJson.scripts["backtest:run"]), packageJson.scripts && packageJson.scripts["backtest:run"]);
  check(checks, "npm script backtest:qa exists", Boolean(packageJson.scripts && packageJson.scripts["backtest:qa"]), packageJson.scripts && packageJson.scripts["backtest:qa"]);

  requiredSourceFiles.forEach((filePath) => check(checks, `source exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  check(checks, "latest summary exists", fs.existsSync(latestSummaryPath), latestSummaryPath);
  const runPath = newestRunFile();
  check(checks, "timestamped run JSON exists", Boolean(runPath), runPath || "missing");
  check(checks, "backtest report exists", fs.existsSync(reportPath), reportPath);

  let summary = null;
  try {
    summary = readJson(latestSummaryPath);
    check(checks, "latest summary JSON valid", true, latestSummaryPath);
  } catch (error) {
    check(checks, "latest summary JSON valid", false, error.message);
  }

  if (summary) {
    check(checks, "mode is paper_simulation", summary.mode === "paper_simulation", summary.mode);
    check(checks, "paperOnly true", summary.paperOnly === true, String(summary.paperOnly));
    check(checks, "sampleData true", summary.sampleData === true, String(summary.sampleData));
    check(checks, "syntheticHistoricalPreview true", summary.syntheticHistoricalPreview === true, String(summary.syntheticHistoricalPreview));
    check(checks, "notLiveMarketData true", summary.notLiveMarketData === true, String(summary.notLiveMarketData));
    const represented = new Set((summary.regimeResults || []).map((item) => item.classification && item.classification.regime));
    expectedRegimes.forEach((regime) => check(checks, `expected regime represented: ${regime}`, represented.has(regime), Array.from(represented).join(", ")));
    (summary.regimeResults || []).forEach((item) => {
      requiredScoreFields.forEach((field) => check(checks, `${item.periodId} score field exists: ${field}`, item.score && Object.prototype.hasOwnProperty.call(item.score, field), field));
      check(checks, `${item.periodId} has sample flags`, item.sampleData === true && item.syntheticHistoricalPreview === true && item.notLiveMarketData === true, item.periodId);
    });
    check(checks, "public safety says no profitability claim", summary.publicSafety && summary.publicSafety.noProfitabilityClaim === true, JSON.stringify(summary.publicSafety || {}));
  }

  const filesToScan = requiredSourceFiles.concat([latestSummaryPath, reportPath].filter((filePath) => fs.existsSync(filePath)));
  if (runPath) filesToScan.push(runPath);
  const hits = scanFiles(filesToScan);
  check(checks, "no restricted live/broker/promo terms", hits.length === 0, hits.join("; "));

  const passed = checks.every((item) => item.passed);
  console.log(passed ? "BACKTEST QA PASS" : "BACKTEST QA FAIL");
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
  runBacktestQa();
}

module.exports = { runBacktestQa };

