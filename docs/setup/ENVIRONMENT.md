# Environment Variables

**Last Updated:** June 2026

Complete reference of all environment variables used in UnTelevised Media.

---

## Quick Reference

| Category | Count | Status |
|----------|-------|--------|
| App Config | 3 | ✅ Required |
| Clerk Auth | 3 | ✅ Required |
| Sanity CMS | 5 | ✅ Required |
| Supabase Database | 3 | ✅ Required |
| Algolia Search | 3 | ✅ Required |
| Stripe Payments | 3 | ✅ Required |
| Resend Email | 1 | ✅ Required |
| Upstash Redis | 2 | ✅ Required |
| Sentry Monitoring | 2 | ⚠️ Optional (recommended) |
| Cloudflare Turnstile | 2 | ⚠️ Optional (recommended) |

---

## App Configuration

### `NEXT_PUBLIC_APP_URL`
- **Type:** URL
- **Public:** Yes (visible in browser)
- **Description:** Base URL of the application
- **Example:** `https://www.untelevised.media` (prod), `http://localhost:3000` (dev)
- **Used in:** Email links, social sharing, redirects

---

## Clerk Authentication

Clerk provides authentication and user management.

### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Type:** String (JWT)
- **Public:** Yes
- **Description:** Public key for Clerk authentication
- **Get it:** Clerk Dashboard → API Keys → Copy Publishable Key
- **Used in:** Client-side auth, sign-in/up components

### `CLERK_SECRET_KEY`
- **Type:** String (JWT)
- **Public:** No (server-only)
- **Description:** Secret key for Clerk backend operations
- **Get it:** Clerk Dashboard → API Keys → Copy Secret Key
- **Used in:** Server actions, API routes, user role management

### `CLERK_WEBHOOK_SECRET`
- **Type:** String
- **Public:** No
- **Description:** Secret for verifying Clerk webhook signatures
- **Get it:** Clerk Dashboard → Webhooks → Create endpoint → Copy signing secret
- **Used in:** Webhook verification in API routes

---

## Sanity CMS

Sanity is the headless CMS for content.

### `NEXT_PUBLIC_SANITY_PROJECT_ID`
- **Type:** String (alphanumeric)
- **Public:** Yes
- **Description:** Your Sanity project ID
- **Get it:** Sanity → Project settings → Copy Project ID
- **Format:** Usually 10-20 alphanumeric characters
- **Used in:** Client queries, studio configuration

### `NEXT_PUBLIC_SANITY_DATASET`
- **Type:** String
- **Public:** Yes
- **Description:** Dataset name within your Sanity project
- **Get it:** Sanity → Project settings → Datasets (usually `production`)
- **Common values:** `production`, `staging`
- **Used in:** All GROQ queries, studio operations

### `NEXT_PUBLIC_SANITY_API_VERSION`
- **Type:** Date string (optional)
- **Public:** Yes
- **Description:** Sanity API version
- **Default:** `2025-06-04` (see src/lib/sanity/env.ts)
- **Format:** `YYYY-MM-DD`
- **Used in:** All API calls to Sanity

### `SANITY_API_TOKEN`
- **Type:** String (JWT)
- **Public:** No (server-only)
- **Description:** API token for server-side Sanity operations
- **Get it:** Sanity → API → Tokens → Create new token → Editor (read+write)
- **Permissions needed:** Read + Write for content operations
- **Used in:** Server components, API routes, live preview

### `SANITY_REVALIDATE_SECRET`
- **Type:** String (custom secret)
- **Public:** No
- **Description:** Webhook secret for on-demand revalidation
- **Generate:** Any random string you create
- **Used in:** `/api/revalidate` endpoint for ISR invalidation

---

## Supabase Database

PostgreSQL database for structured data (orders, users, view counts).

### `NEXT_PUBLIC_SUPABASE_URL`
- **Type:** URL
- **Public:** Yes
- **Description:** Supabase project URL
- **Get it:** Supabase → Project settings → API → Project URL
- **Format:** `https://[project-id].supabase.co`
- **Used in:** Client-side database operations

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type:** String (JWT)
- **Public:** Yes
- **Description:** Anon key for client-side operations
- **Get it:** Supabase → Project settings → API → Anon public key
- **Permissions:** Limited, configured via Supabase RLS policies
- **Used in:** Client components, bookstore cart, wishlist

