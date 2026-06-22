# Infrastructure Monitoring & Maintenance Guide

**Last Updated:** June 21, 2026  
**Status:** Post-optimization baseline established

## Overview

This guide documents how to monitor, maintain, and optimize usage across all infrastructure services (Vercel, Supabase, Sanity). Each service has specific bottlenecks and scaling limits. This document provides a baseline, monitoring strategies, and decision trees for upgrades.

---

## Quick Reference: Current Baseline

**As of June 21, 2026 (Post-optimization)**

| Service | Metric | Current | Free Limit | Utilization | Bottleneck | Safe Until |
|---------|--------|---------|-----------|-------------|-----------|-----------|
| **Vercel** | Bandwidth | 835 MB | 100 GB | 0.8% | Bandwidth | 161K visitors |
| **Vercel** | Functions | 1,400/mo | 500K/mo | 0.3% | None | 1.6M visitors |
| **Supabase** | DB Ops | 3,700/mo | 500K/mo | 0.74% | DB Ops | 250K visitors |
| **Supabase** | Storage | 381 MB | 1 GB | 38.1% | Storage | 13 months |
| **Sanity** | API Calls | 5,125/mo | 2M/mo | 0.25% | None | 1M+ visitors |
| **Sanity** | CDN | 455 MB | 2 GB | 22.75% | None | 7K visitors |

**Total Monthly Cost:** $0 (free tier)  
**Safe Growth Runway:** 1.3K → 7K visitors (sustainable at current rate)

---

## Service-by-Service Monitoring

### 📊 Vercel Monitoring

**Primary Bottleneck:** Bandwidth (100 GB/month free)

#### What to Track
- Monthly bandwidth usage (GB consumed)
- Serverless function invocations
- Edge function invocations
- Build minutes used
- Cache performance

#### Where to Check
1. **Vercel Dashboard** → Settings → Usage
2. **Vercel Analytics** (built-in)
3. **GA4 reports** for traffic patterns

#### Monitoring Schedule
- **Weekly:** Check bandwidth trend (growing or stable?)
- **Monthly:** Review all metrics against baseline
- **At 50K visitors:** Increase to bi-weekly checks

#### Warning Signs
- ⚠️ Bandwidth at 50% of 100 GB limit (50 GB/month)
- ⚠️ Serverless functions at 100K/month (20% of limit)
- ⚠️ Build minutes at 2,000+/month (25% of limit)

#### Upgrade Decision
| Trigger | Action | Timing |
|---------|--------|--------|
| Bandwidth → 161K visitors | Upgrade Vercel to Pro | Immediately |
| Build cache not enabled | Enable in Vercel settings | ASAP |
| Functions trending up | Audit middleware and ISR | Within 1 week |

#### Expected Growth Rate
- Current: 1,349 visitors/month → 835 MB bandwidth
- Formula: ~0.62 MB per visitor per month
- At 50K visitors: ~31 GB/month (31% of 100 GB limit)
- At 161K visitors: ~100 GB/month (100% of free tier limit)

---

### 🗄️ Supabase Monitoring

**Primary Bottlenecks:** 
1. Database Operations (500K/month free)
2. Storage (1 GB free)

#### What to Track

**Database Operations:**
- View count INSERTs (daily user sessions)
- View count UPDATEs (IP geolocation batch job)
- Order queries (bookstore transactions)
- Authentication queries (Clerk integration)
- Total operations per day

**Storage:**
- Digital downloads bucket (PDF, EPUB, MOBI files)
- Book covers bucket (images)
- Growth rate per month

#### Where to Check
1. **Supabase Dashboard** → Database → Usage
2. **untelevised-shop project** → Statistics
3. **untelevised-live project** → Statistics
4. **Monitor via SQL**: See example queries below

#### Monitoring Schedule
- **Weekly:** Check view tracking operations (main driver)
- **Monthly:** Review all metrics and storage growth
- **Quarterly:** Evaluate multi-project consolidation

