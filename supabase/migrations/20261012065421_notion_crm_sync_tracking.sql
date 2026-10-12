-- Server-only sync ledger; contact details remain in auth/users and Notion.
create table if not exists public.notion_crm_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notion_page_id text,
  contact_hash text,
  synced_at timestamptz,
  lock_until timestamptz,
  lock_token uuid,
  last_error text
);
alter table public.notion_crm_sync enable row level security;
revoke all on table public.notion_crm_sync from anon, authenticated;
grant all on table public.notion_crm_sync to service_role;

create table if not exists public.notion_crm_reconciliation (
  id integer primary key check (id = 1),
  next_page integer not null default 1 check (next_page > 0)
);
alter table public.notion_crm_reconciliation enable row level security;
revoke all on table public.notion_crm_reconciliation from anon, authenticated;
grant all on table public.notion_crm_reconciliation to service_role;
insert into public.notion_crm_reconciliation (id, next_page) values (1, 1) on conflict (id) do nothing;
