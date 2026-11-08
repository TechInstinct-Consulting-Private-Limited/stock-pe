ALTER TABLE demo_dashboard_contests
    ADD COLUMN IF NOT EXISTS prize_distribution JSONB NOT NULL DEFAULT '[
      {"label":"1st Place","startRank":1,"endRank":1,"percent":40},
      {"label":"2nd Place","startRank":2,"endRank":2,"percent":20},
      {"label":"3rd Place","startRank":3,"endRank":3,"percent":15},
      {"label":"Rank 4–5","startRank":4,"endRank":5,"percent":10},
      {"label":"Rank 6–10","startRank":6,"endRank":10,"percent":8},
      {"label":"Rank 11–50","startRank":11,"endRank":50,"percent":5},
      {"label":"Rank 51+","startRank":51,"endRank":100,"percent":2}
    ]'::jsonb;
