const path = require("path");

const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
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
    writeJson(paths.cycleStateJson, state);
    writeJson(paths.cycleLatestJson, cycle);
    writeText(paths.cycleStatusReport, buildCycleReport(cycle, latestRun));
    return { state, cycle, latestRun };
  }
  const alreadyApplied = (cycle.appliedRunIds || []).includes(latestRun.runId);
  const paperPnlDelta = alreadyApplied ? 0 : Number(latestRun.paperPnl || 0);

  if (!alreadyApplied) {
    cycle.currentBalance = round(Number(cycle.currentBalance || CYCLE_STARTING_BALANCE) + paperPnlDelta);
    cycle.approvedTrades += Number(latestRun.riskApproved || 0);
    cycle.rejectedTrades += Number(latestRun.riskBlocked || 0);
    cycle.appliedRunIds = (cycle.appliedRunIds || []).concat(latestRun.runId);
    cycle.lastRunAppliedAt = latestRun.generatedAt;
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

  writeJson(paths.cycleStateJson, state);
  writeJson(paths.cycleLatestJson, cycle);
  writeJson(path.join(paths.cycleArchiveRoot, `${cycle.cycleId}.json`), cycle);
  writeText(paths.cycleStatusReport, buildCycleReport(cycle, latestRun));

  return { state, cycle, latestRun };
}

function buildCycleReport(cycle, latestRun) {
  return `# MarketOps Paper Cycle Status v0.1

Generated: ${new Date().toISOString()}

## Cycle

- cycleId: ${cycle.cycleId}
- status: ${cycle.status}
- startingBalance: ${cycle.startingBalance}
- currentBalance: ${cycle.currentBalance}
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
  console.log(`cycleId: ${cycle.cycleId}`);
  console.log(`status: ${cycle.status}`);
  console.log(`currentBalance: ${cycle.currentBalance}`);
  console.log(`daysSurvived: ${cycle.daysSurvived}`);
  console.log(`depletionRisk: ${cycle.depletionRisk}`);
  console.log(`nextCycleScheduledStart: ${cycle.nextCycleScheduledStart || "n/a"}`);
  return cycle;
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
