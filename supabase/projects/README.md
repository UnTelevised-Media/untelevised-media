# Supabase Projects

This folder contains configurations for multiple independent Supabase projects.

## Projects

### 1. untelevised-live
**Purpose:** News site + sister site (view tracking, membership, etc.)
**Project ID:** `tewnvjowrdfzvqcsfwgx`
**Database:** PostgreSQL
**Features:**
- View count tracking for articles
- Trending calculations
- User membership (separate project: untelevised-membership)

**Includes:**
- `migrations/` — Database schema (view_count table)
- `functions/` — Edge Functions (trending queries, batch geolocation)

### 2. hurriyah-publications
**Purpose:** Bookstore / digital products
**Project ID:** `qdocpanuicwyhlcthudc`
**Database:** PostgreSQL
**Features:**
- Product catalog
- Orders and downloads
- Webhooks

**Includes:**
- `migrations/` — Cleanup migrations only

## Separate Project: untelevised-membership
This is a third Supabase project not in this folder.
**Project ID:** `tewnvjowrdfzvqcsfwgx` (same as untelevised-live, but in SUPABASE_MEMBERSHIP_* env vars)

## Deployment

Each project is deployed independently:

```bash
# Deploy to untelevised-live
supabase link --project-ref tewnvjowrdfzvqcsfwgx
supabase db push
supabase functions deploy get-trending-articles
supabase functions deploy batch-geolocate-views

# Deploy to hurriyah
supabase link --project-ref qdocpanuicwyhlcthudc
supabase db push
```

## Environment Variables

```bash
# Untelevised Live
NEXT_PUBLIC_SUPABASE_URL=https://tewnvjowrdfzvqcsfwgx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Hurriyah Bookstore
SUPABASE_SHOP_URL=https://qdocpanuicwyhlcthudc.supabase.co
SUPABASE_SHOP_ANON_KEY=...
SUPABASE_SHOP_SERVICE_ROLE_KEY=...

# Shared
SUPABASE_DATABASE_PASS=...
```

## Important Notes

- **Migrations are project-specific** — only deploy to the correct project
- **Functions run in their respective projects** — API endpoints are project-specific
- **RLS is enforced** — ensure proper policies are set
- **Service role key is powerful** — only use in backend/cron jobs, never expose to client
