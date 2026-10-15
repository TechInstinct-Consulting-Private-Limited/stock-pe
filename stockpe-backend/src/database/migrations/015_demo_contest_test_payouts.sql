-- Review-only payout workflow for settled demo contests.
-- These records never credit a USDT ledger and never send a blockchain transfer.
-- A production provider adapter and approved commercial rules are required before
-- any real payout capability may be introduced.

CREATE TABLE IF NOT EXISTS demo_contest_test_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES demo_dashboard_contests(id) ON DELETE RESTRICT,
    contest_entry_id UUID NOT NULL UNIQUE REFERENCES demo_contest_entries(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    usdt_wallet_id UUID NOT NULL REFERENCES usdt_wallets(id) ON DELETE RESTRICT,
    network TEXT NOT NULL DEFAULT 'TRC20' CHECK (network = 'TRC20'),
    amount_usdt NUMERIC(30, 6) NOT NULL CHECK (amount_usdt > 0),
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN (
        'PENDING_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED', 'FAILED'
    )),
    created_by_admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewed_by_admin_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    review_note TEXT,
    simulated_transfer_id TEXT UNIQUE,
    simulated_tx_hash TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_contest_test_payouts_status_idx
    ON demo_contest_test_payouts (status, created_at DESC);

CREATE INDEX IF NOT EXISTS demo_contest_test_payouts_user_idx
    ON demo_contest_test_payouts (user_id, created_at DESC);
