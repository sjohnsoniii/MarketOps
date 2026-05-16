const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

const MIN_BARS_FOR_CONFIDENCE = 10;
const MIN_FRESHNESS_MINUTES = 390;
const CONFIDENCE_THRESHOLD = 0.55;
const UP_THRESHOLD_PCT = 0.25;

function calculateTrendScore(bars) {
  if (bars.length < 5) return 0;
  const recent = bars.slice(-5);
  const first = recent[0].close;
  const last = recent[recent.length - 1].close;
  return first > 0 ? round(((last - first) / first) * 100, 4) : 0;
}

function calculateMomentumScore(bars) {
  if (bars.length < 10) return 0;
  const older = bars.slice(-10, -5);
  const newer = bars.slice(-5);
  const olderAvg = older.reduce((s, b) => s + b.close, 0) / older.length;
  const newerAvg = newer.reduce((s, b) => s + b.close, 0) / newer.length;
  return olderAvg > 0 ? round(((newerAvg - olderAvg) / olderAvg) * 100, 4) : 0;
}

function calculateVolatility(bars) {
  if (bars.length < 5) return null;
  const recent = bars.slice(-20);
  const returns = [];
  for (let i = 1; i < recent.length; i++) {
    const r = recent[i - 1].close > 0 ? (recent[i].close - recent[i - 1].close) / recent[i - 1].close : 0;
    returns.push(r);
  }
  if (returns.length === 0) return null;
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  return round(Math.sqrt(variance), 6);
}

function calculateConfidence(symbol) {
  let rollingData = null;
  if (fileExists(paths.rollingHistoryJson)) {
    try {
      rollingData = loadJson(paths.rollingHistoryJson);
    } catch {
      rollingData = null;
    }
  }

  let bars = [];
  let freshnessMinutes = null;

  if (rollingData && rollingData.symbols && rollingData.symbols[symbol]) {
    const symInfo = rollingData.symbols[symbol];
    freshnessMinutes = symInfo.freshnessMinutes !== null ? symInfo.freshnessMinutes : null;
    if (rollingData.history) {
      bars = rollingData.history.filter((b) => b.symbol === symbol);
    }
  }

  if (bars.length === 0) {
    if (fileExists(paths.alpacaMarketBarsLatestJson)) {
      try {
        const allBars = loadJson(paths.alpacaMarketBarsLatestJson);
        if (Array.isArray(allBars)) {
          bars = allBars.filter((b) => b.symbol === symbol);
          const sorted = bars.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          if (sorted.length > 0) {
            freshnessMinutes = round((Date.now() - new Date(sorted[0].timestamp).getTime()) / 60000);
          }
        }
      } catch {}
    }
  }

  bars = bars.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const barCount = bars.length;
  const fresh = freshnessMinutes !== null && freshnessMinutes <= MIN_FRESHNESS_MINUTES;
  const hasEnoughBars = barCount >= MIN_BARS_FOR_CONFIDENCE;

  if (!hasEnoughBars || !fresh) {
    return {
      symbol,
      barCount,
      freshnessMinutes,
      fresh,
      enoughData: false,
      confidence: 0,
      directionGate: "none",
      trendScore: 0,
      momentumScore: 0,
      volatility: null,
      volatilityPenalty: 0,
      hasInvalidation: false,
      closeToCandidate: false,
      wouldNeed: hasEnoughBars ? "fresh data" : "more bars",
      approvable: false
    };
  }

  const trendScore = calculateTrendScore(bars);
  const momentumScore = calculateMomentumScore(bars);
  const volatility = calculateVolatility(bars);

  const volatilityPenalty = volatility !== null
    ? Math.min(0.3, volatility * 50)
    : 0.1;

  const directionGate = trendScore >= UP_THRESHOLD_PCT ? "up" : (trendScore <= -UP_THRESHOLD_PCT ? "down" : "flat");
  const trendingUp = directionGate === "up";

  const baseConfidence = trendingUp ? 0.5 : 0.2;
  const trendBonus = Math.min(0.3, Math.abs(trendScore) / 10);
  const momentumBonus = momentumScore > 0 ? Math.min(0.15, momentumScore / 20) : 0;
  const rawConfidence = baseConfidence + trendBonus + momentumBonus - volatilityPenalty;
  const confidence = Math.max(0, Math.min(0.95, round(rawConfidence, 4)));

  const hasInvalidation = confidence >= CONFIDENCE_THRESHOLD;
  const closeToCandidate = confidence >= CONFIDENCE_THRESHOLD * 0.8;
  const approvable = confidence >= CONFIDENCE_THRESHOLD && trendingUp && hasInvalidation;

  const wouldNeed = [];
  if (!trendingUp) wouldNeed.push("upward trend");
  if (confidence < CONFIDENCE_THRESHOLD) wouldNeed.push(`confidence >= ${CONFIDENCE_THRESHOLD}`);
  if (!hasInvalidation) wouldNeed.push("clear invalidation/stop");

  return {
    symbol,
    barCount,
    freshnessMinutes,
    fresh,
    enoughData: true,
    confidence,
    directionGate,
    trendScore: round(trendScore, 4),
    momentumScore: round(momentumScore, 4),
    volatility: volatility !== null ? round(volatility, 6) : null,
    volatilityPenalty: round(volatilityPenalty, 4),
    hasInvalidation,
    closeToCandidate,
    wouldNeed: wouldNeed.length > 0 ? wouldNeed.join(", ") : "none",
    approvable
  };
}

