const { getDb } = require("./db");

const RETENTION_DAYS = 30;

function insertDashboardSnapshot({ bundleType, generatedAt, payload, createdAt }) {
  const db = getDb();
  db.prepare(`
    INSERT INTO dashboard_snapshots (bundle_type, generated_at, payload, created_at)
    VALUES (?, ?, ?, ?)
  `).run(bundleType, generatedAt, payload, createdAt || generatedAt);
}

// Deletes snapshots older than RETENTION_DAYS, measured from `now` (the
// generatedAt of the run doing the pruning) so behavior is reproducible
// given a fixed run timestamp.
function pruneDashboardSnapshots(now, retentionDays = RETENTION_DAYS) {
  const db = getDb();
  const cutoff = new Date(new Date(now).getTime() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const result = db.prepare(`DELETE FROM dashboard_snapshots WHERE generated_at < ?`).run(cutoff);
  return result.changes;
}

function getLatestDashboardSnapshot(bundleType) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM dashboard_snapshots WHERE bundle_type = ? ORDER BY generated_at DESC, snapshot_id DESC LIMIT 1
  `).get(bundleType);
}

function countDashboardSnapshots(bundleType) {
  const db = getDb();
  return db.prepare(`SELECT COUNT(*) as count FROM dashboard_snapshots WHERE bundle_type = ?`).get(bundleType).count;
}

module.exports = {
  RETENTION_DAYS,
  insertDashboardSnapshot,
  pruneDashboardSnapshots,
  getLatestDashboardSnapshot,
  countDashboardSnapshots
};
