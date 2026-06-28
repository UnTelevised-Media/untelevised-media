# Changelog — UnTelevised Media / Hurriya Publications

All notable changes to this project are documented here.

---

# [3.0.3] — 2026-06-27 — Article Page UI/UX Enhancements & Engagement CTAs & Complete Footer Redesign

## New

### Sidebar Call-to-Action Components

- **Support The Mission CTA** — Left sidebar component linking to `/support` with messaging about funding fearless journalism
- **Featured Book CTA** — Dynamic book card in left sidebar fetching from Hurriya Publications featured books; displays cover image, title, author, price, "View Book" and "Buy Now" buttons
- **Featured Song CTA** — Right sidebar component displaying featured songs with square track art, artist info, and "View Lyrics" / "Artist" buttons
- **Newsletter Signup CTA** — Right sidebar component with name field option, stacked inputs, terms/privacy checkbox, and subscribe button; includes success/error states
- **Careers CTA** — Right sidebar component linking to `/careers` with team recruitment messaging

### Content & Engagement

- **Ad placement below newsletter** — Added banner ad after newsletter signup in article footer for enhanced monetization
- **Sidebar divider sections** — Visual separators between sidebar sections (border-top with padding) for improved hierarchy and visual flow

### Footer Complete Redesign

- **Footer layout restructuring** — Changed from 4-column grid to flex layout with prominent left sidebar (min-w-4xl, max-w-5xl) and 3-column navigation grid on right
- **Left sidebar expansion** — Now displays: logo, branding tagline, mission statement, social icons with platform-specific hover colors, and dynamic category badges with color fills from Sanity
- **Responsive footer** — Mobile: sidebar and navigation stack vertically; Tablet: 2-column grid; Desktop: sidebar + 3-column grid layout
- **Category badges** — Dynamic badges below social icons with category colors from Sanity schema; ghost style (border + text) with full color + faded background on hover
- **Social icons** — Exact match to header Follow dropdown with platform-specific hover effects (YouTube red, Twitter blue, Twitch purple, etc.)
- **Navigation organization** — Platform column (News, Bookstore, Music); Community column (About, Support, Newsroom); Media column (Media Types, Syndication, Legal); Sitemap & RSS links in News section
- **Syndication section** — New subsection with professional links: Content Licensing, Independent Creators Marketplace, Send Us Media, Licensing & Rights
- **Legal/Compliance section** — Comprehensive legal offerings: Compliance (DMCA, Copyright, Abuse, Defamation), Policies (all dynamic from Sanity)
- **Footer branding** — Logo with company name, mission statement, raised fist emoji (✊) in footer bottom, copyright & attribution

## Updated

### Article Layout & Flow

- **Related articles grid expansion** — Increased grid from 4 to 6 displayed articles (2 rows × 3 columns on desktop, 3 rows × 2 columns on tablet)
- **Section reordering** — Moved comments section before newsletter signup for better content flow
- **Metadata display** — Changed article header footer to bottom-aligned (author/reviewer block sits level with location/date/read time)
- **Article metadata formatting** — Reorganized header metadata: Line 1 shows location + event date; Line 2 shows "Published: [date] · [read time]"
- **Most Read list redesign** — Removed author from trending articles; display date and location stacked below title; removed title truncation for full-width display; reduced font weight from black to semibold
- **Breaking News section styling** — Applied same redesign as Most Read list; added location field from Sanity query

### Sidebar Spacing & Visual Hierarchy

- **Increased sidebar gaps** — Changed `space-y-6` to `space-y-8` for better breathing room
- **Divider borders** — Added `border-top` with `pt-8` padding between left sidebar sections (Ad → Breaking News → Support → Featured Book)
- **Right sidebar dividers** — Added separators between Trending → Ad → Newsletter → Careers
- **Section visual separation** — Border lines create clear delineation between content blocks

## Fixed

- **Featured book card robustness** — Made all component props optional; support both `cover` and `coverImage` field names; added null checks and error handling to prevent rendering issues

---

# [3.0.2] — 2026-06-27 — Article Page Layout & Responsive Design Improvements

## Updated

### Layout & Responsiveness

- **Article page layout restructuring** — Reorganized main content flow to center article content with sidebars positioned outside the flex container for improved visual hierarchy
- **Responsive max-widths** — Added breakpoint-specific max-widths for header and article containers (md:max-w-2xl, lg:max-w-4xl, xl:max-w-5xl, wide:max-w-6xl, 4k:max-w-7xl)
- **Mobile sidebar repositioning** — Moved sidebar content below article on mobile/tablet devices (breakpoint: xl); desktop users retain three-column layout
- **Article container styling** — Added gradient background (slate-50 to slate-100 light / slate-950 to slate-900 dark) to article container for enhanced visual separation
- **Tailwind breakpoint extensions** — Added `wide` (1921px) and `4k` (3840px) breakpoints for ultra-wide display support

---

# [3.0.1] — 2026-06-26 — Article Page Improvements & Security Hardening

## New

### Security & Content Policies

- **Content Security Policy (CSP) environment-aware configuration** — Split CSP into environment-specific policies: production enforces strict HTTPS/WSS connections with `upgrade-insecure-requests`, development allows `ws://` and `http:` for Next.js HMR.
- **Permissions-Policy browser feature restrictions** — Added restrictive Permissions-Policy header limiting camera, microphone, geolocation, accelerometer, gyroscope, and magnetometer; unload event only allowed for embedded social platforms (TikTok, Facebook, Instagram, YouTube).
- **Coral comments CSP allowlist** — Added `coral.untelevised.media` and `s3.amazonaws.com` to `style-src` and `font-src` directives.

### Performance

- **LCP optimization** — Added `priority` prop to featured article image for faster Largest Contentful Paint rendering.

## Fixed

### React & Component Issues

- **React hooks conditional call violations** — Fixed ImageGalleryCarousel to use `useMemo` for computed image values, eliminating conditional hook call errors.

### Code Quality

- **Unused code cleanup** — Removed unused `ARTICLES_PER_PAGE` constant and prefixed unused parameters with underscore.
- **Duplicate imports** — Consolidated multiple lucide-react imports.

---

# [3.0.0] — 2026-06-26 — Major Release: Docker Deployment, Complete Bookstore, Author Portal, and Media Enhancements


Comprehensive release spanning infrastructure, editorial workflow, monetization, and media handling. Docker containerization with CoolaFly deployment, full-featured Bookstore with Stripe & Supabase, complete Author Portal with BlockNote WYSIWYG and pitch workflow, Coral Comments with Clerk SSO, Algolia search, and enhanced media system with WebP conversion and YouTube embed improvements.

## New

### Infrastructure & Deployment

- **Docker containerization** — Multi-stage Dockerfile with pnpm caching, Node.js 22 alpine; docker-compose.yml for local development; GitHub Actions workflow for Docker Hub publishing
- **CoolaFly deployment guide** — Step-by-step guide covering SSH setup, Docker, environment configuration, Caddyfile reverse proxy, systemd service, health monitoring
- **Docker build automation** — Automated image building with GitHub Actions detection and repository secrets sourcing

### Media & Images

- **Complete PNG-to-WebP migration** — All favicon, logo, and branded image assets converted to WebP format; batch conversion script with quality settings
- **YouTube hybrid embed system** — Smart fallback for age-restricted videos using IFrame API with timeout detection; SSR-safe lazy initialization
- **Image gallery carousel** — Full-featured carousel component with auto-rotation, keyboard navigation, image preloading, responsive design
- **Image gallery schema** — Sanity schema for gallery objects with alt text, captions, image arrays
- **Hurriya Publications WebP branding** — Logo and banner assets in WebP format

### Article Features & Content Surfacing

- **View counter & tracking** — Hidden readOnly `viewCount` field; `/api/view` endpoint with IP-based rate limiting; `ViewPing` component for session-based tracking
- **Trending section** — Async `TrendingSection` component with multiple variants; queries ordered by `viewCount` desc; integrated on homepage and article pages
- **Tag pages** — Full tag system with string-array field on articles; dedicated `/tag/[slug]` pages with metadata and JSON-LD; sitemap integration
- **Ad integration** — 7 named ad slots across breaking news, fact-checks, and article pages; `InFeedAd` and `BannerAd` components with strategic placement

### Search & Discovery

- **Algolia full-text search** — Sanity webhook handler with HMAC-SHA256 signature validation; syncs articles on create/update/delete; initial backfill script
- **Search UI** — InstantSearch with SearchBox, Hits with thumbnails, RefinementList facets (category, tag, author), Pagination; header typeahead with live dropdown

### Author Portal & Editorial Workflow

