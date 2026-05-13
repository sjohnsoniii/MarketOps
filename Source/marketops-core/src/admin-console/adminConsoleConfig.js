const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");
const tenantConfigPath = path.join(projectRoot, "Config", "admin-console-tenants-v0.1.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveTenant(tenantId = null) {
  const config = readJson(tenantConfigPath);
  const target = tenantId || config.defaultTenant;
  const tenant = (config.tenants || []).find((item) => item.tenantId === target);
  if (!tenant) throw new Error(`Unknown admin console tenant: ${target}`);
  const configuredRoot = path.normalize(tenant.projectRoot || "");
  const root = fs.existsSync(configuredRoot) ? configuredRoot : projectRoot;
  const resolveProject = (relativePath) => path.resolve(root, relativePath);
  return {
    ...tenant,
    projectRoot: root,
    contentQueuePath: resolveProject(tenant.contentQueuePath),
    reviewStatePath: resolveProject(tenant.reviewStatePath),
    approvedContentPath: resolveProject(tenant.approvedContentPath),
    consoleOutputPath: resolveProject(tenant.consoleOutputPath)
  };
}

module.exports = { coreRoot, projectRoot, tenantConfigPath, resolveTenant };
