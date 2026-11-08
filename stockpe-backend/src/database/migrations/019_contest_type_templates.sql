-- Business meaning for scheduled contest times. Existing records remain safe
-- because they are classified as CUSTOM instead of guessing from timestamps.
ALTER TABLE demo_dashboard_contests
    ADD COLUMN IF NOT EXISTS contest_type TEXT NOT NULL DEFAULT 'CUSTOM';

ALTER TABLE demo_dashboard_contests
    DROP CONSTRAINT IF EXISTS demo_dashboard_contests_contest_type_check;

ALTER TABLE demo_dashboard_contests
    ADD CONSTRAINT demo_dashboard_contests_contest_type_check
    CHECK (contest_type IN ('CUSTOM', 'DAY_OPEN', 'ONE_HOUR', 'MIDDAY', 'CLOSING', 'NEXT_DAY_CLOSE'));

CREATE INDEX IF NOT EXISTS demo_dashboard_contests_contest_type_idx
    ON demo_dashboard_contests (contest_type, status, opens_at);
