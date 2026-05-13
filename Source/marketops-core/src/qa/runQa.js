const fs = require("fs");
const path = require("path");

const { getRequiredFalseFlags, loadConfig } = require("../config/configLoader");
const { qaReport } = require("../reports/markdownReports");
const { runSimulation } = require("../simulation/runSimulation");
const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { DEFAULT_GENERATED_AT } = require("../signals/simpleSignalScanner");

const REQUIRED_SCRIPTS = [
  "simulate",
  "equity",
  "qa",
  "paper:run",
  "paper:history",
  "paper:refresh-site",
  "paper:full"
];

const EXPECTED_OUTPUT_FILES = [
  paths.signalsJson,
  paths.riskJson,
  paths.tradesJson,
  paths.equityJson,
  paths.dashboardJson,
  paths.signalReport,
  paths.riskReport,
  paths.tradesReport,
  paths.equityReport,
  paths.performanceReport,
  paths.staffWriterReport,
  paths.qaReport
];

const AUTOMATION_OUTPUT_FILES = [
  paths.runHistoryJson,
  paths.latestRunSummaryJson,
  paths.siteDashboardPublicV04Json
];

function runQa(options = {}) {
  const requireAutomationOutputs = options.requireAutomationOutputs !== false;
  const checks = [];

  function check(name, passed, detail) {
    checks.push({ name, passed: Boolean(passed), detail });
  }

  try {
    const packageJson = loadJson(path.join(paths.coreRoot, "package.json"));
    REQUIRED_SCRIPTS.forEach((scriptName) => {
      check(`package script: ${scriptName}`, Boolean(packageJson.scripts && packageJson.scripts[scriptName]), packageJson.scripts && packageJson.scripts[scriptName] ? packageJson.scripts[scriptName] : "missing");
    });
  } catch (error) {
    check("package.json readable", false, error.message);
  }

  try {
    const config = loadConfig();
    check("config mode is paper_simulation", config.mode === "paper_simulation", `mode=${config.mode}`);
    getRequiredFalseFlags().forEach((flag) => {
      check(`unsafe flag false: ${flag}`, config.safety[flag] === false, `${flag}=${config.safety[flag]}`);
    });
  } catch (error) {
    check("config safety validation", false, error.message);
  }

  try {
    runSimulation({ writeOutputs: true });
    check("simulation outputs generated", true, "simulate pipeline completed inside QA");
  } catch (error) {
    check("simulation outputs generated", false, error.message);
  }

  EXPECTED_OUTPUT_FILES.filter((filePath) => filePath !== paths.qaReport).forEach((filePath) => {
    check(`output exists: ${path.relative(paths.projectRoot, filePath)}`, fileExists(filePath), filePath);
  });

  try {
    const paperResults = loadJson(paths.tradesJson);
    const trades = paperResults.trades || [];
    const safeTrades = trades.every((trade) => trade.paperOnly === true || trade.mode === "paper_simulation");
    check("paper trades are paper-only", safeTrades, `${trades.length} trades checked`);
  } catch (error) {
    check("paper trades are paper-only", false, error.message);
  }

  if (requireAutomationOutputs) {
    AUTOMATION_OUTPUT_FILES.forEach((filePath) => {
      check(`automation output exists: ${path.relative(paths.projectRoot, filePath)}`, fileExists(filePath), filePath);
    });
    validatePublicDashboardBundle(check);
    validateHistoryOutputs(check);
  } else {
    check("automation output validation skipped", true, "paper:run pre-history QA mode");
  }

  const unsafeHits = scanForUnsafeTerms(paths.coreRoot);
  check("unsafe live integration terms absent", unsafeHits.length === 0, unsafeHits.length === 0 ? "no obvious unsafe terms found" : unsafeHits.join("; "));

  const publicHits = scanPublicOutputsForUnsafeTerms();
  check("public output unsafe terms absent", publicHits.length === 0, publicHits.length === 0 ? "public files are clean" : publicHits.join("; "));

  const passed = checks.every((item) => item.passed);
  writeText(paths.qaReport, qaReport({ generatedAt: DEFAULT_GENERATED_AT, passed, checks }));
  check("qa report written", fileExists(paths.qaReport), paths.qaReport);

  const finalPassed = checks.every((item) => item.passed);
  return { passed: finalPassed, checks };
}

