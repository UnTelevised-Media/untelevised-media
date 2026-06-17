# API Routes Reference

**Last Updated:** June 2026

Complete reference of all API endpoints in UnTelevised Media.

---

## API Overview

- **Base URL:** `https://www.untelevised.media` (production)
- **Local:** `http://localhost:3000` (dev)
- **Authentication:** Clerk JWT via `Authorization` header or cookies
- **Format:** JSON request/response bodies
- **Rate limiting:** Per-endpoint, tracked via Upstash Redis

---

## Quick Index

### News & Content
- [`GET /api/view`](#post-apiview) - Log article pageview
- [`POST /api/cron/sync-view-counts`](#post-apicronsync-view-counts) - Update trending hourly

### Newsletter
- [`POST /api/newsletter-subscribe`](#post-apinewsletter-subscribe) - Subscribe to newsletter
- [`POST /api/newsletter-confirm`](#post-apinewsletter-confirm) - Confirm subscription
- [`POST /api/newsletter-unsubscribe`](#post-apinewsletter-unsubscribe) - Unsubscribe

### Bookstore
- [`POST /api/bookstore/checkout`](#post-apibookstoreCheckout) - Create checkout session
- [`GET /api/bookstore/my-downloads`](#get-apibookstoremydownloads) - List user's downloads
- [`GET /api/bookstore/download`](#get-apibookstoredownload) - Download digital item
- [`POST /api/bookstore/download/guest-resend`](#post-apibookstoredownloadguestresend) - Resend download link
- [`POST /api/bookstore/reviews`](#post-apibookstoreviews) - Submit product review
- [`GET /api/bookstore/newsletter`](#get-apibookstore-newsletter) - Bookstore email list

### Portal (Contributor)
- [`POST /api/portal/articles`](#post-apiportalarticles) - Create article
- [`PATCH /api/portal/articles/[id]`](#patch-apiportalarticlesid) - Update article
- [`POST /api/portal/upload-image`](#post-apiportalupload-image) - Upload article image
- [`PATCH /api/portal/orders/[id]/status`](#patch-apiportalordersidstatus) - Update order status

### Admin
- [`POST /api/admin/set-role`](#post-apiadminset-role) - Assign user role

### Webhooks & Events
- [`POST /api/webhooks/supabase-order-update`](#post-apiwebhookssupabase-order-update) - Supabase realtime updates
- [`POST /api/webhooks/stripe`](#post-apiwebhooksstripe-via-clerk) - Stripe payments

### CMS & Content
- [`POST /api/draft`](#post-apidraft) - Enable draft mode
- [`POST /api/disable-draft`](#post-apidisable-draft) - Disable draft mode
- [`POST /api/revalidate`](#post-apirevalidate) - Revalidate cached pages

### Utilities
- [`GET /api/compute-reading-time`](#get-apicompute-reading-time) - Calculate article reading time
- [`POST /api/algolia-sync`](#post-apialgolia-sync) - Sync content to Algolia
- [`POST /api/secure-contact`](#post-apisecure-contact) - Send secure contact message
- [`POST /api/coral-token`](#post-apicoral-token) - Get Coral comment token

### Admin CMS
- [`POST /api/disable-draft`](#post-apidisable-draft) - Exit draft mode
- [`POST /api/job-application`](#post-apijob-application) - Submit job application
- [`POST /api/careers-application`](#post-apicareers-application) - Submit career application
- [`POST /api/whistleblower`](#post-apiwhistleblower) - Submit whistleblower tip
- [`GET /api/monitoring`](#get-apimonitoring) - Health check endpoint

---

## Auth & Security

### Authentication

Most routes require Clerk authentication:

```typescript
// Auth is checked by Clerk middleware
// Routes can access user via:
const user = await auth();
if (!user.userId) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Role-Based Access

Portal routes check roles:

```typescript
const session = await auth();
if (!hasRole(session.publicMetadata.role, 'author')) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

### CORS & Headers

- **CORS:** None (same-origin API)
- **Content-Type:** `application/json`
- **Auth:** `Authorization: Bearer <clerk-token>` or session cookie

---

## News & Content Routes

### POST `/api/view`

Log an article pageview for analytics.

**Request:**
```json
{
  "articleId": "article_slug_or_id",
  "country": "US"  // optional, geo-detected from IP
}
```

**Response:**
```json
{
  "success": true,
  "viewId": "uuid"
}
```

**Error:**
```json
{ "error": "Article not found", "status": 404 }
```

**Rate limit:** 100 requests/hour per IP

**Used by:** Article pages, tracking pixels

---

### POST `/api/cron/sync-view-counts`

Calculate trending articles from Supabase view events. Called hourly by Vercel cron.

**Trigger:** `POST /api/cron/sync-view-counts`

**Auth:** Requires `SUPABASE_SERVICE_ROLE_KEY`

**What it does:**
1. Query `view_events` table for last 48 hours
2. Aggregate views by article
3. Calculate trending score (views + recency + comments)
4. Update article viewCount in Sanity
5. Update trending index in Supabase

**Response:**
```json
{
  "success": true,
  "articlesProcessed": 142,
  "topArticles": [
    { "title": "...", "views": 5000 },
    { "title": "...", "views": 3200 }
  ]
}
```

---

## Newsletter Routes

### POST `/api/newsletter-subscribe`

Subscribe email to newsletter.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",  // optional
  "source": "homepage",  // optional
  "tags": ["news", "politics"]  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation email sent"
}
```

**What happens:**
1. Email added to Resend audience
2. Confirmation email sent with unsubscribe link
3. User must click link to be fully subscribed

**Rate limit:** 10 per minute per IP

---

### POST `/api/newsletter-confirm`

Confirm newsletter subscription via email link.

**Request:**
```json
{
  "token": "jwt_token_from_email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email confirmed"
}
```

**Error:**
```json
{ "error": "Invalid or expired token" }
```

---

### POST `/api/newsletter-unsubscribe`

Unsubscribe from newsletter.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

**Used by:** Email unsubscribe links

---

## Bookstore Routes

### POST `/api/bookstore/checkout`

Create Stripe checkout session for cart.

**Auth:** User must be logged in

**Request:**
```json
{
  "items": [
    {
      "productId": "book_123",
      "quantity": 1,
      "price": 1999  // in cents
    }
  ],
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxx"
}
```

**Redirect:** Send user to returned URL for checkout

**Rate limit:** 10 per minute per user

---

### GET `/api/bookstore/my-downloads`

List user's purchased digital products.

**Auth:** Requires logged-in user

**Response:**
```json
{
  "orders": [
    {
      "orderId": "ord_123",
      "date": "2026-06-15T10:30:00Z",
      "items": [
        {
          "productId": "book_456",
          "title": "Digital Book Title",
          "downloadUrl": "/api/bookstore/download?orderId=ord_123&itemId=book_456"
        }
      ]
    }
  ]
}
```

---

### GET `/api/bookstore/download`

Download a purchased digital product.

**Query params:**
```
?orderId=ord_123&itemId=book_456
```

**Auth:** 
- Signed JWT with user+item verification
- 7-day link expiration

**Response:** Binary file (application/pdf or application/epub+zip)

**Rate limit:** 100 per hour per user

---

### POST `/api/bookstore/download/guest-resend`

Resend download link for guest (unauthenticated) purchase.

**Request:**
```json
{
  "email": "customer@example.com",
  "orderId": "ord_123",
  "captchaToken": "cloudflare_turnstile_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Download link re-sent to email"
}
```

**Requirements:**
- Turnstile captcha verification
- Email matches order
- Order less than 90 days old

**Rate limit:** 5 per hour per IP

---

### POST `/api/bookstore/reviews`

Submit a product review.

**Auth:** Requires logged-in user who purchased product

**Request:**
```json
{
  "productId": "book_123",
  "rating": 5,
  "title": "Absolutely loved it!",
  "text": "This book changed my perspective..."
}
```

**Response:**
```json
{
  "success": true,
  "reviewId": "review_uuid",
  "message": "Review submitted for moderation"
}
```

**Restrictions:**
- One review per product per user
- 1000 char max for text
- Rating 1-5 only

**Rate limit:** 5 per hour per user

---

### GET `/api/bookstore/newsletter`

Bookstore newsletter settings (if applicable).

**Endpoint:** `/api/bookstore/newsletter`
**Response:** Newsletter signup form HTML (for embedded widget)

---

## Portal Routes (Contributor)

### POST `/api/portal/articles`

Create new article.

**Auth:** Requires `author`, `editor`, or `admin` role

**Request:**
```json
{
  "title": "Article Title",
  "slug": "article-title",
  "content": { /* BlockNote JSON */ },
  "excerpt": "Article summary...",
  "category": "category_id",
  "authorId": "user_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "articleId": "article_uuid",
  "status": "draft"
}
```

**Error:**
```json
{ "error": "Unauthorized or invalid input" }
```

---

### PATCH `/api/portal/articles/[id]`

Update existing article.

**Auth:** Article owner or editor+

**Request:** Same as POST + optional fields

**Response:**
```json
{
  "success": true,
  "articleId": "article_uuid",
  "status": "draft" // or published
}
```

---

### POST `/api/portal/upload-image`

Upload image for article.

**Auth:** Requires `author`+ role

**Request:** `multipart/form-data`
```
file: <image_file>  // JPG, PNG, WebP max 10MB
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://cdn.sanity.io/images/...",
  "assetId": "image_uuid"
}
```

**Rate limit:** 50 per hour per user

---

### PATCH `/api/portal/orders/[id]/status`

Update order status (shipping/refunds).

**Auth:** Requires `sales` or `admin` role

**Request:**
```json
{
  "status": "shipped",  // or: processing, delivered, refunded
  "trackingNumber": "1Z999AA...",
  "trackingCarrier": "UPS"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "ord_123",
  "newStatus": "shipped"
}
```

**Side effects:** Customer notification email sent

---

## Admin Routes

### POST `/api/admin/set-role`

Assign role to user.

**Auth:** Requires `admin` role

**Request:**
```json
{
  "targetUserId": "user_xxxxx",
  "role": "author"  // or: editor, admin
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "user_xxxxx",
    "newRole": "author"
  }
}
```

**Valid roles:** `admin`, `editor`, `author`

**Note:** `sales` role must be set manually in Clerk Dashboard

---

## Webhook Routes

### POST `/api/webhooks/supabase-order-update`

Supabase realtime order updates (internal).

**Trigger:** Automatic via Supabase webhook

**Payload:** Supabase change event

**Side effects:** May trigger emails, update cache

---

### POST `/api/webhooks/stripe`

Stripe payment events.

**Trigger:** Automatic from Stripe

**Events handled:**
- `checkout.session.completed` — Create order, send confirmation
- `charge.refunded` — Update order status, notify customer
- `payment_intent.succeeded` — Confirm payment

**Signature validation:**
```typescript
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

**⚠️ Critical:** Don't process events without verifying signature

---

## CMS Routes

### POST `/api/draft`

Enable Draft Mode for previewing unpublished content.

**Auth:** Requires valid Sanity preview URL token

**Request:**
```json
{
  "slug": "article-slug"
}
```

**Response:** Redirects to article with draft mode enabled

**Use case:** Sanity Presentation Tool preview links

---

### POST `/api/disable-draft`

Disable Draft Mode.

**Response:** Redirects to `/`

---

### POST `/api/revalidate`

Revalidate On-Demand (ISR) for cached pages.

**Auth:** Requires `SANITY_REVALIDATE_SECRET`

**Request:**
```json
{
  "secret": "SANITY_REVALIDATE_SECRET",
  "slug": "article-slug"
}
```

**Response:**
```json
{
  "revalidated": true
}
```

**Side effect:** Clears Next.js cache for page, triggers rebuild

**Used by:** Sanity webhook when content changes

---

## Utility Routes

### GET `/api/compute-reading-time`

Calculate article reading time.

**Query param:**
```
?text=article_content
```

**Response:**
```json
{
  "readingTime": "5 min read",
  "wordCount": 1250
}
```

---

### POST `/api/algolia-sync`

Sync all content to Algolia search index.

**Auth:** Requires `ALGOLIA_ADMIN_KEY`

**Request:**
```json
{
  "secret": "ALGOLIA_ADMIN_KEY"
}
```

**Response:**
```json
{
  "success": true,
  "indexed": 342,
  "failed": 2
}
```

**Time:** May take 5-10 minutes for large libraries

**Run manually:** `npm run algolia:index`

---

### POST `/api/secure-contact`

Send secure contact message.

**Request:**
```json
{
  "email": "sender@example.com",
  "name": "John Doe",
  "subject": "Contact Subject",
  "message": "Message content",
  "captchaToken": "turnstile_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent"
}
```

**Delivery:** Sent to configured contact email via Resend

**Rate limit:** 3 per hour per IP

---

### POST `/api/coral-token`

Get SSO token for Coral comments system.

**Auth:** Optional (works for anonymous too)

**Response:**
```json
{
  "token": "jwt_coral_token"
}
```

**Maps Clerk role → Coral role:**
- `admin` → `MODERATOR`
- `editor` → `COMMENTER`
- Others → `COMMENTER`

---

## Form Submission Routes

### POST `/api/job-application`

Submit job application.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "resume": "base64_encoded_pdf",
  "coverLetter": "Text content...",
  "position": "Reporter"
}
```

**Response:**
```json
{
  "success": true,
  "applicationId": "uuid"
}
```

---

### POST `/api/careers-application`

Career/opportunities submission (generic application).

**Request:** Similar to job application

**Response:** Confirmation

---

### POST `/api/whistleblower`

Submit anonymous whistleblower tip.

**Request:**
```json
{
  "subject": "Tip subject",
  "details": "Detailed information...",
  "source": "Email address or 'anonymous'",
  "captchaToken": "turnstile_token"
}
```

**Response:**
```json
{
  "success": true,
  "tipId": "tip_uuid",
  "message": "Tip received securely"
}
```

**Security:**
- Encrypted storage
- Turnstile verification required
- No IP logging for true anonymity

---

## Health & Monitoring

### GET `/api/monitoring`

Health check endpoint (for uptime monitoring).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-17T12:00:00Z",
  "services": {
    "database": "connected",
    "sanity": "connected",
    "stripe": "connected"
  }
}
```

**Used by:** Uptime monitoring services, Vercel health checks

---

## Error Responses

All errors return standard format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "requestId": "req_uuid"
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad request | Invalid input validation |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Don't have permission |
| 404 | Not found | Resource doesn't exist |
| 409 | Conflict | Item already exists |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Server error | Unexpected exception |

---

## Rate Limiting

Rate limits tracked via Upstash Redis:

```typescript
// Example check
const limit = await rateLimit.limit(`user_${userId}`);
if (!limit.success) {
  return Response.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

**Limits by endpoint:** See individual route documentation

**Reset:** Automatic hourly or as specified

---

## Pagination

Routes that return lists use pagination:

**Query params:**
```
?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 342,
    "pages": 18
  }
}
```

---

## Webhooks

External services call these endpoints:

| Source | Endpoint | Events |
|--------|----------|--------|
| Stripe | `/api/webhooks/stripe` | payment, refund |
| Supabase | `/api/webhooks/supabase-order-update` | record changes |
| Sanity | `/api/revalidate` | content published |

**Security:** All webhooks verify signatures before processing

---

## Testing Endpoints

### Local Testing

```bash
# Test newsletter subscribe
curl -X POST http://localhost:3000/api/newsletter-subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test view tracking
curl -X POST http://localhost:3000/api/view \
  -H "Content-Type: application/json" \
  -d '{"articleId":"test-article"}'

# Test health check
curl http://localhost:3000/api/monitoring
```

### Stripe Testing

Use test card: `4242 4242 4242 4242`

### Turnstile Testing

Use site key from `.env.local` and valid tokens from Cloudflare dashboard

---

## Client Usage Examples

### JavaScript/Fetch

```javascript
// Subscribe to newsletter
const res = await fetch('/api/newsletter-subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
const data = await res.json();
```

### TypeScript/Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://www.untelevised.media',
  headers: { 'Content-Type': 'application/json' }
});

const createCheckout = async (items: CartItem[]) => {
  const { data } = await api.post('/api/bookstore/checkout', { items });
  return data.sessionId;
};
```

---

## Documentation Standards

When adding new routes:

1. Add to this index with link
2. Document auth requirements
3. Include request/response examples
4. List rate limits
5. Add error cases
6. Link to feature docs

---

## Questions?

See [Technical Documentation](../) or [API Design](../architecture/API_DESIGN.md) for patterns and conventions.
