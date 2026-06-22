# Infrastructure Baseline & Usage Tracking

**Current Baseline:** June 21, 2026 (Post-optimization)  
**Next Review:** July 21, 2026

## Overview

This document tracks the current baseline metrics for all infrastructure services. Update monthly to track growth and identify trends.

---

## Current Baseline Metrics (June 2026)

### Vercel
| Metric | Value | Free Tier | % of Limit | Status |
|--------|-------|-----------|-----------|--------|
| Monthly Bandwidth | 835 MB | 100 GB | 0.8% | ✅ Excellent |
| Serverless Functions | 1,400/mo | 500K/mo | 0.3% | ✅ Excellent |
| Edge Functions | 200/mo | 500K/mo | 0.04% | ✅ Excellent |
| Build Minutes | 105/mo | 9,000/mo | 1.2% | ✅ Excellent |
| **Cost** | **$0** | - | - | **✅ Free** |

**Safe Until:** 161K monthly visitors (bandwidth bottleneck)

### Supabase
| Metric | Value | Free Tier | % of Limit | Status |
|--------|-------|-----------|-----------|--------|
| Database Operations | 3,700/mo | 500K/mo | 0.74% | ✅ Excellent |
| Edge Functions | 75/mo | 500K/mo | 0.015% | ✅ Excellent |
| Storage | 381 MB | 1 GB | 38.1% | ✅ Excellent |
| Realtime Users | 0 concurrent | 250 | 0% | ✅ Excellent |
| Team Seats | 2 | 1 free | 200% | ✅ 1 available |
| **Cost** | **$0** | - | - | **✅ Free** |

**Safe Until:** 250K monthly visitors (database bottleneck)

### Sanity
| Metric | Value | Free Tier | % of Limit | Status |
|--------|-------|-----------|-----------|--------|
| API Calls | 5,125/mo | 2M/mo | 0.25% | ✅ Excellent |
| Asset CDN | 455 MB | 2 GB | 22.75% | ✅ Optimized |
| Document Types | 43 | Unlimited | 0% | ✅ Excellent |
| Editor Seats | 2 | 3 free | 66% | ✅ 1 available |
| **Cost** | **$0** | - | - | **✅ Free** |

**Safe Until:** 7K monthly visitors (CDN bottleneck)

---

## Traffic Baseline

### Monthly Visitors (from GA4)
| Month | Visitors | Growth % | Trend |
|-------|----------|----------|-------|
| June 2026 | 1,349 | - | Baseline |
| May 2026 | ~1,300 | +3.8% | Growing |
| April 2026 | ~1,250 | ~0% | Stable |

**3-Month Trend:** ~3-4% monthly growth

### Expected Growth Milestones
| Milestone | Timeline | Projection | Action |
|-----------|----------|-----------|--------|
| 2K visitors | Q3 2026 | ~2 months | Monitor |
| 3K visitors | Q4 2026 | ~6 months | Monitor bandwidth |
| 5K visitors | Q4 2026 | ~12 months | Start Pro planning |
| 7K visitors | Q1 2027 | ~18 months | Upgrade Sanity |
| 10K visitors | Q2 2027 | ~24 months | Upgrade Supabase |

---

## Monthly Usage Logs

### June 2026 (Baseline Month)

**Traffic:** 1,349 unique visitors  
**Growth:** +3.8% from May

| Service | Metric | Value | Baseline | % Change | Status |
|---------|--------|-------|----------|----------|--------|
| **Vercel** | Bandwidth | 835 MB | - | - | ✅ |
| **Vercel** | Functions | 1,400/mo | - | - | ✅ |
| **Supabase** | DB Ops | 3,700/mo | - | - | ✅ |
| **Supabase** | Storage | 381 MB | - | - | ✅ |
| **Sanity** | CDN | 455 MB | - | - | ✅ |
| **Sanity** | API Calls | 5,125/mo | - | - | ✅ |

**Notes:** Post-optimization baseline. All metrics healthy.

---

## Historical Data (Template for monthly updates)

### July 2026

**Traffic:** ___ unique visitors  
**Growth:** ___% from June

| Service | Metric | Value | Baseline | % Change | Status |
|---------|--------|-------|----------|----------|--------|
| **Vercel** | Bandwidth | ___ MB | 835 MB | ___% | ? |
| **Vercel** | Functions | ___/mo | 1,400/mo | ___% | ? |
| **Supabase** | DB Ops | ___/mo | 3,700/mo | ___% | ? |
| **Supabase** | Storage | ___ MB | 381 MB | ___% | ? |
| **Sanity** | CDN | ___ MB | 455 MB | ___% | ? |
| **Sanity** | API Calls | ___/mo | 5,125/mo | ___% | ? |

**Notes:** 
- [ ] Check for anomalies?
- [ ] Any optimization opportunities?
- [ ] On track for growth projections?

---

### August 2026

**Traffic:** ___ unique visitors  
**Growth:** ___% from July

| Service | Metric | Value | Baseline | % Change | Status |
|---------|--------|-------|----------|----------|--------|
| **Vercel** | Bandwidth | ___ MB | 835 MB | ___% | ? |
| **Vercel** | Functions | ___/mo | 1,400/mo | ___% | ? |
| **Supabase** | DB Ops | ___/mo | 3,700/mo | ___% | ? |
| **Supabase** | Storage | ___ MB | 381 MB | ___% | ? |
| **Sanity** | CDN | ___ MB | 455 MB | ___% | ? |
| **Sanity** | API Calls | ___/mo | 5,125/mo | ___% | ? |

**Notes:** 

---

### September 2026

**Traffic:** ___ unique visitors  
**Growth:** ___% from August

