-- Phase 1 admin management. Every amount remains non-withdrawable demo credits.

CREATE TABLE IF NOT EXISTS admin_accounts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'OPERATIONS_ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_idx
    ON admin_audit_logs (entity_type, entity_id, created_at DESC);

ALTER TABLE demo_dashboard_contests
    DROP CONSTRAINT IF EXISTS demo_dashboard_contests_status_check;

ALTER TABLE demo_dashboard_contests
    ADD CONSTRAINT demo_dashboard_contests_status_check
    CHECK (status IN ('DRAFT', 'SOON', 'OPEN', 'LIVE', 'CLOSED', 'SETTLED', 'CANCELLED'));

ALTER TABLE demo_dashboard_contests
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_reason TEXT,
    ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS settlement_notes TEXT;
