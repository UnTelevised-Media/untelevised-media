# Plan: Metadata System — Complete Implementation

> Status: APPROVED — Implement all fixes across the entire app.
> This is a step-by-step implementation guide for when we're ready to build

---

## Overview

This document is the concrete implementation plan for the metadata system. It's a companion to `02-seo-aeo-audit.md` (which covers *what* needs fixing) — this covers *how* to implement it.

---

## Step 1: Root Layout Metadata

**File:** `src/app/layout.tsx`

Replace the boilerplate with:
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://www.untelevised.media'),
  title: {
    default: 'UnTelevised Media — Independent Journalism',
    template: '%s | UnTelevised Media',
  },
  description:
    'Independent journalism covering breaking news, live events, and investigative reporting that mainstream media won\'t cover.',
  keywords: ['independent media', 'investigative journalism', 'breaking news', 'live events'],
  authors: [{ name: 'UnTelevised Media Editorial Team', url: 'https://www.untelevised.media/staff/' }],
  creator: 'UnTelevised Media',
  publisher: 'UnTelevised Media',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.untelevised.media',
    siteName: 'UnTelevised Media',
    title: 'UnTelevised Media — Independent Journalism',
    description: 'Independent journalism covering breaking news and investigative reporting.',
    images: [{
      url: '/og-default.jpg',   // Create a branded default OG image
      width: 1200,
      height: 630,
      alt: 'UnTelevised Media',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@untelevised',       // Confirm actual Twitter handle
    creator: '@untelevised',
    title: 'UnTelevised Media — Independent Journalism',
    description: 'Independent journalism covering breaking news and investigative reporting.',
  },
  verification: {
    // google: 'GOOGLE_SEARCH_CONSOLE_TOKEN',  // Add after GSC setup
  },
}
```

---

## Step 2: Shared Metadata Utilities

Create `src/util/metadata.ts`:

```ts
import { Metadata } from 'next'
import urlForImage from './urlForImage'

const BASE_URL = 'https://www.untelevised.media'
const SITE_NAME = 'UnTelevised Media'

// Canonical URL builder — always uses trailing slash (matches trailingSlash: true)
export function getCanonicalUrl(...segments: string[]): string {
  const path = segments.filter(Boolean).join('/')
  return `${BASE_URL}/${path}/`
}

// OG image URL from Sanity image asset
export function getSanityOgImageUrl(image: any): string | undefined {
  if (!image) return undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return urlForImage(image as any)?.width(1200).height(630).url() ?? undefined
}

// Truncate strings for meta tags
export function truncate(str: string | undefined, maxLength: number): string {
  if (!str) return ''
  return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str
}

// Build article metadata
export function buildArticleMetadata(article: Article, slug: string): Metadata {
  const ogImageUrl = getSanityOgImageUrl(article.mainImage) ?? `${BASE_URL}/og-default.jpg`
  const canonicalUrl = getCanonicalUrl('articles', slug)
  const title = truncate(article.seo?.metaTitle || article.title, 60)
  const description = truncate(article.seo?.metaDescription || article.description, 160)

  return {
    title,
    description,
    keywords: article.keywords,  // Array after schema fix
    authors: [{ name: article.author?.name }],
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author?.name].filter(Boolean),
      section: article.categories?.[0]?.title,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: { canonical: canonicalUrl },
    robots: article.seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  }
}
```

---

## Step 3: Article Page `generateMetadata`

**File:** `src/app/(user)/articles/[slug]/page.tsx`

```ts
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityFetch<Article>({
    query: queryArticleBySlug,
    params: { slug },
    stega: false,   // Critical: no stega encoding in metadata
    tags: ['article'],
  })
  if (!article) return { title: 'Article Not Found' }
  return buildArticleMetadata(article, slug)
}
```

---

## Step 4: Structured Data Component (News)

Create `src/components/seo/NewsStructuredData.tsx`:

```tsx
interface Props {
  article: Article
  slug: string
}

