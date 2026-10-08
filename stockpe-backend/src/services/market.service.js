const YahooFinanceModule = require("yahoo-finance2");
const YahooFinanceClass = YahooFinanceModule.default || YahooFinanceModule;

// Support both v4 class instantiation and legacy singleton
let yfInstance;
try {
  if (typeof YahooFinanceClass === "function" && YahooFinanceClass.prototype) {
    yfInstance = new YahooFinanceClass();
  } else {
    yfInstance = YahooFinanceClass;
  }
} catch {
  yfInstance = YahooFinanceClass;
}

// Map of index symbols to clean display names
const INDICES_CONFIG = [
  { symbol: "^NSEI", name: "NIFTY 50", shortName: "NIFTY 50", fallback: { value: "24,187.65", rawValue: 24187.65, change: "+0.84%", isPositive: true } },
  { symbol: "^BSESN", name: "SENSEX", shortName: "SENSEX", fallback: { value: "79,432.18", rawValue: 79432.18, change: "-0.31%", isPositive: false } },
  { symbol: "^NSEBANK", name: "BANK NIFTY", shortName: "BANK NIFTY", fallback: { value: "51,843.25", rawValue: 51843.25, change: "+1.12%", isPositive: true } },
  { symbol: "^CNXIT", name: "NIFTY IT", shortName: "NIFTY IT", fallback: { value: "38,750.00", rawValue: 38750.00, change: "+1.65%", isPositive: true } },
  { symbol: "NIFTY_MIDCAP_100.NS", name: "NIFTY MIDCAP", shortName: "MIDCAP 100", fallback: { value: "13,240.50", rawValue: 13240.50, change: "+0.45%", isPositive: true } },
  { symbol: "^CNXAUTO", name: "NIFTY AUTO", shortName: "NIFTY AUTO", fallback: { value: "22,450.10", rawValue: 22450.10, change: "+0.62%", isPositive: true } },
  { symbol: "^CNXFMCG", name: "NIFTY FMCG", shortName: "NIFTY FMCG", fallback: { value: "58,120.30", rawValue: 58120.30, change: "-0.18%", isPositive: false } },
  { symbol: "^CNXPHARMA", name: "NIFTY PHARMA", shortName: "NIFTY PHARMA", fallback: { value: "21,680.00", rawValue: 21680.00, change: "+0.95%", isPositive: true } },
];

// These codes intentionally match the existing `market_instruments` records
// used by demo_dashboard_contests. Keep this registry small and explicit: a
// search result must not introduce a second contest/instrument data model.
const CONTEST_INSTRUMENT_CODES = {
  "NIFTY 50": "NIFTY50",
  SENSEX: "SENSEX",
  "BANK NIFTY": "BANKNIFTY",
  "NIFTY MIDCAP": "NIFTYMIDCAP100",
};

const CONTEST_INSTRUMENTS = INDICES_CONFIG
  .filter((config) => CONTEST_INSTRUMENT_CODES[config.name])
  .map((config) => ({
    instrumentCode: CONTEST_INSTRUMENT_CODES[config.name],
    rawSymbol: config.symbol,
    name: config.name,
    aliases: [config.name, config.shortName, config.symbol],
  }));

let cache = {
  data: null,
  lastUpdated: 0,
};

const CACHE_TTL_MS = 20 * 1000; // 20-second cache

function formatQuote(quote, config) {
  const currentPrice = quote?.regularMarketPrice ?? quote?.regularMarketPreviousClose ?? config.fallback.rawValue;
  const change = quote?.regularMarketChange ?? 0;
  const percentChange = quote?.regularMarketChangePercent ?? 0;
  const isPositive = change >= 0;

  return {
    symbol: config.shortName || quote.symbol,
    rawSymbol: config.symbol,
    name: config.name || config.symbol,
    value: Number(currentPrice).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    rawValue: currentPrice,
    changeValue: (isPositive ? "+" : "") + Number(change).toFixed(2),
    change: (isPositive ? "+" : "") + Number(percentChange).toFixed(2) + "%",
    percentChange: percentChange,
    isPositive: isPositive,
    marketState: quote?.marketState || "REGULAR",
    currency: quote?.currency || "INR",
  };
}

function getFallbackList() {
  return INDICES_CONFIG.map((config) => ({
    symbol: config.shortName,
    rawSymbol: config.symbol,
    name: config.name,
    value: config.fallback.value,
    rawValue: config.fallback.rawValue,
    changeValue: "+0.00",
    change: config.fallback.change,
    percentChange: 0,
    isPositive: config.fallback.isPositive,
    marketState: "CLOSED",
    currency: "INR",
  }));
}

