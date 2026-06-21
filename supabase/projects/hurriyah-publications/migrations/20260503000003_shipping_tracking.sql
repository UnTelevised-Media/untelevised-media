-- ============================================================
-- Shipping tracking fields for orders table.
-- Enables the DB webhook → Next.js → email flow for shipment
-- notifications when a tracking number is entered.
-- ============================================================

alter table public.orders
  add column if not exists shipping_tracking_number text,
  add column if not exists shipping_tracking_url    text,
  add column if not exists shipped_at               timestamptz;

create index if not exists idx_orders_tracking_number
  on public.orders(shipping_tracking_number)
  where shipping_tracking_number is not null;
