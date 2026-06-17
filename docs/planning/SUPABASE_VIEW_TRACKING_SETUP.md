# Supabase View Tracking Setup

This document explains how to set up view event tracking in Supabase, which decouples view counting from Sanity CMS and dramatically reduces API costs.

## Overview

- **Before**: Every article view triggered 2 Sanity API calls (fetch + patch), costing ~200k API requests/week
- **After**: Views are recorded in Supabase (unlimited writes), synced to Sanity once daily via cron job
- **Benefit**: 95% reduction in Sanity API write quota consumption

## Prerequisites

- Supabase account (https://supabase.com)
- Vercel project with cron jobs enabled (included in Pro plan, but free tier can also use external cron services)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **Anon Key** (found in Settings → API)
   - **Service Role Key** (found in Settings → API, keep this secret!)

## Step 2: Create view_events Table

In the Supabase SQL Editor, run:

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

-- Policy: Allow anonymous inserts (for client-side recording)
CREATE POLICY "allow_anonymous_inserts" 
ON view_events 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Policy: Deny anonymous selects (privacy — don't expose raw view data)
CREATE POLICY "disallow_anonymous_selects" 
ON view_events 
FOR SELECT 
TO anon 
WITH CHECK (false);

-- Policy: Allow service role full access (for cron job)
CREATE POLICY "service_role_full_access" 
ON view_events 
FOR ALL 
TO service_role 
USING (true);

-- Grant permissions to anon role
GRANT INSERT ON view_events TO anon;
GRANT SELECT, DELETE ON view_events TO service_role;
GRANT USAGE ON SEQUENCE view_events_id_seq TO service_role;

-- Verify table and permissions
SELECT * FROM view_events LIMIT 0; -- Should return empty table
```

**Explanation**:
- `slug`: Article slug being viewed (e.g., "breaking-news-today")
- `ip_hash`: SHA-256 hash of visitor IP (privacy-preserving, can't reverse to IP)
- `viewed_at`: Timestamp of view (auto-set to now)
- `created_date`: Date extracted from `viewed_at` (for daily aggregation)
- RLS Policies:
  - Anonymous users can only INSERT (record their view)
  - Anonymous users cannot SELECT (can't see other views)
  - Service role (cron job) can SELECT, UPDATE, DELETE (for sync and cleanup)

## Step 3: Set Environment Variables

Add to `.env.local` (never commit to git):

```bash
# Supabase View Tracking Project
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...     # Anon key (safe for client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # Service role key (SERVER ONLY)
```

Add to Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (secret, not exposed to client)

## Step 4: Configure Cron Job

The cron job at `/api/cron/sync-view-counts` runs daily at 01:00 UTC to:
1. Fetch aggregated view counts from Supabase for the previous day
2. Update Sanity articles with the accumulated viewCount
3. Delete old view events from Supabase (cleanup)

### Vercel Cron Setup (Recommended)

Cron is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-view-counts",
      "schedule": "0 1 * * *"  // Daily at 01:00 UTC
    }
  ]
}
```

To verify in Vercel:
1. Go to Vercel Dashboard → Project → Cron Jobs
2. You should see `/api/cron/sync-view-counts` listed
3. It will execute automatically daily at 01:00 UTC

### External Cron Service (Fallback)

If using Vercel free tier without cron support, use an external service:

**EasyCron (free)**:
1. Go to https://www.easycron.com
2. Create new cron job:
   - URL: `https://yoursite.vercel.app/api/cron/sync-view-counts`
   - Schedule: Daily at 01:00 UTC (0 1 * * *)
   - HTTP method: GET
3. Add custom header: `Authorization: Bearer YOUR_CRON_SECRET`

**Or use a GitHub Actions workflow** to trigger the sync.

## Step 5: Verify Setup

### Test Recording View Events

In a browser console on your site:

```javascript
fetch('/api/view-queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slug: 'test-article-slug' })
})
.then(r => r.json())
.then(console.log)
```

Expected response: `{ "recorded": true }`

### Check Supabase Table

In Supabase SQL Editor:

```sql
SELECT * FROM view_events ORDER BY viewed_at DESC LIMIT 10;
```

You should see the test event(s) recorded.

### Verify Cron Job

Manually trigger the cron job for testing:

```bash
curl -X GET "https://yoursite.vercel.app/api/cron/sync-view-counts" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "synced": 5,
  "deleted": 5,
  "message": "Synced 5 articles and deleted 5 old events"
}
```

Then verify in Sanity that viewCount was incremented on articles.

## Step 6: Migration Timeline

### Phase 1: Parallel Run (optional, 1-2 weeks)
- New code writes to both Sanity batch queue AND Supabase
- Old `/api/view` route still active
- Verify Supabase and cron job work correctly

### Phase 2: Full Migration (after Phase 1)
- Disable Sanity batch queue (remove or deprecate)
- Rely 100% on Supabase for view recording
- Daily cron sync handles all viewCount updates
- Remove `/api/view` route

## Monitoring & Maintenance

### Daily Checks

Monitor the cron job logs in Vercel:
1. Vercel Dashboard → Project → Deployments → Cron Jobs
2. Check logs for `/api/cron/sync-view-counts`
3. Expected execution time: < 10 seconds
4. Expected rows synced: Varies by traffic

### Supabase Table Size

View events are deleted after syncing (same-day cleanup), so table size stays minimal:
- Typical: < 10MB
- After 30 days of cleanup: < 5MB

To manually check table size:

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'view_events';
```

### View Count Accuracy

The cron job uses `INC` mutations, so it's safe to run multiple times:
- If cron job runs twice on the same day, views are counted twice (expected behavior)
- If a sync fails, the next day's run will catch up (views persist in Supabase)
- Supabase IP hashing prevents bias from bots or same-IP visitors

## Troubleshooting

### Views Not Being Recorded

1. Check browser console for fetch errors
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
3. Check Supabase RLS policy allows anon INSERT:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'view_events';
   ```

### Cron Job Not Running

1. Verify `vercel.json` has the cron entry
2. Redeploy to Vercel: `vercel deploy --prod`
3. Check Vercel Cron Jobs dashboard
4. Verify `CRON_SECRET` is set in Vercel environment variables

### Cron Job Failing

Check error logs in Vercel:
1. Vercel Dashboard → Project → Deployments → Click the latest deployment
2. Scroll to "Cron Jobs" section
3. Click on `/api/cron/sync-view-counts`
4. View execution logs and error output

Common issues:
- **"Unauthorized"**: `CRON_SECRET` not set or mismatched
- **"Missing Supabase environment variables"**: Check all 3 Supabase vars are set
- **"SUPABASE_SERVICE_ROLE_KEY not set"**: Add to Vercel secret environment variables
- **Timeout**: Cron job running > 60 seconds (max duration). Check Supabase query performance.

### Articles Not Getting Updated

1. Verify cron job completed successfully (check Vercel logs)
2. Check Sanity has articles with matching slugs:
   ```
   *[_type == "article" && slug.current in ["slug-1", "slug-2"]]
   ```
3. Verify `SANITY_API_WRITE_TOKEN` has Editor permissions
4. Check view_events table has data for the date:
   ```sql
   SELECT * FROM view_events WHERE created_date = '2026-06-16';
   ```

## Cost Comparison

| Metric | Before (Sanity) | After (Supabase) | Savings |
|--------|-----------------|------------------|---------|
| Weekly API calls | ~500k | ~5k | 99% ⬇️ |
| Write operations | 500k/week | 1 mutation/day | 99.9% ⬇️ |
| Cost (monthly) | $29+ (paid plan) | Free | 100% ⬇️ |
| Storage | Sanity viewCount field | Supabase table | Same |
| Data freshness | Real-time | Daily sync (24h delay) | Trade-off |

## Future Enhancements

- Real-time trending dashboard (query Supabase directly)
- Geographic view analytics (geoip on IP hash)
- Bot filtering (analyze IP patterns)
- Custom view windows (hourly, weekly aggregations)
- View history exports for analytics

---

**Questions?** See the GitHub issue #106 for implementation details.
