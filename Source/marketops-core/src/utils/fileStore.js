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

function writeJson(filePath, value) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, text) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, text.trimEnd() + "\n", "utf8");
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
  writeText
};
