const { loadConfig } = require("../config/configLoader");
const { loadJson, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function sanitizeRunHistorySummary(runHistorySummary) {
  if (!runHistorySummary) return null;
  return {
    generatedAt: runHistorySummary.generatedAt,
    qaStatus: runHistorySummary.qaStatus,
    endingEquity: runHistorySummary.endingEquity,
    paperPnl: runHistorySummary.paperPnl,
    paperReturnPct: runHistorySummary.paperReturnPct
  };
}

function buildPublicDashboardBundle({ generatedAt = new Date().toISOString(), runHistorySummary = null } = {}) {
  const config = loadConfig();
  const signals = loadJson(paths.signalsJson);
  const riskReview = loadJson(paths.riskJson);
  const paperResults = loadJson(paths.tradesJson);
  const equityCurve = loadJson(paths.equityJson);

  const pnlPoints = (paperResults.trades || []).map((trade, index) => ({
    label: `Trade ${index + 1}`,
    vehicle: trade.symbol,
    paperPnl: round(trade.realizedPnl || 0),
    returnPct: round(trade.returnPct || 0)
  }));

  let cumulativePnl = 0;
  const cumulativePnlPoints = [{ label: "Start", cumulativePaperPnl: 0 }].concat(
    pnlPoints.map((point, index) => {
      cumulativePnl = round(cumulativePnl + point.paperPnl);
      return { label: `Step ${index + 1}`, cumulativePaperPnl: cumulativePnl };
    })
  );

  const wins = pnlPoints.filter((point) => point.paperPnl > 0).length;
  const losses = pnlPoints.filter((point) => point.paperPnl < 0).length;
  const flat = pnlPoints.filter((point) => point.paperPnl === 0).length;
  const startingBalance = equityCurve.startingBalance || paperResults.startingBalance;
  const targetBalance = equityCurve.targetBalance || config.paperAccount.targetBalance || 13000;
  const endingEquity = equityCurve.endingEquity || paperResults.endingBalance;
  const signalsReviewed = (signals.signals || []).length || (riskReview.decisions || []).length;

  return {
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    generatedAt,
    startingBalance,
    targetBalance,
    endingEquity,
    paperPnl: round(endingEquity - startingBalance),
    paperReturnPct: round(((endingEquity - startingBalance) / startingBalance) * 100),
    maxDrawdownPct: equityCurve.maxDrawdownPct,
    vehiclesScanned: signals.totalVehicles || signalsReviewed,
    signalsReviewed,
    riskApproved: riskReview.approvedCount,
    riskBlocked: riskReview.blockedCount,
    fakePaperTrades: paperResults.executedTrades,
    equityPoints: (equityCurve.points || []).map((point, index) => ({
      label: index === 0 ? "Start" : `Step ${index}`,
      equity: point.equity,
      paperPnl: point.pnl,
      drawdownPct: point.drawdownPct
    })),
    pnlPoints,
    cumulativePnlPoints,
    drawdownPoints: (equityCurve.points || []).map((point, index) => ({
      label: index === 0 ? "Start" : `Step ${index}`,
      drawdownPct: point.drawdownPct
    })),
    riskDecisionMix: {
      approved: riskReview.approvedCount,
      blocked: riskReview.blockedCount
    },
    tradeOutcomeMix: { wins, losses, flat },
    publicSafeVehicleContribution: pnlPoints.map((point) => ({
      vehicle: point.vehicle,
      paperPnl: point.paperPnl
    })),
    signalFunnel: [
      { label: "Vehicles scanned", value: signals.totalVehicles || signalsReviewed },
      { label: "Signals reviewed", value: signalsReviewed },
      { label: "Risk approved", value: riskReview.approvedCount },
      { label: "Fake paper trades", value: paperResults.executedTrades }
    ],
    milestoneTargets: [
      { label: "Start", balance: startingBalance },
      { label: "Current", balance: endingEquity },
      { label: "+15%", balance: round(startingBalance * 1.15) },
      { label: "+30%", balance: targetBalance },
      { label: "+40%", balance: round(startingBalance * 1.4) },
      { label: "+50%", balance: round(startingBalance * 1.5) }
    ],
    runHistorySummary: sanitizeRunHistorySummary(runHistorySummary),
    publicDisclaimer: "Paper simulation and sample-data preview only. Not real performance. Not investment advice."
  };
}

function writePublicDashboardBundle(filePath = paths.siteDashboardPublicV04Json, options = {}) {
  const bundle = buildPublicDashboardBundle(options);
  writeJson(filePath, bundle);
  return { filePath, bundle };
}

module.exports = { buildPublicDashboardBundle, writePublicDashboardBundle };
