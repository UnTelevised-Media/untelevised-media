-- Cleanup: Remove tables accidentally created in hurriyah project
-- These should not be in the bookstore database

DROP TABLE IF EXISTS public.view_events CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;

-- Verify cleanup
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('view_events', 'members');