#### SQL Monitoring Queries

**Check monthly operations (untelevised-live):**
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as operations
FROM view_count
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY month
ORDER BY month DESC;
```

**Check storage growth:**
```sql
SELECT 
  bucket,
  SUM(
    CASE 
      WHEN metadata->>'size' IS NOT NULL 
      THEN (metadata->>'size')::bigint 
      ELSE 0 
    END
  ) / 1024 / 1024 as size_mb
FROM storage.objects
GROUP BY bucket;
```

#### Warning Signs
- ⚠️ DB Ops at 230K/month (46% of 500K limit)
- ⚠️ Storage at 750 MB (75% of 1 GB limit)
- ⚠️ View tracking operations growing faster than traffic
- ⚠️ Unnecessary table scans in queries

#### Upgrade Decision
| Trigger | Action | Timing |
|---------|--------|--------|
| DB Ops → 100K visitors (~230K ops) | Plan Pro upgrade | Start planning |
| DB Ops → 250K visitors (~576K ops) | Upgrade to Pro | Immediately |
| Storage → 750 MB | Evaluate growth rate | Assess in 2-3 months |
| Storage → 900 MB | Plan storage upgrade | Prepare for Pro |

#### Expected Growth Rate
- **View tracking:** 1,349 views × 2 ops = 2,698 ops/month
- **Formula:** (visitors × 2) + 1,000 (other ops) ≈ monthly operations
- **At 50K visitors:** ~101K ops/month (20% of free tier)
- **At 100K visitors:** ~201K ops/month (40% of free tier)
- **At 250K visitors:** ~501K ops/month (100% of free tier — UPGRADE)

#### Multi-Project Strategy
**Current:** 2 separate projects (untelevised-shop, untelevised-live)
- Cost: $0/month on free tier, $50/month on Pro
- Consider consolidation: Could save $25/month on Pro plan
- Tradeoff: Separate databases provide isolation and security

---

### 📝 Sanity Monitoring

**Primary Bottlenecks:** 
1. Asset CDN Bandwidth (2 GB/month free) — POST-OPTIMIZATION
2. API Calls (2M/month free) — No concern

#### What to Track

**Asset Delivery (Post-optimization baseline: 455 MB):**
- Monthly CDN bandwidth (images, videos, documents)
- Image request count
- Average image file size
- Quality degradation over time

**API Calls:**
- GROQ query count
- Average query performance
- Cache hit rates

#### Where to Check
1. **Sanity Studio** → Project Settings → Usage
2. **Sanity Content Operations Dashboard**
3. **GA4 for page view metrics** (correlates to image requests)

#### Monitoring Schedule
- **Monthly:** Check CDN bandwidth against baseline (455 MB)
- **Quarterly:** Review API call trends
- **At 5K visitors:** Increase to bi-weekly CDN checks

#### Warning Signs
- ⚠️ CDN bandwidth at 1 GB/month (50% of free tier)
- ⚠️ CDN bandwidth at 1.7 GB/month (85% of free tier)
- ⚠️ Image quality degradation complaints
- ⚠️ API calls trending above 50K/month (2.5% of limit)

#### Upgrade Decision
| Trigger | Action | Timing |
|---------|--------|--------|
| CDN → 1.7 GB/month (~5K visitors) | Plan Pro upgrade | Start planning |
| CDN → 2 GB/month (~7K visitors) | Upgrade to Pro | Immediately |
| API calls → 250K/month (12.5%) | Plan for 1M+ growth | Long term only |

#### Expected Growth Rate
- Current (optimized): 455 MB per 1,349 visitors
- Formula: ~0.34 MB per visitor per month
- At 5K visitors: ~1.7 GB/month (85% of free tier)
- At 7K visitors: ~2.4 GB/month (120% of free tier — UPGRADE)

#### Optimization Maintenance

**Keep optimizations in check:**
- ✅ Image variants: Maintain [640, 1080, 1920] breakpoints (do not add more)
- ✅ Lazy loading: Verify all below-fold images use `loading='lazy'`
- ✅ Image quality: Keep at 65% (do not increase unless necessary)
- ✅ Monitor: Check Sanity audit report baseline monthly

**Files to monitor for regressions:**
- `next.config.ts` — Verify deviceSizes unchanged
- `src/lib/sanity/imageLoader.ts` — Verify quality at 65%
- `src/components/cards/ArticleCards.tsx` — Verify lazy loading present
- `src/components/homepage/RawFeed.tsx` — Verify lazy loading present

---

## Comprehensive Growth Monitoring

### Traffic Growth Tracking

**Primary Metric:** Monthly unique visitors (from GA4)

#### Current Baseline
- **June 2026:** 1,349 visitors/month
- **Growth Rate:** Track monthly change (%)
- **Projection Method:** 3-month moving average

#### Key Milestones & Actions

| Milestone | Timeline | Vercel | Supabase | Sanity | Action |
|-----------|----------|--------|----------|--------|--------|
| **Current** | June 2026 | 0.8% | 0.74% | 22.75% | Monitor baseline |
| **3K visitors** | Q3 2026 | 2% | 1.8% | 50% | Monitor bandwidth |
| **5K visitors** | Q4 2026 | 4% | 2.4% | 85% | Start Pro planning |
| **7K visitors** | Q1 2027 | 5% | 3.3% | 100% | Upgrade Sanity |
| **10K visitors** | Q2 2027 | 7% | 4.8% | 150% | Upgrade Sanity + Supabase |
| **50K visitors** | 2027 | 31% | 24% | Unmanageable | Upgrade Vercel + Supabase |
| **100K visitors** | 2027-2028 | 62% | 46% | Unmanageable | All Pro plans |

#### How to Calculate Projections

**Vercel Bandwidth:**
- Formula: `visitors × 0.62 MB`
- Example: 5K × 0.62 = 3.1 GB (3% of 100 GB)

**Supabase DB Operations:**
- Formula: `(visitors × 2) + 1,000`
- Example: 5K × 2 + 1K = 11K ops/month (2.2% of 500K)

**Sanity CDN Bandwidth:**
- Formula: `visitors × 0.34 MB`
- Example: 5K × 0.34 = 1.7 GB (85% of 2 GB)

---

## Monthly Review Checklist

Complete this checklist on the **last Friday of each month:**

### Traffic & Usage Analysis
- [ ] Pull GA4 report: Unique visitors this month
- [ ] Calculate month-over-month growth %
- [ ] Compare to 3-month moving average
- [ ] Project next milestone date

### Vercel Check
- [ ] Visit vercel.com/dashboard → Usage
- [ ] Record: Bandwidth (GB), Functions, Edge Functions, Build minutes
- [ ] Compare to baseline: All within 2x of previous month?
- [ ] ⚠️ Alert if: Bandwidth trend → 50 GB/month

### Supabase Check
- [ ] Visit Supabase dashboard → Statistics
- [ ] Check **untelevised-live**: Database operations this month
- [ ] Check **untelevised-shop**: Database operations this month
- [ ] Record: Total ops, storage used (both projects)
- [ ] ⚠️ Alert if: Ops at 100K+/month or storage at 600+ MB

### Sanity Check
- [ ] Visit Sanity → Settings → Usage
- [ ] Record: CDN bandwidth, API calls
- [ ] Compare to baseline: 455 MB ± 10%
- [ ] ⚠️ Alert if: CDN bandwidth exceeds 600 MB or growing fast

### Cost Analysis
- [ ] Record total monthly services cost (Stripe, Algolia, Clerk, etc.)
- [ ] Check for unexpected overages
- [ ] Plan for upcoming Pro upgrades

### Documentation Updates
- [ ] Update `infrastructure-baseline.md` with new month's data
- [ ] Note any anomalies or issues
- [ ] Adjust projections if needed

---

## Upgrade Decision Tree

### When to Upgrade Vercel

```
Bandwidth → 50 GB/month?
├─ YES: Monitor closely, upgrade at 161K visitors
└─ NO: Continue monitoring

