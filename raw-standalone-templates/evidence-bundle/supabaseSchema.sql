create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  plan text not null default 'free' check (plan in ('free','paid')),
  created_at timestamptz default now()
);

create table cases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  case_type text not null,
  case_name text not null,
  opponent text,
  what_happened text,
  desired_outcome text,
  key_date date,
  deadline date,
  main_argument text,
  stress_level int check (stress_level between 1 and 10),
  purpose text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table evidence_items (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  title text not null,
  document_type text,
  document_date date,
  created_by text,
  received_by text,
  summary text,
  proves_what text,
  supports_issue text,
  file_url text,               -- placeholder until real upload is wired up
  importance text,
  is_sensitive boolean default false,
  problem text,
  exhibit_category text,
  exhibit_ref text,
  kmr_status text default 'maybe',
  created_at timestamptz default now()
);

create table case_runs (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  readiness_score int,
  readiness_label text,
  created_at timestamptz default now()
);

create table bundle_exports (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  run_id uuid references case_runs(id),
  format text default 'pdf',
  created_at timestamptz default now()
);
