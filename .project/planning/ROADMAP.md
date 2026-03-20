# UnTelevised Media — Feature Roadmap & Working Order

> Last updated: 2026-03-17
> Issues: [GitHub Issues Board](../../issues)

---

## ✅ Completed — Phase 1 & Early Phase 2

| Issue | Title | PR |
|-------|-------|----|
| #15 | Remove Debug Routes | [#28](https://github.com/UnTelevised-Media/untelevised-media-new/pull/28) |
| #16 | Sitemap Completion | [#29](https://github.com/UnTelevised-Media/untelevised-media-new/pull/29) |
| #9  | RSS Feed /feed.xml | [#30](https://github.com/UnTelevised-Media/untelevised-media-new/pull/30) |
| #12 | Breaking News Banner | [#31](https://github.com/UnTelevised-Media/untelevised-media-new/pull/31) |
| #20 | Reading Time Estimate | [#32](https://github.com/UnTelevised-Media/untelevised-media-new/pull/32) |
| #23 | Corrections & Retractions | [#33](https://github.com/UnTelevised-Media/untelevised-media-new/pull/33) |
| #24 | Source Transparency Panel | [#34](https://github.com/UnTelevised-Media/untelevised-media-new/pull/34) |

---

## Priority × Effort Matrix

Effort across the top, priority down the side. Each cell lists remaining open issue numbers.

|              | **XS** (<1h) | **S** (1–3h)                    | **M** (4–6h)                        | **L** (8–12h)       | **XL** (12h+)              |
|--------------|--------------|---------------------------------|-------------------------------------|---------------------|----------------------------|
| **HIGH**     | —            | #27 Newsletter                  | —                                   | #21 Search          | —                          |
| **MEDIUM**   | —            | #26 Editorial Standards · #18 Comments | #8 Tags · #11 Live Refresh · #22 Trending | #25 Fact-Check | #13 Membership · #10 PWA |
| **LOW**      | —            | #19 Bookmarks · #17 Careers     | —                                   | #14 Paywall\*       | —                          |

> \* #14 Paywalled Content has a hard dependency on #13 Membership Tiers.

---

## Scoring & Working Order Logic

Each issue scored on: `(Priority × 2) + Ease`, where:
- Priority: High=3, Medium=2, Low=1
- Ease (inverse of effort): XS=5, S=4, M=3, L=2, XL=1

| Score | Issues at this score |
|-------|----------------------|
| 10    | #27                  |
| 8     | #21, #26, #18        |
| 7     | #8, #11, #22         |
| 6     | #19, #17, #25        |
| 5     | #13, #10             |
| 4     | #14                  |

---

## Recommended Working Order — 4 Remaining Phases

### 🏗️ Phase 2 — Credibility & Audience (Current Sprint)
> Builds the trust infrastructure and reader relationship layer.
> **Estimated total: ~12–16 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 1 | **#27 Newsletter / Email List** | M | Audience ownership — highest-ROI engagement feature |
| 2 | **#26 Editorial Standards Page** | S | Pairs naturally with credibility work already shipped |
| 3 | **#18 Comments System (Giscus)** | S | Quick engagement win; consent-gated, no backend |
| 4 | **#19 Bookmarks & Reading List** | S | Zero-backend, pure localStorage; batch with engagement work |

---

### 🔍 Phase 3 — Discovery & Live News (Sprint 3)
> Improves content navigability and delivers on the live-news promise.
> **Estimated total: ~15–18 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 5 | **#8 Tag Pages** | M | SEO + navigation; Sanity schema tweak + new route |
| 6 | **#11 Live Event Auto-Refresh** | M | Core live-news UX; polling hook + new updates banner |
| 7 | **#22 Trending / Most Read** | M | Discovery; view counter API + homepage section |
| 8 | **#17 Careers Page** | S | Low effort, operational value; sneak in between M tasks |

---

### 🧱 Phase 4 — Large Builds (Sprint 4)
> Higher-effort features that significantly elevate platform quality.
> **Estimated total: ~20–24 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 9  | **#21 Full-Text Search Upgrade** | L | Biggest discovery upgrade; Algolia needs dedicated focus |
| 10 | **#25 Fact-Check Schema & ClaimReview** | L | EEAT + schema.org; pairs with credibility work from Phase 2 |

---

### 🚀 Phase 5 — Major Undertakings (Future Sprints)
> Multi-day builds. Do these after the platform foundation is solid.
> **Estimated total: 30–40+ hours**

| # | Issue | Effort | Dependencies & Notes |
|---|-------|--------|----------------------|
| 11 | **#13 Membership / Supporter Tiers** | XL | Stripe subscriptions; **must ship before #14** |
| 12 | **#14 Paywalled / Members-Only Content** | L | **Requires #13 complete** — token auth gating |
| 13 | **#10 PWA & Push Notifications** | XL | Benefits from #12 (Breaking News Banner) being live |

---

## Dependency Map

```
#13 Membership Tiers
  └── #14 Paywalled Content (blocked until #13 ships)

#12 Breaking News Banner ✅
  └── #10 PWA Push Notifications (optimal — banner content drives push payloads)

#27 Newsletter
  └── #18 Comments / #19 Bookmarks (same engagement sprint — share reader identity thinking)
```

---

## Phase Summary at a Glance

| Phase | Focus | Issues | Est. Hours |
|-------|-------|--------|------------|
| ✅ 1 — Quick Wins | Cleanup + SEO + Editorial basics | #15, #16, #9, #12, #24, #20 | Done |
| ✅ 2 (partial) | Corrections & Sources | #23, #24 | Done |
| 2 — Credibility & Audience | Newsletter + engagement | #27, #26, #18, #19 | ~12–16h |
| 3 — Discovery & Live | Tags + live refresh + trending | #8, #11, #22, #17 | ~15–18h |
| 4 — Large Builds | Search + Fact-Check | #21, #25 | ~20–24h |
| 5 — Major Undertakings | Membership + Paywall + PWA | #13, #14, #10 | ~30–40h+ |
| **Remaining** | | **13 issues** | **~77–98h** |

---

## Ongoing (Parallel / Any Phase)

- Any issue with `effort: s` or `effort: xs` can be batched into the end of a sprint when hours remain

---

## Notes

- The credibility cluster (#25 Fact-Check, #26 Editorial Standards) should not be deferred much longer — strong EEAT and Google News eligibility signals.
- Newsletter (#27) and Comments (#18) should be treated as a pair — they establish the reader relationship layer together.
- Membership (#13) is the largest single investment; plan a dedicated sprint with no other major work running in parallel.
