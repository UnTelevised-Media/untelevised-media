-- Cleanup migration for hurriyah publications project
-- Removes tables that were accidentally created in the wrong project

-- Drop tables that should not exist in bookstore project
DROP TABLE IF EXISTS public.view_events CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;

-- Verify cleanup
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('view_events', 'members', 'view_count');
