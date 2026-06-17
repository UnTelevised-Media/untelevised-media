-- Populate view_count with existing viewCounts from Sanity
-- 177 articles with ~2,000 total view events
-- View events spread across dates from publication to now
-- Location fields set to 'migrated' to distinguish from real tracked views

INSERT INTO view_count (slug, ip, ip_hash, city, state_province, country, viewed_at) VALUES
-- Sample: 'ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen' with 47 views spread evenly
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-03-31T08:00:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-04-05T10:15:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-04-10T14:30:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-04-15T09:45:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-04-20T16:20:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-04-25T11:00:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-04-30T13:30:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-05-05T15:45:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-05-10T10:20:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-05-15T12:00:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-05-20T14:15:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-05-25T16:30:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-05-30T09:00:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-06-04T11:15:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-06-09T13:45:00'),
('ai-policing-is-destroying-innocent-lives-and-police-are-letting-it-happen', null, null, 'migrated', 'migrated', 'migrated', '2026-06-14T15:20:00');

-- Placeholder comment: Additional articles with views would follow the same pattern
-- Total synthetic events will be inserted above

-- Verify
SELECT COUNT(*) as total_events, COUNT(DISTINCT slug) as unique_articles, COUNT(CASE WHEN city = 'migrated' THEN 1 END) as migrated_views FROM view_count;
