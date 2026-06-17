# Bookstore

**Last Updated:** June 2026

Full e-commerce platform for physical and digital books with shopping cart, checkout, and order fulfillment.

---

## Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Product Catalog | ✅ Live | Physical and digital books |
| Shopping Cart | ✅ Live | Persistent across sessions |
| Checkout | ✅ Live | Stripe integration |
| Orders | ✅ Live | Order management and status tracking |
| Digital Downloads | ✅ Live | Email delivery with links |
| Wishlist | ✅ Live | Save items for later |
| Reviews | ✅ Live | Customer ratings and comments |
| Inventory | ✅ Live | Stock tracking |
| Returns | 🔄 Beta | Return process for physical items |

---

## URL Structure

### Public Pages
- `/bookstore/` — Bookstore homepage with featured books
- `/bookstore/book/[slug]/` — Product detail page
- `/bookstore/search?q=query` — Product search
- `/bookstore/cart/` — Shopping cart
- `/bookstore/about/` — Bookstore information

### Customer Account
- `/bookstore/orders/` — Order history
- `/bookstore/downloads/` — Download digital products
- `/bookstore/my-reviews/` — Customer's reviews
- `/bookstore/wishlist/` — Saved items
- `/bookstore/unsubscribe/` — Unsub from email marketing

### Admin/Portal
- `/portal/orders/` — All orders (sales/admin role)
- `/portal/orders/[id]/status` — Update order status

---

## Product Types

### Physical Books
Printed books with inventory and shipping.

**Key fields:**
- `title` — Book title
- `author` — Author(s)
- `price` — Retail price (USD)
- `inventory` — Stock quantity
- `description` — Product description
- `coverImage` — Book cover image
- `isbn` — ISBN if available
- `format` — Hardcover, Paperback, etc.

**Checkout flow:**
1. Add to cart
2. Provide shipping address
3. Pay via Stripe
4. Order marked as "pending" → "processing"
5. Admin ships and updates status to "shipped"
6. Customer receives tracking info

### Digital Books
Downloadable PDFs or ePub files.

**Key fields:**
- `title` — Book title
- `price` — Download price (USD)
- `file` — Digital asset (PDF/ePub)
- `fileSize` — For display
- `description` — Product description

**Download flow:**
1. Add to cart
2. Pay via Stripe (no shipping)
3. Order marked as "completed" automatically
4. `/api/bookstore/download` generates signed download link
5. Email sent with download link
6. Link valid for 7 days

### Bundles
Multiple books sold as a package.

**Example:** "Complete Series Bundle" - all 3 books at 20% discount

---

## Cart System

Persistent shopping cart using browser localStorage and Supabase.

### How It Works

```typescript
// On product page "Add to Cart"
const addToCart = (productId, quantity = 1) => {
  const cart = getCartFromStorage(); // or fetch from DB if logged in
  cart.items.push({ productId, quantity, price });
  saveCart(cart); // to localStorage or DB
};

// In cart page
const items = cart.items.map(item => {
  return {
    ...item,
    product: fetchProduct(item.productId),
    subtotal: item.price * item.quantity,
  };
});
```

### Persistence

**For logged-in users:**
- Cart stored in Supabase `cart` table
- Synced across devices
- Survives session logout

**For guests:**
- Cart stored in browser localStorage
- Expires after browser cache clear
- Can upgrade to account during checkout

### Operations

- `GET /api/bookstore/my-downloads` — List user's downloads
- `POST /api/bookstore/checkout` — Create checkout session

---

## Checkout & Payments

Stripe handles all payment processing.

### Checkout Flow

```
1. User at /bookstore/cart reviews cart
2. Click "Proceed to Checkout"
3. Sign in (or continue as guest for guests)
4. Enter/confirm shipping address
5. Review order summary
6. Click "Pay $X.XX"
7. Redirected to Stripe Checkout
8. Pay with card/Apple Pay/Google Pay
9. Stripe webhook confirms payment → order created
10. Redirect to /bookstore/order-success
11. Email receipt sent
```

### Order Creation (from Webhook)

When Stripe payment succeeds:

```typescript
// /api/webhooks/stripe
event.type === 'checkout.session.completed' → {
  // Create order in Supabase
  await supabase.from('orders').insert({
    user_id: session.client_reference_id,
    items: lineItems,
    total: session.amount_total,
    status: 'processing',
    created_at: new Date(),
  });
  
  // Send confirmation email
  await sendOrderEmail(customer.email, order);
  
  // For digital items: send download links immediately
  if (order.hasDigitalItems) {
    await sendDownloadLinks(customer.email, order);
  }
};
```

### Payment Methods

