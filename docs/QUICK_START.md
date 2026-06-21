# Quick Start Guide

**Last Updated:** June 2026

Quick reference for the most common tasks in UnTelevised Media.

---

## Table of Contents

- [For New Developers](#for-new-developers)
- [For Writers/Contributors](#for-writerscontributors)
- [For Editors](#for-editors)
- [For Admins](#for-admins)
- [For Merchants](#for-merchants)
- [Troubleshooting](#troubleshooting)

---

## For New Developers

### Day 1: Setup

```bash
# 1. Clone repo
git clone https://github.com/UnTelevised-Media/untelevised-media.git
cd untelevised-media

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Fill in .env.local with dev credentials
# Ask team for Sanity, Supabase, Stripe test keys

# 5. Start dev server
npm run dev

# 6. Visit app
# http://localhost:3000 (public site)
# http://localhost:3000/studio (Sanity CMS)
```

### Day 1: Orientation

Read these in order:
1. **[Architecture](./architecture/ARCHITECTURE.md)** — System design overview
2. **[Project Structure](./architecture/ARCHITECTURE.md#route-groups--organization)** — Where files live
3. **[Data Flow](./architecture/ARCHITECTURE.md#data-flow)** — How data moves through system

### Day 2: First Task

```bash
# 1. Check available tasks
git log --oneline | head -20

# 2. Pick a small bug or feature
git checkout -b fix/something

# 3. Make changes in src/
# 4. Run type checking
npm run type-check

# 5. Test your changes
npm run dev  # Visit app in browser

# 6. Run linting
npm run lint:fix

# 7. Commit changes
git add .
git commit -m "fix: description of change"

# 8. Create pull request
# Push to GitHub and open PR
```

### Essential Reading

| Topic | Doc | Time |
|-------|-----|------|
| Setup | [Development](./setup/DEVELOPMENT.md) | 15 min |
| Architecture | [System Design](./architecture/ARCHITECTURE.md) | 30 min |
| Code Style | [Code Standards](./setup/CODE_STYLE.md) | 10 min |
| Git | [Git Workflow](./setup/GIT_WORKFLOW.md) | 10 min |

---

## For Writers/Contributors

### Write Your First Article

```bash
1. Go to https://www.untelevised.media/portal/articles/new
2. Click "New Article"
3. Enter title and slug
4. Click "Start Writing"
5. Use rich text editor:
   - Headings: # or click H1/H2/H3
   - Bold: Ctrl+B or select + click Bold
   - Links: Select text + click Link
   - Images: Click Insert Image → Upload
6. Save (auto-saves every 30 seconds)
7. When done, click "Submit for Review"
8. Wait for editor approval
9. Article published!
```

### Track Article Performance

```bash
1. Go to /portal/earnings/
2. Select time period (today, week, month, year)
3. See earnings from:
   - Article views (CPM rate)
   - Bookstore sales
4. Click article to drill down
```

### Get Paid

```bash
1. Earnings must reach $25 minimum
2. Payouts processed monthly (15th)
3. Go to /portal/earnings/
4. Click "Set up payouts"
5. Connect Stripe account or enter bank details
6. Money automatically sent when threshold reached
```

### Common Writing Tasks

| Task | Steps |
|------|-------|
| **Create article** | Portal → Articles → New |
| **Edit draft** | Portal → Articles → [Article] → Edit |
| **Submit for review** | Click "Submit for Review" |
| **Add image** | In editor: Insert Image → Upload |
| **Add link** | Select text → Insert Link |
| **Check status** | Portal → Articles (shows status) |

---

## For Editors

### Approve Submissions

```bash
1. Go to /portal/briefs/ (or check email for alerts)
2. Click article to review
3. Read content carefully
4. Click "Approve" or "Suggest Changes"
5. If approved: Article goes live
6. If changes needed: Author gets notified
```

### Publish an Article

```bash
1. Go to /portal/articles/
2. Find article (drafted but not published)
3. Click to open
4. Click "Publish"
5. Check /articles/[slug]/ - live!
```

### Manage Authors

```bash
1. Go to /portal/applications/
2. Review pending applicants
3. Click "Approve" or "Reject"
4. Accepted → Auto-sent welcome email
5. Rejected → Auto-sent decline email
```

### Common Editing Tasks

| Task | Steps |
|------|-------|
| **Publish article** | Articles → [Article] → Publish |
| **Approve pitch** | Briefs → [Pitch] → Approve |
| **Edit any article** | Articles → [Article] → Edit |
| **Delete content** | Articles → [Article] → Delete (soft-delete) |
| **View all orders** | Portal → Orders → List |

---

## For Admins

### Create a New User Role

```bash
# Via API
POST /api/admin/set-role
{
  "targetUserId": "user_xxxxx",
  "role": "author"
}

# Valid roles: admin, editor, author, sales

# Via Clerk Dashboard
# Dashboard → Users → [User] → Metadata → Public
# { "role": "author" }
```

### Assign Sales Role

Sales role can't be set via API (for safety). Set manually:

```bash
1. Go to Clerk Dashboard
2. Users → [User]
3. Metadata → Public
4. Add: { "role": "sales" }
5. Save
```

### Process Refund

```bash
1. Go to /portal/orders/
2. Click order
3. Click "Refund"
4. Enter amount and reason
5. Click "Process"
6. Money returned to customer's card
7. Email sent automatically
```

### Manage Subscribers

```bash
1. Go to /portal/subscribers/
2. View count by segment
3. Export CSV for analysis
4. Manually add new subscribers (if needed)
5. View unsubscribe list
```

### View Site Analytics

```bash
1. Vercel Dashboard → Project → Analytics
2. See:
   - Page views
   - Web Core Vitals
   - Edge function performance
   - Build times
   - Deployment history
```

### Common Admin Tasks

| Task | Steps |
|------|-------|
| **Assign role** | API: `/api/admin/set-role` |
| **Refund order** | Orders → [Order] → Refund |
| **Update order** | Orders → [Order] → Status |
| **View all articles** | Portal → Articles (see all) |
| **Manage users** | Clerk Dashboard |

---

## For Merchants

### Add a New Product

```bash
1. Go to /studio (Sanity CMS)
2. Products → Create
3. Fill in:
   - Title
   - Author/Creator
   - Price (in cents: $19.99 = 1999)
   - Format (Physical or Digital)
   - Description
   - Cover image
4. For physical books: Set inventory
5. For digital books: Upload file (PDF/ePub)
6. Publish
```

### Manage Inventory

```bash
1. Go to /studio → Products
2. Find product
3. Edit inventory count
4. Save
5. Change reflected in bookstore immediately
```

### View Sales

```bash
1. Go to /portal/orders/
2. See all orders with:
   - Customer name
   - Order date
   - Items purchased
   - Total
   - Status (processing/shipped/delivered)
3. Update status as needed
```

### Process an Order

```bash
1. Go to /portal/orders/
2. Click order
3. Update status:
   - "processing" → "shipped" (add tracking)
   - "shipped" → "delivered"
4. Customer gets notified automatically
5. For refunds: Click Refund
```

### Common Merchant Tasks

| Task | Steps |
|------|-------|
| **Add product** | /studio → Products → Create |
| **Update price** | /studio → Products → [Product] |
| **Check inventory** | /studio → Products → [Product] |
| **View orders** | Portal → Orders |
| **Ship order** | Orders → [Order] → Status: shipped + tracking |
| **Process refund** | Orders → [Order] → Refund |

---

## Troubleshooting

### "I can't log in"

```
1. Check you're at: https://www.untelevised.media (not localhost)
2. Try signing up instead if account doesn't exist
3. Check email for sign-up link (check spam folder)
4. Try clearing browser cookies and refresh
5. Contact support if still broken
```

### "My article didn't publish"

```
1. Check article is marked "Published" (not "Draft")
2. Wait 10 seconds (ISR regeneration)
3. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R)
4. Check at: /articles/[slug]/ (replace [slug])
5. If still missing: Check for errors in /studio
```

### "Payment failed"

```
1. Check error message for details
2. If card decline: Try different card
3. If currency: Make sure price is in USD
4. Check Stripe dashboard for declined payment
5. Contact support@untelevised.media
```

### "View counts wrong"

```
1. View tracking has 24-hour delay
2. Refresh page to see latest cache
3. Check Supabase dashboard for view_events table
4. Manual sync: npm run cron/sync-view-counts (admin only)
```

### "Image not showing"

```
1. Check image uploaded successfully to Sanity
2. Wait 5 minutes (Sanity CDN cache)
3. Hard refresh: Ctrl+Shift+R
4. Right-click image → Inspect → Check URL
5. Try direct URL: https://cdn.sanity.io/images/...
```

### "Search not working"

```
1. Make sure article is published (not draft)
2. Wait 10 minutes (Algolia sync delay)
3. Force sync (admin): npm run algolia:index
4. Check Algolia dashboard that index exists
5. Try searching in browser dev console
```

### "Newsletter email not sending"

```
1. Check email address is valid
2. Check user confirmed subscription (email link)
3. Wait 5 minutes (email can be slow)
4. Check spam folder
5. Check Resend dashboard for delivery status
```

---

## Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| "Module not found" | Dependencies not installed | `npm install` |
| "Cannot read property" | Null reference | Check null checks in code |
| "401 Unauthorized" | Not logged in | Sign in via Clerk |
| "403 Forbidden" | Don't have permission | Check your role |
| "404 Not Found" | Resource doesn't exist | Check slug/ID is correct |
| "500 Server Error" | Backend crash | Check server logs |
| "Rate limit exceeded" | Too many requests | Wait 1 hour before trying again |

---

## Important URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | `/` | News homepage |
| **Portal** | `/portal/` | Contributor dashboard |
| **Bookstore** | `/bookstore/` | E-commerce |
| **Studio** | `/studio/` | Sanity CMS |
| **Search** | `/search/` | Search articles |
| **Sign In** | `/sign-in/` | Login page |
| **Sign Up** | `/sign-up/` | Create account |

---

## Key Contacts

| Role | What They Do | Contact Method |
|------|-------------|-----------------|
| **Developers** | Code, architecture, deployment | Slack #dev-team |
| **Editors** | Publish content, approve submissions | Portal / Slack #editorial |
| **Support** | Customer issues | support@untelevised.media |
| **Admins** | User management, permissions | Slack #admin |

---

## Learning Resources

| Topic | Resource | Time |
|-------|----------|------|
| **Getting started** | [Development Setup](./setup/DEVELOPMENT.md) | 20 min |
| **Architecture** | [System Design](./architecture/ARCHITECTURE.md) | 30 min |
| **Features** | [Features Index](./DOCUMENTATION_INDEX.md#feature-documentation) | Varies |
| **API** | [API Reference](./technical/api/README.md) | 20 min |
| **Deployment** | [Deploy Guide](./operations/DEPLOYMENT.md) | 15 min |

---

## Next Steps

### If you're a developer:
1. Read [Development Setup](./setup/DEVELOPMENT.md)
2. Read [Architecture](./architecture/ARCHITECTURE.md)
3. Pick a task from GitHub issues
4. Join #dev-team Slack

### If you're a writer:
1. Go to /portal/
2. Create new article
3. Submit for review
4. Track earnings

### If you're an editor:
1. Check /portal/briefs/ for submissions
2. Review and approve/reject
3. Manage team members
4. Track publish metrics

### If you're admin:
1. Monitor /portal/orders/
2. Manage user roles
3. View analytics
4. Process refunds as needed

---

## Getting Help

**Found a bug?**
→ Create GitHub issue with details

**Have a question?**
→ Check documentation or ask in Slack

**Need access?**
→ Contact admin to assign role

**Something broken in production?**
→ Alert #ops channel immediately

---

## Documentation Overview

| Section | Purpose |
|---------|---------|
| [Setup](./setup/) | Environment setup, development |
| [Architecture](./architecture/) | System design, data flow |
| [Features](./features/) | Feature guides for each section |
| [Technical](./technical/) | API, database, frontend, testing |
| [Operations](./operations/) | Deployment, monitoring, maintenance |
| [Glossary](./GLOSSARY.md) | Terms and acronyms |
| [Index](./DOCUMENTATION_INDEX.md) | Master index of all docs |

---

## Last Updated

This guide was last updated on **June 17, 2026**. For latest docs, see [Documentation Index](./DOCUMENTATION_INDEX.md).

---

Need help? Start with [Documentation Index](./DOCUMENTATION_INDEX.md) or ask your team lead.
