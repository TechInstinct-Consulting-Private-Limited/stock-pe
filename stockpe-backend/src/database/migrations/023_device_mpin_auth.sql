CREATE TABLE IF NOT EXISTS user_auth_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    mpin_hash TEXT NOT NULL,
    failed_mpin_attempts SMALLINT NOT NULL DEFAULT 0 CHECK (failed_mpin_attempts >= 0),
    locked_until TIMESTAMPTZ,
    biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_authenticated_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, device_id)
);

CREATE INDEX IF NOT EXISTS user_auth_devices_active_lookup_idx
    ON user_auth_devices (device_id, user_id)
    WHERE revoked_at IS NULL;

ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT,
    ADD COLUMN IF NOT EXISTS refresh_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS device_id TEXT,
    ADD COLUMN IF NOT EXISTS refreshed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS sessions_refresh_token_hash_unique
    ON sessions (refresh_token_hash)
    WHERE refresh_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS sessions_refresh_lookup_idx
    ON sessions (refresh_token_hash, refresh_expires_at)
    WHERE revoked_at IS NULL AND refresh_token_hash IS NOT NULL;
