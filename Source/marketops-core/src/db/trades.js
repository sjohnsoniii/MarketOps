const { getDb } = require("./db");

const LEDGER_FIELDS = [
  "ledger_id", "timestamp", "event_type", "symbol", "side", "quantity",
  "entry_price", "position_value", "cash_after", "mode", "paper_only", "balance"
];

const TRADE_FIELDS = [
  "trade_id", "position_id", "signal_id", "risk_decision_id", "symbol", "asset_type",
  "side", "status", "entry_time", "entry_price", "quantity", "position_value",
  "cash_balance_after_entry", "data_source", "paper_only", "live_trading_enabled",
  "approval_band", "position_size_multiplier", "is_learning_probe",
  "entry_plan", "exit_plan", "risk_plan", "learning_metadata"
];

const INSERT_LEDGER_SQL = `
  INSERT OR REPLACE INTO trade_ledger (${LEDGER_FIELDS.join(", ")})
  VALUES (${LEDGER_FIELDS.map((f) => `@${f}`).join(", ")})
`;

const INSERT_TRADE_SQL = `
  INSERT OR REPLACE INTO trades (${TRADE_FIELDS.join(", ")})
  VALUES (${TRADE_FIELDS.map((f) => `@${f}`).join(", ")})
`;

function ledgerToRow(entry) {
  return {
    ledger_id: entry.ledgerId,
    timestamp: entry.timestamp ?? null,
    event_type: entry.eventType ?? null,
    symbol: entry.symbol ?? null,
    side: entry.side ?? null,
    quantity: entry.quantity ?? null,
    entry_price: entry.entryPrice ?? null,
    position_value: entry.positionValue ?? null,
    cash_after: entry.cashAfter ?? null,
    mode: entry.mode ?? null,
    paper_only: entry.paperOnly ? 1 : 0,
    balance: entry.balance ?? null
  };
}

function tradeToRow(trade) {
  return {
    trade_id: trade.tradeId,
    position_id: trade.positionId ?? null,
    signal_id: trade.signalId ?? null,
    risk_decision_id: trade.riskDecisionId ?? null,
    symbol: trade.symbol ?? null,
    asset_type: trade.assetType ?? null,
    side: trade.side ?? null,
    status: trade.status ?? null,
    entry_time: trade.entryTime ?? null,
    entry_price: trade.entryPrice ?? null,
    quantity: trade.quantity ?? null,
    position_value: trade.positionValue ?? null,
    cash_balance_after_entry: trade.cashBalanceAfterEntry ?? null,
    data_source: trade.dataSource ?? null,
    paper_only: trade.paperOnly ? 1 : 0,
    live_trading_enabled: trade.liveTradingEnabled ? 1 : 0,
    approval_band: trade.approvalBand ?? null,
    position_size_multiplier: trade.positionSizeMultiplier ?? null,
    is_learning_probe: trade.isLearningProbe ? 1 : 0,
    entry_plan: trade.entryPlan != null ? JSON.stringify(trade.entryPlan) : null,
    exit_plan: trade.exitPlan != null ? JSON.stringify(trade.exitPlan) : null,
    risk_plan: trade.riskPlan != null ? JSON.stringify(trade.riskPlan) : null,
    learning_metadata: trade.learningMetadata != null ? JSON.stringify(trade.learningMetadata) : null
  };
}

// Replaces the entire trade_ledger/trades snapshot. Mirrors the
// "fully overwritten each cycle" semantics of paper-trades-v0.1.json.
function syncTrades(tradesData) {
  const db = getDb();
  const insertLedger = db.prepare(INSERT_LEDGER_SQL);
  const insertTrade = db.prepare(INSERT_TRADE_SQL);

  const sync = db.transaction((data) => {
    db.prepare(`DELETE FROM trade_ledger`).run();
    db.prepare(`DELETE FROM trades`).run();

    for (const entry of data.ledger || []) {
      insertLedger.run(ledgerToRow(entry));
    }
    for (const trade of data.trades || []) {
      insertTrade.run(tradeToRow(trade));
    }
  });

  sync(tradesData);
}

module.exports = { syncTrades };
