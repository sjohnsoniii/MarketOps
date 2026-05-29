const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

const HISTORY_RETENTION_DAYS = 14;
const MIN_BARS_FOR_USABLE = 10;

function loadRollingHistory() {
  if (fileExists(paths.rollingHistoryJson)) {
    try {
      return loadJson(paths.rollingHistoryJson);
    } catch {
      return { schemaVersion: "0.1", history: [], symbols: {}, generatedAt: null, lastMergedAt: null };
    }
  }
  return { schemaVersion: "0.1", history: [], symbols: {}, generatedAt: null, lastMergedAt: null };
}

function loadLatestBars() {
  if (fileExists(paths.backfillDataJson)) {
    return loadJson(paths.backfillDataJson);
  }
  if (fileExists(paths.alpacaMarketBarsLatestJson)) {
    return { bars: loadJson(paths.alpacaMarketBarsLatestJson), dataSource: "alpaca_iex", generatedAt: new Date().toISOString() };
  }
  return null;
}

function deduplicateBars(bars) {
  const seen = new Set();
  return bars.filter((bar) => {
    const key = `${bar.symbol}|${bar.timestamp}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeHistory(existingHistory, newBars, dataSource) {
  const sourceLabel = dataSource === "alpaca_iex_backfill" ? "backfill" : "live_refresh";

  const annotated = newBars.map((bar) => ({
    ...bar,
    provenance: sourceLabel,
    mergedAt: new Date().toISOString()
  }));

  const merged = (existingHistory || []).concat(annotated);

  const deduped = deduplicateBars(merged);

  const cutoff = new Date(Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const pruned = deduped.filter((bar) => new Date(bar.timestamp) >= cutoff);

  pruned.sort((a, b) => {
    if (a.symbol !== b.symbol) return a.symbol.localeCompare(b.symbol);
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  return pruned;
}

function buildSymbolIndex(history) {
  const symbols = {};
  const bySymbol = {};

  for (const bar of history) {
    if (!bySymbol[bar.symbol]) bySymbol[bar.symbol] = [];
    bySymbol[bar.symbol].push(bar);
  }

  for (const [symbol, bars] of Object.entries(bySymbol)) {
    const sorted = bars.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const provenanceLabels = [...new Set(sorted.map((b) => b.provenance || b.dataSource))];

    symbols[symbol] = {
      symbol,
      barCount: sorted.length,
      firstTimestamp: first.timestamp,
      lastTimestamp: last.timestamp,
      freshnessMinutes: last ? round((Date.now() - new Date(last.timestamp).getTime()) / 60000) : null,
      usableForSignal: sorted.length >= MIN_BARS_FOR_USABLE,
      provenanceLabels
    };
  }

  return symbols;
}

function updateRollingHistory() {
  const state = loadRollingHistory();
  const source = loadLatestBars();

  if (!source || !source.bars || !Array.isArray(source.bars) || source.bars.length === 0) {
    return { merged: false, reason: "no source data available", history: state.history };
  }

  const newBars = source.bars;
  const dataSource = source.dataSource || "unknown";

  const history = mergeHistory(state.history, newBars, dataSource);
  const symbols = buildSymbolIndex(history);

  const output = {
    schemaVersion: "0.1",
    generatedAt: state.generatedAt || new Date().toISOString(),
    lastMergedAt: new Date().toISOString(),
    history,
    symbols,
    totalBars: history.length,
    symbolsCovered: Object.keys(symbols).sort(),
    retentionDays: HISTORY_RETENTION_DAYS,
    minBarsForUsable: MIN_BARS_FOR_USABLE,
    paperOnly: true
  };

  writeJson(paths.rollingHistoryJson, output);

  const reportLines = [
    "# MarketOps Rolling Market History v0.1",
    "",
    `Generated: ${output.lastMergedAt}`,
    `Retention: ${HISTORY_RETENTION_DAYS} days`,
    `Min bars for usable signal: ${MIN_BARS_FOR_USABLE}`,
    "",
    "## Summary",
    "",
    `- Symbols covered: ${output.symbolsCovered.length}`,
    `- Total bars: ${output.totalBars}`,
    `- Last merge: ${output.lastMergedAt}`,
    "",
    "## Per Symbol",
    "",
    "| Symbol | Bar Count | First Timestamp | Last Timestamp | Freshness (min) | Usable for Signal | Provenance |",
    "|--------|-----------|-----------------|----------------|-----------------|-------------------|------------|",
  ];

  for (const sym of output.symbolsCovered) {
    const s = symbols[sym];
    reportLines.push(`| ${s.symbol} | ${s.barCount} | ${s.firstTimestamp} | ${s.lastTimestamp} | ${s.freshnessMinutes !== null ? s.freshnessMinutes : "n/a"} | ${s.usableForSignal} | ${s.provenanceLabels.join(", ")} |`);
  }

  reportLines.push(
    "",
    "## Safety",
    "",
    "- Paper only: true",
    "- No live trading",
    "- No order placement",
    "- Market data only",
    ""
  );

  writeText(paths.rollingHistoryReport, reportLines.join("\n"));

  return output;
}

function runCli() {
  try {
    const result = updateRollingHistory();
    console.log("MarketOps rolling market history updated.");
    console.log(`Symbols covered: ${result.symbolsCovered.join(", ")}`);
    console.log(`Total bars: ${result.totalBars}`);
    console.log(`Rolling history: ${paths.rollingHistoryJson}`);
    console.log(`Report: ${paths.rollingHistoryReport}`);
    return result;
  } catch (error) {
    console.error("MarketOps rolling history update failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { updateRollingHistory, HISTORY_RETENTION_DAYS, MIN_BARS_FOR_USABLE };
