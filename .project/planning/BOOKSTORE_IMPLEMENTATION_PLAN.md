# Bookstore E-Commerce Implementation Plan

## Overview

Complete the bookstore e-commerce pipeline for UnTelevised Media, enabling users to purchase books, receive downloads, and view their library. Implement secure payment processing, transaction logging, and a guest checkout option with time-limited downloads.

---

## Phase 1: Shopping Cart & Checkout

### 1.1 Add to Cart Functionality

- **Requirement**: Replace non-functional "Buy" buttons with working "Add to Cart" buttons on book detail pages and storefront
- **Implementation**:
  - Create a client-side cart state management hook (`useShoppingCart.ts`) using React Context or Zustand
  - Store cart items in both memory and localStorage for persistence
  - Cart item structure: `{ bookId, title, price, authorId, quantity }`
  - Implement increment/decrement quantity logic
  - Add visual feedback (toast notifications) on item added

### 1.2 Shopping Cart Page

- **Requirement**: Create a dedicated shopping cart page (`/bookstore/cart`) showing all cart items
- **Implementation**:
  - Display book thumbnail, title, price, and quantity
  - Implement quantity adjustment (±1 buttons)
  - Show line item totals and cart total
  - "Continue Shopping" button (returns to storefront)
  - "Proceed to Checkout" button (routes to checkout)
  - "Remove Item" button per line item
  - Show empty cart state with link to browse books

### 1.3 Pre-Checkout Summary

- **Requirement**: Display order summary before payment
- **Implementation**:
  - Show all items with final prices
  - Display subtotal and any applicable taxes/fees
  - Show total amount due
  - Allow editing quantities or removing items
  - Display estimated delivery timeframe

---

## Phase 2: Revenue Sharing & Transparency

### 2.1 Revenue Sharing Section

- **Requirement**: Add a collapsible section on each book detail page showing revenue breakdown
- **Implementation**:
  - Create Sanity schema field `revenueTerms` on book document with:
    - `authorPercentage` (number, e.g., 65)
    - `publisherPercentage` (number, e.g., 25)
    - `platformPercentage` (number, e.g., 10)
    - `description` (rich text explaining the split)
  - Render as collapsible card on book page: "How Revenue is Shared"
  - Show percentage breakdown with visual bar chart
  - Display in human-readable format (e.g., "65% to author, 25% to publisher, 10% to platform")

### 2.2 Tip Mechanism

- **Requirement**: Allow buyers to add a tip for the creator at checkout
- **Implementation**:
  - Add tip input field on checkout page
  - Preset tip amounts: $1, $2, $5, $10 (user can customize)
  - Tip goes 100% to author
  - Show tip as separate line item in order total
  - Track tip separately in transaction log

---

## Phase 3: Authentication & Checkout

### 3.1 Checkout Page (`/bookstore/checkout`)

- **Requirement**: Create checkout flow with auth gate
- **Implementation**:
  - Check if user is authenticated via Clerk
  - If authenticated:
    - Pre-fill email, name from Clerk user data
    - Show "Continue as [User]" option
  - If not authenticated, show two options:
    - "Sign In" (redirect to Clerk sign-in)
    - "Continue as Guest" (proceed to guest checkout)
  - Proceed to shipping/payment based on selection

### 3.2 Guest Checkout Flow

- **Requirement**: Allow anonymous purchases with one-time download links
- **Implementation**:
  - Collect: email, full name, shipping address
  - Generate temporary guest session (UUID, stored in Supabase)
  - Proceed to payment (see Phase 4)
  - On success, create purchase record with `isGuest: true`
  - Generate one-time download token (see Phase 5)
  - Email download link with expiration notice

### 3.3 Authenticated Checkout Flow

- **Requirement**: Streamlined checkout for logged-in users
- **Implementation**:
  - Use Clerk user email and name
  - Collect shipping address (save option for future orders)
  - Proceed to payment
  - On success, create purchase record linked to Clerk user ID
  - Add books to user's library

---

## Phase 4: Payment Processing & Transaction Logging

### 4.1 Payment Integration

- **Requirement**: Process payments securely (using Stripe or similar)
- **Implementation**:
  - Integrate Stripe (or configured payment provider)
  - Implement `/api/checkout/create-session` endpoint
  - Create Stripe Payment Intent with:
    - Cart total amount
    - Tax calculation (if applicable)
    - Tip amount (separate from books)
    - Metadata: cartItems, authorIds, userId (or guest email)
  - Implement `/api/checkout/confirm` endpoint to verify payment
  - Return confirmation with order ID

