-- Grant required privileges to service_role and anon on all bookstore tables.
-- service_role bypasses RLS but still needs base table privileges.
-- anon is used for client-side reads (RLS enforces row-level restrictions).

grant select, insert, update, delete on public.customers         to service_role, anon, authenticated;
grant select, insert, update, delete on public.addresses         to service_role, anon, authenticated;
grant select, insert, update, delete on public.orders            to service_role, anon, authenticated;
grant select, insert, update, delete on public.order_items       to service_role, anon, authenticated;
grant select, insert, update, delete on public.digital_downloads to service_role, anon, authenticated;
grant select, insert, update, delete on public.payouts           to service_role;
grant select                         on public.payouts           to authenticated;
