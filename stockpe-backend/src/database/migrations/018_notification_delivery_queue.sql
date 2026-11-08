ALTER TABLE notification_deliveries
    ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS push_token_id UUID REFERENCES user_push_tokens(id) ON DELETE CASCADE;

ALTER TABLE notification_deliveries
    DROP CONSTRAINT IF EXISTS notification_deliveries_status_check;

ALTER TABLE notification_deliveries
    ADD CONSTRAINT notification_deliveries_status_check
    CHECK (status IN ('PENDING', 'PROCESSING', 'ACCEPTED', 'SENT', 'FAILED', 'SKIPPED'));

CREATE INDEX IF NOT EXISTS notification_deliveries_pending_push_idx
    ON notification_deliveries (channel, status, next_attempt_at, push_token_id, created_at)
    WHERE channel = 'PUSH';
