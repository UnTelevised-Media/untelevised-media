# UnTelevised Media — Feature Roadmap & Working Order

> Last updated: 2026-03-21
> Issues: [GitHub Issues Board](../../issues)

---

## ✅ Completed

| Issue | Title | PR |
|-------|-------|----|
| #2  | SEO & AEO: Full site metadata, structured data, EEAT | — |
| #3  | Performance: Bundle size, streaming, image optimisation | — |
| #6  | Migrate data fetching to Sanity Live Content API | — |
| #9  | RSS Feed /feed.xml | [#30](https://github.com/UnTelevised-Media/untelevised-media-new/pull/30) |
| #12 | Breaking News Banner | [#31](https://github.com/UnTelevised-Media/untelevised-media-new/pull/31) |
| #15 | Remove Debug Routes | [#28](https://github.com/UnTelevised-Media/untelevised-media-new/pull/28) |
| #16 | Sitemap Completion | [#29](https://github.com/UnTelevised-Media/untelevised-media-new/pull/29) |
| #17 | Careers Page & Application Form | [#37](https://github.com/UnTelevised-Media/untelevised-media-new/pull/37) |
| #19 | Bookmarks & Reading List (localStorage + Clerk/Sanity sync) | [#36](https://github.com/UnTelevised-Media/untelevised-media-new/pull/36) / [#39](https://github.com/UnTelevised-Media/untelevised-media-new/pull/39) |
| #20 | Reading Time Estimate | [#32](https://github.com/UnTelevised-Media/untelevised-media-new/pull/32) |
| #23 | Corrections & Retractions Workflow | [#33](https://github.com/UnTelevised-Media/untelevised-media-new/pull/33) |
| #24 | Source Transparency Panel | [#34](https://github.com/UnTelevised-Media/untelevised-media-new/pull/34) |
| #25 | Fact-Check Content Type & ClaimReview JSON-LD | [#38](https://github.com/UnTelevised-Media/untelevised-media-new/pull/38) |
| #26 | Editorial Standards & About The Newsroom | [#35](https://github.com/UnTelevised-Media/untelevised-media-new/pull/35) |
| #8  | Tag Pages | [#40](https://github.com/UnTelevised-Media/untelevised-media-new/pull/40) |
| #21 | Full-Text Search Upgrade (Algolia) | [#41](https://github.com/UnTelevised-Media/untelevised-media-new/pull/41) |

---

## Remaining Open Issues

| Issue | Title | Priority | Effort |
|-------|-------|----------|--------|
| #7  | Analytics Audit — 11 issues (4 critical) | **HIGH** (bug) | S |
| ~~#8~~  | ~~Tag Pages~~ | ~~Medium~~ | ~~Done~~ |
| #10 | PWA & Push Notifications | Medium | XL |
| #11 | Live Event Auto-Refresh | Medium | M |
| #13 | Membership / Supporter Tiers (Stripe) | Medium | XL |
| #14 | Paywalled Content *(blocked on #13)* | Low | L |
| #18 | Comments System (Giscus) | Medium | S |
| ~~#21~~ | ~~Full-Text Search Upgrade (Algolia)~~ | ~~**HIGH**~~ | ~~Done~~ |
| #22 | Trending / Most Read | Medium | M |
| #27 | Newsletter / Email List (Resend) | **HIGH** | M |

---

## Priority × Effort Matrix

|              | **XS** (<1h) | **S** (1–3h)          | **M** (4–6h)                        | **L** (8–12h) | **XL** (12h+)          |
|--------------|--------------|-----------------------|-------------------------------------|---------------|------------------------|
| **HIGH**     | —            | #7 Analytics Audit    | #27 Newsletter                      | —             | —                      |
| **MEDIUM**   | —            | #18 Comments          | #8 Tags · #11 Live Refresh · #22 Trending | —       | #13 Membership · #10 PWA |
| **LOW**      | —            | —                     | —                                   | #14 Paywall\* | —                      |