- **Role-based access control** — Three-tier hierarchy (admin > editor > author); Clerk `publicMetadata` driven; fresh API validation on every request
- **BlockNote WYSIWYG editor** — Full bidirectional serialization to Sanity Portable Text; first-class embed blocks (YouTube, Twitter, Instagram, Facebook, TikTok, Vimeo); autosave every 60s
- **Article editor** — Metadata form with title, slug, excerpt, categories, tags, keywords, location, publish scheduling, featured/breaking flags, sources, related articles, FAQs, corrections workflow
- **Source library** — Create/manage sources with type, URL, notes, anonymous flag; linked article count per source
- **Pitch workflow** — Claimed pitches with urgency/beat/status badges; Brief panel with per-user pass/unpass decisions; linked article creation from pitch
- **Sanity Live integration** — Real-time dashboard, article list, and inbox updates; zero manual refresh required
- **Rate limiting** — Upstash Redis sliding-window (30 writes/min per user); graceful degradation when env vars absent

### Comments & Reader Engagement

- **Coral Comments with Clerk SSO** — Self-hosted Coral Talk + MongoDB 8 + Redis 7-alpine + Caddy 2 with auto TLS and nightly backups
- **Coral JWT minting** — 24-hour HS256 tokens from Clerk session; auto-grants MODERATOR role to admin/staff; supports guest commenting
- **Theme integration** — Coral-themed CSS custom properties; separate light/dark theme files
- **Comments UX** — Gated behind functional cookie consent; `allowComments` boolean field on articles with `initialValue: true`

### Bookstore — Complete Implementation

**Infrastructure & Setup**
- **Environment configuration** — Placeholder env vars for `SUPABASE_SHOP_*`, `STRIPE_WEBHOOK_SECRET`, `RESEND_*`; Supabase shop project setup guide
- **Supabase infrastructure** — 6 tables (customers, addresses, orders, order_items, digital_downloads, payouts) with RLS; private `digital-books` bucket; 8 indexes + `set_updated_at()` trigger
- **Database clients** — `shopClient` (anon, RLS-enforced) and `shopServiceClient` (service role, server-only) for separate `untelevised-shop` project
- **TypeScript types** — Full interface set: `Customer`, `Address`, `Order`, `OrderItem`, `DigitalDownload`, `Payout`; `SanityBook`, `SanityBookFormat`, `SanityBookGenre`; `CartItem`, `CheckoutLineItem`, `CheckoutPayload`
- **GROQ queries** — `queryAllBooks`, `queryFeaturedBooks`, `queryBookBySlug`, `queryBooksByAuthor`, `queryAllBookGenres`, `queryBooksByGenre`

**Authentication & Roles**
- **Role system** — Sales role added to Clerk role hierarchy (admin > editor > author; sales is orders-only); role extraction from `publicMetadata`; server helpers for role validation; portal route protection with role-based redirects

**API & Webhooks**
- **Stripe checkout API** — `POST /api/bookstore/checkout` accepts `CheckoutPayload`; creates Checkout Session with shipping address collection; stores items + user ID in session metadata
- **Stripe webhook** — `POST /api/bookstore/webhook` handles `checkout.session.completed` (customer upsert, order + item creation, digital download provisioning), `payment_intent.*`, `charge.refunded` (download revocation), `charge.dispute.created`
- **Download API** — `GET /api/bookstore/download` validates auth, verifies ownership, checks expiry/count, generates Supabase signed URL (15-min), increments download counter; `GET /api/bookstore/my-downloads` returns user's digital downloads

**Email & Notifications**
- **Email delivery** — Nodemailer + Google SMTP; helpers for order confirmation, digital delivery (auth + guest), shipment, refund; graceful no-op when `RESEND_API_KEY` absent; BOM/CRLF env var cleanup

**Storefront & UI**
- **Storefront layout** — `src/app/(user)/shop/layout.tsx` shop route group within (user) group hierarchy
- **Homepage** — Featured books hero + all books grid; genre filter tabs; parallel data fetching
- **Book detail page** — Full detail with `generateStaticParams`, `generateMetadata`, Book + Offer JSON-LD; cover image, description, format selector (inventory badges, compare-at pricing), author bio
- **Genre filter** — Client-side tab bar with URL searchParams
- **Add to cart** — Client component with cart button; 2-second "Added ✓" feedback

**Cart & Checkout**
- **Cart store** — Zustand with localStorage persistence (`untele-cart` key); `addItem` (merges duplicates), `removeItem`, `updateQuantity`, `clearCart`, `getItemCount`, `getTotal`; `buildCartItem` helper
- **Cart UI** — Mini-cart icon in header with item-count badge; full cart page with quantity controls, remove, order summary sidebar with subtotal; checkout button redirects to Stripe

**Orders & Downloads**
- **Order success** — Retrieves Stripe session server-side via `session_id` searchParam; itemized order summary; digital download CTA
- **Order history** — Clerk-authed component; grouped order cards with status badge, total, item list, download link
- **Download vault** — Client component with per-file download button; shows download count, expiry, exhausted/expired states

**Author Tools & Earnings**
- **Author earnings** — `author_earnings` table with gross/Stripe fees/net breakdown; real Stripe Balance Transaction API; bi-monthly payout periods; GA4 conversion tracking
- **Portal dashboards**:
  - `/portal/library` — Product table with units sold and net earnings; low-stock alerts; Add/Edit book modals
  - `/portal/earnings` — Financial dashboard with sales summary, earnings breakdown, per-title chart, tips breakdown, payout history
  - `/portal/sales` — Order management with status tracking, shipment workflows, refund actions, author earnings per order

**Additional Features**
- **Gift purchasing** — Gift toggle component; gift metadata through checkout; separate email workflow
- **Name-your-price tips** — Per-author tip Product ID; variable amount at checkout; edit/toggle in cart
- **Digital downloads** — Supabase signed URLs (30-day expiry); vault with re-download limit (5, 1-year expiry); preserved filenames

### Security & Hardening

- **Input validation** — Zod schemas on all submission endpoints (bookstore, whistleblower, job application); email validation via `z.string().email()`
- **CAPTCHA integration** — Cloudflare Turnstile on careers, whistleblower, secure-contact endpoints; graceful degradation when key absent
- **Rate limiting** — Upstash sliding-window on public endpoints: 5 req/300s (submission), 3 req/300s (whistleblower)
- **Timing attack prevention** — `crypto.timingSafeEqual` on all secret comparisons; fixed-length buffer padding
- **Stripe hardening** — Client-supplied price IDs ignored; canonical pricing fetched server-side via Sanity GROQ; generic error messages; sensitive data never logged
- **Authorization fixes** — Algolia webhook fails closed (401 when secret unset); Author role ownership verification via GROQ; role allowlist (`{admin, sales, author}`) enforced; tracking URL validation against known carrier domains
- **Atomic operations** — Download counter protected by PL/pgSQL `FOR UPDATE` row lock; TOCTOU race eliminated
- **Database safety** — RLS enabled on all tables; service role justifications documented; Clerk+Supabase JWT upgrade path included
- **Sentry monitoring** — Error tracking for client, server, and edge runtime; source maps uploaded to CI only; graceful no-op without DSN

### Accessibility

- **WCAG compliance** — ThemeToggle, Search, and ApplicationForm aria-labels and label associations; skip navigation link in root layout; PitchQuickViewModal rewritten with Radix Dialog (focus trap, aria-modal)
- **Table semantics** — `scope="col"` on all table headers
- **Timeline progress** — role=progressbar with aria-valuenow/min/max/label; decorative icons marked aria-hidden=true
- **Image alt text** — Meaningful alt text on search results and content

### SEO & Analytics

- **Structured data** — MusicGroup JSON-LD for music artists; MusicRecording for lyrics; ClaimReview for fact-checks; Book + AggregateRating for bookstore; NewsArticle with dateModified
- **OG metadata** — Full Open Graph + Twitter cards on all collection pages; og:image, og:type, modifiedTime
- **Canonical URLs** — Fixed across fact-checks, breaking news, tag pages, and music pages; `getCanonicalUrl` helper
- **Portal noindex** — All portal routes marked `robots: { index: false, follow: false }`
- **GA4 tracking** — Consent-gated `add_to_cart` and `purchase` events via `useConsentAwareTracking` hook
- **Clerk preconnect** — Added preconnect hint for clerk.untelevised.media (310ms LCP improvement)

### Social Media Embed Support

