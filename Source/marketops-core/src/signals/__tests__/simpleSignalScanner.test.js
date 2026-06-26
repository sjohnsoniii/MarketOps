// Standalone node-assert test for the rebuilt signal scanner.
// Run: node src/signals/__tests__/simpleSignalScanner.test.js
// (Project has no test runner installed — this mirrors the repo's standalone-harness idiom.)
const assert = require("assert");
const { generateSampleSignals } = require("../simpleSignalScanner");

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ok - ${name}`); }
  catch (e) { console.error(`  FAIL - ${name}\n    ${e.message}`); process.exitCode = 1; }
}

// ---- synthetic bar builder ----
// Build 1-min bars across two ET trading days. Day 1 establishes the prior-day
// reference for the 1-day ROC; day 2 is the live session whose last bar is "now".
const DAY1 = "2026-06-22"; // Monday
const DAY2 = "2026-06-23"; // Tuesday
const SESSION_START_UTC = 13 * 60 + 30; // 13:30 UTC = 09:30 ET

function bar(symbol, dateKey, minOfDayUtc, close, { open, high, low, volume } = {}) {
  const t = new Date(`${dateKey}T00:00:00Z`).getTime() + minOfDayUtc * 60000;
  const ts = new Date(t).toISOString().replace(".000Z", "Z");
  const o = open != null ? open : close;
  return {
    symbol, timestamp: ts, open: o, close,
    high: high != null ? high : Math.max(o, close),
    low: low != null ? low : Math.min(o, close),
    volume: volume != null ? volume : 1000
  };
}

// Generate a session of bars for a symbol at a flat-ish price `base`, with the
// final bar moved to `lastClose`. dayOpen controls the first bar's open (for
// falling-knife). vwapPush lets early bars trade richer so session VWAP sits
// above/below the last close.
function session(symbol, dateKey, { base, lastClose, dayOpen, vwapAbove = false }) {
  const bars = [];
  const open = dayOpen != null ? dayOpen : base;
  // first bar carries the day's open
  bars.push(bar(symbol, dateKey, SESSION_START_UTC, base, { open, volume: 2000 }));
  // mid-session bars: if vwapAbove, trade them well above base so VWAP > lastClose
  const midPrice = vwapAbove ? base * 1.02 : base;
  for (let m = 1; m <= 60; m++) {
    bars.push(bar(symbol, dateKey, SESSION_START_UTC + m, midPrice, { volume: 3000 }));
  }
  // final bar = "now"
  bars.push(bar(symbol, dateKey, SESSION_START_UTC + 90, lastClose, { volume: 2000 }));
  return bars;
}

function build(symbol, scenario) {
  // Day 1 reference session ends at `priorClose`; Day 2 is live.
  const d1 = session(symbol, DAY1, { base: scenario.priorClose, lastClose: scenario.priorClose });
  const d2 = session(symbol, DAY2, {
    base: scenario.base, lastClose: scenario.lastClose,
    dayOpen: scenario.dayOpen, vwapAbove: scenario.vwapAbove
  });
  return [...d1, ...d2];
}

const vehiclesFor = (syms) => syms.map((s) => ({ symbol: s, assetType: "EQUITY", universe: "test" }));

function scan(scenarios) {
  const marketBars = [];
  for (const [sym, sc] of Object.entries(scenarios)) marketBars.push(...build(sym, sc));
  const out = generateSampleSignals({
    vehicles: vehiclesFor(Object.keys(scenarios)),
    marketBars,
    marketDataInfo: { dataSource: "alpaca_iex" },
    generatedAt: `${DAY2}T15:30:00Z`
  });
  const bySym = {};
  for (const s of out.signals) bySym[s.symbol] = s;
  return bySym;
}

// ---- scenarios ----
// UP_DIP: 1-day uptrend (prior 100 -> now 102) AND now below session VWAP (VWAP pushed above) -> CANDIDATE
// UP_EXT: uptrend but ABOVE VWAP (extended) -> NOT a candidate
// DOWN  : 1-day downtrend (prior 100 -> now 98), below VWAP -> NOT a candidate
// KNIFE : below VWAP but down >3% from day open (freefall) -> REJECTED by falling-knife
const sigs = scan({
  UP_DIP: { priorClose: 100, base: 103, lastClose: 102, dayOpen: 101.5, vwapAbove: true },
  UP_EXT: { priorClose: 100, base: 102, lastClose: 103, dayOpen: 101.5, vwapAbove: false },
  DOWN:   { priorClose: 100, base: 99,  lastClose: 98,  dayOpen: 99.5,  vwapAbove: true },
  KNIFE:  { priorClose: 100, base: 105, lastClose: 101, dayOpen: 105,   vwapAbove: true },
});

console.log("Signal scanner — rebuilt contract");

test("uptrend + below VWAP fires as an up candidate", () => {
  const s = sigs.UP_DIP;
  assert.strictEqual(s.directionBias, "up", `directionBias=${s.directionBias}`);
  assert.ok(["candidate", "learning_candidate"].includes(s.status), `status=${s.status}`);
});

test("candidate confidence is a number within the [0.1, 0.9] band", () => {
  const c = sigs.UP_DIP.confidence;
  assert.ok(typeof c === "number" && c >= 0.1 && c <= 0.9, `confidence=${c}`);
});

test("candidate carries entry/exit/risk plans (trade-plan contract)", () => {
  const s = sigs.UP_DIP;
  assert.ok(s.entryPlan && s.exitPlan && s.riskPlan, "missing one of entry/exit/risk plan");
});

test("candidate has an actionable trigger and a real invalidation", () => {
  const s = sigs.UP_DIP;
  assert.ok(s.trigger && s.trigger !== "No actionable move.", `trigger=${s.trigger}`);
  assert.ok(s.invalidation && s.invalidation !== "N/A", `invalidation=${s.invalidation}`);
});

test("uptrend but ABOVE VWAP (extended) is NOT a candidate", () => {
  const s = sigs.UP_EXT;
  assert.notStrictEqual(s.status, "candidate", `status=${s.status} (should not be a candidate when extended above VWAP)`);
});

test("1-day downtrend is NOT a candidate even if below VWAP", () => {
  const s = sigs.DOWN;
  assert.notStrictEqual(s.status, "candidate", `status=${s.status}`);
  assert.notStrictEqual(s.directionBias, "up", `directionBias=${s.directionBias}`);
});

test("falling knife (down >3% from day open) is rejected despite being below VWAP", () => {
  const s = sigs.KNIFE;
  assert.notStrictEqual(s.status, "candidate", `status=${s.status} (freefall must not be a candidate)`);
  assert.notStrictEqual(s.directionBias, "up", `directionBias=${s.directionBias}`);
});

test("confidence rewards setup quality: deeper dip in a stronger uptrend scores higher", () => {
  const two = scan({
    WEAK:   { priorClose: 100, base: 100.4, lastClose: 100.2, dayOpen: 100.1, vwapAbove: true }, // slight uptrend, shallow dip
    STRONG: { priorClose: 100, base: 104,   lastClose: 102.5, dayOpen: 101,   vwapAbove: true }, // strong uptrend, deep dip
  });
  assert.ok(two.STRONG.confidence > two.WEAK.confidence,
    `STRONG=${two.STRONG.confidence} should exceed WEAK=${two.WEAK.confidence}`);
});

test("confidence is NOT just a magnitude transform of full-history trailing return", () => {
  // Two names with identical full-history trailing return but different setup quality
  // (one below VWAP in an uptrend, one extended above VWAP) must score differently.
  const two = scan({
    DIP: { priorClose: 100, base: 103, lastClose: 102, dayOpen: 101.5, vwapAbove: true },
    EXT: { priorClose: 100, base: 102, lastClose: 102, dayOpen: 101.5, vwapAbove: false },
  });
  assert.notStrictEqual(two.DIP.confidence, two.EXT.confidence,
    "below-VWAP dip and above-VWAP extension must not share confidence");
});

console.log(`\n${passed} passed`);
