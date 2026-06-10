const { fileExists, loadJson, writeJson } = require("../utils/fileStore");
const { syncPositions } = require("../db/positions");
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

function loadLearningConfig() {
  try {
    const config = loadJson(paths.config);
    if (config.learningMode && config.learningMode.enabled) {
      return config.learningMode;
    }
  } catch {}
  return null;
}

// Named, instrument-specific exit defaults (used if config is missing/malformed).
// ETF gets the tighter pair; an unknown instrument defaults to ETF (never stock).
const DEFAULT_EXIT_RULES = {
  maxHoldHours: 72,
  unknownInstrumentDefault: "etf",
  byInstrumentType: {
    etf: { targetProfitPct: 3, stopLossPct: 2 },
    stock: { targetProfitPct: 6, stopLossPct: 3 }
  }
};

function loadExitRules() {
  try {
    const config = loadJson(paths.config);
    return config.learningMode && config.learningMode.exitRules
      ? config.learningMode.exitRules
      : DEFAULT_EXIT_RULES;
  } catch {
    return DEFAULT_EXIT_RULES;
  }
}

function loadCooldownConfig() {
  try {
    const config = loadJson(paths.config);
    return (config.learningMode && config.learningMode.reEntryCooldown) || null;
  } catch {
    return null;
  }
}

// Map the DEFINITE source field (vehicle universe `assetType`, carried onto the
// position) to an exit-threshold key. ETF -> etf, EQUITY -> stock. Anything else
// (missing/unknown) returns null so the caller can default to the tighter ETF
// pair AND flag it. No ticker-string guessing.
function instrumentKeyFromAssetType(assetType) {
  if (assetType === "ETF") return "etf";
  if (assetType === "EQUITY") return "stock";
  return null;
}

// Resolve the target/stop pair for a position. `instrumentTypeAssumed` is true
// only when assetType could not be classified and we fell back to the ETF-tight
// default — surfaced on the closed record so an unknown is never silently a stock.
function resolveExitThresholds(position, exitRules) {
  const rules = exitRules || DEFAULT_EXIT_RULES;
  const byType = rules.byInstrumentType || DEFAULT_EXIT_RULES.byInstrumentType;
  const fallbackKey = rules.unknownInstrumentDefault || "etf";
  let key = instrumentKeyFromAssetType(position.assetType);
  let assumed = false;
  if (!key || !byType[key]) {
    key = fallbackKey;
    assumed = true;
  }
  const pair = byType[key]
    || (rules.targetProfitPct != null ? { targetProfitPct: rules.targetProfitPct, stopLossPct: rules.stopLossPct } : DEFAULT_EXIT_RULES.byInstrumentType.etf);
  return {
    instrumentType: key,
    instrumentTypeAssumed: assumed,
    targetProfitPct: pair.targetProfitPct,
    stopLossPct: pair.stopLossPct,
    maxHoldHours: rules.maxHoldHours != null ? rules.maxHoldHours : 72
  };
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

function openPosition({ symbol, assetType, entryTime, entryPrice, quantity, positionValue, signalId, riskDecisionId, riskBand }) {
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
    maxFavorablePrice: round(entryPrice),
    pricedThisRun: true,
    signalId,
    riskDecisionId,
    openedAt: new Date().toISOString(),
    paperOnly: true,
    liveTradingEnabled: false,
    entryRiskBand: riskBand ? riskBand.entryRiskBand : null,
    riskBandSource: riskBand ? riskBand.riskBandSource : null
  };
}

function closePosition(position, exitTime, exitPrice, exitReason, extra = {}) {
  const realizedPnl = (exitPrice - position.entryPrice) * position.quantity;
  const returnPct = position.entryPrice > 0 ? ((exitPrice - position.entryPrice) / position.entryPrice) * 100 : 0;
  const fees = Math.abs(position.positionValue * 0.001);

  // Max favorable excursion: the highest favorable price seen while held (the
  // running bar-high water-mark persisted on the position), vs entry and vs the
  // actual exit. `mfeBeyondExitPct` = how much further it ran after we exited.
  const maxFav = position.maxFavorablePrice != null
    ? position.maxFavorablePrice
    : Math.max(position.entryPrice, exitPrice);
  const mfeReturnPct = position.entryPrice > 0 ? ((maxFav - position.entryPrice) / position.entryPrice) * 100 : 0;
  const mfeBeyondExitPct = exitPrice > 0 ? ((maxFav - exitPrice) / exitPrice) * 100 : 0;

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
    maxFavorablePrice: round(maxFav),
    mfeReturnPct: round(mfeReturnPct),
    mfeBeyondExitPct: round(mfeBeyondExitPct),
    signalId: position.signalId,
    riskDecisionId: position.riskDecisionId,
    closedAt: new Date().toISOString(),
    paperOnly: true,
    ...extra
  };
}