- **Facebook embeds** — `facebookEmbed` Sanity object type; SSR-safe dynamic import; full BlockNote serialization
- **TikTok embeds** — `tiktokEmbed` Sanity object type; SSR-safe dynamic import; consolidated SDK loading
- **Instagram embeds** — Hydration fix via `InstagramEmbedInner` + `dynamic({ ssr: false })`
- **Vimeo embeds** — `vimeoEmbed` Sanity object type with Studio preview; BlockNote serialization

### Developer Experience & Tooling

- **Jest configuration** — Root-level config using `next/jest`; fixes ESM import errors in tests
- **Content migration scripts** — One-time Sanity seed scripts for article backfill; AR archive helper; image patching utilities
- **Portal image upload API** — FormData endpoint that pipes to Sanity asset pipeline
- **GROQ query optimization** — Slice bounds added to unbounded queries; parallel data fetching hardened
- **Server/client boundaries** — Strict enforcement; no imports of `server-only` modules into client components
- **Code organization** — Removed all direct Sanity Studio links from portal UI; self-contained portal workflows

### Performance

- **Bundle optimization** — Reduced bundle size via tree-shaking and code splitting
- **Image preloading** — Next/previous images in gallery carousel preloaded
- **Critical rendering path** — Optimized LCP with priority image hints
- **Gallery auto-rotation** — Smooth auto-cycling with configurable intervals

### Membership & Supporter Tiers (Issue #13)

Recurring memberships via Stripe Checkout with three tiers ($5, $15, $50/mo). Separate Stripe project, dedicated Supabase project for member records, Supabase Edge Function webhook handling, Clerk user linking.

- **Database & Infrastructure** — Type stubs for membership Supabase schema; typed Supabase clients (`membership` project tewnvjowrdfzvqcsfwgx); RLS policies
- **API & Webhooks** — Checkout API (`/api/membership/create-checkout`); Supabase Edge Function webhook handler; Stripe signature verification
- **Authentication & Access** — Server-only access helpers (`getMembershipTier`, `isMember`, `hasFullAccess`); Clerk user linking
- **UI & User Experience** — `/join` page with tier cards and live member count; `MembershipTiers` component; post-checkout confirmation page with billing info
- **Environment Configuration** — `STRIPE_MEMBERSHIP_*` (6 vars) and `SUPABASE_MEMBERSHIP_*` (3 vars) in `.env.example`

### Newsletter & Email Integration (Issue #27)

Double opt-in for UnTelevised Media + Hurriya Publications newsletters. Shared service layer with per-list branding via Nodemailer.

- **Services & Infrastructure** — Newsletter service with `subscribe`, `confirm`, `unsubscribe` logic; parameterized `NewsletterConfig` types for per-list branding
- **Email Delivery** — Nodemailer transporter setup; templated confirmation and welcome emails with brand-specific copy
- **API Routes** — News newsletter routes (`POST /api/newsletter-subscribe`, `GET /api/newsletter-confirm?token=`, `GET /api/newsletter-unsubscribe?token=`); upgraded bookstore newsletter API
- **UI Components** — Reusable `NewsletterSignup` component (full/compact variants, source tracking); `SubscribedBanner` for status feedback; unsubscribe pages
- **Data Schema** — `newsletterSubscribe` and `bookstoreSubscriber` documents with full double opt-in fields (`firstName`, `status`, `confirmToken`, `unsubscribeToken`, `gdprConsent`, `confirmedAt`, `unsubscribedAt`); portal subscribers list with status badges

## Fixed

### Images & Content Display

- **Article body images** — Full aspect ratio preserved; dimensions parsed from Sanity asset refs instead of hardcoded 800×450
- **Raw Feed navigation** — Cards now clickable with proper Link wrapper

### Code Quality

- **Duplicate imports** — Consolidated lucide-react imports throughout


---

# [2.3.0] — 2026-03-20

## Summary

Bookmarks full-stack release — completes Phase 2 of issue #19. localStorage bookmarking (Phase 1, v2.2.x) is preserved as the default for all unauthenticated users. Signed-in users now get server-backed bookmarks stored in Sanity, synced across all devices. Guest bookmarks are automatically migrated to the server on first sign-in with no data loss.

## New

### Bookmarks Phase 2: Clerk + Sanity Sync (Issue #19, PR #39)

**Sanity Schema & Data**
- `userBookmark` document type with fields: `clerkUserId`, `slug`, `title`, `description`, `imageUrl`, `authorName`, `publishedAt`, `readingTime`, `bookmarkedAt`
- Deterministic `_id` format (`userBookmark_{userId}_{slug}`) enforces one document per user+slug for natural upsert deduplication
- Server-only Sanity write client (`src/lib/sanity/lib/write-client.ts`) with `SANITY_API_WRITE_TOKEN` permissions

**Server Actions**
- `getServerBookmarks()` — fetch all bookmarks for current Clerk user, newest first
- `checkServerBookmarked(slug)` — boolean check against Sanity
- `addServerBookmark(entry)` — upsert via `createOrReplace`
- `removeServerBookmark(slug)` — delete by deterministic doc ID
- `clearServerBookmarks()` — bulk delete all docs for user
- `syncLocalBookmarksToServer(entries[])` — transactional `createIfNotExists` migration preserving original `bookmarkedAt` timestamps

**Hooks & UI**
- `useBookmarks()` hook abstracting both storage backends
  - Anonymous users: read/write `localStorage` only (unchanged behavior)
  - Authenticated users: read/write Sanity with automatic localStorage → Sanity migration on first sign-in
  - Optimistic UI with instant state updates before server confirmation
  - Exports: `bookmarks`, `loading`, `ready`, `isBookmarked`, `toggle`, `remove`, `clearAll`
- `BookmarkButton` refactored to consume `useBookmarks()` hook; direct localStorage calls removed; `ready` flag replaces `mounted`
- Reading list page with Cloud icon + "synced to your account" for signed-in users; Monitor icon + "stored in this browser" for guests
- Reading list layout with `robots: noindex, nofollow` metadata


# [2.2.2] — 2026-03-20

## Summary

Credibility release — adds a complete Fact Check content type with `ClaimReview` JSON-LD for Google's fact-check rich results, inline fact-check cards embeddable in any blockContent rich text field, a full `/fact-checks` index and `/fact-check/[slug]` detail route, and five pre-seeded fact-checks covering all six verdict types.

## New

### Fact Check Content Type (Issue #25, PR #38)

**Sanity Schema & Data**
- `factCheck` document type with 4 grouped Studio tabs (Claim, Verdict, Analysis, Meta)
- Fields: `title`, `slug`, `publishedAt`, `author` (reference), `claim` (text), `claimSource`, `claimUrl`, `claimDate`, `rating` (radio enum — 6 verdicts with emoji labels), `ratingExplanation` (max 300 chars), `body` (blockContent), `sources[]` (label + url objects), `relatedArticles[]` (max 5 references)
- Studio preview shows verdict emoji + title + date
- `factCheckEmbed` object type added to `blockContent` for inline fact-check cards via Sanity reference; Studio preview shows verdict emoji + title
- `queryArticleBySlug` updated to resolve `factCheckEmbed` references within body arrays

**Verdict System & Structured Data**
- `src/lib/factCheck/verdictConfig.ts` — central config for all 6 verdicts with Tailwind color classes and schema.org `ratingValue` mapping (TRUE=5, MOSTLY TRUE=4, MISLEADING=3, MOSTLY FALSE=2, FALSE=1, UNVERIFIABLE=0)
- `src/lib/factCheck/claimReviewJsonLd.ts` — `buildClaimReviewJsonLd()` generates valid `ClaimReview` structured data for Google's fact-check rich result badge

**GROQ Queries**
- `queryAllFactChecks` — all fact-checks ordered by `publishedAt desc`, fields for index cards
- `queryFactCheckBySlug` — full detail including body (with `factCheckEmbed` reference resolution), sources, author, and related articles

**Components & Routes**
- `VerdictBadge` component — `sm` and `lg` size variants; per-verdict color coding; FALSE uses brand `#D70606`
- `InlineFactCheckCard` — compact card rendered inside `PortableText` when a `factCheckEmbed` block is encountered; shows verdict badge, claim in blockquote, verdict explanation, and link to full fact-check
- `RichTextComponents` extended with `factCheckEmbed` type renderer
- `/fact-checks` index page listing all fact-checks with verdict badges, claim previews, claim source, and author/date meta
- `/fact-check/[slug]` detail page with `generateMetadata`, `generateStaticParams`, `notFound()`, breadcrumb nav, claim blockquote with linked source, verdict explanation, full body, sources list, related articles, and `ClaimReview` JSON-LD

