# Infrastructure Quick Reference Guide

**Quick access guide for common tasks and metrics.**

---

## 30-Second Status Check

Run this every month to see if anything needs attention:

```bash
📊 Current baseline (June 2026):
   ✅ 1,349 visitors/month
   ✅ All services in free tier
   ✅ All optimizations applied
   ✅ Safe until 7K visitors (Sanity bottleneck)
```

**Last month?** Check `docs/infrastructure-baseline.md`  
**Detailed guide?** See `docs/infrastructure-monitoring.md`

---

## Alert Checklist

**Does ANY of this apply? If yes, take action immediately.**

### 🔴 CRITICAL ALERTS (Do Now)

- [ ] Vercel bandwidth > 95 GB/month → **UPGRADE TO PRO**
- [ ] Supabase DB ops > 450K/month → **UPGRADE TO PRO**
- [ ] Sanity CDN > 1.95 GB/month → **UPGRADE TO PRO**
- [ ] Unexpected cost spike → Audit all services
- [ ] Page load time > 3 seconds → Check image optimization
- [ ] 404 errors spike → Check recent deployment

### 🟡 WARNING ALERTS (Plan This Week)

- [ ] Vercel bandwidth > 50 GB/month → Start Pro upgrade planning
- [ ] Supabase DB ops > 230K/month → Start Pro upgrade planning
- [ ] Sanity CDN > 1.7 GB/month → Start Pro upgrade planning
- [ ] Traffic > 5K visitors/month → Evaluate upgrade timeline
- [ ] Storage > 750 MB → Check growth rate
- [ ] New features planned → Audit impact on usage

### ℹ️ INFORMATIONAL (Monitor Next Month)

- [ ] Vercel bandwidth > 20 GB/month → Watch trend
- [ ] Supabase DB ops > 100K/month → Watch trend
- [ ] Sanity CDN > 800 MB/month → Watch trend
- [ ] Monthly growth > 20% → Accelerate planning
- [ ] New image formats needed → Test impact first

---

## Monthly Metrics (Quick Copy-Paste Template)

```
Date: __________ (Last Friday of month)
Visitors This Month: __________
Growth from Last Month: __________ %

VERCEL:
  Bandwidth: __________ MB (baseline: 835)
  Functions: __________ /mo (baseline: 1,400)
  Status: ☐ Good  ☐ Watch  ☐ Alert

SUPABASE:
  DB Ops: __________ /mo (baseline: 3,700)
  Storage: __________ MB (baseline: 381)
  Status: ☐ Good  ☐ Watch  ☐ Alert

SANITY:
  CDN: __________ MB (baseline: 455)
  API Calls: __________ /mo (baseline: 5,125)
  Status: ☐ Good  ☐ Watch  ☐ Alert

NOTES:
_________________________________________________
_________________________________________________
```

---

## Bottleneck Quick Reference

**Which service will hit its limit first as traffic grows?**

### Current Rank (What Fills First)

1. **Sanity CDN** — Fills at 7K visitors
   - Free limit: 2 GB/month
   - Current: 455 MB (22.75% full)
   - Safe until: 7K visitors
   - Formula: 0.34 MB per visitor

2. **Supabase DB** — Fills at 250K visitors
   - Free limit: 500K operations/month
   - Current: 3,700 ops (0.74% full)
   - Safe until: 250K visitors
   - Formula: ~2 ops per visitor

3. **Vercel Bandwidth** — Fills at 161K visitors
   - Free limit: 100 GB/month
   - Current: 835 MB (0.8% full)
   - Safe until: 161K visitors
   - Formula: 0.62 MB per visitor

---

## When to Upgrade (Decision Tree)

```
Traffic reaching 5K visitors?
├─ YES → Check Sanity CDN: __________ MB
│   ├─ > 1.7 GB? UPGRADE SANITY
│   └─ < 1.7 GB? Continue monitoring
└─ NO → Continue on free tier

Traffic reaching 10K visitors?
├─ YES → Check Supabase DB: __________ ops
│   ├─ > 230K? UPGRADE SUPABASE
│   └─ < 230K? Continue monitoring
└─ NO → Continue on free tier

Traffic reaching 50K visitors?
├─ YES → Check all services
│   ├─ Vercel bandwidth? Upgrade to Pro
│   ├─ Supabase ops? Upgrade to Pro
│   └─ Sanity CDN? Already on Pro
└─ NO → Continue monitoring
```

---

## Service Links (Quick Access)

### Dashboards
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://app.supabase.com
- **Sanity:** https://untelevisedmedia.sanity.studio
- **Analytics:** https://analytics.google.com

### Upgrade Pages
- **Vercel Pro:** https://vercel.com/pricing → Pro $20/month
- **Supabase Pro:** https://supabase.com/pricing → Pro $25/month
- **Sanity Pro:** https://www.sanity.io/pricing → Pro $99/month

### Documentation
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Sanity Docs:** https://www.sanity.io/docs

---

## Common Issues & Fixes

### Issue: Bandwidth suddenly high

