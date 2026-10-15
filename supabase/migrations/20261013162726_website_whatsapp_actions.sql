-- Private, durable send actions for the existing Planet Sorted website.
-- API handlers verify the caller with Supabase Auth before invoking these
-- service-role-only functions. Browser roles cannot read actions or OTPs.
-- No provider request is performed while a database lock is held.

CREATE TABLE public.whatsapp_delivery_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_key uuid NOT NULL,
  request_hash text NOT NULL,
  slug text NOT NULL,
  delivery_status text NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'accepted', 'failed', 'skipped', 'unknown')),
  delivery_reason text,
  message_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, action_key)
);

ALTER TABLE public.whatsapp_delivery_actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.whatsapp_delivery_actions FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.whatsapp_delivery_actions TO service_role;

-- Existing installations may have default grants on this server-only table.
ALTER TABLE public.whatsapp_otp_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.whatsapp_otp_challenges FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.whatsapp_otp_challenges TO service_role;

-- A non-unique index preserves historical rows while making backup lookup fast.
CREATE INDEX IF NOT EXISTS saved_items_owner_url_idx
  ON public.saved_items (user_id, url);

CREATE FUNCTION public.claim_whatsapp_delivery_action(
  p_user_id uuid,
  p_action_key uuid,
  p_hash text,
  p_slug text,
  p_url text,
  p_title text,
  p_category text
)
RETURNS TABLE (
  created boolean,
  action_id uuid,
  delivery_status text,
  delivery_reason text,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_action public.whatsapp_delivery_actions%ROWTYPE;
  v_created boolean;
  v_phone text;
BEGIN
  IF p_user_id IS NULL OR p_action_key IS NULL OR
     p_hash IS NULL OR p_hash = '' OR p_slug IS NULL OR p_slug = '' OR
     p_url IS NULL OR p_url = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'whatsapp_action_invalid';
  END IF;

  -- service_role has no SELECT/UPDATE on auth.users in this installation.
  -- One namespaced transaction lock serializes actions and OTP operations for
  -- this identity without granting access to the private Auth table.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('website-whatsapp-user:' || p_user_id::text, 0)
  );

  INSERT INTO public.whatsapp_delivery_actions (user_id, action_key, request_hash, slug)
  VALUES (p_user_id, p_action_key, p_hash, p_slug)
  ON CONFLICT (user_id, action_key) DO NOTHING
  RETURNING * INTO v_action;
  v_created := FOUND;

  IF NOT v_created THEN
    SELECT a.* INTO STRICT v_action
    FROM public.whatsapp_delivery_actions AS a
    WHERE a.user_id = p_user_id AND a.action_key = p_action_key;
    IF v_action.request_hash IS DISTINCT FROM p_hash THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'whatsapp_action_conflict';
    END IF;
  ELSE
    SELECT u.whatsapp_number INTO v_phone
    FROM public.users AS u
    WHERE u.user_id = p_user_id
    ORDER BY u.created_at ASC NULLS LAST, u.id
    LIMIT 1;

    -- Claim and Account backup commit together. Concurrent different actions
    -- for the same resource keep a single backup without changing old rows.
    INSERT INTO public.saved_items (user_id, phone, url, title, category)
    SELECT p_user_id, v_phone, p_url, p_title, COALESCE(p_category, 'General')
    WHERE NOT EXISTS (
      SELECT 1 FROM public.saved_items AS s
      WHERE s.user_id = p_user_id AND s.url = p_url
    );
  END IF;

  RETURN QUERY SELECT v_created, v_action.id, v_action.delivery_status,
    v_action.delivery_reason, v_action.updated_at;
END;
$$;