### 4.2 Supabase Transaction Schema

- **Requirement**: Log all transactions with complete audit trail
- **Database Table**: `book_purchases`

  ```sql
  CREATE TABLE book_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR UNIQUE,
    clerk_user_id VARCHAR,  -- NULL for guest purchases
    guest_email VARCHAR,     -- populated for guest purchases
    guest_session_id UUID,   -- for guest tracking
    total_amount_cents INT,
    tax_cents INT DEFAULT 0,
    tip_cents INT DEFAULT 0,
    payment_status VARCHAR ('pending', 'completed', 'failed', 'refunded'),
    payment_provider VARCHAR ('stripe', 'other'),
    payment_intent_id VARCHAR,
    shipping_address JSONB, -- {street, city, state, zip, country}
    shipping_method VARCHAR,
    tracking_number VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP
  );

  CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES book_purchases(id) ON DELETE CASCADE,
    book_id VARCHAR,
    author_id VARCHAR,
    price_cents INT,
    quantity INT DEFAULT 1,
    author_revenue_cents INT,    -- calculated from revenue terms
    platform_revenue_cents INT,
    line_total_cents INT
  );

  CREATE TABLE purchase_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES book_purchases(id) ON DELETE CASCADE,
    book_id VARCHAR,
    download_token VARCHAR UNIQUE,  -- one-time use token
    token_expires_at TIMESTAMP,
    downloaded_at TIMESTAMP,        -- NULL until used
    file_key VARCHAR,               -- Supabase storage path
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

### 4.3 Author Payment Tracking

- **Database Table**: `author_revenue`
  ```sql
  CREATE TABLE author_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id VARCHAR,
    purchase_item_id UUID REFERENCES purchase_items(id),
    book_id VARCHAR,
    revenue_cents INT,
    tip_cents INT DEFAULT 0,
    payment_status VARCHAR ('accrued', 'paid_out', 'disputed'),
    paid_out_at TIMESTAMP,
    payment_method VARCHAR,
    payout_reference VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

### 4.4 Transaction Processing Flow

- **Requirement**: Handle payment confirmation and database updates
- **Implementation**:
  - Create `/api/webhooks/stripe` endpoint for payment confirmation
  - On payment success:
    1. Create `book_purchases` record
    2. Create `purchase_items` records (one per book)
    3. Calculate author revenue based on `revenueTerms`
    4. Create `author_revenue` records
    5. Generate download tokens in `purchase_downloads`
    6. Send confirmation email with download links (see Phase 5)
    7. Log transaction in audit table

---

## Phase 5: Download Pipeline & Email Integration

### 5.1 One-Time Download Token System

- **Requirement**: Generate secure, time-limited download links that expire after first use
- **Implementation**:
  - Create download token generation function:
    - Token: secure random string (use `crypto.randomUUID()`)
    - Expiration: 14 days from purchase (configurable)
    - Store in `purchase_downloads` table with `downloaded_at = NULL`
  - Implement `/api/downloads/[token]` endpoint:
    - Verify token exists and hasn't been used
    - Verify token hasn't expired
    - Mark token as used: `UPDATE purchase_downloads SET downloaded_at = NOW() WHERE token = ?`
    - Return signed Supabase download URL (temporary, 1 hour expiration)
    - Prevent same token from being used twice

### 5.2 Email Integration

- **Requirement**: Send purchase confirmation and download links via email
- **Implementation**:
  - Use SendGrid, Resend, or configured email provider
  - Create email template for purchase confirmation with:
    - Order number and date
    - Book title, author, price
    - Download link(s) with one-time token
    - Expiration date for download link
    - For authenticated users: link to dashboard to re-download
    - For guests: note that this is the only download link provided
  - **Optional**: Attach PDF file directly to email (if file size < 25MB)
    - Fetch file from Supabase on email send
    - Attach as PDF to email
  - Send confirmation email immediately after payment success

### 5.3 Failed Download Handling

- **Requirement**: Handle edge cases for downloads
- **Implementation**:
  - Provide user-friendly error messages:
    - "Link expired" → direct authenticated users to dashboard, offer resend for guests
    - "Link already used" → same as above
    - "Invalid token" → suggest contacting support
  - Create `/api/downloads/resend-link` endpoint for authenticated users only
    - Generate new download token
    - Send new email with fresh link

