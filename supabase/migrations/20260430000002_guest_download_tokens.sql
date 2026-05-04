-- Guest download tokens for unauthenticated (guest) purchasers.
-- Authenticated-user downloads use digital_downloads + customer_id.
-- Guests get a single-use token emailed directly; they have no dashboard access.

CREATE TABLE IF NOT EXISTS guest_download_tokens (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID REFERENCES orders(id) ON DELETE CASCADE,
  book_title       TEXT,
  format_label     TEXT,
  supabase_storage_path TEXT NOT NULL,
  guest_email      TEXT NOT NULL,
  token            TEXT UNIQUE NOT NULL,
  download_count   INT NOT NULL DEFAULT 0,
  max_downloads    INT NOT NULL DEFAULT 1,
  expires_at       TIMESTAMPTZ NOT NULL,
  downloaded_at    TIMESTAMPTZ,
  resend_count     INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_download_tokens_token     ON guest_download_tokens (token);
CREATE INDEX IF NOT EXISTS idx_guest_download_tokens_email     ON guest_download_tokens (guest_email);
CREATE INDEX IF NOT EXISTS idx_guest_download_tokens_order_id  ON guest_download_tokens (order_id);

-- No RLS — access exclusively via service role from API routes.
ALTER TABLE guest_download_tokens DISABLE ROW LEVEL SECURITY;