CREATE FUNCTION public.finish_whatsapp_delivery_action(
  p_user_id uuid,
  p_action_key uuid,
  p_status text,
  p_reason text,
  p_message_ids text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_updated integer;
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('accepted', 'failed', 'skipped', 'unknown') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'whatsapp_action_invalid_status';
  END IF;
  UPDATE public.whatsapp_delivery_actions AS a
  SET delivery_status = p_status,
      delivery_reason = p_reason,
      message_ids = COALESCE(p_message_ids, '{}'::text[]),
      updated_at = pg_catalog.clock_timestamp()
  WHERE a.user_id = p_user_id AND a.action_key = p_action_key
    AND a.delivery_status = 'pending';
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

CREATE FUNCTION public.reserve_whatsapp_otp(
  p_user_id uuid,
  p_phone text,
  p_otp_hash text
)
RETURNS TABLE (outcome text, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_challenge public.whatsapp_otp_challenges%ROWTYPE;
  v_now timestamptz;
  v_window_start timestamptz;
  v_send_count integer;
  v_expires_at timestamptz;
BEGIN
  IF p_user_id IS NULL OR p_phone IS NULL OR p_phone = '' OR
     p_otp_hash IS NULL OR p_otp_hash = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'whatsapp_otp_invalid';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('website-whatsapp-user:' || p_user_id::text, 0)
  );
  -- The FK rejects nonexistent Auth identities without reading auth.users.
  INSERT INTO public.whatsapp_otp_challenges (user_id)
  VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT c.* INTO STRICT v_challenge
  FROM public.whatsapp_otp_challenges AS c
  WHERE c.user_id = p_user_id FOR UPDATE;
  v_now := pg_catalog.clock_timestamp();

  v_window_start := v_challenge.send_window_start;
  v_send_count := v_challenge.send_count;
  IF v_window_start IS NULL OR v_window_start <= v_now - INTERVAL '1 hour' THEN
    v_window_start := v_now;
    v_send_count := 0;
  END IF;
  IF v_send_count >= 5 THEN
    RETURN QUERY SELECT 'limit'::text, NULL::timestamptz;
    RETURN;
  END IF;
  IF v_challenge.last_sent_at IS NOT NULL AND
     v_challenge.last_sent_at > v_now - INTERVAL '60 seconds' THEN
    RETURN QUERY SELECT 'cooldown'::text, NULL::timestamptz;
    RETURN;
  END IF;

  v_expires_at := v_now + INTERVAL '10 minutes';
  UPDATE public.whatsapp_otp_challenges AS c
  SET phone = p_phone, otp_hash = p_otp_hash, expires_at = v_expires_at,
      attempts = 0, last_sent_at = v_now, send_count = v_send_count + 1,
      send_window_start = v_window_start, updated_at = v_now
  WHERE c.user_id = p_user_id;
  RETURN QUERY SELECT 'reserved'::text, v_expires_at;
END;
$$;

CREATE FUNCTION public.verify_whatsapp_otp(
  p_user_id uuid,
  p_otp_hash text,
  p_first_name text,
  p_email text
)
RETURNS TABLE (outcome text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_challenge public.whatsapp_otp_challenges%ROWTYPE;
  v_now timestamptz;
  v_updated integer;
BEGIN
  IF p_user_id IS NULL OR p_otp_hash IS NULL OR p_otp_hash = '' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'whatsapp_otp_invalid';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('website-whatsapp-user:' || p_user_id::text, 0)
  );
  SELECT c.* INTO v_challenge FROM public.whatsapp_otp_challenges AS c
  WHERE c.user_id = p_user_id FOR UPDATE;
  v_now := pg_catalog.clock_timestamp();

  IF NOT FOUND OR v_challenge.otp_hash IS NULL OR
     v_challenge.phone IS NULL OR v_challenge.expires_at IS NULL THEN
    RETURN QUERY SELECT 'missing'::text;
    RETURN;
  END IF;
  IF v_challenge.expires_at <= v_now THEN
    RETURN QUERY SELECT 'expired'::text;
    RETURN;
  END IF;
  IF v_challenge.attempts >= 5 THEN
    RETURN QUERY SELECT 'limit'::text;
    RETURN;
  END IF;
  IF v_challenge.otp_hash IS DISTINCT FROM p_otp_hash THEN
    UPDATE public.whatsapp_otp_challenges AS c
    SET attempts = c.attempts + 1, updated_at = v_now WHERE c.user_id = p_user_id;
    RETURN QUERY SELECT 'incorrect'::text;
    RETURN;
  END IF;

  -- A subtransaction ensures phone/email uniqueness failures leave both the
  -- old profile and the live challenge unchanged. Never upsert on phone.
  BEGIN
    UPDATE public.users AS u
    SET whatsapp_number = v_challenge.phone,
        whatsapp_verified = true,
        whatsapp_opted_out = false
    WHERE u.user_id = p_user_id;
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated = 0 THEN
      INSERT INTO public.users (
        user_id, first_name, email, whatsapp_number,
        whatsapp_verified, whatsapp_opted_out, weekly_opted_in
      ) VALUES (
        p_user_id, COALESCE(p_first_name, ''), NULLIF(p_email, ''), v_challenge.phone,
        true, false, false
      );
    END IF;
    UPDATE public.whatsapp_otp_challenges AS c
    SET phone = NULL, otp_hash = NULL, expires_at = NULL, attempts = 0,
        updated_at = v_now
    WHERE c.user_id = p_user_id;
  EXCEPTION WHEN unique_violation THEN
    RETURN QUERY SELECT 'conflict'::text;
    RETURN;
  END;
  RETURN QUERY SELECT 'verified'::text;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_whatsapp_delivery_action(uuid, uuid, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finish_whatsapp_delivery_action(uuid, uuid, text, text, text[])
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reserve_whatsapp_otp(uuid, text, text)
  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_whatsapp_otp(uuid, text, text, text)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_whatsapp_delivery_action(uuid, uuid, text, text, text, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.finish_whatsapp_delivery_action(uuid, uuid, text, text, text[])
  TO service_role;
GRANT EXECUTE ON FUNCTION public.reserve_whatsapp_otp(uuid, text, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_whatsapp_otp(uuid, text, text, text)
  TO service_role;