function checkAndExecuteExits({ openPositions, marketBars, generatedAt, exitRules }) {
  const closedList = [];
  const keepOpenList = [];
  const learningRecordsList = [];
  let cashReturned = 0;

  for (const position of (openPositions || [])) {
    const symBars = (marketBars || [])
      .filter((b) => b.symbol === position.symbol)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const hasFreshBar = symBars.length > 0;
    const freshPrice = hasFreshBar ? symBars[0].close : null;
    const holdHours = (Date.now() - new Date(position.entryTime).getTime()) / 3600000;

    // Instrument-specific thresholds from the DEFINITE assetType source.
    const thr = resolveExitThresholds(position, exitRules);

    // Update the max-favorable-excursion water-mark from this bar's HIGH (not the
    // close), so MFE reflects the peak the position actually reached while held.
    const priorMax = position.maxFavorablePrice != null ? position.maxFavorablePrice : position.entryPrice;
    const barHigh = hasFreshBar && symBars[0].high != null ? symBars[0].high : freshPrice;
    const maxFavorablePrice = barHigh != null ? Math.max(priorMax, barHigh) : priorMax;
    position.maxFavorablePrice = round(maxFavorablePrice);

    let exitTrigger = null;
    let exitPrice = null;

    if (hasFreshBar) {
      // Stop/target evaluate on the REAL latest price.
      const returnPct = position.entryPrice > 0
        ? ((freshPrice - position.entryPrice) / position.entryPrice) * 100
        : 0;
      if (returnPct >= thr.targetProfitPct) {
        exitTrigger = "target_hit"; exitPrice = freshPrice;
      } else if (returnPct <= -(thr.stopLossPct)) {
        exitTrigger = "stop_loss"; exitPrice = freshPrice;
      } else if (holdHours >= thr.maxHoldHours) {
        exitTrigger = "time_stop"; exitPrice = freshPrice;
      }
    } else {
      // No fresh bar this run: DO NOT synthesize a price or a 0% return. Skip
      // stop/target entirely and let only the 72h time-stop act as backstop. If
      // it fires, value at the best stored mark and flag the record as stale.
      if (holdHours >= thr.maxHoldHours) {
        exitTrigger = "time_stop";
        exitPrice = position.latestPrice != null
          ? position.latestPrice
          : (position.currentValue && position.quantity ? position.currentValue / position.quantity : position.entryPrice);
      }
    }

    if (exitTrigger !== null) {
      const returnPct = position.entryPrice > 0
        ? ((exitPrice - position.entryPrice) / position.entryPrice) * 100
        : 0;
      const closed = closePosition(position, generatedAt, exitPrice, exitTrigger, {
        instrumentType: thr.instrumentType,
        instrumentTypeAssumed: thr.instrumentTypeAssumed,
        targetProfitPctUsed: thr.targetProfitPct,
        stopLossPctUsed: thr.stopLossPct,
        pricedThisRun: hasFreshBar,
        exitPriceStale: !hasFreshBar
      });
      closedList.push(closed);
      cashReturned += exitPrice * position.quantity;

      learningRecordsList.push({
        learningRecordId: "learn-" + position.positionId,
        symbol: position.symbol,
        instrumentType: thr.instrumentType,
        instrumentTypeAssumed: thr.instrumentTypeAssumed,
        entryTime: position.entryTime,
        exitTime: generatedAt,
        entryPrice: position.entryPrice,
        exitPrice: round(exitPrice),
        returnPct: round(returnPct),
        maxFavorablePrice: round(maxFavorablePrice),
        mfeReturnPct: closed.mfeReturnPct,
        mfeBeyondExitPct: closed.mfeBeyondExitPct,
        holdHours: round(holdHours),
        exitReason: exitTrigger,
        pricedThisRun: hasFreshBar,
        targetProfitPctUsed: thr.targetProfitPct,
        stopLossPctUsed: thr.stopLossPct,
        approvalBand: position.approvalBand || position.entryRiskBand,
        isLearningProbe: position.approvalBand === "approved_learning_probe",
        outcome: returnPct >= 0 ? "win" : "loss",
        paperOnly: true,
        generatedAt
      });
    } else {
      keepOpenList.push(position);
    }
  }

  return {
    closedPositions: closedList,
    keptOpenPositions: keepOpenList,
    learningRecords: learningRecordsList,
    cashReturned: round(cashReturned),
    exitSummary: {
      checked: (openPositions || []).length,
      closed: closedList.length,
      kept: keepOpenList.length
    }
  };
}

