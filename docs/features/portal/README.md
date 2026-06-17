# Contributor Portal

**Last Updated:** June 2026

Dashboard for writers, editors, and contributors to manage content, track earnings, and submit work.

---

## Overview

| Feature | Status | Role |
|---------|--------|------|
| Article Management | ✅ Live | Author, Editor, Admin |
| Pitch System | ✅ Live | Author, Editor, Admin |
| Brief Management | ✅ Live | Author, Editor, Admin |
| Earnings Dashboard | ✅ Live | Author, Editor, Admin |
| Source Management | ✅ Live | Author, Editor, Admin |
| Image Uploads | ✅ Live | Author, Editor, Admin |
| Application System | ✅ Live | Admin |
| Contact Messages | ✅ Live | All roles |

---

## Access & Permissions

Portal is only accessible to authenticated users with these roles:

| Role | Access | Can Do |
|------|--------|--------|
| `admin` | Full | Everything + manage users |
| `editor` | Full | Everything except user management |
| `author` | Limited | Only own content |
| `sales` | Orders only | View/update orders only |
| None | Denied | Redirect to `/` |

**How to get access:** Request role assignment from existing admin.

---

## URL Structure

### Main Dashboard
- `/portal/` — Portal homepage with navigation
- `/portal/profile/` — Edit profile and account settings

### Articles
- `/portal/articles/` — Your articles (drafts, published, archived)
- `/portal/articles/new/` — Create new article
- `/portal/articles/[id]/edit/` — Edit article in BlockNote editor

### Pitches & Briefs
- `/portal/pitch/[id]/` — View pitch details
- `/portal/briefs/` — (for editors) All briefs inbox

### Administrative
- `/portal/sources/` — Article sources (research materials)
- `/portal/sources/[id]/edit/` — Edit source
- `/portal/books/` — Book inventory management
- `/portal/applications/` — Contributor applications (admin only)
- `/portal/orders/` — Order management (sales role)

### Earnings & Analytics
- `/portal/earnings/` — Revenue and payout tracking
- `/portal/sales/` — Bookstore sales analytics
- `/portal/subscribers/` — Newsletter subscriber list (admin)

---

## Authentication & Authorization

### Session Management

Uses Clerk for auth:

```typescript
// Middleware checks role
if (!session) redirect('/sign-in');
if (!hasPortalRole(session.publicMetadata.role)) {
  redirect('/'); // Not in portal roles
}
```

### Role Hierarchy

```
admin (highest)
  ↑
  └── editor
       ↑
       └── author (lowest)

sales (peer - no hierarchy)
```

**Permission example:**
- `hasRole(session.role, 'editor')` is `true` for both `editor` and `admin`
- `hasRole(session.role, 'editor')` is `false` for `author`

See [Roles Documentation](../admin/ROLES.md) for complete reference.

---

## Article Management

### Creating an Article

```
1. Go to /portal/articles/
2. Click "New Article"
3. Enter title and slug
4. Start writing in BlockNote editor
5. Add metadata:
   - Author (auto-filled)
   - Category
   - Featured image
   - Excerpt (SEO)
6. Save as Draft (auto-saves every 30 seconds)
7. Submit for Review (if author)
8. Publish (if editor/admin)
```

### Article States

```
Draft → In Review → Published
          ↓
        Rejected → Back to Draft

Published → Archived
```

| State | Can Edit | Can Publish | Visible |
|-------|----------|------------|---------|
| Draft | Yes | No | Only to author |
| In Review | No | Editors only | Only to reviewers |
| Published | Yes | Yes | Public |
| Archived | No | No | Public (if was published) |

### Rich Text Editor (BlockNote)

Articles use BlockNote for rich editing:

**Supported:**
- Headings (H1-H3)
- Paragraphs and formatting (bold, italic, underline)
- Links and images
- Numbered/bulleted lists
- Code blocks
- Blockquotes
- Dividers

**When saving:**
- Article auto-saves every 30 seconds
- Notification shows save status
- BlockNote content converted to Portable Text (Sanity format)

### Editing Restrictions

