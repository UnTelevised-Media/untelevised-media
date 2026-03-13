# UnTelevised Media — Open Issues Checklist

> Compiled from audit files in `.project/planning/audit/`
> Last updated: 2026-03-13
> Issues #2 (SEO/AEO) and #3 (Performance) merged to `development`. All items below are remaining work.



- [x] **Add `generateStaticParams` to music dynamic routes**
  Added to `lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]` — each queries Sanity directly for all slugs at build time using `sanityClient.fetch`.
  > Audit ref: `01`

- [x] **Migrate Sanity fetches to `use cache` directive (Next.js 16)**
  Enabled `experimental.useCache: true` in `next.config.ts`. Converted data-fetch functions on all three music pages (`getSongBySlug`, `getMusicArtistBySlug`, `getAlbumBySlug`) from `sanityFetch` ISR tags to `'use cache'` + `cacheTag()` + `cacheLife('hours')`. Music pages chosen as the initial migration target since they don't use draft mode / visual editing. Existing `sanityFetch` ISR pattern retained on all other pages.
  > Audit ref: `04`
