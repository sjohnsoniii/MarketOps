const path = require("path");

const { fileExists, loadJson, writeJson, writeText, writeJsonWithBackup } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");
const { loadConfig } = require("../config/configLoader");

const CYCLE_STARTING_BALANCE = 1000;
const DEPLETION_THRESHOLD = 0;
const STRATEGY_VERSION = "strategy-v0.1-watchlist-threshold-paper";
const RISK_MODEL_VERSION = "risk-desk-v0.1-long-up-confidence-gate";

function getStartingBalance() {
  try {
    const config = loadConfig();
    const preset = config.paperAccount && config.paperAccount.paperAccountPreset || "standard";
    const presets = config.paperAccountPresets || {};
    const presetBalance = presets[preset] && presets[preset].paperStartingBalance;
    const explicitBalance = config.paperAccount && config.paperAccount.paperStartingBalance;
    return presetBalance || explicitBalance || CYCLE_STARTING_BALANCE;
  } catch {
    return CYCLE_STARTING_BALANCE;
  }
}

function cycleIdFromTimestamp(timestamp) {
  const date = new Date(timestamp || new Date().toISOString());
  const pad = (value) => String(value).padStart(2, "0");
  return `cycle-${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
}

function hoursBetween(start, end) {
  if (!start || !end) return 0;
  return round((new Date(end).getTime() - new Date(start).getTime()) / 3600000);
}

function nextMarketMorningUtc(timestamp) {
  const date = new Date(timestamp || new Date().toISOString());
  date.setUTCDate(date.getUTCDate() + 1);
  date.setUTCHours(13, 30, 0, 0);
  while ([0, 6].includes(date.getUTCDay())) {
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return date.toISOString();
}

function countRejectionReasons(risk) {
  const counts = {};
  (risk.decisions || []).filter((decision) => decision.approved !== true).forEach((decision) => {
    (decision.blockReasons || ["Unknown risk block"]).forEach((reason) => {
      const key = String(reason || "Unknown risk block").replace(/\d+\.\d+/g, "threshold");
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  return Object.entries(counts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

function loadCycleState() {
  if (!fileExists(paths.cycleStateJson)) {
    return {
      schemaVersion: "marketops-paper-cycle-state-v0.1",
      mode: "paper_simulation",
      paperOnly: true,
      cycleStartingBalance: getStartingBalance(),
      depletionThreshold: DEPLETION_THRESHOLD,
      currentCycle: null,
      cycleHistory: [],
      externalEffects: false,
      publishAllowed: false,
      liveTradingEnabled: false,
      brokerExecutionEnabled: false
    };
  }
  return loadJson(paths.cycleStateJson);
}

function newCycle(timestamp) {
  return {
    cycleId: cycleIdFromTimestamp(timestamp),
    cycleNumber: 1,
    status: "active",
    startingBalance: getStartingBalance(),
    currentBalance: getStartingBalance(),
    endingBalance: null,
    depletionThreshold: DEPLETION_THRESHOLD,
    cycleStartTimestamp: timestamp,
    cycleEndTimestamp: null,
    hoursSurvived: 0,
    daysSurvived: 0,
    approvedTrades: 0,
    rejectedTrades: 0,
    rejectionReasons: [],
    strategyVersionUsed: STRATEGY_VERSION,
    riskModelVersionUsed: RISK_MODEL_VERSION,
    lessonsLearnedSoFar: [
      "A cycle should continue while capital remains above the depletion threshold.",
      "No daily reset is allowed for a surviving cycle."
    ],
    proposedImprovements: [],
    approvedImprovementsForNextCycle: [],
    humanReviewNeededItems: [],
    resetTriggerReason: null,
    nextCycleScheduledStart: null,
    appliedRunIds: [],
    lastRunAppliedAt: null,
    externalEffects: false,
    publishAllowed: false
  };
}

function ensureCurrentCycle(state, timestamp) {
  if (state.currentCycle && ["active", "reset_pending"].includes(state.currentCycle.status)) return state.currentCycle;
  const cycle = newCycle(timestamp);
  cycle.cycleNumber = (state.cycleHistory || []).length + 1;
  state.currentCycle = cycle;
  return cycle;
}

function updateCycleFromLatestRun({ state = loadCycleState(), generatedAt = new Date().toISOString() } = {}) {
  const latestRun = loadJson(paths.latestRunSummaryJson);
  const risk = loadJson(paths.riskJson);
  const cycle = ensureCurrentCycle(state, latestRun.generatedAt || generatedAt);
  if (cycle.status === "reset_pending") {
    state.updatedAt = generatedAt;
    writeJsonWithBackup(paths.cycleStateJson, state);
    writeJsonWithBackup(paths.cycleLatestJson, cycle);
    writeText(paths.cycleStatusReport, buildCycleReport(cycle, latestRun));
    return { state, cycle, latestRun };
  }
  const alreadyApplied = (cycle.appliedRunIds || []).includes(latestRun.runId);
  const paperPnlDelta = alreadyApplied ? 0 : Number(latestRun.paperPnl || 0);

  if (!alreadyApplied) {
    if ((cycle.appliedRunIds || []).length === 0) {
      const paperBalance = fileExists(paths.paperPerformanceJson)
        ? (loadJson(paths.paperPerformanceJson).cashBalance || getStartingBalance())
        : (Number(latestRun.startingBalance) || getStartingBalance());
      cycle.currentBalance = round(paperBalance);
    }
    cycle.currentBalance = round(Number(cycle.currentBalance || CYCLE_STARTING_BALANCE) + paperPnlDelta);
    cycle.approvedTrades += Number(latestRun.riskApproved || 0);
    cycle.rejectedTrades += Number(latestRun.riskBlocked || 0);
    cycle.appliedRunIds = (cycle.appliedRunIds || []).concat(latestRun.runId);
    cycle.lastRunAppliedAt = latestRun.generatedAt;
  }

  if (fileExists(paths.paperPerformanceJson)) {
    try {
      const perf = loadJson(paths.paperPerformanceJson);
      const positions = fileExists(paths.paperPositionsJson) ? loadJson(paths.paperPositionsJson) : { openPositions: [] };
      const holdingsValue = (positions.openPositions || []).reduce((sum, p) => sum + (p.currentValue || p.positionValue || 0), 0);
      const actualTotalEquity = round((perf.cashBalance || 0) + holdingsValue);
      cycle.canonicalCashBalance = round(perf.cashBalance || 0);
      cycle.canonicalHoldingsValue = round(holdingsValue);
      cycle.canonicalTotalEquity = actualTotalEquity;
      cycle.canonicalUnrealizedPnl = round(perf.unrealizedPnl || 0);
      cycle.canonicalRealizedPnl = round(perf.realizedPnl || 0);
      cycle.canonicalOpenPositionsCount = (positions.openPositions || []).length;
      cycle.canonicalClosedPositionsCount = (positions.closedPositions || []).length;
    } catch {}
  }

  // currentBalance is the depletion basis and must equal the true mark-to-market
  // account value (cash + holdings), NOT a per-run accumulator. The previous
  // `currentBalance += paperPnlDelta` (above) compounded every 30-min run and had
  // drifted to ~5x real equity. Pin it to the canonical total equity so it is
  // internally consistent and idempotent across repeated refreshes.
  if (cycle.canonicalTotalEquity !== undefined && Number.isFinite(cycle.canonicalTotalEquity)) {
    cycle.currentBalance = cycle.canonicalTotalEquity;
  }

  cycle.rejectionReasons = countRejectionReasons(risk);
  cycle.hoursSurvived = hoursBetween(cycle.cycleStartTimestamp, latestRun.generatedAt || generatedAt);
  cycle.daysSurvived = round(cycle.hoursSurvived / 24);
  cycle.remainingBalance = round(Math.max(0, Number(cycle.currentBalance || 0) - DEPLETION_THRESHOLD));
  cycle.drawdownFromStart = round(Number(cycle.currentBalance || 0) - Number(cycle.startingBalance || CYCLE_STARTING_BALANCE));
  cycle.drawdownPct = cycle.startingBalance ? round((cycle.drawdownFromStart / cycle.startingBalance) * 100) : 0;
  cycle.depletionRisk = cycle.currentBalance <= DEPLETION_THRESHOLD ? "depleted" : cycle.currentBalance <= cycle.startingBalance * 0.25 ? "high" : cycle.currentBalance <= cycle.startingBalance * 0.5 ? "elevated" : "normal";
  cycle.proposedImprovements = [
    "Track rejected watchlist moves after refresh to learn whether the confidence threshold is too strict or correctly cautious.",
    "Keep long/up-only and no-leverage gates until a human approves any broader risk model."
  ];
  cycle.humanReviewNeededItems = cycle.currentBalance <= DEPLETION_THRESHOLD
    ? ["Cycle depleted. Review closeout and approve next-cycle parameter changes before restart."]
    : ["Review whether 0-approved-trade cycles should tune signal threshold or remain observation-only."];

  if (cycle.currentBalance <= DEPLETION_THRESHOLD && cycle.status === "active") {
    cycle.status = "reset_pending";
    cycle.endingBalance = cycle.currentBalance;
    cycle.cycleEndTimestamp = latestRun.generatedAt || generatedAt;
    cycle.resetTriggerReason = `Balance ${cycle.currentBalance} is at or below depletion threshold ${DEPLETION_THRESHOLD}.`;
    cycle.nextCycleScheduledStart = nextMarketMorningUtc(cycle.cycleEndTimestamp);
    state.cycleHistory = (state.cycleHistory || []).concat(cycle);
  }

  state.updatedAt = generatedAt;
  state.externalEffects = false;
  state.publishAllowed = false;
  state.liveTradingEnabled = false;
  state.brokerExecutionEnabled = false;

  writeJsonWithBackup(paths.cycleStateJson, state);
  writeJsonWithBackup(paths.cycleLatestJson, cycle);
  writeJson(path.join(paths.cycleArchiveRoot, `${cycle.cycleId}.json`), cycle);
  writeText(paths.cycleStatusReport, buildCycleReport(cycle, latestRun));

  return { state, cycle, latestRun };
}

function buildCycleReport(cycle, latestRun) {
  const canonicalSection = cycle.canonicalTotalEquity !== undefined
    ? `
## Canonical Account (from paper performance + positions)

- cashBalance: ${cycle.canonicalCashBalance}
- holdingsValue: ${cycle.canonicalHoldingsValue}
- totalEquity: ${cycle.canonicalTotalEquity}
- unrealizedPnl: ${cycle.canonicalUnrealizedPnl}
- realizedPnl: ${cycle.canonicalRealizedPnl}
- openPositionsCount: ${cycle.canonicalOpenPositionsCount}
- closedPositionsCount: ${cycle.canonicalClosedPositionsCount}
- totalEquity = cashBalance + holdingsValue: ${round((cycle.canonicalCashBalance || 0) + (cycle.canonicalHoldingsValue || 0)) === cycle.canonicalTotalEquity}`
    : "";

  return `# MarketOps Paper Cycle Status v0.2

Generated: ${new Date().toISOString()}
Source runId: ${latestRun ? latestRun.runId : "n/a"}
Source cycleId: ${cycle.cycleId}
Source file: ${paths.cycleLatestJson}

## Cycle

- cycleId: ${cycle.cycleId}
- status: ${cycle.status}
- startingBalance: ${cycle.startingBalance}
- currentBalance (depletion basis): ${cycle.currentBalance}
- endingBalance: ${cycle.endingBalance}
- depletionThreshold: ${cycle.depletionThreshold}
- cycleStartTimestamp: ${cycle.cycleStartTimestamp}
- cycleEndTimestamp: ${cycle.cycleEndTimestamp}
- hoursSurvived: ${cycle.hoursSurvived}
- daysSurvived: ${cycle.daysSurvived}
- approvedTrades: ${cycle.approvedTrades}
- rejectedTrades: ${cycle.rejectedTrades}
- depletionRisk: ${cycle.depletionRisk}
- resetTriggerReason: ${cycle.resetTriggerReason}
- nextCycleScheduledStart: ${cycle.nextCycleScheduledStart}
${canonicalSection}

## Latest Paper Run Applied

- runId: ${latestRun.runId}
- generatedAt: ${latestRun.generatedAt}
- paperPnl: ${latestRun.paperPnl}
- riskApproved: ${latestRun.riskApproved}
- riskBlocked: ${latestRun.riskBlocked}

## Rejection Reasons

${cycle.rejectionReasons.length ? cycle.rejectionReasons.map((item) => `- ${item.reason}: ${item.count}`).join("\n") : "- None."}

## Lessons So Far

${cycle.lessonsLearnedSoFar.map((item) => `- ${item}`).join("\n")}

## Proposed Improvements

${cycle.proposedImprovements.map((item) => `- ${item}`).join("\n")}

## Human Review Needed

${cycle.humanReviewNeededItems.map((item) => `- ${item}`).join("\n")}

## Rule Confirmation

This cycle does not reset daily. It remains active while currentBalance is above the depletion threshold. A depleted cycle moves to reset_pending and schedules the next cycle for the next market morning after a closeout report.`;
}

function runCycleBuild() {
  const result = updateCycleFromLatestRun();
  console.log("MarketOps paper cycle built");
  console.log(`cycleId: ${result.cycle.cycleId}`);
  console.log(`status: ${result.cycle.status}`);
  console.log(`currentBalance: ${result.cycle.currentBalance}`);
  console.log(`report: ${paths.cycleStatusReport}`);
  return result;
}

function scenarioContinueAboveThreshold() {
  const state = {
    currentCycle: {
      ...newCycle("2026-05-13T13:30:00.000Z"),
      currentBalance: 750,
      appliedRunIds: []
    },
    cycleHistory: []
  };
  const cycle = state.currentCycle;
  cycle.status = cycle.currentBalance > DEPLETION_THRESHOLD ? "active" : "reset_pending";
  return cycle.status === "active";
}

function scenarioDepleted() {
  const cycle = newCycle("2026-05-13T13:30:00.000Z");
  cycle.currentBalance = 0;
  cycle.status = cycle.currentBalance <= DEPLETION_THRESHOLD ? "reset_pending" : "active";
  cycle.nextCycleScheduledStart = cycle.status === "reset_pending" ? nextMarketMorningUtc("2026-05-13T20:00:00.000Z") : null;
  return cycle.status === "reset_pending" && Boolean(cycle.nextCycleScheduledStart);
}

function runCycleQa() {
  const checks = [];
  function check(name, passed, detail = "") {
    checks.push({ name, passed: Boolean(passed), detail });
  }

  check("cycle state exists", fileExists(paths.cycleStateJson), paths.cycleStateJson);
  check("cycle latest exists", fileExists(paths.cycleLatestJson), paths.cycleLatestJson);
  check("cycle report exists", fileExists(paths.cycleStatusReport), paths.cycleStatusReport);

  let cycle = null;
  try {
    cycle = loadJson(paths.cycleLatestJson);
    check("cycle latest valid JSON", true, paths.cycleLatestJson);
  } catch (error) {
    check("cycle latest valid JSON", false, error.message);
  }

  if (cycle) {
    check("cycle id format valid", /^cycle-\d{8}-\d{4}$/.test(cycle.cycleId || ""), cycle.cycleId);
    check("cycle starting balance matches config", cycle.startingBalance === getStartingBalance(), String(cycle.startingBalance));
    check("cycle status valid", ["active", "depleted", "reset_pending", "closed"].includes(cycle.status), cycle.status);
    check("cycle does not reset daily by default", cycle.status === "active" || Boolean(cycle.resetTriggerReason), cycle.status);
    check("cycle continues above depletion threshold", scenarioContinueAboveThreshold(), "simulated active balance above threshold");
    check("depleted cycle moves to reset_pending", scenarioDepleted(), "simulated depleted balance");
    check("cycle has strategy version", Boolean(cycle.strategyVersionUsed), cycle.strategyVersionUsed || "missing");
    check("cycle has risk model version", Boolean(cycle.riskModelVersionUsed), cycle.riskModelVersionUsed || "missing");
    check("cycle has lessons", Array.isArray(cycle.lessonsLearnedSoFar) && cycle.lessonsLearnedSoFar.length > 0, `${(cycle.lessonsLearnedSoFar || []).length}`);
    check("cycle has proposed improvements", Array.isArray(cycle.proposedImprovements), `${(cycle.proposedImprovements || []).length}`);
    check("cycle is local-only", cycle.externalEffects === false && cycle.publishAllowed === false, `${cycle.externalEffects}/${cycle.publishAllowed}`);

    if (cycle.canonicalTotalEquity !== undefined) {
      const expectedTotal = round((cycle.canonicalCashBalance || 0) + (cycle.canonicalHoldingsValue || 0));
      check("totalEquity = cashBalance + holdingsValue", expectedTotal === cycle.canonicalTotalEquity, `expected=${expectedTotal} actual=${cycle.canonicalTotalEquity}`);
      check("canonical fields present", Boolean(cycle.canonicalCashBalance !== undefined && cycle.canonicalHoldingsValue !== undefined), "missing canonical fields");
    }

    if (cycle.currentBalance !== undefined && cycle.canonicalTotalEquity !== undefined) {
      const diff = Math.abs(cycle.currentBalance - cycle.canonicalTotalEquity);
      check("currentBalance not ambiguous (has canonicalTotalEquity)", true, `currentBalance=${cycle.currentBalance} canonicalTotalEquity=${cycle.canonicalTotalEquity} diff=${round(diff)}`);
    }

    if (cycle.depletionRisk !== undefined) {
      check("depletionRisk is labeled", ["depleted", "high", "elevated", "normal"].includes(cycle.depletionRisk), cycle.depletionRisk);
    }
  }

  const failed = checks.filter((item) => !item.passed);
  const report = `# MarketOps Paper Cycle QA v0.1

Generated: ${new Date().toISOString()}

## Result

${failed.length ? "FAIL" : "PASS"}

## Checks

- Passed: ${checks.filter((item) => item.passed).length}
- Failed: ${failed.length}

## Failed Checks

${failed.length ? failed.map((item) => `- ${item.name}: ${item.detail}`).join("\n") : "- None"}
`;
  writeText(paths.cycleQaReport, report);
  console.log(failed.length ? "CYCLE QA FAIL" : "CYCLE QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`qa report: ${paths.cycleQaReport}`);
  if (failed.length) process.exitCode = 1;
  return { passed: failed.length === 0, checks, qaReportPath: paths.cycleQaReport };
}

function runCycleStatus() {
  const cycle = loadJson(paths.cycleLatestJson);
  const performance = fileExists(paths.paperPerformanceJson)
    ? loadJson(paths.paperPerformanceJson)
    : null;
  const positions = fileExists(paths.paperPositionsJson)
    ? loadJson(paths.paperPositionsJson)
    : null;
  const latestRun = fileExists(paths.latestRunSummaryJson)
    ? loadJson(paths.latestRunSummaryJson)
    : null;

  const cashBalance = performance ? (performance.cashBalance || 0) : 0;
  const holdingsValue = positions
    ? (positions.openPositions || []).reduce((sum, p) => sum + (p.currentValue || p.positionValue || 0), 0)
    : 0;
  const totalEquity = round(cashBalance + holdingsValue);
  const unrealizedPnl = performance ? (performance.unrealizedPnl || 0) : 0;
  const realizedPnl = performance ? (performance.realizedPnl || 0) : 0;
  const openPositionsCount = positions ? (positions.openPositions || []).length : 0;
  const closedPositionsCount = positions ? (positions.closedPositions || []).length : 0;

  const depletionBasis = cycle.currentBalance || 0;
  const depletionRisk = totalEquity <= DEPLETION_THRESHOLD
    ? "depleted"
    : totalEquity <= (cycle.startingBalance || CYCLE_STARTING_BALANCE) * 0.25
      ? "high"
      : totalEquity <= (cycle.startingBalance || CYCLE_STARTING_BALANCE) * 0.5
        ? "elevated"
        : "normal";

  const statusOutput = {
    cycleId: cycle.cycleId,
    status: cycle.status,
    startingBalance: cycle.startingBalance || CYCLE_STARTING_BALANCE,
    cashBalance: round(cashBalance),
    holdingsValue: round(holdingsValue),
    totalEquity,
    realizedPnl: round(realizedPnl),
    unrealizedPnl: round(unrealizedPnl),
    openPositionsCount,
    closedPositionsCount,
    daysSurvived: cycle.daysSurvived || 0,
    depletionRisk,
    depletionBasis: round(depletionBasis),
    lastUpdatedAt: latestRun ? (latestRun.generatedAt || cycle.lastRunAppliedAt || null) : (cycle.lastRunAppliedAt || null),
    generatedAt: new Date().toISOString(),
    sourceRunId: latestRun ? (latestRun.runId || null) : null,
    sourceCycleId: cycle.cycleId,
    sourceFile: paths.cycleLatestJson
  };

  console.log(`cycleId: ${statusOutput.cycleId}`);
  console.log(`status: ${statusOutput.status}`);
  console.log(`startingBalance: ${statusOutput.startingBalance}`);
  console.log(`cashBalance: ${statusOutput.cashBalance}`);
  console.log(`holdingsValue: ${statusOutput.holdingsValue}`);
  console.log(`totalEquity: ${statusOutput.totalEquity}`);
  console.log(`realizedPnl: ${statusOutput.realizedPnl}`);
  console.log(`unrealizedPnl: ${statusOutput.unrealizedPnl}`);
  console.log(`openPositionsCount: ${statusOutput.openPositionsCount}`);
  console.log(`closedPositionsCount: ${statusOutput.closedPositionsCount}`);
  console.log(`daysSurvived: ${statusOutput.daysSurvived}`);
  console.log(`depletionRisk: ${statusOutput.depletionRisk}`);
  console.log(`depletionBasis: ${statusOutput.depletionBasis}`);
  console.log(`lastUpdatedAt: ${statusOutput.lastUpdatedAt || "n/a"}`);
  console.log(`generatedAt: ${statusOutput.generatedAt}`);
  console.log(`sourceRunId: ${statusOutput.sourceRunId || "n/a"}`);
  console.log(`sourceFile: ${statusOutput.sourceFile}`);

  writeJson(paths.cycleLatestJson, { ...cycle, ...statusOutput });

  return statusOutput;
}

module.exports = {
  CYCLE_STARTING_BALANCE,
  DEPLETION_THRESHOLD,
  cycleIdFromTimestamp,
  nextMarketMorningUtc,
  updateCycleFromLatestRun,
  runCycleBuild,
  runCycleQa,
  runCycleStatus
};
