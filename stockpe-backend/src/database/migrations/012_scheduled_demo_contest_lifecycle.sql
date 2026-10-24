-- Scheduled demo lifecycle. Existing contests remain MANUAL unless an admin
-- explicitly creates or updates a contest as SCHEDULED.

ALTER TABLE demo_dashboard_contests
    ADD COLUMN IF NOT EXISTS lifecycle_mode TEXT NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN IF NOT EXISTS live_at TIMESTAMPTZ;

ALTER TABLE demo_dashboard_contests
    DROP CONSTRAINT IF EXISTS demo_dashboard_contests_lifecycle_mode_check;

ALTER TABLE demo_dashboard_contests
    ADD CONSTRAINT demo_dashboard_contests_lifecycle_mode_check
    CHECK (lifecycle_mode IN ('MANUAL', 'SCHEDULED'));

ALTER TABLE demo_dashboard_contests
    DROP CONSTRAINT IF EXISTS demo_dashboard_contests_scheduled_timing_check;

ALTER TABLE demo_dashboard_contests
    ADD CONSTRAINT demo_dashboard_contests_scheduled_timing_check
    CHECK (
        lifecycle_mode = 'MANUAL'
        OR (live_at IS NOT NULL AND opens_at < live_at AND live_at < closes_at)
    );

CREATE INDEX IF NOT EXISTS demo_dashboard_contests_scheduled_lifecycle_idx
    ON demo_dashboard_contests (status, opens_at, live_at, closes_at)
    WHERE lifecycle_mode = 'SCHEDULED';

CREATE TABLE IF NOT EXISTS demo_contest_lifecycle_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES demo_dashboard_contests(id) ON DELETE RESTRICT,
    previous_status TEXT NOT NULL,
    next_status TEXT NOT NULL,
    trigger_source TEXT NOT NULL CHECK (trigger_source IN ('SCHEDULER')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_contest_lifecycle_events_contest_idx
    ON demo_contest_lifecycle_events (contest_id, occurred_at DESC);
