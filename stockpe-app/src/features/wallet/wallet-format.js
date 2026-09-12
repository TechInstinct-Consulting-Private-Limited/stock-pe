export const INR_PER_USDT = 73.42;

export function numericUsdt(value) {
    const amount = Number(value || 0);
    return Number.isFinite(amount) ? amount : 0;
}

export function formatUsdt(value, digits = 2) {
    return numericUsdt(value).toFixed(digits);
}

export function formatInr(value) {
    return `₹${Math.round(numericUsdt(value) * INR_PER_USDT).toLocaleString("en-IN")}`;
}

export function shortenAddress(address = "") {
    if (address.length <= 18) return address;
    return `${address.slice(0, 10)}…${address.slice(-7)}`;
}
