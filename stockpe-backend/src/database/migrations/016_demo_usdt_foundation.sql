-- Separate simulated USDT from existing demo credits and real USDT ledgers.
-- Amounts are integer millionths of Demo USDT; no blockchain asset is created.
CREATE TABLE IF NOT EXISTS demo_usdt_accounts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
    available_atomic BIGINT NOT NULL DEFAULT 100000000 CHECK (available_atomic >= 0),
    reserved_atomic BIGINT NOT NULL DEFAULT 0 CHECK (reserved_atomic >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only contests explicitly registered here are Demo USDT contests. Existing
-- credit contests are not converted, renamed, or modified by this migration.
CREATE TABLE IF NOT EXISTS demo_usdt_contests (
    contest_id UUID PRIMARY KEY REFERENCES demo_dashboard_contests(id) ON DELETE RESTRICT,
    entry_atomic BIGINT NOT NULL CHECK (entry_atomic > 0),
    prize_pool_atomic BIGINT NOT NULL CHECK (prize_pool_atomic > 0)
);

CREATE TABLE IF NOT EXISTS demo_usdt_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    contest_id UUID REFERENCES demo_dashboard_contests(id) ON DELETE RESTRICT,
    entry_id UUID REFERENCES demo_contest_entries(id) ON DELETE RESTRICT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('WELCOME', 'ENTRY', 'REFUND', 'REWARD')),
    amount_atomic BIGINT NOT NULL CHECK (amount_atomic > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ((activity_type = 'WELCOME' AND contest_id IS NULL AND entry_id IS NULL)
        OR (activity_type <> 'WELCOME' AND contest_id IS NOT NULL AND entry_id IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS demo_usdt_activity_welcome_unique
    ON demo_usdt_activity(user_id) WHERE activity_type = 'WELCOME';
CREATE UNIQUE INDEX IF NOT EXISTS demo_usdt_activity_entry_type_unique
    ON demo_usdt_activity(entry_id, activity_type) WHERE entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS demo_usdt_activity_user_created_idx
    ON demo_usdt_activity(user_id, created_at DESC);
