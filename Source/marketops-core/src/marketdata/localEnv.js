const fs = require("fs");

function parseLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const env = {};
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) return;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  });

  return env;
}

module.exports = { parseLocalEnv };
