-- ============================================================
-- UnTelevised Media — Bookstore Schema (Issue #46 §2.2 + §2.3)
-- Project: untelevised-shop (ref: qdocpanuicwyhlcthudc)
-- ============================================================

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email         text not null,
  full_name     text,
  phone         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.addresses (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.customers(id) on delete cascade,
  label         text,
  line1         text not null,
  line2         text,
  city          text not null,
  state         text not null,
  postal_code   text not null,
  country       text not null default 'US',
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.orders (
  id                          uuid primary key default gen_random_uuid(),
  order_number                text unique not null,
  customer_id                 uuid references public.customers(id),
  stripe_payment_intent_id    text unique,
  stripe_checkout_session_id  text unique,
  status                      text not null default 'pending'
    check (status in ('pending','paid','processing','fulfilled','shipped','delivered','refunded','cancelled')),
  subtotal_cents              integer not null,
  tax_cents                   integer not null default 0,
  shipping_cents              integer not null default 0,
  total_cents                 integer not null,
  currency                    text not null default 'usd',
  shipping_address_id         uuid references public.addresses(id),
  notes                       text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  fulfilled_at                timestamptz
);

create table if not exists public.order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,
  sanity_book_id      text not null,
  sanity_format_type  text not null
    check (sanity_format_type in ('physical','digital','bundle')),
  book_title          text not null,
  format_label        text not null,
  unit_price_cents    integer not null,
  quantity            integer not null default 1,
  stripe_price_id     text,
  is_digital          boolean not null default false,
  download_fulfilled  boolean not null default false,
  created_at          timestamptz not null default now()
);

create table if not exists public.digital_downloads (
  id                    uuid primary key default gen_random_uuid(),
  order_item_id         uuid not null references public.order_items(id) on delete cascade,
  customer_id           uuid not null references public.customers(id),
  supabase_storage_path text not null,
  signed_url            text,
  download_count        integer not null default 0,
  max_downloads         integer not null default 5,
  first_downloaded_at   timestamptz,
  last_downloaded_at    timestamptz,
  expires_at            timestamptz,
  created_at            timestamptz not null default now()
);

create table if not exists public.payouts (
  id                  uuid primary key default gen_random_uuid(),
  author_clerk_id     text not null,
  period_start        date not null,
  period_end          date not null,
  gross_cents         integer not null,
  platform_fee_cents  integer not null default 0,
  net_cents           integer not null,
  status              text not null default 'pending'
    check (status in ('pending','paid','cancelled')),
  paid_at             timestamptz,
  notes               text,
  created_at          timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists idx_customers_clerk_user_id   on public.customers(clerk_user_id);
create index if not exists idx_orders_customer_id        on public.orders(customer_id);
create index if not exists idx_orders_status             on public.orders(status);
create index if not exists idx_orders_created_at         on public.orders(created_at desc);
create index if not exists idx_order_items_order_id      on public.order_items(order_id);
create index if not exists idx_order_items_sanity_book   on public.order_items(sanity_book_id);
create index if not exists idx_digital_downloads_oi      on public.digital_downloads(order_item_id);
create index if not exists idx_digital_downloads_cust    on public.digital_downloads(customer_id);
create index if not exists idx_payouts_author            on public.payouts(author_clerk_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── Row Level Security (§2.3) ─────────────────────────────────────────────────

alter table public.customers         enable row level security;
alter table public.addresses         enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.digital_downloads enable row level security;
alter table public.payouts           enable row level security;

-- customers: read/update own row only (match clerk_user_id via JWT sub claim)
drop policy if exists "customers_own_read"   on public.customers;
drop policy if exists "customers_own_update" on public.customers;

create policy "customers_own_read" on public.customers
  for select using (clerk_user_id = auth.jwt() ->> 'sub');

create policy "customers_own_update" on public.customers
  for update using (clerk_user_id = auth.jwt() ->> 'sub');

-- addresses: CRUD own addresses only
drop policy if exists "addresses_own_all" on public.addresses;

create policy "addresses_own_all" on public.addresses
  for all using (
    customer_id in (
      select id from public.customers where clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- orders: read own orders only
drop policy if exists "orders_own_read" on public.orders;

create policy "orders_own_read" on public.orders
  for select using (
    customer_id in (
      select id from public.customers where clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- order_items: readable through own orders
drop policy if exists "order_items_own_read" on public.order_items;

create policy "order_items_own_read" on public.order_items
  for select using (
    order_id in (
      select o.id from public.orders o
      join public.customers c on c.id = o.customer_id
      where c.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- digital_downloads: read own downloads only
drop policy if exists "digital_downloads_own_read" on public.digital_downloads;

create policy "digital_downloads_own_read" on public.digital_downloads
  for select using (
    customer_id in (
      select id from public.customers where clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- payouts: no direct client access (service role only)
-- No policies created — only service role bypasses RLS

-- All write operations (orders, order_items, digital_downloads) go through
-- service role in API routes only — never from the client anon key.
