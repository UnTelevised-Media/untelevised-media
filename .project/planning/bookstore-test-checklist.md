# Bookstore Upgrades — Manual Test Checklist

_feat/bookstore-upgrades-may2026 · May 2026_

Run through every item below before merging. Check each box as you verify it.

---

## Pre-flight

- [x] All Sanity schemas are registered: open `/studio`, confirm `Bookstore Subscriber`, `User Wishlist`, and `Book Review` appear as document types in the Studio sidebar
- [ ] New GROQ queries return data without errors: test `queryApprovedReviewsByBookSlug` and `queryPortalBookstoreSubscribers` from the Sanity Vision panel

---

## Feature 6 — Email Transactional Disclosure

- [ ] Trigger any transactional email (place a test order, request a download, or trigger a refund)
- [ ] Confirm the email footer contains the disclosure line: _"This is a transactional email related to your Hurriya Publications purchase or account activity."_
- [ ] Confirm the `bookstore@untelevised.media` mailto link is present and correctly linked
- [ ] Verify disclosure appears in all 5 email types: order confirmation, digital download, guest download, shipment notification, refund confirmation

---

## Feature 2 — Social Sharing on Books

- [x] Visit any book detail page (e.g. `/bookstore/book/<slug>`)
- [x] Confirm the `SocialShare` component renders after the Revenue Sharing section and before the Author Bio
- [x] Confirm social share buttons are visible and functional (test at least Facebook, Twitter/X, and Copy Link)
- [x] Test in dark mode — icons and buttons should be legible
- [x] Test on mobile viewport — share grid should not overflow

---

## Feature 3 — Bookstore Newsletter

### Signup Form

- [x] Visit `/bookstore` — confirm `BookstoreNewsletter` renders below the book grid
- [x] Visit `/bookstore/about` — confirm `BookstoreNewsletter` renders after the "Where We're Going" section
- [x] Submit with a valid email → "You're on the list." success state appears
- [x] Submit the same email again → error state appears with "You're already on our list!" — no duplicate document created in Sanity
- [x] Submit an invalid email (e.g. `notanemail`) → error state appears with a message
- [x] Submit with empty email → native form validation blocks submission
- [x] Check Sanity Studio → a new `Bookstore Subscriber` document was created with the correct email, `submittedAt`, and `source` (`bookstore-home` or `bookstore-about`)

### API

- [x] `POST /api/bookstore/newsletter` with `{ "email": "test@test.com", "source": "bookstore-home" }` returns `{ ok: true }`
- [x] Repeated call returns 409 `{ error: "You're already on our list!" }` — no duplicate written
- [x] `POST` with malformed JSON returns `400`
- [x] `POST` with invalid email returns `400`

### Portal

- [x] Sign in as editor+ and visit `/portal/subscribers`
- [x] Page shows two sections: "UnTelevised Newsletter" (red left border) and "Hurriya Publications Bookstore" (green left border)
- [x] Each section has its own subscriber count and independent search bar

---

## Feature 4 — Book Wishlist

### WishlistButton

- [x] Visit `/bookstore` — confirm star icon overlays the top-right corner of each book cover
- [x] Click a star → filled amber star appears (optimistic update), click again → outline star returns
- [x] Refresh the page → wishlist state persists (localStorage for guests, Sanity for signed-in)
- [x] Visit any book detail page → star + "Wishlist" label visible near the book title
- [x] Test in dark mode — button contrast is acceptable

### Guest flow (signed out)

- [x] Star several books while signed out
- [x] Open DevTools → Application → Local Storage → confirm `untele_wishlist` key is populated
- [x] Visit `/bookstore/wishlist` → wishlisted books appear as a grid
- [x] Click "View Book" → navigates to the correct book detail page
- [x] Click the star on the wishlist page → book is removed from the list

### Authenticated flow

- [x] Sign in as any user
- [x] Star a book → confirm `userWishlist` document is created in Sanity Studio with correct `clerkUserId`, `slug`, `title`, `price`, `addedAt`
- [x] Sign out → sign back in → wishlisted book is still present (loaded from Sanity)

### localStorage → Sanity sync on sign-in

- [x] Sign out, star 2 books as guest
- [x] Sign in → books should be migrated from localStorage to Sanity; `untele_wishlist` localStorage key should be cleared

### Empty state

- [x] Visit `/bookstore/wishlist` with no items → empty state renders with "Browse Books" CTA

### Footer & nav

- [x] Confirm "Wishlist" link appears in `BookstoreNav` (the Hurriya nav strip)
- [x] Confirm "Wishlist" link appears in the site footer under the Bookstore column
- [x] Both links navigate to `/bookstore/wishlist`

---

## Feature 5 — Book Reviews

