-- Server-only counters store keyed digests, never raw phone/email/IP data.
CREATE TABLE public.signup_send_limits (
  key text PRIMARY KEY CHECK (key ~ '^[a-f0-9]{64}$'),
  attempts integer NOT NULL CHECK (attempts > 0),
  reset_at timestamptz NOT NULL
);
CREATE INDEX signup_send_limits_expiry ON public.signup_send_limits(reset_at);
ALTER TABLE public.signup_send_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.signup_send_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.signup_send_limits TO service_role;

CREATE FUNCTION public.reserve_signup_send(buckets jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  bucket jsonb;
  state public.signup_send_limits%ROWTYPE;
  wait_seconds integer := 0;
  now_at timestamptz := clock_timestamp();
BEGIN
  IF jsonb_typeof(buckets) <> 'array' OR jsonb_array_length(buckets) NOT BETWEEN 1 AND 6 THEN
    RAISE EXCEPTION 'Invalid sign-in quota';
  END IF;
  FOR bucket IN SELECT value FROM jsonb_array_elements(buckets) ORDER BY value->>'key' LOOP
    IF bucket->>'key' !~ '^[a-f0-9]{64}$' OR (bucket->>'limit')::integer NOT BETWEEN 1 AND 1000
       OR (bucket->>'seconds')::integer NOT BETWEEN 60 AND 86400 THEN
      RAISE EXCEPTION 'Invalid sign-in quota';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(bucket->>'key', 0));
  END LOOP;
  FOR bucket IN SELECT value FROM jsonb_array_elements(buckets) LOOP
    SELECT * INTO state FROM public.signup_send_limits WHERE key = bucket->>'key';
    IF FOUND AND state.reset_at > now_at AND state.attempts >= (bucket->>'limit')::integer THEN
      wait_seconds := greatest(wait_seconds, ceil(extract(epoch FROM state.reset_at - now_at))::integer);
    END IF;
  END LOOP;
  IF wait_seconds > 0 THEN RETURN jsonb_build_object('allowed',false,'retry_after',wait_seconds); END IF;
  FOR bucket IN SELECT value FROM jsonb_array_elements(buckets) LOOP
    INSERT INTO public.signup_send_limits AS quota (key, attempts, reset_at)
    VALUES (bucket->>'key', 1, now_at + make_interval(secs => (bucket->>'seconds')::integer))
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN quota.reset_at <= now_at THEN 1 ELSE quota.attempts + 1 END,
      reset_at = CASE WHEN quota.reset_at <= now_at THEN EXCLUDED.reset_at ELSE quota.reset_at END;
  END LOOP;
  DELETE FROM public.signup_send_limits WHERE reset_at < now_at - interval '1 day';
  RETURN jsonb_build_object('allowed',true,'retry_after',0);
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_signup_send(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_signup_send(jsonb) TO service_role;

-- Existing server-side telemetry and flags code referenced absent tables.
-- Keep flags and audience allowlists private; clients use the existing APIs.
CREATE TABLE IF NOT EXISTS public.feature_flags (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), flag_key text UNIQUE NOT NULL,
 description text, enabled boolean NOT NULL DEFAULT false,
 rollout_percentage integer NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
 allowed_user_ids text[] NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.analytics_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(),
 event_name text NOT NULL, user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 properties jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.feature_flags, public.analytics_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags, public.analytics_events TO service_role;
INSERT INTO public.feature_flags(flag_key,description,enabled,rollout_percentage) VALUES
 ('config_tools_v2','Route interactive tools through configuration engine',true,100),
 ('beta_pricing_table','Experiment with new pricing tier layout',false,0),
 ('realtime_sync_notion','Enable real-time webhook Notion sync',true,100)
ON CONFLICT(flag_key) DO NOTHING;