Serverless functions → 100K/month?
├─ YES: Audit code for inefficiencies
└─ NO: Normal usage

Build minutes → 3K/month?
├─ YES: Check for unnecessary rebuilds
└─ NO: Normal usage
```

**Action:** Upgrade to **Vercel Pro ($20/month)** when:
- ✅ Bandwidth approaching 100 GB/month (161K visitors)
- ✅ Functions invocations → 200K/month

---

### When to Upgrade Supabase

```
Database operations → 230K/month (100K visitors)?
├─ YES: Start upgrade planning
└─ NO: Continue monitoring

Database operations → 576K/month (250K visitors)?
├─ YES: MUST upgrade immediately
└─ NO: Monitor closely

Storage → 750 MB (75% of 1 GB)?
├─ YES: Assess growth rate for timeline
└─ NO: Normal growth
```

**Action:** Upgrade to **Supabase Pro ($25/month per project)** when:
- ✅ Database operations → 230K+/month
- ✅ Visitor growth → 100K/month sustained
- ⚠️ Note: Both projects upgrade together (no partial upgrades)

---

### When to Upgrade Sanity

```
CDN bandwidth → 1.0 GB/month (~3K visitors)?
├─ YES: Monitor closely
└─ NO: Excellent efficiency

CDN bandwidth → 1.7 GB/month (~5K visitors)?
├─ YES: Start upgrade planning
└─ NO: Continue monitoring

