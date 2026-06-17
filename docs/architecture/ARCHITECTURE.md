# Architecture

**Last Updated:** June 2026  
**Version:** 2.2.2

Complete system architecture and design for UnTelevised Media.

---

## Tech Stack

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| **Frontend** | React | 19.2.7 | UI framework |
| **Framework** | Next.js | 16.2.7 | App router, SSR/SSG |
| **Language** | TypeScript | 6.0.3 | Type safety |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first CSS |
| **UI Components** | Radix UI / Shadcn | Latest | Headless components |
| **CMS** | Sanity | 5.30.0 | Content management |
| **Database** | Supabase (PostgreSQL) | Latest | Structured data |
| **Search** | Algolia | 5.53.0 | Full-text search |
| **Authentication** | Clerk | 7.4.3 | User auth & sessions |
| **Payments** | Stripe | 22.2.0 | Payment processing |
| **Email** | Resend | 6.12.2 | Transactional emails |
| **Rate Limiting** | Upstash Redis | Latest | Throttling & cache |
| **Monitoring** | Sentry | 10.56.0 | Error tracking |
| **Deployment** | Vercel | N/A | Edge hosting |
| **Analytics** | Vercel Analytics, GTM | Latest | Performance & events |

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ React Components                                             │  │
│  │ - News pages (articles, categories, authors)               │  │
│  │ - Music section (albums, artists, lyrics)                  │  │
│  │ - Bookstore (products, cart, checkout)                     │  │
│  │ - Contributor Portal (articles, earnings, settings)        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│         ┌──────────────────┼──────────────────┐                     │
│         │                  │                  │                     │
└─────────┼──────────────────┼──────────────────┼─────────────────────┘
          │                  │                  │
    ┌─────▼──────┐    ┌──────▼─────┐    ┌──────▼────────┐
    │ API Routes │    │  Auth Flow │    │  Direct Query │
    │ (Node.js)  │    │ (Clerk)    │    │  (Sanity)     │
    └─────┬──────┘    └──────┬─────┘    └──────┬────────┘
          │                  │                  │
    ┌─────┴──────────────────┴──────────────────┴────────┐
    │         Next.js App Router (SSR/SSG/ISR)          │
    │  ┌─────────────────────────────────────────────┐  │
    │  │  Server Components & Route Handlers         │  │
    │  │  - Query Sanity for content                │  │
    │  │  - Query Supabase for structured data      │  │
    │  │  - Process Stripe webhooks                 │  │
    │  │  - Rate limit via Upstash                  │  │
    │  │  - Cache on Vercel Edge                    │  │
    │  └─────────────────────────────────────────────┘  │
    └────────────────┬──────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
   ┌────▼────┐  ┌───▼────┐  ┌───▼────┐  ┌───▼────────┐
   │ Sanity  │  │Supabase│  │ Stripe │  │ External  │
   │  CMS    │  │Database│  │ Payments│  │ Services  │
   │         │  │        │  │        │  │ (Algolia, │
   │ Content │  │Orders  │  │Events  │  │  Resend,  │
   │ Schemas │  │Products│  │Webhooks│  │  Sentry)  │
   │ Studio  │  │Users   │  │        │  │           │
   └─────────┘  └────────┘  └────────┘  └───────────┘
