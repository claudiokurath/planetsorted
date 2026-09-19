create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique,
  email text unique not null,
  is_paid boolean not null default false,
  plan text default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table admin_runs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  title text,
  raw_brain_dump text,
  pressure_score integer not null default 0,
  pressure_level text not null default 'calm',
  created_at timestamptz not null default now()
);

create table admin_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  run_id uuid references admin_runs(id) on delete cascade,
  title text not null,
  raw_text text,
  category text not null,
  deadline date,
  involves text,
  what_needs_to_happen text,
  stress_level integer not null default 5 check (stress_level between 1 and 10),
  has_replied boolean not null default false,
  has_document boolean not null default false,
  consequence text,
  urgency_score integer not null default 0,
  bucket text not null default 'needs_info',
  estimated_time_minutes integer,
  energy_level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deadlines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  item_id uuid references admin_items(id) on delete cascade,
  due_date date not null,
  label text,
  reminder_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table scripts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  run_id uuid references admin_runs(id) on delete cascade,
  item_id uuid references admin_items(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index idx_admin_items_run on admin_items(run_id);
create index idx_admin_items_deadline on admin_items(deadline);
create index idx_deadlines_due on deadlines(due_date);
create index idx_scripts_run on scripts(run_id);

-- Row Level Security (production hardening once auth is enabled)
alter table admin_runs enable row level security;
alter table admin_items enable row level security;
create policy "Users manage their own runs" on admin_runs
  using (auth.uid() = user_id);
create policy "Users manage their own items" on admin_items
  using (auth.uid() = user_id);