function updateUnrealizedPnl(openPositions, marketBars) {
  return openPositions.map((pos) => {
    const symBars = (marketBars || [])
      .filter((b) => b.symbol === pos.symbol)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const hasFreshBar = symBars.length > 0;
    // When there's no fresh bar, carry the last known mark forward (flagged),
    // rather than silently reverting the mark to entry price.
    const latestPrice = hasFreshBar
      ? symBars[0].close
      : (pos.latestPrice != null ? pos.latestPrice : pos.entryPrice);

    // Running max-favorable-excursion water-mark from this bar's HIGH.
    const priorMax = pos.maxFavorablePrice != null ? pos.maxFavorablePrice : pos.entryPrice;
    const barHigh = hasFreshBar && symBars[0].high != null ? symBars[0].high : (hasFreshBar ? latestPrice : null);
    const maxFavorablePrice = barHigh != null ? Math.max(priorMax, barHigh) : priorMax;

    const currentValue = pos.quantity * latestPrice;
    const unrealizedPnl = currentValue - pos.positionValue;
    const unrealizedPnlPct = pos.positionValue > 0 ? (unrealizedPnl / pos.positionValue) * 100 : 0;

    return {
      ...pos,
      currentValue: round(currentValue),
      unrealizedPnl: round(unrealizedPnl),
      unrealizedPnlPct: round(unrealizedPnlPct),
      latestPrice: round(latestPrice),
      maxFavorablePrice: round(maxFavorablePrice),
      pricedThisRun: hasFreshBar
    };
  });
}

