# Plan: Reduce Vercel Free Tier Usage — UnTelevised Media

## Context

The site is actively exceeding multiple Vercel Hobby free limits as of June 2026:

| Metric | Used | Limit | Status |
|---|---|---|---|
| Fast Origin Transfer | 30.03 GB | 10 GB | **3× OVER** |
| Vercel Functions Duration | 253.6 GB-Hrs | 100 GB-Hrs | **2.5× OVER** |
| Edge Requests | 1,557,722 | 1,000,000 | **56% OVER** |
| Vercel Function Invocations | 1,211,557 | 1,000,000 | **21% OVER** |
| Fast Data Transfer | 21.95 GB | 100 GB | OK (22%) |
| ISR Reads | 453,338 | 1,000,000 | OK (45%) |

These overages started spiking around **June 13** based on the charts. Three root causes explain all four overruns.

---

## Root Cause 1 — Function Duration 2.5× Over

**File**: `src/lib/supabase/viewEvents.ts`

`getTrendingArticles()` (lines 112–167) fetches **every single row** from `view_count` for the past 45 days with no server-side aggregation:
```ts
client.from('view_count').select('slug, viewed_at').gte('created_date', dateStr)
```
Then counts them in JavaScript. As the table grows this downloads tens of thousands of rows into serverless function memory on **every ISR render** of the homepage and every category page. `getMostReadByCategory()` (lines 173–225) has the exact same pattern.

This is called:
- On every homepage render via `TrendingSection.tsx` (React.cache deduplicates within one render but not across ISR cycles)
- On every category page via `category/[slug]/page.tsx` calling `getTrendingArticles(45, 100)`

## Root Cause 2 — Origin Transfer 3× Over

**File**: `next.config.ts` — `remotePatterns` includes `cdn.sanity.io`

Every `<Image>` component using a Sanity CDN URL routes through Vercel's image optimizer (`/_next/image`). Vercel fetches the original from `cdn.sanity.io` (this is the "Origin Transfer" — data pulled FROM external CDN INTO Vercel compute), transforms it, and caches it. With 52 files using `<Image>` and multiple srcset breakpoints (640, 828, 1080, 1200, 1920), every ISR cycle regenerates hundreds of image transform requests.

Sanity's CDN already handles image resizing natively via URL params (`?w=800&q=75&auto=format`). Routing through Vercel's optimizer doubles the data transfer for zero quality benefit.

## Root Cause 3 — High Edge Requests (contributes to both 56% over + invocations 21% over)

**Files**: 
- `src/components/global/Ticker.tsx` — polls `sanityClient.fetch()` **every 5 minutes** for ALL articles (`*[_type=='article']`) with no limit. Every open tab is a browser calling Sanity every 5 min indefinitely.
- `src/components/post/ViewPing.tsx` → `POST /api/view-queue` fires on every unique article page load per browser session. High traffic site = many invocations.
- Article page renders `<TrendingSection />` twice (desktop sidebar + mobile), each triggering the Supabase query (React.cache prevents double-call within one render, but every ISR cycle is a fresh call).

---

## Changes — In Priority Order

### Fix 1 (CRITICAL): SQL aggregation via Supabase RPC + `unstable_cache`

**Step A** — Create this SQL function in the Supabase dashboard SQL editor (view_count project):

```sql
CREATE OR REPLACE FUNCTION get_trending_articles(days_back integer, result_limit integer)
RETURNS TABLE(slug text, view_count bigint, last_viewed timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    slug,
    COUNT(*)::bigint AS view_count,
    MAX(viewed_at)::timestamptz AS last_viewed
  FROM view_count
  WHERE created_date >= (CURRENT_DATE - days_back)
  GROUP BY slug
  ORDER BY view_count DESC
  LIMIT result_limit;
$$;
```

**Step B** — Rewrite `src/lib/supabase/viewEvents.ts`:
- Replace the `getTrendingArticles` body: use `client.rpc('get_trending_articles', { days_back: daysBack, result_limit: limit })` instead of fetching all rows
- Wrap the entire function in `unstable_cache` with a 5-minute TTL so the Supabase round-trip is shared across all concurrent ISR renders

```ts
import { unstable_cache } from 'next/cache';

export const getTrendingArticles = unstable_cache(
  async (daysBack = 7, limit = 31): Promise<TrendingArticle[]> => {
    const client = getServerClient();
    const { data, error } = await client.rpc('get_trending_articles', {
      days_back: daysBack,
      result_limit: limit,
    });
    if (error) throw error;
    return (data ?? []).map((row: { slug: string; view_count: string; last_viewed: string }) => ({
      slug: row.slug,
      view_count: Number(row.view_count),
      last_viewed: row.last_viewed,
    }));
  },
  ['supabase-trending'],
  { revalidate: 300, tags: ['trending'] }
);
```