---

## Phase 6: User Library & Download Dashboard

### 6.1 User Library Page (`/user/library`)

- **Requirement**: Authenticated users view purchased books and download history
- **Implementation**:
  - **Route Guard**: Verify Clerk authentication; redirect to sign-in if not authenticated
  - **Database Query**: Fetch all `book_purchases` where `clerk_user_id` = current user
  - Display:
    - Book title, author, purchase date, price paid
    - "Download" button (generates fresh one-time token, redirects to `/api/downloads/[token]`)
    - Download history (show previous downloads with timestamps)
    - Order details expandable section (shows receipt with revenue breakdown)
  - **Pagination**: Load 10 purchases per page if collection grows

### 6.2 Purchase Receipt / Order Details

- **Requirement**: Users view detailed receipt and revenue breakdown
- **Implementation**:
  - Show:
    - Order number and date
    - Each book purchased (title, author, price)
    - Revenue breakdown per book (author %, platform %)
    - Subtotal, tax, tip breakdown
    - Total amount paid
    - Shipping address
    - Download history (which downloads were used, timestamps)

### 6.3 Download Links in Dashboard

- **Requirement**: Users can download their books multiple times via dashboard
- **Implementation**:
  - Each book in library has "Download Now" button
  - On click, generate new one-time token
  - Immediately redirect to `/api/downloads/[token]` (auto-download)
  - Log download event in `purchase_downloads`

---

## Phase 7: Guest Purchase Experience

### 7.1 Guest Download Limitations

- **Requirement**: Guests cannot re-download; only have email link
- **Implementation**:
  - Create `guest_downloads` tracking table (separate from `purchase_downloads`)
  - On guest purchase, create ONE download token in `purchase_downloads`
  - Send email with one-time link
  - Email includes clear notice: "This is your only download link. Save it or download now."
  - If token expires/used before download, guest cannot access dashboard
  - Offer "resend download link" option in email footer (generates new token, sends new email)

### 7.2 Guest Resend Logic

- **Requirement**: Guests can request link resend via email
- **Implementation**:
  - Create `/api/downloads/guest-resend` endpoint
  - Accepts: `order_number` and `guest_email`
  - Verify order exists and matches email
  - Generate new download token with fresh expiration
  - Send new email with fresh link
  - Rate limit: max 3 resends per order

---

## Phase 8: Security & Compliance

### 8.1 Security Measures