**Stripe supports:**
- Credit/debit cards
- Digital wallets (Apple Pay, Google Pay)
- ACH bank transfers (US)
- Klarna, iDEAL, and other local methods

---

## Orders & Fulfillment

### Order States

```
pending → processing → shipped → delivered
              ↓
          refunded (optional)
```

| State | Meaning | Customer Sees | Next Action |
|-------|---------|---------------|-------------|
| `processing` | Payment confirmed | "Processing" | Ship order |
| `shipped` | Order dispatched | "Shipped" + tracking | Deliver |
| `delivered` | Received | "Delivered" | Done |
| `refunded` | Money returned | "Refunded" | Done |

### Admin Order Management

Admins and sales staff access `/portal/orders` to:

**View:**
- Customer details
- Item list with prices
- Shipping address
- Current status
- Payment method used

**Actions:**
- Update status (processing → shipped → delivered)
- Add tracking number
- Process refunds
- Add notes/comments
- Print shipping labels (if integrated)

### Customer Order Page

Customers see their orders at `/bookstore/orders/`:

```typescript
// Example order display
{
  orderId: "ord_12345",
  date: "June 15, 2026",
  total: "$24.99",
  items: [
    { title: "The Book", quantity: 1, price: "$19.99" },
    { title: "Another Book (PDF)", quantity: 1, price: "$5.00" }
  ],
  status: "shipped",
  tracking: "1Z999AA10123456784",
  shippingAddress: "123 Main St, Anytown, US 12345"
}
```

---

## Digital Downloads

PDFs and ePub files delivered immediately after purchase.

### Download Flow

```typescript
// User purchases digital book
// Stripe webhook fires → order.status = 'completed'
// Email sent with download link

// User clicks link → GET /api/bookstore/download?orderId=xxx&itemId=yyy
// Link is signed with JWT (valid 7 days)
// File streamed to browser

// Link expires after 7 days
// User can request resend via /api/bookstore/download/guest-resend
```

### Persistent Downloads

Logged-in users can download anytime from `/bookstore/downloads/`:

```typescript
// GET /api/bookstore/my-downloads
return {
  orders: [
    {
      orderId: "ord_123",
      items: [
        {
          title: "Digital Book Title",
          url: "/api/bookstore/download?orderId=ord_123&itemId=item_456"
        }
      ]
    }
  ]
};
```

### Guest Re-delivery

Guests who lose their email can request resend:

```
1. Go to /bookstore/downloads/guest-resend
2. Enter email + order ID
3. CAPTCHA verification
4. Email re-sent with download link
```

---

## Reviews & Ratings

Customers can leave ratings and text reviews for products.

### Review Structure

```typescript
{
  id: UUID,
  bookId: string,           // Product ID
  userId: UUID,             // Clerk user ID
  rating: 1-5,              // Star rating
  title: string,            // Review headline
  text: string,             // Review body (0-1000 chars)
  helpful_count: number,    // Count of "helpful" votes
  created_at: timestamp,
  updated_at: timestamp
}
```

### Restrictions

- Only customers who purchased can review
- One review per person per product
- Edited reviews show "Edited on [date]"
- Reviews require moderation before appearing (optional)

### API Routes

- `POST /api/bookstore/reviews` — Create/update review
- `GET /api/bookstore/reviews?bookId=xxx` — Fetch reviews for product
- `PATCH /api/bookstore/reviews/{id}` — Edit own review
- `DELETE /api/bookstore/reviews/{id}` — Delete own review

---

## Wishlist

Saved items for later purchase, accessible across sessions.

### Wishlist Storage

**Logged-in users:**
- Stored in Supabase `wishlists` table
- Synced across devices
- Persists after logout

**Guests:**
- Stored in browser localStorage
- Expires on cache clear

### Operations

```typescript
// Add to wishlist
POST /api/bookstore/wishlist { bookId, quantity }

// Get wishlist
GET /api/bookstore/wishlist
return { items: [{ id, title, price, coverImage }] }

// Remove from wishlist
DELETE /api/bookstore/wishlist/{ itemId }

// Move from wishlist to cart
POST /api/bookstore/wishlist/{ itemId }/add-to-cart
```

---

## Database Schema

### Supabase Tables

#### `orders`
```sql
id, user_id, items_json, total, status, 
shipping_address_json, created_at, updated_at
```

#### `order_items`
```sql
id, order_id, product_id, quantity, price_at_purchase
```

#### `products`
```sql
id, title, author, price, inventory, 
type (physical|digital), file_id, description, cover_image_id
```

#### `product_reviews`
```sql
id, product_id, user_id, rating, title, text, 
helpful_count, created_at, updated_at
```

#### `wishlists`
```sql
id, user_id, product_id, added_at
```

---

## Payments: Stripe Integration

### Stripe Setup

