
# Plan: SEO & AEO Audit — UnTelevised Media

> Status: APPROVED — Implement all fixes across the entire app.
> Skill reference: `.claude/skills/seo-aeo-best-practices/`

---

## Executive Summary

UnTelevised Media has a strong foundation (sitemap, robots.txt, some structured data) but is critically under-optimized. The most impactful gap is the **complete absence of per-page metadata** — every article, live event, and category page is indexed with generic boilerplate titles. Secondary gaps are in structured data for news content and EEAT signals.

**Priority order:** Metadata → Structured Data → EEAT → AEO Content → Technical Cleanup

---

## 1. METADATA — CRITICAL

### 1.1 Generic root metadata (BLOCKER)

**Current state:** All pages inherit this title/description from root layout:
```
Title: "Next.js 15 Boilerplate"
Description: "A comprehensive Next.js 15 boilerplate..."
```

This is live in production. Every article, event, and page on `untelevised.media` is indexed with this title.

**Fix:** Replace root layout metadata with UnTelevised Media branding (see plan-01 item #2).

---

### 1.2 No `generateMetadata` on article pages (BLOCKER)

**Current state:** `src/app/(user)/articles/[slug]/page.tsx` has no `generateMetadata` export.

**Required implementation:**
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityFetch({
    query: queryArticleBySlug,
    params: { slug },
    stega: false,  // Critical: no stega encoding in metadata
    tags: ['article']
  })
  if (!article) return { title: 'Article Not Found' }

  const ogImage = article.mainImage
    ? urlForImage(article.mainImage).width(1200).height(630).url()
    : undefined

  return {
    title: article.title,           // Up to 60 chars — add truncation util
    description: article.description,  // Up to 160 chars
    keywords: article.keywords?.split(',').map(k => k.trim()),
    authors: [{ name: article.author?.name }],
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      authors: [article.author?.name],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `https://www.untelevised.media/articles/${slug}/`,
    },
  }
}
```

**All routes needing `generateMetadata`:**

| Route | Schema type | Priority |
|-------|-------------|----------|
| `/articles/[slug]` | article | P0 |
| `/live-event/[slug]` | liveEvent | P0 |
| `/category/[slug]` | category | P1 |
| `/author/[slug]` | author | P1 |
| `/lyrics/[slug]` | song | P1 |
| `/music-artists/[slug]` | musicArtist | P2 |
| `/albums/[slug]` | album | P2 |

**Static pages needing metadata (currently returning root defaults):**

| Page | Suggested title | Priority |
|------|-----------------|----------|
| `/about` | About UnTelevised Media | P1 |
| `/donate` | Support Independent Journalism | P1 |
| `/staff` | Our Team — UnTelevised Media | P2 |
| `/past-events` | Past Events Coverage Archive | P2 |
| `/lyrics` | Music Lyrics — UnTelevised | P2 |
| `/secure-contact` | Secure Contact — UnTelevised | P2 |
| `/whistleblower` | Whistleblower Portal | P2 |
| `/join` | Join the Mission | P3 |
| `/support` | Support Options | P3 |

---

### 1.3 Canonical URL inconsistency

**Current state:** `trailingSlash: true` in next.config.ts means all URLs resolve with `/`. The sitemap correctly uses trailing slashes. But structured data URLs in `StructuredData.tsx` use inconsistent trailing slashes.

**Fix:** Create a `getCanonicalUrl(type, slug)` utility that always produces consistent `https://www.untelevised.media/{type}/{slug}/` URLs.

---

## 2. STRUCTURED DATA — HIGH

### 2.1 No Article/NewsArticle schema on article pages

**Current state:** `StructuredData.tsx` only covers Music (MusicRecording, MusicAlbum, MusicGroup). News articles have zero structured data.

