// Formatting Helpers
export function formatINR(amount) {
  if (amount === undefined || amount === null) return "₹0";
  const num = Number(amount);
  if (isNaN(num)) return `₹${amount}`;
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatUSDT(amount, decimals = 2) {
  if (amount === undefined || amount === null) return "0.00 USDT";
  const num = Number(amount);
  if (isNaN(num)) return `${amount} USDT`;
  return `${num.toFixed(decimals)} USDT`;
}

export function formatPercent(val, withSign = true) {
  if (val === undefined || val === null) return "0%";
  const num = Number(val);
  if (isNaN(num)) return `${val}%`;
  const sign = withSign && num > 0 ? "+" : "";
  return `${sign}${num}%`;
}

export function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  return Number(num).toLocaleString("en-IN");
}
