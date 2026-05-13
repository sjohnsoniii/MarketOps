const regimes = [
  {
    periodId: "synthetic-trend-up-v0.1",
    expectedRegime: "trend_up",
    description: "Steady upward sample path with mild pullbacks.",
    startPrice: 100,
    dailyReturnsPct: [0.35, 0.22, -0.08, 0.41, 0.28, 0.31, -0.12, 0.48, 0.26, 0.34, 0.18, 0.43, -0.05, 0.29, 0.37, 0.21, 0.32, 0.46, -0.1, 0.39, 0.24, 0.33, 0.27, 0.45]
  },
  {
    periodId: "synthetic-trend-down-v0.1",
    expectedRegime: "trend_down",
    description: "Persistent downward sample path with brief relief bounces.",
    startPrice: 100,
    dailyReturnsPct: [-0.32, -0.24, 0.08, -0.45, -0.27, -0.36, 0.12, -0.42, -0.31, -0.28, -0.39, 0.1, -0.44, -0.22, -0.34, -0.41, 0.06, -0.37, -0.29, -0.33, -0.46, 0.09, -0.38, -0.26]
  },
  {
    periodId: "synthetic-choppy-sideways-v0.1",
    expectedRegime: "choppy_sideways",
    description: "Sideways sample path with alternating gains and losses.",
    startPrice: 100,
    dailyReturnsPct: [0.42, -0.38, 0.31, -0.29, 0.52, -0.47, 0.26, -0.35, 0.4, -0.44, 0.33, -0.28, 0.36, -0.39, 0.24, -0.31, 0.48, -0.45, 0.3, -0.27, 0.37, -0.41, 0.29, -0.32]
  },
  {
    periodId: "synthetic-panic-drawdown-v0.1",
    expectedRegime: "panic_drawdown",
    description: "Sharp sample selloff with high volatility and partial stabilization.",
    startPrice: 100,
    dailyReturnsPct: [-0.8, -1.4, -2.2, 0.5, -3.1, -2.7, 1.1, -1.9, -2.4, 0.8, -1.6, -2.8, 1.4, -1.2, -0.7, 0.9, -1.1, 0.6, -0.5, 0.4, -0.3, 0.2, -0.4, 0.3]
  },
  {
    periodId: "synthetic-low-volatility-drift-v0.1",
    expectedRegime: "low_volatility_drift",
    description: "Small sample movements with slow positive drift.",
    startPrice: 100,
    dailyReturnsPct: [0.06, 0.04, -0.02, 0.05, 0.03, 0.07, -0.01, 0.06, 0.02, 0.05, 0.04, -0.02, 0.03, 0.06, 0.02, 0.04, -0.01, 0.05, 0.03, 0.06, 0.02, 0.04, 0.03, 0.05]
  },
  {
    periodId: "synthetic-melt-up-v0.1",
    expectedRegime: "melt_up",
    description: "Fast upward sample path with expanding returns and pullback risk.",
    startPrice: 100,
    dailyReturnsPct: [0.65, 0.82, 1.05, -0.22, 1.18, 0.94, 1.32, 0.76, -0.35, 1.48, 1.21, 0.88, 1.55, -0.4, 1.37, 1.64, 0.92, 1.72, -0.55, 1.46, 1.18, 0.83, 1.33, 0.74]
  }
];

function buildPriceSeries(period) {
  let close = period.startPrice;
  return period.dailyReturnsPct.map((returnPct, index) => {
    close = Number((close * (1 + returnPct / 100)).toFixed(4));
    return {
      day: index + 1,
      close,
      returnPct
    };
  });
}

function getSampleHistoricalPeriods() {
  return regimes.map((period) => ({
    ...period,
    mode: "paper_simulation",
    sampleData: true,
    syntheticHistoricalPreview: true,
    notLiveMarketData: true,
    priceSeries: buildPriceSeries(period)
  }));
}

module.exports = { getSampleHistoricalPeriods };