```

---

## Deployment Architecture

```
GitHub Repository
        │
        ├─► Push to main/dev branch
        │
        ▼
   GitHub Actions CI
        │
        ├─► Run tests
        ├─► Type check
        ├─► Lint code
        │
        ▼
   Vercel (Edge Platform)
        │
        ├─► Build Next.js app
        ├─► Generate static pages
        ├─► Deploy to edge CDN
        │
        ▼
   Edge Locations (Global)
        │
        ├─► Serve from nearest region
        ├─► Cache images/assets
        ├─► Run serverless functions
        │
        ▼
   Production Environment
        │
        ├─► www.untelevised.media
        ├─► /studio → Sanity
        ├─► /api/* → Route handlers
```

---

## Route Groups & Organization

Next.js organizes routes into logical groups:

### `(news)` — News Section
**Path prefix:** Removed from URL

```
src/app/(news)/
├── page.tsx                    → /
├── articles/[slug]/
│   ├── page.tsx               → /articles/[slug]/
│   └── opengraph-image.tsx    → Dynamic OG image
├── category/[slug]/page.tsx    → /category/[slug]/
├── author/[slug]/page.tsx      → /author/[slug]/
├── breaking/page.tsx           → /breaking/
├── breaking/[slug]/page.tsx    → /breaking/[slug]/
├── fact-checks/page.tsx        → /fact-checks/
├── fact-check/[slug]/page.tsx  → /fact-check/[slug]/
├── search/page.tsx             → /search/
├── timeline/[slug]/page.tsx    → /timeline/[slug]/
└── ...other pages
```

### `(music)` — Music Section
```
src/app/(music)/
├── albums/[slug]/page.tsx      → /albums/[slug]/
├── lyrics/page.tsx             → /lyrics/
├── lyrics/[slug]/page.tsx      → /lyrics/[slug]/
├── music-artists/page.tsx      → /music-artists/
└── music-artists/[slug]/page.tsx → /music-artists/[slug]/
```

### `(user)` — Bookstore & User Pages
```
src/app/(user)/
├── bookstore/page.tsx          → /bookstore/
├── bookstore/book/[slug]/      → /bookstore/book/[slug]/
├── bookstore/cart/page.tsx     → /bookstore/cart/
├── bookstore/orders/page.tsx   → /bookstore/orders/
└── ...other pages
```

### `(portal)` — Contributor Portal
```
src/app/(portal)/
├── portal/page.tsx             → /portal/
├── portal/articles/page.tsx    → /portal/articles/
├── portal/articles/new/page.tsx → /portal/articles/new/
├── portal/articles/[id]/edit/  → /portal/articles/[id]/edit/
├── portal/earnings/page.tsx    → /portal/earnings/
└── ...other pages
```

### `(studio)` — Sanity CMS
```
src/app/(studio)/
└── studio/[[...tool]]/page.tsx → /studio/*
```

### Root `/api` — API Routes
```
src/app/api/
├── view/route.ts               → /api/view
├── bookstore/checkout/route.ts → /api/bookstore/checkout
├── newsletter-subscribe/route.ts → /api/newsletter-subscribe
├── admin/set-role/route.ts     → /api/admin/set-role
├── webhooks/stripe/route.ts    → /api/webhooks/stripe
└── ...other endpoints
```

---

## Data Flow

### 1. Fetching Content (Server Components)

```typescript
// src/app/(news)/articles/[slug]/page.tsx

export default async function ArticlePage({ params }) {
  // 1. Fetch from Sanity at render time
  const article = await sanityFetch({
    query: ARTICLE_QUERY,
    params: { slug: params.slug },
  });

  // 2. Server-side data processing
  const readingTime = calculateReadingTime(article.content);

  // 3. Generate static params
  return {
    title: article.title,
    // Components render on server with data
  };
}

// Fetch at build time for static routes
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map(a => ({ slug: a.slug }));
}
```

### 2. Content Updates (ISR)

```
1. Editor publishes content in Sanity
   ↓
2. Sanity webhook calls /api/revalidate
   ↓
3. Next.js clears cache for affected pages
   ↓
4. Next rebuild triggered (background)
   ↓
5. Users see updated content on next visit
   (old cached version served while rebuilding)
```

### 3. Real-time Updates (SanityLive)

```typescript
// Root layout wraps app with SanityLive
<SanityLive {...config}>
  <YourContent />
</SanityLive>

// Enables live content updates via WebSocket
// When editor publishes, updates stream to browser
// Draft mode shows unpublished content immediately
```

### 4. User Actions & State

```
User action (e.g., "Add to cart")
    ↓
Client-side handler
    ↓
API call → Server route handler
    ↓
Route handler processes:
- Validate input
- Check auth/permissions
- Query database
- Update state
- Call external APIs (Stripe, Resend)
    ↓
Response sent to client
    ↓
Client updates UI
```

---

## Caching Strategy

### Static Generation (Default)

```typescript
// Pages pre-rendered at build time
// Fastest: served from CDN instantly
export const revalidate = false; // Don't revalidate

// Example: Music artist pages (rarely change)
```

### Incremental Static Regeneration (ISR)

```typescript
// Pages pre-rendered but revalidated periodically
export const revalidate = 3600; // Revalidate every hour

// Example: Article pages (published regularly)
// Benefits:
// - Fast initial page load (cached)
// - Content updates within 1 hour
// - Automatic rebuild in background
```

### Dynamic Rendering (SSR)

```typescript
// Rendered on each request
// Slowest but most current: no revalidate
// Example: User dashboard (personalised content)

// Triggered by:
// - Clerk auth check
// - Dynamic search params
// - Calling non-cached APIs
```

### Edge Caching (Vercel)

```
Page served from nearest edge location
  ↓
Cache headers set: max-age=60 (1 minute)
  ↓
Browser caches: max-age=30 (30 seconds)
  ↓
Images cached permanently (hash-based)
```

---

## Authentication Flow

### Clerk Setup

```
1. User visits site
    ↓
2. Clerk middleware checks session
    ↓
3. If not authenticated:
   - Redirect to sign-in page
   - User creates account
   - Session created
    ↓
4. Session token stored in:
   - HttpOnly cookie (server)
   - Memory (client)
    ↓
5. Middleware enforces access:
   - Public pages: allowed
   - Portal pages: check role
   - Admin pages: require admin role
```

### Role-Based Access

```typescript
// On every request to portal:
const session = await auth();

if (!session?.userId) {
  // Not logged in
  redirect('/sign-in');
}

const role = session.publicMetadata?.role;

if (!hasRole(role, 'author')) {
  // Not an author/editor/admin
  redirect('/');
}

// User has access
```

---

## Database Schema (Supabase)

### Core Tables

```
users
├── id (UUID, PK)
├── email
├── clerk_id (links to Clerk)
└── created_at

orders
├── id (UUID, PK)
├── user_id (FK → users)
├── items (JSON array)
├── total (cents)
├── status (processing|shipped|delivered)
└── created_at

order_items
├── id (UUID, PK)
├── order_id (FK → orders)
├── product_id
├── quantity
└── price_at_purchase

products
├── id (UUID, PK)
├── title
├── price (cents)
├── inventory
└── type (physical|digital|bundle)

view_events (analytics)
├── id (UUID, PK)
├── article_id
├── user_id (nullable)
├── country
└── created_at

product_reviews
├── id (UUID, PK)
├── product_id
├── user_id (FK → users)
├── rating (1-5)
├── text
└── created_at

wishlists
├── id (UUID, PK)
├── user_id (FK → users)
├── product_id
└── added_at
```

---

## Sanity Content Schema

### Key Document Types

```
Article
├── title (string)
├── slug (slug)
├── content (block content)
├── author (reference → Author)
├── category (reference → Category)
├── publishedAt (datetime)
├── viewCount (number, calculated)
└── status (draft|published|archived)

Book (Bookstore)
├── title
├── author
├── price
├── inventory
├── format
├── content (description)
└── file (digital asset)

Author
├── name
├── slug
├── bio
├── avatar
└── articles (back-reference)

Timeline
├── title
├── category
├── events (array of Event objects)
└── description
```

---

## API Layer Pattern

All route handlers follow common patterns:

```typescript
// POST /api/[feature]/route.ts

import { auth } from '@clerk/nextjs/server';
import { validateInput } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    // 1. PARSE & VALIDATE
    const body = await request.json();
    const validated = await validateInput(body, schema);

    // 2. AUTHENTICATE
    const session = await auth();
    if (!session?.userId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. AUTHORIZE
    if (!hasRole(session.publicMetadata?.role, 'author')) {
      return json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. RATE LIMIT
    const limit = await rateLimit.limit(`user_${session.userId}`);
    if (!limit.success) {
      return json({ error: 'Too many requests' }, { status: 429 });
    }

    // 5. PROCESS
    const result = await processRequest(validated, session);

    // 6. RESPOND
    return json({ success: true, data: result });

  } catch (error) {
    // LOG & REPORT
    logger.error(error);
    Sentry.captureException(error);

    // RESPOND
    return json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Error Handling

### Client-side

```typescript
// Components handle errors gracefully
try {
  const response = await fetch('/api/action', { method: 'POST' });
  const data = await response.json();

  if (!response.ok) {
    toast.error(data.error); // Show to user
    return;
  }

  // Success
  toast.success('Done!');
  setData(data.result);
} catch (error) {
  toast.error('Network error');
  Sentry.captureException(error); // Report
}
```

### Server-side

```typescript
// All errors logged to Sentry
try {
  // Business logic
} catch (error) {
  // Log for debugging
  console.error('Route error:', error);

  // Report to monitoring
  Sentry.captureException(error, {
    contexts: {
      request: {
        url: request.url,
        method: request.method,
      },
    },
  });

  // Return safe error message
  return json(
    { error: 'Something went wrong' },
    { status: 500 }
  );
}
```

---

## Performance Optimizations

### Image Optimization

```typescript
// Next.js Image automatically:
// 1. Resizes to exact size needed
// 2. Converts to modern formats (WebP)
// 3. Lazy loads below fold
// 4. Serves from CDN

<Image
  src={imageUrl}
  alt="Description"
  width={600}
  height={400}
  priority={isBelowFold ? false : true}
  placeholder="blur"
  blurDataURL={...}
/>
```

### Code Splitting

```typescript
// Dynamic imports split code into chunks
const CookieConsentBanner = dynamic(
  () => import('@/components/consent/CookieConsentBanner'),
  { ssr: false }
);

// Loads only when component renders
// Reduces initial bundle size
```

### Component Patterns

```typescript
// Suspense for streaming
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>

// Lazy load "below fold" content
{showComments && <CommentsSection />}

// Server Components reduce JS
// Client Components only for interactivity
'use client';
```

---

## Security Architecture

### Input Validation

```typescript
// Server-side validation only
const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

const validated = schema.parse(input);
```

### Authentication

- Clerk handles auth (industry standard)
- Sessions HttpOnly cookies (CSRF safe)
- JWT tokens for API (stateless)

### Authorization

- Role-based access control (RBAC)
- Row-level security in Supabase
- Verified on every protected request

### Data Protection

- HTTPS only (enforced by Vercel)
- Sensitive data in environment variables
- Payment data never stored (Stripe handles)
- Rate limiting prevents abuse

### API Security

```typescript
// Webhook signature verification
const signature = req.headers['stripe-signature'];
try {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    webhookSecret
  );
} catch {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## Monitoring & Observability

### Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error, {
  level: 'error',
  tags: {
    section: 'bookstore',
    action: 'checkout',
  },
});
```

### Performance Analytics (Vercel)

- Core Web Vitals automatically tracked
- Page load times by region
- Edge function execution time
- Bundle size monitoring

### Application Logging

```typescript
// Structured logging
logger.info('Article published', {
  articleId: article.id,
  authorId: session.userId,
  timestamp: new Date(),
});

logger.error('Payment failed', {
  orderId: order.id,
  reason: error.message,
  stripeError: stripeResponse.error,
});
```

---

## Key Architectural Decisions

### Why Next.js App Router?

- Built-in SSR, SSG, ISR
- Server Components reduce bundle
- File-based routing (DX)
- Edge functions support
- Vercel integration seamless

### Why Sanity?

- Headless CMS (not tied to frontend)
- Real-time collaboration
- Powerful query language (GROQ)
- Excellent Next.js integration
- Visual editing support

### Why Supabase?

- PostgreSQL reliability
- Row-level security
- Realtime subscriptions
- Auth integration options
- Open source escape hatch

### Why Clerk?

- Complete auth solution (sessions + user mgmt)
- Multi-factor auth built-in
- No password hashing needed (outsourced)
- Role-based metadata
- Third-party OAuth support

---

## Scaling Considerations

### Current Capacity

- **Users:** ~100k
- **Content:** ~50k articles
- **Requests:** ~1M/day
- **Database:** Supabase free tier (adequate)

### Scaling Points

| Resource | Limit | Action |
|----------|-------|--------|
| Supabase | 50k rows/table → Add read replicas |
| Algolia | 10k records/plan → Upgrade plan |
| Vercel | Unlimited edge → Already scaled |
| Sanity | Document count → Upgrade plan |
| Stripe | Rate limits | Auto-scales |

### Optimization Order

1. **Add database indexes** (cheapest)
2. **Increase ISR revalidation** (cache more aggressively)
3. **Upgrade services** (Supabase, Algolia)
4. **Add CDN for assets** (Cloudflare)
5. **Separate read replicas** (database only)

---

## Development Environments

### Local Development

```
npm run dev
→ http://localhost:3000
→ Connects to production Sanity/Supabase
→ USE TEST STRIPE KEYS
→ Full feature access
```

### Staging

```
Separate Sanity project
Separate Supabase project
Test payment keys
Deploy on push to staging branch
```

### Production

```
Production Sanity project
Production Supabase project
Live payment keys
Deploy on push to main branch
```

---

## Deployment Pipeline

```
Push to GitHub
    ↓
GitHub Actions CI runs
    ↓
✓ All checks pass?
    ├─ NO → Block merge
    └─ YES → Continue
    ↓
Merge to main/staging
    ↓
Vercel webhook triggered
    ↓
Build Next.js app
    ↓
Run tests
    ↓
✓ All pass?
    ├─ NO → Build fails
    └─ YES → Continue
    ↓
Generate static pages
    ↓
Deploy to edge
    ↓
✓ Health checks pass?
    ├─ NO → Rollback
    └─ YES → Live
    ↓
Announce update
```

---

## Questions & References

- **Data modeling:** See [Content Schemas](../features/cms/SCHEMAS.md)
- **API patterns:** See [API Design](./API_DESIGN.md)
- **Database:** See [Supabase Setup](../technical/database/SUPABASE.md)
- **Deployment:** See [Deployment Guide](../operations/DEPLOYMENT.md)

---

## Architecture Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-06 | Use Next.js App Router | Modern framework with SSR/ISR support |
| 2024-07 | Sanity CMS | Headless, flexible, great DX |
| 2024-08 | Supabase database | PostgreSQL, good scaling story |
| 2024-09 | Clerk auth | Complete solution, less code |
| 2024-10 | Stripe for payments | Industry standard, secure |
| 2025-01 | Add Algolia search | Full-text, faceted search needed |
| 2025-03 | Move to Supabase view tracking | Sanity viewCount limited, needed analytics |
| 2026-06 | Current architecture | Stable, performant, maintainable |

---

## Glossary

See [Glossary](../GLOSSARY.md) for common terms and acronyms.
