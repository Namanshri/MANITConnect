-- Run this once in the Neon SQL editor before deploying the admin tools.
-- The approved default preserves access for all existing mentor accounts.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS mentor_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (mentor_status IN ('pending', 'approved', 'suspended', 'rejected'));

CREATE TABLE IF NOT EXISTS placement_alerts (
    alert_id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
    company TEXT, application_url TEXT,
    urgency TEXT NOT NULL DEFAULT 'new' CHECK (urgency IN ('new', 'update', 'urgent')),
    closes_at TIMESTAMPTZ, is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER REFERENCES users(user_id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_events (
    event_id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(user_id),
    item_type TEXT NOT NULL CHECK (item_type IN ('insight', 'experience', 'guidance')),
    item_id INTEGER NOT NULL, event_type TEXT NOT NULL CHECK (event_type IN ('view', 'bookmark')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS content_events_item_idx ON content_events (item_type, item_id, event_type);

-- Enables threaded community replies. Existing replies remain top-level.
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE;

-- Create an admin only for a MANIT-controlled, already registered account:
-- UPDATE users SET role = 'admin' WHERE email = 'administration@manit.ac.in';