**Check:**
1. [ ] GA4 → unusual traffic spike?
2. [ ] Vercel logs → deployment issue?
3. [ ] Did image size increase?
4. [ ] Is bot traffic included?

**Fix:**
- [ ] Check Vercel cache hit rates
- [ ] Review recent code changes
- [ ] Verify image optimization still applied

### Issue: Database operations suddenly high

**Check:**
1. [ ] View count table → unusual spike?
2. [ ] Recent schema changes?
3. [ ] Runaway query in logs?
4. [ ] Duplicate data inserted?

**Fix:**
- [ ] Check Supabase query logs
- [ ] Verify cron jobs running normally
- [ ] Check for failed batch operations

### Issue: API calls suddenly high

**Check:**
1. [ ] Missing cache headers?
2. [ ] ISR broken?
3. [ ] Recent deployment changed queries?
4. [ ] Sanity workflow running?

**Fix:**
- [ ] Verify ISR on next.js still working
- [ ] Check cache headers in responses
- [ ] Review recent code changes

### Issue: Costs higher than expected

**Check:**
1. [ ] Pull invoices from each service
2. [ ] Any unexpected overages?
3. [ ] Recently upgraded plan?
4. [ ] Check usage metrics match charges

**Fix:**
- [ ] Contact service support for discrepancies
- [ ] Review billing settings
- [ ] Adjust alert thresholds if needed

---

## Optimization Checklist

**Monthly verification that optimizations are still in place:**

### Sanity Optimizations
- [ ] `next.config.ts` → deviceSizes: [640, 1080, 1920]? ✅
- [ ] `imageLoader.ts` → quality: 65%? ✅
- [ ] `ArticleCards.tsx` → loading='lazy' present? ✅
- [ ] `RawFeed.tsx` → loading='lazy' present? ✅
- [ ] No unoptimized images added? ✅

### Vercel Optimizations
- [ ] No global middleware.ts? ✅
- [ ] Sentry using Edge Functions? ✅
- [ ] Cron jobs: only 2 active? ✅
- [ ] ISR still configured? ✅

### Supabase Optimization
- [ ] Indexes on frequently queried fields? ✅
- [ ] Slow queries < 100ms? ✅
- [ ] No N+1 query patterns? ✅

---

## Growth Projection Quick Math

**Estimate when you'll hit limits:**

### Sanity CDN (Bottleneck at 7K visitors)

```
Current: 455 MB at 1,349 visitors
Visitors this month: __________
Days until month end: __________
Projected month total: __________

If growth continues at current rate:
Days until 7K visitors: __________
Action: ☐ Upgrade Sanity  ☐ Continue monitoring
```

### Supabase DB (Bottleneck at 250K visitors)

```
Current: 3,700 ops at 1,349 visitors
Monthly ops rate: ~2.7 per visitor
At your current traffic: still safe
At 100K visitors: 270K ops (UPGRADE)
Days until 100K: __________
```

### Vercel Bandwidth (Bottleneck at 161K visitors)

```
Current: 835 MB at 1,349 visitors
Monthly rate: ~0.62 MB per visitor
At your current traffic: still safe
At 50K visitors: 31 GB (still safe)
At 161K visitors: 100 GB (UPGRADE)
Days until 161K: __________
```

---

## Monthly Checklist (Copy-Paste)

**Last Friday of month:**

- [ ] Pulled GA4 unique visitors: __________
- [ ] Updated infrastructure-baseline.md
- [ ] Checked Vercel usage
- [ ] Checked Supabase usage
- [ ] Checked Sanity usage
- [ ] Calculated growth %: __________
- [ ] Checked alert thresholds
- [ ] No anomalies? ☐ Yes ☐ No (explain: __________)
- [ ] Updated growth projection
- [ ] Optimization checks passed
- [ ] Filed monthly metrics summary

---

## Pro Upgrade Pricing Reference

**For quick cost impact assessment:**

| Service | Free Tier Cost | Pro Tier Cost | Difference |
|---------|---|---|---|
| **Vercel** | $0 | $20/month | +$20 |
| **Supabase** | $0 | $25/month per project | +$25-50 |
| **Sanity** | $0 | $99/month | +$99 |
| **All together** | $0 | $144-169/month | +$144-169 |

**When to upgrade:**
- Sanity @ 7K visitors: +$99/month
- Supabase @ 100K visitors: +$25-50/month
- Vercel @ 161K visitors: +$20/month

---

## Documentation Map

- **infrastructure-monitoring.md** — Detailed guide (read monthly)
- **infrastructure-baseline.md** — Metrics tracker (update monthly)
- **infrastructure-quick-reference.md** — This file (bookmark it!)
- **../VERCEL_FREE_TIER_AUDIT.html** — Vercel deep dive
- **../SUPABASE_FREE_TIER_AUDIT.html** — Supabase deep dive
- **../SANITY_FREE_TIER_AUDIT.html** — Sanity deep dive

---

**Bookmark this page. Update baseline.md every month.**

Last baseline: June 21, 2026  
Next review: July 21, 2026
