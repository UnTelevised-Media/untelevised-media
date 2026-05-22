-- ============================================================
-- UnTelevised Media — Atomic download counter (Issue #64)
-- Fixes a TOCTOU race condition where concurrent requests could
-- each read download_count < max_downloads and both succeed,
-- allowing more downloads than purchased.
-- ============================================================

-- increment_download_if_allowed
-- Atomically checks the download limit and increments the counter in
-- a single transaction with a FOR UPDATE row lock. Returns TRUE when
-- the download is permitted and the counter was incremented, FALSE
-- when the limit has already been reached.
--
-- The caller should generate a signed URL only after this function
-- returns TRUE. On storage errors the counter stays incremented (the
-- edge case of a wasted download slot is preferable to allowing
-- unlimited downloads through retry).
--
-- SECURITY DEFINER is used so the function runs with owner privileges
-- regardless of the caller's role (anon or authenticated).  Access is
-- restricted to the service_role via REVOKE / GRANT below.

create or replace function public.increment_download_if_allowed(p_download_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count   integer;
  v_max     integer;
  v_first   timestamptz;
begin
  -- Lock the row for the duration of this transaction so concurrent calls
  -- cannot both read the same count and both proceed.
  select download_count, max_downloads, first_downloaded_at
  into   v_count, v_max, v_first
  from   public.digital_downloads
  where  id = p_download_id
  for update;

  if not found then
    return false;
  end if;

  if v_count >= v_max then
    return false;
  end if;

  update public.digital_downloads
  set    download_count       = download_count + 1,
         last_downloaded_at   = now(),
         first_downloaded_at  = coalesce(first_downloaded_at, now())
  where  id = p_download_id;

  return true;
end;
$$;

-- Revoke from public and grant only to service_role so this function
-- cannot be called directly by the anon or authenticated roles.
revoke execute on function public.increment_download_if_allowed(uuid) from public;
revoke execute on function public.increment_download_if_allowed(uuid) from anon;
revoke execute on function public.increment_download_if_allowed(uuid) from authenticated;
grant  execute on function public.increment_download_if_allowed(uuid) to service_role;
