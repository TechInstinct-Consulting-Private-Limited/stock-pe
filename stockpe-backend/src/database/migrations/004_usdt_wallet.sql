CREATE TABLE IF NOT EXISTS usdt_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    network TEXT NOT NULL CHECK (network IN ('TRC20', 'ERC20', 'BEP20')),
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS usdt_wallets_one_per_user_idx
    ON usdt_wallets (user_id);
