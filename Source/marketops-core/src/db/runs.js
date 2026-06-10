const { getDb } = require("./db");

const RUN_HISTORY_RETENTION_DAYS = 30;

const UPSERT_SQL = `
  INSERT INTO runs (run_id, generated_at, mode, paper_only, sample_data, starting_balance, ending_equity, paper_pnl, paper_return_pct, max_drawdown_pct, vehicles_scanned, signals_reviewed, risk_approved, risk_blocked, fake_paper_trades, open_position_count, realized_pnl, unrealized_pnl, cash_balance, total_equity, qa_status, clean_start_v07, notes)
  VALUES (@runId, @generatedAt, @mode, @paperOnly, @sampleData, @startingBalance, @endingEquity, @paperPnl, @paperReturnPct, @maxDrawdownPct, @vehiclesScanned, @signalsReviewed, @riskApproved, @riskBlocked, @fakePaperTrades, @openPositionCount, @realizedPnl, @unrealizedPnl, @cashBalance, @totalEquity, @qaStatus, @cleanStartV07, @notes)
  ON CONFLICT(run_id) DO UPDATE SET
    generated_at = excluded.generated_at,
    mode = excluded.mode,
    paper_only = excluded.paper_only,
    sample_data = excluded.sample_data,
    starting_balance = excluded.starting_balance,
    ending_equity = excluded.ending_equity,
    paper_pnl = excluded.paper_pnl,
    paper_return_pct = excluded.paper_return_pct,
    max_drawdown_pct = excluded.max_drawdown_pct,
    vehicles_scanned = excluded.vehicles_scanned,
    signals_reviewed = excluded.signals_reviewed,
    risk_approved = excluded.risk_approved,
    risk_blocked = excluded.risk_blocked,
    fake_paper_trades = excluded.fake_paper_trades,
    open_position_count = excluded.open_position_count,
    realized_pnl = excluded.realized_pnl,
    unrealized_pnl = excluded.unrealized_pnl,
    cash_balance = excluded.cash_balance,
    total_equity = excluded.total_equity,
    qa_status = excluded.qa_status,
    clean_start_v07 = excluded.clean_start_v07,
    notes = excluded.notes
`;

function insertRun(summary) {
  const db = getDb();
  db.prepare(UPSERT_SQL).run({
    runId: summary.runId,
    generatedAt: summary.generatedAt,
    mode: summary.mode ?? null,
    paperOnly: summary.paperOnly ? 1 : 0,
    sampleData: summary.sampleData ? 1 : 0,
    startingBalance: summary.startingBalance ?? null,
    endingEquity: summary.endingEquity ?? null,
    paperPnl: summary.paperPnl ?? null,
    paperReturnPct: summary.paperReturnPct ?? null,
    maxDrawdownPct: summary.maxDrawdownPct ?? null,
    vehiclesScanned: summary.vehiclesScanned ?? null,
    signalsReviewed: summary.signalsReviewed ?? null,
    riskApproved: summary.riskApproved ?? null,
    riskBlocked: summary.riskBlocked ?? null,
    fakePaperTrades: summary.fakePaperTrades ?? null,
    openPositionCount: summary.openPositionCount ?? null,
    realizedPnl: summary.realizedPnl ?? null,
    unrealizedPnl: summary.unrealizedPnl ?? null,
    cashBalance: summary.cashBalance ?? null,
    totalEquity: summary.totalEquity ?? null,
    qaStatus: summary.qaStatus ?? null,
    cleanStartV07: summary.cleanStartV07 ? 1 : 0,
    notes: JSON.stringify(summary.notes || [])
  });
}

// Deletes runs older than retentionDays (measured from now).
function pruneRuns(retentionDays = RUN_HISTORY_RETENTION_DAYS) {
  const db = getDb();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const result = db.prepare(`DELETE FROM runs WHERE generated_at < ?`).run(cutoff);
  return result.changes;
}

function rowToSummary(row) {
  return {
    runId: row.run_id,
    generatedAt: row.generated_at,
    mode: row.mode,
    paperOnly: !!row.paper_only,
    sampleData: !!row.sample_data,
    startingBalance: row.starting_balance,
    endingEquity: row.ending_equity,
    paperPnl: row.paper_pnl,
    paperReturnPct: row.paper_return_pct,
    maxDrawdownPct: row.max_drawdown_pct,
    vehiclesScanned: row.vehicles_scanned,
    signalsReviewed: row.signals_reviewed,
    riskApproved: row.risk_approved,
    riskBlocked: row.risk_blocked,
    fakePaperTrades: row.fake_paper_trades,
    openPositionCount: row.open_position_count,
    realizedPnl: row.realized_pnl,
    unrealizedPnl: row.unrealized_pnl,
    cashBalance: row.cash_balance,
    totalEquity: row.total_equity,
    qaStatus: row.qa_status,
    cleanStartV07: !!row.clean_start_v07,
    notes: row.notes ? JSON.parse(row.notes) : []
  };
}

// Returns runs generated within the retention window, ascending by generated_at.
function getRecentRuns(retentionDays = RUN_HISTORY_RETENTION_DAYS) {
  const db = getDb();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const rows = db.prepare(`SELECT * FROM runs WHERE generated_at >= ? ORDER BY generated_at ASC`).all(cutoff);
  return rows.map(rowToSummary);
}

function getTotalRunCount() {
  const db = getDb();
  return db.prepare(`SELECT COUNT(*) AS count FROM runs`).get().count;
}

function clearRuns() {
  const db = getDb();
  return db.prepare(`DELETE FROM runs`).run().changes;
}

module.exports = {
  RUN_HISTORY_RETENTION_DAYS,
  insertRun,
  pruneRuns,
  getRecentRuns,
  getTotalRunCount,
  clearRuns
};
