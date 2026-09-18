-- WhatsApp OTP challenges — server-side only.
--
-- Replaces storing the verification challenge in auth.users.user_metadata.
-- That field is readable by the browser (it is returned by getUser() and
-- embedded in the access token) and writable by the user via
-- supabase.auth.updateUser({ data }), which meant:
--   1. the raw OTP was visible to the very person it was meant to challenge,
--      so anyone could verify a phone number they did not control; and
--   2. the attempt and send-rate counters could be reset from the client,
--      defeating both the lockout and the hourly send limit.
--
-- One row per user. The live challenge columns are nullable so a consumed
-- challenge can be cleared while the throttle counters below survive.

CREATE TABLE IF NOT EXISTS public.whatsapp_otp_challenges (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Live challenge. Cleared on success; otp_hash IS NULL means "no session".
  phone             text,
  otp_hash          text,
  expires_at        timestamptz,
  attempts          integer     NOT NULL DEFAULT 0,

  -- Throttles. Deliberately NOT cleared on success, so a successful verify
  -- cannot be used to reset the hourly send allowance.
  last_sent_at      timestamptz,
  send_count        integer     NOT NULL DEFAULT 0,
  send_window_start timestamptz,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Supports expiry sweeps without a full scan.
CREATE INDEX IF NOT EXISTS whatsapp_otp_challenges_expires_at_idx
  ON public.whatsapp_otp_challenges (expires_at)
  WHERE otp_hash IS NOT NULL;

ALTER TABLE public.whatsapp_otp_challenges ENABLE ROW LEVEL SECURITY;
-- No public policies — service role only. This is the control that keeps the
-- hash and the counters out of reach of the browser. Do not add a policy here.
