export interface AlgoliaArticleRecord {
  objectID: string; // article slug
  title: string;
  description: string;
  bodyText: string; // plain text from Portable Text body, max 10,000 chars
  author: string;
  authorSlug: string;
  categories: string[];
  categorySlugList: string[];
  publishedAt: number; // Unix timestamp (seconds)
  imageUrl: string;
  type: 'article';
  // index signature required for Algolia v5 saveObjects / Record<string, unknown>
  [key: string]: unknown;
}

export interface AlgoliaEventRecord {
  objectID: string;
  title: string;
  description: string;
  eventDate: number;
  type: 'live_event';
  [key: string]: unknown;
}
