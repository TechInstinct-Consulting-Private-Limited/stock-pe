ALTER TABLE aadhaar_kyc_verifications
    ALTER COLUMN aadhaar_last_four DROP NOT NULL;

ALTER TABLE aadhaar_kyc_verifications
    DROP CONSTRAINT IF EXISTS aadhaar_kyc_verifications_status_check;

ALTER TABLE aadhaar_kyc_verifications
    ADD CONSTRAINT aadhaar_kyc_verifications_status_check
    CHECK (status IN ('otp_sent', 'consent_pending', 'verified', 'failed', 'expired'));

CREATE INDEX IF NOT EXISTS aadhaar_kyc_provider_transaction_idx
    ON aadhaar_kyc_verifications (provider, provider_transaction_id);