**Authors:**
- Can only edit own articles
- Can only edit drafts or in-review articles
- Cannot publish directly

**Editors:**
- Can edit any article
- Can edit any status
- Can publish directly
- Can edit other authors' work

**Admins:**
- Full edit permissions
- Can change author attribution
- Can soft-delete articles

---

## Pitches & Briefs

### Pitch System

Articles can be created from pitches:

```
Pitch → Author submits idea
   ↓
Pitch → Editors review + approve/reject
   ↓
Brief → Editor creates from approved pitch
   ↓
Brief → Author uses as template for article
```

### Creating a Pitch

```
1. Go to /portal/articles/new
2. Start with a pitch (pre-article planning)
3. Enter:
   - Title
   - Topic/category
   - Proposed angle
   - Research outline
4. Submit for editorial review
```

### Managing Briefs

Briefs are editorial assignments:

**Structure:**
- Title/headline idea
- Angle/perspective
- Research direction
- Sources to explore
- Length guidance
- Deadline

**Workflow:**
1. Editor creates brief
2. Assigns to author or opens for pitches
3. Author uses as template
4. Creates article based on brief
5. Submits for editor approval

---

## Source Management

Sources are research materials and references for articles.

### Adding Sources

```
1. Go to /portal/sources/
2. Click "New Source"
3. Enter:
   - Title
   - URL
   - Type (article, report, study, etc.)
   - Notes
   - Related article(s)
4. Save
```

### Linking to Articles

In article edit screen:
```
1. Scroll to "Sources" section
2. Click "Add Source"
3. Search existing sources
4. Create new source if needed
5. Save article
```

### Bulk Source Import

Import research from text:

```
1. Go to /portal/sources/
2. Click "Import Sources"
3. Paste text with URLs
4. System auto-extracts and creates sources
5. Review and confirm
```

---

## Image Uploads

### Upload Process

```
1. In article editor, click "Insert image"
2. Choose "Upload from computer"
3. Select JPG/PNG/WebP (max 10MB)
4. Image uploads to Sanity
5. Auto-resized to web-optimized versions
6. Inserted into article at cursor
```

### Featured Image

Every article needs a featured image for:
- Homepage cards
- Social sharing preview
- Category pages

**Upload featured image:**
1. Article editor → "Featured Image" section
2. Click upload
3. Crop if needed
4. Save

### Image Optimization

- Next.js auto-optimizes on first load
- Serves WebP to supported browsers
- Lazy-loads below fold
- Responsive sizing for mobile

---

## Earnings & Payouts

### Earnings Dashboard

Go to `/portal/earnings/` to see:

