-- Phase 1 dashboard: read-only demo contest catalogue.
-- These records deliberately contain virtual credits only. They must not be
-- used to debit wallets, credit winnings, or trigger a payout.

CREATE TABLE IF NOT EXISTS market_instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    exchange TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('INDEX', 'SECTOR', 'MACRO')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_price_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID NOT NULL REFERENCES market_instruments(id) ON DELETE RESTRICT,
    value NUMERIC(20, 4) NOT NULL CHECK (value >= 0),
    change_percent NUMERIC(10, 4) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    provider_key TEXT NOT NULL DEFAULT 'demo-seed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS market_price_snapshots_latest_idx
    ON market_price_snapshots (instrument_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS demo_dashboard_contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL UNIQUE,
    instrument_id UUID NOT NULL REFERENCES market_instruments(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'LIVE', 'SOON')),
    entry_credits INTEGER NOT NULL CHECK (entry_credits > 0),
    prize_pool_credits INTEGER NOT NULL CHECK (prize_pool_credits > 0),
    player_capacity INTEGER NOT NULL CHECK (player_capacity > 0),
    player_count INTEGER NOT NULL DEFAULT 0 CHECK (player_count >= 0 AND player_count <= player_capacity),
    opens_at TIMESTAMPTZ NOT NULL,
    closes_at TIMESTAMPTZ NOT NULL CHECK (closes_at > opens_at),
    settlement_source TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_demo BOOLEAN NOT NULL DEFAULT TRUE CHECK (is_demo = TRUE),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_dashboard_contests_status_idx
    ON demo_dashboard_contests (status, display_order, closes_at);

CREATE TABLE IF NOT EXISTS demo_dashboard_metrics (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
    prize_pool_credits INTEGER NOT NULL CHECK (prize_pool_credits >= 0),
    live_players INTEGER NOT NULL CHECK (live_players >= 0),
    paid_out_credits INTEGER NOT NULL CHECK (paid_out_credits >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO market_instruments (code, display_name, exchange, category)
VALUES
    ('NIFTY50', 'NIFTY 50', 'NSE', 'INDEX'),
    ('SENSEX', 'SENSEX', 'BSE', 'INDEX'),
    ('BANKNIFTY', 'BANK NIFTY', 'NSE', 'INDEX'),
    ('NIFTYMIDCAP100', 'NIFTY MIDCAP 100', 'NSE', 'INDEX')
ON CONFLICT (code) DO NOTHING;

INSERT INTO market_price_snapshots (instrument_id, value, change_percent, observed_at)
SELECT id, value, change_percent, NOW()
FROM (
    VALUES
        ('NIFTY50', 24187.65::NUMERIC, 0.84::NUMERIC),
        ('SENSEX', 79432.18::NUMERIC, -0.31::NUMERIC),
        ('BANKNIFTY', 51843.25::NUMERIC, 1.12::NUMERIC),
        ('NIFTYMIDCAP100', 53291.40::NUMERIC, 0.55::NUMERIC)
) AS seed(code, value, change_percent)
JOIN market_instruments instrument ON instrument.code = seed.code
WHERE NOT EXISTS (
    SELECT 1 FROM market_price_snapshots snapshot
    WHERE snapshot.instrument_id = instrument.id
);

INSERT INTO demo_dashboard_contests (
    public_id, instrument_id, title, question, status, entry_credits,
    prize_pool_credits, player_capacity, player_count, opens_at, closes_at,
    settlement_source, display_order
)
SELECT
    seed.public_id, instrument.id, seed.title, seed.question, seed.status,
    seed.entry_credits, seed.prize_pool_credits, seed.player_capacity,
    seed.player_count, NOW() + seed.opens_in, NOW() + seed.closes_in,
    seed.settlement_source, seed.display_order
FROM (
    VALUES
        ('nifty-50', 'NIFTY50', 'NIFTY 50', 'Demo: will NIFTY 50 close above 24,200?', 'OPEN', 199, 100000, 10000, 8431, INTERVAL '-2 hours', INTERVAL '3 hours', 'Demo NSE reference', 10),
        ('sensex', 'SENSEX', 'SENSEX', 'Demo: will SENSEX remain above 79,500 at close?', 'LIVE', 299, 250000, 8000, 5902, INTERVAL '-1 hour', INTERVAL '1 hour', 'Demo BSE reference', 20),
        ('bank-nifty', 'BANKNIFTY', 'BANK NIFTY', 'Demo: will BANK NIFTY touch 52,000 today?', 'OPEN', 99, 50000, 5000, 3217, INTERVAL '-1 hour', INTERVAL '5 hours', 'Demo NSE reference', 30),
        ('nifty-midcap-100', 'NIFTYMIDCAP100', 'NIFTY MIDCAP 100', 'Demo: will NIFTY MIDCAP 100 gain 0.55% today?', 'SOON', 49, 20000, 3000, 1840, INTERVAL '3 hours', INTERVAL '6 hours', 'Demo NSE reference', 40)
) AS seed(
    public_id, instrument_code, title, question, status, entry_credits,
    prize_pool_credits, player_capacity, player_count, opens_in, closes_in,
    settlement_source, display_order
)
JOIN market_instruments instrument ON instrument.code = seed.instrument_code
ON CONFLICT (public_id) DO NOTHING;

INSERT INTO demo_dashboard_metrics (
    singleton, prize_pool_credits, live_players, paid_out_credits
)
VALUES (TRUE, 4950000, 23490, 21000000)
ON CONFLICT (singleton) DO NOTHING;
