-- Prediction contests accept any positive closing value. Ensure that no
-- unused per-contest range fields remain in any environment.
ALTER TABLE demo_dashboard_contests
    DROP CONSTRAINT IF EXISTS demo_dashboard_contests_prediction_rules_check;

ALTER TABLE demo_dashboard_contests
    DROP COLUMN IF EXISTS prediction_min,
    DROP COLUMN IF EXISTS prediction_max,
    DROP COLUMN IF EXISTS prediction_step;
