-- Payload is server-only on the existing RLS-protected delivery journal.
ALTER TABLE public.whatsapp_delivery_actions
  ADD COLUMN IF NOT EXISTS request_payload jsonb,
  ADD COLUMN IF NOT EXISTS awaiting_reply boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reply_expires_at timestamptz;
COMMENT ON COLUMN public.whatsapp_delivery_actions.request_payload IS 'Canonical boolean delivery flags for a verified, user-initiated WhatsApp reply. No protocol content.';
