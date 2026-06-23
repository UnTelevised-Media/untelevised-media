export interface RawFeedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  publishedAt: string;
  mainImage?: { asset: { _ref: string }; alt?: string };
  author: { name: string } | null;
  categories?: { title: string }[];
}

export interface FieldReportArticle {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  publishedAt: string;
  eventDate?: string;
  location?: string;
  mainImage?: { asset: { _ref: string }; alt?: string };
  author: { name: string } | null;
  categories?: { title: string }[];
}
