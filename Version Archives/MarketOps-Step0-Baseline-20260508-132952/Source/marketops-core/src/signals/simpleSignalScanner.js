const { round } = require("../utils/number");

const DEFAULT_GENERATED_AT = "2026-01-03T16:00:00.000Z";

function generateSampleSignals({ vehicles, marketBars, generatedAt = DEFAULT_GENERATED_AT }) {
  const movementThresholdPct = 2.0;

  const results = vehicles.map((vehicle) => {
    const bars = marketBars
      .filter((bar) => bar.symbol === vehicle.symbol)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (bars.length < 2) {
      return {
        signalId: `sample-signal-${vehicle.symbol}`,
        symbol: vehicle.symbol,
        assetType: vehicle.assetType,
        universe: vehicle.universe,
        status: "no_data",
        directionBias: "none",
        sampleChangePct: 0,
        latestClose: null,
        confidence: 0,
        riskLevel: "blocked",
        trigger: "Not enough sample market bars.",
        invalidation: "N/A"
      };
    }

    const first = bars[0];
    const latest = bars[bars.length - 1];
    const sampleChangePct = ((latest.close - first.close) / first.close) * 100;
    const absChange = Math.abs(sampleChangePct);

    let directionBias = "flat";
    if (sampleChangePct >= movementThresholdPct) directionBias = "up";
    if (sampleChangePct <= -movementThresholdPct) directionBias = "down";

    const isCandidate = absChange >= movementThresholdPct;
    const confidence = isCandidate
      ? Math.min(0.9, 0.5 + absChange / 20)
      : Math.max(0.1, absChange / 10);

    const riskLevel = classifyRisk({ vehicle, absChange, directionBias });

    return {
      signalId: `sample-signal-${vehicle.symbol}`,
      symbol: vehicle.symbol,
      assetType: vehicle.assetType,
      universe: vehicle.universe,
      status: isCandidate ? "candidate" : "ignore",
      directionBias,
      sampleChangePct: round(sampleChangePct),
      latestClose: latest.close,
      confidence: round(confidence),
      riskLevel,
      trigger: isCandidate
        ? `${vehicle.symbol} moved ${round(sampleChangePct)}% across sample bars.`
        : `${vehicle.symbol} movement did not clear ${movementThresholdPct}% threshold.`,
      invalidation: directionBias === "up"
        ? "Move fails if price falls back below prior sample trend."
        : directionBias === "down"
          ? "Move fails if price recovers above prior sample trend."
          : "No actionable move."
    };
  });

  return {
    generatedAt,
    mode: "paper_simulation",
    sampleDataOnly: true,
    movementThresholdPct,
    totalVehicles: results.length,
    totalMarketBars: marketBars.length,
    candidateCount: results.filter((item) => item.status === "candidate").length,
    signals: results
  };
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
