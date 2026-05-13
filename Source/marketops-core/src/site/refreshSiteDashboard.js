const fs = require("fs");
const path = require("path");

const { loadJson, writeJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");
const { writePublicDashboardBundle } = require("./publicDashboardBundle");

function buildMarketActivityPreview() {
  const vehicles = [
    { symbol: "SPY", start: 507.00, changes: [0,0.18,-0.12,0.31,0.44,0.22,0.55,0.48,0.72,0.65,0.88,0.93,0.76,1.02,1.18,1.05,1.26,1.41,1.33,1.58,1.62,1.49,1.71,1.83,1.75,1.92,2.04,1.96,2.18,2.24] },
    { symbol: "QQQ", start: 439.00, changes: [0,0.22,-0.18,0.38,0.62,0.36,0.74,0.81,1.04,0.92,1.21,1.34,1.1,1.45,1.7,1.52,1.88,2.06,1.82,2.24,2.38,2.11,2.47,2.68,2.42,2.79,3.02,2.84,3.18,3.3] },
    { symbol: "BTC", start: 65500.00, changes: [0,-0.55,0.2,1.05,0.62,1.38,2.1,1.44,2.7,2.25,3.12,3.85,3.18,4.25,5.1,4.42,5.8,6.35,5.64,6.92,7.45,6.8,7.9,8.6,7.72,8.95,9.4,8.7,9.85,10.25] },
    { symbol: "ETH", start: 3250.00, changes: [0,-0.42,0.12,0.74,0.31,0.95,1.42,0.88,1.76,1.33,2.04,2.55,1.94,2.76,3.18,2.62,3.45,3.88,3.16,4.05,4.42,3.74,4.68,5.12,4.4,5.28,5.74,5.02,6.05,6.36] },
    { symbol: "NVDA", start: 950.00, changes: [0,0.75,1.28,0.62,1.85,2.4,1.76,2.92,3.65,2.88,4.2,4.95,4.1,5.38,6.12,5.34,6.84,7.55,6.62,8.05,8.7,7.85,9.24,9.86,8.92,10.28,11.05,10.14,11.42,12.08] }
  ];
  const startDate = new Date("2026-01-01T00:00:00.000Z");

  return {
    generatedAt: "2026-01-03T16:00:00.000Z",
    previewOnly: true,
    lowerEnvironment: true,
    notLiveMarketData: true,
    generatedSampleData: true,
    notInvestmentAdvice: true,
    description: "Deterministic 30-day lower-environment market activity preview for public charting. Values are generated sample data and are not actual market data.",
    vehicles: vehicles.map((vehicle) => ({
      symbol: vehicle.symbol,
      points: vehicle.changes.map((change, index) => {
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + index);
        return {
          date: date.toISOString().slice(0, 10),
          close: Number((vehicle.start * (1 + change / 100)).toFixed(2)),
          normalizedPctChange: change
        };
      })
    }))
  };
}

function refreshSiteDashboard() {
  let runHistorySummary = null;
  try {
    const latest = loadJson(paths.latestRunSummaryJson);
    runHistorySummary = {
      runId: latest.runId,
      generatedAt: latest.generatedAt,
      qaStatus: latest.qaStatus,
      endingEquity: latest.endingEquity,
      paperPnl: latest.paperPnl,
      paperReturnPct: latest.paperReturnPct
    };
  } catch (error) {
    runHistorySummary = null;
  }

  const dashboard = writePublicDashboardBundle(paths.siteDashboardPublicV04Json, {
    generatedAt: new Date().toISOString(),
    runHistorySummary
  });
  const activityPath = path.join(paths.sj3labsMarketOpsDataRoot, "market-activity-30d-preview-v0.1.json");

  if (!fs.existsSync(activityPath)) {
    writeJson(activityPath, buildMarketActivityPreview());
  }

  console.log("MarketOps public dashboard data refreshed.");
  console.log(`dashboard bundle: ${dashboard.filePath}`);
  console.log(`activity preview: ${activityPath}`);
  console.log("");
  return { dashboardPath: dashboard.filePath, activityPath };
}

if (require.main === module) {
  try {
    refreshSiteDashboard();
  } catch (error) {
    console.error("MarketOps paper:refresh-site failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { buildMarketActivityPreview, refreshSiteDashboard };
