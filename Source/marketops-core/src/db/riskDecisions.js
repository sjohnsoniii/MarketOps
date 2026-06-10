const { getDb } = require("./db");

const RISK_DECISION_FIELDS = [
  "risk_decision_id", "scan_id", "signal_id", "generated_at", "symbol", "asset_type",
  "approved", "approval_band", "block_reasons", "vehicle_history_summary", "learning_metadata"
];

const INSERT_SQL = `
  INSERT OR REPLACE INTO risk_decisions (${RISK_DECISION_FIELDS.join(", ")})
  VALUES (${RISK_DECISION_FIELDS.map((f) => `@${f}`).join(", ")})
`;

function toRow(decision, generatedAt) {
  return {
    risk_decision_id: decision.riskDecisionId,
    scan_id: null,
    signal_id: decision.signalId ?? null,
    generated_at: generatedAt,
    symbol: decision.symbol ?? null,
    asset_type: decision.assetType ?? null,
    approved: decision.approved ? 1 : 0,
    approval_band: decision.approvalBand ?? null,
    block_reasons: decision.blockReasons != null ? JSON.stringify(decision.blockReasons) : null,
    vehicle_history_summary: decision.vehicleHistorySummary != null ? JSON.stringify(decision.vehicleHistorySummary) : null,
    learning_metadata: decision.learningMetadata != null ? JSON.stringify(decision.learningMetadata) : null
  };
}

// Replaces the entire risk_decisions snapshot. Mirrors the
// "fully overwritten each cycle" semantics of risk-decisions-v0.1.json.
function syncRiskDecisions(riskData) {
  const db = getDb();
  const insert = db.prepare(INSERT_SQL);
  const generatedAt = riskData.generatedAt || new Date().toISOString();

  const sync = db.transaction((data) => {
    db.prepare(`DELETE FROM risk_decisions`).run();
    for (const decision of data.decisions || []) {
      insert.run(toRow(decision, generatedAt));
    }
  });

  sync(riskData);
}

module.exports = { syncRiskDecisions };
