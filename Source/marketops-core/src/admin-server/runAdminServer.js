const http = require("http");
const { handleRequest } = require("./adminRoutes");
const { isLocalHost, getAdminPin } = require("./adminAuth");
const { writeReport, writeCompletionReport } = require("./adminServerUtils");

const port = Number(process.env.MARKETOPS_ADMIN_PORT || 3131);
const host = process.env.MARKETOPS_ADMIN_HOST || "127.0.0.1";

if (!isLocalHost(host) && !getAdminPin()) {
  console.error("Refusing non-localhost admin server binding without MARKETOPS_ADMIN_PIN or ADMIN_PIN.");
  process.exit(1);
}

writeReport();
writeCompletionReport();

const server = http.createServer((req, res) => {
  handleRequest(req, res, { host, port }).catch((error) => {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify({ error: error.message }));
  });
});

server.listen(port, host, () => {
  console.log("MarketOps private admin server running");
  console.log(`local URL: http://localhost:${port}`);
  console.log(`bound host: ${host}`);
  console.log(`admin PIN configured: ${Boolean(getAdminPin())}`);
  console.log("external posting/API/broker/live trading: disabled");
});
