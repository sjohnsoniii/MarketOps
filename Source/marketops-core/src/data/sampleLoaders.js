const { fileExists, loadJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

function loadVehicles(filePath = paths.sampleVehicles) {
  return loadJson(filePath).filter((vehicle) => vehicle.active);
}

function loadMarketBars(filePath = null) {
  const resolvedPath = filePath || (fileExists(paths.alpacaMarketBarsLatestJson) ? paths.alpacaMarketBarsLatestJson : paths.sampleMarketBars);
  return loadJson(resolvedPath).slice().sort((a, b) => {
    if (a.symbol !== b.symbol) return a.symbol.localeCompare(b.symbol);
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
}

function loadMarketDataInfo() {
  if (fileExists(paths.alpacaMarketDataLatestJson)) {
    const bundle = loadJson(paths.alpacaMarketDataLatestJson);
    return {
      dataSource: bundle.dataSource || "alpaca_iex",
      latestMarketDataRefreshAt: bundle.generatedAt || null,
      latestBarTimestamp: bundle.latestBarTimestamp || null,
      paperOnly: bundle.paperOnly === true,
      liveTradingEnabled: bundle.liveTradingEnabled === true,
      orderPlacementEnabled: bundle.orderPlacementEnabled === true,
      feed: bundle.feed || "iex",
      unsupportedSymbols: bundle.unsupportedSymbols || []
    };
  }

  return {
    dataSource: "deterministic_sample",
    latestMarketDataRefreshAt: null,
    latestBarTimestamp: null,
    paperOnly: true,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    feed: "sample",
    unsupportedSymbols: []
  };
}

module.exports = { loadMarketBars, loadMarketDataInfo, loadVehicles };
