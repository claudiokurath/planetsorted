alter table if exists public.protocols
  add column if not exists gamma_url text;