**SEO & Discovery**
- `/fact-checks/` static route added to sitemap (priority 0.8, daily)
- Dynamic `/fact-check/[slug]/` URLs fetched from Sanity (priority 0.7, weekly)
- Seed script (`scripts/seed-fact-checks.mjs`) with 5 fact-checks covering all verdict types

### Careers & Hiring System (Issue #17)

**Sanity Schema & Queries**
- `jobListing` document type with fields: title, slug, department (6 options), type (full-time/part-time/freelance/volunteer), location, description (blockContent), requirements (string[]), compensation, isActive (default true), closingDate
- `queryActiveJobListings` GROQ query with `isActive == true` and `closingDate >= $today` filters
- `queryJobApplications` GROQ query fetches all `jobApplication` docs ordered by `submittedAt desc`
- 7 pre-seeded `jobApplication` documents covering all 6 statuses (new, review, interview, accepted, declined, hold)

**Careers Pages & Workflows**
- `/careers` server component with sections: Hero, 3 value-prop cards (Editorial Freedom, Portfolio Building, Global Reach), 12-role "We're Looking For" grid, collapsible accordions per active Sanity listing, and full form
- `ContributorApplicationForm` component with all fields: firstName, lastName, email, phone, location, positionsOfInterest, socialMediaPlatforms, portfolioWebsite, youtubeChannel, socialMediaLinks, experienceLevel, experienceDescription, workSamples, availability, additionalInfo
- Form submits to `/api/job-application`; success shows CheckCircle2 confirmation; error shows AlertCircle message
- `/join/page.tsx` deleted entirely (no redirect, no orphan route)
- Sitemap: `/join/` removed; `/careers/` added (priority 0.6, monthly)
- Footer: "Careers" and "Join Our Team" merged into single link pointing to `/careers`

**Clerk Authentication Setup**
- `@clerk/nextjs` ^7 installed
- `ClerkProvider` added to root `layout.tsx` with `afterSignOutUrl='/'`
- `src/middleware.ts` — `clerkMiddleware` + route matcher for `/admin(/.*)?`; uses `clerkClient().users.getUser(userId)` for live `publicMetadata`; accepts `admin: true` (boolean or string); unauthenticated → `/sign-in`; non-admin → homepage
- `Header.tsx` — `Show when='signed-in'` renders `UserButton`; `Show when='signed-out'` renders Sign In link

**Auth Pages & Admin Dashboard**
- `/sign-in/[[...sign-in]]/page.tsx` — two-column layout with brand panel (logo + halo, tagline, CTA) + Clerk form (dark `slate-950` background, `untele` red accent, no rounded corners)
- `/sign-up/[[...sign-up]]/page.tsx` — identical layout using `<SignUp>`; both pages set `robots: { index: false, follow: false }`
- `/admin` server component with `robots: noindex`; six status summary cards (new, review, interview, accepted, declined, hold) with per-status colors
- `ApplicationsTable` client component: status filter tabs, sortable rows (name/email/location/positions/experience/availability/submitted/status), expandable rows (description/links/samples/platforms/phone/notes), "Edit in Studio" CTA

### Editorial Standards (Issue #26)

- `/editorial-standards` static page with: Six core principles (Accuracy, Independence, Fairness, Verification, Transparency, Accountability), verification process (primary sourcing, multi-source, document verification, right of reply), source standards (named vs. anonymous sourcing, Source Transparency Panel), corrections policy (all 4 types explained), Independence & Conflicts of Interest section, sensitive reporting guidelines
- Added to sitemap (priority 0.6, monthly)
- "Editorial Standards" link added to Footer About column

### Bookmarks & Reading List (Issue #19)

**Phase 1: Zero-Backend localStorage**
- `src/lib/bookmarks/storage.ts` — CRUD utilities: `getBookmarks`, `isBookmarked`, `addBookmark`, `removeBookmark`, `clearBookmarks`; SSR-safe with `typeof window` guard; fails silently on quota exceeded; storage key `untele_bookmarks`
- `BookmarkEntry` interface: slug, title, description, imageUrl, authorName, publishedAt, readingTime, bookmarkedAt
- `BookmarkButton` component — icon-only or full variant; SSR-safe hydration (disabled placeholder → real state after mount); brand-color active state (untele red)
- `/reading-list` page — animated loading skeleton, empty state with CTA, article list with thumbnail/meta/actions, per-item Remove button, Clear All button, article count, browser storage disclaimer
- `BookmarkButton` integrated into article page next to social share; Bookmark icon in header linking to `/reading-list`
- `/reading-list` added to sitemap (priority 0.1, changeFrequency: never)

### Source Transparency Panel (Issue #24)

**Source Schema & Queries**
- Standalone `source` Sanity document type (reusable across articles, live events, key events) with fields: label, type (7 options: document, interview, statement, data, media, on-scene, other), url, description, `isAnonymous` flag
- `article`: `sources[]` upgraded from inline objects to references; `methodology` text field added
- `liveEvent`: `sources[]` references + `methodology` added
- `keyEvent`: `sources[]` references added
- GROQ queries updated to dereference `sources[]->` and project `methodology`

**Components & UI**
- `SourcesPanel` component — SSR-safe `<details>`/`<summary>` (no JS required); per-type icons (FileText, Mic, MessageSquare, Database, Video, Eye); anonymous sources show Shield icon and hide label/description; linked sources open in new tab; methodology rendered as blockquote
- `articles/[slug]`: replaces minimal sources list with `SourcesPanel`
- `live-event/[slug]`: `SourcesPanel` added after body content
- `ArticleSource` interface and `SourceType` union added to `types.d.ts`; `Article`, `LiveEvent`, `KeyEvent` types updated

**Data Migration**
- `scripts/migrate-sources.mjs` — converted 22 inline `{ label, url }` objects across 4 articles to standalone `source` documents and patched references; supports `--dry-run`

### Corrections & Retractions Workflow (Issue #23)

**Editorial Correction System**
- New reusable `correctionObject` Sanity schema supporting four correction types: `correction` (amber), `clarification` (blue), `update` (green), `retraction` (red)
- `Article` and `LiveEvent` schemas updated to use shared `correctionObject` field (live events support corrections/clarifications/updates only — not retractions)
- `CorrectionNotice` component renders inline above article body with per-type color, icon, label, issued date, and detail text
- Distinct retraction badge (red `bg-untele` + XCircle icon) vs correction badge (amber + AlertTriangle) on all card surfaces (`ArticleCard`, `FeaturedArticleCard`, `ArticleCardLg`)
- Retracted article titles display with `line-through opacity-60` on article and card surfaces
- GROQ queries updated to project `correction { type, issuedAt, summary, detail }` on all article and event fetch paths
- `ArticleCorrection` TypeScript interface added; `correction?` field on `Article` and `LiveEvent` global types

### Analytics & Advertising (Part 1)

**Google Tag Manager & Analytics**
- Consent defaults moved to `beforeInteractive` inline script in `layout.tsx` (before any tags execute)
- `NEXT_PUBLIC_GTM_ID` and `NEXT_PUBLIC_GA4_ID` env vars (renamed from `GTM_ID` and `GA4_ID`)
- `.env.example` created with all required env vars documented with descriptions and source information

**Ad Lazy Loading**
- `BannerAd`, `SidebarAd`, `RectangleAd`, and `InFeedAd` now use `IntersectionObserver` with `AD_CONFIG.PERFORMANCE.LAZY_LOAD_MARGIN` (`200px`) to defer `pushAd` until container approaches viewport

## Fixed

### Analytics & Consent Management

- **GTM never loaded in production** — `GTM_ID` was server-side env var in `'use client'` component (evaluates to `undefined`); renamed to `NEXT_PUBLIC_GTM_ID`
- **Dual GTM + GA4 script conflict** — `ConsentAwareAnalytics` was loading both `gtag/js?id=GTM-…` (GA4) and `gtm.js?id=GTM-…` (GTM) for same ID; now loads only GTM via `gtm.js` with optional separate `gtag/js?id=G-…` for direct GA4
- **Google Consent Mode v2 compliance** — consent defaults moved from GTM `onLoad` callback to `beforeInteractive` script in `layout.tsx` so defaults established before any tags execute
- **Broken `trackPageView`** — called `gtag('config', '')` with empty string; removed broken export; `useConsentAwareTracking` now exposes only `trackEvent`
- **Reactive consent updates** — `gtag('consent', 'update', …)` now fired from `useEffect` in `ConsentAwareAnalytics` when consent preferences change
- **Ad components bypass consent gate** — `BannerAd`, `SidebarAd`, `RectangleAd`, `InFeedAd` now call `useConsentCheck()` and skip `pushAd` until `hasConsent && canUseMarketing`
- **AdSense script torn down on route change** — removed `useEffect` cleanup that removed script tag on unmount; script is persistent global resource
- **`acceptAll` forced full page reload** — `window.location.reload()` removed from consent context; `gtag('consent', 'update')` handles dynamic updates without reload

