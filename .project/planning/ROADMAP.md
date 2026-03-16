# UnTelevised Media — Feature Roadmap & Working Order

> Last updated: 2026-03-16
> Issues: [GitHub Issues Board](../../issues) — 20 open features + #7 AdSense (active bug)

---

## Priority × Effort Matrix

Effort across the top, priority down the side. Each cell lists issue numbers.

|              | **XS** (<1h)     | **S** (1–3h)                             | **M** (4–6h)              | **L** (8–12h)       | **XL** (12h+)         |
|--------------|------------------|------------------------------------------|---------------------------|---------------------|-----------------------|
| **HIGH**     | #15 Debug Routes | #16 Sitemap · #9 RSS · #12 Breaking News · #24 Sources | #23 Corrections · #27 Newsletter | #21 Search    | —                     |
| **MEDIUM**   | —                | #26 Editorial Standards · #18 Comments  | #8 Tags · #11 Live Refresh · #22 Trending | #25 Fact-Check | #13 Membership · #10 PWA |
| **LOW**      | #20 Reading Time | #19 Bookmarks · #17 Careers             | —                         | #14 Paywall\*       | —                     |

> \* #14 Paywalled Content has a hard dependency on #13 Membership Tiers.

---

## Scoring & Working Order Logic

Each issue scored on: `(Priority × 2) + Ease`, where:
- Priority: High=3, Medium=2, Low=1
- Ease (inverse of effort): XS=5, S=4, M=3, L=2, XL=1

| Score | Issues at this score |
|-------|----------------------|
| 11    | #15                  |
| 10    | #16, #9, #12, #24    |
| 9     | #23, #27             |
| 8     | #21, #26, #18        |
| 7     | #8, #11, #22, #20    |
| 6     | #19, #17, #25        |
| 5     | #13, #10             |
| 4     | #14                  |

---

## Recommended Working Order — 5 Phases

### ⚡ Phase 1 — Quick Wins (This Sprint)
> All high-priority, XS/S effort. Ship fast, immediate production value.
> **Estimated total: ~8–10 hours**

| # | Issue | Effort | Why First |
|---|-------|--------|-----------|
| 1 | **#15 Remove Debug Routes** | XS | Security & cleanliness — no reason to wait |
| 2 | **#16 Sitemap Completion** | S | SEO critical; pure backend, no UI work |
| 3 | **#9 RSS Feed** | S | Unlocks Google News eligibility; pure Route Handler |
| 4 | **#12 Breaking News Banner** | S | Major editorial power; Sanity singleton + client component |
| 5 | **#24 Source Transparency Panel** | S | Credibility; Sanity schema addition + collapsible component |
| 6 | **#20 Reading Time Estimate** | XS | Trivial utility; batch it in while touching article pages |

---

### 🏗️ Phase 2 — Credibility & Audience (Next Sprint)
> Builds the trust infrastructure and reader relationship layer. These define UnTelevised as a *reputable* outlet.
> **Estimated total: ~16–22 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 7 | **#23 Corrections & Retractions** | M | Foundation of editorial credibility; Sanity schema + component |
| 8 | **#27 Newsletter / Email List** | M | Audience ownership — highest-ROI engagement feature |
| 9 | **#26 Editorial Standards Page** | S | Pairs naturally with credibility work already in progress |
| 10 | **#18 Comments System (Giscus)** | S | Quick engagement win; consent-gated, no backend |
| 11 | **#19 Bookmarks & Reading List** | S | Zero-backend, pure localStorage; batch with engagement work |

---

### 🔍 Phase 3 — Discovery & Live News (Sprint 3)
> Improves content navigability and delivers on the live-news promise.
> **Estimated total: ~15–18 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 12 | **#8 Tag Pages** | M | SEO + navigation; Sanity schema tweak + new route |
| 13 | **#11 Live Event Auto-Refresh** | M | Core live-news UX; polling hook + new updates banner |
| 14 | **#22 Trending / Most Read** | M | Discovery; view counter API + homepage section |
| 15 | **#17 Careers Page** | S | Low effort, operational value; sneak in between M tasks |

---

### 🧱 Phase 4 — Large Builds (Sprint 4)
> Higher-effort features that significantly elevate platform quality.
> **Estimated total: ~20–24 hours**

| # | Issue | Effort | Why Here |
|---|-------|--------|----------|
| 16 | **#21 Full-Text Search Upgrade** | L | Biggest discovery upgrade; Algolia needs dedicated focus |
| 17 | **#25 Fact-Check Schema & ClaimReview** | L | EEAT + schema.org; pairs with credibility work from Phase 2 |

---

### 🚀 Phase 5 — Major Undertakings (Future Sprints)
> Multi-day builds. Do these after the platform foundation is solid.
> **Estimated total: 30–40+ hours**

| # | Issue | Effort | Dependencies & Notes |
|---|-------|--------|----------------------|
| 18 | **#13 Membership / Supporter Tiers** | XL | Stripe subscriptions; **must ship before #14** |
| 19 | **#14 Paywalled / Members-Only Content** | L | **Requires #13 complete** — token auth gating |
| 20 | **#10 PWA & Push Notifications** | XL | Benefits from #12 (Breaking News Banner) being live |

---

## Dependency Map

```
#13 Membership Tiers
  └── #14 Paywalled Content (blocked until #13 ships)

#12 Breaking News Banner
  └── #10 PWA Push Notifications (optimal — banner content drives push payloads)

#27 Newsletter
  └── #18 Comments / #19 Bookmarks (same engagement sprint — share reader identity thinking)
```

---

## Phase Summary at a Glance

| Phase | Focus | Issues | Est. Hours |
|-------|-------|--------|------------|
| 1 — Quick Wins | Cleanup + SEO + Editorial basics | #15, #16, #9, #12, #24, #20 | ~8–10h |
| 2 — Credibility & Audience | Trust signals + newsletter + engagement | #23, #27, #26, #18, #19 | ~16–22h |
| 3 — Discovery & Live | Tags + live refresh + trending | #8, #11, #22, #17 | ~15–18h |
| 4 — Large Builds | Search + Fact-Check | #21, #25 | ~20–24h |
| 5 — Major Undertakings | Membership + Paywall + PWA | #13, #14, #10 | ~30–40h+ |
| **Total** | | **20 issues** | **~90–115h** |

---

## Ongoing (Parallel / Any Phase)

- **#7 AdSense Audit** — active bug, in-progress; can be resolved alongside any phase
- Any issue with `effort: s` or `effort: xs` can be batched into the end of a sprint when hours remain

---

## Notes

- Phases 1–3 deliver the most visible, reader-facing improvements with the least risk.
- The credibility cluster (Corrections #23, Sources #24, Fact-Check #25, Editorial #26) is the single strongest signal for EEAT and Google News eligibility — do not defer all of it.
- Newsletter (#27) and Comments (#18) should be treated as a pair — they establish the reader relationship layer together.
- Membership (#13) is the largest single investment; plan a dedicated sprint with no other major work running in parallel.
