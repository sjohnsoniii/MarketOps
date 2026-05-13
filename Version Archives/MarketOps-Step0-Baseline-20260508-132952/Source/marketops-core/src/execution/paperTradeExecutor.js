const { round } = require("../utils/number");

function executePaperTrades({ signals, riskReview, marketBars, startingBalance, generatedAt }) {
  let currentBalance = startingBalance;
  const trades = [];
  const ledger = [
    {
      ledgerId: "ledger-starting-balance",
      timestamp: "START",
      eventType: "starting_balance",
      symbol: "CASH",
      amount: 0,
      balance: round(startingBalance),
      mode: "paper_simulation",
      paperOnly: true
    }
  ];

  const approvedDecisions = riskReview.decisions.filter((decision) => decision.approved);

  approvedDecisions.forEach((decision, index) => {
    const signal = signals.find((item) => item.symbol === decision.symbol);
    if (!signal) return;

    const bars = marketBars
      .filter((bar) => bar.symbol === signal.symbol)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (bars.length < 2) return;

    const entryBar = bars[bars.length - 2];
    const exitBar = bars[bars.length - 1];
    const positionValue = currentBalance * 0.10;
    const quantity = positionValue / entryBar.close;
    const grossPnl = (exitBar.close - entryBar.close) * quantity;
    const assumedFees = positionValue * 0.001;
    const realizedPnl = grossPnl - assumedFees;

    currentBalance += realizedPnl;

    const trade = {
      tradeId: `paper-trade-${signal.symbol}-${String(index + 1).padStart(3, "0")}`,
      signalId: signal.signalId,
      riskDecisionId: decision.riskDecisionId,
      symbol: signal.symbol,
      assetType: signal.assetType,
      side: "long",
      mode: "paper_simulation",
      paperOnly: true,
      sampleDataOnly: true,
      entryTime: entryBar.timestamp,
      entryPrice: round(entryBar.close),
      exitTime: exitBar.timestamp,
      exitPrice: round(exitBar.close),
      positionValue: round(positionValue),
      quantity: round(quantity, 6),
      assumedFees: round(assumedFees),
      realizedPnl: round(realizedPnl),
      returnPct: round(((exitBar.close - entryBar.close) / entryBar.close) * 100),
      balanceAfterTrade: round(currentBalance),
      exitReason: exitBar.close >= entryBar.close ? "sample_profit_exit" : "sample_loss_exit",
      notes: realizedPnl >= 0
        ? "Approved signal produced a profitable fake paper trade."
        : "Approved signal produced a fake paper loss during sample-data testing."
    };

    trades.push(trade);
    ledger.push({
      ledgerId: `ledger-${trade.tradeId}`,
      timestamp: trade.exitTime,
      eventType: "paper_trade_closed",
      symbol: trade.symbol,
      amount: trade.realizedPnl,
      balance: trade.balanceAfterTrade,
      tradeId: trade.tradeId,
      mode: "paper_simulation",
      paperOnly: true
    });
  });

  const totalPnl = trades.reduce((sum, trade) => sum + trade.realizedPnl, 0);

  return {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    sampleDataOnly: true,
    startingBalance,
    endingBalance: round(currentBalance),
    totalPnl: round(totalPnl),
    totalReturnPct: round(((currentBalance - startingBalance) / startingBalance) * 100),
    approvedSignals: approvedDecisions.length,
    executedTrades: trades.length,
    ledger,
    trades
  };
}

module.exports = { executePaperTrades };
