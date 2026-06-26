const { round } = require("../utils/number");
const { paths } = require("../utils/paths");
const { loadJson } = require("../utils/fileStore");

const DEFAULT_GENERATED_AT = "2026-01-03T16:00:00.000Z";

// ---------------------------------------------------------------------------
// Signal model (rebuilt 2026-06-25): trend-filtered mean reversion.
//
// Backtest (Reports/marketops-signal-rebuild-phase1-backtest-v0.1.md) over
// market_bars 2026-06-11..06-25 found the old "full-history trailing return,
// bet in its direction" signal was anti-predictive (session corr -0.078; its
// go-long cohort won 31.4% vs 40.5% for ignored names). The two measurable
// edges were: 1-day trend PERSISTS (ROC-1d corr +0.118) while short-term/VWAP
// extension MEAN-REVERTS (VWAP-distance corr -0.163). Combining them — long
// only when the 1-day trend is up AND price has pulled back to/below session
// VWAP — lifted the cohort win rate (4h: 45.7% vs 34.0% rest) and flipped the
// average-return edge positive. Long-only, matching the existing contract.
//
// A 1-day uptrend can still be a name in freefall on the day, so the config
// falling-knife filter (learningMode.entryFilters.fallingKnifeThresholdPct) is
// evaluated here, BEFORE the signal fires — a sharp drop from the day's open is
// rejected even when price is below VWAP. The executor keeps its own
// falling-knife filter as the downstream safety net.
// ---------------------------------------------------------------------------

// Direction gate: 1-day ROC must be at least this positive to count as an uptrend.
const TREND_MIN_PCT = 0;
// Entry gate: price must be at least this far below session VWAP (a real dip).
const DIP_MAX_PCT = 0;

// Confidence = setup quality (how cleanly trend + dip align), NOT a magnitude
// transform of trailing return. Each component saturates at "full" and the two
// are blended, then mapped into the [0.10, 0.90] band the risk desk expects.
const TREND_FULL_PCT = 2.0;   // 1-day ROC of +2% scores a full trend component
const DIP_FULL_PCT = 0.5;     // 0.5% below VWAP scores a full dip component (the
                              //   backtest win-rate cliff sits at the -0.5% bucket)
const W_TREND = 0.5;
const W_DIP = 0.5;
const CONFIDENCE_FLOOR = 0.10;
const CONFIDENCE_SPAN = 0.80;

// Status tiers off the resulting confidence (risk desk accepts both candidate
// and learning_candidate; band/sizing is then keyed off confidence there).
const CANDIDATE_CONFIDENCE = 0.50;
const LEARNING_CONFIDENCE = 0.34;

const DEFAULT_FALLING_KNIFE_PCT = 3;

function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function loadFallingKnifeThresholdPct() {
  try {
    const config = loadJson(paths.config);
    const filters = config.learningMode && config.learningMode.entryFilters;
    if (filters && filters.fallingKnifeThresholdPct != null) return filters.fallingKnifeThresholdPct;
  } catch {}
  return DEFAULT_FALLING_KNIFE_PCT;
}

// ET (America/New_York) calendar-day key for a timestamp. Used to scope the
// session VWAP and the day's-open lookup to the live trading day.
function etDateKey(timestamp) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit"
  });
  const parts = fmt.formatToParts(new Date(timestamp)).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Session VWAP across the bars sharing the latest bar's ET day. Volume-weighted
// typical price. Returns null if those bars carry no volume.
function sessionVwap(bars, latestIdx) {
  const dk = etDateKey(bars[latestIdx].timestamp);
  let pv = 0, vv = 0;
  for (let i = latestIdx; i >= 0; i--) {
    if (etDateKey(bars[i].timestamp) !== dk) break;
    const b = bars[i];
    const typical = (Number(b.high) + Number(b.low) + Number(b.close)) / 3;
    const vol = Number(b.volume) || 0;
    pv += typical * vol;
    vv += vol;
  }
  return vv > 0 ? pv / vv : null;
}

