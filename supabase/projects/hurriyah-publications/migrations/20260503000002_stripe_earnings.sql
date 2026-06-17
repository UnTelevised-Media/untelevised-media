-- ============================================================
-- Stripe fee tracking and author_earnings table:
--   1. Add stripe_fee_cents to orders (actual Stripe fee per transaction)
--   2. Add stripe_fee_cents to payouts (for payout history display)
--   3. Create author_earnings table — net-of-Stripe splits + payout periods
-- ============================================================

-- 1. Actual Stripe processing fee per order (from balance_transaction API)
alter table public.orders
  add column if not exists stripe_fee_cents integer not null default 0;

-- 2. Stripe fees absorbed per payout period (populated when payout is generated)
alter table public.payouts
  add column if not exists stripe_fee_cents integer not null default 0;

-- 3. Author earnings — authoritative record after Stripe deductions
--    One row per order_item, linked to the corresponding author_sales row.
--    Splits are applied to net_after_stripe_cents, not gross.
create table if not exists public.author_earnings (
  id                      uuid primary key default gen_random_uuid(),

  -- Source links
  author_sale_id          uuid not null references public.author_sales(id)  on delete cascade,
  order_id                uuid not null references public.orders(id)         on delete cascade,
  order_item_id           uuid not null references public.order_items(id)    on delete cascade,
  sanity_book_id          text not null,
  author_clerk_id         text,                         -- null if author not yet on Clerk

  -- Pre-Stripe (what customer paid for this line item)
  gross_cents             integer not null,

  -- Stripe's proportional cut for this item
  stripe_fee_cents        integer not null default 0,

  -- Net received by platform for this item
  net_after_stripe_cents  integer not null,

  -- Revenue splits applied to net_after_stripe_cents
  author_cents            integer not null default 0,
  platform_cents          integer not null default 0,
  publisher_cents         integer not null default 0,

  is_tip                  boolean not null default false,

  -- Bi-monthly payout period this sale belongs to
  -- Periods: 1st-15th (pays out 16th) or 16th-last day (pays out 1st of next month)
  payout_period_start     date not null,
  payout_period_end       date not null,

  created_at              timestamptz not null default now()
);

-- Indexes
create index if not exists idx_author_earnings_author  on public.author_earnings(author_clerk_id);
create index if not exists idx_author_earnings_order   on public.author_earnings(order_id);
create index if not exists idx_author_earnings_period  on public.author_earnings(payout_period_start);
create index if not exists idx_author_earnings_book    on public.author_earnings(sanity_book_id);
create index if not exists idx_author_earnings_sale    on public.author_earnings(author_sale_id);

-- RLS: service role only (portal uses service role key; direct client access not needed)
alter table public.author_earnings enable row level security;

-- Grants for service role (bypasses RLS) and authenticated users
grant select, insert, update on public.author_earnings to service_role;
grant select on public.author_earnings to authenticated;
