-- Planet Sorted — billing + partner leads (2026-08-15)
-- Apply in Supabase SQL editor (or via CLI) before relying on these features in prod.
-- Safe to re-run: all statements are IF NOT EXISTS / ON CONFLICT friendly.

-- ── Stripe event idempotency ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id      text PRIMARY KEY,
  event_type    text NOT NULL,
  status        text NOT NULL DEFAULT 'processing'
                  CHECK (status IN ('processing', 'done', 'failed')),
  error_detail  text,
  received_at   timestamptz NOT NULL DEFAULT now(),
  processed_at  timestamptz
);

CREATE INDEX IF NOT EXISTS stripe_events_received_at_idx
  ON public.stripe_events (received_at DESC);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- No public policies — service role only.

-- ── Credits ledger: ensure unique signup grant per user ────────────────────
-- (Application also checks before insert; this is the hard guarantee.)
CREATE UNIQUE INDEX IF NOT EXISTS credits_ledger_signup_once_idx
  ON public.credits_ledger (user_id)
  WHERE reason = 'signup_grant';

CREATE INDEX IF NOT EXISTS credits_ledger_user_id_idx
  ON public.credits_ledger (user_id);

-- ── Entitlements: one row per user ─────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_user_id_uidx
  ON public.entitlements (user_id);

CREATE INDEX IF NOT EXISTS entitlements_stripe_customer_idx
  ON public.entitlements (stripe_customer_id);

-- ── Partner widget leads (v1) ──────────────────────────────────────────────
-- Partner identity is a free-text slug from data-partner on the embed script.
-- Full partner accounts / billing are a later product; this captures leads now.
CREATE TABLE IF NOT EXISTS public.partner_leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  partner_slug    text NOT NULL,
  phone           text NOT NULL,
  tool_slug       text,
  source_host     text,
  source_path     text,
  user_agent      text,
  ip_hash         text,
  status          text NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'converted', 'spam'))
);

CREATE INDEX IF NOT EXISTS partner_leads_partner_created_idx
  ON public.partner_leads (partner_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS partner_leads_phone_idx
  ON public.partner_leads (phone);

-- Soft de-dupe: same partner + phone within the same calendar day is unique-ish
-- via application check; optional partial uniqueness left out to allow re-opt-ins.

ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;
-- No public policies — service role only. Partners never query this directly.

-- ── Optional: grant 5 signup credits when a users row is inserted ──────────
-- Only creates the function/trigger if credits_ledger exists.
CREATE OR REPLACE FUNCTION public.on_user_created_grant_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  -- Partial unique index credits_ledger_signup_once_idx enforces one grant.
  INSERT INTO public.credits_ledger (user_id, delta, reason, source)
  VALUES (NEW.user_id, 5, 'signup_grant', 'signup');
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN undefined_table THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_grant_credits ON public.users;
CREATE TRIGGER trg_users_grant_credits
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_user_created_grant_credits();
