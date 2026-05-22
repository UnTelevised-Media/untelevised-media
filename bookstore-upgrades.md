# Hurriya Publications — Feature Upgrade Implementation Plan
*May 2026 — 6 features across bookstore, sharing, newsletter, and email*

---

## Feature 1 — Gift Purchasing

### What it does
A "Buy as a Gift" toggle on the book detail page lets a buyer send the download directly to someone else. The buyer gets a receipt; the recipient gets a gift notification email with no pricing — and optionally, the buyer can choose to identify themselves or stay anonymous.

### Current state
- No gift flow exists anywhere
- Guest download token system (`guest_download_tokens` table) already handles emailing download links to arbitrary addresses — the webhook just needs to use the recipient email instead of the buyer's

### Data flow
1. Buyer toggles "Buy as a Gift" on the book detail page
2. Recipient email field appears; buyer optionally fills in "From" name or leaves anonymous
3. On checkout: `gift_recipient_email`, `gift_from_name` (nullable), `gift_anonymous` (boolean) passed as Stripe session metadata alongside existing metadata
4. Stripe webhook receives `checkout.session.completed` with gift metadata
5. Webhook sends:
   - **Buyer** → standard order confirmation receipt (no gift recipient info)
   - **Recipient** → new gift email template: book title, cover art, "Someone sent you a book", download button, optional "From: [name]" or "From: A friend". No pricing.
6. Guest download token is created with `recipient_email` — same 14-day expiry, same single-use logic

### Files to create
- `src/components/bookstore/GiftToggle.tsx` — client component: checkbox → reveals recipient email + optional from-name field + anonymous checkbox. Exposes `{ isGift, recipientEmail, fromName, anonymous }` via props/callback.
- `src/lib/bookstore/email.ts` → add `sendGiftEmail(params)` — new template function. Uses existing `emailLayout()`. Shows book cover (if URL available), title, author, gift message, and a large download button. No price, no order number visible to recipient.

### Files to modify
| File | Change |
|---|---|
| `src/app/(user)/bookstore/book/[slug]/page.tsx` | Add `<GiftToggle>` below the format selector, above the tip row. Pass gift state down to `<BuyNowButton>` and `<AddToCartButton>` via props. |
| `src/components/bookstore/BuyNowButton.tsx` | Accept optional `giftOptions?: { recipientEmail: string; fromName?: string; anonymous: boolean }`. Include in `CheckoutPayload` sent to `/api/bookstore/checkout`. |
| `src/app/api/bookstore/checkout/route.ts` | Extract `gift_recipient_email`, `gift_from_name`, `gift_anonymous` from request body. Pass into Stripe session `metadata`. Validate recipient email format if present. |
| `supabase/functions/stripe-webhook/index.ts` | On `checkout.session.completed`: if `metadata.gift_recipient_email` is set, create guest token with recipient email; call `sendGiftEmail()` to recipient; send standard order confirmation to buyer only. |
| `src/lib/bookstore/email.ts` | Add `sendGiftEmail()` function. Template: Hurriya header, "You've received a gift" heading, book title + cover image, optional "From: [name]" or "From: A friend", large "Download Your Book →" button, Hurriya footer. |
| `src/lib/bookstore/types.ts` | Add optional `giftOptions` to `CheckoutPayload` and `CheckoutLineItem`. |

