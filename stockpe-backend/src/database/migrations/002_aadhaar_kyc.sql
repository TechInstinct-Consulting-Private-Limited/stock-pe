CREATE TABLE IF NOT EXISTS aadhaar_kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_transaction_id TEXT NOT NULL,
    aadhaar_last_four CHAR(4) NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('otp_sent', 'verified', 'failed', 'expired')
    ),
    attempts SMALLINT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    consent_given_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS aadhaar_kyc_user_created_idx
    ON aadhaar_kyc_verifications (user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS aadhaar_kyc_one_verified_per_user_idx
    ON aadhaar_kyc_verifications (user_id)
    WHERE status = 'verified';
