const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const reportsRoot = path.join(projectRoot, "Reports");
const indexPath = path.join(reportsRoot, "marketops-report-index-v0.1.md");

function classifyReport(filePath) {
  const relative = path.relative(projectRoot, filePath).replace(/\\/g, "/");
  if (relative.includes("/Approvals/") || relative.includes("/Admin/")) return "approval_required";
  if (relative.includes("/Automation/") || relative.includes("/Step0/") || relative.includes("/QA/")) return "internal_only";
  if (relative.includes("/Dashboard/") || relative.includes("/Analytics/") || relative.includes("/Backtesting/") || relative.includes("/Signals/") || relative.includes("/Social/")) return "public_safe_preview";
  return "internal_only";
}

function purposeFor(filePath) {
  const name = path.basename(filePath).toLowerCase();
  if (name.includes("readiness")) return "Readiness gate and safety status.";
  if (name.includes("qa")) return "QA results and failed-check details.";
  if (name.includes("dashboard")) return "Dashboard data/reporting summary.";
  if (name.includes("analytics")) return "Paper-performance analytics summary.";
  if (name.includes("backtesting")) return "Synthetic regime/backtesting summary.";
  if (name.includes("signal")) return "Signal Desk sandbox architecture or QA.";
  if (name.includes("approval")) return "Human review approval queue status.";
  if (name.includes("admin")) return "Local admin review console status.";
  if (name.includes("observation")) return "Scheduled automation observation report.";
  if (name.includes("checkpoint")) return "Local checkpoint before a public-safe site push.";
  if (name.includes("completion")) return "Subsystem completion summary.";
  return "MarketOps local report.";
}

function walk(dirPath, results = []) {
  if (!fs.existsSync(dirPath)) return results;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (/\.md$/i.test(entry.name) && full !== indexPath) results.push(full);
  }
  return results;
}

function runReportIndex() {
  const generatedAt = new Date().toISOString();
  const reports = walk(reportsRoot).sort();
  const rows = reports.map((filePath) => {
    const stat = fs.statSync(filePath);
    const relative = path.relative(projectRoot, filePath).replace(/\\/g, "/");
    return `| ${path.basename(filePath)} | ${relative} | ${stat.mtime.toISOString()} | ${classifyReport(filePath)} | ${purposeFor(filePath)} |`;
  }).join("\n");
  const output = `# MarketOps Report Index v0.1

Generated: ${generatedAt}

This index lists local MarketOps reports for Step 0 review. It is local-only and does not publish, send, upload, or transmit anything.

| Report | Path | Last Modified | Classification | Purpose |
|---|---|---:|---|---|
${rows}
`;
  fs.mkdirSync(reportsRoot, { recursive: true });
  fs.writeFileSync(indexPath, output, "utf8");
  console.log("MarketOps report index generated");
  console.log(`reports indexed: ${reports.length}`);
  console.log(`index: ${indexPath}`);
  return { indexPath, reportsIndexed: reports.length };
}

if (require.main === module) {
  try {
    runReportIndex();
  } catch (error) {
    console.error(`reports:index failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runReportIndex, indexPath };
