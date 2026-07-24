create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  landing_country text not null,
  landing_path text,
  page_path text,
  first_referrer text,
  last_referrer text,
  first_touch jsonb not null default '{}'::jsonb,
  last_touch jsonb not null default '{}'::jsonb,
  marketing_consent boolean not null default false,
  privacy_acknowledged boolean not null default false,
  consent_version text,
  status text not null default 'new',
  anonymous_session_id text,
  form_version text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint leads_email_normalized_unique unique (email_normalized),
  constraint leads_email_normalized_not_blank check (length(email_normalized) > 3),
  constraint leads_landing_country_allowed check (
    landing_country in ('atlas', 'colombia', 'mexico', 'venezuela', 'guatemala', 'brasil')
  ),
  constraint leads_status_allowed check (
    status in ('new', 'confirmed', 'unsubscribed', 'invalid', 'spam')
  ),
  constraint leads_email_shape check (
    email_normalized ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  ),
  constraint leads_privacy_acknowledged_true check (privacy_acknowledged is true),
  constraint leads_idempotency_key_shape check (
    idempotency_key is null or (
      length(idempotency_key) between 16 and 128 and
      idempotency_key ~ '^[A-Za-z0-9._:-]+$'
    )
  ),
  constraint leads_landing_path_shape check (
    landing_path is null or (
      landing_path like '/%' and
      landing_path not like '%://%' and
      length(landing_path) <= 256
    )
  ),
  constraint leads_page_path_shape check (
    page_path is null or (
      page_path like '/%' and
      page_path not like '%://%' and
      length(page_path) <= 256
    )
  ),
  constraint leads_first_touch_object check (jsonb_typeof(first_touch) = 'object'),
  constraint leads_last_touch_object check (jsonb_typeof(last_touch) = 'object')
);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_updated_at_idx
  on public.leads (updated_at desc);

create index if not exists leads_landing_country_created_at_idx
  on public.leads (landing_country, created_at desc);

create index if not exists leads_status_created_at_idx
  on public.leads (status, created_at desc);

create unique index if not exists leads_idempotency_key_unique_idx
  on public.leads (idempotency_key)
  where idempotency_key is not null;

create index if not exists leads_first_touch_gin_idx
  on public.leads using gin (first_touch);

create index if not exists leads_last_touch_gin_idx
  on public.leads using gin (last_touch);

create or replace function public.set_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_leads_updated_at();

alter table public.leads enable row level security;

revoke all on table public.leads from anon;
revoke all on table public.leads from authenticated;

drop policy if exists "No public lead reads" on public.leads;
drop policy if exists "No public lead inserts" on public.leads;
drop policy if exists "No public lead updates" on public.leads;
drop policy if exists "No public lead deletes" on public.leads;

create policy "No public lead reads"
on public.leads
for select
to anon, authenticated
using (false);

create policy "No public lead inserts"
on public.leads
for insert
to anon, authenticated
with check (false);

create policy "No public lead updates"
on public.leads
for update
to anon, authenticated
using (false)
with check (false);

create policy "No public lead deletes"
on public.leads
for delete
to anon, authenticated
using (false);
