const fs = require("fs");
const path = require("path");

const coreRoot = path.join(__dirname, "..", "..");
const projectRoot = path.join(coreRoot, "..", "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .reduce((acc, line) => {
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      acc[key] = value;
      return acc;
    }, {});
}

function getAdminPin() {
  const rootEnv = loadEnvFile(path.join(projectRoot, ".env.local"));
  const coreEnv = loadEnvFile(path.join(coreRoot, ".env.local"));
  return process.env.MARKETOPS_ADMIN_PIN
    || process.env.ADMIN_PIN
    || rootEnv.MARKETOPS_ADMIN_PIN
    || rootEnv.ADMIN_PIN
    || coreEnv.MARKETOPS_ADMIN_PIN
    || coreEnv.ADMIN_PIN
    || "";
}

function isLocalHost(host) {
  return ["localhost", "127.0.0.1", "::1"].includes(String(host || "").toLowerCase());
}

function isLocalRequest(req) {
  const remote = String(req.socket.remoteAddress || "").replace("::ffff:", "");
  return remote === "127.0.0.1" || remote === "::1";
}

function getAuthStatus(req, configuredHost) {
  const pin = getAdminPin();
  const localRequest = isLocalRequest(req);
  const localhostBinding = isLocalHost(configuredHost);
  return {
    pinConfigured: Boolean(pin),
    localRequest,
    localhostBinding,
    devModeAllowed: !pin && localRequest && localhostBinding,
    warning: pin
      ? "Admin PIN is configured from local environment."
      : "No admin PIN configured. Localhost-only development mode is allowed; non-localhost access must configure MARKETOPS_ADMIN_PIN."
  };
}

function requestPin(req, body) {
  return req.headers["x-marketops-admin-pin"]
    || (body && body.pin)
    || "";
}

function requireAuth(req, body, configuredHost) {
  const pin = getAdminPin();
  if (!pin) {
    if (isLocalRequest(req) && isLocalHost(configuredHost)) return { ok: true, mode: "localhost_dev_no_pin" };
    return { ok: false, status: 403, message: "Admin PIN required for non-localhost access." };
  }

  if (requestPin(req, body) === pin) return { ok: true, mode: "pin" };
  return { ok: false, status: 401, message: "Admin PIN required." };
}

module.exports = {
  getAdminPin,
  getAuthStatus,
  requireAuth,
  isLocalHost,
  isLocalRequest
};