function normalizeSearchQuery(value) {
  return String(value || "").trim().toLowerCase();
}

function getContestInstrumentMatches(query) {
  const normalized = normalizeSearchQuery(query);
  if (normalized === "all") return CONTEST_INSTRUMENTS;
  if (!normalized) return [];

  return CONTEST_INSTRUMENTS.filter((instrument) =>
    instrument.aliases.some((alias) => alias.toLowerCase().includes(normalized))
  );
}

function findExistingQuote(instrument) {
  const config = INDICES_CONFIG.find((item) => item.symbol === instrument.rawSymbol);
  if (!config) return null;

  const cached = cache.data?.find((item) => item.rawSymbol === instrument.rawSymbol);
  return cached || {
    symbol: config.shortName,
    rawSymbol: config.symbol,
    name: config.name,
    value: config.fallback.value,
    rawValue: config.fallback.rawValue,
    changeValue: "+0.00",
    change: config.fallback.change,
    percentChange: 0,
    isPositive: config.fallback.isPositive,
    marketState: "CLOSED",
    currency: "INR",
  };
}

/**
 * Search only the instruments that the current demo contest schema supports.
 * The returned instrumentCode can be passed directly to the existing admin
 * contest-create endpoint. Yahoo is used for the current value; the existing
 * safe dashboard fallback remains available if a quote lookup fails.
 */
async function searchContestInstruments(query) {
  const matches = getContestInstrumentMatches(query);
  if (!matches.length) return [];

  const quotes = await Promise.allSettled(matches.map((instrument) => yfInstance.quote(instrument.rawSymbol)));

  return matches.map((instrument, index) => {
    const config = INDICES_CONFIG.find((item) => item.symbol === instrument.rawSymbol);
    const quote = quotes[index].status === "fulfilled" ? quotes[index].value : null;
    const formatted = quote && config ? formatQuote(quote, config) : findExistingQuote(instrument);

    return {
      instrumentCode: instrument.instrumentCode,
      name: instrument.name,
      rawSymbol: instrument.rawSymbol,
      exchange: instrument.name === "SENSEX" ? "BSE" : "NSE",
      category: "INDEX",
      supportsDemoContest: true,
      quote: formatted,
    };
  });
}

/**
 * Fetch real live stock indices
 */
async function getLiveIndices(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cache.data && (now - cache.lastUpdated) < CACHE_TTL_MS) {
    return {
      indices: cache.data,
      cached: true,
      lastUpdated: new Date(cache.lastUpdated).toISOString(),
    };
  }

  try {
    const symbols = INDICES_CONFIG.map(i => i.symbol);

    // Fetch quotes in parallel
    const quotes = await Promise.allSettled(
      symbols.map(sym => yfInstance.quote(sym))
    );

    const formattedList = [];

    quotes.forEach((result, idx) => {
      const config = INDICES_CONFIG[idx];
      if (result.status === "fulfilled" && result.value) {
        formattedList.push(formatQuote(result.value, config));
      } else {
        const prev = cache.data?.find(d => d.rawSymbol === config.symbol);
        if (prev) {
          formattedList.push(prev);
        } else {
          // Use config fallback for this particular index
          formattedList.push({
            symbol: config.shortName,
            rawSymbol: config.symbol,
            name: config.name,
            value: config.fallback.value,
            rawValue: config.fallback.rawValue,
            changeValue: "+0.00",
            change: config.fallback.change,
            percentChange: 0,
            isPositive: config.fallback.isPositive,
            marketState: "CLOSED",
            currency: "INR",
          });
        }
      }
    });

    if (formattedList.length > 0) {
      cache.data = formattedList;
      cache.lastUpdated = now;
    }

    return {
      indices: cache.data || formattedList,
      cached: false,
      lastUpdated: new Date(cache.lastUpdated || now).toISOString(),
    };
  } catch (error) {
    console.error("[MarketService] Live quote fetch fallback:", error.message);
    const fallbackData = cache.data || getFallbackList();
    return {
      indices: fallbackData,
      cached: true,
      stale: true,
      lastUpdated: new Date(cache.lastUpdated || now).toISOString(),
    };
  }
}

module.exports = {
  getLiveIndices,
  INDICES_CONFIG,
  getContestInstrumentMatches,
  searchContestInstruments,
};
