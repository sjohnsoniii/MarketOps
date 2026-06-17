const { round } = require("../utils/number");

const DEFAULT_GENERATED_AT = "2026-01-03T16:00:00.000Z";

function generateCandidateId(symbol, generatedAt) {
  const ts = generatedAt ? new Date(generatedAt).getTime() : Date.now();
  return `cand-${symbol}-${ts}-${Math.random().toString(36).slice(2, 6)}`;
}

function buildEntryPlan(signal, vehicle) {
  const referencePrice = signal.latestClose;
  const maxEntrySlippagePct = signal.riskLevel === "high" ? 0.5 : signal.riskLevel === "medium" ? 1.0 : 1.5;
  const validHours = 24;
  const entryValidUntil = new Date(new Date(signal.generatedAt).getTime() + validHours * 60 * 60 * 1000).toISOString();

  return {
    referencePrice: round(referencePrice),
    entryReason: `${vehicle.symbol} moved ${round(signal.sampleChangePct)}% with ${signal.directionBias} bias`,
    entryTrigger: signal.trigger,
    entryValidUntil,
    maxEntrySlippagePct
  };
}

function buildExitPlan(signal) {
  // Mirror the actual execution thresholds (learningMode.exitRules.byInstrumentType
  // = 2.0/1.5 for the intraday model) so this stored metadata matches how the
  // position is really managed. Execution reads byInstrumentType, not this plan;
  // and the entry R:R filter gates on byInstrumentType directly — this is kept
  // coherent so the persisted exitPlan isn't misleading.
  const profitTargetPct = 2.0;
  const stopLossPct = 1.5;
  // Same-session intraday hold: force-closed before the bell, so the plan's
  // horizon is the trading day, not multi-day.
  const maxHoldHours = 7;
  const maxHoldUntil = new Date(new Date(signal.generatedAt).getTime() + maxHoldHours * 60 * 60 * 1000).toISOString();

  return {
    profitTargetPct,
    stopLossPct,
    maxHoldUntil,
    maxHoldHours,
    invalidationRules: signal.invalidation || "No invalidation defined",
    exitIfDataDegraded: true,
    exitIfCycleStops: true
  };
}

function buildRiskPlan(signal, vehicle, normalPositionValue) {
  const maxPositionPct = signal.riskLevel === "high" ? 0.10 : signal.riskLevel === "medium" ? 0.25 : 0.30;
  const maxDollarRisk = round(normalPositionValue * (signal.riskLevel === "high" ? 0.04 : 0.05));

  return {
    maxPositionPct,
    intendedPositionValue: round(normalPositionValue),
    maxDollarRisk,
    paperOnly: true
  };
}

function buildSignalEvidence(signal, vehicleHistory) {
  const evidence = {
    confidence: round(signal.confidence),
    scannerConfidence: round(signal.confidence),
    normalizedConfidence: round(signal.normalizedConfidence || signal.confidence),
    learningCandidateScore: round(signal.learningCandidateScore || 0),
    nearCandidate: signal.nearCandidate || false,
    dataQuality: signal.dataSource === "alpaca_iex" || signal.dataSource === "alpaca_iex_backfill" ? "market_data" : "sample_bars",
    trend: signal.directionBias === "up" ? "bullish" : signal.directionBias === "down" ? "bearish" : "neutral",
    momentum: signal.sampleChangePct > 3 ? "strong" : signal.sampleChangePct > 1.5 ? "moderate" : "weak",
    vehicleHistorySummary: null
  };

  if (vehicleHistory) {
    evidence.vehicleHistorySummary = {
      lookbackDays: vehicleHistory.lookbackDays,
      barCount: vehicleHistory.barCount,
      trendDirection: vehicleHistory.trendDirection,
      changePct: vehicleHistory.changePct,
      volatilityEstimate: vehicleHistory.volatilityEstimate,
      dataQuality: vehicleHistory.dataQuality,
      insufficientData: vehicleHistory.insufficientData
    };
  }

  return evidence;
}

const LEARNING_CANDIDATE_THRESHOLD = 1.2;

