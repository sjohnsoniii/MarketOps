const { getDb } = require("./db");

const POSITION_FIELDS = [
  "position_id", "symbol", "asset_type", "side", "status", "entry_time", "entry_price",
  "quantity", "position_value", "current_value", "unrealized_pnl", "unrealized_pnl_pct",
  "max_favorable_price", "priced_this_run", "signal_id", "risk_decision_id", "opened_at",
  "paper_only", "live_trading_enabled", "entry_risk_band", "risk_band_source", "approval_band",
  "position_size_multiplier", "latest_price", "exit_time", "exit_price", "realized_pnl",
  "return_pct", "fees", "exit_reason", "closed_at"
];

const INSERT_SQL = `
  INSERT OR REPLACE INTO positions (${POSITION_FIELDS.join(", ")})
  VALUES (${POSITION_FIELDS.map((f) => `@${f}`).join(", ")})
`;

function toRow(position, status) {
  return {
    position_id: position.positionId,
    symbol: position.symbol ?? null,
    asset_type: position.assetType ?? null,
    side: position.side ?? null,
    status,
    entry_time: position.entryTime ?? null,
    entry_price: position.entryPrice ?? null,
    quantity: position.quantity ?? null,
    position_value: position.positionValue ?? null,
    current_value: position.currentValue ?? null,
    unrealized_pnl: position.unrealizedPnl ?? null,
    unrealized_pnl_pct: position.unrealizedPnlPct ?? null,
    max_favorable_price: position.maxFavorablePrice ?? null,
    priced_this_run: position.pricedThisRun ? 1 : 0,
    signal_id: position.signalId ?? null,
    risk_decision_id: position.riskDecisionId ?? null,
    opened_at: position.openedAt ?? null,
    paper_only: position.paperOnly ? 1 : 0,
    live_trading_enabled: position.liveTradingEnabled ? 1 : 0,
    entry_risk_band: position.entryRiskBand ?? null,
    risk_band_source: position.riskBandSource ?? null,
    approval_band: position.approvalBand ?? null,
    position_size_multiplier: position.positionSizeMultiplier ?? null,
    latest_price: position.latestPrice ?? null,
    exit_time: position.exitTime ?? null,
    exit_price: position.exitPrice ?? null,
    realized_pnl: position.realizedPnl ?? null,
    return_pct: position.returnPct ?? null,
    fees: position.fees ?? null,
    exit_reason: position.exitReason ?? null,
    closed_at: position.closedAt ?? null
  };
}

// Replaces the entire positions/cooldowns/cycle_state snapshot. Mirrors the
// "fully overwritten each cycle" semantics of paper-positions-v0.1.json.
function syncPositions(positionsData) {
  const db = getDb();
  const insertPosition = db.prepare(INSERT_SQL);
  const insertCooldown = db.prepare(`INSERT INTO re_entry_cooldowns (symbol, exit_time) VALUES (@symbol, @exitTime)`);
  const insertCycleState = db.prepare(`INSERT INTO cycle_state (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = excluded.value`);

  const sync = db.transaction((data) => {
    db.prepare(`DELETE FROM positions`).run();
    db.prepare(`DELETE FROM re_entry_cooldowns`).run();

    for (const p of data.openPositions || []) {
      insertPosition.run(toRow(p, "open"));
    }
    for (const p of data.closedPositions || []) {
      insertPosition.run(toRow(p, "closed"));
    }
    for (const [symbol, exitTime] of Object.entries(data.reEntryCooldowns || {})) {
      insertCooldown.run({ symbol, exitTime });
    }

    insertCycleState.run({ key: "dailyTradeCount", value: String(data.dailyTradeCount ?? 0) });
    insertCycleState.run({ key: "tradeDate", value: String(data.tradeDate ?? "") });
    insertCycleState.run({ key: "resetAt", value: data.resetAt != null ? String(data.resetAt) : "" });
    insertCycleState.run({ key: "resetReason", value: data.resetReason != null ? String(data.resetReason) : "" });
  });

  sync(positionsData);
}

module.exports = { syncPositions };
