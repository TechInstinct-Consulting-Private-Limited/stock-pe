// Financial & Order Calculation Utilities
export const USDT_RATE = 73.42;

export function calculateOrderMetrics(quantity, pricePerUnit, defaultPayoutPerUnit = 10) {
  const qty = Number(quantity) || 0;
  const price = Number(pricePerUnit) || 0;

  const investment = Math.round(qty * price * 10) / 10;
  const potentialPayout = Math.round(qty * defaultPayoutPerUnit * 10) / 10;
  const potentialProfit = Math.round((potentialPayout - investment) * 10) / 10;
  const roiPercentage = investment > 0 ? Math.round((potentialProfit / investment) * 100) : 0;

  const investmentUsdt = (investment / USDT_RATE).toFixed(2);
  const payoutUsdt = (potentialPayout / USDT_RATE).toFixed(2);

  return {
    investment,
    potentialPayout,
    potentialProfit,
    roiPercentage,
    multiplier: 2.0,
    investmentUsdt,
    payoutUsdt,
  };
}

export function calculatePricePredictionMetrics(
  quantity = 1,
  spotPrice = 24187.65,
  targetPrice = 24187.65,
  baseUnitCost = 199
) {
  const qty = Number(quantity) || 1;
  const spot = Number(spotPrice) || 24187.65;
  const target = Number(targetPrice) || spot;
  const delta = Math.round((target - spot) * 100) / 100;
  const absDelta = Math.abs(delta);
  const pctDistance = spot > 0 ? (absDelta / spot) * 100 : 0;

  // Dynamic Multiplier: 1.8x base up to 10.0x for bolder predictions
  const rawMultiplier = 1.8 + pctDistance * 1.6;
  const multiplier = Number(Math.min(10.0, Math.max(1.8, rawMultiplier)).toFixed(2));

  const investment = Math.round(qty * baseUnitCost * 10) / 10;
  const potentialPayout = Math.round(investment * multiplier * 10) / 10;
  const potentialProfit = Math.round((potentialPayout - investment) * 10) / 10;
  const roiPercentage = investment > 0 ? Math.round((potentialProfit / investment) * 100) : 0;

  const investmentUsdt = (investment / USDT_RATE).toFixed(2);
  const payoutUsdt = (potentialPayout / USDT_RATE).toFixed(2);

  return {
    investment,
    potentialPayout,
    potentialProfit,
    roiPercentage,
    multiplier,
    delta,
    absDelta,
    isAbove: delta >= 0,
    investmentUsdt,
    payoutUsdt,
  };
}

export function calculatePortfolioMetrics(trades = []) {
  const activeTrades = trades.filter((t) => t.status === "ACTIVE");
  const totalInvested = activeTrades.reduce((acc, t) => acc + (t.investedAmount || 0), 0);
  const totalCurrentValue = activeTrades.reduce((acc, t) => acc + (t.currentValue || 0), 0);
  const totalPnl = Math.round((totalCurrentValue - totalInvested) * 10) / 10;
  const totalPnlPercent = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(1) : "0.0";
  const isPnlPositive = totalPnl >= 0;

  return {
    activeTrades,
    totalInvested,
    totalCurrentValue,
    totalPnl,
    totalPnlPercent,
    isPnlPositive,
    activeCount: activeTrades.length,
  };
}