CDN bandwidth → 2.0 GB/month (~7K visitors)?
├─ YES: MUST upgrade immediately
└─ NO: Monitor closely
```

**Action:** Upgrade to **Sanity Pro ($99/month)** when:
- ✅ CDN bandwidth → 1.7+ GB/month
- ✅ Visitor growth → 5K+/month sustained
- ✅ Cannot implement additional image optimizations

---

## Cost Projection Timeline

**Important:** These projections assume current traffic growth patterns. Adjust if growth accelerates.

| Year | Visitor Range | Expected Cost | Notes |
|------|---------------|----------------|-------|
| **2026** | 1.3K - 7K | $0/month | Free tier (baseline) |
| **Q1 2027** | 7K - 10K | $0-99/month | Sanity upgrade at 7K |
| **Q2-Q3 2027** | 10K - 50K | $99-150/month | Sanity + maybe Supabase |
| **Q4 2027** | 50K - 100K | $150-200/month | Supabase + plan Vercel |
| **2028** | 100K+ | $200+/month | All services on Pro/Business |

---

## Optimization Best Practices

### Images (Sanity/Vercel)

**Keep optimizations in place:**
- ✅ Use [640, 1080, 1920] responsive breakpoints (no more)
- ✅ Apply `loading='lazy'` to below-fold images
- ✅ Maintain 65% image quality (imperceptible)
- ✅ Compress images before uploading to Sanity
- ✅ Use WebP/AVIF formats (automatic via imageLoader)

**Don't:**
- ❌ Increase responsive breakpoints (costs 44% more)
- ❌ Remove lazy loading from cards
- ❌ Increase quality above 65% without testing
- ❌ Upload uncompressed images

### Database (Supabase)

**Keep queries optimized:**
- ✅ Limit batch operations (use pagination)
- ✅ Use proper indexes on frequently queried fields
- ✅ Limit depth of references (avoid N+1 queries)
- ✅ Use RLS policies efficiently
- ✅ Monitor slow queries weekly

**Don't:**
- ❌ Run expensive migrations during peak hours
- ❌ Leave debug logging enabled in production
- ❌ Update view_count table unnecessarily
- ❌ Scan entire tables without filters

### API Calls (Sanity)

**Keep GROQ optimized:**
- ✅ Use pagination for large datasets
- ✅ Cache responses (ISR at 5 minutes minimum)
- ✅ Filter at query time (not in code)
- ✅ Use projections to fetch only needed fields
- ✅ Monitor query performance in studio

**Don't:**
- ❌ Fetch entire document trees
- ❌ Remove pagination from article lists
- ❌ Fetch all variants if only using one
- ❌ Repeat same query within 5 minutes

### Caching Strategy

**Vercel ISR (Incremental Static Regeneration):**
- Homepage: Revalidate every 5 minutes OR on content update
- Article pages: Revalidate on publish webhook
- Static assets: Cache 365 days
- Dynamic content: Edge cache 1 minute minimum

**Sanity webhook:**
- Trigger Vercel revalidation on document publish
- Filter: Skip if only `viewCount` field changed
- Batched: Max 1 webhook per 10 seconds

---

## Incident Response

### High Bandwidth Alert (Vercel)

**Trigger:** Bandwidth > 60 GB in single day

**Response:**
1. [ ] Check GA4 for unusual traffic spike
2. [ ] Review recent deployments (did something change?)
3. [ ] Check CDN cache hit rates
4. [ ] Look for bot traffic in analytics
5. [ ] If legitimate growth: Plan Pro upgrade
6. [ ] If anomaly: Investigate root cause

### High Database Operations Alert (Supabase)

**Trigger:** Database ops > 50K in single day

**Response:**
1. [ ] Check view tracking table row count (daily normal: ~1,349)
2. [ ] Review recent schema changes
3. [ ] Check for runaway queries (query logs)
4. [ ] Look for duplicate view records
5. [ ] If legitimate: Plan Pro upgrade
6. [ ] If anomaly: Investigate and fix root cause

### High API Calls Alert (Sanity)

**Trigger:** API calls > 1,000 in single day

**Response:**
1. [ ] Check Vercel logs for unusual query patterns
2. [ ] Review recent code deployments
3. [ ] Check for missing cache headers
4. [ ] Verify ISR is working properly
5. [ ] If legitimate: Analyze query efficiency
6. [ ] If anomaly: Revert recent changes

---

## Annual Review

Conduct comprehensive review **every January** or after major growth events:

### What to Review
- [ ] Baseline metrics (vs current month)
- [ ] Growth trajectory (linear, exponential, plateau?)
- [ ] Architecture decisions (still optimal?)
- [ ] Cost vs. traffic ratio (efficiency?)
- [ ] Upcoming upgrades needed (timeline?)
- [ ] New optimization opportunities?

### Update Documentation
- [ ] Update this guide with new learnings
- [ ] Archive previous year's data
- [ ] Adjust projections based on actual growth
- [ ] Identify new bottlenecks (if any)

### Strategic Planning
- [ ] Plan next 12-month growth targets
- [ ] Identify cost-saving opportunities
- [ ] Evaluate emerging services/tools
- [ ] Plan for feature additions impact

---

## Emergency Contacts & Resources

### Quick Links
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **Sanity Studio:** https://untelevisedmedia.sanity.studio
- **GA4 Analytics:** https://analytics.google.com

### Upgrade Pages
- **Vercel Pro:** https://vercel.com/pricing
- **Supabase Pro:** https://supabase.com/pricing
- **Sanity Pro:** https://www.sanity.io/pricing

### Support Contacts
- **Vercel Support:** support@vercel.com
- **Supabase Support:** In dashboard
- **Sanity Support:** In studio

---

## Related Documentation

- `VERCEL_FREE_TIER_AUDIT.html` — Complete Vercel analysis
- `SUPABASE_FREE_TIER_AUDIT.html` — Complete Supabase analysis
- `SANITY_FREE_TIER_AUDIT.html` — Complete Sanity analysis
- `COMPLETE_INFRASTRUCTURE_AUDIT_SUMMARY.md` — Overview of all services

---

**Last Baseline:** June 21, 2026  
**Next Review:** July 21, 2026  
**Maintainer:** Infrastructure Team

For questions or updates to this guide, consult the latest audit reports.