function calibrateAllSymbols() {
  let symbols = [];

  if (fileExists(paths.rollingHistoryJson)) {
    try {
      const rh = loadJson(paths.rollingHistoryJson);
      if (rh.symbols) symbols = Object.keys(rh.symbols);
    } catch {}
  }

  if (symbols.length === 0 && fileExists(paths.alpacaMarketBarsLatestJson)) {
    try {
      const bars = loadJson(paths.alpacaMarketBarsLatestJson);
      if (Array.isArray(bars)) {
        symbols = [...new Set(bars.map((b) => b.symbol))];
      }
    } catch {}
  }

  if (symbols.length === 0) {
    const result = {
      generatedAt: new Date().toISOString(),
      status: "no_data",
      symbols: [],
      totalSymbols: 0,
      approvableCount: 0,
      closeToCandidateCount: 0,
      confidenceReadiness: "not_ready"
    };
    writeJson(paths.confidenceJson, result);
    return result;
  }

  const results = symbols.map((s) => calculateConfidence(s));

  const approvableCount = results.filter((r) => r.approvable).length;
  const closeToCandidateCount = results.filter((r) => r.closeToCandidate).length;

  const output = {
    generatedAt: new Date().toISOString(),
    status: results.length > 0 ? "calibrated" : "no_data",
    symbols: results,
    totalSymbols: results.length,
    approvableCount,
    closeToCandidateCount,
    confidenceReadiness: approvableCount > 0 ? "ready" : "review_needed",
    confidenceThreshold: CONFIDENCE_THRESHOLD
  };

  writeJson(paths.confidenceJson, output);

  const rowLines = results.map((r) =>
    `| ${r.symbol} | ${r.barCount} | ${r.fresh ? "fresh" : "stale"} | ${r.confidence} | ${r.directionGate} | ${r.trendScore} | ${r.momentumScore} | ${r.volatilityPenalty} | ${r.closeToCandidate} | ${r.approvable} | ${r.wouldNeed} |`
  );

  const reportText = [
    "# MarketOps Confidence Calibration v0.1",
    "",
    `Generated: ${output.generatedAt}`,
    `Confidence threshold: ${CONFIDENCE_THRESHOLD}`,
    `Direction gate: up (>= ${UP_THRESHOLD_PCT}%)`,
    "",
    "## Summary",
    "",
    `- Symbols calibrated: ${output.totalSymbols}`,
    `- Approvable: ${approvableCount}`,
    `- Close to candidate: ${closeToCandidateCount}`,
    `- Confidence readiness: ${output.confidenceReadiness}`,
    "",
    "## Per Symbol",
    "",
    "| Symbol | Bars | Freshness | Confidence | Direction | Trend | Momentum | Vol Penalty | Close To Candidate | Approvable | Would Need |",
    "|--------|------|-----------|------------|-----------|-------|----------|-------------|--------------------|------------|------------|",
    ...rowLines,
    "",
    "## Notes",
    "",
    "- Calibrated confidence is computed from rolling-history bars (trend, momentum, volatility).",
    "- Bar count < 10 or stale data yields calibrated confidence 0.",
    "- Volatility penalty reduces calibrated confidence for high-variance symbols.",
    "- \"Approvable\" (calibrated) and risk-desk \"approved\" (signal scanner) are independent axes.",
    "- Signal scanner confidence may exceed 0.55 even when calibrated confidence is 0 (different data sources, different formulas).",
    "- Does not lower thresholds. Only reports current state.",
    ""
  ];

  writeText(paths.confidenceReport, reportText.join("\n"));

  return output;
}

function runCli() {
  try {
    const result = calibrateAllSymbols();
    console.log("MarketOps confidence calibration complete.");
    console.log(`Symbols: ${result.totalSymbols}`);
    console.log(`Approvable: ${result.approvableCount}`);
    console.log(`Readiness: ${result.confidenceReadiness}`);
    console.log(`Confidence JSON: ${paths.confidenceJson}`);
    return result;
  } catch (error) {
    console.error("MarketOps confidence calibration failed.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli();
}

module.exports = { calculateConfidence, calibrateAllSymbols, CONFIDENCE_THRESHOLD };
