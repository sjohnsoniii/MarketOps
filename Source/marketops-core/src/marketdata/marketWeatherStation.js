const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function loadSource(label, jsonPath) {
  if (!fileExists(jsonPath)) return { label, available: false, data: null };
  try {
    return { label, available: true, data: loadJson(jsonPath) };
  } catch {
    return { label, available: false, data: null };
  }
}

function buildPerSymbolReport(rollingSymbols = {}, alpacaBars = []) {
  const symbols = {};
  const allKeys = new Set([...Object.keys(rollingSymbols), ...new Set((alpacaBars || []).map((b) => b.symbol))]);

  for (const symbol of allKeys) {
    const rs = rollingSymbols[symbol];
    const alpacaSymBars = (alpacaBars || []).filter((b) => b.symbol === symbol);
    const barCount = rs ? rs.barCount : alpacaSymBars.length;
    const firstTs = rs ? rs.firstTimestamp : (alpacaSymBars.length > 0 ? alpacaSymBars[0].timestamp : null);
    const lastTs = rs ? rs.lastTimestamp : (alpacaSymBars.length > 0 ? alpacaSymBars[alpacaSymBars.length - 1].timestamp : null);

    const sortedAlpaca = alpacaSymBars.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const latestMove = sortedAlpaca.length >= 2
      ? round(((sortedAlpaca[sortedAlpaca.length - 1].close - sortedAlpaca[0].close) / sortedAlpaca[0].close) * 100)
      : (rs ? null : null);

    const freshnessMinutes = lastTs ? round((Date.now() - new Date(lastTs).getTime()) / 60000) : null;
    const fresh = freshnessMinutes !== null && freshnessMinutes <= 390;
    const usableForSignal = barCount >= 10 && fresh;

    symbols[symbol] = {
      symbol,
      barCount,
      firstTimestamp: firstTs,
      lastTimestamp: lastTs,
      freshnessMinutes,
      fresh,
      latestMovePct: latestMove,
      usableForSignal,
      missingReason: !barCount ? "no_bars" : !fresh ? "stale" : null
    };
  }

  return symbols;
}

function buildWeatherStation() {
  const rolling = loadSource("rolling_history", paths.rollingHistoryJson);
  const alpacaBundle = loadSource("alpaca_latest", paths.alpacaMarketDataLatestJson);
  const backfill = loadSource("backfill", paths.backfillDataJson);

  const alpacaBars = alpacaBundle.available && alpacaBundle.data ? (alpacaBundle.data.bars || []) : [];
  const rollingSymbols = rolling.available && rolling.data ? (rolling.data.symbols || {}) : {};

  const perSymbol = buildPerSymbolReport(rollingSymbols, alpacaBars);

  const symbolsCovered = Object.keys(perSymbol).sort();
  const totalBars = Object.values(perSymbol).reduce((sum, s) => sum + s.barCount, 0);
  const usableCount = Object.values(perSymbol).filter((s) => s.usableForSignal).length;
  const staleSymbols = Object.values(perSymbol).filter((s) => s.freshnessMinutes !== null && s.freshnessMinutes > 390).map((s) => s.symbol);
  const missingSymbols = Object.values(perSymbol).filter((s) => s.barCount === 0).map((s) => s.symbol);

  const report = {
    schemaVersion: "0.1",
    generatedAt: new Date().toISOString(),
    latestRefreshAt: alpacaBundle.available ? (alpacaBundle.data.generatedAt || null) : null,
    lastSuccessfulMarketDataRefresh: alpacaBundle.available ? (alpacaBundle.data.generatedAt || null) : null,
    symbolsCovered,
    totalBars,
    perSymbol,
    dataCoverageStatus: totalBars > 0 ? "has_data" : "no_data",
    usableForSignalSummary: `${usableCount}/${symbolsCovered.length} symbols usable`,
    staleSymbols,
    missingSymbols,
    confidenceReadiness: usableCount > 0 ? "ready" : "not_ready",
    confidenceReadinessReason: usableCount > 0
      ? `${usableCount} symbols have enough bars and fresh data`
      : "No symbols have sufficient fresh data for confidence calibration",
    rollingHistoryAvailable: rolling.available,
    alpacaBundleAvailable: alpacaBundle.available,
    backfillAvailable: backfill.available,
    dataSources: {
      alpaca_latest: alpacaBundle.available,
      rolling_history: rolling.available,
      backfill: backfill.available
    }
  };

  writeJson(paths.weatherStationJson, report);

  const rowLines = symbolsCovered.map((sym) => {
    const s = perSymbol[sym];
    return `| ${s.symbol} | ${s.barCount} | ${s.firstTimestamp || "n/a"} | ${s.lastTimestamp || "n/a"} | ${s.freshnessMinutes !== null ? s.freshnessMinutes : "n/a"} | ${s.fresh ? "fresh" : "stale"} | ${s.latestMovePct !== null ? s.latestMovePct + "%" : "n/a"} | ${s.usableForSignal} | ${s.missingReason || "ok"} |`;
  });

  const reportText = [
    "# MarketOps Market Weather Station v0.1",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Latest market data refresh: ${report.lastSuccessfulMarketDataRefresh || "never"}`,
    `- Symbols covered: ${symbolsCovered.length}`,
    `- Total bars: ${totalBars}`,
    `- Data coverage: ${report.dataCoverageStatus}`,
    `- Usable for signal: ${report.usableForSignalSummary}`,
    `- Confidence readiness: ${report.confidenceReadiness}`,
    `- Stale symbols: ${staleSymbols.length ? staleSymbols.join(", ") : "none"}`,
    `- Missing symbols: ${missingSymbols.length ? missingSymbols.join(", ") : "none"}`,
    "",
    "## Per Symbol",
    "",
    "| Symbol | Bar Count | First | Last | Freshness (min) | Status | Latest Move | Usable | Missing Reason |",
    "|--------|-----------|-------|------|-----------------|--------|-------------|--------|----------------|",
    ...rowLines,
    "",
    "## Data Sources Available",
    "",
    ...Object.entries(report.dataSources).map(([k, v]) => `- ${k}: ${v ? "yes" : "no"}`),
    "",
    "## Safety",
    "",
    "- Paper only: true",
    "- No live trading",
    "- No order placement",
    "- Market data only",
    ""
  ];

  writeText(paths.weatherStationReport, reportText.join("\n"));

  return report;
}

function runCli() {
  try {
    const report = buildWeatherStation();
    console.log("MarketOps market weather station updated.");
    console.log(`Symbols covered: ${report.symbolsCovered.join(", ")}`);
    console.log(`Total bars: ${report.totalBars}`);
    console.log(`Data coverage: ${report.dataCoverageStatus}`);
    console.log(`Confidence readiness: ${report.confidenceReadiness}`);
    console.log(`Weather station JSON: ${paths.weatherStationJson}`);
    console.log(`Weather station report: ${paths.weatherStationReport}`);
    return report;
  } catch (error) {
    console.error("MarketOps weather station update failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { buildWeatherStation };
