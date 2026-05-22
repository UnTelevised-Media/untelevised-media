# Changelog — UnTelevised Media / Hurriya Publications

All notable changes to this project are documented here.

---

## [2026-05-21] — Portal & Content Tooling (feat/bookstore-upgrades-may2026)

### Added

- **Vimeo embed support** — `src/models/schema/vimeo.ts`: `vimeoEmbed` Sanity object type with required `videoUrl` field and Studio preview; registered in `blockContent` array and `schema/index.ts`; `RichTextComponents.tsx` renderer added; full BlockNote ↔ Portable Text round-trip in `blocknote-serializer.ts`

- **Content migration scripts** — one-time Sanity seed/migration scripts for article content:
  - `scripts/create-anarchist-article.ts` — seeds "11 Things Every Anarchist Should Be Doing"
  - `scripts/create-israel-palestine-article.ts` — seeds "ISRAEL AND PALESTINE – a Personal Reflection"
  - `scripts/create-waterboarding-article.ts` — seeds "So, I was waterboarded…"
  - `scripts/migrate-ar-articles.ts` — bulk migration helper for AR article archive
  - `scripts/create-insurgency-military-article.ts` — seeds "Full Spectrum Operations: How the US Military Would Respond to a Domestic Insurgency"
  - `scripts/create-ira-article.ts` — seeds "Profiles in Insurgency: The Irish Republican Army"
  - `scripts/find-protest-image.ts` — Sanity image search utility
  - `scripts/patch-anarchist-image.ts` — patches cover image on the anarchist article
  - `scripts/patch-waterboarding-image.ts` — patches cover image on the waterboarding article
  - `scripts/repair-brief-keys.ts` — repairs missing `_key` fields on brief `storyPasses` arrays

- **Portal — image upload API** — `src/app/api/portal/upload-image/route.ts`: authenticated POST endpoint that accepts FormData and pipes the image to the Sanity asset pipeline; returns the asset `_id` for use in editor forms

- **Portal — brief key repair API** — `src/app/api/portal/repair-brief-keys/route.ts`: one-shot admin endpoint that patches malformed `storyPasses` arrays missing `_key` values; prevents Sanity array mutation errors

### Fixed

- **TypeScript `_type` field on script document objects** — `Record<string, unknown>` type widened to `Record<string, unknown> & { _type: string }` in `create-anarchist-article.ts`, `create-israel-palestine-article.ts`, `create-waterboarding-article.ts`, and `migrate-ar-articles.ts`; eliminates TS compiler error when `_type` is required by the Sanity client's `createOrReplace` call

- **`migrate-ar-articles.ts` author fetch** — `client.fetch<Array<...>>(...)[0]` pattern replaced with `client.fetch<{ _id: string } | null>(query[0])` — avoids redundant array allocation and correctly types the single-document GROQ `[0]` projection

### Changed

- **`PortalNav`** — major navigation overhaul: grouped link sections with collapsible mobile drawer, role-aware link visibility (admin / editor / author / sales), active-link highlighting, Bookstore section links (Library, Earnings, Sales)
- **`BriefPanel`** — improved pass/unpass UX with optimistic UI; editor Assign/Release/Reassign controls hardened; sort order: breaking unclaimed → unclaimed → claimed → published
- **`ArticleEditorForm`** — autosave interval tuning; `beforeunload` guard reliability improvements
- **`portal/page.tsx`** — dashboard widgets reordered; `BookstoreOrdersWidget` and `PendingPayoutsWidget` placement refined; Supabase data fetched with graceful degradation on missing env vars
- **`brief-actions.ts`** — `fetchBriefById` parallel data fetching hardened; `myPitchMap` build logic corrected for multi-brief scenarios
- **Bookstore layout** — minor structural/metadata adjustment to `src/app/(user)/bookstore/layout.tsx`

---

## [2026-05-05] — Bookstore Feature Upgrades (feat/bookstore-upgrades-may2026)

### Added
- **Feature 6** — Email transactional disclosure footer added to all Hurriya Publications emails (`emailLayout()`)
- **Feature 2** — Social sharing (`SocialShare`) added to book detail pages
- **Feature 3** — Bookstore newsletter signup: `bookstoreSubscriber` Sanity schema, `POST /api/bookstore/newsletter` endpoint, `BookstoreNewsletter` component, placements on bookstore home and about pages, portal subscriber view
- **Feature 4** — Book wishlist: `userWishlist` Sanity schema, localStorage + Sanity sync (mirrors bookmark system), `WishlistButton` component (star icon), wishlist page, footer nav link
- **Feature 5** — Book reviews & reader testimonials: `bookReview` Sanity schema, `GET/POST /api/bookstore/reviews` endpoint, `BookReviews` display component, `ReviewForm` submission component, placement on book detail pages
- **Feature 1** — Gift purchasing: `GiftToggle` component, gift metadata passed through checkout to Stripe, `sendGiftEmail()` email template, webhook routing for gift vs. buyer emails
- Returns & Refunds policy page (`/bookstore/returns`) — covers digital, physical, bundles, tips, dispute process
- `noindex` metadata layouts for `/bookstore/cart` and `/bookstore/downloads` (transactional pages)
- OpenGraph + Twitter card metadata on bookstore section layout
- Author profile page now displays the author's Hurriya Publications books in a buy-ready grid

### Fixed
- Page titles for Order Confirmed and My Orders now use "Hurriya Publications" branding instead of "UnTelevised Media"

---

## [Unreleased] — Prior Bookstore Work (feat/issue-46-bookstore)

### Added — Email Delivery, Direct Downloads & Digital Asset Fixes (Issue #46, 2026-05-04)

