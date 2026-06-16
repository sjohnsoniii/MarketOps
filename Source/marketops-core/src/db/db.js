const Database = require("better-sqlite3");
const { paths } = require("../utils/paths");
const { ensureDir } = require("../utils/fileStore");
const path = require("path");

let dbInstance = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS dashboard_snapshots (
  snapshot_id  INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_type  TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  payload      TEXT NOT NULL,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_type_time ON dashboard_snapshots(bundle_type, generated_at);

CREATE TABLE IF NOT EXISTS market_bars (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol               TEXT NOT NULL,
  timestamp            TEXT NOT NULL,
  open                 REAL,
  high                 REAL,
  low                  REAL,
  close                REAL,
  volume               REAL,
  data_source          TEXT,
  paper_only           INTEGER,
  live_trading_enabled INTEGER,
  provenance           TEXT,
  merged_at            TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_bars_symbol_ts ON market_bars(symbol, timestamp);
CREATE INDEX IF NOT EXISTS idx_market_bars_timestamp ON market_bars(timestamp);

CREATE TABLE IF NOT EXISTS runs (
  run_id              TEXT PRIMARY KEY,
  generated_at        TEXT NOT NULL,
  mode                TEXT,
  paper_only          INTEGER,
  sample_data         INTEGER,
  starting_balance    REAL,
  ending_equity       REAL,
  paper_pnl           REAL,
  paper_return_pct    REAL,
  max_drawdown_pct    REAL,
  vehicles_scanned    INTEGER,
  signals_reviewed    INTEGER,
  risk_approved       INTEGER,
  risk_blocked        INTEGER,
  fake_paper_trades   INTEGER,
  open_position_count INTEGER,
  realized_pnl        REAL,
  unrealized_pnl      REAL,
  cash_balance        REAL,
  total_equity        REAL,
  qa_status           TEXT,
  clean_start_v07     INTEGER,
  notes               TEXT
);
CREATE INDEX IF NOT EXISTS idx_runs_generated_at ON runs(generated_at);

CREATE TABLE IF NOT EXISTS positions (
  position_id              TEXT PRIMARY KEY,
  symbol                   TEXT NOT NULL,
  asset_type               TEXT,
  side                     TEXT,
  status                   TEXT NOT NULL,
  entry_time               TEXT,
  entry_price              REAL,
  quantity                 REAL,
  position_value           REAL,
  current_value            REAL,
  unrealized_pnl           REAL,
  unrealized_pnl_pct       REAL,
  max_favorable_price      REAL,
  priced_this_run          INTEGER,
  signal_id                TEXT,
  risk_decision_id         TEXT,
  opened_at                TEXT,
  paper_only               INTEGER,
  live_trading_enabled     INTEGER,
  entry_risk_band          TEXT,
  risk_band_source         TEXT,
  approval_band            TEXT,
  position_size_multiplier REAL,
  latest_price             REAL,
  exit_time                TEXT,
  exit_price               REAL,
  realized_pnl             REAL,
  return_pct               REAL,
  fees                     REAL,
  exit_reason              TEXT,
  closed_at                TEXT
);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_positions_entry_time ON positions(entry_time);

CREATE TABLE IF NOT EXISTS re_entry_cooldowns (
  symbol       TEXT PRIMARY KEY,
  exit_time    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cycle_state (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS trade_ledger (
  ledger_id      TEXT PRIMARY KEY,
  timestamp      TEXT NOT NULL,
  event_type     TEXT,
  symbol         TEXT,
  side           TEXT,
  quantity       REAL,
  entry_price    REAL,
  position_value REAL,
  cash_after     REAL,
  mode           TEXT,
  paper_only     INTEGER,
  balance        REAL
);
CREATE INDEX IF NOT EXISTS idx_trade_ledger_timestamp ON trade_ledger(timestamp);

CREATE TABLE IF NOT EXISTS trades (
  trade_id                 TEXT PRIMARY KEY,
  position_id              TEXT REFERENCES positions(position_id) ON DELETE SET NULL,
  signal_id                TEXT,
  risk_decision_id         TEXT,
  symbol                   TEXT,
  asset_type               TEXT,
  side                     TEXT,
  status                   TEXT,
  entry_time               TEXT,
  entry_price              REAL,
  quantity                 REAL,
  position_value           REAL,
  cash_balance_after_entry REAL,
  data_source              TEXT,
  paper_only               INTEGER,
  live_trading_enabled     INTEGER,
  approval_band            TEXT,
  position_size_multiplier REAL,
  is_learning_probe        INTEGER,
  entry_plan               TEXT,
  exit_plan                TEXT,
  risk_plan                TEXT,
  learning_metadata        TEXT
);
CREATE INDEX IF NOT EXISTS idx_trades_position_id ON trades(position_id);
CREATE INDEX IF NOT EXISTS idx_trades_signal_id ON trades(signal_id);

CREATE TABLE IF NOT EXISTS risk_decisions (
  risk_decision_id        TEXT PRIMARY KEY,
  scan_id                  INTEGER,
  signal_id                TEXT,
  generated_at             TEXT NOT NULL,
  symbol                   TEXT,
  asset_type               TEXT,
  approved                 INTEGER,
  approval_band            TEXT,
  block_reasons            TEXT,
  vehicle_history_summary  TEXT,
  learning_metadata        TEXT
);
CREATE INDEX IF NOT EXISTS idx_risk_decisions_generated_at ON risk_decisions(generated_at);
CREATE INDEX IF NOT EXISTS idx_risk_decisions_symbol ON risk_decisions(symbol);
`;

// trades.position_id originally had a bare REFERENCES positions(position_id)
// (implicit ON DELETE NO ACTION). syncPositions() rebuilds the positions
// snapshot each cycle with DELETE FROM positions, which RESTRICT-fails the
// moment any trade references a live position. Rebuild the trades table with
// ON DELETE SET NULL so the snapshot can be replaced while the append-only
// trade history is preserved (the position link is nulled, not the trade).
// SQLite can't alter a foreign key in place, so the table is recreated and
// rows are copied. Idempotent: skips once on_delete is already SET NULL.
function migrateTradesPositionFkSetNull(db) {
  const fkList = db.pragma("foreign_key_list(trades)");
  const positionFk = fkList.find((fk) => fk.table === "positions" && fk.from === "position_id");
  if (!positionFk || positionFk.on_delete === "SET NULL") return;

  db.pragma("foreign_keys = OFF");
  try {
    const rebuild = db.transaction(() => {
      db.exec(`
        CREATE TABLE trades_new (
          trade_id                 TEXT PRIMARY KEY,
          position_id              TEXT REFERENCES positions(position_id) ON DELETE SET NULL,
          signal_id                TEXT,
          risk_decision_id         TEXT,
          symbol                   TEXT,
          asset_type               TEXT,
          side                     TEXT,
          status                   TEXT,
          entry_time               TEXT,
          entry_price              REAL,
          quantity                 REAL,
          position_value           REAL,
          cash_balance_after_entry REAL,
          data_source              TEXT,
          paper_only               INTEGER,
          live_trading_enabled     INTEGER,
          approval_band            TEXT,
          position_size_multiplier REAL,
          is_learning_probe        INTEGER,
          entry_plan               TEXT,
          exit_plan                TEXT,
          risk_plan                TEXT,
          learning_metadata        TEXT
        );
      `);
      db.exec(`INSERT INTO trades_new SELECT * FROM trades;`);
      db.exec(`DROP TABLE trades;`);
      db.exec(`ALTER TABLE trades_new RENAME TO trades;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_trades_position_id ON trades(position_id);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_trades_signal_id ON trades(signal_id);`);
    });
    rebuild();
    const violations = db.pragma("foreign_key_check");
    if (violations.length > 0) {
      throw new Error(`foreign_key_check failed after trades migration: ${JSON.stringify(violations)}`);
    }
  } finally {
    db.pragma("foreign_keys = ON");
  }
}

function getDb() {
  if (dbInstance) return dbInstance;
  ensureDir(path.dirname(paths.sqliteDbPath));
  dbInstance = new Database(paths.sqliteDbPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.exec(SCHEMA);
  migrateTradesPositionFkSetNull(dbInstance);
  return dbInstance;
}

module.exports = { getDb };
