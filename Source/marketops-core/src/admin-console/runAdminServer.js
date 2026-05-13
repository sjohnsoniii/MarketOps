const http = require("http");
const {
  resolveTenant,
  buildConsoleModel,
  getItemDetail,
  applyContentReviewDecision,
  buildApprovedContent,
  loadQueue,
  loadReviewState,
  htmlForModel
} = require("./contentApprovalConsole");

const host = process.env.OFFICE_ADMIN_HOST || "127.0.0.1";
const port = Number(process.env.OFFICE_ADMIN_PORT || 4317);

function getTenantIdFromArgs() {
  const arg = process.argv.find((item) => item.startsWith("--tenant="));
  if (arg) return arg.slice("--tenant=".length);
  const index = process.argv.indexOf("--tenant");
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
  return process.env.OFFICE_TENANT || "marketops";
}

function diagnosticHtml(error, tenantId) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Admin Console Diagnostic</title></head>
<body style="background:#05080c;color:#e8edf2;font-family:Segoe UI,system-ui,sans-serif;padding:32px">
  <h1>The Office Admin Console Diagnostic</h1>
  <p>The live admin console could not resolve tenant <strong>${tenantId}</strong>.</p>
  <p style="color:#f05a3c">${String(error.message || error).replace(/[<>]/g, "")}</p>
  <p>This is a local-only diagnostic page. It does not post, publish, send, deploy, trade, or call external APIs.</p>
</body>
</html>`;
}

function isLocalHost(value) {
  return ["127.0.0.1", "localhost", "::1"].includes(String(value || "").toLowerCase());
}

function send(res, status, type, body) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}

function sendJson(res, status, value) {
  send(res, status, "application/json; charset=utf-8", JSON.stringify(value, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

async function handle(req, res) {
  const tenantId = getTenantIdFromArgs();
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let tenant = null;

  try {
    tenant = resolveTenant(tenantId);
  } catch (error) {
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, 500, "text/html; charset=utf-8", diagnosticHtml(error, tenantId));
    }
    return sendJson(res, 500, { error: error.message, tenantId, localOnly: true, publishAllowed: false });
  }

  if (req.method === "GET" && url.pathname === "/") {
    return send(res, 200, "text/html; charset=utf-8", htmlForModel(buildConsoleModel(tenant)));
  }
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { ok: true, localOnly: true, publishAllowed: false, tenantId: tenant.tenantId });
  }
  if (req.method === "GET" && url.pathname === "/api/queue") {
    return sendJson(res, 200, buildConsoleModel(tenant));
  }
  if (req.method === "GET" && url.pathname.startsWith("/api/item/")) {
    const itemId = decodeURIComponent(url.pathname.replace("/api/item/", ""));
    return sendJson(res, 200, getItemDetail(itemId, tenant));
  }
  if (req.method === "POST" && url.pathname === "/api/review") {
    const body = await readBody(req);
    return sendJson(res, 200, applyContentReviewDecision({ ...body, reviewer: "local_user" }, tenant));
  }
  if (req.method === "GET" && url.pathname === "/api/approved") {
    return sendJson(res, 200, buildApprovedContent(tenant, loadQueue(tenant), loadReviewState(tenant), true));
  }

  return send(res, 404, "text/plain; charset=utf-8", "Not found");
}

function runAdminLiveServer() {
  if (!isLocalHost(host)) {
    console.error("Refusing to bind admin live console to a non-localhost host.");
    process.exit(1);
  }
  const server = http.createServer((req, res) => {
    handle(req, res).catch((error) => {
      sendJson(res, 500, { error: error.message });
    });
  });
  server.listen(port, host, () => {
    console.log("The Office live admin approval console running");
    console.log(`local URL: http://localhost:${port}`);
    console.log(`bound host: ${host}`);
    console.log("publishAllowed: false");
    console.log("external posting/deploy/live behavior: disabled");
  });
  return server;
}

if (require.main === module) {
  runAdminLiveServer();
}

module.exports = { runAdminLiveServer, handle };
