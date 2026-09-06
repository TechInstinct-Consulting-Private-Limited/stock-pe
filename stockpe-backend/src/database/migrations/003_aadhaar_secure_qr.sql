ALTER TABLE aadhaar_kyc_verifications
    ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE;