### `SUPABASE_SERVICE_ROLE_KEY`
- **Type:** String (JWT)
- **Public:** No (server-only)
- **Description:** Service role key for server-side operations
- **Get it:** Supabase → Project settings → API → Service role secret key
- **Permissions:** Unrestricted, can bypass RLS
- **Used in:** API routes, server actions, admin operations
- **⚠️ Warning:** Never expose this in client code

---

## Algolia Search

Full-text search for articles and content discovery.

### `NEXT_PUBLIC_ALGOLIA_APP_ID`
- **Type:** String
- **Public:** Yes
- **Description:** Algolia application ID
- **Get it:** Algolia Dashboard → Settings → Your apps
- **Used in:** Client-side search queries

### `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`
- **Type:** String
- **Public:** Yes
- **Description:** Search-only API key (limited permissions)
- **Get it:** Algolia Dashboard → API Keys → Search-Only API Key
- **Permissions:** Can only search, cannot write
- **Used in:** Client-side search requests

### `ALGOLIA_ADMIN_KEY`
- **Type:** String
- **Public:** No (server-only)
- **Description:** Admin API key for indexing
- **Get it:** Algolia Dashboard → API Keys → Admin API Key
- **Permissions:** Full access, can read and write indices
- **Used in:** `/api/algolia-sync` endpoint for indexing content

---

## Stripe Payments

Payment processing for bookstore and membership.

### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Type:** String (starts with `pk_live_` or `pk_test_`)
- **Public:** Yes
- **Description:** Public key for Stripe payment elements
- **Get it:** Stripe Dashboard → Settings → API Keys → Publishable key
- **Used in:** Payment forms, checkout components

### `STRIPE_SECRET_KEY`
- **Type:** String (starts with `sk_live_` or `sk_test_`)
- **Public:** No (server-only)
- **Description:** Secret key for server-side Stripe operations
- **Get it:** Stripe Dashboard → Settings → API Keys → Secret key
- **Used in:** Creating charges, managing subscriptions, webhooks

### `STRIPE_WEBHOOK_SECRET`
- **Type:** String (starts with `whsec_`)
- **Public:** No
- **Description:** Webhook signing secret
- **Get it:** Stripe Dashboard → Webhooks → Create endpoint → Signing secret
- **Used in:** Validating webhook signatures in `/api/webhooks`

---

## Resend Email

Email delivery service.

### `RESEND_API_KEY`
- **Type:** String (starts with `re_`)
- **Public:** No (server-only)
- **Description:** API key for Resend email service
- **Get it:** Resend Dashboard → API Keys → Create API Key
- **Used in:** Sending transactional emails (orders, newsletters)

---

## Upstash Redis

Rate limiting and temporary data storage.

### `UPSTASH_REDIS_REST_URL`
- **Type:** URL
- **Public:** No (though technically could be)
- **Description:** REST endpoint for Upstash Redis
- **Get it:** Upstash Console → Database → REST API → URL
- **Format:** `https://[name]-[id].upstash.io`
- **Used in:** Rate limiting in API routes

### `UPSTASH_REDIS_REST_TOKEN`
- **Type:** String
- **Public:** No (server-only)
- **Description:** Authorization token for Redis REST API
- **Get it:** Upstash Console → Database → REST API → Token
- **Used in:** Authenticating Redis requests

---

## Sentry Error Monitoring

Error tracking and performance monitoring (optional but recommended).

### `NEXT_PUBLIC_SENTRY_DSN`
- **Type:** URL
- **Public:** Yes (cannot contain secrets)
- **Description:** Data Source Name for Sentry
- **Get it:** Sentry → Projects → [Project] → Client Keys (DSN)
- **Format:** `https://[key]@[domain].ingest.sentry.io/[project-id]`
- **Used in:** Sending error reports from client and server

