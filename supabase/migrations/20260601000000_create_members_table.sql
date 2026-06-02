-- Migration: create members table for membership subscriptions
-- Project: UnTelevised Live (tewnvjowrdfzvqcsfwgx)
-- Issue: #13 — Membership / Supporter Tiers

CREATE TABLE IF NOT EXISTS members (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id          text UNIQUE,
  email                  text NOT NULL,
  stripe_customer_id     text UNIQUE NOT NULL,
  stripe_subscription_id text UNIQUE,
  tier                   text NOT NULL CHECK (tier IN ('supporter', 'contributor', 'patron')),
  status                 text NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')),
  member_since           timestamptz NOT NULL DEFAULT now(),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- RLS: block all access by default, open only active-count read to anon
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_active_count" ON members
  FOR SELECT TO anon
  USING (status = 'active');

-- Index for Clerk user lookups (access gating)
CREATE INDEX IF NOT EXISTS idx_members_clerk_user_id
  ON members (clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_members_updated_at();