function executeIntradayPaperTrades({ signals, riskReview, marketBars, marketDataInfo = {}, generatedAt }) {
  const dtConfig = loadDayTradingConfig();
  const learningConfig = loadLearningConfig();
  const cooldownCfg = loadCooldownConfig();
  const maxTradesPerDay = learningConfig ? learningConfig.sizing.maxTotalTradesPerDay : (dtConfig.maxTradesPerDay || 10);
  const maxOpenPositions = learningConfig
    ? (learningConfig.maxOpenPositions || Math.max(dtConfig.maxOpenPositions || 5, 10))
    : (dtConfig.maxOpenPositions || 5);
  const maxPositionSizePct = dtConfig.maxPositionSizePct || 0.25;
  // Flat per-trade allocation off a stable total-equity snapshot (replaces the
  // 25%-of-REMAINING-cash sizing that front-loaded early trades and made a wide
  // book impossible). Named config; falls back to 2% of equity if unset.
  const perTradeAllocationPct = (learningConfig && learningConfig.sizing && learningConfig.sizing.perTradeAllocationPct)
    || dtConfig.perTradeAllocationPct || 0.02;
  const maxDailyLossPct = dtConfig.maxDailyLossPct || 0.05;
  const maxLearningProbesPerDay = learningConfig ? learningConfig.sizing.maxLearningProbesPerDay : 10;
  const maxStandardTradesPerDay = learningConfig ? learningConfig.sizing.maxStandardTradesPerDay : 10;
  const longOnly = dtConfig.longOnly !== false;

  let positions = loadPositions();
  let performance = loadPerformance();

  if (isNewTradeDay(positions, generatedAt)) {
    resetDailyCounts(positions, generatedAt, performance);
  }

  // Prune stale cooldown entries (older than 2× cooldownHours) to keep the map lean.
  if (cooldownCfg && positions.reEntryCooldowns) {
    const pruneCutoffMs = Date.now() - (cooldownCfg.cooldownHours * 2) * 3600000;
    Object.keys(positions.reEntryCooldowns).forEach(sym => {
      if (new Date(positions.reEntryCooldowns[sym]).getTime() < pruneCutoffMs) {
        delete positions.reEntryCooldowns[sym];
      }
    });
  }

  let cashBalance = performance.cashBalance;
  const startingCash = cashBalance;
  let realizedPnl = performance.realizedPnl;
  let peakEquity = performance.peakEquity || cashBalance;
  let maxDrawdown = performance.maxDrawdown || 0;
  let openPositionsList = [...(positions.openPositions || [])];

  openPositionsList = updateUnrealizedPnl(openPositionsList, marketBars);

  const totalEquity = cashBalance + openPositionsList.reduce((sum, p) => sum + (p.currentValue || p.positionValue || 0), 0);
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
  let learningProbesExecuted = 0;
  let standardTradesExecuted = 0;

  for (const decision of approvedDecisions) {
    // openPositionsList already includes positions opened earlier in THIS loop,
    // so the cap is just its length (the prior `tradesExecuted + length` double-
    // counted this run's opens and effectively halved the cap).
    if (openPositionsList.length >= maxOpenPositions) {
      skippedReasons.push(`Max open positions (${maxOpenPositions}) would be exceeded`);
      break;
    }
    if (positions.dailyTradeCount + tradesExecuted >= maxTradesPerDay) {
      skippedReasons.push("Max daily trades would be exceeded");
      break;
    }

    const isProbe = decision.approvalBand === "approved_learning_probe";
    if (isProbe && learningProbesExecuted >= maxLearningProbesPerDay) {
      skippedReasons.push(`Max learning probes per day (${maxLearningProbesPerDay}) reached`);
      continue;
    }
    if (!isProbe && standardTradesExecuted >= maxStandardTradesPerDay) {
      skippedReasons.push(`Max standard trades per day (${maxStandardTradesPerDay}) reached`);
      continue;
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

    // Fetch bars early — needed for both the entry and the volume conviction gate.
    const bars = (marketBars || [])
      .filter((b) => b.symbol === signal.symbol)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (bars.length < 2) {
      skippedReasons.push(`${signal.symbol}: insufficient bars`);
      continue;
    }

    // Re-entry cooldown: bar any symbol that exited within cooldownHours unless
    // the conviction override clears both the momentum gate and the band gate
    // (and the volume gate when volume data is present).
    if (cooldownCfg && cooldownCfg.cooldownHours > 0) {
      const reEntryCooldowns = positions.reEntryCooldowns || {};
      const lastExitAt = reEntryCooldowns[signal.symbol];
      if (lastExitAt) {
        const hoursSinceExit = (Date.now() - new Date(lastExitAt).getTime()) / 3600000;
        if (hoursSinceExit < cooldownCfg.cooldownHours) {
          const ovr = cooldownCfg.convictionOverride;
          let overrideGranted = false;
          const ovrDetails = [];
          if (ovr && ovr.enabled) {
            const absChange = Math.abs(signal.sampleChangePct || 0);
            const baseTrigger = cooldownCfg.entryMovementThresholdPct || 2.0;
            const momentumRequired = baseTrigger * ovr.momentumMultiplier;
            const momentumOk = absChange >= momentumRequired;
            ovrDetails.push(`momentum:${momentumOk}(${absChange.toFixed(2)}%>=${momentumRequired.toFixed(2)}%)`);

            const bandOk = decision.approvalBand === ovr.requiredApprovalBand;
            ovrDetails.push(`band:${bandOk}(${decision.approvalBand})`);

            // Volume gate: latest bar vs average of prior lookbackBars.
            // Skipped (passes) if all bars have zero volume (data not populated).
            let volumeOk = true;
            if (ovr.volumeMultiplier && bars.length >= 2) {
              const lookback = ovr.volumeLookbackBars || 30;
              const priorBars = bars.slice(0, -1).slice(-lookback);
              const avgVol = priorBars.length > 0
                ? priorBars.reduce((s, b) => s + (b.volume || 0), 0) / priorBars.length
                : 0;
              const latestVol = bars[bars.length - 1].volume || 0;
              volumeOk = avgVol === 0 || latestVol >= avgVol * ovr.volumeMultiplier;
              ovrDetails.push(`vol:${volumeOk}(${latestVol}>=${(avgVol * ovr.volumeMultiplier).toFixed(0)})`);
            }

            overrideGranted = momentumOk && bandOk && volumeOk;
          }

          if (!overrideGranted) {
            skippedReasons.push(`${signal.symbol}: cooldown(${hoursSinceExit.toFixed(1)}h/${cooldownCfg.cooldownHours}h) override-denied[${ovrDetails.join(' ')}]`);
            continue;
          }
          console.log(`[COOLDOWN OVERRIDE] ${signal.symbol}: re-entry granted (${hoursSinceExit.toFixed(1)}h in ${cooldownCfg.cooldownHours}h window) [${ovrDetails.join(' ')}]`);
        }
      }
    }

    const entryBar = bars[bars.length - 1];
    const sizeMultiplier = decision.positionSizeMultiplier || 1.0;
    // Size off the stable pre-loop equity snapshot (`totalEquity`), NOT the
    // decaying `cashBalance`, so every comparable trade gets a comparable size
    // and a wide (~40-position) book is reachable. Capped by the 25%/equity
    // safety guardrail and never allowed to exceed remaining cash.
    const perTradeValue = totalEquity * perTradeAllocationPct * sizeMultiplier;
    const positionValue = Math.min(perTradeValue, totalEquity * maxPositionSizePct, cashBalance);
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
      riskDecisionId: decision.riskDecisionId,
      riskBand: {
        entryRiskBand: decision.entryRiskBand || decision.approvalBand,
        riskBandSource: decision.riskBandSource || "paper_simulation"
      }
    });

    pos.approvalBand = decision.approvalBand || "approved_standard";
    pos.positionSizeMultiplier = round(sizeMultiplier);

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
    if (isProbe) learningProbesExecuted++;
    else standardTradesExecuted++;

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
      liveTradingEnabled: false,
      approvalBand: decision.approvalBand || "approved_standard",
      positionSizeMultiplier: round(sizeMultiplier),
      entryPlan: decision.entryPlan || null,
      exitPlan: decision.exitPlan || null,
      riskPlan: decision.riskPlan || null,
      isLearningProbe: isProbe,
      learningMetadata: decision.learningMetadata || null
    });

    if (positions.dailyTradeCount + tradesExecuted >= maxTradesPerDay) break;
  }

  const totalUnrealizedPnl = openPositionsList.reduce((sum, p) => sum + (p.unrealizedPnl || 0), 0);
  const totalHoldingsValue = openPositionsList.reduce((sum, p) => sum + (p.currentValue || p.positionValue || 0), 0);
  const totalEquityAfter = cashBalance + totalHoldingsValue;
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
  syncPositions(positions);

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
    openPositions: openPositionsList,
    maxOpenPositions,
    executedTrades: trades.length,
    learningProbesExecuted,
    standardTradesExecuted,
    maxLearningProbesPerDay,
    maxStandardTradesPerDay,
    learningModeEnabled: !!learningConfig,
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

