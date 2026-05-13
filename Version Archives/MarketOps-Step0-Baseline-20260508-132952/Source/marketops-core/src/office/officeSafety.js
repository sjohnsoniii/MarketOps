const fs = require("fs");
const path = require("path");
const { paths } = require("../utils/paths");

const bannedPhrases = [
  "buy" + " now",
  "sell" + " now",
  "copy this" + " trade",
  "copy my" + " bot",
  "guaranteed",
  "quit your" + " job",
  "money" + " printer",
  "boat",
  "yacht",
  "Sam" + "-only",
  "my" + " account",
  "front" + "-run",
  "ALPACA" + "_API_KEY",
  "COINBASE" + "_API_KEY",
  "liveTrading" + ": true",
  "allowLiveTrading" + "\": true",
  "trade" + "Id",
  "signal" + "Id",
  "riskDecision" + "Id",
  "position" + "Value",
  "quantity"
];

function listGeneratedContentFiles() {
  const roots = [
    paths.contentBlogsRoot,
    paths.contentReportsRoot,
    paths.contentSocialRoot,
    paths.contentVideoRoot,
    paths.contentAvatarRoot,
    paths.contentQueueRoot
  ];
  const files = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(md|json)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  roots.forEach(walk);
  return files;
}

function scanFiles(files) {
  const findings = [];
  for (const filePath of files) {
    const text = fs.readFileSync(filePath, "utf8");
    const lower = text.toLowerCase();
    for (const phrase of bannedPhrases) {
      if (lower.includes(phrase.toLowerCase())) {
        findings.push({ filePath, phrase });
      }
    }
  }
  return findings;
}

module.exports = { bannedPhrases, listGeneratedContentFiles, scanFiles };
