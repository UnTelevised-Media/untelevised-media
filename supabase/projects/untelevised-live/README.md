# Untelevised Live - Supabase Configuration

This folder contains all Supabase configuration for the **untelevised-live** project.

**Project ID:** `tewnvjowrdfzvqcsfwgx`

## Structure

```
untelevised-live/
├── migrations/          # Database schema and data migrations
│   ├── 001_create_view_count_table.sql
│   └── 002_populate_view_count_from_sanity.sql
└── functions/          # Supabase Edge Functions (TypeScript)
    ├── get-trending-articles.ts
    └── batch-geolocate-views.ts
```

## Migrations

### 001_create_view_count_table.sql
Creates the `view_count` table with:
- Row Level Security (anon INSERT, service_role full access)
- Indexes for efficient trending queries
- Columns: slug, ip, ip_hash, city, state_province, country, viewed_at, created_date

### 002_populate_view_count_from_sanity.sql
Populates view_count with existing data from Sanity:
- 177 articles with ~2,100 total viewCounts
- Synthetic views spread from publication date to now
- Marked as 'migrated' for tracking

## Functions

### get-trending-articles.ts
REST API to fetch trending articles from the past N days.

**Endpoint:** `POST /functions/v1/get-trending-articles`

**Query Parameters:**
- `days` (default: 7) — lookback period for trending
- `limit` (default: 20) — max articles to return

**Response:**
```json
[
  {
    "slug": "article-slug",
    "view_count": 42,
    "last_viewed": "2026-06-16T15:30:00Z"
  }
]
```

### batch-geolocate-views.ts
Cron job that processes ungeolocation-ated view events.

Runs daily at **midnight CST (06:00 UTC)**.

**Process:**
1. Query rows where `ip_hash IS NULL`
2. Geolocate IP using geoip-lite
3. Hash IP with SHA256
4. Update row with city, state_province, country, ip_hash
5. Clear raw IP for privacy

**Trigger:** Vercel cron or manual POST to `/functions/v1/batch-geolocate-views`

**Auth Required:** `Authorization: Bearer {CRON_SECRET}`

## Deployment

### Option 1: Supabase CLI

```bash
# Push all migrations
supabase db push

# Deploy functions
supabase functions deploy get-trending-articles --project-ref tewnvjowrdfzvqcsfwgx
supabase functions deploy batch-geolocate-views --project-ref tewnvjowrdfzvqcsfwgx
```

### Option 2: Supabase Dashboard

1. Go to SQL Editor
2. Copy & paste migrations in order
3. Go to Edge Functions
4. Create new functions from TypeScript files

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tewnvjowrdfzvqcsfwgx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=cron_view_counts_sync_2026
```

## Related Files

- API Route: `src/app/api/view-queue/route.ts` — records views from ViewPing
- Component: `src/components/post/ViewPing.tsx` — client-side view tracker
- Helper: `src/lib/supabase/viewEvents.ts` — Supabase client functions
