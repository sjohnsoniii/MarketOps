const SCORE_RANGES = {
  QUALITY: { MIN: 0, MAX: 100 },
  CONFIDENCE: { MIN: 0, MAX: 1 }
};

function clampConfidence(val) {
  return Math.max(0, Math.min(1, val));
}

function clampQuality(val) {
  return Math.max(0, Math.min(100, val));
}

function scoreFromData(availableFields, requiredFields) {
  if (!requiredFields || requiredFields.length === 0) return 1;
  const found = requiredFields.filter(f => availableFields.includes(f)).length;
  return clampConfidence(found / requiredFields.length);
}

function qualityFromCounts(found, expected, maxScore) {
  if (!expected || expected === 0) return maxScore || 100;
  const ratio = Math.min(1, (found || 0) / expected);
  return clampQuality((ratio * (maxScore || 100)));
}

function freshnessScore(timestamp, maxAgeMs) {
  if (!timestamp) return 0;
  const age = Date.now() - new Date(timestamp).getTime();
  if (age <= 0) return 1;
  const ratio = age / maxAgeMs;
  return clampConfidence(Math.max(0, 1 - ratio));
}

module.exports = {
  SCORE_RANGES,
  clampConfidence,
  clampQuality,
  scoreFromData,
  qualityFromCounts,
  freshnessScore
};
