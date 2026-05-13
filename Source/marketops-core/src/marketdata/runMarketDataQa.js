const fs = require("fs");
const path = require("path");

const { loadConfig } = require("../config/configLoader");
const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

const REQUIRED_SCRIPTS = ["marketdata:refresh", "marketdata:qa"];
const REQUIRED_FILES = [
  path.join(paths.coreRoot, "src", "marketdata", "alpacaMarketDataAdapter.js"),
  path.join(paths.coreRoot, "src", "marketdata", "localEnv.js"),
  paths.alpacaMarketDataLatestJson,
  paths.alpacaMarketBarsLatestJson,
  paths.alpacaMarketDataReport
];

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function walkFiles(rootDir, visitor) {
  if (!fs.existsSync(rootDir)) return;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(entry.name)) continue;
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) walkFiles(entryPath, visitor);
    else if (entry.isFile()) visitor(entryPath);
  }
}

function scanForForbiddenExecutionCode() {
  const hits = [];
  const terms = [
    "/v2/orders",
    "submitOrder",
    "placeOrder",
    "createOrder",
    "replaceOrder",
    "cancelOrder",
    "paper-api.alpaca.markets",
    "api.alpaca.markets/v2/account",
    "api.alpaca.markets/v2/orders"
  ];

  walkFiles(path.join(paths.coreRoot, "src"), (filePath) => {
    if (path.basename(filePath) === "runMarketDataQa.js") return;
    if (path.extname(filePath) !== ".js") return;
    const text = readText(filePath);
    terms.forEach((term) => {
      if (text.includes(term)) hits.push(`${path.relative(paths.coreRoot, filePath)} contains ${term}`);
    });
  });

  return hits;
}

function scanOutputsForSecrets() {
  const hits = [];
  const outputFiles = [paths.alpacaMarketDataLatestJson, paths.alpacaMarketBarsLatestJson, paths.alpacaMarketDataReport, paths.dashboardJson, paths.siteDashboardPublicV04Json];
  const terms = ["APCA-API-KEY-ID", "APCA-API-SECRET-KEY", "SECRET_KEY", "BEGIN PRIVATE KEY"];
  outputFiles.forEach((filePath) => {
    if (!fs.existsSync(filePath)) return;
    const text = readText(filePath);
    terms.forEach((term) => {
      if (text.includes(term)) hits.push(`${path.relative(paths.projectRoot, filePath)} contains restricted credential marker`);
    });
  });
  return hits;
}

function buildReport({ checks, bundle }) {
  const failed = checks.filter((item) => !item.passed);
  const latest = bundle
    ? `- symbols: ${bundle.symbolsRequested.join(", ")}
- bars loaded: ${bundle.bars.length}
- quotes loaded: ${bundle.quotes.length}
- latest bar timestamp: ${bundle.latestBarTimestamp}`
    : "- Market data bundle unavailable.";

  return `# MarketOps Market Data QA v0.1

Generated: ${new Date().toISOString()}

## Verdict

${failed.length ? "FAIL" : "PASS"}

## Latest Data

${latest}

## Safety Boundary

MarketOps uses Alpaca as a market-data-only adapter. Paper trades remain simulated locally. No order submission, account funding, broker execution, social posting, email sending, SMS sending, or public deployment is enabled by this layer.

## Checks

${checks.map((item) => `- ${item.passed ? "PASS" : "FAIL"}: ${item.name}${item.detail ? ` - ${item.detail}` : ""}`).join("\n")}`;
}

