-- ============================================================
-- Webhook schema fixes:
--   1. Make customers.clerk_user_id nullable (support guest purchases)
--   2. Add 'tip' to order_items.sanity_format_type check
--   3. Create author_sales table for revenue tracking
-- ============================================================

-- 1. Allow guest customers (no Clerk account)
alter table public.customers
  alter column clerk_user_id drop not null;

-- Replace the NOT NULL unique constraint with a partial unique index that allows multiple NULLs
alter table public.customers
  drop constraint if exists customers_clerk_user_id_key;

create unique index if not exists customers_clerk_user_id_unique
  on public.customers(clerk_user_id)
  where clerk_user_id is not null;

-- 2. Widen the format type check to include 'tip'
alter table public.order_items
  drop constraint if exists order_items_sanity_format_type_check;

alter table public.order_items
  add constraint order_items_sanity_format_type_check
  check (sanity_format_type in ('physical','digital','bundle','tip'));

-- 3. Author sales — one row per order item, tracks revenue splits
create table if not exists public.author_sales (
  id                  uuid primary key default gen_random_uuid(),
  order_item_id       uuid not null references public.order_items(id) on delete cascade,
  order_id            uuid not null references public.orders(id) on delete cascade,
  sanity_book_id      text not null,
  author_clerk_id     text,                   -- null if author not yet on Clerk
  gross_cents         integer not null,        -- what the customer paid for this item
  author_cents        integer not null default 0,
  publisher_cents     integer not null default 0,
  platform_cents      integer not null default 0,
  is_tip              boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists idx_author_sales_order_item  on public.author_sales(order_item_id);
create index if not exists idx_author_sales_order        on public.author_sales(order_id);
create index if not exists idx_author_sales_author       on public.author_sales(author_clerk_id);
create index if not exists idx_author_sales_book         on public.author_sales(sanity_book_id);

-- RLS: service role only (no direct client access needed yet)
alter table public.author_sales enable row level security;

-- 4. Guest-friendly shipping addresses (decouple from customers table)
--    Add a nullable guest_email so we can store shipping for orders without a customer record
alter table public.addresses
  alter column customer_id drop not null;

alter table public.addresses
  add column if not exists guest_email text;

-- 5. Fix RLS on customers to handle nullable clerk_user_id safely
drop policy if exists "customers_own_read"   on public.customers;
drop policy if exists "customers_own_update" on public.customers;

create policy "customers_own_read" on public.customers
  for select using (
    clerk_user_id is not null
    and clerk_user_id = auth.jwt() ->> 'sub'
  );

create policy "customers_own_update" on public.customers
  for update using (
    clerk_user_id is not null
    and clerk_user_id = auth.jwt() ->> 'sub'
  );
