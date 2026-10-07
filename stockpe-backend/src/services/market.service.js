const YahooFinanceModule = require("yahoo-finance2");
const YahooFinanceClass = YahooFinanceModule.default || YahooFinanceModule;

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

// Popular Indian Market Indices & Stocks
const DEFAULT_MARKET_SYMBOLS = [
  // Indices
  { symbol: "^NSEI", name: "NIFTY 50", type: "INDEX" },
  { symbol: "^NSEBANK", name: "BANK NIFTY", type: "INDEX" },
  { symbol: "^BSESN", name: "SENSEX", type: "INDEX" },
  { symbol: "^CNXIT", name: "NIFTY IT", type: "INDEX" },
  { symbol: "NIFTY_MIDCAP_100.NS", name: "NIFTY MIDCAP 100", type: "INDEX" },
  { symbol: "^CNXAUTO", name: "NIFTY AUTO", type: "INDEX" },
  { symbol: "^CNXFMCG", name: "NIFTY FMCG", type: "INDEX" },
  { symbol: "^CNXPHARMA", name: "NIFTY PHARMA", type: "INDEX" },
  { symbol: "^CNXMETAL", name: "NIFTY METAL", type: "INDEX" },
  { symbol: "^CNXENERGY", name: "NIFTY ENERGY", type: "INDEX" },
  { symbol: "^CNXPSUBANK", name: "NIFTY PSU BANK", type: "INDEX" },
  { symbol: "^CNXFINANCE", name: "FIN NIFTY", type: "INDEX" },

  // Top Stocks
  { symbol: "RELIANCE.NS", name: "Reliance Industries", type: "STOCK" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", type: "STOCK" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", type: "STOCK" },
  { symbol: "INFY.NS", name: "Infosys", type: "STOCK" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", type: "STOCK" },
  { symbol: "SBIN.NS", name: "State Bank of India", type: "STOCK" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", type: "STOCK" },
  { symbol: "ITC.NS", name: "ITC Limited", type: "STOCK" },
  { symbol: "LT.NS", name: "Larsen & Toubro", type: "STOCK" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", type: "STOCK" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", type: "STOCK" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", type: "STOCK" },
  { symbol: "WIPRO.NS", name: "Wipro", type: "STOCK" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises", type: "STOCK" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki", type: "STOCK" },
  { symbol: "TATASTEEL.NS", name: "Tata Steel", type: "STOCK" },
  { symbol: "TITAN.NS", name: "Titan Company", type: "STOCK" },
  { symbol: "ZOMATO.NS", name: "Zomato", type: "STOCK" },
  { symbol: "JIOFIN.NS", name: "Jio Financial Services", type: "STOCK" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharma", type: "STOCK" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", type: "STOCK" },
  { symbol: "AXISBANK.NS", name: "Axis Bank", type: "STOCK" },
];

let cache = {
  data: null,
  lastUpdated: 0,
};

const CACHE_TTL_MS = 10 * 1000; // 10-second cache

// Suppress survey notices
try {
  if (yfInstance?.setGlobalConfig) {
    yfInstance.setGlobalConfig({ suppressNotices: ["yahooSurvey"] });
  }
} catch {}

function formatYahooQuote(quote, defaultName, type = "STOCK") {
  if (!quote) return null;
  const rawSym = quote.symbol || "";
  const currentPrice = quote.regularMarketPrice ?? quote.regularMarketPreviousClose ?? 0;
  const change = quote.regularMarketChange ?? 0;
  const percentChange = quote.regularMarketChangePercent ?? 0;
  const isPositive = change >= 0;

  return {
    symbol: rawSym.replace(/\.NS|\.BO|\^/g, ""),
    rawSymbol: rawSym,
    name: quote.shortName || quote.longName || defaultName || rawSym,
    type: type,
    value: Number(currentPrice).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    rawValue: Number(currentPrice),
    changeValue: (isPositive ? "+" : "") + Number(change).toFixed(2),
    change: (isPositive ? "+" : "") + Number(percentChange).toFixed(2) + "%",
    percentChange: Number(percentChange),
    isPositive: isPositive,
    marketState: quote.marketState || "REGULAR",
    currency: quote.currency || "INR",
    provider: "yahoo",
  };
}

/**
 * Fetch all live stock indices and popular stocks via Yahoo Finance
 */
async function getLiveIndices(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cache.data && now - cache.lastUpdated < CACHE_TTL_MS) {
    return {
      indices: cache.data,
      cached: true,
      provider: "yahoo",
      lastUpdated: new Date(cache.lastUpdated).toISOString(),
    };
  }

  try {
    const quotes = await Promise.allSettled(
      DEFAULT_MARKET_SYMBOLS.map((item) => yfInstance.quote(item.symbol))
    );

    const formattedList = [];

    quotes.forEach((result, idx) => {
      const config = DEFAULT_MARKET_SYMBOLS[idx];
      if (result.status === "fulfilled" && result.value) {
        const item = formatYahooQuote(result.value, config.name, config.type);
        if (item) formattedList.push(item);
      } else {
        const prev = cache.data?.find((d) => d.rawSymbol === config.symbol);
        if (prev) {
          formattedList.push(prev);
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
      provider: "yahoo",
      lastUpdated: new Date(cache.lastUpdated || now).toISOString(),
    };
  } catch (error) {
    console.error("[MarketService] Quote fetch error:", error.message);
    return {
      indices: cache.data || [],
      cached: true,
      stale: true,
      provider: "yahoo",
      lastUpdated: new Date(cache.lastUpdated || now).toISOString(),
    };
  }
}

/**
 * Dynamic search for ANY Indian stock or index using Yahoo Finance
 */
async function searchMarket(query) {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const cleanQuery = query.trim();

  try {
    const searchResults = await yfInstance.search(cleanQuery, {
      newsCount: 0,
      quotesCount: 15,
    });

    const quotes = (searchResults?.quotes || []).filter(
      (q) => q && typeof q.symbol === "string"
    );

    // Prioritize Indian symbols (.NS, .BO, ^NSE, ^BSE)
    const indianQuotes = quotes.filter(
      (q) =>
        q.symbol.endsWith(".NS") ||
        q.symbol.endsWith(".BO") ||
        q.symbol.startsWith("^") ||
        q.exchange === "NSI" ||
        q.exchange === "BSE"
    );

    const targets = indianQuotes.length > 0 ? indianQuotes : quotes.slice(0, 8);

    // Fetch live quotes for top matches
    const liveQuotes = await Promise.allSettled(
      targets.slice(0, 8).map((q) => yfInstance.quote(q.symbol))
    );

    const formatted = [];
    liveQuotes.forEach((res, i) => {
      if (res.status === "fulfilled" && res.value) {
        const original = targets[i];
        const item = formatYahooQuote(
          res.value,
          original.shortname || original.longname || original.symbol,
          original.quoteType === "INDEX" ? "INDEX" : "STOCK"
        );
        if (item) formatted.push(item);
      }
    });

    return formatted;
  } catch (err) {
    console.error("[MarketService] Search error:", err.message);
    const local = cache.data || [];
    return local.filter(
      (item) =>
        item.symbol.toLowerCase().includes(cleanQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(cleanQuery.toLowerCase())
    );
  }
}

module.exports = {
  getLiveIndices,
  searchMarket,
  DEFAULT_MARKET_SYMBOLS,
};

