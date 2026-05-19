const https = require("https");
const { URL } = require("url");

const { loadVehicles } = require("../data/sampleLoaders");
const { writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { parseLocalEnv } = require("./localEnv");

const DATA_SOURCE = "alpaca_iex";
const DEFAULT_DATA_BASE_URL = "https://data.alpaca.markets";
const DEFAULT_FEED = "iex";
const DEFAULT_TIMEFRAME = "1Min";
const DEFAULT_BAR_LIMIT = 20;
const SUPPORTED_ASSET_TYPES = new Set(["EQUITY", "ETF"]);
const LEGACY_KEY_NAME = ["ALPACA", "API", "KEY"].join("_");
const LEGACY_SECRET_NAME = ["ALPACA", "SECRET", "KEY"].join("_");
const LEGACY_DATA_URL_NAME = ["ALPACA", "MARKET", "DATA", "URL"].join("_");

function redactErrorMessage(message) {
  return String(message || "")
    .replace(/APCA[-_A-Z0-9]*=([^&\s]+)/gi, "APCA_REDACTED")
    .replace(/key=([^&\s]+)/gi, "key=REDACTED")
    .replace(/secret=([^&\s]+)/gi, "secret=REDACTED");
}

function loadAlpacaDataConfig() {
  const localEnv = {
    ...parseLocalEnv(paths.localEnv),
    ...parseLocalEnv(paths.coreLocalEnv)
  };
  const keyId = localEnv.APCA_API_KEY_ID || process.env.APCA_API_KEY_ID || localEnv[LEGACY_KEY_NAME] || process.env[LEGACY_KEY_NAME];
  const secretKey = localEnv.APCA_API_SECRET_KEY || process.env.APCA_API_SECRET_KEY || localEnv[LEGACY_SECRET_NAME] || process.env[LEGACY_SECRET_NAME];
  const baseUrl = localEnv.MARKETOPS_ALPACA_DATA_BASE_URL || process.env.MARKETOPS_ALPACA_DATA_BASE_URL || localEnv[LEGACY_DATA_URL_NAME] || process.env[LEGACY_DATA_URL_NAME] || DEFAULT_DATA_BASE_URL;
  const feed = localEnv.MARKETOPS_ALPACA_DATA_FEED || process.env.MARKETOPS_ALPACA_DATA_FEED || DEFAULT_FEED;
  const timeframe = localEnv.MARKETOPS_ALPACA_BAR_TIMEFRAME || process.env.MARKETOPS_ALPACA_BAR_TIMEFRAME || DEFAULT_TIMEFRAME;
  const barLimit = Number(localEnv.MARKETOPS_ALPACA_BAR_LIMIT || process.env.MARKETOPS_ALPACA_BAR_LIMIT || DEFAULT_BAR_LIMIT);

  assertDataOnlyConfig({ keyId, secretKey, baseUrl, feed, timeframe, barLimit });

  return {
    keyId,
    secretKey,
    baseUrl: normalizeDataBaseUrl(baseUrl),
    feed,
    timeframe,
    barLimit
  };
}

function normalizeDataBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_DATA_BASE_URL).replace(/\/+$/, "").replace(/\/v2$/i, "");
}

function assertDataOnlyConfig(config) {
  if (!config.keyId || !config.secretKey) {
    throw new Error("Alpaca data credentials are missing from local-only .env.local.");
  }

  const baseUrl = normalizeDataBaseUrl(config.baseUrl).toLowerCase();
  if (baseUrl !== DEFAULT_DATA_BASE_URL) {
    throw new Error("Unsafe Alpaca endpoint configured. MarketOps only allows the Alpaca market data endpoint.");
  }

  if (baseUrl.includes("paper-api") || baseUrl.includes("api.alpaca.markets") || baseUrl.includes("trading")) {
    throw new Error("Unsafe Alpaca trading endpoint detected. MarketOps market data adapter is data-only.");
  }

  if (config.feed !== "iex") {
    throw new Error(`Unsafe Alpaca feed configured: ${config.feed}. MarketOps v0.1 allows IEX data only.`);
  }

  if (!Number.isFinite(config.barLimit) || config.barLimit < 2 || config.barLimit > 50) {
    throw new Error("Unsafe Alpaca bar limit. Expected 2-50 bars for bounded local paper simulation.");
  }
}