function generateSampleSignals({ vehicles, marketBars, marketDataInfo = {}, generatedAt = DEFAULT_GENERATED_AT, vehicleHistoryOutput = null }) {
  const movementThresholdPct = 2.0;
  const dataSource = marketDataInfo.dataSource || "deterministic_sample";
  const sourceLabel = dataSource === "alpaca_iex" ? "Alpaca IEX market data" : "sample market bars";

  const results = vehicles.map((vehicle) => {
    const bars = marketBars
      .filter((bar) => bar.symbol === vehicle.symbol)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (bars.length < 2) {
      return {
        signalId: `sample-signal-${vehicle.symbol}`,
        candidateId: generateCandidateId(vehicle.symbol, generatedAt),
        symbol: vehicle.symbol,
        assetType: vehicle.assetType,
        universe: vehicle.universe,
        status: "no_data",
        directionBias: "none",
        dataSource,
        paperOnly: true,
        liveTradingEnabled: false,
        sampleChangePct: 0,
        latestClose: null,
        confidence: 0,
        normalizedConfidence: 0,
        learningCandidateScore: 0,
        nearCandidate: false,
        riskLevel: "blocked",
        trigger: `Not enough ${sourceLabel}.`,
        invalidation: "N/A",
        sourceDesk: "Trade Desk",
        generatedAt,
        entryPlan: null,
        exitPlan: null,
        riskPlan: null,
        signalEvidence: {
          confidence: 0,
          scannerConfidence: 0,
          dataQuality: "insufficient",
          trend: "unknown",
          momentum: "unknown",
          vehicleHistorySummary: null
        }
      };
    }

    const first = bars[0];
    const latest = bars[bars.length - 1];
    const sampleChangePct = ((latest.close - first.close) / first.close) * 100;
    const absChange = Math.abs(sampleChangePct);

    let directionBias = "flat";
    if (sampleChangePct >= movementThresholdPct) directionBias = "up";
    else if (sampleChangePct >= LEARNING_CANDIDATE_THRESHOLD) directionBias = "up";
    if (sampleChangePct <= -movementThresholdPct) directionBias = "down";
    else if (sampleChangePct <= -LEARNING_CANDIDATE_THRESHOLD) directionBias = "down";

    const isCandidate = absChange >= movementThresholdPct;
    const nearCandidate = !isCandidate && absChange >= LEARNING_CANDIDATE_THRESHOLD;
    const learningCandidate = nearCandidate;

    const status = isCandidate
      ? "candidate"
      : learningCandidate
        ? "learning_candidate"
        : "ignore";

    const confidence = isCandidate
      ? Math.min(0.9, 0.5 + absChange / 20)
      : Math.max(0.1, absChange / 10);

    const learningCandidateScore = isCandidate
      ? Math.min(0.9, 0.5 + absChange / 20)
      : learningCandidate
        ? Math.min(0.55, (absChange / movementThresholdPct) * 0.55)
        : 0;

    const normalizedConfidence = Math.max(confidence, learningCandidateScore);

    const riskLevel = classifyRisk({ vehicle, absChange, directionBias });

    const vh = vehicleHistoryOutput ? getVehicleHistory(vehicleHistoryOutput, vehicle.symbol) : null;

    const baseSignal = {
      signalId: `sample-signal-${vehicle.symbol}`,
      candidateId: generateCandidateId(vehicle.symbol, generatedAt),
      symbol: vehicle.symbol,
      assetType: vehicle.assetType,
      universe: vehicle.universe,
      status,
      directionBias,
      dataSource,
      paperOnly: true,
      liveTradingEnabled: false,
      sampleChangePct: round(sampleChangePct),
      latestClose: latest.close,
      confidence: round(confidence),
      normalizedConfidence: round(normalizedConfidence),
      learningCandidateScore: round(learningCandidateScore),
      nearCandidate,
      riskLevel,
      trigger: isCandidate
        ? `${vehicle.symbol} moved ${round(sampleChangePct)}% across ${sourceLabel}.`
        : nearCandidate
          ? `${vehicle.symbol} moved ${round(sampleChangePct)}% — near candidate threshold for learning probe.`
          : `${vehicle.symbol} movement did not clear ${movementThresholdPct}% threshold.`,
      invalidation: directionBias === "up"
        ? "Move fails if price falls back below prior paper-simulation trend."
        : directionBias === "down"
          ? "Move fails if price recovers above prior paper-simulation trend."
          : "No actionable move.",
      sourceDesk: "Trade Desk",
      sourceModule: "simpleSignalScanner",
      generatedAt
    };

    if ((isCandidate || learningCandidate) && directionBias === "up") {
      const normalPositionValue = 1000 * 0.25;
      baseSignal.entryPlan = buildEntryPlan({ ...baseSignal, generatedAt }, vehicle);
      baseSignal.exitPlan = buildExitPlan({ ...baseSignal, generatedAt });
      baseSignal.riskPlan = buildRiskPlan({ ...baseSignal, generatedAt }, vehicle, normalPositionValue);
    } else {
      baseSignal.entryPlan = null;
      baseSignal.exitPlan = null;
      baseSignal.riskPlan = null;
    }

    baseSignal.signalEvidence = buildSignalEvidence(baseSignal, vh);

    return baseSignal;
  });

  return {
    generatedAt,
    mode: "paper_simulation",
    dataSource,
    paperOnly: true,
    liveTradingEnabled: false,
    latestMarketDataRefreshAt: marketDataInfo.latestMarketDataRefreshAt || null,
    latestBarTimestamp: marketDataInfo.latestBarTimestamp || null,
    sampleDataOnly: true,
    movementThresholdPct,
    totalVehicles: results.length,
    totalMarketBars: marketBars.length,
    candidateCount: results.filter((item) => item.status === "candidate").length,
    learningCandidateCount: results.filter((item) => item.status === "learning_candidate").length,
    signals: results
  };
}

function getVehicleHistory(historyOutput, symbol) {
  if (!historyOutput || !historyOutput.histories) return null;
  return historyOutput.histories.find((h) => h.symbol === symbol) || null;
}

function classifyRisk({ vehicle, absChange, directionBias }) {
  if (directionBias === "flat") return "low";
  if (vehicle.assetType === "CRYPTO" && absChange >= 5) return "high";
  if (vehicle.assetType === "CRYPTO") return "medium";
  if (absChange >= 5) return "high";
  if (absChange >= 2) return "medium";
  return "low";
}

module.exports = { DEFAULT_GENERATED_AT, generateSampleSignals };
