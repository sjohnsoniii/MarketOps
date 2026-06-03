// Max-Favorable-Excursion (MFE) report — REPORT ONLY.
// Reads closed paper positions, groups by instrument type, and reports how often
// we exited at target vs. how much more the position went on to gain after exit.
// This file does NOT read or write any threshold/config. Human-gated by design.

const path = require("path");
const { fileExists, loadJson, writeJson, writeText } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

const OUT_JSON = path.join(paths.dataRoot, "paper", "excursion", "mfe-v0.1.json");
const OUT_MD = path.join(paths.projectRoot, "Reports", "Paper", "marketops-excursion-mfe-v0.1.md");

function median(nums) {
  if (!nums.length) return 0;
  const s = nums.slice().sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function mean(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

// Only records produced by the instrument-aware exit path carry MFE fields.
function hasMfe(r) {
  return r && r.mfeBeyondExitPct !== undefined && r.exitReason && r.instrumentType;
}

function buildExcursionReport({ closedPositions = [] } = {}) {
  const exits = closedPositions.filter(hasMfe);
  const groups = {};

  for (const r of exits) {
    const key = r.instrumentType || "unknown";
    groups[key] = groups[key] || { instrumentType: key, total: 0, byExitReason: {}, targetExits: [], allMfeBeyondExit: [], assumedCount: 0 };
    const g = groups[key];
    g.total += 1;
    g.byExitReason[r.exitReason] = (g.byExitReason[r.exitReason] || 0) + 1;
    if (r.instrumentTypeAssumed) g.assumedCount += 1;
    g.allMfeBeyondExit.push(Number(r.mfeBeyondExitPct) || 0);
    if (r.exitReason === "target_hit") g.targetExits.push(Number(r.mfeBeyondExitPct) || 0);
  }

  const perType = Object.values(groups).map((g) => {
    const targetCount = g.byExitReason.target_hit || 0;
    return {
      instrumentType: g.instrumentType,
      totalExits: g.total,
      instrumentTypeAssumedCount: g.assumedCount,
      exitReasonBreakdown: g.byExitReason,
      exitedAtTargetCount: targetCount,
      exitedAtTargetPct: g.total ? round((targetCount / g.total) * 100) : 0,
      // "Left on the table": how much further price ran AFTER a target exit.
      avgMfeBeyondExitPctOnTargetExits: round(mean(g.targetExits), 4),
      medianMfeBeyondExitPctOnTargetExits: round(median(g.targetExits), 4),
      avgMfeBeyondExitPctAllExits: round(mean(g.allMfeBeyondExit), 4)
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    reportOnly: true,
    note: "REPORT ONLY. Does not adjust any exit threshold. Human-gated.",
    totalExitsWithMfe: exits.length,
    perInstrumentType: perType
  };
}

function renderMarkdown(report) {
  const lines = [
    "# MarketOps — Max-Favorable-Excursion (MFE) Report v0.1",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "**REPORT ONLY — does not adjust any exit threshold. Human-gated.**",
    "",
    `Total closed positions with MFE data: ${report.totalExitsWithMfe}`,
    "",
    "## Per instrument type",
    "",
    "| Type | Exits | Exited at target | % at target | Avg % left on table (target exits) | Median % left (target exits) | Assumed-type |",
    "|------|-------|------------------|-------------|------------------------------------|------------------------------|--------------|"
  ];
  for (const t of report.perInstrumentType) {
    lines.push(`| ${t.instrumentType} | ${t.totalExits} | ${t.exitedAtTargetCount} | ${t.exitedAtTargetPct}% | ${t.avgMfeBeyondExitPctOnTargetExits}% | ${t.medianMfeBeyondExitPctOnTargetExits}% | ${t.instrumentTypeAssumedCount} |`);
  }
  lines.push("");
  lines.push("## Exit-reason breakdown");
  lines.push("");
  for (const t of report.perInstrumentType) {
    lines.push(`- **${t.instrumentType}**: ${Object.entries(t.exitReasonBreakdown).map(([k, v]) => `${k}=${v}`).join(", ") || "none"}`);
  }
  lines.push("");
  lines.push("> \"% left on the table\" = how much further the price rose (bar-high) after a target exit.");
  lines.push("> A consistently high value would suggest targets may be tight — but any change is a human decision.");
  lines.push("");
  return lines.join("\n");
}

function runExcursionReport() {
  const positions = fileExists(paths.paperPositionsJson)
    ? loadJson(paths.paperPositionsJson)
    : { closedPositions: [] };
  const report = buildExcursionReport({ closedPositions: positions.closedPositions || [] });
  writeJson(OUT_JSON, report);
  writeText(OUT_MD, renderMarkdown(report));
  console.log(`Excursion report: ${report.totalExitsWithMfe} exits with MFE data across ${report.perInstrumentType.length} instrument type(s).`);
  console.log(`  JSON: ${OUT_JSON}`);
  console.log(`  MD:   ${OUT_MD}`);
  return report;
}

if (require.main === module) {
  runExcursionReport();
}

module.exports = { buildExcursionReport, renderMarkdown, runExcursionReport };
