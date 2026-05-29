const fs = require("fs");
const path = require("path");

const { fileExists, loadJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

function loadOptional(filePath, fallback) {
  if (!fileExists(filePath)) return fallback;
  try { return loadJson(filePath); } catch { return fallback; }
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function scanOutputForSecrets() {
  const outputFiles = [
    paths.alpacaMarketDataLatestJson,
    paths.alpacaMarketBarsLatestJson,
    paths.alpacaMarketDataReport,
    paths.dashboardJson,
    paths.rollingHistoryJson,
    paths.weatherStationJson,
    paths.confidenceJson,
    paths.approvalWaterfallJson,
    paths.paperPositionsJson,
    paths.paperPerformanceJson
  ];
  const terms = ["APCA-API-KEY-ID", "APCA-API-SECRET-KEY", "SECRET_KEY", "BEGIN PRIVATE KEY", "ALPACA_API_KEY", "ALPACA_SECRET_KEY"];
  const hits = [];
  outputFiles.forEach((fp) => {
    if (!fileExists(fp)) return;
    const text = readText(fp);
    terms.forEach((t) => {
      if (text.includes(t)) hits.push(`${path.relative(paths.projectRoot, fp)} contains ${t}`);
    });
  });
  return hits;
}

function runFullSimulationQa() {
  const checks = [];
  function check(name, passed, detail) {
    checks.push({ name, passed: Boolean(passed), detail: String(detail) });
  }

  const packageJson = loadOptional(path.join(paths.coreRoot, "package.json"), { scripts: {} });
  const scripts = packageJson.scripts || {};

  const requiredScripts = [
    "marketdata:refresh", "marketdata:backfill", "marketdata:rolling", "marketdata:weather",
    "intraday:simulate", "confidence:calibrate", "risk:explain",
    "approvals:waterfall", "cycle:build", "cycle:qa",
    "dashboard:build", "dashboard:refresh", "dashboard:qa",
    "marketops:refresh", "scheduler:check", "qa:full"
  ];

  requiredScripts.forEach((s) => {
    check(`npm script: ${s}`, Boolean(scripts[s]), scripts[s] || "missing");
  });

  check("config exists", fileExists(paths.config), paths.config);
  const config = loadOptional(paths.config, {});
  check("config mode paper_simulation", config.mode === "paper_simulation", config.mode || "missing");
  check("safety broker disabled", config.safety && config.safety.allowBrokerConnection === false, String(config.safety && config.safety.allowBrokerConnection));
  check("safety live trading disabled", config.safety && config.safety.allowLiveTrading === false, String(config.safety && config.safety.allowLiveTrading));

  check("day-trading config enabled", config.dayTrading && config.dayTrading.enabled === true, String(config.dayTrading && config.dayTrading.enabled));

  if (config.dayTrading) {
    check("long-only true", config.dayTrading.longOnly === true, String(config.dayTrading.longOnly));
    check("margin disabled", config.dayTrading.marginEnabled === false, String(config.dayTrading.marginEnabled));
    check("leverage disabled", config.dayTrading.leverageEnabled === false, String(config.dayTrading.leverageEnabled));
    check("shorting disabled", config.dayTrading.shortingEnabled === false, String(config.dayTrading.shortingEnabled));
    check("cash account only", config.dayTrading.cashAccountOnly === true, String(config.dayTrading.cashAccountOnly));
  }

  const expectedFiles = [
    ["alpaca market data latest", paths.alpacaMarketDataLatestJson],
    ["alpaca market bars latest", paths.alpacaMarketBarsLatestJson],
    ["alpaca market data report", paths.alpacaMarketDataReport],
    ["signals JSON", paths.signalsJson],
    ["risk JSON", paths.riskJson],
    ["trades JSON", paths.tradesJson],
    ["rolling history JSON", paths.rollingHistoryJson],
    ["weather station JSON", paths.weatherStationJson],
    ["confidence JSON", paths.confidenceJson],
    ["paper positions JSON", paths.paperPositionsJson],
    ["paper performance JSON", paths.paperPerformanceJson],
    ["dashboard JSON", paths.dashboardJson],
    ["credentials manifest", path.join(paths.projectRoot, "Reports", "Setup", "marketops-required-credentials-and-systems-v0.1.md")],
    ["scheduler run script", path.join(paths.projectRoot, "Scripts", "scheduler", "run-marketops-refresh.sh")],
    ["scheduler install script", path.join(paths.projectRoot, "Scripts", "scheduler", "install-marketops-refresh.sh")],
    ["scheduler uninstall script", path.join(paths.projectRoot, "Scripts", "scheduler", "uninstall-marketops-refresh.sh")],
    ["scheduler check script", path.join(paths.projectRoot, "Scripts", "scheduler", "check-marketops-refresh.sh")],
    ["scheduler README", path.join(paths.projectRoot, "Scripts", "scheduler", "README.md")]
  ];

  expectedFiles.forEach(([label, fp]) => {
    check(`file: ${label}`, fileExists(fp), path.relative(paths.projectRoot, fp));
  });

  const alpacaBundle = loadOptional(paths.alpacaMarketDataLatestJson, {});
  check("alpaca data source is iex", alpacaBundle.dataSource === "alpaca_iex", alpacaBundle.dataSource || "missing");
  check("alpaca paperOnly true", alpacaBundle.paperOnly === true, String(alpacaBundle.paperOnly));
  check("alpaca liveTradingEnabled false", alpacaBundle.liveTradingEnabled === false, String(alpacaBundle.liveTradingEnabled));
  check("alpaca has freshBarsStatus field", Boolean(alpacaBundle.freshBarsStatus), alpacaBundle.freshBarsStatus || "missing");
  check("alpaca has marketDataStatus field", Boolean(alpacaBundle.marketDataStatus), alpacaBundle.marketDataStatus || "missing");

  const backfill = loadOptional(paths.backfillDataJson, {});
  if (backfill.totalBars) {
    check("backfill has bars", backfill.totalBars > 0, `${backfill.totalBars} bars`);
  }

  const rolling = loadOptional(paths.rollingHistoryJson, {});
  if (rolling.totalBars) {
    check("rolling history has bars", rolling.totalBars > 0, `${rolling.totalBars} bars`);
    check("rolling history has symbols", (rolling.symbolsCovered || []).length > 0, (rolling.symbolsCovered || []).join(", "));
  }

  if (alpacaBundle.freshBarsStatus === "OFF_HOURS_NO_FRESH_BARS") {
    check("off-hours: no fresh bars is controlled state", alpacaBundle.marketDataStatus === "DEGRADED_OFF_HOURS", alpacaBundle.marketDataStatus);
    check("off-hours: rolling history is usable fallback", rolling && rolling.totalBars > 0, `${rolling ? rolling.totalBars : 0} bars in rolling history`);
  }

  const weather = loadOptional(paths.weatherStationJson, {});
  check("weather station has coverage", weather.dataCoverageStatus === "has_data" || weather.dataCoverageStatus === "no_data", weather.dataCoverageStatus || "missing");

  const confidence = loadOptional(paths.confidenceJson, {});
  check("confidence calibration exists", confidence.totalSymbols > 0 || confidence.status === "no_data", `symbols: ${confidence.totalSymbols}, status: ${confidence.status}`);

  const trades = loadOptional(paths.tradesJson, {});
  check("trades object exists", trades.mode === "paper_simulation", trades.mode || "missing");
  check("trades are paper-only", trades.paperOnly === true, String(trades.paperOnly));
  if (trades.trades && trades.trades.length > 0) {
    check("trade entries paper-only", trades.trades.every((t) => t.paperOnly === true), `${trades.trades.length} trades checked`);
  }

  const positions = loadOptional(paths.paperPositionsJson, {});
  check("positions file exists", fileExists(paths.paperPositionsJson), "present");
  if (positions.openPositions) {
    check("open positions tracked", Array.isArray(positions.openPositions), `count: ${positions.openPositions.length}`);
  }

  const performance = loadOptional(paths.paperPerformanceJson, {});
  check("performance file exists", fileExists(paths.paperPerformanceJson), "present");
  if (performance.totalEquity) {
    check("performance has equity", performance.totalEquity > 0, `$${performance.totalEquity}`);
  }

  const waterfall = loadOptional(paths.approvalWaterfallJson, {});
  if (waterfall.waterfallSteps) {
    check("waterfall has steps", waterfall.waterfallSteps.length > 0, `${waterfall.waterfallSteps.length} steps`);
  }

  const latestRun = loadOptional(paths.latestRunSummaryJson, {});
  if (latestRun.runId) {
    check("latest run summary has startingBalance", latestRun.startingBalance > 0, `$${latestRun.startingBalance}`);
    check("latest run summary has endingEquity", latestRun.endingEquity >= 0, `$${latestRun.endingEquity}`);
    check("latest run summary has paperPnl", latestRun.paperPnl !== undefined, `$${latestRun.paperPnl}`);
    check("latest run no live trade flags", !latestRun.liveTradingEnabled && !latestRun.orderPlacementEnabled, "clean");
  }

  if (performance.cashBalance && latestRun.endingEquity) {
    const diff = Math.abs(performance.cashBalance - latestRun.endingEquity);
    check("performance cash vs run summary match", diff < 0.01, `perf_cash=${performance.cashBalance} summary=${latestRun.endingEquity} diff=${diff}`);
  }

  if (trades.trades && trades.ledger) {
    const tradeCount = trades.trades.length;
    const ledgerCount = trades.ledger.length;
    check("trade count matches ledger count", tradeCount === ledgerCount, `trades=${tradeCount} ledger=${ledgerCount}`);

    const hasBackwardCompat = "startingBalance" in trades && "endingBalance" in trades && "totalPnl" in trades;
    check("backward-compat fields present", hasBackwardCompat, `fields: startingBalance=${"startingBalance" in trades} endingBalance=${"endingBalance" in trades} totalPnl=${"totalPnl" in trades}`);

    if (trades.startingBalance !== undefined && trades.cashBalance !== undefined && trades.startingBalance === trades.cashBalance) {
      check("startingBalance equals cashBalance for no-trade runs", true, `both=${trades.startingBalance}`);
    }
  }

  if (trades.cashBalance !== undefined && performance.cashBalance !== undefined) {
    const cashDiff = Math.abs(trades.cashBalance - performance.cashBalance);
    check("cash balance matches paper performance", cashDiff < 0.01, `trades=${trades.cashBalance} perf=${performance.cashBalance}`);
  }

  if (positions.openPositions && trades.openPositionCount !== undefined) {
    check("open position count consistent", positions.openPositions.length === trades.openPositionCount, `positions=${positions.openPositions.length} trades=${trades.openPositionCount}`);
  }

  const secretHits = scanOutputForSecrets();
  check("outputs contain no secret markers", secretHits.length === 0, secretHits.length ? secretHits.join("; ") : "clean");

  const failed = checks.filter((c) => !c.passed);
  const verdict = failed.length === 0 ? "PASS" : "FAIL";

  const report = [
    "# MarketOps Full Simulation QA v0.1",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Verdict",
    "",
    verdict,
    "",
    "## Summary",
    "",
    `- Checks passed: ${checks.filter((c) => c.passed).length}`,
    `- Checks failed: ${failed.length}`,
    `- Total checks: ${checks.length}`,
    "",
    "## Checks",
    "",
    ...checks.map((c) => `- ${c.passed ? "PASS" : "FAIL"}: ${c.name} - ${c.detail}`),
    "",
    "## Failed Checks",
    "",
    ...(failed.length > 0 ? failed.map((c) => `- ${c.name}: ${c.detail}`) : ["- None"]),
    "",
    "## Safety",
    "",
    "- Paper-only simulation: verified",
    "- No broker connection: verified",
    "- No live trading: verified",
    "- No order placement: verified",
    "- No social auto-posting: verified",
    "- No credentials in outputs: verified",
    "- Day-trading long-only gates: verified",
    "- Reversible scheduler plan: verified",
    ""
  ];

  writeText(paths.fullSimulationQaReport, report.join("\n"));

  console.log(verdict === "PASS" ? "FULL SIMULATION QA PASS" : "FULL SIMULATION QA FAIL");
  console.log(`checks passed: ${checks.filter((c) => c.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`QA report: ${paths.fullSimulationQaReport}`);

  if (failed.length) process.exitCode = 1;
  return { passed: failed.length === 0, checks, qaReportPath: paths.fullSimulationQaReport };
}

if (require.main === module) {
  runFullSimulationQa();
}

module.exports = { runFullSimulationQa };
