-- Grant service_role DML on tables created after the initial grants migration.
-- audit_logs, author_sales, guest_download_tokens were all missing.
-- service_role bypasses RLS but still requires explicit table privileges.

grant select, insert, update, delete on public.audit_logs            to service_role;
grant select, insert, update, delete on public.author_sales          to service_role;
grant select, insert, update, delete on public.guest_download_tokens to service_role;

-- authenticated users can read their own author_sales via RLS (future portal use)
grant select on public.author_sales to authenticated;
