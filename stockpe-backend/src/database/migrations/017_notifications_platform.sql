ALTER TABLE profile_notifications
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'NORMAL',
    ADD COLUMN IF NOT EXISTS deep_link TEXT,
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profile_notifications_user_idempotency_idx
    ON profile_notifications (user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES profile_notifications(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('IN_APP', 'PUSH')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'SKIPPED')),
    provider_message_id TEXT,
    failure_reason TEXT,
    attempted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_deliveries_notification_idx
    ON notification_deliveries (notification_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL UNIQUE,
    platform TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    contest_push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    wallet_push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    system_push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO notification_templates (code, title_template, message_template, category)
VALUES
    ('CONTEST_CREATED', 'New contest scheduled', '{{title}} opens at {{opensAt}}.', 'CONTEST'),
    ('CONTEST_OPEN', 'Contest is open', '{{title}} is now accepting predictions.', 'CONTEST'),
    ('CONTEST_LIVE', 'Predictions are closed', '{{title}} is now live.', 'CONTEST'),
    ('CONTEST_SETTLED', 'Contest result is ready', '{{title}} has been settled. View your result.', 'CONTEST'),
    ('WALLET_REWARD', 'Demo USDT reward credited', '{{amount}} Demo USDT was credited to your demo balance.', 'WALLET')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS notification_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'SYSTEM',
    priority TEXT NOT NULL DEFAULT 'NORMAL',
    deep_link TEXT,
    audience TEXT NOT NULL DEFAULT 'ALL_VERIFIED_USERS',
    scheduled_for TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_campaign_recipients (
    campaign_id UUID NOT NULL REFERENCES notification_campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID NOT NULL REFERENCES profile_notifications(id) ON DELETE CASCADE,
    PRIMARY KEY (campaign_id, user_id)
);
