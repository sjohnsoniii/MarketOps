const fs = require("fs");
const path = require("path");
const { round } = require("../utils/number");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const paperRoot = path.join(projectRoot, "Data", "paper");
const backtestRoot = path.join(projectRoot, "Data", "backtests");

const inputPaths = {
  equity: path.join(paperRoot, "equity", "equity-curve-v0.1.json"),
  trades: path.join(paperRoot, "trades", "paper-trades-v0.1.json"),
  backtestSummary: path.join(backtestRoot, "latest-backtest-summary.json")
};

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function pctChange(previous, next) {
  if (!previous) return 0;
  return ((next - previous) / previous) * 100;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function longestStreak(outcomes, target) {
  let current = 0;
  let longest = 0;
  outcomes.forEach((outcome) => {
    if (outcome === target) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  return longest;
}

function analyzeEquityCurve(equityCurve) {
  const points = Array.isArray(equityCurve.points) ? equityCurve.points : [];
  const equityPoints = points.map((point) => Number(point.equity || 0));
  const returns = [];
  for (let index = 1; index < equityPoints.length; index += 1) {
    returns.push(pctChange(equityPoints[index - 1], equityPoints[index]));
  }

  let peak = equityPoints[0] || 0;
  let peakStep = 0;
  let trough = equityPoints[0] || 0;
  let troughStep = 0;
  let maxDrawdownPct = 0;
  points.forEach((point, index) => {
    const equity = Number(point.equity || 0);
    if (equity > peak) {
      peak = equity;
      peakStep = index;
    }
    const drawdown = peak ? ((equity - peak) / peak) * 100 : 0;
    if (drawdown < maxDrawdownPct) {
      maxDrawdownPct = drawdown;
      trough = equity;
      troughStep = index;
    }
  });

  const volatilityPct = standardDeviation(returns);
  const averageStepReturnPct = average(returns);
  const sharpeLikePlaceholder = volatilityPct === 0 ? 0 : averageStepReturnPct / volatilityPct;
  const recoveryNeededPct = trough ? ((peak - trough) / trough) * 100 : 0;

  return {
    startingEquity: equityPoints[0] || Number(equityCurve.startingBalance || 0),
    endingEquity: equityPoints.length ? equityPoints[equityPoints.length - 1] : Number(equityCurve.endingEquity || 0),
    totalPnl: round(Number(equityCurve.totalPnl || 0)),
    totalReturnPct: round(Number(equityCurve.totalReturnPct || 0)),
    maxDrawdownPct: round(maxDrawdownPct),
    peakEquity: round(peak),
    peakStep,
    troughEquity: round(trough),
    troughStep,
    recoveryNeededPct: round(recoveryNeededPct),
    averageStepReturnPct: round(averageStepReturnPct),
    stepVolatilityPct: round(volatilityPct),
    sharpeLikePlaceholder: round(sharpeLikePlaceholder),
    equityPointCount: points.length,
    drawdownObservation: maxDrawdownPct < -5
      ? "Sample paper drawdown deserves review before any experiment promotion."
      : "Current sample paper drawdown is small, but the data set is too limited for confidence."
  };
}

function analyzeTrades(tradesOutput) {
  const trades = Array.isArray(tradesOutput.trades) ? tradesOutput.trades : [];
  const sanitized = trades.map((trade, index) => ({
    sequence: index + 1,
    symbol: trade.symbol,
    assetType: trade.assetType,
    realizedPnl: round(Number(trade.realizedPnl || 0)),
    returnPct: round(Number(trade.returnPct || 0)),
    outcome: Number(trade.realizedPnl || 0) > 0 ? "win" : Number(trade.realizedPnl || 0) < 0 ? "loss" : "flat"
  }));
  const outcomes = sanitized.map((trade) => trade.outcome);
  const wins = outcomes.filter((outcome) => outcome === "win").length;
  const losses = outcomes.filter((outcome) => outcome === "loss").length;
  const flats = outcomes.filter((outcome) => outcome === "flat").length;
  const pnlValues = sanitized.map((trade) => trade.realizedPnl);
  const returnValues = sanitized.map((trade) => trade.returnPct);

  return {
    tradeCount: trades.length,
    wins,
    losses,
    flats,
    winRatePct: trades.length ? round((wins / trades.length) * 100) : 0,
    averageTradePnl: round(average(pnlValues)),
    averageTradeReturnPct: round(average(returnValues)),
    bestPaperTradePnl: pnlValues.length ? round(Math.max(...pnlValues)) : 0,
    worstPaperTradePnl: pnlValues.length ? round(Math.min(...pnlValues)) : 0,
    longestWinStreak: longestStreak(outcomes, "win"),
    longestLossStreak: longestStreak(outcomes, "loss"),
    sanitizedTradeOutcomes: sanitized
  };
}

function analyzeRegimes(backtestSummary) {
  const results = Array.isArray(backtestSummary.regimeResults) ? backtestSummary.regimeResults : [];
  const regimeRows = results.map((item) => ({
    regime: item.classification && item.classification.regime,
    periodId: item.periodId,
    strategyReturnPct: round(item.score && item.score.totalReturnPct),
    benchmarkReturnPct: round(item.score && item.score.benchmarkReturnPct),
    benchmarkComparisonPct: round(item.score && item.score.benchmarkComparisonPct),
    maxDrawdownPct: round(item.score && item.score.maxDrawdownPct),
    syntheticPeriodDrawdownPct: round(item.classification && item.classification.maxDrawdownPct),
    tradeCount: item.score && item.score.tradeCount,
    winRatePct: round(item.score && item.score.winRatePct),
    regimeScore: round(item.score && item.score.regimeScore),
    riskWarnings: (item.score && item.score.riskWarnings) || [],
    overfittingWarnings: (item.score && item.score.overfittingWarnings) || []
  }));

  const byScore = regimeRows.slice().sort((a, b) => b.regimeScore - a.regimeScore);
  const byDrawdown = regimeRows.slice().sort((a, b) => a.syntheticPeriodDrawdownPct - b.syntheticPeriodDrawdownPct);
  const activeRows = regimeRows.filter((row) => row.tradeCount > 0);
  const inactiveRows = regimeRows.filter((row) => row.tradeCount === 0);
  const averageBenchmarkComparisonPct = round(average(regimeRows.map((row) => row.benchmarkComparisonPct)));

  return {
    regimesCompared: regimeRows.length,
    strongestPaperRegime: byScore[0] ? byScore[0].regime : "none",
    weakestPaperRegime: byScore[byScore.length - 1] ? byScore[byScore.length - 1].regime : "none",
    worstSyntheticDrawdownRegime: byDrawdown[0] ? byDrawdown[0].regime : "none",
    activeRegimes: activeRows.map((row) => row.regime),
    inactiveRegimes: inactiveRows.map((row) => row.regime),
    averageRegimeScore: round(average(regimeRows.map((row) => row.regimeScore))),
    averageBenchmarkComparisonPct,
    regimeRows,
    overfittingWarnings: [
      "Synthetic regimes are deterministic samples, not evidence of durable edge.",
      "Strong scores in melt-up or trend-up samples can overstate readiness if choppy and panic regimes stay inactive.",
      "Any metric improvement must move through paper test, QA, and human review before changing production behavior."
    ]
  };
}

function buildRiskAdjustedScore({ equityAnalytics, tradeAnalytics, regimeAnalytics }) {
  const returnComponent = Math.max(-20, Math.min(20, equityAnalytics.totalReturnPct));
  const drawdownPenalty = Math.abs(Math.min(0, equityAnalytics.maxDrawdownPct)) * 3;
  const streakPenalty = tradeAnalytics.longestLossStreak * 4;
  const regimePenalty = regimeAnalytics.inactiveRegimes.length * 3;
  const base = 65 + returnComponent - drawdownPenalty - streakPenalty - regimePenalty;
  return round(Math.max(0, Math.min(100, base)));
}

function runMetricsEngine() {
  const equityCurve = readJson(inputPaths.equity, { points: [] });
  const tradesOutput = readJson(inputPaths.trades, { trades: [] });
  const backtestSummary = readJson(inputPaths.backtestSummary, { regimeResults: [] });

  const equityAnalytics = analyzeEquityCurve(equityCurve);
  const tradeAnalytics = analyzeTrades(tradesOutput);
  const regimeAnalytics = analyzeRegimes(backtestSummary);
  const riskAdjustedScore = buildRiskAdjustedScore({ equityAnalytics, tradeAnalytics, regimeAnalytics });

  return {
    generatedAt: new Date().toISOString(),
    mode: "paper_simulation",
    paperOnly: true,
    sampleData: true,
    analyticsVersion: "marketops-metrics-performance-analytics-v0.1",
    inputSummary: {
      paperEquityPoints: equityAnalytics.equityPointCount,
      paperTradesReviewed: tradeAnalytics.tradeCount,
      syntheticRegimesReviewed: regimeAnalytics.regimesCompared
    },
    equityAnalytics,
    tradeAnalytics,
    regimeAnalytics,
    riskAdjustedScore,
    benchmarkComparisonPlaceholder: {
      averageRegimeBenchmarkComparisonPct: regimeAnalytics.averageBenchmarkComparisonPct,
      note: "Benchmark comparison uses synthetic regime benchmark placeholders only."
    },
    publicSafety: {
      notFinancialAdvice: true,
      noLiveMarketData: true,
      noBrokerConnection: true,
      liveExecutionDisabled: true,
      noSocialAutoPosting: true,
      noProfitabilityClaim: true
    },
    warnings: [
      "Paper/sample metrics are useful for diagnostics, not public performance claims.",
      "The current paper trade sample is small and should not be overinterpreted.",
      "Synthetic regime results expose behavior gaps but do not prove future outcomes."
    ]
  };
}

module.exports = {
  inputPaths,
  analyzeEquityCurve,
  analyzeTrades,
  analyzeRegimes,
  buildRiskAdjustedScore,
  runMetricsEngine
};
