import type { Article } from '@/models/types/sanity';

/**
 * Filter out already-displayed articles and sort by date
 * Uses eventDate → publishedAt → _createdAt as priority
 */
export default function filterAndSortArticles(
  articles: Article[],
  excludedIds: Set<string>
): Article[] {
  return articles
    .filter((a) => !excludedIds.has(a._id))
    .sort((a, b) => {
      const dateA = (a as any).eventDate ?? a.publishedAt ?? a._createdAt;
      const dateB = (b as any).eventDate ?? b.publishedAt ?? b._createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
}
