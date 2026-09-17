-- Run once in the Neon SQL Editor before deploying the Firebase auth change.
-- Existing accounts stay on the legacy login path; new accounts are bound to
-- their Firebase UID and must use Firebase-verified login.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;