// First bar's open for the latest bar's ET day (the session open).
function sessionOpen(bars, latestIdx) {
  const dk = etDateKey(bars[latestIdx].timestamp);
  let open = null;
  for (let i = 0; i <= latestIdx; i++) {
    if (etDateKey(bars[i].timestamp) === dk) { open = Number(bars[i].open); break; }
  }
  return open;
}

// 1-day rate of change: latest close vs the most recent bar at or before
// ~24h earlier (tolerant of overnight/weekend gaps up to 4 days). null if no
// such reference bar exists.
function rateOfChange1d(bars, latestIdx) {
  const latestT = new Date(bars[latestIdx].timestamp).getTime();
  const target = latestT - 24 * 60 * 60 * 1000;
  const maxGapMs = 4 * 24 * 60 * 60 * 1000;
  for (let i = latestIdx; i >= 0; i--) {
    const t = new Date(bars[i].timestamp).getTime();
    if (t <= target) {
      if (target - t > maxGapMs) return null;
      const ref = Number(bars[i].close);
      if (!ref) return null;
      return ((Number(bars[latestIdx].close) - ref) / ref) * 100;
    }
  }
  return null;
}

function buildEntryPlan(signal, vehicle) {
  const referencePrice = signal.latestClose;
  const maxEntrySlippagePct = signal.riskLevel === "high" ? 0.5 : signal.riskLevel === "medium" ? 1.0 : 1.5;
  const validHours = 24;
  const entryValidUntil = new Date(new Date(signal.generatedAt).getTime() + validHours * 60 * 60 * 1000).toISOString();

  return {
    referencePrice: round(referencePrice),
    entryReason: `${vehicle.symbol}: 1-day trend +${round(signal.roc1dPct)}% and price ${round(-signal.vwapDistPct)}% below VWAP (pullback in an uptrend)`,
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
    // setup geometry — what actually drove the signal
    roc1dPct: signal.roc1dPct != null ? round(signal.roc1dPct) : null,
    vwapDistPct: signal.vwapDistPct != null ? round(signal.vwapDistPct) : null,
    momentum: signal.roc1dPct > 1.5 ? "strong" : signal.roc1dPct > 0.5 ? "moderate" : "weak",
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

function noDataSignal(vehicle, generatedAt, dataSource, sourceLabel) {
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
    roc1dPct: null,
    vwapDistPct: null,
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

function generateCandidateId(symbol, generatedAt) {
  const ts = generatedAt ? new Date(generatedAt).getTime() : Date.now();
  return `cand-${symbol}-${ts}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateSampleSignals({ vehicles, marketBars, marketDataInfo = {}, generatedAt = DEFAULT_GENERATED_AT, vehicleHistoryOutput = null }) {
  const dataSource = marketDataInfo.dataSource || "deterministic_sample";
  const sourceLabel = dataSource === "alpaca_iex" ? "Alpaca IEX market data" : "sample market bars";
  const fallingKnifePct = loadFallingKnifeThresholdPct();

  const results = vehicles.map((vehicle) => {
    const bars = marketBars
      .filter((bar) => bar.symbol === vehicle.symbol)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (bars.length < 2) {
      return noDataSignal(vehicle, generatedAt, dataSource, sourceLabel);
    }

    const latestIdx = bars.length - 1;
    const latest = bars[latestIdx];
    const latestClose = Number(latest.close);

    // ---- setup geometry ----
    const roc1dPct = rateOfChange1d(bars, latestIdx);
    const vwap = sessionVwap(bars, latestIdx);
    const vwapDistPct = vwap != null && vwap > 0 ? ((latestClose - vwap) / vwap) * 100 : null;
    const dayOpen = sessionOpen(bars, latestIdx);
    const changeFromOpenPct = dayOpen ? ((latestClose - dayOpen) / dayOpen) * 100 : null;

    // ---- gates: 1-day uptrend AND below VWAP AND not a falling knife ----
    const haveGeometry = roc1dPct != null && vwapDistPct != null;
    const trendUp = haveGeometry && roc1dPct > TREND_MIN_PCT;
    const belowVwap = haveGeometry && vwapDistPct < DIP_MAX_PCT;
    const fallingKnife = changeFromOpenPct != null && changeFromOpenPct <= -fallingKnifePct;
    const qualifies = trendUp && belowVwap && !fallingKnife;

    // ---- confidence = setup quality (clean alignment of trend + dip) ----
    let confidence = 0;
    if (qualifies) {
      const trendStrength = clamp01(roc1dPct / TREND_FULL_PCT);
      const dipDepth = clamp01(-vwapDistPct / DIP_FULL_PCT);
      const raw = W_TREND * trendStrength + W_DIP * dipDepth;
      confidence = CONFIDENCE_FLOOR + CONFIDENCE_SPAN * raw;
    }

    let status;
    let directionBias;
    if (!haveGeometry) {
      status = "ignore";
      directionBias = "flat";
    } else if (qualifies && confidence >= CANDIDATE_CONFIDENCE) {
      status = "candidate";
      directionBias = "up";
    } else if (qualifies && confidence >= LEARNING_CONFIDENCE) {
      status = "learning_candidate";
      directionBias = "up";
    } else {
      status = "ignore";
      directionBias = "flat";
    }

    const isUp = directionBias === "up";
    const learningCandidateScore = status === "learning_candidate" ? confidence : (status === "candidate" ? confidence : 0);
    const normalizedConfidence = Math.max(confidence, learningCandidateScore);
    const nearCandidate = status === "learning_candidate";

    const absChange = roc1dPct != null ? Math.abs(roc1dPct) : 0;
    const riskLevel = classifyRisk({ vehicle, absChange, directionBias });

    const vh = vehicleHistoryOutput ? getVehicleHistory(vehicleHistoryOutput, vehicle.symbol) : null;

    let trigger;
    if (isUp) {
      trigger = `${vehicle.symbol}: 1-day uptrend +${round(roc1dPct)}%, pulled back ${round(-vwapDistPct)}% below session VWAP — buy-the-dip setup across ${sourceLabel}.`;
    } else if (fallingKnife) {
      trigger = `${vehicle.symbol} down ${round(changeFromOpenPct)}% from the day's open — falling knife, no entry.`;
    } else if (haveGeometry && !trendUp) {
      trigger = `${vehicle.symbol} 1-day trend ${round(roc1dPct)}% is not up — no long setup.`;
    } else if (haveGeometry && !belowVwap) {
      trigger = `${vehicle.symbol} trading ${round(vwapDistPct)}% above VWAP (extended) — waiting for a pullback.`;
    } else {
      trigger = `${vehicle.symbol}: insufficient history to confirm a 1-day trend / VWAP setup.`;
    }

    const invalidation = isUp
      ? "Setup fails if the 1-day uptrend rolls over (1-day ROC turns negative) or price extends back above VWAP without follow-through."
      : "No actionable move.";

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
      // sampleChangePct retained for downstream (explainability/displays); now
      // carries the directional measure that drives the bias: the 1-day ROC.
      sampleChangePct: roc1dPct != null ? round(roc1dPct) : 0,
      roc1dPct: roc1dPct != null ? round(roc1dPct) : null,
      vwapDistPct: vwapDistPct != null ? round(vwapDistPct) : null,
      changeFromOpenPct: changeFromOpenPct != null ? round(changeFromOpenPct) : null,
      latestClose,
      confidence: round(confidence),
      normalizedConfidence: round(normalizedConfidence),
      learningCandidateScore: round(learningCandidateScore),
      nearCandidate,
      riskLevel,
      trigger,
      invalidation,
      sourceDesk: "Trade Desk",
      sourceModule: "simpleSignalScanner",
      generatedAt
    };

    if (isUp) {
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
    signalModel: "trend_filtered_mean_reversion_v1",
    trendMinPct: TREND_MIN_PCT,
    dipMaxPct: DIP_MAX_PCT,
    fallingKnifeThresholdPct: fallingKnifePct,
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
