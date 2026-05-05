# Changelog — UnTelevised Media / Hurriya Publications

All notable changes to this project are documented here.
Format: `## [date] — Short description` followed by categorized entries.

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
