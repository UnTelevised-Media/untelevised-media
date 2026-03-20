# UnTelevised Media — Feature Roadmap & Working Order

> Last updated: 2026-03-20
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

---

## Remaining Open Issues

| Issue | Title | Priority | Effort |
|-------|-------|----------|--------|
| #7  | Analytics Audit — 11 issues (4 critical) | **HIGH** (bug) | S |
| #8  | Tag Pages | Medium | M |
| #10 | PWA & Push Notifications | Medium | XL |
| #11 | Live Event Auto-Refresh | Medium | M |
| #13 | Membership / Supporter Tiers (Stripe) | Medium | XL |
| #14 | Paywalled Content *(blocked on #13)* | Low | L |
| #18 | Comments System (Giscus) | Medium | S |
| #21 | Full-Text Search Upgrade (Algolia) | **HIGH** | L |
| #22 | Trending / Most Read | Medium | M |
| #27 | Newsletter / Email List (Resend) | **HIGH** | M |

---

## Priority × Effort Matrix

|              | **XS** (<1h) | **S** (1–3h)          | **M** (4–6h)                        | **L** (8–12h) | **XL** (12h+)          |
|--------------|--------------|-----------------------|-------------------------------------|---------------|------------------------|
| **HIGH**     | —            | #7 Analytics Audit    | #27 Newsletter                      | #21 Search    | —                      |
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
| 8     | #21 Search · #18 Comments |
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
| 7 | **#21 Full-Text Search Upgrade** | L | Biggest discovery upgrade; Algolia needs dedicated focus |

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
| 4 — Discovery & Live | Tags + live refresh + trending + search | #8, #11, #22, #21 | ~15–18h |
| 5 — Major Undertakings | Membership + Paywall + PWA | #13, #14, #10 | ~30–40h+ |
| **Remaining** | | **10 issues** | **~53–68h** |

---

## Ongoing (Parallel / Any Phase)

- Any `effort: s` or `effort: xs` issue can be batched into the end of a sprint when time remains
- #7 Analytics Audit is the only open **bug** — treat it as a blocker for audience growth work
