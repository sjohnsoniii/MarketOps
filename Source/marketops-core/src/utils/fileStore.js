const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensureParent(filePath) {
  ensureDir(path.dirname(filePath));
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

// Atomic write: serialize to a temp file in the same directory, then rename.
// rename() is atomic on the same filesystem, so a reader (or an interrupted
// process / machine sleep mid-write) never sees a truncated file. This matters
// for the large rolling-history / backfill bundles rewritten every refresh,
// which were corrupting with "Unexpected end of JSON input". All persisted
// state (JSON and text) goes through this path.
function atomicWrite(filePath, content) {
  ensureParent(filePath);
  const tmpPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  try {
    fs.writeFileSync(tmpPath, content, "utf8");
    fs.renameSync(tmpPath, filePath);
  } catch (error) {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore cleanup failure */ }
    throw error;
  }
}

function writeJson(filePath, value) {
  atomicWrite(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeText(filePath, text) {
  atomicWrite(filePath, text.trimEnd() + "\n");
}

// Atomic write, but first preserve the current file as a last-known-good (.lkg)
// snapshot IF it exists and is valid JSON. For cycle/positions state, so a bad
// write — or bad upstream data — can be rolled back. A corrupt current file is
// NOT promoted to LKG: the previous good snapshot is kept.
function writeJsonWithBackup(filePath, value) {
  if (fs.existsSync(filePath)) {
    try {
      JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
      fs.copyFileSync(filePath, `${filePath}.lkg`);
    } catch { /* current file unreadable/corrupt — keep prior .lkg */ }
  }
  writeJson(filePath, value);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = {
  ensureDir,
  ensureParent,
  fileExists,
  loadJson,
  writeJson,
  writeText,
  writeJsonWithBackup
};
