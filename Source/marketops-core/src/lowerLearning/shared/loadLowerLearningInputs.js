const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..", "..", "..", "..", "..");
const dataRoot = path.join(projectRoot, "Data");
const sourceRoot = path.join(__dirname, "..", "..");

function safeLoad(filePath, label) {
  try {
    if (!fs.existsSync(filePath)) {
      return { found: false, data: null, note: `${label} not found at ${filePath}` };
    }
    const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    const data = JSON.parse(raw);
    return { found: true, data, note: `${label} loaded (${filePath})` };
  } catch (e) {
    return { found: false, data: null, note: `${label} load failed: ${e.message}` };
  }
}

function discoverCandidates(baseDir, patterns) {
  const results = [];
  for (const pat of patterns) {
    const fullPath = path.join(baseDir, pat);
    if (fs.existsSync(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function loadLowerLearningInputs() {
  const inputs = {
    loadedAt: new Date().toISOString(),
    sources: {},
    limitations: []
  };

  const tryPaths = {
    dashboardBundle: path.join(dataRoot, "dashboard", "dashboard-data-bundle-v0.1.json"),
    dashboardHealth: path.join(dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json"),
    dashboardSummary: path.join(dataRoot, "dashboard", "latest-dashboard-data-summary.json"),
    rollingHistory: path.join(dataRoot, "market-data", "rolling", "rolling-market-history-v0.1.json"),
    alpacaBars: path.join(dataRoot, "market-data", "alpaca", "alpaca-market-bars-latest-v0.1.json"),
    alpacaData: path.join(dataRoot, "market-data", "alpaca", "alpaca-market-data-latest-v0.1.json"),
    weatherStation: path.join(dataRoot, "market-data", "market-weather-station-v0.1.json"),
    paperTrades: path.join(dataRoot, "paper", "trades", "paper-trades-v0.1.json"),
    paperPerformance: path.join(dataRoot, "paper", "performance", "paper-performance-v0.1.json"),
    paperPositions: path.join(dataRoot, "paper", "positions", "paper-positions-v0.1.json"),
    equityCurve: path.join(dataRoot, "paper", "equity", "equity-curve-v0.1.json"),
    signalScan: path.join(dataRoot, "paper", "signals", "signal-scan-v0.1.json"),
    riskDecisions: path.join(dataRoot, "paper", "risk", "risk-decisions-v0.1.json"),
    riskDeskLearning: path.join(dataRoot, "paper", "risk", "risk-desk-learning-v0.1.json"),
    learningProbes: path.join(dataRoot, "paper", "risk", "learning-probe-records-v0.1.json"),
    config: path.join(sourceRoot, "config", "marketops.phase1.config.json")
  };

  for (const [key, filePath] of Object.entries(tryPaths)) {
    const result = safeLoad(filePath, key);
    inputs.sources[key] = result;
    if (!result.found) {
      inputs.limitations.push(result.note);
    }
  }

  inputs.limitations = [...new Set(inputs.limitations)];

  return inputs;
}

module.exports = { loadLowerLearningInputs, safeLoad, discoverCandidates };