export function NewsArticleStructuredData({ article, slug }: Props) {
  const canonicalUrl = `https://www.untelevised.media/articles/${slug}/`
  const ogImageUrl = getSanityOgImageUrl(article.mainImage)

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `${canonicalUrl}#article`,
        headline: article.title,
        description: article.description,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article.publishedAt,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        image: ogImageUrl
          ? { '@type': 'ImageObject', url: ogImageUrl, width: 1200, height: 630 }
          : undefined,
        author: {
          '@type': 'Person',
          '@id': `https://www.untelevised.media/author/${article.author?.slug?.current}/#person`,
          name: article.author?.name,
          url: `https://www.untelevised.media/author/${article.author?.slug?.current}/`,
        },
        publisher: {
          '@type': 'NewsMediaOrganization',
          '@id': 'https://www.untelevised.media/#organization',
          name: 'UnTelevised Media',
          url: 'https://www.untelevised.media',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.untelevised.media/Logo.png',
          },
        },
        articleSection: article.categories?.[0]?.title,
        keywords: Array.isArray(article.keywords)
          ? article.keywords.join(', ')
          : article.keywords,
      },
      // Breadcrumb
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.untelevised.media/' },
          article.categories?.[0] && {
            '@type': 'ListItem',
            position: 2,
            name: article.categories[0].title,
            item: `https://www.untelevised.media/category/${article.categories[0].slug?.current}/`,
          },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
        ].filter(Boolean),
      },
    ],
  }

  // Add FAQ schema if article has FAQ fields
  if (article.faqs?.length) {
    schema['@graph'].push({
      '@type': 'FAQPage',
      mainEntity: article.faqs.map((faq: any) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## Step 5: Global Organization + WebSite Schema

Create `src/components/seo/GlobalStructuredData.tsx` — rendered once in `(user)/layout.tsx`:

```tsx
export function GlobalStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': 'https://www.untelevised.media/#organization',
        name: 'UnTelevised Media',
        url: 'https://www.untelevised.media',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.untelevised.media/Logo.png',
        },
        sameAs: [
          // Populate with actual social URLs
          'https://twitter.com/untelevised',
          'https://instagram.com/untelevised',
          'https://facebook.com/untelevised',
          'https://youtube.com/@untelevised',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'editorial',
          url: 'https://www.untelevised.media/secure-contact/',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.untelevised.media/#website',
        name: 'UnTelevised Media',
        url: 'https://www.untelevised.media',
        publisher: { '@id': 'https://www.untelevised.media/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.untelevised.media/search/?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

Add to `src/app/(user)/layout.tsx`:
```tsx
import { GlobalStructuredData } from '@/components/seo/GlobalStructuredData'

// Inside return, after <body>:
<GlobalStructuredData />
```

---

## Step 6: Author Structured Data

Update `src/app/(user)/author/[slug]/page.tsx` to include:
```ts
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `https://www.untelevised.media/author/${slug}/#person`,
  name: author.name,
  jobTitle: author.title,
  description: author.bio,  // Plain text version
  image: authorImageUrl,
  url: `https://www.untelevised.media/author/${slug}/`,
  worksFor: { '@id': 'https://www.untelevised.media/#organization' },
  sameAs: author.sameAs ?? [],  // After schema addition
  knowsAbout: author.expertise ?? [],  // After schema addition
}
```

---

## Step 7: GROQ Query Updates

Expand `queryArticleBySlug` to include new fields:
```groq
*[_type=='article' && slug.current == $slug][0] {
  ...,
  "slug": slug.current,
  author-> {
    name,
    "slug": slug.current,
    image,
    title,
    credentials,
    sameAs
  },
  categories[]-> {
    _id,
    title,
    "slug": slug.current
  },
  seo,          // New seoObject
  faqs,         // New FAQ field
  sources,      // New sources field
  updatedAt,    // New updatedAt field
  relatedArticles[]-> {
    _id,
    title,
    "slug": slug.current,
    mainImage,
    description,
    publishedAt,
    author-> { name }
  }
}
```

---

## Checklist for Implementation

When approved, implement in this order:

- [ ] Replace root layout metadata with UnTelevised branding
- [ ] Create `src/util/metadata.ts` with shared utilities
- [ ] Create `src/components/seo/GlobalStructuredData.tsx`
- [ ] Add `GlobalStructuredData` to `(user)/layout.tsx`
- [ ] Add `generateMetadata` to `articles/[slug]/page.tsx`
- [ ] Add `generateMetadata` to `live-event/[slug]/page.tsx`
- [ ] Add `generateMetadata` to `author/[slug]/page.tsx`
- [ ] Add `generateMetadata` to `category/[slug]/page.tsx`
- [ ] Create `NewsArticleStructuredData` component
- [ ] Add NewsArticle structured data to article pages
- [ ] Update sitemap (priorities + missing static pages)
- [ ] Update robots.ts (API disallow, fix BASEURL)
- [ ] Sanity schema additions (seoObject, article fields, author EEAT fields)
- [ ] Add `generateMetadata` to music pages (lyrics, artists, albums)
- [ ] Add static page metadata (about, staff, donate, etc.)
- [ ] Fix `notFound()` on missing content pages
- [ ] Fix OG image generation or add `og-default.jpg` to public/
