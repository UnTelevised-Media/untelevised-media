-- Populate view_count table with existing data from Sanity
-- Migrates 177 articles with ~2,100 total viewCounts
-- Spreads views evenly from article publication date to now
-- Marked as 'migrated' in location fields for tracking

-- Disable triggers for bulk insert performance
ALTER TABLE public.view_count DISABLE TRIGGER ALL;

-- Insert synthetic view events spread across publication timeline
-- Each article gets its viewCount distributed across the time from publish to now
INSERT INTO public.view_count (slug, ip, ip_hash, city, state_province, country, viewed_at)
SELECT
  a.slug,
  NULL as ip,
  NULL as ip_hash,
  'migrated' as city,
  'migrated' as state_province,
  'migrated' as country,
  a.published_at + (
    INTERVAL '1 day' * (
      (ROW_NUMBER() OVER (PARTITION BY a.slug ORDER BY a.slug) - 1) *
      (EXTRACT(DAY FROM NOW() - a.published_at)::INT / NULLIF(a.view_count, 0))
    )
  ) as viewed_at
FROM (
  -- Sanity articles with viewCounts (replace with actual data from Sanity export)
  VALUES
    ('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', '2026-03-31T17:19:22.215Z'::TIMESTAMP, 47),
    ('the-women-in-the-beauty-salon-a-story-numbers-won-t-tell-you', '2026-04-02T10:30:00Z'::TIMESTAMP, 13),
    ('in-northern-gaza-one-man-refuses-to-let-the-cats-starve', '2026-04-05T14:45:00Z'::TIMESTAMP, 40),
    ('north-dakota-law-enforcement-launch-series-of-brutal-terrorist-attacks-on-native-water', '2026-04-08T09:15:00Z'::TIMESTAMP, 28)
    -- Add remaining 173 articles from Sanity here in same format:
    -- (slug, published_at, view_count)
) a(slug, published_at, view_count)
CROSS JOIN LATERAL GENERATE_SERIES(1, a.view_count) AS gs(n);

-- Re-enable triggers
ALTER TABLE public.view_count ENABLE TRIGGER ALL;

-- Verify migration
SELECT
  COUNT(*) as total_events,
  COUNT(DISTINCT slug) as unique_articles,
  COUNT(CASE WHEN city = 'migrated' THEN 1 END) as migrated_views,
  MIN(viewed_at) as earliest_view,
  MAX(viewed_at) as latest_view
FROM public.view_count;
