-- Create view_events table for view tracking
CREATE TABLE view_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
  created_date DATE GENERATED ALWAYS AS (viewed_at::date) STORED
);

-- Create indexes for efficient querying
CREATE INDEX idx_slug_date ON view_events(slug, created_date);
CREATE INDEX idx_created_date ON view_events(created_date);
CREATE INDEX idx_ip_hash ON view_events(ip_hash);

-- Enable Row Level Security
ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for client-side view recording)
CREATE POLICY "allow_anonymous_inserts"
ON view_events
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Deny anonymous selects (privacy - prevent exposure of view data)
CREATE POLICY "disallow_anonymous_selects"
ON view_events
FOR SELECT
TO anon
USING (false);

-- Policy: Allow service role full access (for cron job sync)
CREATE POLICY "service_role_full_access"
ON view_events
FOR ALL
TO service_role
USING (true);

-- Grant permissions
GRANT INSERT ON view_events TO anon;
GRANT SELECT, DELETE ON view_events TO service_role;
GRANT USAGE ON SEQUENCE view_events_id_seq TO service_role;
