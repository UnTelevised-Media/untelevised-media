-- View count tracking table for untelevised-live
-- Replaces Sanity viewCount API calls with local view event tracking
-- RLS: anon users can INSERT views, service_role has full access for analytics

-- Create table
CREATE TABLE IF NOT EXISTS public.view_count (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL,
  ip TEXT,  -- Raw IP (encrypted at rest), NULL after geolocation batch job
  ip_hash TEXT,  -- SHA256 hash of IP, NULL until batch job processes
  city TEXT,  -- NULL until batch job populates from geoip-lite
  state_province TEXT,  -- NULL until batch job populates from geoip-lite
  country TEXT,  -- NULL until batch job populates from geoip-lite
  viewed_at TIMESTAMP DEFAULT NOW(),
  created_date DATE GENERATED ALWAYS AS (viewed_at::date) STORED
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_view_count_slug_date ON public.view_count(slug, created_date);
CREATE INDEX IF NOT EXISTS idx_view_count_created_date ON public.view_count(created_date);
CREATE INDEX IF NOT EXISTS idx_view_count_ip_hash ON public.view_count(ip_hash);
CREATE INDEX IF NOT EXISTS idx_view_count_country ON public.view_count(country);

-- Enable Row Level Security
ALTER TABLE public.view_count ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to INSERT view events (from ViewPing component)
-- This is safe because: (1) inserts only, no reads/deletes, (2) limited by RLS, (3) no sensitive data exposed
DROP POLICY IF EXISTS "allow_anonymous_inserts" ON public.view_count;
CREATE POLICY "allow_anonymous_inserts"
ON public.view_count
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Deny anonymous users from reading view data
-- Prevents exposure of raw IP, geolocation, or view patterns to unauthorized users
DROP POLICY IF EXISTS "disallow_anonymous_selects" ON public.view_count;
CREATE POLICY "disallow_anonymous_selects"
ON public.view_count
FOR SELECT
TO anon
USING (false);

-- Policy: Allow service_role full access for batch jobs and analytics
-- Used by: batch geolocation cron, view aggregation, trending calculations
DROP POLICY IF EXISTS "service_role_full_access" ON public.view_count;
CREATE POLICY "service_role_full_access"
ON public.view_count
FOR ALL
TO service_role
USING (true);

-- Grant minimal required permissions
GRANT INSERT ON public.view_count TO anon;
GRANT SELECT, UPDATE, DELETE ON public.view_count TO service_role;
GRANT USAGE ON SEQUENCE public.view_count_id_seq TO service_role;

-- Verify table creation
SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name='view_count') as column_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'view_count';