- **Transactional email delivery** (`src/lib/bookstore/email.ts`): full Nodemailer + Google SMTP stack. Order confirmation, digital download ready, guest one-time download, shipment, and refund emails all live. SMTP env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`) added to Vercel production.
- **BOM / CRLF env var corruption fix** (`cleanEnv()` helper): PowerShell `echo` pipes prepend a UTF-16 BOM (`﻿`) and append `\r\n` to values stored by the Vercel CLI. `cleanEnv()` strips both before use — prevents `getaddrinfo EBUSY` DNS failure on SMTP host.
- **From-address fix**: `ORDERS_SMTP_FROM` (a non-verified alias) caused Gmail 550 rejection. `from` now always resolves to `Hurriya Publications <SMTP_USER>` — the authenticated sender.
- **Stripe webhook signature fix**: `STRIPE_WEBHOOK_SECRET` corrected in Supabase secrets; `constructEventAsync` + `SubtleCryptoProvider` used for Deno-compatible HMAC — prevents 400 signature errors.
- **Direct download links in emails**: the Stripe webhook edge function now calls `db.storage.from('digital-books').createSignedUrl(storagePath, 30 * 24 * 3600, { download: filename })` at purchase time and embeds the URL directly in the email. One click saves the file — no login required, no intermediate API route.
  - Auth users: "⬇ Download Now" button in the digital download email (30-day signed URL).
  - Guest users: "Download Your Book →" button in the guest download email (30-day signed URL).
- **Force-save on all download surfaces**: `createSignedUrl` called with `{ download: filename }` option on both `/api/bookstore/download/route.ts` (vault) and `/api/bookstore/download/guest/route.ts` — browser saves the file instead of opening it in a new tab.
- **Vault page force-save**: `window.location.href = data.url` replaces `window.open` in `downloads/page.tsx` to avoid a blank tab that customers might close before the file saves.
- **Order confirmation email**: shows "Digital Download" notice pointing customers to the separate download email instead of a vault link guests can't access. Vault CTA remains for logged-in customers.
- **Download email vault footer**: vault link restored in auth-user download email footer for re-downloads (up to 5, 1-year expiry).
- **`DigitalDownloadItem` interface** (`src/lib/bookstore/email.ts`): `downloadUrl?: string` added — optional direct download URL embedded per item.
- **Preserved filename on upload** (`src/lib/portal/book-actions.ts`): `uploadDigitalAsset` now stores `books/{bookId}/{formatKey}/{file.name}` instead of `books/{bookId}/{formatKey}/asset.{ext}` — original filename preserved in Supabase Storage and surfaced to customers on download.

### Fixed — Email & Download Edge Cases (Issue #46, 2026-05-04)

- **Missing file → honest fallback**: when `createSignedUrl` returns 400 (file not in Supabase Storage), the download email now shows a vault link + "contact us with your order number" note instead of the misleading "your file is being prepared — follow-up email coming" copy (no such retry mechanism exists).
- **Guest download 30-day expiry**: guest download token TTL corrected from 14 → 30 days to match auth-user email tokens.
- **`EmailPayload` type** in stripe-webhook edge function updated to include `downloadUrl?` on `digital-download` items — fixes TypeScript type mismatch after interface update.

---

### Added — Stripe Earnings & Author Payout System (Issue #46)

- **`author_earnings` table** (`supabase/migrations/20260503000002_stripe_earnings.sql`): authoritative post-Stripe record per order item — `gross_cents`, `stripe_fee_cents`, `net_after_stripe_cents`, `author_cents`, `platform_cents`, `publisher_cents`, `is_tip`, `payout_period_start`, `payout_period_end`; RLS + service_role grants included.
- **`stripe_fee_cents` column** added to `orders` and `payouts` tables.
- **Real Stripe Balance Transaction API**: webhook fetches `paymentIntents.retrieve` with `expand: ['latest_charge.balance_transaction']` — captures the actual Stripe fee for all card types (domestic 2.9%+30¢, international higher). No formula guessing.
- **Proportional Stripe fee distribution** across order items with exact-remainder assignment to the largest item, ensuring per-item fees always sum exactly to the order-level total.
- **`getPayoutPeriod()`** helper: bi-monthly periods (1st–15th payout on 16th; 16th–last day payout on 1st of next month). Returns `{start, end}` ISO date strings stored on each `author_earnings` row.
- **`insertAuthorEarning()`** in stripe-webhook edge function: calculates `net = gross - itemStripeFee`, applies revenue split percentages, writes to `author_earnings` after each `insertAuthorSale`. Tips always credited at 100% author.
- **Test promo edge case**: `isTestPromo` bypasses `fetchStripeFee` (returns 0) — correct because $0 test-promo transactions incur no Stripe fee; original prices still recorded.
- **`AuthorEarning` interface** added to `src/lib/bookstore/types.ts`; `stripe_fee_cents` field added to `Order` and `Payout` interfaces.
- **Stripe webhook JWT bypass fix**: edge function redeployed with `--no-verify-jwt` so Stripe webhook requests (no Supabase JWT) no longer return `UNAUTHORIZED_NO_AUTH_HEADER`.

### Added — Author Portal: Earnings Dashboard (Issue #46)

- **`/portal/earnings`** (new page `src/app/(portal)/portal/earnings/page.tsx`): dedicated financial dashboard — Sales Summary stat cards (Total Units Sold, This Month, Accruing This Period, Next Payout), all-time Gross / Stripe Fees / Your Earnings row, Sales by Title bar chart with physical/digital split, Tips Received per-book breakdown with gross/fees/net, full Payout History table.
- **`/portal/library`** (new page `src/app/(portal)/portal/library/page.tsx`): focused book management — product table with units sold and net earnings per book, inventory low-stock alerts, Add Book / Edit Book modals. All financial data moved to `/portal/earnings`.
- **`/portal/sales`** (new page `src/app/(portal)/portal/sales/page.tsx`): order management (renamed from `/portal/orders`) — all order stats, earnings breakdown panel for admin/sales, per-order author cut in OrdersTable expanded view, order status management.
- **Old-route redirects**: `/portal/books` → `/portal/library`; `/portal/orders` → `/portal/sales` (both server-side `redirect()`).

### Added — Payout Date UI (Issue #46)

- **`getNextPayoutDate()`** helper in both `portal/library` and `portal/earnings` pages: computes the next scheduled payout (16th of current month if day ≤ 15, else 1st of next month). Advances automatically — no manual maintenance.
- **Next Payout card** on `/portal/earnings`: shows accruing amount when no formal pending payout record exists yet, with "Scheduled May 16, 2026" sub-label in green.
- **`PendingPayoutsWidget`** updated: when no pending payout rows exist but the author has accruing earnings, renders a projected "Upcoming · Scheduled" entry with the next payout date and period range instead of "No pending payouts". `accruing`, `nextPayoutDate`, `periodStart`, `periodEnd` props added.
- **Main portal dashboard My Books strip**: shows accruing period amount in green alongside "Accruing · Payout [date]" — queries `author_earnings` for the current period via a dedicated Supabase call.

### Fixed — Earnings Math (Issue #46)

- **Tips `Your Tips` display**: was reading `author_cents` from DB (stale values from early orders). All calculations now derive `net = gross_cents - stripe_fee_cents` dynamically — always mathematically correct regardless of DB data quality. A `netCents()` helper function centralises this.
- **"Your Earnings" bottom row** now includes both books and tips (was books only).
- **Monthly earnings** (`This Month`, `Last Month`, `Accruing This Period`) now covers all earnings (books + tips), net of Stripe.

### Changed — Navigation & Routing (Issue #46)

- **`PortalNav`**: bookstore author links updated to `Library` (`/portal/library`) + `Earnings` (`/portal/earnings`); shared link updated to `Sales` (`/portal/sales`); sales-role brand link updated to `/portal/sales`.
- **`proxy.ts`**: sales-role access guard redirects to `/portal/sales`; matcher updated to `isPortalSalesRoute` (includes legacy `/portal/orders` to preserve redirect chain during transition).
- **`BookstoreOrdersWidget`**: "View All Orders" + order number links → `/portal/sales`.
- **`TipsWidget`**: order number links → `/portal/sales`.
- **`PendingPayoutsWidget`**: "Payout History" footer link → `/portal/earnings`.
- **Main portal dashboard**: "My Books" strip link → `/portal/library`.
- **`CHANGELOG.md`**: created at project root; back-filled with all work from the project's inception.

---

### Added — Bookstore Foundation (Issue #46, earlier work)

- **Bookstore — Supabase Infrastructure (Issue #46, Steps 1.1–1.2)**
  - `supabase/migrations/20260428000001_bookstore_schema.sql` — DDL for all 6 bookstore tables (customers, addresses, orders, order_items, digital_downloads, payouts), 8 indexes, `set_updated_at()` trigger, RLS enabled on all tables with customer-scoped policies; pushed to project qdocpanuicwyhlcthudc
  - `supabase/migrations/20260429000001_storage_rls.sql` — service-role-only RLS on `storage.objects` for `digital-books` bucket
  - `digital-books` private Supabase Storage bucket created; no public access; downloads served via signed URLs only

- **Bookstore — Foundation (Issue #46, Phase 1)**
  - Supabase shop project env vars documented in `.env.local` (steps 1.1–1.2)
  - Sanity schemas: `book`, `bookGenre`, embedded `bookFormat` object type; `author` schema updated with `isLiteraryAuthor`, `payoutEmail` fields (step 1.3)
  - `src/lib/bookstore/supabase.ts` — typed Supabase clients (`shopClient` anon, `shopServiceClient` service-role) (step 1.4)
  - `src/lib/bookstore/types.ts` — TypeScript interfaces: `Customer`, `Address`, `Order`, `OrderItem`, `DigitalDownload`, `Payout`, `SanityBook`, `SanityBookFormat`, `SanityBookGenre`, `CartItem`, `CheckoutPayload` (step 1.5)
  - `src/lib/sanity/lib/queries.ts` — `queryAllBookGenres`, `queryFeaturedBooks`, `queryAllBooks`, `queryBookBySlug`, `queryBooksByAuthorClerkId` GROQ queries (step 1.6)
  - `sales` portal role added to `src/lib/auth/roles-utils.ts` and `src/lib/auth/roles.ts`; `src/proxy.ts` enforces sales → `/portal/orders` only; `src/lib/auth/roles.ts` exports `requireAnyPortalRole`, `isSales`, `isSalesOnlyUser` (step 1.7)

- **Bookstore — Stripe & Webhook (Issue #46, Phase 2)**
  - `src/app/api/bookstore/checkout/route.ts` — POST creates Stripe Checkout Session from cart; collects shipping for physical items; metadata encodes items for webhook (step 2.1)
  - `src/app/api/bookstore/webhook/route.ts` — verifies Stripe signature; handles `checkout.session.completed` (upsert customer, create order + order_items, digital fulfillment), `payment_intent.succeeded/failed`, `charge.refunded` (revoke downloads), `charge.dispute.created` (steps 2.2–2.5)
  - `src/lib/bookstore/email.ts` — Resend email helpers: order confirmation, digital download delivery, shipment confirmation, refund confirmation (step 5 baseline)

- **Bookstore — Public Storefront (Issue #46, Phase 3)**
  - `src/app/(user)/bookstore/layout.tsx` — bookstore layout wrapper
  - `src/app/(user)/bookstore/page.tsx` — featured hero + all-books grid + genre filter; full metadata
  - `src/app/(user)/bookstore/book/[slug]/page.tsx` — full detail page; format selector; inventory badges; CTA buttons; author bio; Book + Offer JSON-LD; `generateMetadata`; `generateStaticParams`
  - `src/app/(user)/bookstore/cart/page.tsx` — full cart page
  - `src/app/(user)/bookstore/order-success/page.tsx` — post-checkout confirmation
  - `src/app/(user)/bookstore/orders/page.tsx` — authenticated order history
  - `src/app/(user)/bookstore/downloads/page.tsx` — digital download vault
  - `src/app/api/bookstore/download/route.ts` — validates ownership, generates Supabase signed URL, increments counter
  - `src/app/api/bookstore/my-downloads/route.ts` — returns customer's digital downloads
  - `src/lib/bookstore/cart.ts` — Zustand cart store with localStorage persistence
  - `src/components/bookstore/AddToCartButton.tsx` — client add-to-cart CTA
  - `src/components/bookstore/GenreFilter.tsx` — client-side genre filter tabs
  - `src/components/bookstore/MiniCart.tsx` — header mini-cart with item count badge
  - Bookstore nav link added to main site navigation

- **Bookstore — Internal Dashboard (Issue #46, Phase 4)**
  - `src/app/(portal)/portal/books/page.tsx` — My Books dashboard (author-gated): product list table with Studio links, sales summary cards (units/revenue/month-over-month), inventory alerts section, payout history table; gracefully degrades when Supabase is not connected
  - `src/app/(portal)/portal/orders/page.tsx` — Order Management (admin/sales/author-scoped): order stats, paginated + searchable table, status badges; authors see only orders containing their books
  - `src/components/portal/OrdersTable.tsx` — client component: searchable + filterable order table; expandable per-row detail panel (payment breakdown, item list with unit prices, Stripe payment intent ID, timestamps); "Mark as shipped" with inline tracking number input; "Mark as [next status]" workflow; admin refund action with confirmation; pagination
  - Per-book CSS bar chart added to My Books dashboard showing relative units sold and physical/digital split per title
  - Supabase env vars added to Vercel project settings (production + preview) via CLI
  - `src/app/api/portal/orders/[id]/status/route.ts` — PATCH: Zod-validated; validates status transition graph; sales cannot refund; fires shipment/refund emails on status change; revokes digital downloads on refund
  - `src/components/portal/PortalNav.tsx` — My Books + Orders nav links already wired; `sales` role shows Sales Portal label and limits to orders link

- **Bookstore — Author Book Management (Issue #46, Phase 5)**
  - `src/components/portal/AddBookModal.tsx` — slide-over book creation widget: title, description, multi-select genres with inline "New Genre" sub-form (title + slug + Slugify button), cover photo upload with preview, status radio (draft/published), per-format pricing (physical / digital / bundle, up to 3), digital file upload (PDF/EPUB/MOBI/ZIP) per digital/bundle format; genre dropdown with clickable pills; Fiction/Non-Fiction type toggle (either-or, deselectable)
  - `src/components/portal/EditBookModal.tsx` — slide-over book editor: all fields pre-populated from existing Sanity document via `blocksToText()` PortableText helper; cover photo replacement; digital file replacement per format slot; all 4 status values (draft/published/out-of-stock/discontinued); genre multi-select dropdown with pills; Fiction/Non-Fiction type toggle; inline New Genre sub-form (no modal redirect); price editing by `_key`
  - `src/lib/portal/book-actions.ts` — server actions: `createBook` (Sanity write + pre-generate format `_key`s), `updateBook` (patch/unset diff), `uploadBookCover` (FormData → Supabase `book-covers` public bucket → Sanity patch), `uploadDigitalAsset` (FormData → Supabase `digital-books` private bucket → Sanity format patch), `fetchBookGenres`, `createBookGenre`; genre references include `_key` to satisfy Sanity array requirements; `fictionType` field supported in create and update
  - `supabase/migrations/20260429000002_book_covers_bucket.sql` — `book-covers` public bucket: 5 MB limit, image MIME types, service-role write policy
  - `supabase/migrations/20260429000003_digital_books_bucket.sql` — `digital-books` private bucket: 500 MB limit, no MIME restriction, service-role write policy
  - `supabase/migrations/20260430000001_grant_role_privileges.sql` — grants `SELECT/INSERT/UPDATE/DELETE` on all bookstore tables to `service_role`, `anon`, `authenticated`; fixes `permission denied for table` errors that blocked portal order management and all Supabase queries despite correct env vars
  - `next.config.ts` — `serverActions.bodySizeLimit: '50mb'` to support large cover and digital file uploads (default 1 MB silently dropped payloads)
  - `src/app/(portal)/portal/books/page.tsx` — `EditBookModal` integrated inline; all Studio links removed from portal UI

- **Portal — Studio Links Removed**
  - Removed all direct Sanity Studio links from the author portal and component UI; portal is now self-contained
  - `src/app/(portal)/portal/page.tsx` — removed "Open Studio ↗" button (editor+ only)
  - `src/app/(portal)/portal/books/page.tsx` — removed "Manage in Studio →" header button and "Studio ↗" per-row action link; updated empty-state text
  - `src/components/portal/AddBookModal.tsx` — updated post-create success state to reference the Edit button instead of Studio; removed "Stripe Price IDs can be added in Studio" note
  - `src/components/portal/EditBookModal.tsx` — removed "To add or remove formats, use Studio" note
  - `src/components/portal/SecureContactTable.tsx` — removed "Manage in Studio ↗" action link
  - `src/components/portal/WhistleblowerTable.tsx` — removed "Manage in Studio ↗" action link

- **Portal Dashboard — Bookstore Widgets (Issue #46, Phase 4 cont.)**
  - `src/components/portal/BookstoreOrdersWidget.tsx` — 2-panel switchable widget: Digital Sales tab (fulfilled digital orders) and Pending Shipments tab (physical orders awaiting dispatch); links to full Orders page
  - `src/components/portal/PendingPayoutsWidget.tsx` — server-renderable payout display widget: totals, per-payout rows with period/gross/net; admin sees all authors' payouts
  - `src/app/(portal)/portal/page.tsx` — portal dashboard wired with `BookstoreOrdersWidget` + `PendingPayoutsWidget`; Supabase data fetched server-side with graceful degradation

- **Bookstore — Buy Now & Add to Cart on Listing Cards (Issue #46)**
  - `src/components/bookstore/BookCardActions.tsx` — client component rendered below each book card on the storefront grid; shows "+ Cart" and "Buy Now" buttons for the lowest-price format; compact amber tip row below (checkbox + inline amount input) when the book's author has a `tipStripeProductId`; tip included in Buy Now payload when checked and amount > 0; resolves inaccessible buy button on listing cards
  - `src/components/bookstore/BuyNowButton.tsx` — standalone "Buy Now" client button used on the book detail page format rows; direct Stripe checkout redirect without cart
  - `src/app/(user)/bookstore/page.tsx` — listing cards restructured from single `<Link>` wrapper to `<div>` with link on image/title and `BookCardActions` as a sibling; fixes buttons-inside-anchor nesting violation
  - `src/app/(user)/bookstore/book/[slug]/page.tsx` — Add to Cart button no longer gated behind `format.stripePriceId &&` guard; compare-at strikethrough price shown on detail hero as well as listing card

- **Bookstore — Name-Your-Price Tip System (Issue #46, §2.2)**
  - `src/models/schema/author.ts` — `tipStripeProductId` (Stripe Product ID `prod_xxx`) and `tipAmount` (recommended default, USD) fields; tips are name-your-own-price so a Product ID is stored rather than a Price ID
  - `src/lib/bookstore/types.ts` — `SanityBook.author.tipStripeProductId` (renamed from `tipStripePriceId`); `CartItem.tipIncluded?: boolean` for per-item opt-in toggle persisted in localStorage; `CheckoutLineItem.unitAmountCents?: number` for variable tip amount to checkout API
  - `src/lib/bookstore/cart.ts` — `updatePrice(bookId, formatKey, price)` and `updateTipIncluded(bookId, formatKey, included)` actions; `addItem` no longer stacks quantity for tip items — re-adding updates price and `tipIncluded` instead
  - `src/lib/sanity/lib/queries.ts` — author projection uses `coalesce(tipStripeProductId, tipStripePriceId)` for backward compatibility with documents saved before the field rename
  - `src/app/api/bookstore/checkout/route.ts` — tip items built with `price_data: { product, unit_amount }` (Stripe name-your-price); tips with zero/missing `unitAmountCents` are filtered before session creation; non-tip price IDs trimmed to remove accidental whitespace; diagnostic `[shop/checkout]` log line emits key prefix and price IDs to aid Stripe env debugging
  - `src/components/bookstore/TipAuthorRow.tsx` — full rewrite: "Include tip" checkbox (default checked), editable dollar input (default = `author.tipAmount`), buttons disabled when unchecked or amount = 0; uses `tipStripeProductId`; "+ Cart" passes `tipIncluded: true`; "Tip Now" passes `unitAmountCents` to checkout
  - `src/components/bookstore/BookCardActions.tsx` — compact tip row below format buttons: include checkbox + inline amount input; tip added to cart or Buy Now payload only when checked and amount > 0
  - `src/app/(user)/bookstore/cart/page.tsx` — tip items rendered with amber left-border styling, editable amount input (calls `updatePrice`), include checkbox (calls `updateTipIncluded`), no quantity controls; checkout payload filters unchecked/zero tips and passes `unitAmountCents` for included tips; subtotal respects `tipIncluded` flag

- **Bookstore — Guest Download Token API (Issue #46, §7)**
  - `src/app/api/bookstore/download/guest/` — one-time token download endpoint for guest purchases; validates token, marks used, returns Supabase signed URL
  - `src/app/api/bookstore/download/guest-resend/` — accepts `order_number` + `guest_email`; verifies match; generates fresh token with new expiration; sends new delivery email via Resend; rate-limited to 3 resends per order
  - `supabase/migrations/20260430000002_guest_download_tokens.sql` — `guest_download_tokens` table: token, order_item_id, guest_email, used_at, expires_at, resend_count
  - `supabase/migrations/20260430000003_audit_logs.sql` — `audit_logs` table: event_type, user_id, purchase_id, ip_address, user_agent, details JSONB; indexed on event_type + created_at

- **Breaking News Page**
  - `src/app/(news)/breaking/page.tsx` + `BreakingNewsClient.tsx` — dedicated `/breaking` route with `generateMetadata`; replaces old redirect target with a full rendered page
  - Removed `src/app/(news)/live-event/[slug]/page.tsx` (superseded by breaking news + events architecture)

- **Hurriya Publications — Brand Assets**
  - `public/hurriya-pub/` — full brand asset set: Logo, Logo-alt, Logo-invert, Banner, Banner-invert (PNG + PSD source files)

### Fixed

- **Supabase `permission denied for table` on all bookstore tables** — schema migration created tables with RLS enabled but never granted base Postgres table privileges to `service_role`, `anon`, or `authenticated`; service role bypasses RLS row policies but still requires explicit `GRANT`; new migration `20260430000001_grant_role_privileges.sql` grants full DML to `service_role` and `authenticated`, read-only `payouts` to `authenticated`; applied to production Supabase project via `supabase db push`

- **Portal Order Management showing "database not connected"** — catch block swallowed error silently; improved to capture and display the actual Supabase error message with a hint to run `supabase db push` if the error is a missing relation

- **`BreakingNewsClient` "Cannot find module" TS error** — `LiveEvent` and `Article` types were used as implicit globals in `BreakingNewsClient.tsx` with no import or local declaration; TypeScript failed to compile the file, causing the parent `page.tsx` import to report "Cannot find module"; fixed by adding `interface LiveEvent` and `interface Article` at the top of the file

- **`checkbox.tsx` duplicate border Tailwind classes** — shadcn codegen emitted `border-slate-200 border-slate-900` (and `dark:border-slate-800 dark:border-slate-50`) on the same element; only the last value wins; removed the duplicate dark-state values, keeping `border-slate-200 dark:border-slate-800` as the unchecked border (checked colors already handled by `data-[state=checked]` classes)

- **`tsconfig.json` `ignoreDeprecations` invalid value** — `"6.0"` is not an accepted value by the TypeScript compiler; changed to `"5.0"` (the only valid value as of TS 5.x); was causing `Type error: Invalid value for '--ignoreDeprecations'` and failing the Next.js production build

- **File input clicks broken inside `overflow-hidden` containers** — `sr-only` applies `clip: rect(0,0,0,0)` which kills programmatic click targets; fixed across `AddBookModal`, `EditBookModal`, and `ArticleEditorForm` by switching to `useRef` + `className='hidden'` / `fixed left-[-9999px]` inputs with `ref.current?.click()`
- **Digital file "first pick doesn't stick"** — shared `digitalInputRef` + `useState` index tracking has stale closure / batched-state race on first pick; fixed in both `AddBookModal` and `EditBookModal` by giving each format card its own dedicated `<input ref={(el) => { digitalInputRefs.current[i] = el; }}>` with an inline `onChange` that captures `i` directly from the `map()` closure — eliminates index tracking entirely
- **Supabase upload failures (400 / type error)** — server actions must receive `FormData` (not serialized `Uint8Array`) across the wire; upload functions refactored to accept `FormData` and call `file.arrayBuffer()` server-side; `Buffer.from(bytes)` required by Supabase JS client (raw `Uint8Array` rejected)

### Removed

- `ADSENSE-SETUP.md` — one-time setup doc no longer needed

- **Bookstore — Build Fixes**
  - `src/lib/bookstore/supabase.ts` — lazy proxy clients (throw at call time, not import time) to prevent build crash when env vars missing
  - `src/lib/bookstore/email.ts` — lazy Resend initialization for same reason
  - `src/lib/bookstore/database.types.ts` — added `Relationships` arrays (required by @supabase/supabase-js 2.105+)
  - `src/lib/bookstore/types.ts` — `SanityImageRef` typed as `{ _type: 'image'; asset: { _type: 'reference'; _ref: string } }` to satisfy `urlForImage` parameter
  - `src/util/urlForImage.ts` — broadened parameter type to accept `ImageLike` (Image | asset-ref-compatible object) for cross-schema compatibility
  - Stripe API version updated: `2025-04-30.basil` → `2026-04-22.dahlia`
  - `generateStaticParams` in book detail page uses raw Sanity client (not `sanityFetch`) to avoid `draftMode()` outside request scope error
  - Removed `export const runtime = 'nodejs'` from webhook route (incompatible with `useCache` experimental flag)

---

## [3.0.0] — 2026-04-28

### Summary
Major release. Full Author Portal with BlockNote WYSIWYG editor, role-based access control, pitch workflow, and Sanity Live real-time updates (#44). Coral Comments with Clerk SSO (#42). Algolia full-text search with faceted filters (#21). Tag pages (#8). Expanded embed support: Facebook, TikTok, and Instagram hydration fix. Rendering, analytics, and image fixes throughout.

### Added

- **Author Portal — Clerk Role-Based Access Control (#44, Phase 1)**
  - `src/lib/auth/roles-utils.ts` — pure, framework-agnostic utilities: `getRoleFromMeta(meta)` extracts a `PortalRole` (`'admin' | 'editor' | 'author'`) from Clerk `publicMetadata`; `hasRole(role, required)` enforces the hierarchy `admin > editor > author`; backwards-compatible with legacy `publicMetadata.admin === true` flag
  - `src/lib/auth/roles.ts` — server-only helpers: `getRoleFromUser(user)`, `getCurrentRole()`, `getCurrentUserWithRole()`, `requireRole(role)` (redirects to sign-in or home on failure), `requireAdmin()`, `requireEditor()`, `requireAuthor()`, `isAdmin()`, `isEditor()`, `isAuthor()`; roles are read from fresh Clerk API data, never from the JWT alone
  - `src/middleware.ts` — updated to protect `/portal/**` and `/api/portal/**` routes; unauthenticated → `/sign-in`; no-role authenticated → `/`; admin check uses fresh `publicMetadata` from Clerk API on every request
  - `src/app/api/admin/set-role/route.ts` — admin-only POST endpoint that writes `publicMetadata.role` to any target Clerk user; Zod-validated; re-verifies requester is admin on every call; role can only be set server-side
  - `jest.config.ts` — root-level Jest config using `next/jest` (SWC transform); fixes missing config that caused Sanity ESM import errors in tests
  - `src/lib/auth/__tests__/roles.test.ts` — 20 unit tests covering all `getRoleFromMeta` and `hasRole` scenarios

- **Author Portal — Dashboard (#44, Phase 2)**
  - `src/models/schema/article.ts` — added `featured`, `breakingNews`, `needsReview` fields
  - `src/lib/portal/queries.ts` — `queryPortalArticlesByAuthor` (author-scoped), `queryPortalAllArticles` (editor/admin), `queryPortalArticleById`, `queryPortalCategories`, `queryPortalAuthors`, `queryPortalAllSources`; `clerkId` excluded from all projections
  - `src/lib/portal/fetch.ts` — authenticated Sanity client for portal queries (read token, CDN off)
  - `src/lib/portal/sanitize.ts` — `sanitizeText()` / `sanitizeHtml()` strip injection vectors from all inputs before Sanity writes; 10 unit tests
  - `src/app/(portal)/layout.tsx` — portal route group with server-side `requireAuthor()` gate and Toaster
  - `src/app/(portal)/portal/page.tsx` — dashboard root; redirects to `/portal/articles`
  - `src/components/portal/PortalNav.tsx` — top nav with Articles/Sources links, back-to-site link, Clerk UserButton; active link uses `bg-untele`
  - `src/components/portal/ArticleDashboard.tsx` — live search by title/tag/category; status filter (published/draft/in-review); sort by modified/created/title/status; table/card toggle; per-article action menu with delete confirmation; role-aware (editors see all articles + author column); empty state CTA; Sonner toasts
  - Editor author filter toggle: All / Mine / Others / Reviewed

- **Author Portal — Article Editor (#44, Phases 3–4)**
  - **BlockNote** WYSIWYG editor (replaced Tiptap — better out-of-box UX; custom embed blocks are first-class BlockNote concepts)
  - `src/lib/portal/blocknote-serializer.ts` — full bidirectional BlockNote JSON ↔ Sanity Portable Text: paragraphs, headings, blockquote, bullet/ordered lists, code blocks, table, image, divider, youtubeEmbed, twitterEmbed, instagramEmbed, facebookEmbed, tiktokEmbed; test suite for all round-trips
  - `src/lib/portal/image-actions.ts` — server action to upload images to Sanity asset pipeline; validates JPEG/PNG/WebP/GIF/AVIF and 10 MB limit; requires author role
  - `src/lib/portal/article-ownership.ts` — shared ownership verification helper; `import 'server-only'` guard
  - `src/lib/portal/source-actions.ts` — `createSource`, `updateSource`, `deleteSource`, `fetchAllSources` server actions; sanitized, Zod-validated
  - `src/lib/portal/article-actions.ts` — `createArticle`, `updateArticle`, `deleteArticle`, `submitArticleForReview`, `publishArticle`; all re-verify session and role; ownership enforced server-side; authors cannot publish or set featured/breaking; Zod-validated
  - `src/components/portal/SourceSelectorModal.tsx` — search existing sources or inline-create without leaving the editor
  - `src/components/portal/ArticleEditorForm.tsx` — full metadata form: title, slug (auto-generate + manual), excerpt, lead paragraph, BlockNote body, categories, author (editor+), tags, keywords, location, publish date/time, sources selector, featured/breaking (editor+), comments toggle, video embed (featured section with live preview), methodology note, related articles search, FAQs section, corrections system (correction/clarification/update/retraction), main image upload; sticky action bar with Save Draft / Submit for Review / Publish / Preview; autosave every 60s with Saving / Saved / Unsaved indicator; `beforeunload` leave-warning; `Ctrl+S` = Save Draft, `Ctrl+Shift+P` = Preview
  - `src/app/(portal)/portal/articles/new/page.tsx` — fetches categories + authors in parallel; accepts `?pitchId=` to pre-fill from a claimed pitch
  - `src/app/(portal)/portal/articles/[id]/edit/page.tsx` — verifies author ownership; `notFound()` for unauthorized or missing articles
  - `src/lib/portal/__tests__/slug.test.ts` — 7 unit tests for slug generation

- **Author Portal — Source Library (#44, Phase 5)**
  - `src/app/(portal)/portal/sources/page.tsx` — source library with `SourceLibrary` client component
  - `src/app/(portal)/portal/sources/new/page.tsx` and `[id]/edit/page.tsx` — create/edit source forms
  - `src/components/portal/SourceLibrary.tsx` — searchable list filtered by title/URL/type; linked article count per source; delete confirmation; empty state CTA
  - `src/components/portal/SourceForm.tsx` — label, type (dropdown), URL, notes, anonymous flag; Zod-validated; Sonner toasts; redirects to `/portal/sources` on success

- **Author Portal — Security Hardening (#44, Phase 6)**
  - `src/lib/portal/rate-limit.ts` — Upstash Redis sliding-window rate limiter (30 writes/min per user); degrades gracefully when env vars absent; lazy-loaded to avoid client bundling
  - Rate limiting applied to `createArticle`, `updateArticle`, `deleteArticle`, `createSource`, `updateSource`
  - Security model: session + role re-verified on every server action; ownership enforced (`author._ref === sanityAuthorId`); all text inputs sanitized; server-only write token; `clerkId` excluded from all GROQ projections; CSRF via Next.js Server Actions
  - `src/lib/portal/__tests__/rate-limit.test.ts` — 2 unit tests for graceful degradation

- **Author Portal — Pitch Workflow (#44)**

  *Schemas*
  - `src/models/schema/claimedPitch.ts` — headline, urgency, beat, angle, sourceSuggestions, reference links, notes (Portable Text), status (`claimed` | `in_progress` | `published` | `abandoned`), author reference, assignedBy, brief provenance, claimedAt, weak `linkedArticle` reference
  - `src/models/schema/brief.ts` — top-level `storyPasses[]` array (`{ _key, storyKey, authorId, passedAt }`) — pass decisions are per-user; doesn't affect the story for other authors
  - `src/models/schema/article.ts` — `linkedPitch` weak reference field

  *Server actions*
  - `src/lib/portal/pitch-actions.ts` — `updatePitchDetails` (ownership-checked patch), `savePitchNotes` (plain text → Portable Text blocks)
  - `src/lib/portal/brief-actions.ts` — `fetchBriefById`: fetches brief + user's claimed pitches in parallel, builds `myPitchMap`
  - `src/lib/portal/article-actions.ts` — `createArticle` accepts optional `linkedPitchId`; bidirectional pitch ↔ article linking on create

  *Components*
  - `src/components/portal/PitchNotesEditor.tsx` — textarea with char count; saves via `savePitchNotes`
  - `src/components/portal/PitchDetailsEditor.tsx` — read-only-first sidebar; Edit mode for headline, angle, source suggestions, reference links, linked article dropdown
  - `src/components/portal/PitchQuickViewModal.tsx` — fixed right-side slide-in from article editor; ESC + backdrop dismiss; saves via `Promise.all([updatePitchDetails, savePitchNotes])`
  - `src/components/portal/ClaimedPitchCard.tsx` — urgency/beat/status badges; Open Pitch and Start/Edit Article actions
  - `src/components/portal/ClaimedPitchesPanel.tsx` — Mine/All/Others filter; sorts by status then urgency; count label
  - `src/components/portal/BriefPanel.tsx` — `< >` navigation between briefs; per-user pass/unpass with optimistic UI; card sort: breaking unclaimed → unclaimed → claimed → published; editor Assign/Release/Reassign controls

  *Pages*
  - `src/app/(portal)/portal/pitch/[id]/page.tsx` — headline + badges + `PitchNotesEditor` left column; Quick Actions + `PitchDetailsEditor` + Provenance right sidebar; `notFound()` for non-owners
  - `src/app/(portal)/portal/page.tsx` — dashboard now fetches briefs, pitchMap, claimedPitches; renders `ClaimedPitchesPanel` and `BriefPanel`

- **Author Portal — Sanity Live Integration (#44)**
  - All portal pages migrated to Sanity Live Content API — dashboard, inbox, and article list update in real time; zero manual refresh required
  - `_originalId` used for draft detection; `_id` prefix as authoritative draft/published signal under `previewDrafts`

- **Coral Comments with Clerk SSO (#42)**
  - `docker/docker-compose.yml` — self-hosted Coral Talk + MongoDB 8 + Redis 7-alpine + Caddy 2 (auto TLS) + nightly backup container; MongoDB and Redis on internal-only network
  - `docker/Caddyfile` — reverse proxy for `coral.untelevised.media` with security headers, gzip, access logging
  - `docker/.env.example` — all required env vars documented; `CORAL_SIGNING_SECRET` vs `CORAL_SSO_SECRET` distinction noted
  - `docker/scripts/backup.sh` — nightly `mongodump` with gzip + auto-prune after `BACKUP_RETAIN_DAYS` (default 14)
  - `src/app/api/coral-token/route.ts` — mints 24-hour HS256 JWT for Coral SSO from active Clerk session; `{ token: null }` for guests; auto-grants `MODERATOR` to `admin`/`staff` Clerk roles
  - `src/components/post/CommentsSection.tsx` — gates embed behind functional cookie consent; fetches SSO token for signed-in users; consent CTA for declined functional cookies; locked state when `allowComments === false`; brand-themed via CSS variables
  - `src/models/schema/article.ts` — `allowComments` boolean with `initialValue: true`
  - `public/coral-theme-dark.css` / `coral-theme-light.css` — served as `customCSSURL` to Coral's RTE iframe; two files for reliable theme matching

- **Algolia Full-Text Search (#21)**
  - `algoliasearch` v5, `react-instantsearch` v7, `@portabletext/toolkit` installed
  - `src/lib/algolia/client.ts` — server-only admin client with lazy initialisation
  - `src/app/api/algolia-sync/route.ts` — Sanity webhook handler with HMAC-SHA256 signature validation; syncs articles and live events on create/update/delete
  - `scripts/algolia-initial-index.ts` — one-time backfill via `pnpm algolia:index`; `bodyText` capped at 5,000 chars
  - `src/app/(user)/search/page.tsx` — reads `?q=` and passes as `initialQuery` to `SearchClientLoader`
  - `src/components/search/SearchClient.tsx` — `InstantSearch` UI: `SearchBox`, `Hits` with `ArticleHitCard` (thumbnail, highlighted title/description, author, category, date), `RefinementList` facets (category, tag, author), `Pagination`, `NoResults`; `onStateChange` syncs `?q=` URL
  - `src/components/global/HeaderSearch.tsx` — Algolia typeahead in header: live dropdown (top 6 hits); `dynamic({ ssr: false })`
  - `.env.example` updated with Algolia env vars

- **Tag Pages (#8, PR #40)**
  - `tags` string-array field on `article` (max 10, tag-input layout in Studio)
  - `src/lib/tagUtils.ts` — `tagToSlug`, `slugToTagLabel`, `tagPageUrl` helpers
  - `queryAllTags` / `queryArticlesByTag` GROQ queries; `queryAllArticles` updated to include `tags`
  - `src/app/(user)/tag/[slug]/page.tsx` — `generateStaticParams`, `generateMetadata`, canonical URL, CollectionPage JSON-LD, breadcrumb, article grid, empty state
  - Article detail page: categories as red pills, tags as ghost `#pill` links in hero header
  - Sitemap: all `/tag/[slug]` URLs added (`changeFrequency: daily`, `priority: 0.5`)

- **Facebook embed support**
  - `src/models/schema/facebook.ts` — `facebookEmbed` Sanity object type with required `postUrl` field and Studio preview
  - `src/components/providers/FacebookEmbed.tsx` / `FacebookEmbedInner.tsx` — SSR-safe dynamic import pattern (eliminates hydration mismatch)
  - `RichTextComponents.tsx` — `facebookEmbed` type renderer
  - `src/lib/portal/blocknote-serializer.ts` — full BlockNote ↔ Portable Text round-trip for `facebookEmbed` blocks
  - Registered in `blockContent` array members and exported from `schema/index.ts`

- **TikTok embed support**
  - `src/models/schema/tiktok.ts` — `tiktokEmbed` Sanity object type with required `videoUrl` field and Studio preview
  - `src/components/providers/TikTokEmbed.tsx` / `TikTokEmbedInner.tsx` — SSR-safe dynamic import pattern
  - `RichTextComponents.tsx` — `tiktokEmbed` type renderer
  - `src/lib/portal/blocknote-serializer.ts` — full BlockNote ↔ Portable Text round-trip for `tiktokEmbed` blocks
  - Registered in `blockContent` array members and exported from `schema/index.ts`

- **Instagram embed hydration fix**
  - Extracted into `InstagramEmbedInner.tsx` + `dynamic(..., { ssr: false })` wrapper — eliminates React hydration mismatch from `embed.js` DOM mutation

### Fixed

- **Article body images no longer cropped (`RichTextComponents.tsx`)**
  - Removed fixed `h-96` + `overflow-hidden`; dimensions parsed from Sanity asset ref (`image-{id}-{W}x{H}-{ext}`); `style={{ width: '100%', height: 'auto' }}` preserves full aspect ratio

- **Article featured image no longer cropped (`articles/[slug]/page.tsx`)**
  - Removed hardcoded `800×450` / `object-cover`; same asset-ref dimension extraction applied

- **Raw Feed cards now clickable (`RawFeed.tsx`)**
  - Replaced plain `<div>` wrapper with `<Link href="/articles/{slug}">` so cards navigate to the article

- **Author Portal — post-audit fixes (#44)**
  - `SourceSelectorModal.tsx` — replaced direct `portalClient.fetch()` (which imported `server-only`) with `fetchAllSources` server action; fixes build-breaking server/client boundary violation
  - `src/app/api/admin/set-role/route.ts` — replaced `requireAdmin()` in try/catch (which silently swallowed Next.js redirect exceptions) with direct `auth()` + `currentUser()` + `hasRole()` check; 401 vs 403 now correct
  - `src/lib/portal/blocknote-serializer.ts` — list nodes return `SanityBlock[]` arrays directly; `tiptapToPortableText` spreads arrays so every list item becomes a top-level Portable Text block
  - Portal `_id` / `_originalId` handling hardened: `_originalId` used for draft detection and mutations under `previewDrafts`; `status === 'published'` replaces `publishedAt` as the authoritative published signal

---

## [2.3.0] — 2026-03-20

### Summary
Bookmarks full-stack release — completes Phase 2 of issue #19. localStorage bookmarking (Phase 1, v2.2.x) is preserved as the default for all unauthenticated users. Signed-in users now get server-backed bookmarks stored in Sanity, synced across all devices. Guest bookmarks are automatically migrated to the server on first sign-in with no data loss.

### Added
- **Bookmarks Phase 2: Clerk + Sanity sync (#19, PR #39)**

  **Sanity**
  - New `userBookmark` document type — fields: `clerkUserId`, `slug`, `title`, `description`, `imageUrl`, `authorName`, `publishedAt`, `readingTime`, `bookmarkedAt`
  - Deterministic `_id` (`userBookmark_{userId}_{slug}`) enforces one document per user+slug — natural upsert deduplication
  - `src/lib/sanity/lib/write-client.ts` — server-only Sanity client with write permissions via `SANITY_API_WRITE_TOKEN`

  **Server Actions (`src/lib/bookmarks/actions.ts`)**
  - `getServerBookmarks()` — fetch all bookmarks for the current Clerk user, newest first
  - `checkServerBookmarked(slug)` — boolean check against Sanity
  - `addServerBookmark(entry)` — upsert via `createOrReplace`
  - `removeServerBookmark(slug)` — delete by deterministic doc ID
  - `clearServerBookmarks()` — bulk delete all docs for user
  - `syncLocalBookmarksToServer(entries[])` — transactional `createIfNotExists` migration; preserves original `bookmarkedAt` timestamps

  **Hook (`src/hooks/useBookmarks.ts`)**
  - `useBookmarks()` — unified hook abstracting both storage backends
  - Anonymous: reads/writes `localStorage` only (unchanged behaviour)
  - Authenticated: reads/writes Sanity; migration from localStorage runs once on first sign-in then local storage is cleared
  - Optimistic UI throughout — state updates instantly before server confirms
  - Exposes: `bookmarks`, `loading`, `ready`, `isBookmarked`, `toggle`, `remove`, `clearAll`

  **Reading List UX**
  - `src/app/(user)/reading-list/layout.tsx` — `robots: noindex, nofollow` metadata
  - `/reading-list` page shows Cloud icon + "synced to your account" copy when signed in; Monitor icon + "stored in this browser" copy for guests

### Changed
- **`BookmarkButton`** — now consumes `useBookmarks()` hook; direct localStorage calls removed; `ready` flag replaces `mounted`; visual design and API unchanged for unauthenticated users

### Added

- **Bookstore — Infrastructure Setup (#46, Phase 1 Steps 1.1–1.2)**
  - Added placeholder env var comments to `.env.local` (gitignored) for `SUPABASE_SHOP_URL`, `SUPABASE_SHOP_ANON_KEY`, `SUPABASE_SHOP_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — values must be filled after Supabase shop project creation and Stripe webhook registration
  - Supabase shop project (`untelevised-shop`) requires manual creation: run DDL from issue #46 §2.2, configure RLS per §2.3, create private `digital-books` storage bucket
- **Bookstore — Supabase Shop Client (#46, Phase 1 Step 1.3)**
  - `src/lib/shop/supabase.ts` — `shopClient` (anon key, RLS-enforced client reads) and `shopServiceClient` (service role, server-only writes) for the separate `untelevised-shop` Supabase project
  - `src/lib/shop/database.types.ts` — TypeScript type stubs for all shop tables (customers, addresses, orders, order_items, digital_downloads, payouts); replace with `supabase gen types typescript` output after project creation
  - Packages added: `@supabase/supabase-js`, `stripe`, `zustand`, `resend`
- **Bookstore — TypeScript Interfaces (#46, Phase 1 Step 1.4)**
  - `src/lib/shop/types.ts` — full interface set: `Customer`, `Address`, `Order` (with `OrderStatus` enum), `OrderItem`, `DigitalDownload`, `Payout` (Supabase rows); `SanityBook`, `SanityBookFormat`, `SanityBookGenre` (GROQ projection shapes); `CartItem` (client-side cart); `CheckoutLineItem` + `CheckoutPayload` (API contract)
- **Bookstore — Sanity GROQ Queries (#46, Phase 1 Step 1.5)**
  - Added to `src/lib/sanity/lib/queries.ts`: `queryAllBooks`, `queryFeaturedBooks`, `queryBookBySlug`, `queryBooksByAuthor`, `queryAllBookGenres`, `queryBooksByGenre`; all project the full `bookFields` fragment including resolved author, genre references, and format inventory/digital-asset data
- **Bookstore — Cart State (#46, Phase 1 Step 1.6)**
  - `src/lib/shop/cart.ts` — Zustand cart store with localStorage persistence (`untele-cart` key); `addItem` (merges duplicate format+book combos), `removeItem`, `updateQuantity`, `clearCart`, `getItemCount`, `getTotal`; `buildCartItem` helper for building cart items from Sanity book format data
- **Bookstore — Role System with 'sales' Role (#46, Phase 1 Step 1.7)**
  - `src/lib/auth/roles-utils.ts` — `PortalRole` type (`admin | editor | author | sales`); `getRoleFromMeta` extracts role from Clerk `publicMetadata`; `hasRole` enforces hierarchy (admin > editor > author; sales is orders-only peer); `isSalesOnly` predicate; backwards-compatible with legacy `admin: true` flag
  - `src/lib/auth/roles.ts` — server helpers: `requireRole`, `requireAdmin`, `requireEditor`, `requireAuthor`, `requireAnyPortalRole`, `isAdmin`, `isEditor`, `isAuthor`, `isSales`; all re-verify fresh Clerk data on every call
  - `src/middleware.ts` — portal route protection: unauthenticated → `/sign-in`; no-role → `/`; `sales` role redirected to `/portal/orders` if accessing any other portal path
- **Bookstore — Stripe Checkout API (#46, Phase 2 Step 2.1)**
  - `src/app/api/bookstore/checkout/route.ts` — `POST /api/bookstore/checkout`; accepts `CheckoutPayload` (items with `stripePriceId`, `quantity`, `sanityBookId`, `formatType`); creates Stripe Checkout Session with collected shipping address for physical items; stores `items_json` + `clerk_user_id` in session metadata; returns `{ url }` for client redirect
- **Bookstore — Stripe Webhook + Download API (#46, Phase 2 Steps 2.2–2.5 + Phase 3 Step 3.9)**
  - `src/app/api/bookstore/webhook/route.ts` — `POST /api/bookstore/webhook`; Stripe signature verification via `STRIPE_WEBHOOK_SECRET`; handles `checkout.session.completed` (upserts customer, creates order + order_items, provisions `digital_downloads` records with 1-year expiry and 5-download limit, sends confirmation emails), `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` (updates status + sets `max_downloads = 0` to revoke access), `charge.dispute.created`
  - `src/app/api/bookstore/download/route.ts` — `GET /api/bookstore/download?order_item_id=...`; validates Clerk auth, verifies customer ownership, checks expiry and download count, generates 15-minute Supabase Storage signed URL, increments `download_count` and updates timestamps
  - `src/lib/shop/email.ts` — Resend email helpers: `sendOrderConfirmationEmail`, `sendDigitalDownloadEmail`, `sendShipmentEmail`, `sendRefundEmail`; all gracefully no-op when `RESEND_API_KEY` is absent
- **Bookstore — Public Storefront: Layout, Homepage, Book Detail (#46, Phase 3 Steps 3.1–3.3)**
  - `src/app/(user)/shop/layout.tsx` — shop route group layout within the (user) group (inherits Header/Nav/Footer)
  - `src/app/(user)/shop/page.tsx` — bookstore homepage; fetches featured books, all books, genres in parallel; renders `FeaturedHero` for the top featured book and a `BookCard` grid for all books; includes `GenreFilter` for genre-based navigation
  - `src/app/(user)/shop/book/[slug]/page.tsx` — full book detail page with `generateStaticParams`, `generateMetadata`, and JSON-LD `Book` + `Offer` structured data; cover image, Portable Text description, format selector rows (with inventory/low-stock badges, compare-at price), `AddToCartButton`, book details section, author bio card
  - `src/components/shop/GenreFilter.tsx` — client-side genre filter tab bar using URL searchParams
  - `src/components/shop/AddToCartButton.tsx` — client component; adds to Zustand cart with 2-second "Added ✓" feedback
- **Bookstore — Cart UI (#46, Phase 3 Steps 3.4–3.5)**
  - `src/components/bookstore/MiniCart.tsx` — header mini-cart icon with item-count badge (bag SVG icon, badge hidden when empty)
  - `src/app/(user)/bookstore/cart/page.tsx` — full cart page; quantity increment/decrement controls; remove; order summary sidebar with subtotal; checkout button POSTs to `/api/bookstore/checkout` and redirects to Stripe-hosted checkout on success
- **Bookstore — Order Success, Order History, Download Vault (#46, Phase 3 Steps 3.6–3.8)**
  - `src/app/(user)/shop/order-success/page.tsx` — retrieves Stripe session server-side via `session_id` searchParam; displays itemized order summary; shows digital download CTA when any item is digital; graceful fallback if session lookup fails
  - `src/app/(user)/shop/orders/page.tsx` — Clerk-authed server component; fetches customer + orders + order_items from Supabase; grouped order cards with status badge, total, item list, and "Download Files" link for digital orders
  - `src/app/(user)/shop/downloads/page.tsx` — client component download vault; fetches from `GET /api/bookstore/my-downloads`; per-file download button calling `GET /api/bookstore/download`; shows download count, expiry, expired/exhausted states
  - `src/app/api/bookstore/my-downloads/route.ts` — `GET /api/bookstore/my-downloads`; returns authenticated user's `digital_downloads` rows joined with `order_items` for display metadata

---

## [2.2.2] — 2026-03-20

### Summary
Credibility release — adds a complete Fact Check content type with `ClaimReview` JSON-LD for Google's fact-check rich results, inline fact-check cards embeddable in any blockContent rich text field, a full `/fact-checks` index and `/fact-check/[slug]` detail route, and five pre-seeded fact-checks covering all six verdict types.

### Added
- **Fact Check Content Type (#25, PR #38)** — Full fact-checking infrastructure from Sanity schema to front-end render with ClaimReview JSON-LD and inline blockContent embedding:

  **Sanity schema**
  - New `factCheck` document type with 4 grouped Studio tabs — Claim, Verdict, Analysis, Meta
  - Fields: `title`, `slug`, `publishedAt`, `author` (reference), `claim` (text), `claimSource`, `claimUrl`, `claimDate`, `rating` (radio enum — 6 verdicts with emoji labels), `ratingExplanation` (max 300 chars), `body` (blockContent), `sources[]` (label + url objects), `relatedArticles[]` (max 5 references)
  - Studio preview shows verdict emoji + title + date
  - `factCheckEmbed` object type added to `blockContent` — any rich text field on the site (articles, live events, etc.) can now embed an inline fact-check card via a Sanity reference; Studio preview shows verdict emoji + title
  - `queryArticleBySlug` updated to resolve `factCheckEmbed` references within body arrays

  **Verdict system**
  - `src/lib/factCheck/verdictConfig.ts` — central config for all 6 verdicts with Tailwind colour classes and schema.org `ratingValue` mapping (TRUE=5, MOSTLY TRUE=4, MISLEADING=3, MOSTLY FALSE=2, FALSE=1, UNVERIFIABLE=0)
  - `src/lib/factCheck/claimReviewJsonLd.ts` — `buildClaimReviewJsonLd()` generates valid `ClaimReview` structured data for Google's fact-check rich result badge

  **GROQ queries**
  - `queryAllFactChecks` — all fact-checks ordered by `publishedAt desc`, fields for index cards
  - `queryFactCheckBySlug` — full detail including body (with `factCheckEmbed` reference resolution), sources, author, and related articles

  **Components**
  - `VerdictBadge` — `sm` and `lg` size variants; per-verdict colour coding; FALSE uses brand `#D70606`
  - `InlineFactCheckCard` — compact card rendered inside `PortableText` when a `factCheckEmbed` block is encountered; shows verdict badge, the claim in a blockquote, verdict explanation, and link to full fact-check
  - `RichTextComponents` extended with `factCheckEmbed` type renderer

  **Routes**
  - `/fact-checks` — index page listing all fact-checks with verdict badges, claim previews, claim source, and author/date meta; follows site card/section conventions
  - `/fact-check/[slug]` — detail page with `generateMetadata`, `generateStaticParams` (uses raw `sanityClient` to avoid `draftMode()` outside request scope), `notFound()`, breadcrumb nav, claim blockquote with linked source, verdict explanation box, full `PortableText` analysis body, sources list, related articles, and `ClaimReview` JSON-LD injected via `<script type="application/ld+json">` in `<head>`

  **Sitemap**
  - `/fact-checks/` static route added (priority 0.8, daily)
  - Dynamic `/fact-check/[slug]/` URLs fetched directly from Sanity and included (priority 0.7, weekly)

  **Seed data**
  - `scripts/seed-fact-checks.mjs` — idempotent seed script using `createOrReplace`
  - 5 fact-checks pre-populated in Sanity covering all verdict types:
    | Verdict | Claim |
    |---|---|
    | MISLEADING | "The national debt doubled under Biden" |
    | TRUE | "U.S. inflation peaked at 9.1% in June 2022" |
    | MOSTLY FALSE | "EVs produce more carbon than gas cars" |
    | UNVERIFIABLE | "AI will eliminate 40% of jobs by 2030" |
    | FALSE | "The southern border is wide open with no enforcement" |

- **Careers Page & Auth System (#17)** — Full careers system with Sanity-managed listings, unified application form, Clerk authentication, and a protected admin dashboard:

  **Sanity schema & queries**
  - `jobListing` Sanity document type — fields: title, slug, department (6 options: field-reporter, photojournalist, video-editor, writer, social-media, other), type (full-time/part-time/freelance/volunteer), location, description (blockContent), requirements (string[]), compensation, isActive (default true), closingDate; registered in schema index and auto-appears in Studio
  - `queryActiveJobListings` GROQ query — filters by `isActive == true` and `closingDate >= $today`; accepts `{ today: "YYYY-MM-DD" }` param
  - `queryJobApplications` GROQ query — fetches all `jobApplication` docs ordered by `submittedAt desc` for the admin dashboard
  - 7 realistic seed `jobApplication` documents created directly in Sanity covering all 6 statuses (new, review, interview, accepted, declined, hold) and all schema fields

  **Careers page (`/careers`)**
  - Server component; sections: Hero ("WRITE FOR THE RESISTANCE"), 3 value-prop cards (Editorial Freedom, Portfolio Building, Global Reach), 12-role "We're Looking For" grid (Field Reporter, Documentary Filmmaker, Photojournalist, Video Editor, Social Media Strategist, Graphic Designer, Data Journalist, Podcast Producer, Live-Stream Operator, Copy Editor, Researcher, Web Developer), collapsible `<details>` accordion per active Sanity listing with dept/type/location/compensation meta, rich text description, requirements list, and embedded `ContributorApplicationForm`; "We're Always Hiring" section with full form; graceful try/catch fallback if Sanity fetch fails

  **ContributorApplicationForm** (`src/components/careers/ContributorApplicationForm.tsx`, `'use client'`)
  - All fields from former `/join` form: firstName, lastName, email, phone, location, positionsOfInterest (multi-checkbox), socialMediaPlatforms (checkbox), portfolioWebsite, youtubeChannel, socialMediaLinks (dynamic platform+url pairs), experienceLevel, experienceDescription, workSamples (dynamic title+url pairs), availability, additionalInfo
  - Optional `prefilledPosition` prop to pre-check a position from the listing accordion
  - Submits to `/api/job-application` (same `jobApplication` Sanity schema); success renders CheckCircle2 confirmation; error renders AlertCircle with message

  **Route consolidation**
  - `/join/page.tsx` deleted entirely — no redirect, no orphan route
  - Sitemap: `/join/` entry removed; `/careers/` added at priority 0.6, monthly changeFrequency
  - Footer: "Careers" and "Join Our Team" merged into single "Careers / Join Our Team" link pointing to `/careers`

  **Clerk authentication setup**
  - `@clerk/nextjs` ^7 installed
  - `ClerkProvider` added to root `layout.tsx` wrapping the entire app (`afterSignOutUrl='/'`)
  - `src/middleware.ts` — `clerkMiddleware` + `createRouteMatcher(['/admin(/.*)?'])`; uses `clerkClient().users.getUser(userId)` to read live `publicMetadata` (bypasses JWT claim limitation); accepts `admin: true` (boolean) or `admin: "true"` (string); unauthenticated → `/sign-in`; non-admin authenticated → homepage
  - `Header.tsx` — `Show when='signed-in'` renders `UserButton`; `Show when='signed-out'` renders Sign In link (uses `Show` not `SignedIn`/`SignedOut` which don't exist in this Clerk version)

  **Sign-in / Sign-up pages**
  - `/sign-in/[[...sign-in]]/page.tsx` — two-column layout: left brand panel (logo with red glow halo, UnTelevised name, tagline, pill CTA) + right Clerk `<SignIn>` form; dark `slate-950` background; `untele` red accent; no rounded corners on form elements; `card: 'shadow-none bg-transparent w-full'`; `spacingUnit: '18px'`
  - `/sign-up/[[...sign-up]]/page.tsx` — identical two-column layout using `<SignUp>`; both pages set `robots: { index: false, follow: false }`

  **Admin dashboard (`/admin`)**
  - Server component; `robots: noindex`; fetches all `jobApplication` docs via `queryJobApplications`
  - Six status summary cards (new, review, interview, accepted, declined, hold) with per-status color coding
  - `ApplicationsTable` client component: status filter tab bar, sortable rows (applicant name/email/location, positions, experience level, availability, submitted date, status badge), expandable detail rows showing experience description, portfolio/YouTube/social links, work samples, active social platforms, phone, internal notes, and "Edit in Studio" CTA linking to `/studio/structure/jobApplication;{id}`
  - Protected by `clerkMiddleware`; requires Clerk user with `publicMetadata: { "admin": true }`

- **Editorial Standards Page (#26)** — New static `/editorial-standards` page:
  - Six core principles: Accuracy, Independence, Fairness, Verification, Transparency, Accountability
  - Verification process section (primary sourcing, multi-source requirement, document verification, right of reply)
  - Source standards explaining named vs. anonymous sourcing and how the Source Transparency Panel works
  - Corrections policy with all four correction types (correction/clarification/update/retraction) explained with their visual color codes
  - Independence & Conflicts of Interest section (editorial firewall, staff disclosures, no political alignment, funding transparency, native advertising, outside employment)
  - Sensitive reporting guidelines (trauma & graphic content, suicide & self-harm, minors, national security)
  - Contact CTAs to corrections desk (`corrections@untelevised.media`) and editorial board (`editorial@untelevised.media`)
  - Added to sitemap at `/editorial-standards/` (priority 0.6, monthly)
  - "Editorial Standards" link added to Footer About column
- **Bookmarks & Reading List (#19)** — Zero-backend, pure localStorage article saving:
  - `src/lib/bookmarks/storage.ts` — CRUD utilities: `getBookmarks`, `isBookmarked`, `addBookmark`, `removeBookmark`, `clearBookmarks`. SSR-safe (`typeof window` guard), fails silently on quota exceeded. Storage key: `untele_bookmarks`
  - `BookmarkEntry` interface: slug, title, description, imageUrl, authorName, publishedAt, readingTime, bookmarkedAt
  - `BookmarkButton` component (`'use client'`) — icon-only or full (icon + label) variant; SSR-safe hydration (disabled placeholder → real state after mount); brand-color active state (untele red)
  - `/reading-list` page (`'use client'`) — animated loading skeleton, empty state with CTA, article list with thumbnail/meta/actions, per-item Remove button, Clear All button, article count, browser storage disclaimer
  - `BookmarkButton` integrated into article page next to social share row; passes slug, title, description, 400px image URL, author, publishedAt, and reading time
  - Bookmark icon added to header right section, linking to `/reading-list`
  - `/reading-list` added to sitemap (priority 0.1, changeFrequency: never)

- **Source Transparency Panel (#24)** — Collapsible sources & methodology section for articles and live events:
  - New standalone `source` Sanity document type (reusable across articles, live events, and key events) — fields: label, type (7 options: document, interview, statement, data, media, on-scene, other), url, description, `isAnonymous` flag
  - `article`: `sources[]` upgraded from minimal inline objects to references; `methodology` text field added
  - `liveEvent`: `sources[]` references + `methodology` added
  - `keyEvent`: `sources[]` references added
  - GROQ queries updated — `queryArticleBySlug` and `queryEventBySlug` dereference `sources[]->` with all fields + project `methodology`
  - `SourcesPanel` component — SSR-safe `<details>`/`<summary>` (no JS required); per-type icons (FileText, Mic, MessageSquare, Database, Video, Eye); anonymous sources show Shield icon and hide label/description; linked sources open in new tab; methodology rendered as a distinct blockquote
  - `articles/[slug]`: replaces old minimal sources list with `SourcesPanel`
  - `live-event/[slug]`: `SourcesPanel` added after body content
  - `ArticleSource` interface and `SourceType` union added to `types.d.ts`; `Article`, `LiveEvent`, `KeyEvent` types updated
  - Migration script `scripts/migrate-sources.mjs` — converted 22 inline `{ label, url }` objects across 4 articles to standalone `source` documents and patched references; supports `--dry-run`

### Added
- **Corrections & Retractions Workflow (#23)** — Full editorial correction pipeline:
  - New reusable `correctionObject` Sanity schema supporting four correction types: `correction` (amber), `clarification` (blue), `update` (green), `retraction` (red)
  - `Article` and `LiveEvent` Sanity schemas updated to use shared `correctionObject` field (live events support corrections/clarifications/updates only — not retractions)
  - `CorrectionNotice` component renders inline above article body with per-type color, icon, label, issued date, and detail text
  - Distinct retraction badge (red `bg-untele` + XCircle icon) vs correction badge (amber + AlertTriangle) on all card surfaces (`ArticleCard`, `FeaturedArticleCard`, `ArticleCardLg`)
  - Retracted article titles display with `line-through opacity-60` on article page and all card surfaces
  - GROQ queries updated to project `correction { type, issuedAt, summary, detail }` on all article and event fetch paths
  - `ArticleCorrection` TypeScript interface added; `correction?` field on `Article` and `LiveEvent` global types

### Fixed
- **GTM never loaded in production** — `GTM_ID` was a server-side env var passed
  to a `'use client'` component where it evaluated to `undefined`; renamed to
  `NEXT_PUBLIC_GTM_ID` so the client bundle can read it
- **Dual GTM + GA4 script conflict** — `ConsentAwareAnalytics` was loading both
  `gtag/js?id=GTM-…` (GA4 endpoint) and `gtm.js?id=GTM-…` (GTM endpoint) for
  the same container ID; now loads only the GTM snippet via `gtm.js`, with a
  separate optional `gtag/js?id=G-…` for direct GA4 (`NEXT_PUBLIC_GA4_ID`)
- **Google Consent Mode v2 compliance** — consent defaults were set inside the
  GTM `onLoad` callback (after GTM fired); moved to a `beforeInteractive` inline
  script in `layout.tsx` so defaults are established before any tags execute
- **Broken `trackPageView`** — called `gtag('config', '')` with an empty string
  because `NEXT_PUBLIC_GA_ID` was never defined; removed the broken export;
  `useConsentAwareTracking` now exposes only `trackEvent`
- **Reactive consent updates** — `gtag('consent', 'update', …)` is now fired
  from a `useEffect` in `ConsentAwareAnalytics` whenever consent preferences
  change, replacing the previous one-time `onLoad` callback
- Renamed `GA4_ID` → `NEXT_PUBLIC_GA4_ID` and `GTM_ID` → `NEXT_PUBLIC_GTM_ID`
  in `.env.local`
- **Ad components bypass consent gate** — `BannerAd`, `SidebarAd`, `RectangleAd`,
  and `InFeedAd` now each call `useConsentCheck()` and skip `pushAd` until
  `hasConsent && canUseMarketing` — prevents ad loads before user decides
- **Article page ad slots not in config** — `ARTICLE_RECTANGLE` and
  `ARTICLE_BANNER_BOTTOM` slot IDs added to `AD_CONFIG.AD_SLOTS`; article page
  now references named constants instead of raw string literals
- **Hardcoded AdSense publisher ID** — removed `'ca-pub-…'` fallback from
  `adConfig.ts`, `adsenseInit.ts`, and both layout files; all now use
  `NEXT_PUBLIC_GAS_ID` only (fails loudly if env var is missing)
- **`acceptAll` forced full page reload** — `window.location.reload()` removed
  from consent context; Consent Mode v2's `gtag('consent', 'update')` (already
  called in `consentStorage.saveConsent`) handles dynamic updates without reload
- **AdSense script torn down on route change** — removed `useEffect` cleanup
  that removed the `<script>` tag on unmount; the script is a persistent global
  resource that must survive route changes

### Added
- **Ad lazy loading** — `BannerAd`, `SidebarAd`, `RectangleAd`, and `InFeedAd`
  now use `IntersectionObserver` with `AD_CONFIG.PERFORMANCE.LAZY_LOAD_MARGIN`
  (`200px`) to defer `pushAd` until the container approaches the viewport,
  reducing initial page load impact for below-fold ad placements
- **`.env.example`** — created with all required env vars documented, including
  `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`, and `NEXT_PUBLIC_GAS_ID` with
  descriptions and where to find each value

---

## [2.2.0] — 2026-03-14 — Best Practices Refactor & Performance Upgrade

### Summary
Full migration to Sanity Live Content API for real-time UI updates, a
complete rich text renderer overhaul, and a series of best-practice fixes
across data fetching, caching, and article presentation.

### Added
- **Sanity Live Content API** — all 21 server pages and components now use
  `sanityFetch` from `next-sanity/live`. Content published in Sanity Studio
  appears on the site immediately with no rebuild or manual revalidation.
- **Rich text renderer** — full `RichTextComponents` coverage:
  - `table` block type with branded header row and striped body rows
  - `code` block type with `vscDarkPlus` syntax highlighting and language label
  - `mermaidDiagram` block type (code-block fallback until mermaid pkg added)
  - `blockquote` block style with untele red left border
  - `normal` paragraph block, `break` block
  - Inline marks: `em`, `strong`, `underline`, `strikethrough`, `superscript`,
    `subscript`, `code` (styled `<code>` tag)
- **NavWrapper** — migrated from raw `sanityClient.fetch()` to live `sanityFetch`

### Fixed
- **`defineLive` misconfiguration** — token was inside `client.withConfig()`
  instead of `serverToken`/`browserToken` options; `<SanityLive />` had no
  credentials to open the browser-side EventSource subscription
- **`perspective: 'previewDrafts'` hardcoded** — was serving draft content to
  all production users; removed so `defineLive` manages perspective internally
- **`experimental_taintUniqueValue` conflict** — was silently blocking
  `browserToken` from reaching the client; sourced directly from `process.env`
  in `live.ts` to bypass the taint check
- **Inline `code` mark** — was incorrectly using `SyntaxHighlighter`; now uses
  a styled `<code>` tag as intended
- **Article byline** — Reviewed By repositioned from the date/location row to
  sit directly next to the author card

### Changed
- Music detail pages (`albums/`, `lyrics/`, `music-artists/`) — removed
  `'use cache'` / `cacheTag` / `cacheLife` wrappers; live API handles cache
  invalidation via EventSource, making per-function caching redundant
- `SyntaxHighlighter` theme updated from `dark` to `vscDarkPlus`
- All `sanityFetch` call sites updated to destructure `{ data }` from the
  live API return value

---

### Sanity Live Content API — Real-Time UI Updates (2026-03-14)

Closes [#6](https://github.com/UnTelevised-Media/untelevised-media-new/issues/6)

#### Summary
All server-rendered pages and components now use the Sanity Live Content API
(`sanityFetch` from `lib/live.ts` / `next-sanity/live`). The `<SanityLive />`
component was already mounted in both `(user)` and `(music)` layouts; this
change wires every data query into the live system so that content published
in Sanity Studio appears on the site immediately — no rebuild or manual
revalidation required.

#### Changed — Data Fetching (21 files)
- Replace `import sanityFetch from '@/lib/sanity/lib/fetch'` (legacy ISR) with
  `import { sanityFetch } from '@/lib/sanity/lib/live'` (live API) across all
  server pages and components
- Destructure `{ data }` from the live `sanityFetch` return value at every call
  site (live API returns `{ data, sourceMap, tags }` instead of raw data)
- Remove `as Promise<T>` type casts no longer needed after the destructuring change

#### Changed — NavWrapper
- `src/components/global/NavWrapper.tsx`: migrated from raw `sanityClient.fetch()`
  to live `sanityFetch` so the navigation categories update in real time

#### Changed — Music Detail Pages
- `src/app/(music)/albums/[slug]/page.tsx`
- `src/app/(music)/lyrics/[slug]/page.tsx`
- `src/app/(music)/music-artists/[slug]/page.tsx`
  - Removed `'use cache'` / `cacheTag` / `cacheLife` wrappers (from `next/cache`)
  - Replaced direct `sanityClient.fetch()` calls with live `sanityFetch`
  - Live API handles cache invalidation via EventSource; per-function caching
    was redundant and prevented real-time updates

#### Not Changed (intentional)
- `generateStaticParams()` in all dynamic routes — continues to use direct
  `sanityClient.fetch()` to avoid `draftMode()` during static generation
- `src/components/global/Ticker.tsx` — client component; cannot use server-side
  `sanityFetch`; polling via direct client call is retained
- Metadata utility functions — run at build/revalidation time, direct calls appropriate

---

### Schema-to-UI Data Pass + Site Config (2026-03-14)

#### Queries — Bug Fixes
- Fix `queryEventBySlug`: `tag[]->` → `eventTag[]->` — was silently returning null for all event tags
- Fix `queryAllAuthors`: remove nonsensical `author->` self-reference; correct sort to `order(order desc)`

#### Queries — New Fields
- `queryLiveEvents` (current events listing): add `endDate`, `eventStatus`, `mainImage`, `subtitle`, `videoLink` — homepage `LiveWidget` now receives full event data
- `queryArticleBySlug`: add `reviewedBy->{ name, slug, title, image }` and explicit `corrections` field

#### Article Detail Page (`articles/[slug]`)
- Render **Reviewed By** link in byline when `reviewedBy` is set
- Render **Corrections** notice block (red left-border alert) above article body when the field has content
- Render **Sources** list with external links after article body
- Render **FAQs** definition list after sources — surfaces structured Q&A already powering FAQPage JSON-LD

#### Live Event Detail Page (`live-event/[slug]`)
- Render `subtitle` below the event title
- Render `eventStatus` badge: red for Cancelled, amber for Postponed, blue for Moved Online (no badge for Scheduled)
- Render `endDate` alongside start date in the header
- Fix JSON-LD `eventStatus`: now maps from CMS `eventStatus` field to correct `schema.org` URL instead of hardcoding based on `isCurrentEvent`

#### Category Page (`category/[slug]`)
- Fetch category object in parallel with articles (single extra query, no waterfall)
- Render category `title` as `<h1>` and `description` above the article grid
- Fix typo in container class: `95wv` → `95vw`

#### TypeScript Types (`types.d.ts`)
- Add `endDate?: string` to `LiveEvent` interface
- Add `eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventMovedOnline'` to `LiveEvent` interface

#### Social Media — Account Updates
- YouTube: `@UnTelevised` → `@AntiWarTV` (banned, new account)
- TikTok: `@untelevisedmedia` → `@radical.edward` (banned, new account)
- Updated in: `Footer.tsx`, `Socials.tsx`, `GlobalStructuredData.tsx` (sameAs array — TikTok also added)

#### Email — Domain Migration
- `newsroom@untelevised.live` → `newsroom@untelevised.media` (all 5 footer contact links)
- `UnTelevisedMedia.Live@gmail.com` → `support@untelevised.media` (donate page + support page)
- Addresses to provision: `newsroom@untelevised.media`, `support@untelevised.media`

#### Live News Banner
- Remove `<Banner />` from `(user)/layout.tsx` — was appearing on every page
- Add `<Banner />` to top of `(user)/page.tsx` — now homepage-only

#### Project Docs
- Add `.project/email-addresses.md` — inventory of all hardcoded email addresses with file locations and purpose

---

### Audit — Second Pass (2026-03-13)

Full second-pass audit against Next.js, Sanity, SEO/AEO, and Vercel/React best-practice skills. All prior items confirmed complete. New open items surfaced and logged in `.project/planning/audit/` and `.project/planning/checklist.md`.

#### Open — P2
- `notFound()` missing on 6 dynamic routes: `author/[slug]`, `live-event/[slug]`, `albums/[slug]`, `lyrics/[slug]`, `music-artists/[slug]`, `category/[slug]` — all currently return inline "not found" divs instead of triggering the proper Next.js 404 mechanism
- JSON-LD `MusicAlbum` structured data missing from `albums/[slug]`
- JSON-LD `MusicComposition` structured data missing from `lyrics/[slug]`
- JSON-LD `MusicGroup`/`Person` structured data missing from `music-artists/[slug]`
- `albums/[slug]` `generateMetadata` emits `keywords` as a template-literal string instead of `string[]`

#### Open — P3
- JSON-LD `ItemList`/`CollectionPage` structured data missing from `timeline/[slug]`
- JSON-LD `CollectionPage` structured data missing from `category/[slug]`

---

### Sanity TypeGen

- Add `sanity.config.ts` at project root (CLI-only config — no `'use client'`, no `@/` aliases) to enable `pnpm sanity typegen generate` without conflicts with the embedded studio config
- Move `sanity.cli.ts` to project root (was at `src/lib/sanity/sanity.cli.ts`)
- Generate `sanity.types.ts` at project root — 59 typed GROQ queries, 50 schema types; replaces hand-written TypeScript interfaces
- Rename 9 files with duplicate GROQ variable names (`query` → descriptive unique names) to reach 0 TypeGen warnings; affected: author, category, live-event, policies, timeline, timeline-category, timeline-event slug pages; `getAllUrls.ts`; `generateBlogCatMetadata.ts`; `generateMetadata.ts`

---

### Sanity Schema — Article

- Add `leadParagraph` field (`type: 'text'`, 3 rows) — plain-text 2–3 sentence summary for AI extraction and featured snippets
- Add `faqs[]` field — array of `{ question, answer }` objects for FAQPage schema.org structured data
- Add `relatedArticles[]` reference array field (max 5) — links to related article documents
- Add `reviewedBy` reference field — editorial reviewer / fact-checker author reference
- Migrate `keywords` field from `type: 'string'` → `type: 'array'` of strings with tags layout (type a keyword and press Enter or comma to add)
- Create `migrations/keywords-string-to-array/index.ts` — splits existing comma-separated keyword strings into arrays on migration run
- Update `buildArticleMetadata` in `src/util/metadata.ts` to use keywords array directly (removes `.split(',')` splitting)
- Update `NewsArticleStructuredData` to join keywords array for output

---

### Sanity Schema — Live Event & Other Types

- Add `endDate` (`datetime`) field to `liveEvent` schema for complete schema.org Event structured data
- Add `eventStatus` field to `liveEvent` — string enum: EventScheduled / EventCancelled / EventPostponed / EventMovedOnline; default: EventScheduled
- Add `seoObject` field to: `liveEvent`, `category`, `musicArtist`, `album`, `song` schemas — consistent per-document SEO override fields across all content types

---

### Sanity Studio

- Add `siteSettings` singleton to Studio desk structure via `S.listItem()` — accessible at top level for global brand config management

---

### SEO & Metadata

#### Structured Data Fixes
- Wire `dateModified` from `article.updatedAt` into `NewsArticleStructuredData` — was previously using `publishedAt` for both dates
- Ensure all structured data `@id` and URL fields use trailing slashes (matches `trailingSlash: true` in `next.config.ts`)
- Render `FAQPage` structured data inside `NewsArticleStructuredData` when `article.faqs` is present — high AEO value for AI citation
- Add `Person` structured data JSON-LD to `/author/[slug]` pages — `@type: 'Person'`, `worksFor`, `sameAs`, `knowsAbout` fields

#### Static Page Metadata
- Add `export const metadata` to `/about` — "About UnTelevised Media"
- Add `export const metadata` to `/staff` — "Our Team — UnTelevised Media"
- Add `export const metadata` to `/donate` — "Support Independent Journalism"
- Add metadata via `layout.tsx` to `/support`, `/secure-contact`, `/whistleblower`, `/join` (client component pages; metadata in parent layout is the correct Next.js pattern)
- Add `export const metadata` to `/lyrics` (index) and `/music-artists` (index) music listing pages

#### OG Image
- Add `/public/og-default.png` — 1200×630 branded fallback OG image for pages without a specific image
- Update root `layout.tsx` OG image reference from `og-default.jpg` → `og-default.png`

---

### Article Page

- Expand `queryArticleBySlug` GROQ to include: `seo`, `faqs`, `sources`, `updatedAt`, `leadParagraph`, `relatedArticles[]->` (with `_id`, `title`, `slug`, `mainImage`, `description`, `publishedAt`, `author->`)
- Render Related Articles section at the bottom of article pages when `relatedArticles` is populated
- Display "Updated: {date}" near byline when `article.updatedAt` differs from `article.publishedAt`

---

### Performance

#### Server Component Architecture
- Server-hoist logo: extract `<Image>`, `<Link>`, gradient decorations from client `Header` into new `HeaderLogo` server component (`src/components/global/HeaderLogo.tsx`) — logo no longer re-renders on every client interaction
- Pass `HeaderLogo` as `logoSlot` prop to client `Header` — clean server/client composition pattern applied in `(user)/layout.tsx` and `(music)/layout.tsx`
- Remove unused `localFont` declarations for Geist Sans and Geist Mono from `src/app/layout.tsx` — Inter (via `next/font/google`) was already the active font; body `className` simplified

#### Suspense & Streaming
- Wrap `FeaturedStoriesGrid` in `<Suspense>` on homepage — was blocking full-page render on slow Sanity fetch

#### LQIP Blur Placeholders
- Add `placeholder="blur"` + `blurDataURL` (20px Sanity thumbnail) to hero images on: homepage featured stories (`page.tsx`), article hero (`articles/[slug]/page.tsx`), author hero (`author/[slug]/page.tsx`) — reduces CLS on image load

#### Cache & Static Generation
- Fix `generateStaticParams` in `/articles/[slug]` — replace raw `sanityClient.fetch` with `sanityFetch` to keep static params consistent with tag-based ISR revalidation
- Add `generateStaticParams` to all music dynamic routes (`lyrics/[slug]`, `music-artists/[slug]`, `albums/[slug]`) — enables static generation at build time
- Migrate all 3 music dynamic routes to `'use cache'` directive with `cacheTag` (per-document + type-level) and `cacheLife('hours')` — replaces ISR on music pages with fine-grained per-function cache control
- Enable `experimental.useCache: true` in `next.config.ts` to activate `'use cache'` directive, `cacheTag()`, and `cacheLife()` from `next/cache`

---

### Performance

#### Bundle Size / Waterfalls
- Remove unused `categories` fetch from homepage `Promise.all` — eliminates one extra Sanity round-trip on every homepage load
- Defer `CookieConsentBanner` and `AdBlockerMessage` (framer-motion) via `next/dynamic` — code-splits framer-motion out of the initial JS bundle on every page
- Defer `TimelineJSVisualization` (framer-motion) via `next/dynamic` on timeline pages — only loads when a timeline page is visited
- Defer `react-tweet` `Tweet` component and `react-syntax-highlighter` `Prism` via `next/dynamic` in `RichTextComponents` — only loaded when article body contains those block types
- Remove unused `styled-components` and `@types/styled-components` from `package.json`

#### Images / Re-renders
- Add `priority` to author hero photo on `/author/[slug]` — was LCP image without preload hint
- Add `sizes` prop to homepage featured stories grid — prevents browser from fetching oversized images
- Fix `Header.tsx` scroll handler: `requestAnimationFrame` throttle + `{ passive: true }` listener — eliminates forced reflows on scroll
- Wrap `getArticleBySlug` and `getAuthorBySlug` in `React.cache()` — `generateMetadata` and the page component now share a single fetch per request instead of making two round-trips

#### Tooling
- Enable `typedRoutes: true` in `next.config.ts` experimental — catches broken internal `<Link href>` at build time
- Wire up `@next/bundle-analyzer` (already installed) via `withBundleAnalyzer()` wrapper in `next.config.ts`
- Add `analyze` npm script — run `npm run analyze` to open interactive bundle treemap

### SEO & AEO

#### Added
- Event schema.org structured data on `/live-event/[slug]` pages (eventStatus, location, organizer, image)
- Canonical URL, Twitter card, and `alternates.canonical` to `/music-artists/[slug]` metadata
- Canonical URL, Twitter card, and `alternates.canonical` to `/albums/[slug]` metadata
- New Sanity schema `seoObject` — reusable SEO object with metaTitle, metaDescription, ogImage, noIndex, canonicalUrl fields; added to `article` schema
- New Sanity schema `siteSettings` — singleton for global brand config (name, description, logo, social links, foundingDate, defaultOgImage)
- EEAT fields on `article` schema: `location`, `updatedAt`, `corrections`, `sources[]`
- EEAT fields on `author` schema: `credentials[]`, `expertise[]`, `sameAs[]`, `location`, `isActive`
- `GlobalStructuredData` component — NewsMediaOrganization + WebSite + SearchAction schema.org rendered in `(user)/layout.tsx`
- `NewsArticleStructuredData` component — NewsArticle + BreadcrumbList schema.org on every article page
- `generateMetadata()` to `/articles/[slug]` — unique title, description, OG image, canonical URL per article
- `generateMetadata()` to `/live-event/[slug]` — per-event metadata with live status in title
- `generateMetadata()` to `/category/[slug]` — per-category metadata using new `queryCategoryBySlug`
- `generateMetadata()` to `/author/[slug]` — per-author metadata with OG profile image
- `queryCategoryBySlug` GROQ query for category metadata fetches
- Canonical URL, Twitter card, and `alternates.canonical` to `/lyrics/[slug]` metadata
- `src/util/metadata.ts` — shared helpers: `getCanonicalUrl`, `getSanityOgImageUrl`, `truncate`, `buildArticleMetadata`, `buildLiveEventMetadata`, `buildCategoryMetadata`, `buildAuthorMetadata`

#### Fixed
- Update `next-sanity` v12 import paths: `VisualEditing` now from `next-sanity/visual-editing`, `defineLive` now from `next-sanity/live`
- Replace boilerplate "Next.js 15 Boilerplate" root layout metadata with UnTelevised Media branding
- Replace inline `notFound()` div fallback with proper `notFound()` from `next/navigation` in `/articles/[slug]`
- Fix `StructuredData.tsx` — replace `next/script` with plain `<script>` tags for inline JSON-LD (correct RSC pattern)
- Fix `sitemap.ts` — homepage priority `0.3` → `1.0`, article priorities now recency-based (`0.8/0.6/0.4`), live events `0.9`, all URLs use trailing slashes, added missing static pages (`/about/`, `/staff/`, `/donate/`, `/past-events/`)
- Fix `robots.ts` — add `Disallow: /api/`, fix `BASEURL` with fallback to `NEXT_PUBLIC_APP_URL` then hardcoded production URL, explicitly allow all major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, anthropic-ai, cohere-ai)

---

### Sanity Schema — Live Event Keywords

- Migrate `liveEvent.keywords` field from `type: 'string'` → `type: 'array'` of strings with tags layout (consistent with article keywords)
- Create `migrations/liveEvent-keywords-string-to-array/index.ts` — splits existing comma-separated strings into arrays on migration run; skips documents already holding an array
- Update `buildLiveEventMetadata` in `src/util/metadata.ts` — use keywords array directly, remove `.split(',')` splitting
- Update `generateLiveEventMetadata` in `src/util/metadata/generateLiveEventMetadata.ts` — same array-aware fix

---

### Production Data Migrations

- Run `keywords-string-to-array` against `articles` dataset — 41 documents scanned, 25 article documents patched (keywords field converted from comma-separated string to array)
- Run `liveEvent-keywords-string-to-array` against `articles` dataset — 5 liveEvent documents scanned and patched

---

### SEO & Metadata — seoObject Override Wiring

- Wire `seo.metaTitle`, `seo.metaDescription`, `seo.canonicalUrl`, `seo.ogImage` overrides into `buildLiveEventMetadata` — per-event Studio overrides now take precedence over computed defaults
- Wire `seo` overrides into `buildCategoryMetadata` — per-category Studio SEO fields now applied
- Wire `seo` overrides into `generateMetadata` for `/lyrics/[slug]` — `song.seo?.metaTitle ?? computedTitle` pattern
- Wire `seo` overrides into `generateMetadata` for `/music-artists/[slug]` — same pattern
- Wire `seo` overrides into `generateMetadata` for `/albums/[slug]` — same pattern
- Add `seo` field to `queryCategoryBySlug` GROQ projection — was previously not returned from Sanity

---

### TypeScript Types

- Add `SeoOverride` interface to `types.d.ts` — shared type with `metaTitle?`, `metaDescription?`, `ogImage?`, `noIndex?`, `canonicalUrl?` fields
- Add `seo?: SeoOverride` to `LiveEvent`, `Category`, `MusicArtist`, `Album`, `Song` global interfaces
- Correct `Article.keywords` type from `string` → `string[]` in `types.d.ts` (was mismatched with schema)
- Correct `LiveEvent.keywords` type from `string` → `string[]` in `types.d.ts`

---

## 2026-03-16 — Production Incident: Sanity Live API Hang → 502

### Fixed
- Production site intermittently returning blank page + HTTP 502 (no logs, no HTML)
  - **Root cause:** `sanityFetch` from `next-sanity`'s `defineLive` (`vX` API) would hang
    indefinitely when the Sanity Live Content API was slow or unresponsive. With no timeout,
    Vercel's 30-second serverless function ceiling would kill the request → 502. Local dev was
    unaffected because there is no timeout in `next dev`.
  - **Diagnosis path:** Vercel logs showed 200 OK at 99ms (ISR PRERENDER cache hits), but fresh
    renders triggered by ISR revalidation would hang. Confirmed not a Sanity quota issue, not a
    missing env var issue. Pattern: works when cache is warm, 502s when cache expires and a
    fresh server render is needed.
  - `src/lib/sanity/lib/live.ts` — wrapped `sanityFetch` in `Promise.race` with an 8-second
    timeout; throws a descriptive error logged to Vercel function logs instead of silently hanging
  - `src/components/global/NavWrapper.tsx` — added try/catch; falls back to empty category list
    so the nav renders rather than crashing the layout on fetch failure
  - `src/components/global/BreakingNewsBanner.tsx` — added try/catch; returns null (no banner)
    on fetch failure rather than propagating an error through the layout

---

## 2026-03-16 — Sprint 1: Security, SEO & Editorial Tools

### Removed
- All debug routes, components and API endpoint (Issue #15, PR #28)
  - Deleted `src/components/debug/` — 6 components: AdDebugger, TestAd, TestAdComponent, AdSenseTestComponent, AdSenseTroubleshooter, ConsentDebugger
  - Deleted `/timeline-debug` and `/timeline-simple-test` public routes
  - Deleted `src/app/api/debug-log/route.ts` — unauthenticated POST endpoint
  - Removed unconditional `<AdDebugger />` render from music layout
- Removed decorative `Banner` component from homepage (consolidated in #12 work)

### Added
- RSS Feed `/feed.xml` — RFC-compliant RSS 2.0 route handler (Issue #9, PR #30)
  - Latest 50 articles + latest 20 live events, merged and date-sorted
  - Live events include `🔴 LIVE:` title prefix, newsroom attribution, `'Live Coverage'` category
  - `media:content` image elements via `urlForImage`; RFC 2822 pubDate
  - `s-maxage=3600` CDN cache + hourly ISR revalidation
  - RSS auto-discovery `<link>` added to root layout metadata
  - Better Comments `// !` TODO markers at all rename touchpoints for future `liveEvent → breaking` migration
- Breaking News Banner (Issue #12, PR #31)
  - Editor-controlled site-wide alert via Sanity `siteSettings.breakingNewsBanner` singleton
  - Fields: `isActive`, `headline`, `linkUrl`, `linkLabel`, `expiresAt` (auto-expire)
  - Instant live updates via `sanityFetch` from `lib/live` + `SanityLive` — no page refresh needed
  - Per-session dismiss via `sessionStorage`; key derived from headline (resets on new headline)
  - Positioned below `<NavWrapper />` (under category nav)
  - Server-side `expiresAt` guard + client-side secondary guard
  - Accessible: `role="alert"`, `aria-label`, keyboard-navigable dismiss with focus ring
  - Fixed: More dropdown `pointer-events-none` when hidden to prevent hover bleed into banner area
- Reading Time Estimate (Issue #20, PR #32)
  - `src/lib/readingTime.ts` — `estimateReadingTime(body, extras?)` at 200 wpm (standard average adult pace), minimum 1 min
  - Article detail page counts body + FAQ questions/answers + source labels via `extras` param
  - `readingTimeFromWordCount()` for GROQ-projected `wordCount` on card components
  - `"wordCount": length(string::split(pt::text(body), " "))` — actual word count (not char count)
  - `wordCount?: number` added to global `Article` type in `types.d.ts`
  - Displayed on: article detail page, `FeaturedArticleCard`, featured stories grid, `ArticleCard`, `RawFeed`

### Changed
- Sitemap completion (Issue #16, PR #29)
  - Added static pages: `/timelines`, `/join`, `/support`, `/secure-contact`, `/whistleblower`
  - Added dynamic timeline individual pages via new `queryTimelines` in `getAllURLs.ts`
  - `robots.ts`: added `Disallow` for `/privacy-settings`, `/reading-list`, `/unlock`; `Allow: /feed.xml`
  - `privacy-settings/layout.tsx`: added `noindex` metadata (page is `'use client'`, metadata via layout)

---

## [2.2.1] — 2026-03-16

### Fixed
- AdSense article page slot IDs updated to verified ad units
- `notFound()` fixes on article/category/timeline pages
- Music/category/timeline JSON-LD structured data improvements

---
