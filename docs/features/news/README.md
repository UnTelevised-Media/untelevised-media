# News Section

**Last Updated:** June 2026

The news section is the core publishing platform with articles, breaking news, fact-checks, timelines, and more.

---

## Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Articles | ✅ Live | Full editorial workflow, scheduled publishing |
| Categories | ✅ Live | Content organization and filtering |
| Authors | ✅ Live | Author bios and article attribution |
| Breaking News | ✅ Live | Real-time ticker system |
| Fact-Checks | ✅ Live | Verdict-based fact-checking |
| Timelines | ✅ Live | Event timeline narratives |
| Newsletter | ✅ Live | Email subscriptions and delivery |
| View Tracking | ✅ Live | Supabase-based article analytics |
| Trending | ✅ Live | Popular articles calculation |
| Comments | ✅ Live | Coral comment system |

---

## URL Structure

### Homepage
- `/` — Homepage with latest articles and featured content

### Article Pages
- `/articles/[slug]/` — Single article view
- `/archive/` — Article archive with filters
- `/articles/[slug]/opengraph-image` — Dynamic OG image for sharing

### Category Pages
- `/category/[slug]/` — Articles filtered by category
- `/categories/` — Category listing (via API)

### Author Pages
- `/author/[slug]/` — Author profile and their articles
- `/staff/` — Staff directory

### Breaking News
- `/breaking/` — Breaking news ticker view
- `/breaking/[slug]/` — Individual breaking news items

### Fact-Checking
- `/fact-checks/` — Fact-check article listing
- `/fact-check/[slug]/` — Individual fact-check article

### Other
- `/search/` — Full-text search page
- `/timelines/` — Timeline listing
- `/timeline/[slug]/` — Timeline detail view
- `/timeline/category/[slug]/` — Timelines by category

---

## Content Types

### Article
Primary content type for news reporting.

**Key fields:**
- `title` — Article headline
- `slug` — URL-friendly identifier
- `content` — Rich text body (Portable Text)
- `author` — Reference to author document
- `category` — Content categorization
- `publishedAt` — Publication timestamp
- `status` — Draft/published
- `featuredImage` — Hero image
- `viewCount` — Populated from Supabase (not editable)

**Publishing workflow:**
1. Create draft
2. Add content and metadata
3. Upload featured image
4. Set publish date (immediate or scheduled)
5. Publish to make live

### Breaking News
Real-time news updates on urgent topics.

**Key fields:**
- `title` — Headline
- `content` — Brief description or full story
- `status` — Active/inactive
- `publishedAt` — Timestamp
- `icon` — Alert icon (optional)

**Use case:** Live event coverage, urgent announcements, developing stories

### Fact-Check Article
Structured fact-checking content.

**Key fields:**
- `title` — Claim being checked
- `verdict` — One of: True, False, Misleading, Partially True
- `context` — Background and investigation
- `sources` — Linked evidence
- `reasoning` — Why this verdict was reached

**Schema:** Implements `ClaimReview` structured data for search engines

### Timeline
Narrative timeline of connected events.

**Key fields:**
- `title` — Timeline name
- `category` — Type of timeline (e.g., "Politics", "Climate")
- `events` — Array of timeline events
- Each event has: `date`, `title`, `description`, `image`

**Example:** "2024 Election Timeline", "Climate Crisis in 2024"

### Category
Content organization and filtering.

**Key fields:**
- `title` — Category name
- `slug` — URL identifier
- `description` — Category description
- `icon` — Visual identifier

---

## Core Features

### Article Publishing

See [Articles](./ARTICLES.md) for detailed guide on:
- Creating new articles
- Editing and updating
- Scheduling publication
- Managing drafts
- Unpublishing content

### View Tracking

Articles automatically track pageviews via Supabase:

```typescript
// Automatically triggered on article page views
await trackView({
  articleId: article._id,
  userId: user?.id || null,
  country: geoLocation.country,
  timestamp: new Date(),
});
```

**Dashboard:** Authors see view counts in portal → Earnings

### Comments (Coral Integration)

Articles can have user comments powered by Coral:
- SSO via `/api/coral-token`
- Roles mapped: `admin` → Moderator, others → Commenter
- Comments appear below articles (optional per article)

### Trending Calculation

Trending articles are calculated based on:
1. **View velocity** — Recent views (last 24-48 hours)
2. **Comment activity** — Recent comments
3. **Recency** — Published recently (last 7 days preferred)

Trending articles update hourly via `/api/cron/sync-view-counts` (Vercel cron)

### Newsletter Integration

Articles can be included in scheduled newsletters:

**Subscription flow:**
1. User subscribes via `/api/newsletter-subscribe`
2. Email confirmation sent
3. After confirmation, user receives weekly digests
4. Unsubscribe via email link or `/api/newsletter-unsubscribe`

---

## SEO & Social Sharing

### Metadata

All article pages generate:
- Dynamic `<title>` tags
- Meta descriptions (150 chars)
- Open Graph tags (image, description, URL)
- Twitter Card meta tags
- Canonical URLs

**Automatic from article content:**
```typescript
// Pulled from Sanity article
export const metadata = {
  title: article.title,
  description: article.excerpt,
  openGraph: {
    title: article.title,
    description: article.excerpt,
    images: [{ url: imageUrl }],
  },
};
```

