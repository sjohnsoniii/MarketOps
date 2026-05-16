const { fileExists, loadJson, writeJson } = require("../utils/fileStore");
const { round } = require("../utils/number");
const { paths } = require("../utils/paths");

function loadDayTradingConfig() {
  try {
    const config = loadJson(paths.config);
    return config.dayTrading || {};
  } catch {
    return {};
  }
}

function loadPositions() {
  if (!fileExists(paths.paperPositionsJson)) {
    return { openPositions: [], closedPositions: [], dailyTradeCount: 0, tradeDate: null };
  }
  try {
    return loadJson(paths.paperPositionsJson);
  } catch {
    return { openPositions: [], closedPositions: [], dailyTradeCount: 0, tradeDate: null };
  }
}

function loadPerformance() {
  if (!fileExists(paths.paperPerformanceJson)) {
    return {
      startingCash: 10000,
      cashBalance: 10000,
      realizedPnl: 0,
      unrealizedPnl: 0,
      totalEquity: 10000,
      maxDrawdown: 0,
      peakEquity: 10000,
      dailyRealizedPnl: 0,
      dailyTradeCount: 0,
      dailyDrawdown: 0,
      tradeDate: null
    };
  }
  try {
    return loadJson(paths.paperPerformanceJson);
  } catch {
    return {
      startingCash: 10000,
      cashBalance: 10000,
      realizedPnl: 0,
      unrealizedPnl: 0,
      totalEquity: 10000,
      maxDrawdown: 0,
      peakEquity: 10000,
      dailyRealizedPnl: 0,
      dailyTradeCount: 0,
      dailyDrawdown: 0,
      tradeDate: null
    };
  }
}

function tradeDateKey(timestamp) {
  if (!timestamp) return new Date().toISOString().slice(0, 10);
  return new Date(timestamp).toISOString().slice(0, 10);
}

function isNewTradeDay(positions, timestamp) {
  const today = tradeDateKey(timestamp);
  return positions.tradeDate !== today;
}

function resetDailyCounts(positions, timestamp, performance) {
  const today = tradeDateKey(timestamp);
  if (positions.tradeDate !== today) {
    positions.dailyTradeCount = 0;
    positions.tradeDate = today;
    performance.dailyRealizedPnl = 0;
    performance.dailyTradeCount = 0;
    performance.dailyDrawdown = 0;
    performance.tradeDate = today;
  }
}

