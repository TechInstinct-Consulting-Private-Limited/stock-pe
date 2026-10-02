-- Phase 1 only: provider-neutral accounting and operational records.
-- These tables do not create deposit addresses, broadcast transactions, or move funds.

CREATE TABLE IF NOT EXISTS wallet_ledger_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL CHECK (account_type IN (
        'USER_AVAILABLE',
        'USER_RESERVED',
        'PLATFORM_DEPOSIT_CLEARING',
        'PLATFORM_WITHDRAWAL_CLEARING'
    )),
    asset_symbol TEXT NOT NULL CHECK (asset_symbol = 'USDT'),
    network TEXT NOT NULL CHECK (network = 'TRC20'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT wallet_ledger_account_owner_check CHECK (
        (account_type IN ('USER_AVAILABLE', 'USER_RESERVED') AND user_id IS NOT NULL)
        OR
        (account_type IN ('PLATFORM_DEPOSIT_CLEARING', 'PLATFORM_WITHDRAWAL_CLEARING') AND user_id IS NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS wallet_ledger_user_account_unique_idx
    ON wallet_ledger_accounts (user_id, account_type, asset_symbol, network)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS wallet_ledger_platform_account_unique_idx
    ON wallet_ledger_accounts (account_type, asset_symbol, network)
    WHERE user_id IS NULL;

CREATE TABLE IF NOT EXISTS wallet_ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_type TEXT NOT NULL CHECK (reference_type IN (
        'DEPOSIT',
        'WITHDRAWAL',
        'CONTEST_ENTRY',
        'WINNING',
        'REVERSAL'
    )),
    reference_id TEXT NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'POSTED' CHECK (status IN ('POSTED', 'REVERSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wallet_ledger_transactions_reference_idx
    ON wallet_ledger_transactions (reference_type, reference_id);

CREATE TABLE IF NOT EXISTS wallet_ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_transaction_id UUID NOT NULL REFERENCES wallet_ledger_transactions(id) ON DELETE RESTRICT,
    ledger_account_id UUID NOT NULL REFERENCES wallet_ledger_accounts(id) ON DELETE RESTRICT,
    direction TEXT NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    amount_usdt NUMERIC(30, 6) NOT NULL CHECK (amount_usdt > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wallet_ledger_entries_transaction_idx
    ON wallet_ledger_entries (ledger_transaction_id);

CREATE INDEX IF NOT EXISTS wallet_ledger_entries_account_idx
    ON wallet_ledger_entries (ledger_account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS deposit_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_key TEXT NOT NULL,
    provider_address_id TEXT,
    network TEXT NOT NULL CHECK (network = 'TRC20'),
    address TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RETIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retired_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS deposit_addresses_provider_id_unique_idx
    ON deposit_addresses (provider_key, provider_address_id)
    WHERE provider_address_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS deposit_addresses_user_active_idx
    ON deposit_addresses (user_id, created_at DESC)
    WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    deposit_address_id UUID NOT NULL REFERENCES deposit_addresses(id) ON DELETE RESTRICT,
    provider_key TEXT NOT NULL,
    provider_transaction_id TEXT,
    tx_hash TEXT,
    network TEXT NOT NULL CHECK (network = 'TRC20'),
    asset_symbol TEXT NOT NULL CHECK (asset_symbol = 'USDT'),
    amount_usdt NUMERIC(30, 6) NOT NULL CHECK (amount_usdt > 0),
    confirmations INTEGER NOT NULL DEFAULT 0 CHECK (confirmations >= 0),
    required_confirmations INTEGER NOT NULL CHECK (required_confirmations > 0),
    status TEXT NOT NULL CHECK (status IN ('DETECTED', 'CONFIRMING', 'CONFIRMED', 'CREDITED', 'FAILED')),
    credited_ledger_transaction_id UUID REFERENCES wallet_ledger_transactions(id) ON DELETE RESTRICT,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    credited_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS deposits_network_tx_hash_unique_idx
    ON deposits (network, tx_hash)
    WHERE tx_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS deposits_provider_transaction_unique_idx
    ON deposits (provider_key, provider_transaction_id)
    WHERE provider_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    usdt_wallet_id UUID NOT NULL REFERENCES usdt_wallets(id) ON DELETE RESTRICT,
    provider_key TEXT,
    provider_transfer_id TEXT,
    idempotency_key TEXT NOT NULL UNIQUE,
    network TEXT NOT NULL CHECK (network = 'TRC20'),
    asset_symbol TEXT NOT NULL CHECK (asset_symbol = 'USDT'),
    amount_usdt NUMERIC(30, 6) NOT NULL CHECK (amount_usdt > 0),
    fee_usdt NUMERIC(30, 6) NOT NULL DEFAULT 0 CHECK (fee_usdt >= 0),
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED', 'SCREENING', 'APPROVED', 'SUBMITTED', 'CONFIRMING',
        'COMPLETED', 'REJECTED', 'FAILED', 'CANCELLED'
    )),
    reserved_ledger_transaction_id UUID REFERENCES wallet_ledger_transactions(id) ON DELETE RESTRICT,
    completed_ledger_transaction_id UUID REFERENCES wallet_ledger_transactions(id) ON DELETE RESTRICT,
    tx_hash TEXT,
    failure_reason TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS withdrawals_provider_transfer_unique_idx
    ON withdrawals (provider_key, provider_transfer_id)
    WHERE provider_transfer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS provider_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_key TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature_valid BOOLEAN,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processing_error TEXT,
    UNIQUE (provider_key, provider_event_id)
);

CREATE TABLE IF NOT EXISTS wallet_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('USER', 'SYSTEM', 'ADMIN', 'PROVIDER')),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wallet_audit_logs_entity_idx
    ON wallet_audit_logs (entity_type, entity_id, created_at DESC);