### Notes
- `AddToCartButton` does not need gift support — gift flow only makes sense as an immediate checkout (you can't add a gift to your own cart). Hide the gift option when the user selects "+ Cart" rather than "Buy Now".
- The "anonymous" flag should default to false. If true, the gift email says "From: A friend" regardless of `fromName`.

---

## Feature 2 — Unified Social Sharing

### What it does
The `SocialShare` component already exists and is already on article pages, album pages, and song/lyrics pages. The book detail page is missing it. The plan is to add it to books — no refactoring needed since the component already accepts generic `url` and `title` props.

### Current state
- `src/components/global/SocialShare.tsx` — fully built, 13+ platforms (Facebook, Messenger, Twitter/X, Mastodon, Reddit, LinkedIn, Pinterest, Tumblr, Flipboard, Telegram, WhatsApp, SMS, Email, copy-to-clipboard)
- Already used: article detail pages, `src/app/(music)/albums/[slug]/page.tsx` (line 426–429), `src/app/(music)/lyrics/[slug]/page.tsx` (line 432–435)
- Music artist pages and album/song list pages do not have it — those are browse pages, not detail pages, so that's appropriate

### Files to modify
| File | Change |
|---|---|
| `src/app/(user)/bookstore/book/[slug]/page.tsx` | Import `SocialShare`. Add it after the revenue sharing breakdown, before the author bio section. Pass `url={absoluteBookUrl}` and `title={book.title}`. Construct the absolute URL from `process.env.NEXT_PUBLIC_PRODUCTION_URL + '/bookstore/book/' + book.slug.current`. |

### That's it
The component handles all platforms, dark mode, icons, and copy-to-clipboard. No other files need changing — music pages already have it, article pages already have it.

---

## Feature 3 — Bookstore Newsletter Signup

### What it does
A public email capture for the Hurriya Publications mailing list — "Get notified when new books are added." Separate from the main UnTelevised news newsletter. Reuses the newsletter signup component pattern from the news site. Admin views subscribers in the portal.

### Current state
- `src/models/schema/newsletterSubscribe.ts` — **news newsletter schema** (type: `newsletterSubscribe`, fields: email, submittedAt). This is the news list — do not reuse it for bookstore.
- `src/app/(portal)/portal/subscribers/page.tsx` — portal viewer for news subscribers
- `src/components/portal/SubscribersList.tsx` — generic subscriber list table component (accepts any `{ _id, email, submittedAt }[]`)
- No API endpoint for newsletter signups exists yet
- No frontend signup form component exists yet

### New Sanity schema
**File to create:** `src/models/schema/bookstoreSubscriber.ts`
```typescript
// type: 'bookstoreSubscriber'
// fields: email (string, required, unique-ish), submittedAt (datetime), source (string — 'bookstore-home' | 'bookstore-about' | 'book-detail')
```
- Register in `src/models/schema/index.ts` alongside `newsletterSubscribe`
- Portal GROQ query: add `queryPortalBookstoreSubscribers` to `src/lib/portal/queries.ts`

### API route
**File to create:** `src/app/api/bookstore/newsletter/route.ts`
- `POST` — accepts `{ email, source? }`, validates email format, calls Sanity `writeClient.create({ _type: 'bookstoreSubscriber', email, submittedAt: new Date().toISOString(), source })`. Returns `{ ok: true }` or `{ error }`. Rate-limit with the existing pattern (5 submissions / 60s per IP using Upstash). Check for duplicate email with a GROQ query before writing.

### Frontend component
**File to create:** `src/components/bookstore/BookstoreNewsletter.tsx`
- Client component. Email input + "Notify Me" submit button.
- Calls `POST /api/bookstore/newsletter`.
- States: idle → loading → success ("You're on the list") → error.
- Styled in Hurriya aesthetic: `border border-[#009736]`, green submit button, `text-[10px] font-black uppercase tracking-widest` label.
- Accepts a `source` prop (string) passed through to the API for tracking where signups come from.

### Placement
| Location | Where |
|---|---|
| `src/app/(user)/bookstore/page.tsx` | Add `<BookstoreNewsletter source="bookstore-home" />` below the main book grid, above the footer. |
| `src/app/(user)/bookstore/about/page.tsx` | Add after the "Where We're Going" section, before the Hurriya word mark. |

### Portal
**File to create:** `src/app/(portal)/portal/bookstore-subscribers/page.tsx`
- Editor+ role gate (same pattern as `/portal/subscribers/page.tsx`)
- Fetches `bookstoreSubscriber` documents
- Reuses `<SubscribersList>` component — it already accepts any `{ _id, email, submittedAt }[]`, no changes needed
- Add link to portal navigation

---

## Feature 4 — Book Wishlist

### What it does
Readers can star books to save them for later. Works for all users (localStorage) and syncs to Sanity for signed-in users — exactly mirroring how article bookmarks work. Uses a star icon (not a bookmark) to visually distinguish from article saves.

### Current state — article bookmark system (to mirror)
- `src/components/bookmarks/BookmarkButton.tsx` — renders bookmark icon, handles toggle with optimistic UI
- `src/hooks/useBookmarks.ts` — unified hook: localStorage for guests, Sanity for auth users, auto-syncs on sign-in
- `src/lib/bookmarks/storage.ts` — localStorage read/write helpers
- `src/lib/bookmarks/actions.ts` — Sanity server actions (getServerBookmarks, add, remove, sync)
- `src/models/schema/userBookmark.ts` — Sanity schema: `clerkUserId, slug, title, description, imageUrl, authorName, publishedAt, readingTime, bookmarkedAt`
- Document ID pattern: `userBookmark_{sanitizedUserId}_{sanitizedSlug}`

### New Sanity schema
**File to create:** `src/models/schema/userWishlist.ts`
```typescript
// type: 'userWishlist'
// fields: clerkUserId (required), slug (required), title (required), coverImageUrl (string), authorName (string), price (number), addedAt (datetime, required)
// Document ID pattern: userWishlist_{sanitizedUserId}_{sanitizedSlug}
```
Register in `src/models/schema/index.ts`.

### New localStorage key
`'untele_wishlist'` — separate from `'untele_bookmarks'` used by articles.

### Files to create
- `src/lib/wishlist/storage.ts` — mirrors `src/lib/bookmarks/storage.ts` but uses `untele_wishlist` key. Store items as `{ slug, title, coverImageUrl, authorName, price, addedAt }`.
- `src/lib/wishlist/actions.ts` — mirrors `src/lib/bookmarks/actions.ts` using `userWishlist` documents and `writeClient`.
- `src/hooks/useWishlist.ts` — mirrors `src/hooks/useBookmarks.ts`: localStorage for guests, Sanity for auth users, auto-sync on sign-in.
- `src/components/bookstore/WishlistButton.tsx` — mirrors `BookmarkButton.tsx` but uses a **star icon** (`lucide-react`: `Star` / `StarOff` or filled `Star`). Props: `slug, title, coverImageUrl, authorName, price`. Shows filled star when wishlisted, outline when not.

### Files to modify
| File | Change |
|---|---|
| `src/app/(user)/bookstore/page.tsx` → `BookCard` | Add `<WishlistButton>` as an overlay in the top-right corner of the book cover image. Same pattern as how bookmark buttons appear on article cards. |
| `src/app/(user)/bookstore/book/[slug]/page.tsx` | Add `<WishlistButton>` near the book title / format selector area. |
| `src/app/(user)/bookstore/author/[slug]/page.tsx` (`AuthorBookCard`) | Add `<WishlistButton>` to the author page book cards. |

### Wishlist page (optional but recommended)
**File to create:** `src/app/(user)/bookstore/wishlist/page.tsx`
- Client component. Reads from `useWishlist()`. Renders saved books as a list/grid. Empty state with CTA to browse store. Link it from the BookstoreFooterNav and site footer.

---

## Feature 5 — Book Reviews & Reader Testimonials

### What it does
Admin-moderated reader reviews displayed on book detail pages below the author bio. Reviewers submit a name, rating (1–5), and written review. Admin approves in Sanity Studio before they appear publicly.

### New Sanity schema
**File to create:** `src/models/schema/bookReview.ts`
```typescript
// type: 'bookReview'
// fields:
//   book — reference to book document (required)
//   reviewerName — string (required)
//   reviewerLocation — string (optional, e.g. "London, UK")
//   rating — number (1–5, required) — use a validation rule: min(1).max(5)
//   body — text (required, min 20 chars)
//   approved — boolean (default: false) — admin toggles this in Studio
//   submittedAt — datetime (required)
// Preview: "[rating]★ — [reviewerName]" + approved badge
```
Register in `src/models/schema/index.ts`.

### API route
**File to create:** `src/app/api/bookstore/reviews/route.ts`
- `POST` — accepts `{ bookSlug, reviewerName, reviewerLocation?, rating, body }`. Validates all required fields. Looks up book `_id` by slug. Creates `bookReview` document with `approved: false`. Returns `{ ok: true }`. Rate-limit: 3 per hour per IP.
- `GET` — accepts `?bookSlug=...`. Queries approved reviews for that book: `*[_type == "bookReview" && book->slug.current == $slug && approved == true] | order(submittedAt desc)`. Returns array.

### Add to queries
In `src/lib/sanity/lib/queries.ts`, add:
```groq
export const queryApprovedReviewsByBookSlug = groq`
  *[_type == "bookReview" && book->slug.current == $slug && approved == true]
  | order(submittedAt desc) {
    _id, reviewerName, reviewerLocation, rating, body, submittedAt
  }
`
```
Fetch this in parallel with the book query in `book/[slug]/page.tsx` using `sanityFetch` with tag `['bookReview']`.

### Frontend components
**File to create:** `src/components/bookstore/BookReviews.tsx`
- Server component. Accepts `reviews[]` and `bookSlug`. Renders:
  - Star rating display (filled/empty stars from `rating` field)
  - Reviewer name + optional location
  - Review body
  - Submission date (formatted)
  - Empty state: "No reviews yet. Be the first."

**File to create:** `src/components/bookstore/ReviewForm.tsx`
- Client component. Form: name, location (optional), star rating picker (clickable stars), textarea for review body. Submit → `POST /api/bookstore/reviews`. States: idle → submitting → success ("Your review has been submitted and will appear after approval.") → error.

### Files to modify
| File | Change |
|---|---|
| `src/app/(user)/bookstore/book/[slug]/page.tsx` | Fetch approved reviews in parallel with book data. Add `<BookReviews reviews={reviews} bookSlug={slug} />` and `<ReviewForm bookSlug={slug} />` after the author bio section. |

---

## Feature 6 — Email Footer Transactional Disclosure

### What it does
Adds a legally required transactional disclosure line to every Hurriya Publications email. One change to the shared layout function.

### Current state
`src/lib/bookstore/email.ts` — `emailLayout(title, body)` function generates the HTML wrapper used by all 5 email templates. The current footer contains "Unfiltered. Uncensored. Uncompromising." and links to the site and policies.

### Change
In `emailLayout()`, add below the existing footer links:

```html
<tr>
  <td style="padding: 12px 32px; border-top: 1px solid #222222; text-align: center;">
    <p style="margin: 0; font-size: 10px; color: #555555; line-height: 1.6;">
      This is a transactional email related to your Hurriya Publications purchase or account activity.
      If you believe you received this in error, contact
      <a href="mailto:bookstore@untelevised.media" style="color: #D70606;">bookstore@untelevised.media</a>.
    </p>
  </td>
</tr>
```

### Files to modify
| File | Change |
|---|---|
| `src/lib/bookstore/email.ts` | Add disclosure row inside `emailLayout()` footer table, after the existing "Unfiltered. Uncensored. Uncompromising." row. |

---

## Implementation Order

Start with the smallest/most isolated changes first, then move toward the features with more moving parts.

| Order | Feature | Reason |
|---|---|---|
| 1 | Email footer disclosure (Feature 6) | One file, one block of HTML. Done in minutes. |
| 2 | Social sharing on books (Feature 2) | One import, one component. Already built — just needs to be placed. |
| 3 | Bookstore newsletter (Feature 3) | Schema + API route + component + two placements. Self-contained, no dependencies on other features. |
| 4 | Book wishlist (Feature 4) | Mirrors existing bookmark system exactly. New schema + mirrored files + 3 placement points. |
| 5 | Book reviews (Feature 5) | New schema + API + 2 components + parallel fetch on book page. Moderate complexity. |
| 6 | Gift purchasing (Feature 1) | Most moving parts: UI toggle + checkout payload changes + webhook changes + new email template. Do last. |

---

## Files Created / Modified Summary

### New files
```
src/models/schema/bookstoreSubscriber.ts       — Bookstore newsletter schema
src/models/schema/userWishlist.ts              — Book wishlist schema
src/models/schema/bookReview.ts                — Book review schema
src/app/api/bookstore/newsletter/route.ts      — Newsletter signup endpoint
src/app/api/bookstore/reviews/route.ts         — Reviews GET + POST endpoint
src/lib/wishlist/storage.ts                    — Wishlist localStorage helpers
src/lib/wishlist/actions.ts                    — Wishlist Sanity server actions
src/hooks/useWishlist.ts                       — Unified wishlist hook
src/components/bookstore/GiftToggle.tsx        — Gift purchasing toggle UI
src/components/bookstore/WishlistButton.tsx    — Star wishlist button
src/components/bookstore/BookstoreNewsletter.tsx — Email capture form
src/components/bookstore/BookReviews.tsx       — Reviews display (server)
src/components/bookstore/ReviewForm.tsx        — Review submission form (client)
src/app/(user)/bookstore/wishlist/page.tsx     — Wishlist browse page
src/app/(portal)/portal/bookstore-subscribers/page.tsx — Admin subscriber view
```

### Modified files
```
src/lib/bookstore/email.ts                     — emailLayout() footer + sendGiftEmail()
src/lib/bookstore/types.ts                     — giftOptions on CheckoutPayload
src/lib/sanity/lib/queries.ts                  — queryApprovedReviewsByBookSlug + queryPortalBookstoreSubscribers
src/lib/portal/queries.ts                      — Add bookstore subscriber query
src/models/schema/index.ts                     — Register 3 new schemas
src/app/(user)/bookstore/page.tsx              — BookCard wishlist button + newsletter component
src/app/(user)/bookstore/about/page.tsx        — Newsletter component placement
src/app/(user)/bookstore/book/[slug]/page.tsx  — SocialShare + WishlistButton + GiftToggle + BookReviews + ReviewForm
src/app/(user)/bookstore/author page.tsx       — WishlistButton on AuthorBookCard
src/components/bookstore/BuyNowButton.tsx      — giftOptions prop + payload
src/components/bookstore/BookstoreFooterNav.tsx — Add wishlist link
src/components/global/Footer.tsx               — Add wishlist link under Bookstore column
src/app/api/bookstore/checkout/route.ts        — Extract + forward gift metadata
supabase/functions/stripe-webhook/index.ts     — Gift email routing in checkout handler
```