### Advertising Configuration

- **Hardcoded AdSense publisher ID** — removed `'ca-pub-…'` fallback from `adConfig.ts`, `adsenseInit.ts`, and layout files; all now use `NEXT_PUBLIC_GAS_ID` only (fails loudly if missing)
- **Article page ad slots not in config** — `ARTICLE_RECTANGLE` and `ARTICLE_BANNER_BOTTOM` slot IDs added to `AD_CONFIG.AD_SLOTS`; article page now references named constants instead of raw strings
- **Environment variable naming** — Renamed `GA4_ID` → `NEXT_PUBLIC_GA4_ID` and `GTM_ID` → `NEXT_PUBLIC_GTM_ID` in `.env.local`

---

# [2.2.0] — 2026-03-14 — Best Practices Refactor & Performance Upgrade

## Summary

Full migration to Sanity Live Content API for real-time UI updates, a complete rich text renderer overhaul, SEO/AEO hardening, and best-practice fixes across data fetching, caching, and article presentation. Schema updates for article metadata, live events, and keywords.

## New

### Sanity Live Content API (Issue #6)

- Migration of all 21 server pages and components to `sanityFetch` from `next-sanity/live` for real-time UI updates
- `<SanityLive />` component wired throughout for EventSource-based live updates with no manual revalidation required
- `NavWrapper` migrated from raw `sanityClient.fetch()` to live `sanityFetch` for real-time category updates
- Music detail pages updated: `albums/[slug]`, `lyrics/[slug]`, `music-artists/[slug]` now use live `sanityFetch`
- `generateStaticParams` continues using direct `sanityClient.fetch()` to avoid `draftMode()` conflicts

### Rich Text Renderer

- Complete `RichTextComponents` coverage:
  - Block types: `table` (branded header + striped body), `code` (`vscDarkPlus` syntax highlighting + language label), `mermaidDiagram` (code-block fallback), `blockquote` (untele red left border), `normal` paragraph, `break`
  - Inline marks: `em`, `strong`, `underline`, `strikethrough`, `superscript`, `subscript`, `code` (styled tag)
- Deferred components: `Tweet`, `Prism`, `TimelineJSVisualization` via `next/dynamic` for code-splitting

### Sanity Schema Enhancements

**Article Schema**
- `leadParagraph` field (text, 3 rows) — plain-text summary for AI extraction and featured snippets
- `faqs[]` field — array of `{ question, answer }` objects for FAQPage structured data
- `relatedArticles[]` reference array (max 5) — related article links
- `reviewedBy` reference field — editorial reviewer/fact-checker
- `keywords` migration from `string` → `string[]` with tags layout
- `seoObject` field — metaTitle, metaDescription, ogImage, noIndex, canonicalUrl overrides
- EEAT fields: `location`, `updatedAt`, `corrections`, `sources[]`

**Live Event & Other Schemas**
- `endDate` (datetime) field for complete schema.org Event data
- `eventStatus` enum field (EventScheduled, EventCancelled, EventPostponed, EventMovedOnline); default EventScheduled
- `keywords` migration `string` → `string[]` for live events
- `seoObject` field added to `liveEvent`, `category`, `musicArtist`, `album`, `song`
- Add `siteSettings` singleton to Studio desk structure for global brand config management

### GROQ Queries & Data Fetching

- New/updated queries: `queryEventBySlug` (fixed tag references), `queryAllAuthors` (correct sort), `queryLiveEvents` (with `endDate`, `eventStatus`, `mainImage`, `subtitle`, `videoLink`)
- `queryArticleBySlug` expanded: add `reviewedBy`, `corrections`, `faqs`, `sources`, `updatedAt`, `leadParagraph`, `relatedArticles[]`
- New `queryCategoryBySlug` for category metadata fetches
- 9 files renamed with unique GROQ variable names (descriptive naming instead of generic `query`)
- Auto-generate `sanity.types.ts` from TypeGen: 59 typed queries, 50 schema types

### Metadata & SEO Infrastructure

**Structured Data & OG Tags**
- `GlobalStructuredData` component — NewsMediaOrganization + WebSite + SearchAction schema.org
- `NewsArticleStructuredData` — NewsArticle + BreadcrumbList with FAQPage inclusion when `article.faqs` present
- `Person` structured data on `/author/[slug]` pages
- Event schema.org on `/live-event/[slug]` (eventStatus, location, organizer, image)
- `dateModified` wired from `article.updatedAt` in NewsArticleStructuredData
- Trailing slashes enforced on all `@id` and URL fields (matches `trailingSlash: true`)
- `/public/og-default.png` (1200×630) as branded OG fallback image

**Metadata Helpers**
- `generateMetadata()` to `/articles/[slug]`, `/live-event/[slug]`, `/category/[slug]`, `/author/[slug]`
- `src/util/metadata.ts` — shared helpers: `getCanonicalUrl`, `getSanityOgImageUrl`, `truncate`, `buildArticleMetadata`, `buildLiveEventMetadata`, `buildCategoryMetadata`, `buildAuthorMetadata`
- `seoObject` override wiring into all `buildMetadata` functions (metaTitle, metaDescription, canonicalUrl, ogImage)

**Static Page Metadata**
- `export const metadata` to `/about`, `/staff`, `/donate`, `/lyrics`, `/music-artists` (index)
- Layout-based metadata for client component pages (`/support`, `/secure-contact`, `/whistleblower`, `/join`)

### Article Detail & Content Enhancements

- Render **Reviewed By** link in byline when `reviewedBy` is set
- Render **Corrections** notice block (red left-border) above body when field present
- Render **Sources** list with external links after body
- Render **FAQs** definition list after sources
- Render **Related Articles** section at bottom when `relatedArticles` populated
- Display "Updated: {date}" near byline when `article.updatedAt` differs from `article.publishedAt`

### Live Event & Category Pages

**Live Event Page**
- Render `subtitle` below event title
- Render `eventStatus` badge: red (Cancelled), amber (Postponed), blue (Moved Online), no badge (Scheduled)
- Render `endDate` alongside start date in header
- Fix JSON-LD `eventStatus` mapping from CMS field to correct schema.org URL

**Category Page**
- Fetch category object in parallel with articles (single extra query, no waterfall)
- Render category `title` as `<h1>` and `description` above article grid
- Fix container class typo: `95wv` → `95vw`

### Sitemap & Robots

- Sitemap: homepage priority `0.3` → `1.0`; articles now recency-based (0.8/0.6/0.4); live events 0.9; missing static pages added (`/about/`, `/staff/`, `/donate/`, `/past-events/`)
- `robots.ts` — add `Disallow: /api/`, fix `BASEURL` with fallback chain, explicitly allow all major AI crawlers

### Performance & Rendering

**Server Component Architecture**
- Extract `<Image>`, `<Link>`, gradients from client `Header` into new `HeaderLogo` server component — logo no longer re-renders on client interactions
- Pass `HeaderLogo` as `logoSlot` prop to client `Header`
- Remove unused `localFont` declarations for Geist Sans/Mono (Inter was already active)

**Suspense & Streaming**
- Wrap `FeaturedStoriesGrid` in `<Suspense>` on homepage to avoid blocking on slow Sanity fetches

**Image Optimization**
- Add `placeholder="blur"` + `blurDataURL` (20px Sanity thumbnail) to hero images on: homepage featured stories, article hero, author hero
- Add `priority` to author hero photo on `/author/[slug]` (LCP image preload)
- Add `sizes` prop to homepage featured stories grid for responsive sizing

**Caching & Static Generation**
- Add `generateStaticParams` to all music dynamic routes (`lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]`)
- Migrate music routes to `'use cache'` directive with `cacheTag` (per-document + type-level) and `cacheLife('hours')`
- Enable `experimental.useCache: true` in `next.config.ts`
- Wrap `getArticleBySlug` and `getAuthorBySlug` in `React.cache()` for request-level deduplication

**Bundle & Waterfalls**
- Remove unused `categories` fetch from homepage `Promise.all`
- Defer `CookieConsentBanner`, `AdBlockerMessage` (framer-motion) via `next/dynamic`
- Defer `TimelineJSVisualization` (framer-motion) via `next/dynamic` on timeline pages only
- Remove unused `styled-components` and `@types/styled-components` from `package.json`
- Fix `Header.tsx` scroll handler: `requestAnimationFrame` throttle + `{ passive: true }` listener

