const path = require("path");
const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

const healthJsonPath = path.join(paths.dataRoot, "dashboard", "dashboard-refresh-health-v0.1.json");
const healthReportPath = path.join(paths.projectRoot, "Reports", "Dashboard", "marketops-dashboard-refresh-health-v0.1.md");

function hoursOld(timestamp) {
  if (!timestamp || Number.isNaN(Date.parse(timestamp))) return null;
  return (Date.now() - new Date(timestamp).getTime()) / 3600000;
}

function readPreviousHealth() {
  if (!fileExists(healthJsonPath)) return null;
  try {
    return loadJson(healthJsonPath);
  } catch {
    return null;
  }
}

function buildHealthSummary(currentSummary, previousHealth) {
  const now = new Date().toISOString();
  const lastStatus = currentSummary.status || "UNKNOWN";
  const isPass = lastStatus === "PASS";
  const isDegraded = lastStatus === "CONTROLLED_DEGRADED";

  const prev = previousHealth || {};
  const prevConsecutiveFailures = typeof prev.consecutiveFailures === "number" ? prev.consecutiveFailures : 0;

  const consecutiveFailures = isPass ? 0 : (isDegraded ? prevConsecutiveFailures : prevConsecutiveFailures + 1);
  const lastSuccessfulRefreshAt = isPass ? now : (prev.lastSuccessfulRefreshAt || null);
  const lastFailureAt = isPass ? (prev.lastFailureAt || null) : (isDegraded ? (prev.lastFailureAt || null) : now);
  const failureReason = isPass ? null : (currentSummary.errorMessage || prev.failureReason || null);

  const lastSuccessfulAgeHours = lastSuccessfulRefreshAt ? hoursOld(lastSuccessfulRefreshAt) : null;
  let staleWarning = null;
  if (lastSuccessfulAgeHours !== null && lastSuccessfulAgeHours > 2) {
    staleWarning = `Last successful refresh was ${lastSuccessfulAgeHours.toFixed(1)} hours ago (target: ${2} hours)`;
  }

  return {
    schemaVersion: "marketops-dashboard-refresh-health-v0.1",
    lastStatus,
    isDegraded,
    lastAttemptAt: now,
    lastSuccessfulRefreshAt,
    lastFailureAt,
    consecutiveFailures,
    staleWarning,
    failureReason,
    refreshIntervalTargetHours: 2,
    schedulerInstalled: false
  };
}

function writeHealthReport(health) {
  const report = `# MarketOps Dashboard Refresh Health v0.1

Generated: ${health.lastAttemptAt}

## Status

- lastStatus: ${health.lastStatus}
- isDegraded: ${health.isDegraded}
- lastAttemptAt: ${health.lastAttemptAt}
- lastSuccessfulRefreshAt: ${health.lastSuccessfulRefreshAt || "never"}
- lastFailureAt: ${health.lastFailureAt || "none"}
- consecutiveFailures: ${health.consecutiveFailures}

## Health

- staleWarning: ${health.staleWarning || "none"}
- refreshIntervalTargetHours: ${health.refreshIntervalTargetHours}
- schedulerInstalled: ${health.schedulerInstalled}

## Next Steps

- Run \`npm run dashboard:refresh\` to refresh now.
- If staleWarning is set, refresh should be run manually.
- Auto-scheduling (cron, systemd timer) is not yet installed.
- Target cadence: every ${health.refreshIntervalTargetHours} hours during market hours.`;
  writeText(healthReportPath, report);
}

function trackRefreshHealth(currentSummary) {
  const previousHealth = readPreviousHealth();
  const health = buildHealthSummary(currentSummary, previousHealth);
  writeJson(healthJsonPath, health);
  writeHealthReport(health);

  if (health.staleWarning) {
    console.warn(`[health] ${health.staleWarning}`);
  }
  if (health.consecutiveFailures > 0) {
    console.warn(`[health] ${health.consecutiveFailures} consecutive failure(s) since last success`);
  }

  return health;
}

module.exports = {
  healthJsonPath,
  healthReportPath,
  trackRefreshHealth
};
