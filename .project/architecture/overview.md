# UnTelevised Media — Architecture Overview

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.4.5 |
| Language | TypeScript | 5.8.3 |
| Runtime | React | 19.1.0 |
| CMS | Sanity | v3.92 |
| Styling | Tailwind CSS | 3.4.17 |
| UI Components | Shadcn UI | 2.1.2 |
| Package Manager | pnpm | (pnpm-lock.yaml) |
| Deployment | Vercel | — |
| Analytics | Vercel Analytics + GTM | — |

---

## Repository Structure

```
untelevised-media/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (admin)/              # Sanity Studio route group
│   │   │   └── studio/[[...tool]]/
│   │   ├── (music)/              # Music section route group
│   │   │   ├── albums/[slug]/
│   │   │   ├── lyrics/[slug]/
│   │   │   └── music-artists/[slug]/
│   │   ├── (user)/               # Main public site route group
│   │   │   ├── about/
│   │   │   ├── articles/[slug]/  # Article detail pages
│   │   │   ├── author/[slug]/
│   │   │   ├── category/[slug]/
│   │   │   ├── donate/
│   │   │   ├── join/
│   │   │   ├── live-event/[slug]/
│   │   │   ├── past-events/
│   │   │   ├── policies/[slug]/
│   │   │   ├── privacy-settings/
│   │   │   ├── search/
│   │   │   ├── secure-contact/
│   │   │   ├── staff/
│   │   │   ├── support/
│   │   │   ├── timeline/
│   │   │   ├── whistleblower/
│   │   │   ├── sitemap.ts        # Dynamic sitemap
│   │   │   ├── layout.tsx        # User layout (Header, Nav, Footer)
│   │   │   └── page.tsx          # Homepage
│   │   ├── api/                  # API routes
│   │   ├── fonts/                # Local fonts (Geist)
│   │   ├── globals.css           # Global styles + Shadcn CSS vars
│   │   ├── layout.tsx            # Root layout
│   │   └── robots.ts             # robots.txt generation
│   ├── components/
│   │   ├── ads/                  # AdSense components (SidebarAd, BannerAd, RectangleAd)
│   │   ├── analytics/            # ConsentAwareAnalytics (GTM)
│   │   ├── cards/                # ArticleCards, LiveWidget, PastEventCard
│   │   ├── consent/              # GDPR: CookieConsentBanner, AdBlockerMessage
│   │   ├── debug/                # TestAd (dev-only)
│   │   ├── error/                # ErrorBoundary
│   │   ├── global/               # Header, Footer, Nav, Banner, Logo, Socials, ThemeToggle, Ticker
│   │   ├── googleAds/            # Google AdSense loader
│   │   ├── homepage/             # RawFeed
│   │   ├── pages/                # Page-level components
│   │   ├── post/                 # Post/article components
│   │   ├── providers/            # ThemeProvider, RichTextComponents, ClientSideRoute
│   │   ├── sanity/               # DraftModeBanner, VisualEditing, PreviewLink
│   │   ├── seo/                  # StructuredData.tsx (music schema only)
│   │   ├── showcase/             # Showcase components
│   │   ├── skeletons/            # Loading skeleton components
│   │   ├── timeline/             # Timeline feature components
│   │   └── ui/                   # Shadcn UI primitives
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── consent/              # Consent management context/provider
│   │   ├── jest/                 # Jest configuration
│   │   └── sanity/               # Sanity configuration
│   │       ├── lib/
│   │       │   ├── client.ts     # Sanity client
│   │       │   ├── fetch.ts      # sanityFetch wrapper
│   │       │   ├── live.ts       # SanityLive component
│   │       │   ├── queries.ts    # GROQ queries
│   │       │   └── tokens.ts     # Auth tokens
│   │       ├── sanity.config.ts  # Studio config
│   │       └── structure.ts      # Studio desk structure
│   ├── models/
│   │   └── schema/               # Sanity schema definitions
│   │       ├── article.ts
│   │       ├── author.ts
│   │       ├── liveEvent.ts
│   │       ├── song.ts
│   │       ├── musicArtist.ts
│   │       ├── album.ts
│   │       ├── category.ts
│   │       ├── timeline.ts
│   │       └── ... (20+ schemas)
│   ├── server/                   # Server-only utilities
│   ├── styles/                   # Additional stylesheets
│   └── util/                     # Utility functions
│       ├── formatDate.ts
│       ├── getArticleDate.ts
│       ├── urlForImage.ts
│       ├── getAllUrls.ts          # For sitemap generation
│       └── resolveHref.ts
├── public/                       # Static assets (Logo.png, favicon, etc.)
├── .project/                     # Project documentation
├── .claude/                      # Claude AI skills
├── tailwind.config.ts            # Extended Tailwind config
├── next.config.ts                # Next.js config
└── package.json                  # Dependencies (pnpm)
```

---

## Route Groups

### `(user)/` — Public Site
- Has its own `layout.tsx` with Header, Nav, Footer, AdSense, SanityLive
- All public-facing pages
- Homepage fetches articles, live events, categories in parallel via `Promise.all`

### `(music)/` — Music Section
- Separate layout for music content
- Pages: albums, lyrics (songs), music-artists
- Structured data already implemented for MusicRecording, MusicGroup, MusicAlbum

### `(admin)/` — Sanity Studio
- Embeds Sanity Studio at `/studio`
- Presentation Tool enabled for visual editing / live preview
- Vision Tool for GROQ queries in-studio

---

## Data Flow

```
Sanity CMS (hosted)
       ↓
  sanityFetch() — next-sanity wrapper with ISR tags
       ↓
  Server Components — fetch data at render time
       ↓
  generateStaticParams() — ISG for article/event pages
       ↓
  Vercel Edge CDN — serves cached pages
       ↓
  SanityLive — WebSocket for live content updates
       ↓
  Draft Mode — preview unstable content via Presentation Tool
```

---

## Key Configuration

### next.config.ts
- `trailingSlash: true` — all URLs end with `/`
- `reactStrictMode: true`
- Remote image patterns: `cdn.sanity.io`, `images.pexels.com`
- Redirect: `/post/:slug` → `/articles/:slug` (permanent)
- `experimental.taint: true` — prevents Sanity read token leaking to client

### robots.ts
- Allows all crawlers (`*`)
- Disallows `/studio/`
- References sitemap at `${BASEURL}sitemap.xml`
- **Note:** No API route disallow, no AI crawler rules

### Sitemap (sitemap.ts in `(user)/`)
- Dynamic — fetches all slugs from Sanity
- Covers: articles, liveEvents, authors, categories, policies, songs, musicArtists, albums
- **Note:** Missing static pages (about, donate, join, staff, support, etc.)
- Priority scores mostly `0.5` (undifferentiated)