**Tooling**
- Enable `typedRoutes: true` in `next.config.ts` experimental (catches broken `<Link href>` at build time)
- Wire up `@next/bundle-analyzer` via `withBundleAnalyzer()` wrapper
- Add `analyze` npm script (`npm run analyze` for interactive bundle treemap)

## Fixed

### Sanity Live API Configuration

- **`defineLive` misconfiguration** — token was inside `client.withConfig()` instead of `serverToken`/`browserToken` options; `<SanityLive />` had no credentials for EventSource subscription
- **`perspective: 'previewDrafts'` hardcoded** — serving draft content to production users; removed so `defineLive` manages perspective internally
- **`experimental_taintUniqueValue` conflict** — blocking `browserToken` from reaching client; sourced directly from `process.env` in `live.ts` to bypass taint check

### Rich Text & Article

- **Inline `code` mark** — was incorrectly using `SyntaxHighlighter`; now uses styled `<code>` tag as intended
- **Article byline** — Reviewed By repositioned from date/location row to sit directly next to author card

### next-sanity Import Paths

- Update `next-sanity` v12 imports: `VisualEditing` now from `next-sanity/visual-editing`, `defineLive` from `next-sanity/live`

### Structured Data & Metadata

- Replace inline `notFound()` div fallback with proper `notFound()` from `next/navigation` in `/articles/[slug]`
- Fix `StructuredData.tsx` — replace `next/script` with plain `<script>` tags for inline JSON-LD (correct RSC pattern)
- Replace boilerplate "Next.js 15 Boilerplate" root layout metadata with UnTelevised Media branding
- Fix `article.keywords` type from `string` → `string[]` in `types.d.ts`
- Fix `liveEvent.keywords` type from `string` → `string[]` in `types.d.ts`
- Add `SeoOverride` interface to `types.d.ts` with overridable SEO fields
- Add `seo?: SeoOverride` to `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song` interfaces
- Add `endDate?: string` and `eventStatus?` fields to `LiveEvent` interface

### Data Migrations

- `migrations/keywords-string-to-array/` — splits existing comma-separated keyword strings into arrays; 41 articles scanned, 25 patched
- `migrations/liveEvent-keywords-string-to-array/` — same for live events; 5 documents scanned and patched

## Updated

### Music Detail Pages

- Removed `'use cache'` / `cacheTag` / `cacheLife` wrappers from `albums/[slug]`, `lyrics/[slug]`, `music-artists/[slug]`
- Live API now handles cache invalidation via EventSource; per-function caching was redundant
- All `sanityFetch` call sites updated to destructure `{ data }` from live API return value (live API returns `{ data, sourceMap, tags }`)

### Theme & Styling

- `SyntaxHighlighter` theme updated from `dark` to `vscDarkPlus`

---

### Sanity Live Content API — Real-Time UI Updates (2026-03-14)

