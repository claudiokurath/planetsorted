alter table if exists public.protocols
  add column if not exists blog_gamma_url text;
