-- Run once in Neon. A journey represents a specific offer, so compensation
-- and CGPA belong on experiences rather than the mentor profile.
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS stipend_monthly NUMERIC;
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS offer_cgpa NUMERIC;
