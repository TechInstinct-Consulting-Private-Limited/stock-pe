CREATE TABLE IF NOT EXISTS contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    instrument_code VARCHAR(100) NOT NULL,
    entry_credits NUMERIC(14, 2) NOT NULL DEFAULT 0,
    prize_pool_credits NUMERIC(14, 2) NOT NULL DEFAULT 0,
    player_capacity INTEGER NOT NULL DEFAULT 100,
    player_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SOON', 'OPEN', 'LIVE', 'CLOSED', 'SETTLED', 'CANCELLED')),
    opens_at TIMESTAMPTZ NOT NULL,
    closes_at TIMESTAMPTZ NOT NULL,
    settlement_source VARCHAR(255) NOT NULL DEFAULT 'Market Reference',
    closing_value NUMERIC(14, 2),
    settlement_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contests_status_idx ON contests(status);
CREATE INDEX IF NOT EXISTS contests_closes_at_idx ON contests(closes_at);
