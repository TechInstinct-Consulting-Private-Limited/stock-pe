-- Keep the final rank with the immutable contest entry so that a user's
-- contest history remains auditable after automatic settlement.
ALTER TABLE demo_contest_entries
    ADD COLUMN IF NOT EXISTS settlement_rank INTEGER
    CHECK (settlement_rank IS NULL OR settlement_rank > 0);

CREATE INDEX IF NOT EXISTS demo_contest_entries_user_settlement_rank_idx
    ON demo_contest_entries (user_id, settlement_rank)
    WHERE settlement_rank IS NOT NULL;