> \* #14 Paywalled Content has a hard dependency on #13 Membership Tiers.

---

## Scoring & Working Order Logic

Each issue scored on: `(Priority × 2) + Ease`, where:
- Priority: High=3, Medium=2, Low=1
- Ease (inverse of effort): XS=5, S=4, M=3, L=2, XL=1

| Score | Issues |
|-------|--------|
| 10    | #7 Analytics Audit *(High/S — 4 critical bugs, fix before next release)* |
| 9     | #27 Newsletter |
| 8     | #18 Comments |
| 7     | #8 Tags · #11 Live Refresh · #22 Trending |
| 5     | #13 Membership · #10 PWA |
| 4     | #14 Paywall *(blocked)* |

---

## Recommended Working Order — 3 Remaining Phases

### 🔧 Phase 3 — Fix & Audience (Current Sprint)
> Clear the critical bug backlog and complete the reader relationship layer.
> **Estimated total: ~8–10 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 1 | **#7 Analytics Audit** | S | 4 critical bugs in production — must fix before growing audience |
| 2 | **#27 Newsletter / Email List** | M | Highest-ROI engagement feature; audience ownership |
| 3 | **#18 Comments System (Giscus)** | S | Quick engagement win; consent-gated, no backend |

---

### 🔍 Phase 4 — Discovery & Live News (Sprint 4)
> Improves content navigability and delivers on the live-news promise.
> **Estimated total: ~15–18 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 4 | **#8 Tag Pages** | M | SEO + navigation; Sanity schema tweak + new route |
| 5 | **#11 Live Event Auto-Refresh** | M | Core live-news UX; polling hook + updates banner |
| 6 | **#22 Trending / Most Read** | M | Discovery; view counter API + homepage section |
| ~~7~~ | ~~**#21 Full-Text Search Upgrade**~~ | ~~L~~ | ~~✅ Shipped in PR #41~~ |

---

### 🚀 Phase 5 — Major Undertakings (Future Sprints)
> Multi-day builds. Do these after the platform foundation is solid.
> **Estimated total: 30–40+ hours**

| # | Issue | Effort | Dependencies & Notes |
|---|-------|--------|----------------------|
| 8  | **#13 Membership / Supporter Tiers** | XL | Stripe subscriptions; **must ship before #14** |
| 9  | **#14 Paywalled / Members-Only Content** | L | **Requires #13 complete** — token auth gating |
| 10 | **#10 PWA & Push Notifications** | XL | Benefits from Breaking News Banner (#12 ✅) being live |

---

## Dependency Map

```
#13 Membership Tiers
  └── #14 Paywalled Content (blocked until #13 ships)

#12 Breaking News Banner ✅
  └── #10 PWA Push Notifications (banner content drives push payloads)

#7 Analytics Audit
  └── Should resolve before #27 Newsletter ships (tracking must be clean
      before actively growing the subscriber list)
```

---

## Phase Summary at a Glance

| Phase | Focus | Issues | Est. Hours |
|-------|-------|--------|------------|
| ✅ 1 — Quick Wins | Cleanup + SEO + Editorial basics | #15, #16, #9, #12, #24, #20 | Done |
| ✅ 2 — Credibility | Corrections, Sources, Fact-Check, Editorial Standards, Careers, Bookmarks | #23, #24, #25, #26, #17, #19 | Done |
| 3 — Fix & Audience | Analytics bugs + Newsletter + Comments | #7, #27, #18 | ~8–10h |
| ✅ 4 — Discovery & Live | Tags + live refresh + trending + search | #8 ✅, #21 ✅, #11, #22 | ~8–10h remaining |
| 5 — Major Undertakings | Membership + Paywall + PWA | #13, #14, #10 | ~30–40h+ |
| **Remaining** | | **8 issues** | **~43–56h** |

---

## Ongoing (Parallel / Any Phase)

