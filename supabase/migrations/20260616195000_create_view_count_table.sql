-- Create view_count table for tracking article views in untelevised-live
-- Stores individual view events with IP info and geolocation data
-- IP is encrypted at rest, geolocation populated daily by batch job

CREATE TABLE view_count (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL,
  ip TEXT,  -- Raw IP (encrypted), used for geolocation lookup before hashing
  ip_hash TEXT,  -- Hashed IP, NULL until batch job runs
  city TEXT,  -- NULL until batch job populates from IP
  state_province TEXT,  -- NULL until batch job populates from IP
  country TEXT,  -- NULL until batch job populates from IP
  viewed_at TIMESTAMP DEFAULT NOW(),
  created_date DATE GENERATED ALWAYS AS (viewed_at::date) STORED
);

-- Create indexes for efficient querying
CREATE INDEX idx_view_count_slug_date ON view_count(slug, created_date);
CREATE INDEX idx_view_count_created_date ON view_count(created_date);
CREATE INDEX idx_view_count_ip_hash ON view_count(ip_hash);
CREATE INDEX idx_view_count_country ON view_count(country);

-- Enable Row Level Security
ALTER TABLE view_count ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (ViewPing sends views client-side)
CREATE POLICY "allow_anonymous_inserts"
ON view_count
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Deny anonymous selects (privacy - prevent exposure of view data)
CREATE POLICY "disallow_anonymous_selects"
ON view_count
FOR SELECT
TO anon
USING (false);

-- Policy: Allow service role full access (for batch geolocation job and analytics)
CREATE POLICY "service_role_full_access"
ON view_count
FOR ALL
TO service_role
USING (true);

-- Grant permissions
GRANT INSERT ON view_count TO anon;
GRANT SELECT, UPDATE, DELETE ON view_count TO service_role;
GRANT USAGE ON SEQUENCE view_count_id_seq TO service_role;
