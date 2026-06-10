const { getDb } = require("./db");
const { round } = require("../utils/number");

const MIN_BARS_FOR_USABLE = 10;

const UPSERT_SQL = `
  INSERT INTO market_bars (symbol, timestamp, open, high, low, close, volume, data_source, paper_only, live_trading_enabled, provenance, merged_at)
  VALUES (@symbol, @timestamp, @open, @high, @low, @close, @volume, @dataSource, @paperOnly, @liveTradingEnabled, @provenance, @mergedAt)
  ON CONFLICT(symbol, timestamp) DO UPDATE SET
    open = excluded.open,
    high = excluded.high,
    low = excluded.low,
    close = excluded.close,
    volume = excluded.volume,
    data_source = excluded.data_source,
    paper_only = excluded.paper_only,
    live_trading_enabled = excluded.live_trading_enabled,
    provenance = excluded.provenance,
    merged_at = excluded.merged_at
`;

// Upserts bars keyed on (symbol, timestamp). `provenance` and `mergedAt` are
// stamped uniformly for the whole batch (mirrors the old mergeHistory()
// annotation step).
function upsertMarketBars(bars, { provenance, mergedAt = new Date().toISOString() } = {}) {
  if (!Array.isArray(bars) || bars.length === 0) return 0;
  const db = getDb();
  const stmt = db.prepare(UPSERT_SQL);
  const insertMany = db.transaction((rows) => {
    for (const bar of rows) {
      stmt.run({
        symbol: bar.symbol,
        timestamp: bar.timestamp,
        open: bar.open ?? null,
        high: bar.high ?? null,
        low: bar.low ?? null,
        close: bar.close ?? null,
        volume: bar.volume ?? null,
        dataSource: bar.dataSource ?? null,
        paperOnly: bar.paperOnly ? 1 : 0,
        liveTradingEnabled: bar.liveTradingEnabled ? 1 : 0,
        provenance: provenance || bar.provenance || null,
        mergedAt
      });
    }
  });
  insertMany(bars);
  return bars.length;
}

// Deletes bars older than retentionDays (measured from now).
function pruneMarketBars(retentionDays) {
  const db = getDb();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const result = db.prepare(`DELETE FROM market_bars WHERE timestamp < ?`).run(cutoff);
  return result.changes;
}

// Returns { [symbol]: { symbol, barCount, firstTimestamp, lastTimestamp, freshnessMinutes, usableForSignal, provenanceLabels } }
function getSymbolIndex() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT symbol,
           COUNT(*) AS barCount,
           MIN(timestamp) AS firstTimestamp,
           MAX(timestamp) AS lastTimestamp
    FROM market_bars
    GROUP BY symbol
  `).all();

  const provenanceStmt = db.prepare(`SELECT DISTINCT provenance FROM market_bars WHERE symbol = ? AND provenance IS NOT NULL`);

  const symbols = {};
  for (const row of rows) {
    const provenanceLabels = provenanceStmt.all(row.symbol).map((r) => r.provenance);
    symbols[row.symbol] = {
      symbol: row.symbol,
      barCount: row.barCount,
      firstTimestamp: row.firstTimestamp,
      lastTimestamp: row.lastTimestamp,
      freshnessMinutes: row.lastTimestamp ? round((Date.now() - new Date(row.lastTimestamp).getTime()) / 60000) : null,
      usableForSignal: row.barCount >= MIN_BARS_FOR_USABLE,
      provenanceLabels
    };
  }
  return symbols;
}

// Returns bars for a symbol, ascending by timestamp.
function getBarsForSymbol(symbol) {
  const db = getDb();
  return db.prepare(`SELECT symbol, timestamp, open, high, low, close, volume, data_source AS dataSource, provenance FROM market_bars WHERE symbol = ? ORDER BY timestamp ASC`).all(symbol);
}

function getDistinctSymbols() {
  const db = getDb();
  return db.prepare(`SELECT DISTINCT symbol FROM market_bars ORDER BY symbol`).all().map((r) => r.symbol);
}

function getTotalBarCount() {
  const db = getDb();
  return db.prepare(`SELECT COUNT(*) AS count FROM market_bars`).get().count;
}

function getBarCountBySource(dataSource) {
  const db = getDb();
  return db.prepare(`SELECT COUNT(*) AS count FROM market_bars WHERE data_source = ?`).get(dataSource).count;
}

module.exports = {
  MIN_BARS_FOR_USABLE,
  upsertMarketBars,
  pruneMarketBars,
  getSymbolIndex,
  getBarsForSymbol,
  getDistinctSymbols,
  getTotalBarCount,
  getBarCountBySource
};
