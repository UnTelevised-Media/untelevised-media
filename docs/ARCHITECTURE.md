# Architecture Guidelines

This document outlines the layered architecture of UnTelevised Media and import rules for each layer.

## Layer Overview

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION (src/app, src/components)                      │
│ - Pages, layouts, UI components                             │
│ - Smart and dumb components                                 │
│ - Can import from ALL lower layers                          │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ HOOKS (src/hooks)                                           │
│ - Custom React hooks                                        │
│ - State management (Zustand)                                │
│ - Context consumers                                         │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ SERVER (src/server)                                         │
│ - Server actions ('use server')                             │
│ - Cron jobs                                                 │
│ - Request handlers                                          │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ SERVICES (src/services)                                     │
│ - Feature modules with side effects                         │
│ - Database/API integrations                                 │
│ - Email, captcha, storage services                          │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE (src/lib)                                    │
│ - Third-party library setup                                 │
│ - Configuration and clients                                 │
│ - Infrastructure utilities                                  │
│ - Can have own visual components (lib/sanity/components/)   │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ MODELS (src/models)                                         │
│ - TypeScript types and interfaces                           │
│ - Zod schemas and validation                                │
│ - Data structure definitions                                │
└─────────────────────────────────────────────────────────────┘
                            ↑
┌─────────────────────────────────────────────────────────────┐
│ UTILITIES (src/util)                                        │
│ - Pure functions (no side effects)                          │
│ - No React dependencies                                     │
│ - String formatting, serializers, validators               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Import Rules

### util/ - Pure Functions Only

**Can import from:**
- `models/` (types, schemas)

**Cannot import from:**
- `lib/` ❌
- `services/` ❌
- `server/` ❌
- `hooks/` ❌
- `components/` ❌

**Examples:**
- `src/util/formatDate.ts` - Date formatting
- `src/util/sanitize.ts` - String sanitization
- `src/util/stripeUtils.ts` - Stripe utility functions

**Guidelines:**
- ✓ Pure functions only (no side effects)
- ✓ No external dependencies
- ✓ No React imports
- ✗ No hooks or state
- ✗ No server/client markers

---

### models/ - Types & Schemas

**Can import from:**
- Nothing (self-contained)

**Cannot import from:**
- Anything else ❌

**Examples:**
- `src/models/types/bookstore/` - Commerce types
- `src/models/types/membership/` - Membership types
- `src/models/validations/jobApplication.ts` - Zod schemas

**Guidelines:**
- ✓ Pure type definitions
- ✓ Zod schemas for validation
- ✓ Re-exports of related types
- ✗ No logic
- ✗ No functions beyond type utilities

---

### lib/ - Infrastructure

**Can import from:**
- `util/`
- `models/`

**Cannot import from:**
- `services/` ❌
- `server/` ❌
- `hooks/` ❌
- `components/` ❌

**Subdirectories:**
- `src/lib/auth/` - Authentication helpers
- `src/lib/sanity/` - Sanity CMS setup + `components/` for Sanity visual customization
- `src/lib/googleAdSense/` - Ad setup
- `src/lib/consent/` - Consent management

**Examples:**
- `src/lib/sanity/client.ts` - Sanity client configuration
- `src/lib/auth/roles.ts` - Role-based access control
- `src/lib/sanity/components/` - Sanity-specific UI (DraftModeBanner, VisualEditing)
- `src/lib/sanity/preview.ts` - Preview URL logic

**Guidelines:**
- ✓ Library and client setup
- ✓ Own visual components for infrastructure needs (lib/sanity/components/)
- ✓ Configuration and initialization
- ✗ No feature logic
- ✗ No React components in root (use components/ subdirectory)

---

### services/ - Feature Logic

**Can import from:**
- `util/`
- `lib/`
- `models/`

**Cannot import from:**
- `server/` ❌
- `hooks/` ❌
- `components/` ❌

**Structure:**
```
src/services/
├── bookstore/     - E-commerce logic
├── membership/    - Subscription/membership
├── newsletter/    - Email subscriptions
├── portal/        - Portal-specific logic
├── storage/       - Client storage adapters
└── captcha.ts     - Captcha verification
```

**Examples:**
- `src/services/bookstore/` - Cart, checkout, order logic
- `src/services/newsletter/service.ts` - Email campaigns
- `src/services/portal/live.ts` - Portal-specific server functions

**Guidelines:**
- ✓ Feature-specific business logic
- ✓ Database/API integrations
- ✓ Complex operations with side effects
- ✗ No React components
- ✗ No server actions (use server/ for that)

---

### server/ - Server Actions & Handlers

**Can import from:**
- `util/`
- `lib/`
- `services/`
- `models/`

