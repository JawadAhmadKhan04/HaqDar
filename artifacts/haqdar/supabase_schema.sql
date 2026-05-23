-- ============================================================
-- HaqDar — Supabase Schema (multi-media version)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- FRESH INSTALL: run the full file as-is.
--
-- UPGRADE from old single-media schema (add media column):
--   ALTER TABLE public.incidents
--     ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]';
--   ALTER TABLE public.incidents
--     DROP COLUMN IF EXISTS media_type,
--     DROP COLUMN IF EXISTS media_filename,
--     DROP COLUMN IF EXISTS media_uri;
-- ============================================================

-- 1. Incidents table
create table if not exists public.incidents (
  id              text        primary key,
  device_id       text        not null,
  title           text        not null default '',
  narrative       text        not null default '',
  media           jsonb       not null default '[]',
  hash            text        not null,
  legal_categories text[]     not null default '{}',
  timestamp       timestamptz not null,
  created_at      timestamptz not null default now()
);

create index if not exists incidents_device_id_idx on public.incidents (device_id, timestamp);

alter table public.incidents enable row level security;

create policy "anon_select" on public.incidents for select to anon using (true);
create policy "anon_insert" on public.incidents for insert to anon with check (true);
create policy "anon_update" on public.incidents for update to anon using (true);
create policy "anon_delete" on public.incidents for delete to anon using (true);

-- ============================================================
-- Storage bucket for media files (images + audio)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('haqdar-media', 'haqdar-media', true)
on conflict (id) do nothing;

create policy "anon_media_insert" on storage.objects
  for insert to anon with check (bucket_id = 'haqdar-media');

create policy "anon_media_select" on storage.objects
  for select to anon using (bucket_id = 'haqdar-media');

create policy "anon_media_delete" on storage.objects
  for delete to anon using (bucket_id = 'haqdar-media');