Closes [#6](https://github.com/UnTelevised-Media/untelevised-media-new/issues/6)

#### Summary

All server-rendered pages and components now use the Sanity Live Content API (`sanityFetch` from `lib/live.ts` / `next-sanity/live`). The `<SanityLive />` component was already mounted in both `(user)` and `(music)` layouts; this change wires every data query into the live system so that content published in Sanity Studio appears on the site immediately — no rebuild or manual revalidation required.

#### Changed — Data Fetching (21 files)

- Replace `import sanityFetch from '@/lib/sanity/lib/fetch'` (legacy ISR) with `import { sanityFetch } from '@/lib/sanity/lib/live'` (live API) across all server pages and components
- Destructure `{ data }` from the live `sanityFetch` return value at every call site (live API returns `{ data, sourceMap, tags }` instead of raw data)
- Remove `as Promise<T>` type casts no longer needed after the destructuring change

#### Changed — NavWrapper

- `src/components/global/NavWrapper.tsx`: migrated from raw `sanityClient.fetch()` to live `sanityFetch` so the navigation categories update in real time

#### Changed — Music Detail Pages

- `src/app/(music)/albums/[slug]/page.tsx`
- `src/app/(music)/lyrics/[slug]/page.tsx`
- `src/app/(music)/music-artists/[slug]/page.tsx`
  - Removed `'use cache'` / `cacheTag` / `cacheLife` wrappers (from `next/cache`)
  - Replaced direct `sanityClient.fetch()` calls with live `sanityFetch`
  - Live API handles cache invalidation via EventSource; per-function caching was redundant and prevented real-time updates

#### Not Changed (intentional)

- `generateStaticParams()` in all dynamic routes — continues to use direct `sanityClient.fetch()` to avoid `draftMode()` during static generation
- `src/components/global/Ticker.tsx` — client component; cannot use server-side `sanityFetch`; polling via direct client call is retained
- Metadata utility functions — run at build/revalidation time, direct calls appropriate

---

### Schema-to-UI Data Pass + Site Config (2026-03-14)

#### Queries — Bug Fixes

- Fix `queryEventBySlug`: `tag[]->` → `eventTag[]->` — was silently returning null for all event tags
- Fix `queryAllAuthors`: remove nonsensical `author->` self-reference; correct sort to `order(order desc)`

#### Queries — New Fields

- `queryLiveEvents` (current events listing): add `endDate`, `eventStatus`, `mainImage`, `subtitle`, `videoLink` — homepage `LiveWidget` now receives full event data
- `queryArticleBySlug`: add `reviewedBy->{ name, slug, title, image }` and explicit `corrections` field

#### Article Detail Page (`articles/[slug]`)

- Render **Reviewed By** link in byline when `reviewedBy` is set
- Render **Corrections** notice block (red left-border alert) above article body when the field has content
- Render **Sources** list with external links after article body
- Render **FAQs** definition list after sources — surfaces structured Q&A already powering FAQPage JSON-LD

#### Live Event Detail Page (`live-event/[slug]`)

- Render `subtitle` below the event title
- Render `eventStatus` badge: red for Cancelled, amber for Postponed, blue for Moved Online (no badge for Scheduled)
- Render `endDate` alongside start date in the header
- Fix JSON-LD `eventStatus`: now maps from CMS `eventStatus` field to correct `schema.org` URL instead of hardcoding based on `isCurrentEvent`

#### Category Page (`category/[slug]`)

- Fetch category object in parallel with articles (single extra query, no waterfall)
- Render category `title` as `<h1>` and `description` above the article grid
- Fix typo in container class: `95wv` → `95vw`

#### TypeScript Types (`types.d.ts`)

- Add `endDate?: string` to `LiveEvent` interface
- Add `eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventMovedOnline'` to `LiveEvent` interface

#### Social Media — Account Updates

- YouTube: `@UnTelevised` → `@AntiWarTV` (banned, new account)
- TikTok: `@untelevisedmedia` → `@radical.edward` (banned, new account)
- Updated in: `Footer.tsx`, `Socials.tsx`, `GlobalStructuredData.tsx` (sameAs array — TikTok also added)

#### Email — Domain Migration

- `newsroom@untelevised.live` → `newsroom@untelevised.media` (all 5 footer contact links)
- `UnTelevisedMedia.Live@gmail.com` → `support@untelevised.media` (donate page + support page)
- Addresses to provision: `newsroom@untelevised.media`, `support@untelevised.media`

#### Live News Banner

- Remove `<Banner />` from `(user)/layout.tsx` — was appearing on every page
- Add `<Banner />` to top of `(user)/page.tsx` — now homepage-only

#### Project Docs

- Add `.project/email-addresses.md` — inventory of all hardcoded email addresses with file locations and purpose

---

### Audit — Second Pass (2026-03-13)

Full second-pass audit against Next.js, Sanity, SEO/AEO, and Vercel/React best-practice skills. All prior items confirmed complete. New open items surfaced and logged in `.project/planning/audit/` and `.project/planning/checklist.md`.

#### Open — P2

- `notFound()` missing on 6 dynamic routes: `author/[slug]`, `live-event/[slug]`, `albums/[slug]`, `lyrics/[slug]`, `music-artists/[slug]`, `category/[slug]` — all currently return inline "not found" divs instead of triggering the proper Next.js 404 mechanism
- JSON-LD `MusicAlbum` structured data missing from `albums/[slug]`
- JSON-LD `MusicComposition` structured data missing from `lyrics/[slug]`
- JSON-LD `MusicGroup`/`Person` structured data missing from `music-artists/[slug]`
- `albums/[slug]` `generateMetadata` emits `keywords` as a template-literal string instead of `string[]`

#### Open — P3

- JSON-LD `ItemList`/`CollectionPage` structured data missing from `timeline/[slug]`
- JSON-LD `CollectionPage` structured data missing from `category/[slug]`

---

### Sanity TypeGen

- Add `sanity.config.ts` at project root (CLI-only config — no `'use client'`, no `@/` aliases) to enable `pnpm sanity typegen generate` without conflicts with the embedded studio config
- Move `sanity.cli.ts` to project root (was at `src/lib/sanity/sanity.cli.ts`)
- Generate `sanity.types.ts` at project root — 59 typed GROQ queries, 50 schema types; replaces hand-written TypeScript interfaces
- Rename 9 files with duplicate GROQ variable names (`query` → descriptive unique names) to reach 0 TypeGen warnings; affected: author, category, live-event, policies, timeline, timeline-category, timeline-event slug pages; `getAllUrls.ts`; `generateBlogCatMetadata.ts`; `generateMetadata.ts`

---

### Sanity Schema — Article

- Add `leadParagraph` field (`type: 'text'`, 3 rows) — plain-text 2–3 sentence summary for AI extraction and featured snippets
- Add `faqs[]` field — array of `{ question, answer }` objects for FAQPage schema.org structured data
- Add `relatedArticles[]` reference array field (max 5) — links to related article documents
- Add `reviewedBy` reference field — editorial reviewer / fact-checker author reference
- Migrate `keywords` field from `type: 'string'` → `type: 'array'` of strings with tags layout (type a keyword and press Enter or comma to add)
- Create `migrations/keywords-string-to-array/index.ts` — splits existing comma-separated keyword strings into arrays on migration run
- Update `buildArticleMetadata` in `src/util/metadata.ts` to use keywords array directly (removes `.split(',')` splitting)
- Update `NewsArticleStructuredData` to join keywords array for output

---

### Sanity Schema — Live Event & Other Types

- Add `endDate` (`datetime`) field to `liveEvent` schema for complete schema.org Event structured data
- Add `eventStatus` field to `liveEvent` — string enum: EventScheduled / EventCancelled / EventPostponed / EventMovedOnline; default: EventScheduled
- Add `seoObject` field to: `liveEvent`, `category`, `musicArtist`, `album`, `song` schemas — consistent per-document SEO override fields across all content types

---

### Sanity Studio

- Add `siteSettings` singleton to Studio desk structure via `S.listItem()` — accessible at top level for global brand config management

---

### SEO & Metadata

#### Structured Data Fixes

- Wire `dateModified` from `article.updatedAt` into `NewsArticleStructuredData` — was previously using `publishedAt` for both dates
- Ensure all structured data `@id` and URL fields use trailing slashes (matches `trailingSlash: true` in `next.config.ts`)
- Render `FAQPage` structured data inside `NewsArticleStructuredData` when `article.faqs` is present — high AEO value for AI citation
- Add `Person` structured data JSON-LD to `/author/[slug]` pages — `@type: 'Person'`, `worksFor`, `sameAs`, `knowsAbout` fields

#### Static Page Metadata

- Add `export const metadata` to `/about` — "About UnTelevised Media"
- Add `export const metadata` to `/staff` — "Our Team — UnTelevised Media"
- Add `export const metadata` to `/donate` — "Support Independent Journalism"
- Add metadata via `layout.tsx` to `/support`, `/secure-contact`, `/whistleblower`, `/join` (client component pages; metadata in parent layout is the correct Next.js pattern)
- Add `export const metadata` to `/lyrics` (index) and `/music-artists` (index) music listing pages

#### OG Image

- Add `/public/og-default.png` — 1200×630 branded fallback OG image for pages without a specific image
- Update root `layout.tsx` OG image reference from `og-default.jpg` → `og-default.png`

---

### Article Page

- Expand `queryArticleBySlug` GROQ to include: `seo`, `faqs`, `sources`, `updatedAt`, `leadParagraph`, `relatedArticles[]->` (with `_id`, `title`, `slug`, `mainImage`, `description`, `publishedAt`, `author->`)
- Render Related Articles section at the bottom of article pages when `relatedArticles` is populated
- Display "Updated: {date}" near byline when `article.updatedAt` differs from `article.publishedAt`

---

### Performance

#### Server Component Architecture

- Server-hoist logo: extract `<Image>`, `<Link>`, gradient decorations from client `Header` into new `HeaderLogo` server component (`src/components/global/HeaderLogo.tsx`) — logo no longer re-renders on every client interaction
- Pass `HeaderLogo` as `logoSlot` prop to client `Header` — clean server/client composition pattern applied in `(user)/layout.tsx` and `(music)/layout.tsx`
- Remove unused `localFont` declarations for Geist Sans and Geist Mono from `src/app/layout.tsx` — Inter (via `next/font/google`) was already the active font; body `className` simplified

#### Suspense & Streaming

- Wrap `FeaturedStoriesGrid` in `<Suspense>` on homepage — was blocking full-page render on slow Sanity fetch

#### LQIP Blur Placeholders

- Add `placeholder="blur"` + `blurDataURL` (20px Sanity thumbnail) to hero images on: homepage featured stories (`page.tsx`), article hero (`articles/[slug]/page.tsx`), author hero (`author/[slug]/page.tsx`) — reduces CLS on image load

#### Cache & Static Generation

- Fix `generateStaticParams` in `/articles/[slug]` — replace raw `sanityClient.fetch` with `sanityFetch` to keep static params consistent with tag-based ISR revalidation
- Add `generateStaticParams` to all music dynamic routes (`lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]`) — enables static generation at build time
- Migrate all 3 music dynamic routes to `'use cache'` directive with `cacheTag` (per-document + type-level) and `cacheLife('hours')` — replaces ISR on music pages with fine-grained per-function cache control
- Enable `experimental.useCache: true` in `next.config.ts` to activate `'use cache'` directive, `cacheTag()`, and `cacheLife()` from `next/cache`

---

### Performance

#### Bundle Size / Waterfalls

- Remove unused `categories` fetch from homepage `Promise.all` — eliminates one extra Sanity round-trip on every homepage load
- Defer `CookieConsentBanner` and `AdBlockerMessage` (framer-motion) via `next/dynamic` — code-splits framer-motion out of the initial JS bundle on every page
- Defer `TimelineJSVisualization` (framer-motion) via `next/dynamic` on timeline pages — only loads when a timeline page is visited
- Defer `react-tweet` `Tweet` component and `react-syntax-highlighter` `Prism` via `next/dynamic` in `RichTextComponents` — only loaded when article body contains those block types
- Remove unused `styled-components` and `@types/styled-components` from `package.json`

#### Images / Re-renders

- Add `priority` to author hero photo on `/author/[slug]` — was LCP image without preload hint
- Add `sizes` prop to homepage featured stories grid — prevents browser from fetching oversized images
- Fix `Header.tsx` scroll handler: `requestAnimationFrame` throttle + `{ passive: true }` listener — eliminates forced reflows on scroll
- Wrap `getArticleBySlug` and `getAuthorBySlug` in `React.cache()` — `generateMetadata` and the page component now share a single fetch per request instead of making two round-trips

#### Tooling

- Enable `typedRoutes: true` in `next.config.ts` experimental — catches broken internal `<Link href>` at build time
- Wire up `@next/bundle-analyzer` (already installed) via `withBundleAnalyzer()` wrapper in `next.config.ts`
- Add `analyze` npm script — run `npm run analyze` to open interactive bundle treemap

### SEO & AEO

#### Added

- Event schema.org structured data on `/live-event/[slug]` pages (eventStatus, location, organizer, image)
- Canonical URL, Twitter card, and `alternates.canonical` to `/music-artists/[slug]` metadata
- Canonical URL, Twitter card, and `alternates.canonical` to `/albums/[slug]` metadata
- New Sanity schema `seoObject` — reusable SEO object with metaTitle, metaDescription, ogImage, noIndex, canonicalUrl fields; added to `article` schema
- New Sanity schema `siteSettings` — singleton for global brand config (name, description, logo, social links, foundingDate, defaultOgImage)
- EEAT fields on `article` schema: `location`, `updatedAt`, `corrections`, `sources[]`
- EEAT fields on `author` schema: `credentials[]`, `expertise[]`, `sameAs[]`, `location`, `isActive`
- `GlobalStructuredData` component — NewsMediaOrganization + WebSite + SearchAction schema.org rendered in `(user)/layout.tsx`
- `NewsArticleStructuredData` component — NewsArticle + BreadcrumbList schema.org on every article page
- `generateMetadata()` to `/articles/[slug]` — unique title, description, OG image, canonical URL per article
- `generateMetadata()` to `/live-event/[slug]` — per-event metadata with live status in title
- `generateMetadata()` to `/category/[slug]` — per-category metadata using new `queryCategoryBySlug`
- `generateMetadata()` to `/author/[slug]` — per-author metadata with OG profile image
- `queryCategoryBySlug` GROQ query for category metadata fetches
- Canonical URL, Twitter card, and `alternates.canonical` to `/lyrics/[slug]` metadata
- `src/util/metadata.ts` — shared helpers: `getCanonicalUrl`, `getSanityOgImageUrl`, `truncate`, `buildArticleMetadata`, `buildLiveEventMetadata`, `buildCategoryMetadata`, `buildAuthorMetadata`

#### Fixed

- Update `next-sanity` v12 import paths: `VisualEditing` now from `next-sanity/visual-editing`, `defineLive` now from `next-sanity/live`
- Replace boilerplate "Next.js 15 Boilerplate" root layout metadata with UnTelevised Media branding
- Replace inline `notFound()` div fallback with proper `notFound()` from `next/navigation` in `/articles/[slug]`
- Fix `StructuredData.tsx` — replace `next/script` with plain `<script>` tags for inline JSON-LD (correct RSC pattern)
- Fix `sitemap.ts` — homepage priority `0.3` → `1.0`, article priorities now recency-based (`0.8/0.6/0.4`), live events `0.9`, all URLs use trailing slashes, added missing static pages (`/about/`, `/staff/`, `/donate/`, `/past-events/`)
- Fix `robots.ts` — add `Disallow: /api/`, fix `BASEURL` with fallback to `NEXT_PUBLIC_APP_URL` then hardcoded production URL, explicitly allow all major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, cohere-ai)

