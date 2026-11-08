const pool = require("../config/database");
const { getLiveIndices } = require("./market.service");

// Only these instruments already exist in the current contest data model.
// Do not write provider data for arbitrary stock searches into the dashboard.
const INSTRUMENT_CODE_BY_SYMBOL = {
    "^NSEI": "NIFTY50",
    "^BSESN": "SENSEX",
    "^NSEBANK": "BANKNIFTY",
    "NIFTY_MIDCAP_100.NS": "NIFTYMIDCAP100",
};

const SNAPSHOT_SYNC_TTL_MS = 20 * 1000;
let lastAttemptAt = 0;
let inFlightSync = null;

function asSnapshotRows(indices, freshRawSymbols) {
    const freshSymbols = new Set(freshRawSymbols);
    return indices
        .filter((quote) => freshSymbols.has(quote.rawSymbol) && INSTRUMENT_CODE_BY_SYMBOL[quote.rawSymbol])
        .map((quote) => ({
            code: INSTRUMENT_CODE_BY_SYMBOL[quote.rawSymbol],
            value: Number(quote.rawValue),
            changePercent: Number(quote.percentChange),
            provider: quote.provider || "unknown",
        }))
        .filter((snapshot) => Number.isFinite(snapshot.value) && snapshot.value >= 0 && Number.isFinite(snapshot.changePercent));
}

async function writeSnapshots(snapshots) {
    if (!snapshots.length) return 0;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        let written = 0;
        for (const snapshot of snapshots) {
            const result = await client.query(
                `INSERT INTO market_price_snapshots (instrument_id, value, change_percent, observed_at, provider_key)
                 SELECT id, $2, $3, NOW(), $4
                 FROM market_instruments
                 WHERE code = $1 AND is_active = TRUE`,
                [snapshot.code, snapshot.value, snapshot.changePercent, snapshot.provider]
            );
            written += result.rowCount;
        }
        await client.query("COMMIT");
        return written;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function syncDashboardMarketPrices() {
    const now = Date.now();
    if (inFlightSync) return inFlightSync;
    if (now - lastAttemptAt < SNAPSHOT_SYNC_TTL_MS) return { attempted: false, written: 0 };

    lastAttemptAt = now;
    inFlightSync = (async () => {
        try {
            const market = await getLiveIndices();
            if (!market.sourceUpdated) return { attempted: true, written: 0 };
            const written = await writeSnapshots(asSnapshotRows(market.indices, market.freshRawSymbols));
            return { attempted: true, written };
        } catch (error) {
            // Market data must never make the contest feed unavailable.
            console.error("[MarketSnapshot] Refresh skipped:", error.message);
            return { attempted: true, written: 0 };
        } finally {
            inFlightSync = null;
        }
    })();

    return inFlightSync;
}

module.exports = { INSTRUMENT_CODE_BY_SYMBOL, asSnapshotRows, syncDashboardMarketPrices };
