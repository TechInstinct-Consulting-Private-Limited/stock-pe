-- A demo entry records the immutable prediction submitted at join time.
ALTER TABLE demo_contest_entries
    ADD COLUMN IF NOT EXISTS prediction_value NUMERIC(20, 4),
    ADD COLUMN IF NOT EXISTS reward_credits INTEGER NOT NULL DEFAULT 0 CHECK (reward_credits >= 0);

ALTER TABLE demo_dashboard_contests
    ADD COLUMN IF NOT EXISTS settlement_value NUMERIC(20, 4);

CREATE INDEX IF NOT EXISTS demo_contest_entries_contest_prediction_idx
    ON demo_contest_entries (contest_id, status, prediction_value);
