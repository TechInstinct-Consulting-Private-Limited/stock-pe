CREATE TABLE IF NOT EXISTS profile_tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutorial_key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    accent_color TEXT NOT NULL,
    background_color TEXT NOT NULL,
    youtube_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profile_tutorials_published_order_idx
    ON profile_tutorials (is_published, display_order, created_at);

INSERT INTO profile_tutorials
    (tutorial_key, title, description, icon_name, accent_color, background_color, display_order)
VALUES
    ('join-prediction', 'How to join a prediction', 'Choose an open contest, enter your prediction and confirm your Demo USDT entry.', 'rocket-outline', '#00A971', '#ECFDF5', 10),
    ('demo-usdt', 'How Demo USDT works', 'Understand simulated balances, contest entry fees and non-withdrawable rewards.', 'wallet-outline', '#2563EB', '#EFF6FF', 20),
    ('winners-rankings', 'How winners and rankings work', 'See how predictions are ranked after settlement and how shared prize ranks work.', 'trophy-outline', '#D97706', '#FFFBEB', 30),
    ('kyc', 'How KYC works', 'Follow the DigiLocker-based identity verification journey and understand its status.', 'shield-checkmark-outline', '#7C3AED', '#F5F3FF', 40),
    ('wallet-history', 'Wallet and transaction history', 'Review Demo USDT balance movements, contest entries, rewards and transaction records.', 'receipt-outline', '#0891B2', '#ECFEFF', 50)
ON CONFLICT (tutorial_key) DO NOTHING;