### Structured Data

Fact-check articles implement `ClaimReview` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "ClaimReview",
  "claimReviewed": "The claim being fact-checked",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "True" // or False, Misleading, etc.
  },
  "url": "https://untelevised.media/fact-check/...",
  "author": { "@type": "Organization", "name": "UnTelevised Media" }
}
```

### Sitemap

Dynamic sitemap at `/sitemap.xml` includes:
- All published articles
- All categories
- All authors
- All fact-checks
- Static pages (about, staff, support)

**Priority scoring:**
- Articles: 0.8
- Categories: 0.7
- Authors: 0.6
- Static pages: 0.5

---

## Database Schema (Supabase)

### view_events table
Tracks article pageviews:

```sql
CREATE TABLE view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  user_id UUID,
  country TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_view_events_article ON view_events(article_id);
CREATE INDEX idx_view_events_date ON view_events(created_at);
```

**Usage:**
- Article pages call `POST /api/view` to log pageviews
- Trending calculation queries this table
- Authors see aggregate counts in portal

---

## API Routes

See [API Routes](../../technical/api/README.md) for complete reference. Key routes for news:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/view` | POST | Log article pageview |
| `/api/cron/sync-view-counts` | POST | Calculate trending hourly |
| `/api/newsletter-subscribe` | POST | Subscribe user to newsletter |
| `/api/newsletter-confirm` | POST | Confirm newsletter subscription |
| `/api/newsletter-unsubscribe` | POST | Unsubscribe from newsletter |

---

## Performance & Caching

### ISR (Incremental Static Regeneration)

Article pages are pre-rendered and cached:

```typescript
// src/app/(news)/articles/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map(a => ({ slug: a.slug }));
}
```

**Benefits:**
- Fast page loads (served from CDN)
- Automatic regeneration when content changes
- Fallback pages for new articles while revalidating

### View Count Caching

View counts are cached and updated hourly:
1. Live view events go to Supabase `view_events` table
2. Hourly cron job aggregates counts
3. Updated counts available in article pages
4. Portal shows near-real-time view counts

---

## Editorial Workflow (Portal)

Contributors use the Portal to:

1. **Create articles** — `/portal/articles/new`
2. **Edit drafts** — `/portal/articles/[id]/edit`
3. **Submit for review** — Click "Submit for Review"
4. **Track status** — See publish status in dashboard
5. **View earnings** — `/portal/earnings` shows article-level revenue

Editors can approve/reject submissions and publish directly.

---

## Moderation & Admin

### Content Moderation

Editors can:
- Unpublish articles (move to draft)
- Edit any article
- Delete articles (soft delete)
- Change author attribution
- Update category assignments

Admin can:
- Do everything editors can
- Change article status across all content
- Access moderation dashboard
- Assign reviewer roles

### Sensitive Content

Articles can be marked as:
- Explicit content warnings
- Triggering content (with description)
- Fact-checked/disputed (shows banner)
- Retracted (archive only)

---

## Future Features

Based on recent commits and planning:

| Feature | Status | ETA |
|---------|--------|-----|
| Scheduled newsletters | 🔄 In development | Q3 2026 |
| Article analytics dashboard | 📋 Planned | Q3 2026 |
| Content syndication | 📋 Planned | Q4 2026 |
| Paywall/membership content | 🔄 In development | Q4 2026 |

---

## Related Documentation

- **[Articles](./ARTICLES.md)** — Publishing articles
- **[Breaking News](./BREAKING_NEWS.md)** — Breaking news ticker
- **[Fact-Checking](./FACT_CHECKING.md)** — Fact-check articles
- **[Timelines](./TIMELINES.md)** — Event timelines
- **[Newsletter](../engagement/NEWSLETTER.md)** — Email newsletter system
- **[View Tracking](../analytics/VIEW_TRACKING.md)** — View counting system
- **[Search](../search/ALGOLIA.md)** — Article discovery

---

## Common Tasks

### Creating an Article

```bash
1. Go to /studio → Articles
2. Click "Create" → Article
3. Fill in title, author, category
4. Add content using rich text editor
5. Upload featured image
6. Set publish date (now or scheduled)
7. Click "Publish"
```

### Searching Articles

```bash
# By title
/search?q=climate+crisis

# By category
/category/politics

# By author
/author/jane-smith
```

### Viewing Trending

```bash
# Homepage shows trending section (top 5)
# Full trending view (if available)
GET /api/trending?limit=10
```

---

## Troubleshooting

**Article not appearing:**
- Check publish date hasn't passed
- Verify author is assigned
- Check category is set
- Run: `npm run algolia:index` to sync search

**View counts not updating:**
- Check Supabase connection in `/api/view`
- Verify `view_events` table exists
- Check server logs for errors

**Images not loading:**
- Verify image is uploaded to Sanity
- Check CDN domain in next.config.ts
- Try: `curl https://cdn.sanity.io/...` to test

**Newsletter emails not sending:**
- Check Resend API key is valid
- Verify email template is correct
- Check user is confirmed in subscribers table

---

## Questions?

See [Documentation Index](../../DOCUMENTATION_INDEX.md) for all docs or reach out to the editorial team.