function requestJson(url, headers) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers, timeout: 20000 }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Alpaca data request failed with HTTP ${response.statusCode}.`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Alpaca data response was not valid JSON: ${error.message}`));
        }
      });
    });

    request.on("timeout", () => {
      request.destroy(new Error("Alpaca data request timed out."));
    });
    request.on("error", (error) => reject(error));
  });
}

function buildBarsUrl(config, symbols) {
  const url = new URL("/v2/stocks/bars", config.baseUrl);
  url.searchParams.set("symbols", symbols.join(","));
  url.searchParams.set("timeframe", config.timeframe);
  url.searchParams.set("limit", String(config.barLimit));
  url.searchParams.set("feed", config.feed);
  url.searchParams.set("adjustment", "raw");
  return url.toString();
}

function buildQuotesUrl(config, symbols) {
  const url = new URL("/v2/stocks/quotes/latest", config.baseUrl);
  url.searchParams.set("symbols", symbols.join(","));
  url.searchParams.set("feed", config.feed);
  return url.toString();
}

function normalizeBars(rawBarsBySymbol) {
  const bars = [];
  if (Array.isArray(rawBarsBySymbol)) {
    rawBarsBySymbol.forEach((bar) => {
      const symbol = bar.S || bar.symbol;
      if (!symbol) return;
      bars.push({
        timestamp: bar.t,
        symbol,
        open: Number(bar.o),
        high: Number(bar.h),
        low: Number(bar.l),
        close: Number(bar.c),
        volume: Number(bar.v || 0),
        dataSource: DATA_SOURCE,
        paperOnly: true,
        liveTradingEnabled: false
      });
    });
    return bars.sort((a, b) => {
      if (a.symbol !== b.symbol) return a.symbol.localeCompare(b.symbol);
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  }

  Object.entries(rawBarsBySymbol || {}).forEach(([symbol, symbolBars]) => {
    (symbolBars || []).forEach((bar) => {
      bars.push({
        timestamp: bar.t,
        symbol,
        open: Number(bar.o),
        high: Number(bar.h),
        low: Number(bar.l),
        close: Number(bar.c),
        volume: Number(bar.v || 0),
        dataSource: DATA_SOURCE,
        paperOnly: true,
        liveTradingEnabled: false
      });
    });
  });

  return bars.sort((a, b) => {
    if (a.symbol !== b.symbol) return a.symbol.localeCompare(b.symbol);
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
}

function normalizeQuotes(rawQuotesBySymbol) {
  return Object.entries(rawQuotesBySymbol || {}).map(([symbol, quote]) => ({
    symbol,
    timestamp: quote.t,
    bidPrice: Number(quote.bp || 0),
    askPrice: Number(quote.ap || 0),
    bidSize: Number(quote.bs || 0),
    askSize: Number(quote.as || 0),
    dataSource: DATA_SOURCE,
    paperOnly: true,
    liveTradingEnabled: false
  }));
}

function buildMarketDataReport({ bundle, unsupportedSymbols }) {
  return `# MarketOps Alpaca Market Data Adapter v0.1

Generated: ${bundle.generatedAt}

## Status

- dataSource: ${bundle.dataSource}
- paperOnly: ${bundle.paperOnly}
- liveTradingEnabled: ${bundle.liveTradingEnabled}
- orderPlacementEnabled: ${bundle.orderPlacementEnabled}
- feed: ${bundle.feed}
- symbols requested: ${bundle.symbolsRequested.join(", ")}
- freshBarsStatus: ${bundle.freshBarsStatus}
- marketDataStatus: ${bundle.marketDataStatus}
- bars loaded: ${bundle.freshBarCount} (expected: ${bundle.expectedBarCount})
- quotes loaded: ${bundle.quotes.length}

## Unsupported Assets

${unsupportedSymbols.length ? unsupportedSymbols.map((symbol) => `- ${symbol}: not requested from Alpaca IEX in v0.1`).join("\n") : "- None"}

## Safety Boundary

This adapter reads market data only. It does not submit orders, connect execution, enable live trading, send alerts, publish content, or expose credentials. Paper trades remain local simulated records with paperOnly true.`;
}

async function refreshAlpacaMarketData({ generatedAt = new Date().toISOString() } = {}) {
  const config = loadAlpacaDataConfig();
  const vehicles = loadVehicles();
  const supportedVehicles = vehicles.filter((vehicle) => SUPPORTED_ASSET_TYPES.has(vehicle.assetType));
  const unsupportedSymbols = vehicles
    .filter((vehicle) => !SUPPORTED_ASSET_TYPES.has(vehicle.assetType))
    .map((vehicle) => vehicle.symbol);
  const symbols = supportedVehicles.map((vehicle) => vehicle.symbol);

  if (!symbols.length) {
    throw new Error("No Alpaca IEX-supported symbols were found in the active MarketOps vehicle list.");
  }

  const headers = {
    "APCA-API-KEY-ID": config.keyId,
    "APCA-API-SECRET-KEY": config.secretKey
  };

  const [barsResponses, quotesResponse] = await Promise.all([
    Promise.all(symbols.map((symbol) => requestJson(buildBarsUrl(config, [symbol]), headers))),
    requestJson(buildQuotesUrl(config, symbols), headers)
  ]);

  const bars = normalizeBars(Object.assign({}, ...barsResponses.map((response, index) => {
    if (Array.isArray(response.bars)) return { [symbols[index]]: response.bars };
    if (response.bars && Array.isArray(response.bars[symbols[index]])) return { [symbols[index]]: response.bars[symbols[index]] };
    return response.bars || {};
  })));
  const quotes = normalizeQuotes(quotesResponse.quotes);

  const freshBarCount = bars.length;
  const expectedBarCount = symbols.length * 2;
  const freshBarsStatus = freshBarCount >= expectedBarCount
    ? "FRESH_BARS_AVAILABLE"
    : freshBarCount === 0
      ? "OFF_HOURS_NO_FRESH_BARS"
      : "LIMITED_FRESH_BARS";

  const latestBarTimestamp = bars.reduce((latest, bar) => (
    !latest || new Date(bar.timestamp) > new Date(latest) ? bar.timestamp : latest
  ), null);

  const marketDataStatus = freshBarsStatus === "FRESH_BARS_AVAILABLE" ? "OPERATIONAL" : "DEGRADED_OFF_HOURS";

  const bundle = {
    schemaVersion: "0.1",
    generatedAt,
    dataSource: DATA_SOURCE,
    feed: config.feed,
    paperOnly: true,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    accountTradingEnabled: false,
    externalPostingEnabled: false,
    symbolsRequested: symbols,
    unsupportedSymbols,
    latestBarTimestamp,
    freshBarsStatus,
    marketDataStatus,
    freshBarCount,
    expectedBarCount,
    bars,
    quotes,
    safetyLabels: [
      "paper_simulation",
      "market_data_only",
      "no_order_placement",
      "no_live_trading",
      "no_credentials_in_output"
    ]
  };

  writeJson(paths.alpacaMarketDataLatestJson, bundle);
  writeJson(paths.alpacaMarketBarsLatestJson, bars);
  writeText(paths.alpacaMarketDataReport, buildMarketDataReport({ bundle, unsupportedSymbols }));

  return {
    bundle,
    barsPath: paths.alpacaMarketBarsLatestJson,
    bundlePath: paths.alpacaMarketDataLatestJson,
    reportPath: paths.alpacaMarketDataReport
  };
}

async function runCli() {
  try {
    const result = await refreshAlpacaMarketData();
    console.log("MarketOps Alpaca market data refresh complete.");
    console.log(`dataSource: ${result.bundle.dataSource}`);
    console.log(`paperOnly: ${result.bundle.paperOnly}`);
    console.log(`liveTradingEnabled: ${result.bundle.liveTradingEnabled}`);
    console.log(`symbols: ${result.bundle.symbolsRequested.join(", ")}`);
    console.log(`freshBarsStatus: ${result.bundle.freshBarsStatus}`);
    console.log(`marketDataStatus: ${result.bundle.marketDataStatus}`);
    console.log(`bars loaded: ${result.bundle.freshBarCount} (expected: ${result.bundle.expectedBarCount})`);
    console.log(`quotes loaded: ${result.bundle.quotes.length}`);
    console.log(`latest bar timestamp: ${result.bundle.latestBarTimestamp}`);
    console.log(`market data bundle: ${result.bundlePath}`);
    console.log(`market data report: ${result.reportPath}`);
    console.log("");
  } catch (error) {
    console.error("MarketOps Alpaca market data refresh failed.");
    console.error(redactErrorMessage(error.message));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = {
  DATA_SOURCE,
  assertDataOnlyConfig,
  loadAlpacaDataConfig,
  refreshAlpacaMarketData
};
