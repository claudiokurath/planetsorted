-- Migration: add_feature_flags_and_analytics.sql
-- Description: Adds feature_flags and analytics_events tables with performance indexes

-- 1. Feature Flags table for controlled rollouts & A/B testing
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_user_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on flag_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag_key ON public.feature_flags (flag_key);

-- 2. Analytics Events table for tracking user interactions & telemetry
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Indexes for time-series analytics and event filtering
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events (user_id);

-- Index for tool_runs performance querying
CREATE INDEX IF NOT EXISTS idx_tool_runs_created_at ON public.tool_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_runs_slug_time ON public.tool_runs (tool_slug, created_at DESC);

-- Enable RLS (per docs/planet-sorted-master.md § Security)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Feature flags: Anyone can read enabled flags for client checks; only service role can modify
CREATE POLICY "Public read-only access to feature flags"
  ON public.feature_flags
  FOR SELECT
  USING (true);

-- Analytics events: Authenticated or anon can insert via service-role API
CREATE POLICY "Service role full access to analytics_events"
  ON public.analytics_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Seed initial feature flags
INSERT INTO public.feature_flags (flag_key, description, enabled, rollout_percentage)
VALUES 
  ('config_tools_v2', 'Route interactive tools through configuration engine', true, 100),
  ('beta_pricing_table', 'Experiment with new pricing tier layout', false, 0),
  ('realtime_sync_notion', 'Enable real-time webhook Notion sync', true, 100)
ON CONFLICT (flag_key) DO NOTHING;