**Mode:** Live (for production) or Test (for dev)

**Webhooks:**
- `payment_intent.succeeded`
- `checkout.session.completed`
- `charge.refunded`

**Configuration:** See [Stripe Integration](./STRIPE.md)

### Payment Processing

```typescript
// POST /api/bookstore/checkout
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: cart.items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.title },
      unit_amount: item.price * 100, // cents
    },
    quantity: item.quantity,
  })),
  mode: 'payment',
  success_url: `${DOMAIN}/bookstore/order-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${DOMAIN}/bookstore/cart/`,
  customer_email: user.email,
});

return { sessionId: session.id };
```

---

## Email Integration

### Order Confirmation

Sent automatically after payment:

```
To: customer@example.com
Subject: Order Confirmation #ORD-12345

Hi John,

Thanks for your order! Here's what you ordered:

- The Book ($19.99)
- Digital Book ($5.00)

Total: $24.99

Tracking: [Add after shipping]
Estimate: 3-5 business days

Download your digital items: [link]

Questions? Contact us at support@untelevised.media
```

### Shipment Notification

Sent when order status updated to "shipped":

```
To: customer@example.com
Subject: Your Order Has Shipped! #ORD-12345

Hi John,

Great news! Your order is on the way.

Tracking: 1Z999AA10123456784
Carrier: UPS
Estimate: June 18, 2026

Track it: [link to UPS tracking]
```

### Review Request

Sent 2 weeks after delivery:

```
To: customer@example.com
Subject: What did you think of "The Book"?

Hi John,

We hope you loved "The Book"! Would you mind sharing your thoughts?

Leave a review: [link]
```

---

## Analytics & Reporting

### Sales Dashboard

Admins see at `/portal/orders/`:
- Total revenue (today, week, month)
- Order count
- Average order value
- Top selling products
- Recent orders list

### Product Performance

Per-product metrics:
- Total units sold
- Revenue
- Average rating
- Number of reviews
- View count

### Email Performance

- Click-through rates on emails
- Unsubscribe rates
- Delivery success rate

---

## Security

### PCI Compliance

- Stripe handles all card data (never stored locally)
- Signed download links (JWT with expiration)
- Rate limiting on download endpoint
- HTTPS required for all checkout

### Access Control

- Only users with `sales` or `admin` role see `/portal/orders/`
- Customers only see their own orders
- Download links signed with user ID

### Refund Policy

- Admins can process refunds (returns money to card)
- Customers cannot self-refund
- Refund reason logged
- Manual review recommended for disputes

---

## Performance

### Optimizations

- Cart cached in browser (localStorage)
- Product images lazy-loaded with Next.js Image
- Checkout page pre-rendered (ISG)
- Download links streamed (not buffered)

### Rate Limiting

- Checkout: 10 requests per minute per IP
- Download: 100 requests per hour per user
- Review submit: 5 reviews per hour per user

---

## Troubleshooting

**Cart not persisting:**
- Check localStorage is enabled
- Clear browser cache and reload
- For logged-in users: check Supabase connection

**Payment failing:**
- Check Stripe keys in environment
- Verify card is not declined (test mode: use 4242 4242...)
- Check webhook logs in Stripe Dashboard

**Orders not created:**
- Check webhook events in Stripe Dashboard
- Verify `/api/webhooks/stripe` is receiving events
- Check Supabase orders table for creation

**Digital download link expired:**
- Links expire after 7 days
- Request resend from `/bookstore/downloads/guest-resend`
- Logged-in users can re-download anytime

---

## Related Documentation

- **[Stripe Integration](./STRIPE.md)** — Payment processing setup
- **[Orders & Fulfillment](./ORDERS.md)** — Order management
- **[Digital Downloads](./DOWNLOADS.md)** — Download delivery
- **[Products](./PRODUCTS.md)** — Product management
- **[Reviews](./REVIEWS.md)** — Review system

---

## Common Tasks

### Add a New Product

```
1. Go to /studio → Products
2. Click "Create" → Book
3. Fill in title, author, price
4. Upload cover image
5. Set inventory (for physical books)
6. Upload file (for digital books)
7. Publish
8. Run: npm run algolia:index
```

### Process an Order

```
1. Go to /portal/orders/
2. Click order to open
3. Update status from "processing" → "shipped"
4. Add tracking number
5. Click "Save"
6. Notification email sent to customer
```

### Refund an Order

```
1. Go to /portal/orders/[orderId]/status
2. Click "Refund"
3. Enter refund amount and reason
4. Click "Process Refund"
5. Check Stripe Dashboard to confirm
6. Email sent to customer
```

---

## Questions?

See [Documentation Index](../../DOCUMENTATION_INDEX.md) or contact the commerce team.