- **Requirement**: Protect sensitive data and payment information
- **Implementation**:
  - Use HTTPS for all checkout pages
  - Implement CSRF tokens on checkout forms
  - Validate all server-side API requests (don't trust client)
  - Never log full payment card numbers
  - Hash download tokens before storage (optional, but recommended)
  - Rate limit payment endpoints to prevent brute force
  - Implement IP-based fraud detection (optional)

### 8.2 Audit Logging

- **Requirement**: Log all payment and download events
- **Implementation**:
  - Create `audit_logs` table:
    ```sql
    CREATE TABLE audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_type VARCHAR ('payment_attempt', 'payment_success', 'payment_failed', 'download', 'token_expired', 'token_used'),
      user_id VARCHAR,
      purchase_id UUID,
      ip_address VARCHAR,
      user_agent VARCHAR,
      details JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
    ```
  - Log all payment attempts, successes, failures
  - Log all download attempts (success, token expired, already used)

### 8.3 PCI Compliance

- **Requirement**: Maintain PCI DSS compliance
- **Implementation**:
  - Use Stripe (handles PCI compliance)
  - Never handle raw card data on your server
  - Use Stripe client-side tokenization
  - Store only `payment_intent_id`, not card data

---

## Phase 9: Implementation Sequence

### Sprint 1: Cart & Basic Checkout

1. Create `useShoppingCart` hook with localStorage persistence
2. Replace "Buy" buttons with "Add to Cart" buttons
3. Create shopping cart page (`/bookstore/cart`)
4. Create checkout page with auth gate
5. Implement guest vs. authenticated checkout flow

### Sprint 2: Payment & Transactions

1. Integrate Stripe payment
2. Create Supabase tables: `book_purchases`, `purchase_items`, `purchase_downloads`, `author_revenue`
3. Implement `/api/checkout/create-session` and `/api/checkout/confirm`
4. Implement Stripe webhook handler
5. Create transaction logging in database

### Sprint 3: Downloads & Email

1. Implement one-time download token system
2. Create `/api/downloads/[token]` endpoint
3. Integrate email service (SendGrid/Resend)
4. Create purchase confirmation email template
5. Implement email sending on payment success

### Sprint 4: User Library

1. Create `/user/library` authenticated page
2. Fetch user purchases from Supabase
3. Implement download button (generates fresh token)
4. Create order details/receipt view
5. Implement download history tracking

### Sprint 5: Guest Features & Polish

1. Implement guest resend logic (`/api/downloads/guest-resend`)
2. Create audit logging table and logging
3. Add error handling and user feedback
4. Security review and rate limiting
5. Testing and bug fixes

---

## Technical Requirements

### Dependencies to Add

- `stripe` — Payment processing
- `sendgrid` or `resend` — Email service
- `zustand` or Context API — State management for cart
- `date-fns` — Date/time handling
- `uuid` — Token generation (Node.js built-in)

### Environment Variables Needed

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@untelevised.media

SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_APP_URL=https://untelevised.media
```

### Database Setup

- Run migrations in `supabase/migrations/` to create all tables
- Set up RLS policies:
  - `book_purchases`: Users can read only their own orders
  - `purchase_downloads`: No direct user access (API only)
  - `author_revenue`: Authors can read their own revenue only

---

## GitHub Issue Requirements

Before implementation, create/update GitHub issue with:

### Title

"[TASK] Complete Bookstore E-Commerce Pipeline: Cart, Checkout, Payment, Downloads"

### Description

Include:

1. **Overview**: Brief summary of bookstore feature scope
2. **Requirements Checklist**:
   - [ ] Shopping cart with add/remove/quantity adjustment
   - [ ] Pre-checkout summary page
   - [ ] Authenticated checkout with Clerk
   - [ ] Guest checkout with email-only access
   - [ ] Revenue sharing transparency section (per book)
   - [ ] Tip mechanism for author support
   - [ ] Stripe payment integration
   - [ ] Transaction logging in Supabase
   - [ ] One-time download tokens (time-limited, single-use)
   - [ ] Download email with optional PDF attachment
   - [ ] User library page for authenticated users
   - [ ] Guest download link expiration handling
   - [ ] Audit logging of all transactions/downloads
   - [ ] Security review & rate limiting

3. **Architecture Overview**: Link to this document or paste high-level flow
4. **Database Schema**: Reference tables and structure
5. **Implementation Plan**: Reference the 5-sprint breakdown
6. **Success Criteria**:
   - All buy buttons functional
   - Purchases successfully logged in Supabase
   - Authenticated users can view library and re-download
   - Guests receive email link (single-use)
   - Download links expire after 14 days or first use
   - All transactions audited and traceable
   - Revenue sharing visible per book

---

## Post-Implementation Checklist

- [ ] Stripe test mode payments verified
- [ ] Download tokens expire correctly
- [ ] Email delivery tested (both authenticated and guest)
- [ ] User library shows all purchases
- [ ] Revenue totals calculated correctly
- [ ] Audit logs capture all events
- [ ] Security review completed
- [ ] Rate limiting active on payment endpoints
- [ ] Error messages user-friendly
- [ ] Guest resend logic works
- [ ] Authenticated users can re-download
- [ ] Guests cannot access dashboard
- [ ] Order receipts display correctly

---

## Notes

- **Payment Provider**: Stripe is recommended for PCI compliance and ease of integration
- **Email Provider**: Resend is faster to set up; SendGrid is more feature-rich
- **Testing**: Use Stripe test mode throughout development; verify with test card numbers
- **Data Privacy**: Ensure GDPR compliance for guest email storage (set retention limit)
- **Scalability**: One-time tokens stored in database can be indexed for fast lookup
- **Future Enhancements**: Consider implementing:
  - Affiliate links for commission tracking
  - Bundle discounts
  - Pre-order system
  - Subscription models
  - Automated royalty payouts

---

## Questions for Clarification

If implementing, confirm with user:

1. **Payment Provider**: Use Stripe, or different provider?
2. **Email Provider**: Resend or SendGrid?
3. **PDF Attachment**: Always attach to email, or only if under file size limit?
4. **Download Expiration**: 14 days by default, or different?
5. **Guest Resend Limit**: 3 attempts by default, or different?
6. **Author Payout Schedule**: How often to process author revenue? (Weekly, monthly, quarterly?)
7. **Tax Handling**: Calculate sales tax by location, or flat rate?
8. **Shipping**: Physical shipping required, or digital-only?