**Cannot import from:**
- `hooks/` ❌
- `components/` ❌

**Structure:**
```
src/server/
├── actions/       - 'use server' functions
│   └── portal/    - Portal-specific actions
└── cron/          - Scheduled tasks
```

**Examples:**
- `src/server/actions/portal/article.ts` - Article mutations
- `src/server/cron/cleanup-briefs.ts` - Cleanup scheduled task

**Guidelines:**
- ✓ Server-side only functions
- ✓ Use `'use server'` directive
- ✓ Can call services and database
- ✓ Can be called from client actions
- ✗ No React hooks
- ✗ No browser APIs

---

### hooks/ - React Hooks

**Can import from:**
- `util/`
- `lib/`
- `services/`
- `models/`

**Cannot import from:**
- `components/` ❌

**Structure:**
```
src/hooks/
├── bookstore/
│   └── useCart.ts          - Zustand cart store
│   └── useWishlist.ts      - Wishlist management
├── googleAdSense/
│   ├── useAdContext.ts     - Ad manager context
│   ├── useAdBlockerDetection.ts
│   ├── useConsent.tsx      - Consent provider + hooks
│   └── useConsentAwareTracking.ts
├── useBookmarks.ts         - Bookmark management
├── useAsyncError.ts        - Error boundary helper
└── use-toast.ts            - Toast notifications
```

**Examples:**
- `src/hooks/useCart.ts` - Shopping cart state
- `src/hooks/useConsent.tsx` - Consent management
- `src/hooks/useBookmarks.ts` - Bookmark state

**Guidelines:**
- ✓ Custom React hooks
- ✓ State management (Zustand stores)
- ✓ Context consumers
- ✓ Effects and lifecycle
- ✗ No async server operations (import from services/)
- ✗ No browser-only features (not for server)

---

### components/ - Presentation Layer

**Can import from:**
- `util/`
- `lib/`
- `services/`
- `server/`
- `hooks/`
- `models/`

**Structure:**
```
src/components/
├── googleAdSense/    - Ad-related components
├── analytics/        - Analytics tracking
├── bookstore/        - E-commerce UI
├── consent/          - Consent UI
├── error/            - Error handling
├── global/           - Global UI (nav, footer)
├── newsletter/       - Newsletter signup
├── portal/           - Portal-specific UI
├── providers/        - Context providers
├── ui/               - Reusable UI components
└── pages/            - Page-specific layouts
```

**Component Types:**

#### Dumb Components (Presentational)
- Props-only, no logic
- No imports from services, server, hooks
- Examples: BookCard, Button, Header
- Location: `ui/`, `archive/`, `post/`

#### Smart Components (Container)
- With state, effects, hooks
- Can import from services, server, hooks
- Examples: ArticleEditorForm, BookstorePage
- Location: `portal/`, `bookstore/`, `analytics/`

**Guidelines:**
- ✓ Import from all lower layers
- ✓ Can use hooks
- ✓ Can call server actions
- ✓ Co-locate styles with component
- ✓ One component per file
- ✗ No business logic (use services/)
- ✗ No pure utilities (use util/)

---

## Common Patterns

### ✓ CORRECT

```typescript
// In components/bookstore/AddToCartButton.tsx
'use client';
import { useCart } from '@/hooks/bookstore/useCart';
import { buildCartItem } from '@/hooks/bookstore/useCart';
import { useConsentAwareTracking } from '@/hooks/googleAdSense/useConsentAwareTracking';
import type { SanityBook } from '@/models/types/bookstore';

export function AddToCartButton({ book }: { book: SanityBook }) {
  const { addItem } = useCart();
  const { trackEvent } = useConsentAwareTracking();

  const handleClick = () => {
    addItem(buildCartItem(book));
    trackEvent('add_to_cart');
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

### ✓ CORRECT

```typescript
// In services/bookstore/checkout.ts
import { supabase } from '@/lib/supabase/client';
import type { Order } from '@/models/types/bookstore';

export async function processCheckout(orderId: string): Promise<Order> {
  return supabase.from('orders').select('*').eq('id', orderId).single();
}
```

### ✓ CORRECT

```typescript
// In util/formatDate.ts
import type { DateFormat } from '@/models/types/common';

