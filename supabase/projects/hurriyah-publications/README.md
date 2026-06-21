# Hurriyah Publications - Supabase Configuration

This folder contains all Supabase configuration for the **hurriyah-publications** (bookstore) project.

**Project ID:** `qdocpanuicwyhlcthudc`

## Structure

```
hurriyah-publications/
├── migrations/          # Database schema migrations
│   └── 001_cleanup_wrong_tables.sql
└── functions/          # Supabase Edge Functions (empty - no custom functions)
```

## Migrations

### 001_cleanup_wrong_tables.sql
Removes tables that were accidentally created in the wrong project:
- `view_events` (belongs in untelevised-live)
- `members` (belongs in untelevised-live membership project)

**Status:** This migration should be applied to clean up the database.

## Functions

No Edge Functions are needed for the bookstore project at this time.

## Deployment

```bash
# Push cleanup migration
supabase db push --project-ref qdocpanuicwyhlcthudc
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy & paste `001_cleanup_wrong_tables.sql`
3. Execute

## Notes

- This project is for the bookstore/digital products only
- View tracking is handled by untelevised-live project only
- Membership features are in a separate untelevised-membership project