- Apply same RPC + `unstable_cache` pattern to `getMostReadByCategory` (though this function's `categorySlugs` param is never actually used in the DB query — the function fetches all rows and the category filter is never applied. Fix by noting this in comments; the RPC above provides the same output.)

**Expected impact**: Eliminates the large data download on every render. Function Duration should drop from 253 GB-Hrs toward ~20–40 GB-Hrs. The 5-minute cache means the Supabase call runs at most 12 times/hour regardless of traffic volume.

---

### Fix 2 (CRITICAL): Bypass Vercel image optimization for Sanity CDN images

**New file**: `src/lib/sanity/imageLoader.ts`

```ts
'use client';

export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.startsWith('https://cdn.sanity.io')) {
    const url = new URL(src);
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality ?? 75));
    url.searchParams.set('auto', 'format');
    return url.toString();
  }
  // Non-Sanity images (Pexels, Supabase storage) — return original URL
  // These are rare; their own CDNs handle caching
  return src;
}
```

**Change `next.config.ts`**:
```ts
images: {
  loaderFile: './src/lib/sanity/imageLoader.ts',
  deviceSizes: [640, 828, 1080, 1200, 1920],  // keep existing
  imageSizes: [64, 128, 256, 384],              // keep existing
  // Remove remotePatterns — no longer needed since loader bypasses Vercel optimization
  // (keep remotePatterns if you want Vercel to still handle Pexels/Supabase images)
}
```

With `loaderFile`, Next.js calls the loader function to build srcset URLs instead of routing through `/_next/image`. Sanity CDN URLs get `?w=640`, `?w=828`, etc. appended directly — no Vercel compute involved.

**Expected impact**: Origin Transfer drops from 30 GB toward near-zero for Sanity images. Edge Requests drop by a large fraction since `/_next/image` requests disappear. Sanity CDN serves images directly to browsers.

**Important**: This changes image delivery globally. Test that images render correctly at all breakpoints after deploy. Sanity CDN already serves WebP/AVIF via `auto=format`.

---

### Fix 3 (HIGH): Ticker — add article limit to prevent full-table fetch

**File**: `src/components/global/Ticker.tsx`

Change the two GROQ queries (lines 26–43) to slice to the 50 most recent items:

```ts
const queryArticles = groq`
  *[_type=='article'] { _id, title, _createdAt }
  | order(_createdAt desc)
  [0..49]
`;

const queryKeyEvent = groq`
  *[_type=='keyEvent'] { _id, title, _createdAt }
  | order(_createdAt desc)
  [0..49]
`;
```

These queries already have proper field projections (`_id, title, _createdAt`) so they're not fetching bodies. The only fix needed is the `[0..49]` slice so Sanity returns 50 items max instead of the entire article corpus.

**Expected impact**: Minor reduction in Sanity CDN bandwidth per poll cycle. Also prevents the ticker from freezing browsers on sites with thousands of articles.

---

### Fix 4 (MEDIUM): Cache the sitemap

**File**: `src/app/sitemap.ts`

Add at the top:
```ts
export const revalidate = 3600;
```

The sitemap currently calls `sanityClient.fetch()` bare (no ISR caching, no tags). Google and Bing crawlers request sitemaps frequently. Each request hits Sanity's API directly and runs as a serverless function invocation.

---

### Fix 5 (LOW): Deduplicate `getMostReadByCategory` on category pages

**File**: `src/app/(news)/category/[slug]/page.tsx`

The category page calls `getTrendingArticles(45, 100)` which (after Fix 1) will be `unstable_cache`'d and shared. No additional change needed beyond Fix 1.

If `getMostReadByCategory` is still referenced anywhere: it fetches the same data as `getTrendingArticles` but ignores the `categorySlugs` parameter entirely (the JS aggregation doesn't filter by slug at all). This is effectively a duplicate of `getTrendingArticles`. Consider removing it or fixing the category filtering.

---

## What NOT to Change

- **ISR strategy**: The 24-hour `REVALIDATE_CEILING_SECONDS` + webhook tag invalidation is correct. Don't reduce this.
- **`/api/view-queue`**: The per-view insert is by design. The sessionStorage guard prevents repeat writes. This contributes ~1.2M invocations but each is fast (single INSERT). After fixing image optimization this will become less of a problem proportionally.
- **Sanity `useCdn: true`**: Already correct — don't change.
- **`React.cache()` in TrendingSection**: Keep it for per-render dedup. Fix 1's `unstable_cache` handles cross-request dedup.
- **AdSense or Sentry**: Don't remove these without explicit discussion — they're revenue/error tracking.

---

## Implementation Order

1. **Run SQL in Supabase dashboard** (5 min, no code deploy needed)
2. **Deploy Fix 1** (`viewEvents.ts` rewrite) — biggest Function Duration win
3. **Deploy Fix 2** (image loader + next.config) — biggest Origin Transfer win
4. **Deploy Fix 3 + 4** (Ticker limit + sitemap cache) — minor wins, safe

---

## Verification

After each deploy, check the Vercel dashboard under **Usage → Networking and Functions**:
- **Function Duration**: should drop from 253 GB-Hrs toward <50 GB-Hrs within the billing cycle
- **Origin Transfer**: should drop from 30 GB toward <2 GB after the image loader is live
- **Edge Requests**: should drop by a large fraction once `/_next/image` requests disappear

Functional checks:
- Load any article page and confirm hero image, TrendingSection images, and author avatar all render at correct sizes
- Open browser DevTools → Network → verify image URLs point to `cdn.sanity.io?w=828&q=75&auto=format` (not `/_next/image`)
- Confirm the Ticker scrolls with article headlines
- Hit `/sitemap.xml` and confirm it returns without error

Supabase check:
- In Supabase SQL editor, run: `SELECT * FROM get_trending_articles(7, 10);` — should return aggregated counts instantly
