// Presentation helpers only. API/database values and financial calculations keep
// their original precision; all visible amounts are capped at two decimals.
const amountFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function asFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function formatAmount(value, fallback = "—") {
  const number = asFiniteNumber(value);
  return number === null ? fallback : amountFormatter.format(number);
}

export function formatINR(amount, fallback = "0.00") {
  return `₹${formatAmount(amount, fallback)}`;
}

export function formatUSDT(amount, fallback = "0.00") {
  return `${formatAmount(amount, fallback)} USDT`;
}

export function formatPercent(value, withSign = true) {
  const number = asFiniteNumber(value);
  if (number === null) return "—";
  const sign = withSign && number > 0 ? "+" : "";
  return `${sign}${compactFormatter.format(number)}%`;
}

export function formatNumber(value) {
  const number = asFiniteNumber(value);
  return number === null ? "0" : compactFormatter.format(number);
}
