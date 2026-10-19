-- Migration 006: USDT Wallets Ledger, Deposits and Transactions

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    balance_usdt NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    deposit_balance_usdt NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    winnings_balance_usdt NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    bonus_balance_usdt NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    locked_balance_usdt NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crypto_deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id VARCHAR(100) NOT NULL UNIQUE,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    price_amount NUMERIC(14, 4) NOT NULL,
    price_currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    pay_amount NUMERIC(18, 8) NOT NULL,
    pay_currency VARCHAR(20) NOT NULL,
    pay_address TEXT NOT NULL,
    network VARCHAR(30) NOT NULL DEFAULT 'TRC20',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'waiting',
    actually_paid NUMERIC(18, 8) NOT NULL DEFAULT 0,
    purchase_id VARCHAR(100),
    ipn_received BOOLEAN NOT NULL DEFAULT FALSE,
    is_sandbox BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crypto_deposits_user_id_idx ON crypto_deposits(user_id);
CREATE INDEX IF NOT EXISTS crypto_deposits_payment_id_idx ON crypto_deposits(payment_id);
CREATE INDEX IF NOT EXISTS crypto_deposits_status_idx ON crypto_deposits(payment_status);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    category VARCHAR(30) NOT NULL CHECK (category IN ('DEPOSITS', 'WITHDRAWALS', 'CONTESTS', 'BONUS', 'REFUND')),
    amount_usdt NUMERIC(14, 4) NOT NULL,
    amount_inr NUMERIC(14, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    ref_id VARCHAR(100),
    payment_id VARCHAR(100),
    payment_method VARCHAR(50),
    description TEXT,
    tx_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wallet_transactions_user_id_idx ON wallet_transactions(user_id, created_at DESC);