**Revenue breakdown:**
- Article views × rate per 1000 views (CPM)
- Bookstore sales (author's share)
- Affiliate commissions (if applicable)
- Donations (if applicable)

**Time periods:**
- Today
- This week
- This month
- This year
- Custom date range

### View-Based Revenue

Authors earn based on article views:

```
earnings = (total_views / 1000) × CPM_rate

CPM rate: Negotiable, typically $2-10 per 1000 views
```

**Example:** 50,000 views × ($5 CPM ÷ 1000) = $250

### Bookstore Revenue

Authors earn percentage of sales:

```
author_payout = sale_price × author_percentage

Author percentage: Typically 50-70% depending on contract
```

**Example:** $20 book sale with 60% author cut = $12

### Payout Schedule

Payouts processed:
- **Frequency:** Monthly
- **Threshold:** $25 minimum
- **Payment method:** Stripe Connect or direct ACH
- **Timing:** 15th of following month

### Withdrawal

To set up payouts:

```
1. Go to /portal/earnings/
2. Click "Set up payouts"
3. Connect Stripe account
4. Or provide bank details for ACH
5. Payouts automatically sent when threshold met
```

---

## Portal Settings

### Profile

Edit your profile at `/portal/profile/`:

- **Name** — Display name (for bylines)
- **Bio** — Short bio (for author pages)
- **Avatar** — Profile picture
- **Website** — Personal site or social
- **Email** — Contact email (change via Clerk)

### Content Preferences

- **Notification frequency** — When to get alerts
- **Preferred categories** — Topics to focus on
- **Writing style** — Notes for editors

### Privacy Settings

- **Show in author directory** — Public author page
- **Allow direct pitches** — Contact from readers
- **Email subscriptions** — Marketing emails

---

## Admin-Only Features

### Applications Dashboard

View and manage contributor applications at `/portal/applications/`:

```
1. Application list shows:
   - Applicant name
   - Email
   - Applied date
   - Status (new, reviewing, approved, rejected)

2. Click application to:
   - View portfolio
   - Read cover letter
   - Approve → auto-send acceptance
   - Reject → auto-send decline
```

### User Management

Assign roles to users via `/api/admin/set-role`:

```http
POST /api/admin/set-role
{
  "targetUserId": "user_xxxxx",
  "role": "author"
}
```

Valid roles: `admin`, `editor`, `author`, `sales`

### Subscriber Management

View/export newsletter subscribers at `/portal/subscribers/`:

- Count by segment
- Export CSV
- Manually add subscribers
- Manage unsubscribe list

---

## API Routes for Portal

### Articles

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portal/articles` | GET | List user's articles |
| `/api/portal/articles` | POST | Create new article |
| `/api/portal/articles/[id]` | PATCH | Update article |
| `/api/portal/articles/[id]` | DELETE | Soft-delete article |

### Images

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portal/upload-image` | POST | Upload and store image |

### Orders (Sales Role)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portal/orders/[id]/status` | PATCH | Update order status |

---

## Common Tasks

### Publish an Article

```
1. Go to /portal/articles/
2. Open article to edit
3. Click "Submit for Review"
4. Wait for editor approval
5. Editor publishes (or you if admin)
6. Article goes live at /articles/[slug]/
```

### Track Article Performance

```
1. Go to /portal/earnings/
2. Select time period
3. See views and revenue
4. Click article to drill down
5. View geographic breakdown
```

### Manage Team

```
1. Go to /portal/applications/
2. Review applications
3. Approve promising contributors
4. Or manage existing users at /api/admin/set-role
```

### Export Subscriber List

```
1. Go to /portal/subscribers/
2. Filter by segment (if needed)
3. Click "Export CSV"
4. Download to analyze
```

---

## Permissions Matrix

| Feature | Author | Editor | Admin | Sales |
|---------|--------|--------|-------|-------|
| Read own articles | ✅ | ✅ | ✅ | ❌ |
| Read all articles | ❌ | ✅ | ✅ | ❌ |
| Create articles | ✅ | ✅ | ✅ | ❌ |
| Edit own articles | ✅ | ✅ | ✅ | ❌ |
| Edit other's articles | ❌ | ✅ | ✅ | ❌ |
| Publish directly | ❌ | ✅ | ✅ | ❌ |
| View earnings | ✅ | ✅ | ✅ | ❌ |
| View all orders | ❌ | ❌ | ✅ | ✅ |
| Update order status | ❌ | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ | ❌ |
| Review applications | ❌ | ❌ | ✅ | ❌ |

---

## Troubleshooting

**Can't access portal:**
- Verify you're logged in (check top-right avatar)
- Check your role is set (contact admin)
- Clear cookies and sign out/in again

**Article not saving:**
- Check your internet connection
- Look for red "Error saving" message
- Try: Refresh page and edit again
- Contact support if persists

**Images not uploading:**
- Check file size < 10MB
- Verify image format (JPG, PNG, WebP)
- Check internet connection
- Try different browser

**Earnings not showing:**
- Articles need to be published
- Views need 24 hours to process
- Check article is in correct category
- Refresh page to see latest data

---

## Related Documentation

- **[Roles](../admin/ROLES.md)** — Role-based permissions
- **[Article Workflow](./ARTICLE_WORKFLOW.md)** — Detailed publishing process
- **[Earnings](./EARNINGS.md)** — Revenue and payout details
- **[Applications](./APPLICATIONS.md)** — Contributor application process

---

## Questions?

See [Documentation Index](../../DOCUMENTATION_INDEX.md) or contact the editorial team.
