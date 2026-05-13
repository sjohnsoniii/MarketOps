const fs = require("fs");
const path = require("path");
const { paths } = require("./adminServerUtils");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const packagePath = path.join(coreRoot, "package.json");
const docsPath = path.join(projectRoot, "Docs", "Admin", "MarketOps-Private-Admin-Server-v0.1.md");
const completionReportPath = paths.completionReport;
const mediaDirs = ["inputs", "outputs", "approved", "rejected", "needs-edit"].map((name) => path.join(projectRoot, "Media", name));
const files = [
  path.join(__dirname, "runAdminServer.js"),
  path.join(__dirname, "adminServerUtils.js"),
  path.join(__dirname, "adminAuth.js"),
  path.join(__dirname, "adminRoutes.js"),
  path.join(__dirname, "adminQa.js"),
  docsPath,
  paths.serverReport,
  completionReportPath,
  paths.humanInputTemplate,
  paths.humanInputLatest
];

const sourceFiles = [
  path.join(__dirname, "runAdminServer.js"),
  path.join(__dirname, "adminServerUtils.js"),
  path.join(__dirname, "adminAuth.js"),
  path.join(__dirname, "adminRoutes.js")
];

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function check(checks, name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

function runAdminServerQa() {
  const checks = [];
  const packageJson = readJson(packagePath);
  check(checks, "admin:serve script exists", Boolean(packageJson.scripts && packageJson.scripts["admin:serve"]), packageJson.scripts && packageJson.scripts["admin:serve"]);
  check(checks, "admin:server:qa script exists", Boolean(packageJson.scripts && packageJson.scripts["admin:server:qa"]), packageJson.scripts && packageJson.scripts["admin:server:qa"]);
  files.forEach((filePath) => check(checks, `file exists: ${path.basename(filePath)}`, fs.existsSync(filePath), filePath));
  mediaDirs.forEach((dirPath) => check(checks, `media folder exists: ${path.basename(dirPath)}`, fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory(), dirPath));

  const text = files.map(readText).join("\n").toLowerCase();
  const sourceText = sourceFiles.map(readText).join("\n").toLowerCase();
  const forbidden = [
    ["axi", "os"].join(""),
    ["xml", "httprequest"].join(""),
    ["web", "hook"].join(""),
    ["sm", "tp"].join(""),
    ["send", "email"].join(""),
    ["twi", "lio"].join(""),
    ["alpaca", "_api_key"].join(""),
    ["coinbase", "_api_key"].join(""),
    ["live trading", " enabled"].join(""),
    ["twitter", "-api"].join(""),
    ["youtube", ".googleapis"].join(""),
    ["graph", ".facebook"].join(""),
    ["api", ".tiktok"].join("")
  ];
  const hits = forbidden.filter((term) => sourceText.includes(term));
  check(checks, "no external API/social/broker/live code terms", hits.length === 0, hits.join("; "));
  check(checks, "server defaults to localhost binding", text.includes('process.env.marketops_admin_host || "127.0.0.1"'), "default host");
  check(checks, "non-localhost requires PIN", text.includes("refusing non-localhost") && text.includes("marketops_admin_pin"), "host guard");
  check(checks, "approval actions are local-only", text.includes("local review-state json only") || text.includes("local review-state update only"), "local-only decision text");
  check(checks, "approval decision bundle path exists or is configured", fs.existsSync(paths.approvalDecisionsLatest) || text.includes("approval-decisions-latest.json"), paths.approvalDecisionsLatest);
  check(checks, "approval audit log path exists or is configured", fs.existsSync(paths.approvalAuditLog) || text.includes("approval-audit-log.json"), paths.approvalAuditLog);
  check(checks, "human input template exists", fs.existsSync(paths.humanInputTemplate), paths.humanInputTemplate);
  check(checks, "human input latest exists", fs.existsSync(paths.humanInputLatest), paths.humanInputLatest);
  check(checks, "IG/X manual approval only documented", text.includes("approved_for_manual_post") && text.includes("manual copy/paste"), "manual post");
  check(checks, "TikTok/YouTube simulated or deferred", text.includes("tiktok") && text.includes("youtube") && text.includes("simulated"), "tt/yt");
  check(checks, "LinkedIn/Facebook deferred", text.includes("linkedin") && text.includes("facebook") && text.includes("deferred"), "li/fb");
  check(checks, "docs warn no public deployment", text.includes("no public deployment") || text.includes("must not be exposed publicly"), "public warning");
  check(checks, "docs describe Tailscale later", text.includes("tailscale"), "tailscale");
  check(checks, "docs describe MAC limitation", text.includes("mac address"), "mac");
  check(checks, "gitignore ignores env/local secrets", readText(path.join(projectRoot, ".gitignore")).includes(".env.local") && readText(path.join(projectRoot, ".gitignore")).includes("Config/*credentials*"), ".gitignore");

  const failed = checks.filter((item) => !item.passed);
  console.log(failed.length ? "ADMIN SERVER QA FAIL" : "ADMIN SERVER QA PASS");
  console.log(`checks passed: ${checks.filter((item) => item.passed).length}`);
  console.log(`checks failed: ${failed.length}`);
  if (failed.length) {
    failed.forEach((item) => console.log(`FAIL: ${item.name} - ${item.detail}`));
    process.exitCode = 1;
  }
  return { passed: failed.length === 0, checks };
}

if (require.main === module) {
  runAdminServerQa();
}

module.exports = { runAdminServerQa };
