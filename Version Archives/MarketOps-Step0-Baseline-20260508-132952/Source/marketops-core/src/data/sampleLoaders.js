const { loadJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

function loadVehicles(filePath = paths.sampleVehicles) {
  return loadJson(filePath).filter((vehicle) => vehicle.active);
}

function loadMarketBars(filePath = paths.sampleMarketBars) {
  return loadJson(filePath).slice().sort((a, b) => {
    if (a.symbol !== b.symbol) return a.symbol.localeCompare(b.symbol);
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
}

module.exports = { loadMarketBars, loadVehicles };
