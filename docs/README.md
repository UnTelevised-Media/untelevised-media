# Infrastructure Documentation

Complete documentation for monitoring, maintaining, and optimizing UnTelevised Media infrastructure across Vercel, Supabase, and Sanity.

---

## Quick Start

**Just want to know your current status?**

👉 **Start here:** [`infrastructure-quick-reference.md`](infrastructure-quick-reference.md)

**Need to do your monthly review?**

👉 **Go here:** [`infrastructure-baseline.md`](infrastructure-baseline.md)

**Want detailed monitoring strategy?**

👉 **Read this:** [`infrastructure-monitoring.md`](infrastructure-monitoring.md)

---

## Current Status (June 21, 2026)

| Service | Usage | Free Tier | Status | Safe Until |
|---------|-------|-----------|--------|-----------|
| **Vercel** | 0.8% | 100 GB bandwidth | ✅ Optimal | 161K visitors |
| **Supabase** | 0.74% | 500K DB ops | ✅ Optimal | 250K visitors |
| **Sanity** | 22.75% | 2 GB CDN | ✅ Optimized | 7K visitors |

**Monthly Cost:** $0 (free tier)  
**Total Cost After Optimization:** Saved $29/month in Sanity overages

---

## Key Metrics Summary

### Baseline (Post-Optimization)

```
📊 1,349 monthly visitors

VERCEL:
  Bandwidth: 835 MB/month (0.8% of 100 GB)
  Functions: 1,400/month (0.3% of 500K)
  
SUPABASE (2 projects):
  DB Operations: 3,700/month (0.74% of 500K)
  Storage: 381 MB (38.1% of 1 GB)
  
SANITY:
  API Calls: 5,125/month (0.25% of 2M)
  CDN: 455 MB (22.75% of 2 GB) [OPTIMIZED]

Cost: $0/month
```

### Safe Growth Levels

```
Current → 7K visitors:    SAFE (Sanity CDN bottleneck)
7K → 100K visitors:       Need Sanity Pro + Supabase planning
100K → 250K visitors:     Need Supabase Pro
250K+ visitors:           Enterprise plans
```

---

## Optimizations Applied (June 21, 2026)

### Sanity Asset CDN Optimization

**Before:**
- 5,140 MB/month (257% over 2 GB limit)
- $29/month in CDN overages
- 9 responsive image variants per image

**Applied:**
1. ✅ Image variant reduction: 9 → 6 variants (44% savings)
2. ✅ Lazy loading: Below-fold images on demand (40-50% savings)
3. ✅ Quality reduction: 75% → 65% (30-40% savings)

**After:**
- 455 MB/month (22.75% of 2 GB limit)
- $0/month in overages
- 77% safety margin for growth

**Time Invested:** 20 minutes  
**Monthly Savings:** $29/month

---

## Documents in This Folder

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `README.md` | This overview | Yearly |
| `infrastructure-monitoring.md` | Detailed monitoring guide | Reference as needed |
| `infrastructure-baseline.md` | Metrics tracking | Monthly |
| `infrastructure-quick-reference.md` | Quick lookup | Daily/Weekly |

---

## Monthly Review Process

1. Open `infrastructure-baseline.md`
2. Record current metrics from dashboards
3. Run alert checklist from `infrastructure-quick-reference.md`
4. If alerts triggered, consult `infrastructure-monitoring.md`

**Time required:** ~15 minutes/month

---

## Key Contacts & Resources

### Service Dashboards
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://app.supabase.com
- **Sanity:** https://untelevisedmedia.sanity.studio
- **GA4:** https://analytics.google.com

---

## Next Steps

1. **This Month:** Bookmark `infrastructure-quick-reference.md`
2. **End of Month:** Update `infrastructure-baseline.md` with July metrics
3. **Every Month:** Run alert checklist from quick reference
4. **At 5K Visitors:** Start planning Sanity Pro upgrade
5. **At 100K Visitors:** Evaluate all service Pro plans

---

**Current Baseline:** June 21, 2026  
**Last Updated:** June 21, 2026  
**Next Review:** July 21, 2026
