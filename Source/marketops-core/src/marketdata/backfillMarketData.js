const https = require("https");
const { URL } = require("url");

const { loadVehicles } = require("../data/sampleLoaders");
const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { parseLocalEnv } = require("./localEnv");
const { upsertMarketBars } = require("../db/marketBars");

const DATA_SOURCE = "alpaca_iex_backfill";
const DEFAULT_DATA_BASE_URL = "https://data.alpaca.markets";
const DEFAULT_FEED = "iex";
const DEFAULT_TIMEFRAME = "1Min";
const BACKFILL_DAYS = 7;
const SUPPORTED_ASSET_TYPES = new Set(["EQUITY", "ETF"]);

function redactErrorMessage(message) {
  return String(message || "")
    .replace(/APCA[-_A-Z0-9]*=([^&\s]+)/gi, "APCA_REDACTED")
    .replace(/key=([^&\s]+)/gi, "key=REDACTED")
    .replace(/secret=([^&\s]+)/gi, "secret=REDACTED");
}

function loadAlpacaConfig() {
  const localEnv = {
    ...parseLocalEnv(paths.localEnv),
    ...parseLocalEnv(paths.coreLocalEnv)
  };
  const keyId = localEnv.APCA_API_KEY_ID || process.env.APCA_API_KEY_ID || localEnv.ALPACA_API_KEY || process.env.ALPACA_API_KEY;
  const secretKey = localEnv.APCA_API_SECRET_KEY || process.env.APCA_API_SECRET_KEY || localEnv.ALPACA_SECRET_KEY || process.env.ALPACA_SECRET_KEY;
  const baseUrl = localEnv.MARKETOPS_ALPACA_DATA_BASE_URL || process.env.MARKETOPS_ALPACA_DATA_BASE_URL || DEFAULT_DATA_BASE_URL;

  if (!keyId || !secretKey) {
    throw new Error("Alpaca data credentials are missing for backfill.");
  }

  const normalizedUrl = String(baseUrl || DEFAULT_DATA_BASE_URL).replace(/\/+$/, "").replace(/\/v2$/i, "");
  if (normalizedUrl.includes("paper-api") || normalizedUrl.includes("api.alpaca.markets") || normalizedUrl.includes("trading")) {
    throw new Error("Unsafe Alpaca trading endpoint detected in backfill config.");
  }

  return { keyId, secretKey, baseUrl: normalizedUrl };
}

function requestJson(url, headers) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers, timeout: 30000 }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Backfill request failed with HTTP ${response.statusCode}.`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Backfill response was not valid JSON: ${error.message}`));
        }
      });
    });
    request.on("timeout", () => request.destroy(new Error("Backfill request timed out.")));
    request.on("error", (error) => reject(error));
  });
}

function buildSingleSymbolBarsUrl(config, symbol, start, end) {
  const url = new URL(`/v2/stocks/${encodeURIComponent(symbol)}/bars`, config.baseUrl);
  url.searchParams.set("timeframe", DEFAULT_TIMEFRAME);
  url.searchParams.set("start", start);
  url.searchParams.set("end", end);
  url.searchParams.set("limit", "10000");
  url.searchParams.set("feed", DEFAULT_FEED);
  url.searchParams.set("adjustment", "raw");
  return url.toString();
}

