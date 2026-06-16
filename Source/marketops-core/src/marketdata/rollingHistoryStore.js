const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { upsertMarketBars, pruneMarketBars, getSymbolIndex, getTotalBarCount, getBarsForSymbol, getDistinctSymbols } = require("../db/marketBars");

const HISTORY_RETENTION_DAYS = 14;
const MIN_BARS_FOR_USABLE = 10;

function loadRollingHistory() {
  if (fileExists(paths.rollingHistoryJson)) {
    try {
      return loadJson(paths.rollingHistoryJson);
    } catch {
      return { schemaVersion: "0.1", generatedAt: null, lastMergedAt: null };
    }
  }
  return { schemaVersion: "0.1", generatedAt: null, lastMergedAt: null };
}

// Backfill (and, when present, live refresh bars) are upserted into
// market_bars by their own write paths before this runs. This step prunes
// retention and rebuilds the per-symbol index/report from market_bars.
function updateRollingHistory() {
  const state = loadRollingHistory();
  const lastMergedAt = new Date().toISOString();

  pruneMarketBars(HISTORY_RETENTION_DAYS);

  const totalBarsBefore = getTotalBarCount();
  if (totalBarsBefore === 0) {
    return { merged: false, reason: "no source data available", totalBars: 0, history: [] };
  }

  const symbols = getSymbolIndex();

  // Reassemble the flat per-bar `history` array that signal scanning and
  // vehicle-history building consume. The SQLite migration moved bar storage
  // into market_bars and this return value carried only the summary index;
  // restore the original contract by reading the bars back out of the DB.
  const history = getDistinctSymbols().flatMap((symbol) => getBarsForSymbol(symbol));

  const output = {
    schemaVersion: "0.1",
    generatedAt: state.generatedAt || lastMergedAt,
    lastMergedAt,
    history,
    symbols,
    totalBars: getTotalBarCount(),
    symbolsCovered: Object.keys(symbols).sort(),
    retentionDays: HISTORY_RETENTION_DAYS,
    minBarsForUsable: MIN_BARS_FOR_USABLE,
    paperOnly: true,
    storage: "sqlite:market_bars"
  };

  // The persisted JSON keeps only the summary index (the bars live in SQLite);
  // `history` is large and is provided to in-process callers via the return
  // value, not the on-disk artifact.
  const { history: _omit, ...persisted } = output;
  writeJson(paths.rollingHistoryJson, persisted);

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
