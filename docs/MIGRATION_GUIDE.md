# ViewCount Migration: Sanity to Supabase

This guide walks you through migrating all existing viewCount data from Sanity to Supabase.

## Overview

We're moving from Sanity-based view tracking (expensive API calls) to Supabase-based tracking (unlimited writes). This migration preserves all historical viewCount data by creating synthetic view events in Supabase that aggregate to the same totals.

## Prerequisites

✅ **Before you start, ensure:**
- Node.js 18+ installed
- Supabase project created (https://supabase.com)
- Environment variables configured locally
- No active production deploys

## Step 1: Create Supabase Project

### 1a. Go to Supabase
1. Visit https://supabase.com
2. Click "New project"
3. Select your organization
4. Name it: `untelevised-view-tracking` (or similar)
5. Create database password (save it!)
6. Click "Create new project" and wait 2-3 minutes

### 1b. Get Your Credentials
1. Go to Settings → API
2. Note down:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

## Step 2: Create Database Table & Policies

### 2a. Run SQL Migration
1. In Supabase Dashboard, go to SQL Editor
2. Click "New query"
3. Paste the entire SQL block from Step 2b below
4. Click "Run"

### 2b. SQL Migration Script
Copy and paste this entire block into Supabase SQL Editor:

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

-- Policy: Deny anonymous selects (privacy)
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

-- Grant permissions
GRANT INSERT ON view_events TO anon;
GRANT SELECT, DELETE ON view_events TO service_role;
GRANT USAGE ON SEQUENCE view_events_id_seq TO service_role;

-- Verify table created
SELECT COUNT(*) FROM view_events;
```

**Expected output**: `count: 0` (empty table, ready for migration)

## Step 3: Set Up Environment Variables

### 3a. Local Development (`.env.local`)

```bash
# Supabase View Tracking
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3b. Verify Connection

```bash
# Test that env vars are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

All three should output values (not empty).

## Step 4: Run Migration Script

### 4a. Execute Migration

```bash
# From project root
npx ts-node scripts/migrate-view-counts.ts
```

### 4b. Expected Output

```
🚀 Starting viewCount migration from Sanity to Supabase...

📖 Fetching articles from Sanity...
✓ Found 450 articles in Sanity

📊 Articles with viewCount: 380
📊 Total views to migrate: 125,430

📥 Inserting view events into Supabase...
  ✓ breaking-news-today: 1,250 views
  ✓ climate-crisis-update: 890 views
  ✓ local-politics-roundup: 745 views
  ... (more articles)

✅ Migration complete!
  📥 Inserted: 125,430 view events
  ⚠️  Skipped: 0 view events

🔍 Verifying migration...
✓ Total view events in Supabase: 125,430

📋 Sample view counts (top 5 by slug):
  breaking-news-today: 1,250 views
  climate-crisis-update: 890 views
  local-politics-roundup: 745 views
  investigation-exclusive: 680 views
  weekly-roundup-52: 620 views

🎉 Migration successful! Next steps:
  1. Verify viewCount data is correct in Supabase
  2. Deploy the code changes to production
  3. Monitor the /api/cron/sync-view-counts job
  4. Verify Sanity viewCount gets updated
```

## Step 5: Verify Migration in Supabase

### 5a. Check Table Contents

```sql
-- Run in Supabase SQL Editor

-- Count total views
SELECT COUNT(*) as total_views FROM view_events;

-- Check articles with views
SELECT slug, COUNT(*) as view_count 
FROM view_events 
GROUP BY slug 
ORDER BY view_count DESC 
LIMIT 10;

-- Check date distribution
SELECT created_date, COUNT(*) as views
FROM view_events
GROUP BY created_date
ORDER BY created_date DESC
LIMIT 7;
```

**Expected results**:
- `total_views` should match your original viewCount total
- Top slugs should have reasonable view counts
- Dates should be spread across past 30 days

### 5b. Sample Queries in Browser

```javascript
// Open browser console on your site

// Test 1: Verify data exists
const { data } = await fetch('https://supabase-url/rest/v1/view_events?select=count()').then(r => r.json());
console.log('Total views:', data[0].count);

// Test 2: Check table structure
const { data: schema } = await fetch('https://supabase-url/rest/v1/').then(r => r.json());
console.log('Tables:', schema);
```

## Step 6: Deploy Code Changes

### 6a. Push to Production

```bash
# Make sure all changes are committed
git status  # Should be clean

# Switch to main
git checkout main
git pull origin main

# Merge feature branch
git merge fix/usage-optimization-critical

# Push to Vercel
git push origin main
```

### 6b. Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add three variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (public)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret)
3. Values should match your Supabase project

### 6c. Redeploy

```bash
# In Vercel Dashboard, click "Redeploy" on the latest commit
# Or use CLI:
vercel --prod
```

## Step 7: Verify Production Deployment

### 7a. Test View Recording

```bash
curl -X POST https://yoursite.vercel.app/api/view-queue \
  -H "Content-Type: application/json" \
  -d '{"slug": "test-article"}'
```

**Expected response**: `{"recorded": true}`

### 7b. Check Supabase for New Event

```sql
-- In Supabase SQL Editor
SELECT * FROM view_events 
WHERE slug = 'test-article' 
ORDER BY viewed_at DESC 
LIMIT 1;
```

**Expected**: One row with recent timestamp

### 7c. Wait for Cron Job

The daily sync runs at **01:00 UTC**. To test immediately:

```bash
# Manually trigger cron (within 24 hours of deployment)
curl -X GET https://yoursite.vercel.app/api/cron/sync-view-counts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Expected response**:
```json
{
  "synced": 1,
  "deleted": 1,
  "message": "Synced 1 articles and deleted 1 old events"
}
```

### 7d. Verify Sanity Updated

1. Go to Sanity Studio → Articles
2. Find an article (e.g., "test-article")
3. Check the `viewCount` field
4. It should have incremented by 1

## Step 8: Monitor for 24 Hours

### Checklist
- [ ] Cron job ran successfully (check Vercel logs)
- [ ] Sanity viewCounts are being updated
- [ ] No errors in Vercel Function logs
- [ ] Supabase table is growing (new views being recorded)
- [ ] API quota in Sanity is decreasing

### Commands to Monitor

```bash
# Check recent Supabase events
curl "https://xxxx.supabase.co/rest/v1/view_events?select=*&order=viewed_at.desc&limit=10" \
  -H "apikey: YOUR_ANON_KEY"

# Check Sanity API usage
# Go to: sanity.io/manage > API > Usage tab
# Should see dramatic decrease in API calls

# Check Vercel metrics
# Go to: vercel.com/dashboard > Project > Analytics
# Should see stable function duration and calls
```

## Troubleshooting

### Problem: Migration script fails with "Missing environment variables"

**Solution**: Make sure `.env.local` exists and has all three Supabase variables:
```bash
cat .env.local | grep SUPABASE
```

Should output:
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Problem: Supabase table shows 0 rows after migration

**Solution**: Check migration script output for errors:
```bash
npx ts-node scripts/migrate-view-counts.ts 2>&1 | tail -50
```

Common causes:
- Service role key is wrong
- Sanity read token missing or expired
- RLS policies blocking inserts

### Problem: Cron job not updating Sanity viewCounts

**Solution**:
1. Check Vercel logs: Dashboard → Deployments → Latest → Cron Jobs
2. Verify CRON_SECRET is set in Vercel
3. Check Supabase has view events for the previous day:
   ```sql
   SELECT * FROM view_events 
   WHERE created_date = CURRENT_DATE - INTERVAL 1 day;
   ```
4. Verify Sanity write token has Editor permissions

### Problem: Old data looks wrong in Supabase

**Solution**: The migration creates synthetic view events distributed across 30 days. This is intentional to simulate realistic access patterns. If you need exact timestamps:

1. Roll back Supabase table: `TRUNCATE view_events;`
2. Modify the migration script to use specific dates
3. Re-run the migration

## Rollback Plan

If issues occur:

### Quick Rollback (keep Supabase data)
```bash
# Revert code changes
git revert HEAD~9  # Revert the 10 commits

# Redeploy
git push origin main
vercel --prod
```

ViewPing will stop recording views, but Sanity viewCounts stay intact.

### Full Rollback (restore old system)
```bash
# Get old /api/view route from git history
git show <old-commit>:src/app/api/view/route.ts > src/app/api/view/route.ts

# Update ViewPing to use old endpoint
git show <old-commit>:src/components/post/ViewPing.tsx > src/components/post/ViewPing.tsx

# Commit and deploy
git add .
git commit -m "rollback: restore old view tracking"
git push origin main
```

## Success Criteria

✅ **Migration is successful when:**

1. Supabase table has all viewCount data (~125k+ view events)
2. `/api/view-queue` endpoint records new views
3. Daily cron job runs at 01:00 UTC
4. Sanity viewCounts are incremented from new views
5. No errors in Vercel logs
6. Sanity API usage drops by 98% (245k → ~5k/week)

## Questions?

Refer to:
- `docs/SUPABASE_VIEW_TRACKING_SETUP.md` — Complete setup guide
- `docs/USAGE_OPTIMIZATION_IMPLEMENTATION.md` — Architecture & deployment
- GitHub Issue #106 — Full analysis and context

---

**Estimated total time: 30 minutes**