function openPosition({ symbol, assetType, entryTime, entryPrice, quantity, positionValue, signalId, riskDecisionId }) {
  return {
    positionId: `pos-${symbol}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    symbol,
    assetType,
    side: "long",
    entryTime,
    entryPrice: round(entryPrice),
    quantity: round(quantity, 6),
    positionValue: round(positionValue),
    currentValue: round(positionValue),
    unrealizedPnl: 0,
    unrealizedPnlPct: 0,
    signalId,
    riskDecisionId,
    openedAt: new Date().toISOString(),
    paperOnly: true,
    liveTradingEnabled: false
  };
}

function closePosition(position, exitTime, exitPrice, exitReason) {
  const realizedPnl = (exitPrice - position.entryPrice) * position.quantity;
  const returnPct = position.entryPrice > 0 ? ((exitPrice - position.entryPrice) / position.entryPrice) * 100 : 0;
  const fees = Math.abs(position.positionValue * 0.001);

  return {
    positionId: position.positionId,
    symbol: position.symbol,
    assetType: position.assetType,
    side: position.side,
    entryTime: position.entryTime,
    entryPrice: position.entryPrice,
    exitTime,
    exitPrice: round(exitPrice),
    quantity: position.quantity,
    positionValue: position.positionValue,
    realizedPnl: round(realizedPnl - fees),
    returnPct: round(returnPct),
    fees: round(fees),
    exitReason: exitReason || (realizedPnl >= 0 ? "take_profit" : "stop_loss"),
    signalId: position.signalId,
    riskDecisionId: position.riskDecisionId,
    closedAt: new Date().toISOString(),
    paperOnly: true
  };
}

function updateUnrealizedPnl(openPositions, marketBars) {
  return openPositions.map((pos) => {
    const symBars = (marketBars || [])
      .filter((b) => b.symbol === pos.symbol)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const latestPrice = symBars.length > 0 ? symBars[0].close : pos.entryPrice;
    const currentValue = pos.quantity * latestPrice;
    const unrealizedPnl = currentValue - pos.positionValue;
    const unrealizedPnlPct = pos.positionValue > 0 ? (unrealizedPnl / pos.positionValue) * 100 : 0;

    return {
      ...pos,
      currentValue: round(currentValue),
      unrealizedPnl: round(unrealizedPnl),
      unrealizedPnlPct: round(unrealizedPnlPct),
      latestPrice: round(latestPrice)
    };
  });
}

function executeIntradayPaperTrades({ signals, riskReview, marketBars, marketDataInfo = {}, generatedAt }) {
  const dtConfig = loadDayTradingConfig();
  const maxTradesPerDay = dtConfig.maxTradesPerDay || 10;
  const maxOpenPositions = dtConfig.maxOpenPositions || 5;
  const maxPositionSizePct = dtConfig.maxPositionSizePct || 0.25;
  const maxDailyLossPct = dtConfig.maxDailyLossPct || 0.05;
  const longOnly = dtConfig.longOnly !== false;

  let positions = loadPositions();
  let performance = loadPerformance();

  if (isNewTradeDay(positions, generatedAt)) {
    resetDailyCounts(positions, generatedAt, performance);
  }

  let cashBalance = performance.cashBalance;
  const startingCash = cashBalance;
  let realizedPnl = performance.realizedPnl;
  let peakEquity = performance.peakEquity || cashBalance;
  let maxDrawdown = performance.maxDrawdown || 0;
  let openPositionsList = [...(positions.openPositions || [])];

  openPositionsList = updateUnrealizedPnl(openPositionsList, marketBars);

  const totalEquity = cashBalance + openPositionsList.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
  const dailyLossLimit = startingCash * maxDailyLossPct;
  const dailyLossSoFar = Math.abs(performance.dailyRealizedPnl < 0 ? performance.dailyRealizedPnl : 0);

  const trades = [];
  const ledger = [];
  const skippedReasons = [];

  if (dailyLossSoFar >= dailyLossLimit) {
    skippedReasons.push("Daily loss limit reached");
  }

  if (openPositionsList.length >= maxOpenPositions) {
    skippedReasons.push("Max open positions reached");
  }

  if (positions.dailyTradeCount >= maxTradesPerDay) {
    skippedReasons.push("Max daily trades reached");
  }

  const approvedDecisions = (riskReview.decisions || []).filter((d) => d.approved);
  let tradesExecuted = 0;

  for (const decision of approvedDecisions) {
    if (tradesExecuted + openPositionsList.length >= maxOpenPositions) {
      skippedReasons.push(`Max open positions (${maxOpenPositions}) would be exceeded`);
      break;
    }
    if (positions.dailyTradeCount + tradesExecuted >= maxTradesPerDay) {
      skippedReasons.push("Max daily trades would be exceeded");
      break;
    }

    const signal = (signals || []).find((item) => item.symbol === decision.symbol);
    if (!signal) {
      skippedReasons.push(`No signal for ${decision.symbol}`);
      continue;
    }

    if (longOnly && signal.directionBias !== "up") {
      skippedReasons.push(`${signal.symbol}: direction ${signal.directionBias} is not long-only`);
      continue;
    }

    const alreadyOpen = openPositionsList.some((p) => p.symbol === signal.symbol);
    if (alreadyOpen) {
      skippedReasons.push(`${signal.symbol}: position already open`);
      continue;
    }

    const bars = (marketBars || [])
      .filter((b) => b.symbol === signal.symbol)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (bars.length < 2) {
      skippedReasons.push(`${signal.symbol}: insufficient bars`);
      continue;
    }

    const entryBar = bars[bars.length - 1];
    const positionValue = cashBalance * maxPositionSizePct;
    const quantity = positionValue / entryBar.close;
    const cashAfterTrade = cashBalance - positionValue;

    if (cashAfterTrade < 0) {
      skippedReasons.push(`${signal.symbol}: insufficient cash`);
      continue;
    }

    const pos = openPosition({
      symbol: signal.symbol,
      assetType: signal.assetType,
      entryTime: entryBar.timestamp,
      entryPrice: entryBar.close,
      quantity,
      positionValue,
      signalId: signal.signalId,
      riskDecisionId: decision.riskDecisionId
    });

    openPositionsList.push(pos);
    cashBalance = cashAfterTrade;

    ledger.push({
      ledgerId: `ledger-open-${pos.positionId}`,
      timestamp: pos.entryTime,
      eventType: "position_opened",
      symbol: pos.symbol,
      side: "long",
      quantity: pos.quantity,
      entryPrice: pos.entryPrice,
      positionValue: round(positionValue),
      cashAfter: round(cashBalance),
      mode: "paper_simulation",
      paperOnly: true
    });

    tradesExecuted++;

    trades.push({
      tradeId: `paper-trade-${pos.symbol}-${Date.now()}`,
      positionId: pos.positionId,
      signalId: pos.signalId,
      riskDecisionId: pos.riskDecisionId,
      symbol: pos.symbol,
      assetType: pos.assetType,
      side: "long",
      status: "open",
      entryTime: pos.entryTime,
      entryPrice: pos.entryPrice,
      quantity: pos.quantity,
      positionValue: round(positionValue),
      cashBalanceAfterEntry: round(cashBalance),
      dataSource: marketDataInfo.dataSource || "deterministic_sample",
      paperOnly: true,
      liveTradingEnabled: false
    });

    if (positions.dailyTradeCount + tradesExecuted >= maxTradesPerDay) break;
  }

  const totalUnrealizedPnl = openPositionsList.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
  const totalEquityAfter = cashBalance + totalUnrealizedPnl;
  peakEquity = Math.max(peakEquity, totalEquityAfter);
  const currentDrawdown = peakEquity > 0 ? ((peakEquity - totalEquityAfter) / peakEquity) * 100 : 0;
  maxDrawdown = Math.max(maxDrawdown, currentDrawdown);

  positions.openPositions = openPositionsList;
  positions.dailyTradeCount += tradesExecuted;

  performance.cashBalance = round(cashBalance);
  performance.unrealizedPnl = round(totalUnrealizedPnl);
  performance.totalEquity = round(totalEquityAfter);
  performance.peakEquity = round(peakEquity);
  performance.maxDrawdown = round(maxDrawdown);
  performance.dailyDrawdown = round(currentDrawdown);
  performance.dailyTradeCount = positions.dailyTradeCount;

  writeJson(paths.paperPositionsJson, positions);
  writeJson(paths.paperPerformanceJson, performance);

  const hasTrades = tradesExecuted > 0;
  const tradeLedger = {
    generatedAt,
    mode: "paper_simulation",
    paperOnly: true,
    dataSource: marketDataInfo.dataSource || "deterministic_sample",
    liveTradingEnabled: false,
    orderPlacementEnabled: false,
    startingCash: round(startingCash),
    cashBalance: round(cashBalance),
    totalUnrealizedPnl: round(totalUnrealizedPnl),
    totalEquity: round(totalEquityAfter),
    realizedPnl: round(performance.realizedPnl),
    maxDrawdown: round(performance.maxDrawdown),
    dailyTradeCount: positions.dailyTradeCount,
    maxDailyTrades: maxTradesPerDay,
    openPositionCount: openPositionsList.length,
    maxOpenPositions,
    executedTrades: trades.length,
    skippedReasons: skippedReasons.length > 0 ? [...new Set(skippedReasons)] : [],
    noTradeReason: !hasTrades ? "No approved candidates passed all day-trading gates" : null,
    ledger,
    trades,
    notes: [
      "Intraday day-trading paper simulation.",
      "Positions remain open until closed or stopped out.",
      "No real money, broker execution, or live trading."
    ]
  };

  return tradeLedger;
}

function executePaperTrades(params) {
  const result = executeIntradayPaperTrades(params);
  const { startingCash, cashBalance, realizedPnl, totalEquity } = result;
  const totalReturnPct = startingCash > 0 ? ((cashBalance - startingCash) / startingCash) * 100 : 0;
  const ledgerWithBalance = (result.ledger || []).map((entry) => ({
    ...entry,
    balance: entry.balance != null ? entry.balance : entry.cashAfter != null ? entry.cashAfter : startingCash
  }));
  return {
    ...result,
    startingBalance: startingCash,
    endingBalance: cashBalance,
    totalPnl: realizedPnl,
    totalReturnPct: round(totalReturnPct),
    approvedSignals: result.executedTrades,
    ledger: ledgerWithBalance
  };
}

module.exports = { executeIntradayPaperTrades, executePaperTrades, closePosition, updateUnrealizedPnl, loadPositions, loadPerformance };
