// src/lib/bookstore/types.ts
// TypeScript interfaces for the bookstore feature.
// Supabase table interfaces mirror database.types.ts rows.
// Sanity interfaces describe the projected shape returned by GROQ queries.

// ---------------------------------------------------------------------------
// Supabase table row types
// ---------------------------------------------------------------------------

export interface Customer {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'refunded'
  | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: OrderStatus;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  shipping_address_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  fulfilled_at: string | null;
}

export type FormatType = 'physical' | 'digital' | 'bundle';

export interface OrderItem {
  id: string;
  order_id: string;
  sanity_book_id: string;
  sanity_format_type: FormatType;
  book_title: string;
  format_label: string;
  unit_price_cents: number;
  quantity: number;
  stripe_price_id: string | null;
  is_digital: boolean;
  download_fulfilled: boolean;
  created_at: string;
}

export interface DigitalDownload {
  id: string;
  order_item_id: string;
  customer_id: string;
  supabase_storage_path: string;
  signed_url: string | null;
  download_count: number;
  max_downloads: number;
  first_downloaded_at: string | null;
  last_downloaded_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export type PayoutStatus = 'pending' | 'paid' | 'cancelled';

export interface Payout {
  id: string;
  author_clerk_id: string;
  period_start: string;
  period_end: string;
  gross_cents: number;
  platform_fee_cents: number;
  net_cents: number;
  status: PayoutStatus;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Sanity-side types (projected from GROQ queries)
// ---------------------------------------------------------------------------

export interface SanityBookGenre {
  _id: string;
  title: string;
  slug: { current: string };
}

export interface SanityBookFormat {
  _key: string;
  formatType: FormatType;
  price: number;
  compareAtPrice?: number;
  stripePriceId?: string;
  stripeProductId?: string;
  inventory?: {
    trackInventory: boolean;
    quantity: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
  };
  digitalAsset?: {
    supabaseStoragePath?: string;
    fileSize?: string;
    fileFormat?: string;
    version?: string;
  };
  weight?: number;
  dimensions?: string;
}

export interface SanityImageRef {
  _type: 'image';
  asset: { _type: 'reference'; _ref: string };
  alt?: string;
}

export interface SanityBook {
  _id: string;
  title: string;
  slug: { current: string };
  author?: {
    _id: string;
    name: string;
    image?: SanityImageRef;
    bio?: unknown[];
    slug?: { current: string };
    clerkId?: string;
    payoutEmail?: string;
  };
  coverImage?: SanityImageRef;
  coverImageUrl?: string;
  description?: unknown[];
  genre?: SanityBookGenre[];
  publishedAt?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  formats: SanityBookFormat[];
  samplePdfUrl?: string;
  featured: boolean;
  status: 'draft' | 'published' | 'out-of-stock' | 'discontinued';
}

// ---------------------------------------------------------------------------
// Cart item (client-side)
// ---------------------------------------------------------------------------

export interface CartItem {
  sanityBookId: string;
  slug: string;
  title: string;
  coverImageRef?: string;
  formatType: FormatType;
  formatKey: string;
  price: number;
  stripePriceId: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Checkout payload sent to /api/bookstore/checkout
// ---------------------------------------------------------------------------

export interface CheckoutLineItem {
  stripePriceId: string;
  quantity: number;
  sanityBookId: string;
  formatType: FormatType;
  formatKey: string;
  title: string;
  isDigital: boolean;
}

export interface CheckoutPayload {
  items: CheckoutLineItem[];
  clerkUserId?: string;
}
