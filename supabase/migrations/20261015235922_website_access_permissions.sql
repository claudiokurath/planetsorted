-- Restrict profile mutations to verified server paths and restore private tool
-- history. These changes retain the service-role permissions used by the
-- website's existing SECURITY INVOKER WhatsApp and account RPCs.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

ALTER TABLE public.tool_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_runs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.users, public.tool_requests, public.tool_runs
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.public_protocols FROM PUBLIC, anon, authenticated;

-- Table-level revocation does not remove separate column grants. Clear those
-- too so legacy grants cannot retain browser profile writes or view reads.
DO $$
DECLARE
  v_table text;
  v_columns text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['users', 'tool_requests', 'tool_runs', 'public_protocols']
  LOOP
    SELECT pg_catalog.string_agg(pg_catalog.quote_ident(a.attname), ', ' ORDER BY a.attnum)
    INTO v_columns
    FROM pg_catalog.pg_attribute AS a
    WHERE a.attrelid = pg_catalog.to_regclass('public.' || v_table)
      AND a.attnum > 0 AND NOT a.attisdropped;
    EXECUTE pg_catalog.format(
      'REVOKE SELECT (%s), INSERT (%s), UPDATE (%s), REFERENCES (%s) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
      v_columns, v_columns, v_columns, v_columns, v_table
    );
  END LOOP;
END;
$$;

GRANT SELECT ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.tool_requests, public.tool_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users, public.tool_requests, public.tool_runs
  TO service_role;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own tool requests" ON public.tool_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can insert own tool requests" ON public.tool_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Users can delete own tool requests" ON public.tool_requests
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Runs have no direct user_id. Authorize them through the owned parent rather
-- than accepting a caller-supplied request id as evidence of ownership.
CREATE POLICY "Users can view own tool runs" ON public.tool_runs
  FOR SELECT TO authenticated
  USING (tool_request_id IN (
    SELECT r.id FROM public.tool_requests AS r WHERE r.user_id = (SELECT auth.uid())
  ));
CREATE POLICY "Users can insert own tool runs" ON public.tool_runs
  FOR INSERT TO authenticated
  WITH CHECK (tool_request_id IN (
    SELECT r.id FROM public.tool_requests AS r WHERE r.user_id = (SELECT auth.uid())
  ));
CREATE POLICY "Users can delete own tool runs" ON public.tool_runs
  FOR DELETE TO authenticated
  USING (tool_request_id IN (
    SELECT r.id FROM public.tool_requests AS r WHERE r.user_id = (SELECT auth.uid())
  ));

CREATE INDEX IF NOT EXISTS tool_requests_owner_created_idx
  ON public.tool_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tool_runs_request_created_idx
  ON public.tool_runs (tool_request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tool_runs_slug_created_idx
  ON public.tool_runs (tool_slug, created_at DESC);

-- This legacy view has no website callers and includes unpublished rows.
-- Remove browser access and enforce invoker permissions as defense in depth.
-- Public website pages continue to read published protocols through the server.
ALTER VIEW public.public_protocols SET (security_invoker = true);

-- Recognize website host and /go aliases when checking Account backups. Keep
-- historical URLs unchanged and keep unrelated external URLs distinct.
CREATE OR REPLACE FUNCTION public.claim_whatsapp_delivery_action(
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
  v_backup_urls text[];
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
    v_backup_urls := ARRAY[
      'https://www.planetsorted.com/r/' || p_slug,
      'https://planetsorted.com/r/' || p_slug,
      'https://www.sor7ed.com/r/' || p_slug,
      'https://sor7ed.com/r/' || p_slug,
      'https://www.planetsorted.com/go/' || p_slug,
      'https://planetsorted.com/go/' || p_slug,
      'https://www.sor7ed.com/go/' || p_slug,
      'https://sor7ed.com/go/' || p_slug
    ];
    IF NOT (p_url = ANY(v_backup_urls)) THEN
      v_backup_urls := ARRAY[p_url];
    END IF;

    INSERT INTO public.saved_items (user_id, phone, url, title, category)
    SELECT p_user_id, v_phone, p_url, p_title, COALESCE(p_category, 'General')
    WHERE NOT EXISTS (
      SELECT 1 FROM public.saved_items AS s
      WHERE s.user_id = p_user_id AND s.url = ANY(v_backup_urls)
    );
  END IF;

  RETURN QUERY SELECT v_created, v_action.id, v_action.delivery_status,
    v_action.delivery_reason, v_action.updated_at;
END;
$$;

-- CREATE OR REPLACE retains existing ACLs; restate the private boundary here.
REVOKE EXECUTE ON FUNCTION public.claim_whatsapp_delivery_action(uuid, uuid, text, text, text, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_whatsapp_delivery_action(uuid, uuid, text, text, text, text, text)
  TO service_role;