- Any `effort: s` or `effort: xs` issue can be batched into the end of a sprint when time remains
- #7 Analytics Audit is the only open **bug** — treat it as a blocker for audience growth work

---

## 🍑 Top 3 Low-Hanging Fruit (Easiest First)

Issues ranked by: fewest prereqs, least new infrastructure, lowest risk, smallest scope.

---

### 1. #18 — Comments System (Giscus) · `effort: S` · ~2h

**Why it's the easiest:** Purely additive — nothing breaks if it ships. The entire feature is one React component, one Sanity boolean field, and three environment variables. The only "setup" is clicking two checkboxes on GitHub (enable Discussions, install Giscus app) and copying three IDs from giscus.app. No new paid services, no backend routes, no database, no infrastructure.

**Prereqs (all manual config, ~15 min total):**
1. Enable GitHub Discussions on the repo (Settings → Features)
2. Install Giscus GitHub App → select repo
3. Go to giscus.app → configure → copy `repoId` and `categoryId`
4. Add 3 `NEXT_PUBLIC_GISCUS_*` env vars to Vercel

**Code changes:**
- `pnpm add @giscus/react`
- Add `allowComments: boolean` field to Sanity article schema
- Add `allowComments` to `queryArticleBySlug` GROQ projection
- Create `src/components/post/CommentsSection.tsx` — reads `useConsent()` + `useTheme()`, renders `<Giscus>` or consent gate
- Add `<CommentsSection>` to `src/app/(user)/articles/[slug]/page.tsx`

---

### 2. #7 — Analytics, GTM & Consent Audit · `effort: S` · ~2–3h

**Why it's next:** No new dependencies or external accounts needed — just fixing existing files. Four of the issues are one-liners or small targeted changes. High urgency: GTM is silently broken in production (env var missing `NEXT_PUBLIC_` prefix means it never loads), and the Consent Mode ordering is a live GDPR compliance violation.

**Prereqs:** None. Everything is a code-only fix.

**Code changes (in priority order):**
1. Rename `GTM_ID` → `NEXT_PUBLIC_GTM_ID` in `.env.local` + `layout.tsx` — GTM never loads without this
2. Remove duplicate `gtag/js` + `gtag('config', 'GTM-...')` from `ConsentAwareAnalytics.tsx` — wrong script for a GTM ID
3. Move `initializeGoogleConsent()` to run synchronously **before** the GTM script tag — fixes GDPR Consent Mode v2 ordering
4. Remove or properly set `NEXT_PUBLIC_GA_ID` — eliminates silent `gtag('config', '')` no-op
5. Remove `window.location.reload()` from `acceptAll` in `consent/context.tsx` — unnecessary full reload
6. Document `NEXT_PUBLIC_GTM_ID` and `NEXT_PUBLIC_GA_ID` in `.env.example`

---

### 3. #11 — Live Event Auto-Refresh · `effort: M` · ~4h

**Why it's third:** No external accounts, no new paid services, no schema changes. It's a self-contained client-side polling hook added to the live events page — the entire feature is a `useEffect` + `setInterval` (or SWR `refreshInterval`) that re-fetches events data every 30–60 seconds and shows a "New updates available" banner when fresh data arrives. Scope is narrow: one route, one hook, one small UI indicator.

**Prereqs:** None.

**Code changes:**
- Create `src/hooks/useLiveEventPolling.ts` — wraps SWR or `fetch` with a `refreshInterval`, compares current vs. fetched data, returns `hasUpdates` flag
- Add a dismissible "New updates available — click to refresh" banner to the live events page
- Or simpler: just use SWR's `refreshInterval` on the live events query and let the UI update automatically (no banner needed for MVP)
- Wire into `src/app/(user)/live-events/page.tsx` or the live event detail page

**Note:** If the page is a Server Component, the simplest approach is converting the events list into a Client Component that uses SWR with `refreshInterval: 60000`. No API route needed — SWR can hit the existing `/api` or re-fetch from Sanity directly via a thin client-side fetch helper.