| Service | Metric | Value | Baseline | % Change | Status |
|---------|--------|-------|----------|----------|--------|
| **Vercel** | Bandwidth | ___ MB | 835 MB | ___% | ? |
| **Vercel** | Functions | ___/mo | 1,400/mo | ___% | ? |
| **Supabase** | DB Ops | ___/mo | 3,700/mo | ___% | ? |
| **Supabase** | Storage | ___ MB | 381 MB | ___% | ? |
| **Sanity** | CDN | ___ MB | 455 MB | ___% | ? |
| **Sanity** | API Calls | ___/mo | 5,125/mo | ___% | ? |

**Notes:** 

---

### October 2026

**Traffic:** ___ unique visitors  
**Growth:** ___% from September

| Service | Metric | Value | Baseline | % Change | Status |
|---------|--------|-------|----------|----------|--------|
| **Vercel** | Bandwidth | ___ MB | 835 MB | ___% | ? |
| **Vercel** | Functions | ___/mo | 1,400/mo | ___% | ? |
| **Supabase** | DB Ops | ___/mo | 3,700/mo | ___% | ? |
| **Supabase** | Storage | ___ MB | 381 MB | ___% | ? |
| **Sanity** | CDN | ___ MB | 455 MB | ___% | ? |
| **Sanity** | API Calls | ___/mo | 5,125/mo | ___% | ? |

**Notes:** 

---

## Quick Alert Thresholds

Use these as triggers to review usage immediately:

| Service | Metric | Alert Threshold | Action |
|---------|--------|-----------------|--------|
| **Vercel** | Bandwidth | > 20 GB/month | Check for spikes |
| **Vercel** | Bandwidth | > 50 GB/month | Start planning upgrade |
| **Vercel** | Bandwidth | > 95 GB/month | CRITICAL: Upgrade now |
| **Supabase** | DB Ops | > 100K/month | Monitor closely |
| **Supabase** | DB Ops | > 230K/month | Start planning upgrade |
| **Supabase** | DB Ops | > 450K/month | CRITICAL: Upgrade now |
| **Supabase** | Storage | > 750 MB | Monitor growth rate |
| **Supabase** | Storage | > 900 MB | Plan upgrade |
| **Sanity** | CDN | > 800 MB | Monitor closely |
| **Sanity** | CDN | > 1.7 GB | Start planning upgrade |
| **Sanity** | CDN | > 1.95 GB | CRITICAL: Upgrade now |

---

## Cost Summary

### Current Monthly Cost: $0

| Service | Feature | Cost | Notes |
|---------|---------|------|-------|
| Vercel | Hosting | $0 | Free tier |
| Supabase | Database | $0 | Free tier (2 projects) |
| Sanity | CMS | $0 | Free tier (post-optimization) |
| Stripe | Payments | ~$1-5 | Revenue dependent |
| Algolia | Search | $0 | Free tier (not in audit) |
| Clerk | Auth | $0 | Free tier (not in audit) |
| **Total** | - | **~$1-5** | - |

### Projected Upgrade Costs

| Scenario | Services | Monthly Cost | Timeline |
|----------|----------|--------------|----------|
| Current | Free tiers only | $0-5 | Now |
| At 7K visitors | Sanity Pro | $99 | Q1 2027 |
| At 10K visitors | Sanity + Supabase Pro | $124 | Q2 2027 |
| At 50K visitors | Vercel + Sanity + Supabase Pro | $144 | 2027 |
| At 100K visitors | All Pro plans | $144 | 2027-2028 |

---

## Optimization Status

### Applied Optimizations (June 21, 2026)

| Optimization | Service | Status | Impact | Maintenance |
|--------------|---------|--------|--------|-------------|
| Image variant reduction (9→6) | Sanity | ✅ Applied | 44% bandwidth reduction | Monitor deviceSizes |
| Lazy loading (below-fold) | Sanity | ✅ Applied | 40-50% bandwidth reduction | Check ArticleCards.tsx |
| Quality reduction (75%→65%) | Sanity | ✅ Applied | 30-40% file size reduction | Monitor for complaints |
| Edge Functions for Sentry | Vercel | ✅ Verified | 5x cost reduction | Already optimized |
| No global middleware | Vercel | ✅ Verified | Optimal performance | Already optimized |

### Potential Future Optimizations

| Opportunity | Service | Potential Savings | Effort | Priority |
|-------------|---------|------------------|--------|----------|
| Build cache | Vercel | 50% faster builds | 5 min | Medium |
| Query optimization | Supabase | ~5% DB operations | Medium | Low |
| Multi-project consolidation | Supabase | $25/month (on Pro) | High | Low |
| Further image optimization | Sanity | ~10% more bandwidth | Medium | Low |
| CDN caching optimization | Vercel | 5-10% bandwidth | Low | Medium |

---

## Checklist for Monthly Review

**Due: Last Friday of each month**

- [ ] Pull GA4 data (unique visitors this month)
- [ ] Calculate month-over-month growth %
- [ ] Check Vercel dashboard (bandwidth, functions)
- [ ] Check Supabase dashboard (database, storage)
- [ ] Check Sanity usage (CDN, API calls)
- [ ] Fill in current month row above
- [ ] Calculate % change from baseline
- [ ] Identify any anomalies
- [ ] Check alert thresholds
- [ ] Update growth projection if needed
- [ ] Document notes for month

---

## How to Use This Document

1. **Monthly (Last Friday):** Update current month row with actual metrics
2. **Quarterly:** Analyze trends and adjust growth projections
3. **Annually:** Review all data and strategic decisions
4. **When Alerted:** Check relevant alert threshold immediately

---

**Baseline Established:** June 21, 2026  
**Last Updated:** June 21, 2026  
**Next Update:** July 25, 2026

For detailed analysis, see `infrastructure-monitoring.md`
