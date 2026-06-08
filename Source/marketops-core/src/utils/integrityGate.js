const fs = require("fs");
const path = require("path");
const { paths } = require("./paths");

// Pre-publish data-integrity gate. CRITICAL: a failure here aborts the publish
// (the caller's run_step marks it CRITICAL). Two layers:
//   1. PARSE  — every passed file must be valid JSON (catches truncation).
//   2. SEMANTIC — the cycle must satisfy accounting invariants. This catches the
//      valid-JSON-but-WRONG class (e.g. currentBalance 4876 or 52.68 while the
//      true mark-to-market equity is ~1010) that a parse-only check misses.
// Usage: node integrityGate.js <file> [<file> ...]

const DOLLAR_EPS = 0.02;          // rounding tolerance (code rounds to 2 dp)
const PCT_EPS = 0.05;
const SANE_MAX_MULT = 10;         // currentBalance must not exceed 10x start (runaway guard)

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
}
function round2(n) { return Math.round(n * 100) / 100; }

function checkCycleInvariants(label, cycle, declaredStart, problems) {
  if (!cycle || typeof cycle !== "object") return;
  const sb = Number(cycle.startingBalance);
  const cb = Number(cycle.currentBalance);
  const eq = cycle.canonicalTotalEquity;

  // 1. startingBalance === the cycle's declared start
  if (Number.isFinite(declaredStart) && Number.isFinite(sb) && Math.abs(sb - declaredStart) > DOLLAR_EPS) {
    problems.push(`${label}: startingBalance ${sb} != declared start ${declaredStart}`);
  }
  // 2. currentBalance === canonicalTotalEquity (mark-to-market truth)
  if (Number.isFinite(cb) && eq !== undefined && Number.isFinite(Number(eq)) && Math.abs(cb - Number(eq)) > DOLLAR_EPS) {
    problems.push(`${label}: currentBalance ${cb} != canonicalTotalEquity ${eq}`);
  }
  // 3. currentBalance > 0 and within a sane bound
  if (Number.isFinite(cb)) {
    if (cb <= 0) {
      problems.push(`${label}: currentBalance ${cb} is not > 0`);
    } else if (Number.isFinite(sb) && sb > 0 && cb > sb * SANE_MAX_MULT) {
      problems.push(`${label}: currentBalance ${cb} exceeds sane bound (${sb} x ${SANE_MAX_MULT})`);
    }
  }
  // 4. drawdown recomputes correctly from starting/current
  if (Number.isFinite(cb) && Number.isFinite(sb)) {
    const expectedDd = round2(cb - sb);
    if (cycle.drawdownFromStart !== undefined && Math.abs(Number(cycle.drawdownFromStart) - expectedDd) > DOLLAR_EPS) {
      problems.push(`${label}: drawdownFromStart ${cycle.drawdownFromStart} != recomputed ${expectedDd}`);
    }
    if (cycle.drawdownPct !== undefined && sb > 0) {
      const expectedPct = round2((expectedDd / sb) * 100);
      if (Math.abs(Number(cycle.drawdownPct) - expectedPct) > PCT_EPS) {
        problems.push(`${label}: drawdownPct ${cycle.drawdownPct} != recomputed ${expectedPct}`);
      }
    }
  }
}

function main() {
  const files = process.argv.slice(2);
  const problems = [];

  // Layer 1: parse-validity.
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    try { readJson(f); }
    catch (e) { problems.push(`unparseable JSON: ${path.basename(f)} (${e.message})`); }
  }

  // Layer 2: cycle semantic invariants.
  let state, latest;
  try { if (fs.existsSync(paths.cycleStateJson)) state = readJson(paths.cycleStateJson); }
  catch (e) { problems.push(`unparseable JSON: ${path.basename(paths.cycleStateJson)} (${e.message})`); }
  try { if (fs.existsSync(paths.cycleLatestJson)) latest = readJson(paths.cycleLatestJson); }
  catch (e) { problems.push(`unparseable JSON: ${path.basename(paths.cycleLatestJson)} (${e.message})`); }

  const declaredStart = state && Number.isFinite(Number(state.cycleStartingBalance))
    ? Number(state.cycleStartingBalance)
    : undefined;

  if (state && state.currentCycle) checkCycleInvariants("cycle-state", state.currentCycle, declaredStart, problems);
  if (latest) checkCycleInvariants("cycle-latest", latest, declaredStart, problems);

  if (problems.length) {
    console.error("INTEGRITY GATE FAILED:");
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }
  console.log(`integrity gate OK: ${files.length} file(s) parsed + cycle invariants verified`);
}

main();
