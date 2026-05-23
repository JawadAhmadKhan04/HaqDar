-- ============================================================
-- HaqDar — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Incidents table
create table if not exists public.incidents (
  id              text        primary key,
  user_id         uuid        not null references auth.users(id) on delete cascade,
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

-- 2. Index for fast per-user queries
create index if not exists incidents_user_id_idx on public.incidents (user_id, timestamp);

-- 3. Enable Row Level Security
alter table public.incidents enable row level security;

-- 4. Policy: users can only see their own incidents
create policy "Users can view own incidents"
  on public.incidents for select
  using (auth.uid() = user_id);

-- 5. Policy: users can insert their own incidents
create policy "Users can insert own incidents"
  on public.incidents for insert
  with check (auth.uid() = user_id);

-- 6. Policy: users can update their own incidents
create policy "Users can update own incidents"
  on public.incidents for update
  using (auth.uid() = user_id);

-- 7. Policy: users can delete their own incidents
create policy "Users can delete own incidents"
  on public.incidents for delete
  using (auth.uid() = user_id);