function resetCycleIfDepleted({ cashBalance, openPositions, generatedAt }) {
  const DEPLETION_THRESHOLD = 10;
  const totalHoldingsValue = openPositions.reduce((sum, p) => sum + (p.currentValue || p.positionValue || 0), 0);
  const totalEquity = cashBalance + totalHoldingsValue;

  if (totalEquity > DEPLETION_THRESHOLD) return { reset: false };

  const learningPath = require("path").join(paths.dataRoot, "paper", "learning-records-v0.1.json");
  const existing = fileExists(learningPath) ? loadJson(learningPath) : { records: [] };

  const resetRecord = {
    learningRecordId: "reset-" + Date.now(),
    eventType: "cycle_depletion_reset",
    generatedAt,
    finalEquity: totalEquity,
    finalCash: cashBalance,
    openPositionsAtReset: openPositions.length,
    totalLearningRecords: existing.records.length,
    outcome: "depleted",
    paperOnly: true
  };

  existing.records.push(resetRecord);
  existing.lastUpdated = generatedAt;
  writeJson(learningPath, existing);

  const freshPerformance = {
    startingCash: 1000,
    cashBalance: 1000,
    realizedPnl: 0,
    unrealizedPnl: 0,
    totalEquity: 1000,
    maxDrawdown: 0,
    peakEquity: 1000,
    dailyRealizedPnl: 0,
    dailyTradeCount: 0,
    dailyDrawdown: 0,
    tradeDate: generatedAt.slice(0, 10),
    resetAt: generatedAt,
    resetReason: "cash_depleted",
    paperOnly: true
  };

  const currentPositions = fileExists(paths.paperPositionsJson)
    ? loadJson(paths.paperPositionsJson)
    : { openPositions: [], closedPositions: [] };

  const depletionClosures = (currentPositions.openPositions || []).map(p => ({
    ...p,
    exitTime: generatedAt,
    exitPrice: p.entryPrice,
    realizedPnl: 0,
    exitReason: "cycle_depleted_reset",
    closedAt: generatedAt,
    paperOnly: true
  }));

  const freshPositions = {
    openPositions: [],
    closedPositions: [...(currentPositions.closedPositions || []), ...depletionClosures],
    dailyTradeCount: 0,
    tradeDate: generatedAt.slice(0, 10),
    resetAt: generatedAt
  };

  writeJson(paths.paperPositionsJson, freshPositions);
  writeJson(paths.paperPerformanceJson, freshPerformance);
  syncPositions(freshPositions);

  console.log(`[CYCLE RESET] Cash depleted to $${totalEquity.toFixed(2)} — resetting to $1,000 paper balance`);
  console.log(`[CYCLE RESET] Learning records preserved: ${existing.records.length}`);

  return { reset: true, freshCashBalance: 1000 };
}

module.exports = { executeIntradayPaperTrades, executePaperTrades, closePosition, updateUnrealizedPnl, loadPositions, loadPerformance, checkAndExecuteExits, loadExitRules, resetCycleIfDepleted };
