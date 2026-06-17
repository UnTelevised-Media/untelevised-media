# Trending Articles Fix - Implementation Complete

## Problem
After updating to use Supabase for article view tracking, trending articles were not showing up because:
1. The `view_events` table didn't exist or had the wrong schema
2. View events weren't being recorded with `created_date` and `viewed_at` timestamps
3. IP addresses weren't being hashed before storage
4. TypeScript types didn't match the actual Supabase schema

## Changes Made

### 1. Fixed `src/lib/supabase/viewEvents.ts`
- Updated all table references from `view_count` to `view_events` (correct schema name)
- Added IP hashing using SHA-256 for privacy-preserving view recording
- Now properly sets `created_date` (YYYY-MM-DD) and `viewed_at` (ISO 8601 timestamp) when recording views
- Cleaned up ViewEvent interface to match actual table schema

### 2. Fixed `src/lib/supabase/client.ts`
- Updated TypeScript types to use correct table name `view_events`
- Simplified schema to match documented columns: id, slug, ip_hash, viewed_at, created_date
- Removed references to unnecessary fields (ip, city, state_province, country)

## What You Need to Do

### Step 1: Create the Supabase Table

In your Supabase SQL Editor, run this SQL:

```sql
-- Create view_events table
CREATE TABLE view_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  viewed_at TIMESTAMP DEFAULT NOW(),
  created_date DATE GENERATED ALWAYS AS (viewed_at::date) STORED
);

-- Create indexes for efficient queries
CREATE INDEX idx_slug_date ON view_events(slug, created_date);
CREATE INDEX idx_created_date ON view_events(created_date);
CREATE INDEX idx_ip_hash ON view_events(ip_hash);

-- Enable Row Level Security (RLS)
ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for recording views)
CREATE POLICY "allow_anonymous_inserts" 
ON view_events 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Policy: Deny anonymous selects (privacy)
CREATE POLICY "disallow_anonymous_selects" 
ON view_events 
FOR SELECT 
TO anon 
WITH CHECK (false);

-- Policy: Allow service role full access
CREATE POLICY "service_role_full_access" 
ON view_events 
FOR ALL 
TO service_role 
USING (true);

-- Grant permissions
GRANT INSERT ON view_events TO anon;
GRANT SELECT, DELETE ON view_events TO service_role;
GRANT USAGE ON SEQUENCE view_events_id_seq TO service_role;
```

### Step 2: Verify Environment Variables

Make sure these are set in `.env.local` and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only, never expose to client)

### Step 3: Test View Recording

1. Go to any article page
2. Open browser DevTools Console
3. Run:
```javascript
fetch('/api/view-queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slug: 'test-slug' })
}).then(r => r.json()).then(console.log)
```

Expected response: `{ "recorded": true }`

### Step 4: Verify Data in Supabase

In Supabase SQL Editor, verify views are being recorded:
```sql
SELECT * FROM view_events ORDER BY viewed_at DESC LIMIT 10;
```

### Step 5: Check Trending Articles

1. Visit your homepage or any article detail page
2. Look for the "Most Read" / "Trending" section
3. If articles with views show up, the fix is working!

## How It Works Now

1. **ViewPing component** (on article pages) fires a POST to `/api/view-queue` with the article slug
2. **View-queue endpoint** receives the request, extracts the IP, and calls `recordViewEvent`
3. **recordViewEvent** hashes the IP (privacy-preserving) and inserts into `view_events` table with:
   - slug: the article slug
   - ip_hash: SHA-256 hash of visitor IP
   - viewed_at: current ISO timestamp
   - created_date: current date (YYYY-MM-DD)
4. **TrendingSection component** calls `getTrendingArticles` from Supabase
5. **getTrendingArticles** queries the `view_events` table for the past 7 days, groups by slug, counts views, and returns top 31 articles
6. Trending articles are displayed on homepage and article detail pages

## Notes

- Views are tracked per IP hash (not per user), so the same visitor viewing multiple times counts each view
- `created_date` is generated automatically from `viewed_at` for efficient daily aggregation
- IP addresses are hashed with SHA-256, so they cannot be reversed to identify visitors
- The previous cron sync job (`/api/cron/sync-view-counts`) is now deprecated - trending articles are queried directly from Supabase