---

### Sanity Schema — Live Event Keywords

- Migrate `liveEvent.keywords` field from `type: 'string'` → `type: 'array'` of strings with tags layout (consistent with article keywords)
- Create `migrations/liveEvent-keywords-string-to-array/index.ts` — splits existing comma-separated strings into arrays on migration run; skips documents already holding an array
- Update `buildLiveEventMetadata` in `src/util/metadata.ts` — use keywords array directly, remove `.split(',')` splitting
- Update `generateLiveEventMetadata` in `src/util/metadata/generateLiveEventMetadata.ts` — same array-aware fix

---

### Production Data Migrations

- Run `keywords-string-to-array` against `articles` dataset — 41 documents scanned, 25 article documents patched (keywords field converted from comma-separated string to array)
- Run `liveEvent-keywords-string-to-array` against `articles` dataset — 5 liveEvent documents scanned and patched

---

### SEO & Metadata — seoObject Override Wiring

- Wire `seo.metaTitle`, `seo.metaDescription`, `seo.canonicalUrl`, `seo.ogImage` overrides into `buildLiveEventMetadata` — per-event Studio overrides now take precedence over computed defaults
- Wire `seo` overrides into `buildCategoryMetadata` — per-category Studio SEO fields now applied
- Wire `seo` overrides into `generateMetadata` for `/lyrics/[slug]` — `song.seo?.metaTitle ?? computedTitle` pattern
- Wire `seo` overrides into `generateMetadata` for `/music-artists/[slug]` — same pattern
- Wire `seo` overrides into `generateMetadata` for `/albums/[slug]` — same pattern
- Add `seo` field to `queryCategoryBySlug` GROQ projection — was previously not returned from Sanity

---

### TypeScript Types

- Add `SeoOverride` interface to `types.d.ts` — shared type with `metaTitle?`, `metaDescription?`, `ogImage?`, `noIndex?`, `canonicalUrl?` fields
- Add `seo?: SeoOverride` to `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song` global interfaces
- Correct `Article.keywords` type from `string` → `string[]` in `types.d.ts` (was mismatched with schema)
- Correct `LiveEvent.keywords` type from `string` → `string[]` in `types.d.ts`

---

# [2.2.1] — 2026-03-16 — Production Hotfix & Accessibility/SEO Sprint

## Summary

Critical hotfix for Sanity Live API timeout issue causing 502 errors, plus addition of RSS feed, breaking news banner, and reading time estimates. Includes security hardening (debug component removal), SEO improvements, and accessibility enhancements.

## New

### RSS Feed (Issue #9, PR #30)

- `/feed.xml` RFC-compliant RSS 2.0 route handler with merged articles + live events
- Latest 50 articles + latest 20 live events, merged and date-sorted by publish date
- Live events include `🔴 LIVE:` title prefix, newsroom attribution, `'Live Coverage'` category  
- `media:content` image elements via `urlForImage`; RFC 2822 pubDate format
- Cache strategy: `s-maxage=3600` CDN cache + hourly ISR revalidation
- RSS auto-discovery `<link>` added to root layout metadata for feed discovery
- TODO markers for future `liveEvent → breaking` schema migration

### Breaking News Banner (Issue #12, PR #31)

**Sanity Integration**
- Editor-controlled site-wide alert via `siteSettings.breakingNewsBanner` singleton in Sanity
- Fields: `isActive`, `headline`, `linkUrl`, `linkLabel`, `expiresAt` (auto-expire)
- Instant live updates via `sanityFetch` from `lib/live` + `SanityLive` (no page refresh required)

**User Experience**
- Positioned below `<NavWrapper />` (under category nav)
- Per-session dismiss via `sessionStorage`; key derived from headline (resets on new headline)
- Server-side `expiresAt` guard + client-side secondary guard for safety
- Accessible: `role="alert"`, `aria-label`, keyboard-navigable dismiss with focus ring
- Fixed: More dropdown `pointer-events-none` when hidden to prevent hover bleed

### Reading Time Estimate (Issue #20, PR #32)

**Core Implementation**
- `src/lib/readingTime.ts` — `estimateReadingTime(body, extras?)` utility at 200 wpm (standard adult pace), minimum 1 minute
- `readingTimeFromWordCount()` helper for GROQ-projected `wordCount` on card components
- `wordCount` calculated via GROQ: `length(string::split(pt::text(body), " "))` (actual words, not chars)
- `wordCount?: number` added to global `Article` type in `types.d.ts`

**Displays**
- Article detail page counts body + FAQ questions/answers + source labels via `extras` param
- Shown on: `ArticleCard`, `FeaturedArticleCard`, featured stories grid, `RawFeed`, article detail page

### Sitemap Completion (Issue #16, PR #29)

- Added static pages: `/timelines`, `/join`, `/support`, `/secure-contact`, `/whistleblower`
- Added dynamic timeline individual pages via new `queryTimelines` in `getAllURLs.ts`
- `robots.ts` — added `Disallow` for `/privacy-settings`, `/reading-list`, `/unlock`; explicit `Allow: /feed.xml`

## Fixed

### Production Incident: Sanity Live API Hang → 502

**Root Cause & Diagnosis**
- `sanityFetch` from `next-sanity`'s `defineLive` would hang indefinitely when Sanity Live API was slow/unresponsive
- No timeout caused Vercel's 30-second serverless function limit to kill request → 502 error (no logs, blank page)
- Local dev unaffected (no timeout in `next dev`)
- Pattern: works when cache warm, 502s when cache expires and fresh server render needed
- Vercel logs showed 200 OK at 99ms (ISR PRERENDER cache hits), but ISR revalidation-triggered fresh renders would hang

**Fixes**
- `src/lib/sanity/lib/live.ts` — wrapped `sanityFetch` in `Promise.race` with 8-second timeout; throws descriptive error to Vercel logs instead of silent hang
- `src/components/global/NavWrapper.tsx` — added try/catch; falls back to empty category list to render nav instead of crashing layout
- `src/components/global/BreakingNewsBanner.tsx` — added try/catch; returns null (no banner) on fetch failure instead of propagating error

### Security Hardening

- Deleted `src/components/debug/` — all 6 components removed: AdDebugger, TestAd, TestAdComponent, AdSenseTestComponent, AdSenseTroubleshooter, ConsentDebugger (Issue #15, PR #28)
- Deleted `/timeline-debug` and `/timeline-simple-test` public routes (debug exposure eliminated)
- Deleted `src/app/api/debug-log/route.ts` — unauthenticated POST endpoint removed
- Removed unconditional `<AdDebugger />` render from music layout

### Content & Navigation

- Removed decorative `Banner` component from homepage (consolidated from earlier work)
- `privacy-settings/layout.tsx` — added `noindex` metadata (page is `'use client'`, metadata via layout)

## Updated

### Metadata & Configuration

- AdSense article page slot IDs updated to verified ad units
- `robots.ts` — added `Disallow` entries for private pages and explicit `Allow` for `/feed.xml`

---