export function formatDate(date: Date, format: DateFormat): string {
  // Pure function, no side effects
  return new Intl.DateTimeFormat('en-US').format(date);
}
```

### ✓ CORRECT - Client-Side Pagination (Homepage Feeds)

**Pattern: Server fetches all articles once, client handles pagination via slicing**

For homepage feeds (RawFeed, FieldReports, TrendingList), use client-side pagination:
- ✅ Single API call on page load
- ✅ Instant pagination (no network delay)
- ✅ Lowest API quota usage
- ⚠️ Trade-off: ~100-200KB in browser memory (acceptable at current traffic levels)

```typescript
// In components/homepage/RawFeedServer.tsx (server component)
export default async function RawFeedServer({ excludedIds }: Props) {
  // Fetch ALL articles once - single API call
  const { data: articles } = await sanityFetch<RawFeedArticle[]>({
    query: `*[_type == "article" && defined(slug.current) ${excludeFilter}]
      | order(publishedAt desc) { ... }`,
    tags: ['article'],
  });

  // Pass all articles to client component for pagination
  return <RawFeedPaginated articles={articles ?? []} />;
}
```

```typescript
// In components/homepage/RawFeedPaginated.tsx (client component)
'use client';

export default function RawFeedPaginated({ articles }: Props) {
  const [page, setPage] = useState(0);

  // Client-side pagination: slice articles as user clicks "Load More"
  const visibleArticles = articles.slice(0, (page + 1) * ARTICLES_PER_PAGE);
  const hasMore = page < Math.ceil(articles.length / ARTICLES_PER_PAGE) - 1;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1); // Instant update, no network call
  };

  return (
    <>
      {visibleArticles.map(/* render articles */)}
      {hasMore && <button onClick={handleLoadMore}>Load More</button>}
    </>
  );
}
```

**When to use:**
- ✓ Homepage feeds with ~100-500 items
- ✓ Site traffic < 10K visitors/month
- ✓ Priority: minimize API quota usage

**When NOT to use:**
- ❌ Large datasets (10K+ items)
- ❌ High-traffic sites with memory constraints
- ❌ SEO pagination (use URL-based server-side pagination instead)

### ❌ INCORRECT

```typescript
// In util/helper.ts - DO NOT DO THIS
import { useConsent } from '@/hooks/googleAdSense/useConsent'; // ❌ WRONG

export function somePureFunction() {
  const { canUseMarketing } = useConsent(); // ❌ Can't use hooks in util
  // ...
}
```

### ❌ INCORRECT

```typescript
// In lib/sanity/client.ts - DO NOT DO THIS
import ConsentBanner from '@/components/consent/CookieConsentBanner'; // ❌ WRONG
import { useConsent } from '@/hooks/googleAdSense/useConsent'; // ❌ WRONG

// lib/ should not import from components/ or hooks/
```

### ❌ INCORRECT

```typescript
// In services/bookstore/cart.ts - DO NOT DO THIS
import { AdManager } from '@/components/googleAdSense/AdManager'; // ❌ WRONG

// services/ should not import from components/
```

---

## Dependency Graph

```
components/ ──→ hooks/ ──→ services/ ──→ lib/ ──→ util/ ──→ models/
    ↓             ↓            ↓          ↓        ↓
  server/ ────────┘            └──────────┘        └─────────┘
```

**Valid import directions:**
- `→` (downward) = ✓ ALLOWED
- Anything else = ❌ BLOCKED

---

## Special Cases

### Infrastructure with Own Components

`lib/sanity/components/` contains Sanity-specific visual customization:
- DraftModeBanner.tsx
- VisualEditing.tsx
- LiveVisualEditing.tsx
- PreviewLink.tsx

These are exceptions to the rule—they're in `lib/` because they're infrastructure-specific UI, not general components.

**When to use lib/*/components/:**
- Customization UI for third-party libraries
- Infrastructure-specific visual elements
- Not general-purpose UI (use src/components/ for that)

---

## Migration Guide

If you need to move code between layers:

1. **Moving UP (toward components/):**
   - Remove imports from lower layers that aren't allowed
   - Add needed hooks/state
   - Example: services/ → components/ (add hooks, remove db calls)

2. **Moving DOWN (toward util/):**
   - Remove React dependencies
   - Remove imports from higher layers
   - Convert to pure functions
   - Example: components/ → hooks/ (extract logic into hook)

3. **File organization:**
   - Create feature directories
   - Co-locate related code
   - Keep imports local within features
   - Example: `services/bookstore/` contains all bookstore logic

---

## Questions?

If you're unsure where something belongs:

1. **Has React/hooks?** → `hooks/` or `components/`
2. **Pure function?** → `util/`
3. **Type definition?** → `models/`
4. **Library setup?** → `lib/`
5. **Feature logic?** → `services/`
6. **Server-only?** → `server/`

Ask the team or refer back to this guide. We enforce these rules with ESLint boundaries.

---

**Last Updated:** June 2026
**Architecture Score:** 8/10 (after Phase 1 fixes)
**Violations:** 0 (enforced by ESLint)