function runMarketDataQa() {
  const checks = [];

  const packageJson = loadJson(path.join(paths.coreRoot, "package.json"));
  REQUIRED_SCRIPTS.forEach((scriptName) => {
    check(checks, `script exists: ${scriptName}`, Boolean(packageJson.scripts && packageJson.scripts[scriptName]), packageJson.scripts && packageJson.scripts[scriptName]);
  });

  const config = loadConfig();
  check(checks, "config mode is paper_simulation", config.mode === "paper_simulation", config.mode);
  check(checks, "broker connection disabled", config.safety.allowBrokerConnection === false, String(config.safety.allowBrokerConnection));
  check(checks, "live trading disabled", config.safety.allowLiveTrading === false, String(config.safety.allowLiveTrading));

  REQUIRED_FILES.forEach((filePath) => {
    check(checks, `required file exists: ${path.relative(paths.projectRoot, filePath)}`, fileExists(filePath), filePath);
  });

  let bundle = null;
  try {
    bundle = loadJson(paths.alpacaMarketDataLatestJson);
    check(checks, "market data bundle valid JSON", true, paths.alpacaMarketDataLatestJson);
    check(checks, "dataSource is alpaca_iex", bundle.dataSource === "alpaca_iex", bundle.dataSource);
    check(checks, "paperOnly true", bundle.paperOnly === true, String(bundle.paperOnly));
    check(checks, "liveTradingEnabled false", bundle.liveTradingEnabled === false, String(bundle.liveTradingEnabled));
    check(checks, "orderPlacementEnabled false", bundle.orderPlacementEnabled === false, String(bundle.orderPlacementEnabled));
    check(checks, "bars loaded", Array.isArray(bundle.bars) && bundle.bars.length > 0, String(bundle.bars && bundle.bars.length));
    check(checks, "quotes loaded", Array.isArray(bundle.quotes) && bundle.quotes.length > 0, String(bundle.quotes && bundle.quotes.length));
    check(checks, "bars are labeled paper-only", (bundle.bars || []).every((bar) => bar.dataSource === "alpaca_iex" && bar.paperOnly === true && bar.liveTradingEnabled === false), "bar labels checked");
  } catch (error) {
    check(checks, "market data bundle valid JSON", false, error.message);
  }

  try {
    const dashboard = loadJson(paths.dashboardJson);
    check(checks, "paper dashboard includes Alpaca data source", dashboard.dataSource === "alpaca_iex", dashboard.dataSource);
    check(checks, "paper dashboard liveTradingEnabled false", dashboard.liveTradingEnabled === false, String(dashboard.liveTradingEnabled));
  } catch (error) {
    check(checks, "paper dashboard includes market data labels", false, error.message);
  }

  try {
    const publicBundle = loadJson(paths.siteDashboardPublicV04Json);
    check(checks, "public dashboard includes data source", publicBundle.dataSource === "alpaca_iex", publicBundle.dataSource);
    check(checks, "public dashboard paperOnly true", publicBundle.paperOnly === true, String(publicBundle.paperOnly));
    check(checks, "public dashboard liveTradingEnabled false", publicBundle.liveTradingEnabled === false, String(publicBundle.liveTradingEnabled));
    check(checks, "public dashboard refresh timestamp exists", Boolean(publicBundle.latestMarketDataRefreshAt), publicBundle.latestMarketDataRefreshAt || "missing");
  } catch (error) {
    check(checks, "public dashboard includes market data labels", false, error.message);
  }

  const executionHits = scanForForbiddenExecutionCode();
  check(checks, "no order/execution endpoint code exists", executionHits.length === 0, executionHits.join("; "));

  const secretHits = scanOutputsForSecrets();
  check(checks, "outputs contain no credential markers", secretHits.length === 0, secretHits.join("; "));

  writeText(paths.alpacaMarketDataReport, buildReport({ checks, bundle }));

  const failed = checks.filter((item) => !item.passed);
  console.log(failed.length ? "MARKET DATA QA FAIL" : "MARKET DATA QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`market data report path: ${paths.alpacaMarketDataReport}`);
  if (bundle) {
    console.log(`dataSource: ${bundle.dataSource}`);
    console.log(`bars loaded: ${bundle.bars.length}`);
    console.log(`quotes loaded: ${bundle.quotes.length}`);
    console.log(`latest bar timestamp: ${bundle.latestBarTimestamp}`);
  }

  if (failed.length) process.exitCode = 1;
  return { passed: failed.length === 0, checks, bundle };
}

if (require.main === module) {
  runMarketDataQa();
}

module.exports = { runMarketDataQa };
