import type { Article } from '@/models/types/sanity';

/**
 * Filter out already-displayed articles and sort by date
 * Uses eventDate → publishedAt → _createdAt as priority
 * Note: eventDate is only present on certain article types (Timeline events)
 */
export default function filterAndSortArticles(
  articles: Article[],
  excludedIds: Set<string>
): Article[] {
  return articles
    .filter((a) => !excludedIds.has(a._id))
    .sort((a, b) => {
      const dateA = (a as Record<string, unknown>).eventDate ?? a.publishedAt ?? a._createdAt;
      const dateB = (b as Record<string, unknown>).eventDate ?? b.publishedAt ?? b._createdAt;
      return new Date(dateB as string).getTime() - new Date(dateA as string).getTime();
    });
}
