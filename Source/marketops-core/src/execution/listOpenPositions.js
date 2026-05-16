const { fileExists, loadJson } = require("../utils/fileStore");
const { paths } = require("../utils/paths");

function listOpenPositions() {
  if (!fileExists(paths.paperPositionsJson)) {
    console.log("No paper positions file found. No open positions.");
    return { openPositions: [], closedPositions: [], dailyTradeCount: 0 };
  }

  const positions = loadJson(paths.paperPositionsJson);
  const open = positions.openPositions || [];
  const closed = positions.closedPositions || [];

  console.log("MarketOps Paper Positions");
  console.log("=========================");
  console.log(`Daily trade count: ${positions.dailyTradeCount}`);
  console.log(`Trade date: ${positions.tradeDate || "none"}`);
  console.log("");

  if (open.length === 0) {
    console.log("No open positions.");
  } else {
    console.log(`Open Positions (${open.length}):`);
    open.forEach((pos) => {
      console.log(`  ${pos.symbol}: ${pos.quantity} shares @ $${pos.entryPrice}, unrealized P&L: $${(pos.unrealizedPnl || 0).toFixed(2)} (${(pos.unrealizedPnlPct || 0).toFixed(2)}%)`);
    });
  }

  console.log("");
  if (closed.length === 0) {
    console.log("No closed positions.");
  } else {
    console.log(`Closed Positions Today (${closed.length}):`);
    closed.slice(-5).forEach((pos) => {
      console.log(`  ${pos.symbol}: $${pos.realizedPnl.toFixed(2)} P&L (${pos.exitReason})`);
    });
  }

  return positions;
}

if (require.main === module) {
  listOpenPositions();
}

module.exports = { listOpenPositions };
