# UnTelevised Media — Data Flow & Sanity Integration

## Sanity Configuration

- **Project ID:** set via `SANITY_PROJECT_ID` env var
- **Dataset:** `production` (via `SANITY_DATASET`)
- **API Version:** pinned (via `apiVersion` in env.ts)
- **Studio:** embedded at `/studio` (App Router route group `(admin)`)

---

## Fetch Pattern

All data fetching goes through `sanityFetch()` — a wrapper around `next-sanity`'s fetch that handles ISR tags:

```ts
// Pattern used throughout the app
const articles = await sanityFetch({
  query: queryAllArticles,
  tags: ['article'],        // ISR revalidation tag
});
```

Revalidation is triggered via Sanity webhooks → `revalidateTag()` on the Next.js API route.

---

## GROQ Queries (src/lib/sanity/lib/queries.ts)

| Export | Type | Description |
|--------|------|-------------|
| `queryLiveEvents` | `liveEvent[]` | Active events (`isCurrentEvent == true`) |
| `queryPastEvents` | `liveEvent[]` | Historical events |
| `queryPastEventsWithPagination` | `liveEvent[]` | Paginated past events |
| `queryAllArticles` | `article[]` | All articles, ordered by date |
| `queryArticleBySlug` | `article` | Single article by slug |
| `queryCategories` | `category[]` | All categories |

All queries use `->` to dereference references inline (no client-side joins needed).

---

## Static Generation

**`generateStaticParams()`** is implemented on:
- `/articles/[slug]` — generates all article slugs at build time
- (Should be on) `/live-event/[slug]`, `/author/[slug]`, `/category/[slug]`, etc.

---

## Live Content (SanityLive)

- `SanityLive` component is rendered in `(user)/layout.tsx`
- Provides real-time content updates via Sanity's Live Content API
- Visual Editing overlays activated in draft mode via `SanityVisualEditing`

---

## Draft Mode / Preview

- `/api/draft-mode/enable` and `/api/draft-mode/disable` routes control draft mode
- Uses `@sanity/preview-url-secret` for secure preview links
- `DraftModeBanner` shown at top of page in draft mode
- Presentation Tool in Studio links to live preview

---

## Content Schema Inventory

| Schema | Route | Key Fields |
|--------|-------|-----------|
| `article` | `/articles/[slug]` | title, slug, description, author→, categories[], body, publishedAt, mainImage, keywords |
| `author` | `/author/[slug]` | name, slug, bio, image, title (job), social handles |
| `liveEvent` | `/live-event/[slug]` | title, slug, eventDate, isCurrentEvent, keyEvent[], relatedArticles[] |
| `category` | `/category/[slug]` | title, slug |
| `song` | `/lyrics/[slug]` | title, slug, lyrics, primaryArtist→, album→, genres, duration |
| `musicArtist` | `/music-artists/[slug]` | name, stageName, bio, genres, socialMedia |
| `album` | `/albums/[slug]` | title, slug, artist→, releaseDate, albumType, tracks |
| `timeline` | `/timeline/[slug]` | title, events[], timelineCategory |
| `policies` | `/policies/[slug]` | title, slug, body |
| `secureContact` | (form only) | name, message, encrypted fields |
| `whistleblower` | (form only) | encrypted submission |
| `comments` | (disabled) | article→, author, body |
| `newsletters` | (form only) | email subscription |

---

## Image Pipeline

```
Sanity image asset uploaded in Studio
         ↓
  @sanity/image-url builder
         ↓
  urlForImage(asset).url()    ← src/util/urlForImage.ts
         ↓
  next/image with CDN (cdn.sanity.io)
         ↓
  Vercel Image Optimization (WebP/AVIF)
```

`plaiceholder` package is installed for LQIP blur placeholders but **not yet wired up** to article/event images.

---

## Ad System (Current Branch: Ads)

```
ConsentAwareGoogleAdSense  ← loads AdSense script only after consent
        ↓
  Custom Ad Components:
    SidebarAd   — homepage sidebar
    BannerAd    — post-article
    RectangleAd — article page mid-content
        ↓
  next-google-adsense package
        ↓
  Google AdSense (ca-pub-7412827340538951)
```

Ad slots currently hardcoded as string literals in components — should be centralized in `AD_CONFIG`.

---

## Analytics

```
ConsentAwareAnalytics (GTM)  ← consent-gated, only loads after user accepts
         +
Vercel Analytics             ← automatic (always on)
         +
Vercel Speed Insights        ← Core Web Vitals tracking
```