### Review Display

- [x] Visit a book detail page with approved reviews → `BookReviews` renders below the Author Bio
- [x] Star ratings display correctly (filled amber / empty grey per rating value)
- [x] Reviewer name, optional location, and formatted date are visible
- [x] Visit a book with no reviews → "No reviews yet. Be the first." empty state shows

### Review Submission

- [x] `ReviewForm` renders below `BookReviews` on every book detail page
- [x] Click a star to set the rating → star highlights correctly, hover works
- [x] Fill in name (required), location (optional), and review body (min 20 chars)
- [x] Submit → "Your review has been submitted and will appear after approval." success state
- [x] Attempt submit with empty name → blocked by native validation
- [x] Attempt submit with fewer than 20 chars in body → submit button remains disabled; char counter shows current length
- [x] Attempt submit with no star selected → submit button remains disabled

### Admin Moderation

- [x] Open Sanity Studio → confirm a `Book Review` document was created with `approved: false`
- [x] Toggle `approved: true` in Studio
- [x] Revisit the book page → approved review is now visible in `BookReviews`

### API

- [x] `GET /api/bookstore/reviews?bookSlug=<slug>` returns only approved reviews
- [x] `POST /api/bookstore/reviews` with valid payload returns `{ ok: true }`
- [x] `POST` with missing `reviewerName` returns `400`
- [x] `POST` with `rating: 6` returns `400`
- [x] `POST` with `body` shorter than 20 chars returns `400`
- [x] `POST` with invalid `bookSlug` returns `404`

---

## Feature 1 — Gift Purchasing

### GiftToggle UI

- [ ] Visit any book detail page with a `stripePriceId` format
- [ ] The "Buy as a Gift" checkbox appears above the format list (inside the Buy section)
- [ ] Checking the box reveals: recipient email field, optional from-name field, anonymous checkbox
- [ ] While gift mode is active, "Add to Cart" button is hidden; "Buy Now" remains visible
- [ ] Unchecking the box hides the fields and restores "Add to Cart"

### Anonymous toggle

- [ ] Check "Send anonymously" → "Your Name" field becomes disabled with placeholder text
- [ ] The gift email should say "From: A friend" (verified in webhook test below)

### Checkout flow

- [ ] Fill in a valid recipient email, optional name, and click "Buy Now"
- [ ] Redirects to Stripe Checkout
- [ ] In Stripe Dashboard → Checkout Session → Metadata → confirm `gift_recipient_email`, `gift_from_name`, `gift_anonymous` are present

### Gift validation

- [ ] Enable gift toggle, leave recipient email blank → "Buy Now" click with empty email → form validation blocks or API returns `400`
- [ ] Enter an invalid email format → API returns 400 with "Valid recipient email required for gift"

### Webhook & email routing

_(Requires Stripe webhook configured and email configured — test in staging/production environment)_

- [ ] Complete a gift purchase for a digital book
- [ ] **Buyer** receives: standard order confirmation receipt (no gift recipient info shown)
- [ ] **Recipient** receives: gift email with book title, cover image, "Someone sent you a book" heading, optional "From: [name]" or "From: A friend", download button — **no pricing shown**
- [ ] Download link in the gift email is functional (single-use, 14-day expiry)
- [ ] Buyer does **not** receive a download link (that goes to the recipient only)

### Anonymous gift email

- [ ] Complete a gift purchase with "Send anonymously" checked
- [ ] Recipient email says "From: A friend" — not the buyer's name

---

## Regression Checks

- [ ] Standard (non-gift) "Buy Now" still works — completes checkout without gift metadata
- [ ] "Add to Cart" → cart page → checkout still works
- [ ] Non-bookstore pages unaffected: news articles, live events, music pages load correctly
- [ ] Author portal (`/portal`) loads correctly, existing pages work
- [ ] `/portal/subscribers` (news newsletter) still works and is separate from bookstore subscribers
- [ ] Dark mode toggle works across all modified pages
- [ ] Mobile viewport: all new components are usable on narrow screens

---

## Sanity Studio Checks

- [x] `Bookstore Subscriber` document type visible and editable
- [x] `User Wishlist` document type visible and editable
- [x] `Book Review` document type visible, editable, `approved` toggle works, preview shows `★★★ — Name` format
- [x] No console errors in the Studio after schema changes

---

## Environment Notes

Before testing on production/staging, confirm these env vars are set:

- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` — required for all email features
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate limiting for newsletter and reviews (fails open without these, so not required for basic testing)
- `SANITY_API_WRITE_TOKEN` — required for newsletter signups, wishlist, and review submissions
- `INTERNAL_EMAIL_SECRET` — required for the webhook → email route (gift emails)
