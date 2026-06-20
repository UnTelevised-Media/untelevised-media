// src/util/metadata.ts
// Shared metadata helpers for generateMetadata() across all page routes

import type { Metadata } from 'next';
import type { Article, Author, Category, LiveEvent } from '@/models/types/sanity';
import urlForImage from '@/util/url/urlForImage';

// Local type aliases for Sanity document shapes not yet covered by TypeGen.
// Update these when running `sanity typegen generate` adds the matching schemas.
type BreakingArticle = {
  heroImage?: unknown;
  mainImage?: unknown;
  title?: string;
  summary?: string;
  description?: string;
  excerpt?: string;
  author?: { name?: string } | null;
  publishedAt?: string;
  updatedAt?: string;
};

type FactCheck = {
  mainImage?: unknown;
  title?: string;
  ratingExplanation?: string;
  description?: string;
  publishedAt?: string;
  updatedAt?: string;
};

const BASE_URL = 'https://www.untelevised.media';
const SITE_NAME = 'UnTelevised Media';
export const TWITTER_HANDLE = '@untelevised';
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.png`;
export const HURRIYA_OG_IMAGE = `${BASE_URL}/hurriya-pub/Logo-alt.png`;

// Canonical URL builder — always uses trailing slash (matches trailingSlash: true in next.config)
export function getCanonicalUrl(...segments: string[]): string {
  const path = segments.filter(Boolean).join('/');
  return path ? `${BASE_URL}/${path}/` : `${BASE_URL}/`;
}

// Build OG image URL from Sanity image reference (1200x630)

export function getSanityOgImageUrl(image: unknown): string | undefined {
  if (!image) {
    return undefined;
  }

  return urlForImage(image)?.width(1200).height(630).url() ?? undefined;
}

// Truncate strings for meta title/description limits
export function truncate(str: string | undefined, maxLength: number): string {
  if (!str) {
    return '';
  }
  return str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str;
}

// Build full article Metadata object
export function buildArticleMetadata(article: Article, slug: string): Metadata {
  const ogImageUrl = getSanityOgImageUrl(article.mainImage) ?? DEFAULT_OG_IMAGE;
  const canonicalUrl = getCanonicalUrl('articles', slug);
  const title = truncate(article.title, 60);
  const description = truncate(article.description, 160);
  const keywords = article.keywords?.length ? article.keywords : undefined;

  // Extract author name - handle both reference and populated author objects
  const authorName =
    article.author && typeof article.author === 'object' && 'name' in article.author
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((article.author as any).name ?? 'Author')
      : 'Author';

  // Extract category title - handle both reference and populated category objects
  const categoryTitle =
    article.categories?.[0] &&
    typeof article.categories[0] === 'object' &&
    'title' in article.categories[0]
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (article.categories[0] as any).title
      : undefined;

  return {
    title,
    description,
    keywords,
    authors: article.author ? [{ name: authorName }] : undefined,
    publisher: SITE_NAME,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: authorName && authorName !== 'Author' ? [authorName] : undefined,
      section: categoryTitle,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

// Build live event Metadata object
export function buildLiveEventMetadata(liveEvent: LiveEvent, slug: string): Metadata {
  const seoOgImageUrl = getSanityOgImageUrl(liveEvent.seo?.ogImage);
  const ogImageUrl = seoOgImageUrl ?? getSanityOgImageUrl(liveEvent.mainImage) ?? DEFAULT_OG_IMAGE;
  const canonicalUrl = liveEvent.seo?.canonicalUrl ?? getCanonicalUrl('live-event', slug);
  const computedTitle = truncate(
    `${liveEvent.title}${liveEvent.isCurrentEvent ? ' — Live Updates' : ''}`,
    60
  );
  const title = truncate(liveEvent.seo?.metaTitle ?? computedTitle, 60);
  const description = truncate(liveEvent.seo?.metaDescription ?? liveEvent.description, 160);
  const keywords = liveEvent.keywords?.length ? liveEvent.keywords : undefined;

  return {
    title,
    description,
    keywords,
    publisher: SITE_NAME,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

// Build category Metadata object
export function buildCategoryMetadata(category: Category, slug: string): Metadata {
  const canonicalUrl = category.seo?.canonicalUrl ?? getCanonicalUrl('category', slug);
  const computedTitle = truncate(`${category.title} — Latest Coverage`, 60);
  const title = truncate(category.seo?.metaTitle ?? computedTitle, 60);
  const description = truncate(
    category.seo?.metaDescription ??
      category.description ??
      `Browse all ${category.title} coverage from UnTelevised Media.`,
    160
  );
  // Category image is optional in Sanity schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryImage = (category as any)?.image;
  const ogImageUrl = getSanityOgImageUrl(categoryImage) ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    publisher: SITE_NAME,
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

// Build breaking news article Metadata object
export function buildBreakingNewsMetadata(article: BreakingArticle, slug: string): Metadata {
  const ogImageUrl =
    getSanityOgImageUrl(article.heroImage ?? article.mainImage) ?? DEFAULT_OG_IMAGE;
  const canonicalUrl = getCanonicalUrl('breaking', slug);
  const title = truncate(article.title, 60);
  const description = truncate(article.summary ?? article.description ?? article.excerpt, 160);

  return {
    title,
    description,
    authors: article.author ? [{ name: article.author?.name ?? 'Author' }] : undefined,
    publisher: SITE_NAME,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      section: 'Breaking News',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

// Build fact-check Metadata object
export function buildFactCheckMetadata(factCheck: FactCheck, slug: string): Metadata {
  const ogImageUrl = getSanityOgImageUrl(factCheck.mainImage) ?? DEFAULT_OG_IMAGE;
  const canonicalUrl = getCanonicalUrl('fact-check', slug);
  const title = truncate(`Fact Check: ${factCheck.title}`, 60);
  const description = truncate(factCheck.ratingExplanation ?? factCheck.description, 160);

  return {
    title,
    description,
    publisher: SITE_NAME,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      publishedTime: factCheck.publishedAt,
      modifiedTime: factCheck.updatedAt ?? factCheck.publishedAt,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}

// Build author Metadata object
export function buildAuthorMetadata(author: Author, slug: string): Metadata {
  const ogImageUrl = getSanityOgImageUrl(author.image) ?? DEFAULT_OG_IMAGE;
  const canonicalUrl = getCanonicalUrl('author', slug);
  const title = truncate(`${author.name}${author.title ? ` — ${author.title}` : ''}`, 60);
  const description = truncate(
    `Independent journalist at UnTelevised Media. Read all coverage by ${author.name}.`,
    160
  );

  return {
    title,
    description,
    publisher: SITE_NAME,
    openGraph: {
      type: 'profile',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: author.name }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
  };
}