function validatePublicDashboardBundle(check) {
  try {
    const bundle = loadJson(paths.siteDashboardPublicV04Json);
    check("v0.4 dashboard paperOnly true", bundle.paperOnly === true, `paperOnly=${bundle.paperOnly}`);
    check("v0.4 dashboard sampleData true", bundle.sampleData === true, `sampleData=${bundle.sampleData}`);
    const raw = fs.readFileSync(paths.siteDashboardPublicV04Json, "utf8");
    const rawTerms = getRawInternalTerms();
    const hits = rawTerms.filter((term) => raw.includes(term));
    check("v0.4 dashboard raw IDs absent", hits.length === 0, hits.length === 0 ? "no raw IDs found" : hits.join(", "));
  } catch (error) {
    check("v0.4 dashboard validation", false, error.message);
  }
}

function validateHistoryOutputs(check) {
  try {
    const latest = loadJson(paths.latestRunSummaryJson);
    const required = ["runId", "generatedAt", "mode", "paperOnly", "sampleData", "endingEquity", "qaStatus"];
    const missing = required.filter((field) => !(field in latest));
    check("latest history summary public-safe fields", missing.length === 0, missing.length === 0 ? "required fields present" : `missing: ${missing.join(", ")}`);
    check("latest history mode is paper_simulation", latest.mode === "paper_simulation", `mode=${latest.mode}`);
    check("latest history paperOnly true", latest.paperOnly === true, `paperOnly=${latest.paperOnly}`);
  } catch (error) {
    check("latest history summary readable", false, error.message);
  }
}

function getRawInternalTerms() {
  return [
    ["trade", "Id"].join(""),
    ["signal", "Id"].join(""),
    ["risk", "Decision", "Id"].join(""),
    ["position", "Value"].join(""),
    ["quan", "tity"].join("")
  ];
}

function getUnsafePhraseTerms() {
  return [
    "boat",
    "yacht",
    ["Sam", "-only"].join(""),
    "my account",
    "copy my bot",
    "copy this trade",
    "buy now",
    "sell now",
    "guaranteed",
    "quit your job",
    "money printer",
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["liveTrading", ": true"].join(""),
    ["allowLiveTrading", "\": true"].join("")
  ];
}

function scanForUnsafeTerms(rootDir) {
  const terms = [
    ["ALPACA", "_API_KEY"].join(""),
    ["COINBASE", "_API_KEY"].join(""),
    ["liveTrading", ": true"].join(""),
    ["allowLiveTrading", "\": true"].join("")
  ];
  const ignoredDirs = new Set(["node_modules", ".git"]);
  const hits = [];

  function walk(dirPath) {
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) walk(path.join(dirPath, entry.name));
        continue;
      }

      if (!entry.isFile()) continue;
      const filePath = path.join(dirPath, entry.name);
      const ext = path.extname(filePath).toLowerCase();
      if (![".js", ".json", ".md"].includes(ext)) continue;

      const text = fs.readFileSync(filePath, "utf8");
      terms.forEach((term) => {
        if (text.includes(term)) {
          hits.push(`${path.relative(rootDir, filePath)} contains ${term}`);
        }
      });
    }
  }

  walk(rootDir);
  return hits;
}

function scanPublicOutputsForUnsafeTerms() {
  const roots = [paths.sj3labsMarketOpsDataRoot, path.join(paths.sj3labsRoot, "marketops")];
  const terms = getUnsafePhraseTerms().concat(getRawInternalTerms());
  const hits = [];

  roots.forEach((rootDir) => {
    if (!fs.existsSync(rootDir)) return;
    walkPublic(rootDir, (filePath) => {
      const text = fs.readFileSync(filePath, "utf8");
      terms.forEach((term) => {
        if (text.includes(term)) hits.push(`${path.relative(paths.sj3labsRoot, filePath)} contains ${term}`);
      });
    });
  });

  return hits;
}

function walkPublic(dirPath, visitor) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkPublic(entryPath, visitor);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entryPath).toLowerCase();
    if ([".html", ".css", ".js", ".json", ".md"].includes(ext)) visitor(entryPath);
  }
}

function printQaSummary(result) {
  const passedCount = result.checks.filter((check) => check.passed).length;
  const failedCount = result.checks.length - passedCount;
  console.log("");
  console.log(result.passed ? "QA PASS" : "QA FAIL");
  console.log(`checks passed: ${passedCount}`);
  console.log(`checks failed: ${failedCount}`);
  console.log(`qa report path: ${paths.qaReport}`);
  console.log("");
}

if (require.main === module) {
  const result = runQa({ requireAutomationOutputs: true });
  printQaSummary(result);
  if (!result.passed) process.exitCode = 1;
}

module.exports = { runQa, scanForUnsafeTerms, scanPublicOutputsForUnsafeTerms };
