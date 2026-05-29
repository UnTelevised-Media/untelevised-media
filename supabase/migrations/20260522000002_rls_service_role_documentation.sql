-- ============================================================
-- UnTelevised Media — RLS Policy Documentation & Service Role Audit
-- Issue #65: Service role client bypasses RLS on user-facing routes
-- ============================================================
--
-- CURRENT STATE
-- -------------
-- All user-facing tables have RLS enabled (see 20260428000001_bookstore_schema.sql).
-- Policies use auth.jwt() ->> 'sub' to match clerk_user_id, which works
-- natively when the Supabase client is authenticated via Supabase Auth.
--
-- WHY SERVICE ROLE IS CURRENTLY USED IN SERVER ROUTES
-- -----------------------------------------------------
-- The application uses Clerk for authentication, not Supabase Auth.
-- When Next.js API routes call Supabase, they create clients without a
-- Supabase session JWT, so auth.jwt() returns null and all RLS policies
-- that depend on it evaluate to false — denying every read.
--
-- To work around this, server routes use the service_role key (which bypasses
-- RLS) but apply application-level scoping:
--   1. Verify Clerk auth via auth() — returns userId from a signed Clerk JWT
--   2. Look up the Supabase customer row WHERE clerk_user_id = userId
--   3. Filter all subsequent queries by the resolved customer_id
--
-- This achieves the same isolation as the database-level RLS policies, but
-- at the application layer. Security depends on Clerk's JWT verification
-- being correct and the WHERE clauses being applied consistently.
--
-- PATH TO DATABASE-LEVEL RLS WITH CLERK
-- --------------------------------------
-- Clerk supports a Supabase integration that issues JWTs Supabase can verify:
--   https://clerk.com/docs/integrations/databases/supabase
--
-- Once configured:
--   1. Generate a Supabase JWT template in the Clerk dashboard
--   2. In each API route, call auth() then pass the Clerk Supabase token to
--      createClient() as the Authorization header
--   3. Switch customer/download reads to the anon client — RLS will enforce
--      clerk_user_id = auth.jwt() ->> 'sub' at the database level
--   4. Service role usage can then be limited to write operations and admin tasks
--
-- CURRENT SERVICE ROLE JUSTIFICATIONS (per route)
-- ------------------------------------------------
--   my-downloads (GET): reads customers + digital_downloads
--     Justified: no Supabase JWT from Clerk; application-level WHERE filtering
--     applied on clerk_user_id and customer_id after Clerk auth verification.
--
--   download (GET): reads customers + digital_downloads, calls RPC, storage
--     Justified: same auth gap; RPC (increment_download_if_allowed) and
--     Storage signed URL generation require service_role regardless.
--
--   webhooks/supabase-order-update (POST): reads customers, sends email
--     Justified: server-to-server webhook with no user session.
--
--   download/guest-resend (POST): reads orders, customers, guest_download_tokens; inserts tokens
--     Justified: guest purchasers have no Supabase Auth session and no Clerk userId.
--     Application-level security: rate limiting + email cross-check against orders.customer_id
--     (customers.email) before querying tokens, then token lookup filtered by order_id AND
--     guest_email. Three layers must all pass before a resend token is issued.
--
--   writeAuditLog: inserts into audit_logs
--     Justified: audit_logs has RLS disabled (admin-only table, no user policies).
--
-- ============================================================

-- No schema changes in this migration — this file serves as the authoritative
-- record of RLS policy intent, service-role usage justifications, and the
-- upgrade path to native Clerk+Supabase JWT integration.

-- Ensure RLS remains enabled on all user-facing tables (idempotent safety check).
do $$
begin
  -- These statements are safe to re-run; they error only if a table does not exist.
  alter table if exists public.customers         enable row level security;
  alter table if exists public.addresses         enable row level security;
  alter table if exists public.orders            enable row level security;
  alter table if exists public.order_items       enable row level security;
  alter table if exists public.digital_downloads enable row level security;
end;
$$;

-- Confirm the service_role bypass is intentional and documented for each
-- table by adding a column comment.  Column comments survive schema dumps
-- and appear in the Supabase dashboard, making the intent visible to
-- future reviewers.
comment on table public.customers is
  'Service-role reads: see supabase/migrations/20260522000002_rls_service_role_documentation.sql. '
  'RLS upgrade path: configure Clerk Supabase JWT integration and switch to anon client.';

comment on table public.digital_downloads is
  'Service-role reads: see supabase/migrations/20260522000002_rls_service_role_documentation.sql. '
  'RLS policies enforce owner-only access when using a Clerk-issued Supabase JWT.';

comment on table public.guest_download_tokens is
  'RLS disabled by design — guest purchasers have no auth session. '
  'Access exclusively via service role in API routes. '
  'Application-level isolation: email cross-checked against orders.customer_id before token lookup; '
  'all queries filtered by both order_id AND guest_email. '
  'See supabase/migrations/20260522000002_rls_service_role_documentation.sql.';
