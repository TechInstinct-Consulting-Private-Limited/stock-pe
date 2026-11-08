const DHAN_QUOTE_URL = "https://api.dhan.co/v2/marketfeed/quote";

function isDhanConfigured(env = process.env) {
  return String(env.MARKET_DATA_PROVIDER || "").trim().toLowerCase() === "dhan"
    && Boolean(String(env.DHAN_CLIENT_ID || "").trim())
    && Boolean(String(env.DHAN_ACCESS_TOKEN || "").trim());
}

function getQuoteRecord(payload, exchangeSegment, securityId) {
  const data = payload?.data || payload || {};
  return data?.[exchangeSegment]?.[String(securityId)]
    || data?.[exchangeSegment]?.[securityId]
    || data?.[String(securityId)]
    || null;
}

function normalizeQuote(record) {
  const lastPrice = Number(record?.last_price ?? record?.ltp ?? record?.lastPrice);
  const netChange = Number(record?.net_change ?? record?.change ?? 0);
  const previousClose = Number(record?.ohlc?.close ?? record?.previous_close ?? record?.previousClose);
  const percentChange = Number.isFinite(previousClose) && previousClose !== 0
    ? (netChange / previousClose) * 100
    : 0;

  if (!Number.isFinite(lastPrice)) return null;

  return {
    rawValue: lastPrice,
    changeValue: Number.isFinite(netChange) ? netChange : 0,
    percentChange: Number.isFinite(percentChange) ? percentChange : 0,
  };
}

async function fetchDhanQuotes(instruments, { env = process.env, fetchImpl = global.fetch } = {}) {
  if (!isDhanConfigured(env) || !instruments.length) return new Map();
  if (typeof fetchImpl !== "function") throw new Error("No fetch implementation is available for Dhan market data");

  const grouped = instruments.reduce((body, instrument) => {
    const segment = instrument.dhan?.exchangeSegment;
    const securityId = instrument.dhan?.securityId;
    if (!segment || securityId === undefined || securityId === null) return body;
    body[segment] ||= [];
    body[segment].push(Number(securityId));
    return body;
  }, {});

  if (!Object.keys(grouped).length) return new Map();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetchImpl(DHAN_QUOTE_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "access-token": String(env.DHAN_ACCESS_TOKEN),
        "client-id": String(env.DHAN_CLIENT_ID),
      },
      body: JSON.stringify(grouped),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.status === "failure") {
      throw new Error(`Dhan quote request failed (${response.status})`);
    }

    const quotes = new Map();
    instruments.forEach((instrument) => {
      const record = getQuoteRecord(payload, instrument.dhan.exchangeSegment, instrument.dhan.securityId);
      const normalized = normalizeQuote(record);
      if (normalized) quotes.set(instrument.symbol, normalized);
    });
    return quotes;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  DHAN_QUOTE_URL,
  fetchDhanQuotes,
  getQuoteRecord,
  isDhanConfigured,
  normalizeQuote,
};