**Fix:** Create `NewsArticleStructuredData` component:
```ts
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsArticle",   // or "Article" — NewsArticle for news coverage
      headline: article.title,
      description: article.description,
      image: { "@type": "ImageObject", url: ogImageUrl, width: 1200, height: 630 },
      datePublished: article.publishedAt,
      dateModified: article._updatedAt,
      author: {
        "@type": "Person",
        name: article.author.name,
        url: `https://www.untelevised.media/author/${article.author.slug.current}/`,
      },
      publisher: {
        "@type": "NewsMediaOrganization",
        name: "UnTelevised Media",
        url: "https://www.untelevised.media",
        logo: { "@type": "ImageObject", url: "https://www.untelevised.media/Logo.png" }
      },
      mainEntityOfPage: `https://www.untelevised.media/articles/${article.slug.current}/`,
      articleSection: article.categories?.[0]?.title,
      keywords: article.keywords,
    },
    generateBreadcrumbSchema([
      { name: "Home", url: "https://www.untelevised.media/" },
      { name: article.categories?.[0]?.title, url: `/category/${article.categories?.[0]?.slug.current}/` },
      { name: article.title, url: `/articles/${article.slug.current}/` }
    ]),
    generateOrganizationSchema()
  ]
}
```

### 2.2 Organization schema — missing from all pages

**Current state:** `MusicWebsiteStructuredData` has a partial Organization. No global Organization schema exists on news pages.

**Fix:** Create a `sitewide-schema.tsx` component rendered in the `(user)/layout.tsx` that outputs:
```ts
{
  "@type": "NewsMediaOrganization",
  name: "UnTelevised Media",
  url: "https://www.untelevised.media",
  logo: "https://www.untelevised.media/Logo.png",
  sameAs: [Twitter, Facebook, Instagram, YouTube, TikTok],
  contactPoint: { "@type": "ContactPoint", contactType: "editorial", url: ".../secure-contact/" },
  foundingDate: "...",
  description: "Independent journalism covering breaking news and investigative reporting"
}
```

### 2.3 WebSite schema with SearchAction — missing from news pages

**Current state:** `MusicWebsiteStructuredData` has this for the music section, but the main news site doesn't.

**Fix:** Add to `(user)/layout.tsx`:
```ts
{
  "@type": "WebSite",
  name: "UnTelevised Media",
  url: "https://www.untelevised.media",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.untelevised.media/search/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 2.4 BreadcrumbList — missing from news pages

**Current state:** `BreadcrumbStructuredData` component exists but is NOT used on article or event pages.

**Fix:** Use it on:
- Article pages: Home → Category → Article
- Live Event pages: Home → Live Events → Event name
- Author pages: Home → Staff → Author name
- Category pages: Home → Category name

### 2.5 Script vs script tag — fix in StructuredData.tsx

**Current state:** `StructuredData.tsx` uses `next/script` with `dangerouslySetInnerHTML`. For inline JSON-LD in server components, use `<script>` directly:
```tsx
// Current (suboptimal - Script adds overhead for inline data):
<Script id="..." type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />

// Correct for RSC:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
```

---

## 3. EEAT — HIGH (Critical for News)

Google applies extra scrutiny to news/journalism under YMYL (Your Money or Your Life) guidelines. UnTelevised Media covers serious topics that fall into this category.

### 3.1 Author schema missing EEAT fields

**Current state:** The `author` Sanity schema has basic fields (name, bio, social handles) but is missing:
- `credentials` — journalistic credentials, beats covered
- `sameAs[]` — canonical profile URLs for schema.org Person
- `expertise[]` — topic areas
- `experienceYears` — establishes authority

**Fix (schema update needed):**
```ts
defineField({ name: 'credentials', type: 'array', of: [{ type: 'string' }],
  description: 'Press credentials, awards, publications, affiliations' }),
defineField({ name: 'sameAs', type: 'array', of: [{ type: 'url' }],
  description: 'LinkedIn, Wikipedia, official profile URLs for schema.org' }),
defineField({ name: 'expertise', type: 'array', of: [{ type: 'string' }],
  description: 'Topic areas: e.g. "Government Accountability", "Civil Rights"' }),
```

### 3.2 Author profile pages need to display EEAT signals

**Current state:** Unknown — author page not fully audited.

**Fix:** Author pages should prominently display:
- Photo, name, title/role
- Bio with experience and background
- Credentials and expertise tags
- Links to their published articles on-site
- External profile links (LinkedIn, etc.)
- Article count / publication history

### 3.3 Article pages missing `updatedAt` and `reviewedBy`

**Current state:** Articles show `publishedAt` date. No `updatedAt` field in schema. No fact-check reviewer.

**Fix (schema additions):**
```ts
defineField({ name: 'updatedAt', title: 'Last Updated', type: 'datetime' }),
defineField({ name: 'reviewedBy', type: 'reference', to: [{ type: 'author' }],
  description: 'Editorial reviewer / fact-checker' }),
defineField({ name: 'sources', type: 'array', of: [{ type: 'url' }],
  description: 'Primary source citations' }),
defineField({ name: 'corrections', type: 'text',
  description: 'Public correction log for this article' }),
```

### 3.4 No visible correction or sourcing system

**Fix:** Article pages should display:
- "Sources" section if `sources[]` array is populated
- "Corrections" notice if correction text exists
- "Last Updated" timestamp if `updatedAt` > `publishedAt`

---

## 4. TECHNICAL SEO — MEDIUM

### 4.1 Sitemap issues

| Issue | Current | Fix |
|-------|---------|-----|
| Homepage priority | `0.3` | Change to `1.0` |
| Article priority | `0.5` (all equal) | Vary: breaking=0.9, recent=0.8, older=0.6 |
| Missing static pages | Not included | Add: `/about/`, `/staff/`, `/donate/`, `/past-events/`, `/lyrics/`, `/music-artists/` |
| `changeFrequency` on homepage | `hourly` | Keep — correct for news |
| Sitemap location | In `(user)/` route group | May generate at non-root URL — verify path |

### 4.2 Robots.txt — add API and AI crawler rules

**Current:**
```
User-agent: *
Allow: /
Disallow: /studio/
```

**Recommended:**
```
User-agent: *
Allow: /
Disallow: /studio/
Disallow: /api/
Disallow: /preview/

# AI crawlers — decision needed: allow = more AI citations, block = prevent training use
# Recommended: ALLOW (independent journalism benefits from AI citations)
# User-agent: GPTBot
# Disallow: /
# User-agent: Google-Extended
# Disallow: /

Sitemap: https://www.untelevised.media/sitemap.xml
```

**Decision needed from editorial team:** Allow or block AI training crawlers? Allowing increases chance of being cited in ChatGPT/Perplexity/Google AI Overviews.

>Allow all AI crawlers

### 4.3 `BASEURL` env var used in robots.ts — verify it's set

**File:** `src/app/robots.ts`
```ts
const baseURL = process.env.BASEURL;
sitemap: `${baseURL}sitemap.xml`
```
If `BASEURL` is undefined, sitemap URL will be `undefinedsitemap.xml`. Should use `NEXT_PUBLIC_APP_URL` or a hardcoded production URL as fallback.

### 4.4 OG Images — no dynamic generation

**Current state:** OG images are Sanity article images resized via URL builder (good start, not ideal). No custom branded OG image template.

**Recommended:** Use Next.js `next/og` (ImageResponse) to generate branded OG images with:
- UnTelevised logo
- Article title overlaid on image
- Author name
- Category badge
- File: `src/app/(user)/articles/[slug]/opengraph-image.tsx`

### 4.5 Twitter Card metadata

**Current:** Root layout has basic twitter card. Individual pages need to add twitter card metadata in their `generateMetadata`.

---

## 5. AEO (AI ANSWER ENGINE) — MEDIUM

UnTelevised Media is in an excellent position for AEO given its content type — investigative journalism is exactly what AI answer engines cite. The challenge is discoverability and authority signals.

### 5.1 Content structure for AI extraction

**Current state:** Articles use Portable Text (rich text) which AI crawlers can parse but may not extract cleanly.

**Recommendations:**
- Add **lead paragraph** field to article schema — a 2–3 sentence plain-text summary ideal for AI extraction and featured snippets
- Structure article body with H2/H3 headings that match likely user questions (e.g., "What happened at X?" "Who is involved?")
- Consider a **Key Facts** structured field in articles: array of short fact strings that AI can easily extract

### 5.2 FAQ schema for investigative articles

**Opportunity:** Investigative articles often answer multiple questions. Adding a `faqs[]` field to the article schema and rendering `FAQPage` structured data would significantly increase AI citation likelihood.

```ts
defineField({
  name: 'faqs',
  type: 'array',
  of: [{
    type: 'object',
    fields: [
      defineField({ name: 'question', type: 'string' }),
      defineField({ name: 'answer', type: 'text' })
    ]
  }]
})
```

### 5.3 Event schema for live event pages

**Current state:** Live event pages have no structured data.

**Fix:** Add `Event` schema:
```ts
{
  "@type": "Event",
  name: event.title,
  startDate: event.eventDate,
  description: event.description,
  eventStatus: "https://schema.org/EventScheduled",
  location: event.location ? { "@type": "Place", name: event.location } : undefined,
  organizer: { "@type": "Organization", name: "UnTelevised Media" }
}
```

### 5.4 Internal linking strategy

**Current state:** No related articles displayed on article pages (sidebar only shows breaking news).

**Fix:** Add "Related Articles" section at end of article body with 3–5 semantically related articles (query by shared categories). This:
- Improves crawl depth
- Increases time on site
- Helps AI understand content relationships

### 5.5 Freshness signals — surface `updatedAt` prominently

AI systems prefer current content. Once `updatedAt` is added to schema:
- Display "Updated: {date}" prominently near byline
- Include `dateModified` in Article structured data
- Add `<meta http-equiv="last-modified">` in `generateMetadata`

---

## 6. IMPLEMENTATION PRIORITY ORDER

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| P0 | Fix root metadata (remove boilerplate) | Critical | 30 min |
| P0 | Add `generateMetadata` to article pages | Critical | 2 hrs |
| P0 | Add `generateMetadata` to live-event pages | Critical | 1 hr |
| P1 | Add NewsArticle structured data to articles | High | 3 hrs |
| P1 | Add Organization + WebSite schema globally | High | 1 hr |
| P1 | Add BreadcrumbList to articles/events | High | 2 hrs |
| P1 | Fix sitemap (priorities + missing pages) | High | 1 hr |
| P1 | Fix robots.txt (API disallow + AI decision) | High | 30 min |
| P2 | Add `updatedAt` / `reviewedBy` / `sources` to article schema | Medium | 2 hrs |
| P2 | Add author `credentials` / `sameAs` / `expertise` to schema | Medium | 1 hr |
| P2 | Add EEAT signals to article UI (sources, last updated) | Medium | 3 hrs |
| P2 | Add Event structured data to live event pages | Medium | 2 hrs |
| P2 | Fix `notFound()` on missing article/event pages | Medium | 1 hr |
| P3 | Dynamic OG image generation (next/og) | Medium | 4 hrs |
| P3 | Add FAQ field to article schema + FAQPage schema | Medium | 3 hrs |
| P3 | Related articles section on article pages | Medium | 3 hrs |
| P3 | `generateMetadata` for static pages (about, staff, etc.) | Low-Med | 2 hrs |
| P4 | AI crawler policy decision + robots.txt update | Low | 30 min |
