-- ============================================================
-- HaqDar — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Drop old table if you had a previous version with user_id
-- drop table if exists public.incidents;

-- 1. Incidents table — uses device_id (no auth required)
create table if not exists public.incidents (
  id              text        primary key,
  device_id       text        not null,
  title           text        not null default '',
  narrative       text        not null default '',
  media_type      text        not null default 'none' check (media_type in ('none', 'image', 'audio')),
  media_filename  text        not null default '',
  media_uri       text,
  hash            text        not null,
  legal_categories text[]     not null default '{}',
  timestamp       timestamptz not null,
  created_at      timestamptz not null default now()
);

-- 2. Index for fast per-device queries
create index if not exists incidents_device_id_idx on public.incidents (device_id, timestamp);

-- 3. Enable Row Level Security
alter table public.incidents enable row level security;

-- 4. Allow the anon key to read, write, and delete
--    Data isolation is by device_id — each device only queries its own rows.
create policy "anon_select" on public.incidents
  for select to anon using (true);

create policy "anon_insert" on public.incidents
  for insert to anon with check (true);

create policy "anon_update" on public.incidents
  for update to anon using (true);

create policy "anon_delete" on public.incidents
  for delete to anon using (true);
