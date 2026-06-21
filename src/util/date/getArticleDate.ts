/**
 * Utility function to get the appropriate date for an article
 * Priority order:
 * 1. eventDate (if exists and is not null/undefined)
 * 2. publishedAt (if exists and is not null/undefined)
 * 3. _createdAt (fallback)
 */
export default function getArticleDate(article: {
  eventDate?: string | null;
  publishedAt?: string | null;
  _createdAt?: string;
}): string | null {
  // Priority 1: eventDate
  if (article.eventDate) {
    return article.eventDate;
  }

  // Priority 2: publishedAt
  if (article.publishedAt) {
    return article.publishedAt;
  }

  // Priority 3: _createdAt (fallback)
  if (article._createdAt) {
    return article._createdAt;
  }

  // No valid date found
  return null;
}
