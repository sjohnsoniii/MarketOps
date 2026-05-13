const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { paths } = require("../utils/paths");
const { loadJson, writeText } = require("../utils/fileStore");

const COMMANDS = [
  ["admin:qa", ["run", "admin:qa"]],
  ["marketdata:qa", ["run", "marketdata:qa"]],
  ["dashboard:qa", ["run", "dashboard:qa"]],
  ["office:qa", ["run", "office:qa"]],
  ["agents:qa", ["run", "agents:qa"]],
  ["automation:check", ["run", "automation:check"]]
];

function runNpm(label, args) {
  const result = spawnSync("npm", args, {
    cwd: paths.coreRoot,
    encoding: "utf8",
    shell: process.platform === "win32"
  });
  return {
    label,
    command: `npm ${args.join(" ")}`,
    exitCode: result.status,
    passed: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function scanPublicBundleForSecrets(filePath) {
  if (!fs.existsSync(filePath)) return ["public bundle missing"];
  const text = fs.readFileSync(filePath, "utf8");
  const terms = [
    "APCA-API-KEY-ID",
    "APCA-API-SECRET-KEY",
    "SECRET_KEY",
    "BEGIN PRIVATE KEY",
    "token",
    "password"
  ];
  return terms.filter((term) => text.toLowerCase().includes(term.toLowerCase()));
}

function validatePublicBundle() {
  const checks = [];
  function check(name, passed, detail = "") {
    checks.push({ name, passed: Boolean(passed), detail });
  }

  try {
    const bundle = loadJson(paths.siteDashboardPublicV04Json);
    check("public bundle paperOnly true", bundle.paperOnly === true, String(bundle.paperOnly));
    check("public bundle liveTradingEnabled false", bundle.liveTradingEnabled === false, String(bundle.liveTradingEnabled));
    check("public bundle publishAllowed not true", bundle.publishAllowed !== true, String(bundle.publishAllowed));
    check("public bundle dataSource alpaca_iex", bundle.dataSource === "alpaca_iex", String(bundle.dataSource));
    [
      "lastRefreshAt",
      "nextExpectedRefreshAt",
      "refreshCadenceMinutes",
      "watchlistQuoteSnapshot",
      "symbolMovementPreview",
      "topWatchlistMovers",
      "marketActivityHeartbeat",
      "riskDeskSummary",
      "noTradeReason"
    ].forEach((field) => check(`movement field present: ${field}`, Object.prototype.hasOwnProperty.call(bundle, field), field));
  } catch (error) {
    check("public bundle readable", false, error.message);
  }

  const secretHits = scanPublicBundleForSecrets(paths.siteDashboardPublicV04Json);
  check("public bundle has no secret markers", secretHits.length === 0, secretHits.join(", "));
  return checks;
}

function writeFullQaReport({ commandResults, extraChecks }) {
  const failedCommands = commandResults.filter((item) => !item.passed);
  const failedChecks = extraChecks.filter((item) => !item.passed);
  const reportPath = path.join(paths.projectRoot, "Reports", "QA", "marketops-full-qa-v0.1.md");
  const generatedAt = new Date().toISOString();
  const report = `# MarketOps Full QA v0.1

Generated: ${generatedAt}

## Verdict

${failedCommands.length || failedChecks.length ? "FAIL" : "PASS"}

## Commands

${commandResults.map((item) => `- ${item.passed ? "PASS" : "FAIL"}: ${item.command} (exit ${item.exitCode})`).join("\n")}

## Safety Checks

${extraChecks.map((item) => `- ${item.passed ? "PASS" : "FAIL"}: ${item.name}${item.detail ? ` - ${item.detail}` : ""}`).join("\n")}

## Confirmations

- Full QA does not commit, push, deploy, post, email, send SMS, place orders, or connect broker execution.
- Paper-only and review-gated checks are enforced through the component QA commands plus public bundle safety checks.`;

  writeText(reportPath, report);
  return reportPath;
}

function runFullQa() {
  const commandResults = COMMANDS.map(([label, args]) => runNpm(label, args));
  const extraChecks = validatePublicBundle();
  const reportPath = writeFullQaReport({ commandResults, extraChecks });
  const passed = commandResults.every((item) => item.passed) && extraChecks.every((item) => item.passed);

  console.log(passed ? "FULL QA PASS" : "FULL QA FAIL");
  console.log(`commands passed: ${commandResults.filter((item) => item.passed).length}`);
  console.log(`commands failed: ${commandResults.filter((item) => !item.passed).length}`);
  console.log(`safety checks passed: ${extraChecks.filter((item) => item.passed).length}`);
  console.log(`safety checks failed: ${extraChecks.filter((item) => !item.passed).length}`);
  console.log(`full QA report: ${reportPath}`);

  commandResults.filter((item) => !item.passed).forEach((item) => {
    console.log(`FAIL: ${item.command}`);
    if (item.stderr) console.log(item.stderr.trim());
  });
  extraChecks.filter((item) => !item.passed).forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));

  if (!passed) process.exitCode = 1;
  return { passed, commandResults, extraChecks, reportPath };
}

if (require.main === module) {
  runFullQa();
}

module.exports = { runFullQa };
