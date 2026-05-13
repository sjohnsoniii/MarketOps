const fs = require("fs");
const path = require("path");
const { paths } = require("../utils/paths");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const cadenceReportPath = path.join(projectRoot, "Reports", "Dashboard", "marketops-public-dashboard-refresh-cadence-v0.1.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function restrictedTerms() {
  return [
    ["C:", "\\Users"].join(""),
    ["trade", "Id"].join(""),
    ["signal", "Id"].join(""),
    ["riskDecision", "Id"].join(""),
    ["buy", "now"].join(" "),
    ["sell", "now"].join(" "),
    ["copy this", "trade"].join(" "),
    ["guaran", "teed"].join(""),
    ["live trading", " enabled"].join(" "),
    ["approval-queue", "-latest"].join(""),
    ["admin-review", "-state"].join("")
  ];
}

function writeCadenceReport() {
  const generatedAt = new Date().toISOString();
  const report = `# MarketOps Public Dashboard Refresh Cadence v0.1

Generated: ${generatedAt}

## Recommendation

- Local paper runner: every 30 minutes.
- Local public-ready dashboard bundle refresh: every 30 minutes when cheap and stable.
- Public website commit/push/deploy: manual approval only for now.
- Future public dashboard publishing: 2-4 times per day at first, then every 30-60 minutes only after explicit auto-publish approval and repeated safety passes.
- Social posting: manually approved IG/X drafts first, likely 1-2 per day while quality improves.

## Phase Rollout

1. Phase 1: local publish-ready bundles only.
2. Phase 2: manual commit/push/deploy after review.
3. Phase 3: scheduled public deploy only after bundle safety, copy safety, and deploy rollback paths prove stable.

## Public-Safe Fields

- latest paper equity curve
- paper P&L
- drawdown
- activity counts
- signal/risk counts
- simulated trade activity
- current paper-only status
- latest lab note
- latest lesson
- latest disappointment
- next experiment
- timestamp of latest public-safe refresh

## Must Stay Private

- admin console data
- approval queues
- raw internal IDs
- local paths
- secrets/tokens/credentials
- unreleased drafts
- agent review internals
- private reports
- any live/broker/API/social-posting details

## Safety Checks

Every public bundle must remain paper simulation, fake money, in development, not real performance, not financial advice, no guarantees, and no copy-trading.

## Manual Approval Requirements

Auto-publish is not approved. Before any future auto-deploy, a human must approve the cadence, the public copy rules, the deploy mechanism, rollback process, and safety QA gate.`;
  fs.mkdirSync(path.dirname(cadenceReportPath), { recursive: true });
  fs.writeFileSync(cadenceReportPath, report.trim() + "\n", "utf8");
}

function runPublicDashboardRefreshQa() {
  writeCadenceReport();
  const checks = [];
  const packageJson = readJson(path.join(coreRoot, "package.json"));
  check(checks, "paper:refresh-site script exists", Boolean(packageJson.scripts && packageJson.scripts["paper:refresh-site"]), packageJson.scripts && packageJson.scripts["paper:refresh-site"]);
  check(checks, "dashboard public refresh qa script exists", Boolean(packageJson.scripts && packageJson.scripts["dashboard:public-refresh:qa"]), packageJson.scripts && packageJson.scripts["dashboard:public-refresh:qa"]);
  check(checks, "public dashboard bundle exists", fs.existsSync(paths.siteDashboardPublicV04Json), paths.siteDashboardPublicV04Json);
  check(checks, "cadence report exists", fs.existsSync(cadenceReportPath), cadenceReportPath);

  let bundle = null;
  try {
    bundle = readJson(paths.siteDashboardPublicV04Json);
    check(checks, "public dashboard bundle valid JSON", true, paths.siteDashboardPublicV04Json);
  } catch (error) {
    check(checks, "public dashboard bundle valid JSON", false, error.message);
  }

  if (bundle) {
    check(checks, "mode is paper_simulation", bundle.mode === "paper_simulation", bundle.mode);
    check(checks, "paperOnly true", bundle.paperOnly === true, String(bundle.paperOnly));
    check(checks, "sampleData true", bundle.sampleData === true, String(bundle.sampleData));
    check(checks, "fakeMoney true", bundle.fakeMoney === true, String(bundle.fakeMoney));
    check(checks, "inDevelopment true", bundle.inDevelopment === true, String(bundle.inDevelopment));
    check(checks, "notFinancialAdvice true", bundle.notFinancialAdvice === true, String(bundle.notFinancialAdvice));
    check(checks, "notLiveTrading true", bundle.notLiveTrading === true, String(bundle.notLiveTrading));
    check(checks, "notRealPerformance true", bundle.notRealPerformance === true, String(bundle.notRealPerformance));
    check(checks, "notCopyTrading true", bundle.notCopyTrading === true, String(bundle.notCopyTrading));
    check(checks, "latest public refresh timestamp exists", Boolean(bundle.latestPublicRefreshAt), bundle.latestPublicRefreshAt || "missing");
    check(checks, "build in public fields exist", Boolean(bundle.buildInPublic && bundle.buildInPublic.latestLesson && bundle.buildInPublic.latestDisappointment && bundle.buildInPublic.nextExperiment), "buildInPublic");
    check(checks, "public disclaimer is explicit", String(bundle.publicDisclaimer || "").toLowerCase().includes("fake-money") && String(bundle.publicDisclaimer || "").toLowerCase().includes("not financial advice"), bundle.publicDisclaimer || "");
  }

  const text = [readText(paths.siteDashboardPublicV04Json), readText(cadenceReportPath)].join("\n").toLowerCase();
  const hits = restrictedTerms().filter((term) => text.includes(term.toLowerCase()));
  check(checks, "public refresh outputs have no private/risky terms", hits.length === 0, hits.join("; "));

  const failed = checks.filter((item) => !item.passed);
  console.log(failed.length ? "PUBLIC DASHBOARD REFRESH QA FAIL" : "PUBLIC DASHBOARD REFRESH QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  console.log(`cadence report: ${cadenceReportPath}`);
  if (failed.length) {
    failed.forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed: failed.length === 0, checks, cadenceReportPath };
}

if (require.main === module) {
  runPublicDashboardRefreshQa();
}

module.exports = { runPublicDashboardRefreshQa };
