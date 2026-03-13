// src/util/metadata.ts
// Shared metadata helpers for generateMetadata() across all page routes

import type { Metadata } from 'next';
import urlForImage from './urlForImage';

const BASE_URL = 'https://www.untelevised.media';
const SITE_NAME = 'UnTelevised Media';
const TWITTER_HANDLE = '@untelevised';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.jpg`;

// Canonical URL builder — always uses trailing slash (matches trailingSlash: true in next.config)
export function getCanonicalUrl(...segments: string[]): string {
  const path = segments.filter(Boolean).join('/');
  return path ? `${BASE_URL}/${path}/` : `${BASE_URL}/`;
}

// Build OG image URL from Sanity image reference (1200x630)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSanityOgImageUrl(image: any): string | undefined {
  if (!image) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    urlForImage(image as any)
      ?.width(1200)
      .height(630)
      .url() ?? undefined
  );
}

// Truncate strings for meta title/description limits
export function truncate(str: string | undefined, maxLength: number): string {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
}

// Build full article Metadata object
export function buildArticleMetadata(article: Article, slug: string): Metadata {
  const ogImageUrl = getSanityOgImageUrl(article.mainImage) ?? DEFAULT_OG_IMAGE;
  const canonicalUrl = getCanonicalUrl('articles', slug);
  const title = truncate(article.title, 60);
  const description = truncate(article.description, 160);
  const keywords = article.keywords ? article.keywords.split(',').map((k) => k.trim()) : undefined;

  return {
    title,
    description,
    keywords,
    authors: article.author ? [{ name: article.author.name }] : undefined,
    publisher: SITE_NAME,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      section: article.categories?.[0]?.title,
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
  const ogImageUrl = getSanityOgImageUrl(liveEvent.mainImage) ?? DEFAULT_OG_IMAGE;
  const canonicalUrl = getCanonicalUrl('live-event', slug);
  const title = truncate(
    `${liveEvent.title}${liveEvent.isCurrentEvent ? ' — Live Updates' : ''}`,
    60
  );
  const description = truncate(liveEvent.description, 160);
  const keywords = liveEvent.keywords
    ? liveEvent.keywords.split(',').map((k) => k.trim())
    : undefined;

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
  const canonicalUrl = getCanonicalUrl('category', slug);
  const title = truncate(`${category.title} — Latest Coverage`, 60);
  const description = truncate(
    category.description || `Browse all ${category.title} coverage from UnTelevised Media.`,
    160
  );

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
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      title,
      description,
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
