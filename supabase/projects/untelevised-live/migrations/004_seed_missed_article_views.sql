-- Seed missed article views from system swap
-- These 4 articles had views tracked elsewhere during the migration
-- Distributing views randomly across the last 24 hours

-- Disable triggers for bulk insert performance
ALTER TABLE public.view_count DISABLE TRIGGER ALL;

INSERT INTO public.view_count (slug, ip, ip_hash, city, state_province, country, viewed_at)
SELECT
  a.slug,
  NULL as ip,
  NULL as ip_hash,
  'migrated-missed' as city,
  'migrated-missed' as state_province,
  'migrated-missed' as country,
  NOW() - (RANDOM() * INTERVAL '24 hours') as viewed_at
FROM (
  -- Missed views during system swap
  VALUES
    ('the-death-of-tripp-brazeale-a-cover-up-for-a-child-killer', 24),
    ('a-baby-executed-over-diapers-senatobia-police-kill-1-year-old-kohen-wiley-at-walmart', 16),
    ('two-calls-about-diapers-one-officer-bought-them-another-executed-a-baby', 17),
    ('a-bullet-meant-for-no-one-a-life-taken-from-everyone-the-murder-of-sam-abu-haikal', 13)
) a(slug, view_count)
CROSS JOIN LATERAL GENERATE_SERIES(1, a.view_count) AS gs(n);

-- Re-enable triggers
ALTER TABLE public.view_count ENABLE TRIGGER ALL;

-- Verify migration
SELECT
  slug,
  COUNT(*) as view_count,
  MIN(viewed_at) as earliest_view,
  MAX(viewed_at) as latest_view
FROM public.view_count
WHERE city = 'migrated-missed'
GROUP BY slug
ORDER BY slug;
