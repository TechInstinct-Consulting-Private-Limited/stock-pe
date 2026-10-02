-- Demo-only contest credits. This ledger is intentionally separate from USDT wallets.
CREATE TABLE IF NOT EXISTS demo_credit_accounts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available_credits INTEGER NOT NULL DEFAULT 1000 CHECK (available_credits >= 0),
    reserved_credits INTEGER NOT NULL DEFAULT 0 CHECK (reserved_credits >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_contest_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES demo_dashboard_contests(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WON', 'LOST', 'CANCELLED')),
    entry_credits INTEGER NOT NULL CHECK (entry_credits > 0),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMPTZ,
    UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS demo_contest_entries_user_status_idx
    ON demo_contest_entries (user_id, status, joined_at DESC);

CREATE TABLE IF NOT EXISTS demo_credit_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES demo_contest_entries(id) ON DELETE RESTRICT,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('WELCOME_CREDIT', 'CONTEST_RESERVED', 'CONTEST_RELEASED', 'CONTEST_REWARD')),
    amount_credits INTEGER NOT NULL CHECK (amount_credits > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