### `SENTRY_AUTH_TOKEN`
- **Type:** String
- **Public:** No
- **Description:** Authentication token for Sentry API
- **Get it:** Sentry → Settings → Auth Tokens → Create token
- **Permissions needed:** `project:releases`, `project:read`
- **Used in:** Source map uploads during build

---

## Cloudflare Turnstile

Bot protection for forms.

### `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- **Type:** String (alphanumeric)
- **Public:** Yes
- **Description:** Turnstile site key for widget
- **Get it:** Cloudflare Dashboard → Turnstile → Add site → Copy Site Key
- **Used in:** Rendering Turnstile widget in forms

### `TURNSTILE_SECRET_KEY`
- **Type:** String (alphanumeric)
- **Public:** No (server-only)
- **Description:** Secret key for validating Turnstile tokens
- **Get it:** Cloudflare Dashboard → Turnstile → Copy Secret Key
- **Used in:** Verifying Turnstile tokens in API routes

---

## Environment File Template

Create `.env.local` with these values:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-06-04
SANITY_API_TOKEN=sk...
SANITY_REVALIDATE_SECRET=any_random_string_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Algolia
NEXT_PUBLIC_ALGOLIA_APP_ID=xxx
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=xxx
ALGOLIA_ADMIN_KEY=xxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# Upstash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxx

# Turnstile (optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx
TURNSTILE_SECRET_KEY=xxx
```

---

## Loading & Precedence

Next.js loads environment variables in this order (later files override earlier ones):

1. `.env` (source control committed)
2. `.env.local` (git-ignored, local overrides)
3. `.env.production`, `.env.development` (environment-specific)
4. System environment variables

**For development:** Use `.env.local`
**For production on Vercel:** Set in Vercel Dashboard → Project Settings → Environment Variables

---

## Security Best Practices

✅ **Do:**
- Store secret keys in `.env.local` (git-ignored)
- Keep `*_SECRET_KEY` and service keys private
- Use different keys for dev/staging/production
- Rotate keys periodically
- Set environment variables in Vercel Dashboard for production

❌ **Don't:**
- Commit `.env.local` or any `.env` file with secrets
- Expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- Expose `STRIPE_SECRET_KEY` in client code
- Use the same key across multiple environments
- Share keys in chat or email
- Use test keys in production

---

## Validating Your Setup

Run this to check which env vars are configured:

```bash
npm run type-check
```

This will error if any required env vars are missing.

Check which public vars are loaded:

```bash
node -e "console.log(JSON.stringify(process.env, null, 2))" | grep NEXT_PUBLIC
```

---

## Migrating Between Environments

### From Local to Staging

1. Create new Sanity project instance
2. Create new Supabase project instance
3. Update all `NEXT_PUBLIC_SANITY_*` variables
4. Update all `NEXT_PUBLIC_SUPABASE_*` variables
5. Create new Clerk application for staging
6. Update `NEXT_PUBLIC_CLERK_*` variables
7. Deploy to staging environment

### From Staging to Production

Same process as above, but ensure:
- Use production Stripe keys (`pk_live_`, not `pk_test_`)
- Use production Sanity dataset
- Enable all monitoring and logging
- Test all payment flows thoroughly first

---

## Troubleshooting

### "Missing environment variable" error at build time

1. Check `.env.local` exists
2. Check the variable name spelling
3. Run `npm run type-check` to see which vars are missing
4. For Vercel: Check Vercel Dashboard → Environment Variables

### Public vars not showing in browser

- Must start with `NEXT_PUBLIC_`
- Rebuild: `npm run dev` (not automatic)
- Check browser DevTools → Application → Variables

### API calls failing with 401/403

- Check secret keys are correct
- Check server-side code has access to secret vars
- Verify API token has correct permissions in source service

### "Cannot find module" or build failures

```bash
# Clear everything and reinstall
rm -rf node_modules .next
npm install
npm run build
```

---

## Next Steps

- Read [Development Setup](./DEVELOPMENT.md) to start coding
- Read [Deployment Guide](../operations/DEPLOYMENT.md) for production setup
- Read [Architecture](../architecture/ARCHITECTURE.md) for system design
