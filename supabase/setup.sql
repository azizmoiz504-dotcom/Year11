-- Class of 2027 yearbook: database setup for Supabase.
-- This file has the tables and rules only. The seniors themselves (names + personal
-- passwords) are added with a separate one-off "seed" block that is never committed,
-- so the passwords stay out of this public repo. Safe to run again.

create extension if not exists pgcrypto with schema extensions;

-- Remove functions from the earlier class-code version, if they exist.
drop function if exists public.add_student(text, text, text, text, text, text, text);
drop function if exists public.delete_student(uuid, text);
drop function if exists public.update_student(uuid, text, text, text, text, text, text);
drop function if exists public.add_gallery_photo(text, text, text);
drop function if exists public._check_class_code(text);
drop function if exists public._check_pin(text);
drop table if exists public.settings;

-- ── Seniors ────────────────────────────────────────────────────────────────
-- One row per senior, created by the seed block. `pin_hash` is their personal password, hashed.
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  university text check (char_length(university) <= 80),
  quote text check (char_length(quote) <= 200),
  photo_url text check (char_length(photo_url) <= 500),
  baby_photo_url text check (char_length(baby_photo_url) <= 500),
  pin_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.students alter column photo_url drop not null;
alter table public.students add column if not exists position int;  -- card order
alter table public.students enable row level security;
drop policy if exists "anyone can read seniors" on public.students;
create policy "anyone can read seniors" on public.students for select using (true);
-- Everyone may read every column except the password hash. Edits go through update_student().
revoke all on public.students from anon, authenticated;
grant select (id, name, university, quote, photo_url, baby_photo_url, position, created_at, updated_at) on public.students to anon, authenticated;

-- ── Gallery ────────────────────────────────────────────────────────────────
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  url text not null check (char_length(url) <= 500),
  caption text check (char_length(caption) <= 120),
  created_at timestamptz not null default now()
);
alter table public.gallery enable row level security;
drop policy if exists "anyone can read gallery" on public.gallery;
create policy "anyone can read gallery" on public.gallery for select using (true);
revoke all on public.gallery from anon, authenticated;
grant select on public.gallery to anon, authenticated;

-- ── Helpers ────────────────────────────────────────────────────────────────
create or replace function public._clean(p text) returns text
language sql immutable as $$ select nullif(btrim(p), '') $$;

create or replace function public._check_url(p text) returns void
language plpgsql as $$
begin
  -- Only images uploaded to this project's own storage bucket are accepted.
  if p is not null and p !~ '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/photos/' then
    raise exception 'bad_photo_url' using errcode = 'P0001';
  end if;
end $$;

revoke all on function public._clean(text) from public, anon, authenticated;
revoke all on function public._check_url(text) from public, anon, authenticated;

-- ── Public functions ───────────────────────────────────────────────────────
-- A senior edits their own card with their personal password.
create or replace function public.update_student(
  p_id uuid, p_password text, p_university text, p_quote text, p_photo_url text, p_baby_photo_url text
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _check_url(_clean(p_photo_url));
  perform _check_url(_clean(p_baby_photo_url));
  update students set
    university = _clean(p_university),
    quote = _clean(p_quote),
    photo_url = _clean(p_photo_url),
    baby_photo_url = _clean(p_baby_photo_url),
    updated_at = now()
  where id = p_id and pin_hash = crypt(coalesce(p_password, ''), pin_hash);
  if not found then
    raise exception 'wrong_password' using errcode = 'P0001';
  end if;
end $$;

-- Any senior's password lets them add photos to the gallery.
create or replace function public.add_gallery_photo(p_password text, p_url text, p_caption text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare new_id uuid;
begin
  if not exists (select 1 from students where pin_hash = crypt(coalesce(p_password, ''), pin_hash)) then
    raise exception 'wrong_password' using errcode = 'P0001';
  end if;
  if p_url is null then raise exception 'bad_photo_url' using errcode = 'P0001'; end if;
  perform _check_url(p_url);
  insert into gallery (url, caption) values (p_url, _clean(p_caption)) returning id into new_id;
  return new_id;
end $$;

revoke all on function public.update_student(uuid, text, text, text, text, text) from public;
revoke all on function public.add_gallery_photo(text, text, text) from public;
grant execute on function public.update_student(uuid, text, text, text, text, text) to anon, authenticated;
grant execute on function public.add_gallery_photo(text, text, text) to anon, authenticated;

-- ── Photo storage ──────────────────────────────────────────────────────────
-- A public bucket for images only, max 8 MB each (the site shrinks photos before uploading).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone can upload photos" on storage.objects;
create policy "anyone can upload photos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'photos');