function normalizeBackfillBars(rawBars, symbol) {
  const bars = [];
  (rawBars || []).forEach((bar) => {
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
  return bars;
}

async function backfillMarketData({ days = BACKFILL_DAYS, generatedAt = new Date().toISOString() } = {}) {
  const config = loadAlpacaConfig();
  const vehicles = loadVehicles();
  const supportedVehicles = vehicles.filter((v) => SUPPORTED_ASSET_TYPES.has(v.assetType));
  const symbols = supportedVehicles.map((v) => v.symbol);

  if (!symbols.length) {
    throw new Error("No supported symbols found for backfill.");
  }

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  const start = startDate.toISOString();
  const end = endDate.toISOString();

  const headers = {
    "APCA-API-KEY-ID": config.keyId,
    "APCA-API-SECRET-KEY": config.secretKey
  };

  const results = [];
  const perSymbolResults = {};

  for (const symbol of symbols) {
    const url = buildSingleSymbolBarsUrl(config, symbol, start, end);
    let raw;
    try {
      raw = await requestJson(url, headers);
    } catch (error) {
      perSymbolResults[symbol] = { symbol, barCount: 0, firstTimestamp: null, lastTimestamp: null, error: error.message, usableForSignal: false };
      continue;
    }

    const bars = normalizeBackfillBars(raw.bars || [], symbol);
    bars.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    results.push(...bars);

    perSymbolResults[symbol] = {
      symbol,
      barCount: bars.length,
      firstTimestamp: bars.length > 0 ? bars[0].timestamp : null,
      lastTimestamp: bars.length > 0 ? bars[bars.length - 1].timestamp : null,
      error: null,
      usableForSignal: bars.length >= 10
    };
  }

  results.sort((a, b) => {
    if (a.symbol !== b.symbol) return a.symbol.localeCompare(b.symbol);
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  const symbolsCovered = Object.keys(perSymbolResults);
  const totalBars = results.length;

  upsertMarketBars(results, { provenance: "backfill", mergedAt: generatedAt });

  // Lightweight snapshot: the full `bars` array now lives in market_bars
  // (Data/marketops.db). Kept for any downstream code that still checks
  // file existence / perSymbol summaries without reading `.bars`.
  const bundle = {
    schemaVersion: "0.1",
    generatedAt,
    backfillStartTimestamp: start,
    backfillEndTimestamp: end,
    backfillDays: days,
    dataSource: DATA_SOURCE,
    feed: DEFAULT_FEED,
    symbolsRequested: symbols,
    symbolsCovered,
    totalBars,
    paperOnly: true,
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    perSymbol: perSymbolResults,
    storage: "sqlite:market_bars",
    safetyLabels: ["paper_simulation", "market_data_only", "backfill", "no_order_placement", "no_live_trading"]
  };

  writeJson(paths.backfillDataJson, bundle);

  const reportLines = [
    "# MarketOps Market Data Backfill v0.1",
    "",
    `Generated: ${generatedAt}`,
    `Backfill range: ${start} to ${end} (${days} days)`,
    `Data source: ${DATA_SOURCE}`,
    `Feed: ${DEFAULT_FEED}`,
    "",
    "## Summary",
    "",
    `- Symbols requested: ${symbols.join(", ")}`,
    `- Symbols covered: ${symbolsCovered.length}`,
    `- Total bars: ${totalBars}`,
    "",
    "## Per Symbol",
    "",
    "| Symbol | Bar Count | First Timestamp | Last Timestamp | Usable for Signal | Error |",
    "|--------|-----------|-----------------|----------------|-------------------|-------|",
  ];

  for (const symbol of symbols) {
    const s = perSymbolResults[symbol] || { barCount: 0, firstTimestamp: null, lastTimestamp: null, error: "not requested", usableForSignal: false };
    reportLines.push(`| ${s.symbol} | ${s.barCount} | ${s.firstTimestamp || "n/a"} | ${s.lastTimestamp || "n/a"} | ${s.usableForSignal} | ${s.error || "none"} |`);
  }

  reportLines.push(
    "",
    "## Provenance",
    "",
    "- Source: Alpaca Markets IEX data feed (backfill)",
    "- Timeframe: 1Min",
    "- Adjustment: raw",
    "- Paper only: true",
    "- Live trading: false",
    "- Order placement: false",
    ""
  );

  writeText(paths.backfillReport, reportLines.join("\n"));

  return { bundle, perSymbol: perSymbolResults, totalBars, symbolsCovered };
}

async function runCli() {
  try {
    const result = await backfillMarketData();
    console.log("MarketOps market data backfill complete.");
    console.log(`Symbols covered: ${result.symbolsCovered.join(", ")}`);
    console.log(`Total bars: ${result.totalBars}`);
    console.log(`Backfill data: ${paths.backfillDataJson}`);
    console.log(`Backfill report: ${paths.backfillReport}`);

    for (const [sym, info] of Object.entries(result.perSymbol)) {
      const status = info.usableForSignal ? "usable" : "insufficient";
      console.log(`  ${sym}: ${info.barCount} bars, ${status}`);
    }
  } catch (error) {
    console.error("MarketOps market data backfill failed.");
    console.error(redactErrorMessage(error.message));
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { backfillMarketData, DATA_SOURCE };
