const { spawnSync } = require("child_process");

// ONE shared transient-retry policy for every network call in MarketOps
// (Alpaca HTTP fetches + git pushes). Node callers use withTransientRetry();
// bash callers invoke this file as a CLI wrapper around a command (e.g. git push).
//
// Allowlist of TRANSIENT signatures only — network/server hiccups that are safe
// to retry because the operation is idempotent (a data snapshot fetch, or a push
// of the same commit). PERMANENT failures are deliberately NOT matched so they
// fail fast: HTTP 4xx auth/not-found (except 429), and git non-fast-forward
// rejections ("Updates were rejected", "non-fast-forward") / auth failures.
const TRANSIENT_PATTERN = new RegExp([
  "socket hang up", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "ENOTFOUND",
  "ECONNREFUSED", "EPIPE", "EHOSTUNREACH", "ENETUNREACH",
  "timed out", "timeout",
  "HTTP 429", "HTTP 5\\d\\d",
  "could not resolve host", "couldn'?t connect", "connection reset",
  "connection timed out", "the remote end hung up", "early EOF",
  "RPC failed", "gnutls_handshake", "TLS connection", "unexpected disconnect"
].join("|"), "i");

function isTransient(message) {
  return TRANSIENT_PATTERN.test(String(message || ""));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Blocking sleep for the synchronous CLI path (no event loop available there).
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// In-process retry for async functions (Alpaca adapter). Retries transient only.
async function withTransientRetry(fn, { attempts = 4, baseDelayMs = 500, label = "request" } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = (error && error.message) || String(error);
      if (attempt === attempts || !isTransient(message)) throw error;
      const delay = baseDelayMs * 2 ** (attempt - 1); // 0.5s, 1s, 2s
      console.log(`[retry] ${label} attempt ${attempt}/${attempts} failed (${message}); retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastError;
}

// CLI: `node transientRetry.js <cmd> [args...]` — runs the command with the SAME
// transient-only policy. Retries ONLY when it exits non-zero AND its stderr
// matches a transient signature. Exits with the command's final status.
function runCli(argv) {
  const attempts = 4;
  const baseDelayMs = 1000;
  const [cmd, ...args] = argv;
  if (!cmd) {
    process.stderr.write("transientRetry: no command given\n");
    return 2;
  }
  let result;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    result = spawnSync(cmd, args, { stdio: ["inherit", "inherit", "pipe"], encoding: "utf8" });
    const stderr = result.stderr || "";
    if (stderr) process.stderr.write(stderr);
    if (result.status === 0) return 0;
    const signature = stderr + (result.error ? ` ${result.error.message}` : "");
    if (attempt === attempts || !isTransient(signature)) {
      return result.status == null ? 1 : result.status;
    }
    const delay = baseDelayMs * 2 ** (attempt - 1);
    process.stderr.write(`[retry] \`${cmd} ${args.join(" ")}\` attempt ${attempt}/${attempts} transient failure; retrying in ${delay}ms\n`);
    sleepSync(delay);
  }
  return result && result.status ? result.status : 1;
}

if (require.main === module) {
  process.exit(runCli(process.argv.slice(2)));
}

module.exports = { isTransient, withTransientRetry, TRANSIENT_PATTERN };
