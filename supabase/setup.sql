-- Class of 2027 yearbook: database setup for Supabase.
-- Paste this whole file into Supabase → SQL Editor → New query, change the class code
-- on the line marked CHANGE ME, then press Run. Safe to run again.

create extension if not exists pgcrypto with schema extensions;

-- ── Settings (private: no one can read this table through the API) ──────────
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  class_code_hash text not null,
  max_students int not null default 14
);
alter table public.settings enable row level security;
revoke all on public.settings from anon, authenticated;

insert into public.settings (id, class_code_hash, max_students)
values (1, extensions.crypt('CHANGE-ME', extensions.gen_salt('bf')), 14)   -- ← CHANGE ME: the class code everyone types to add things
on conflict (id) do update set class_code_hash = excluded.class_code_hash, max_students = excluded.max_students;

-- ── Seniors ────────────────────────────────────────────────────────────────
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  university text check (char_length(university) <= 80),
  quote text check (char_length(quote) <= 200),
  photo_url text not null check (char_length(photo_url) <= 500),
  baby_photo_url text check (char_length(baby_photo_url) <= 500),
  pin_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.students enable row level security;
drop policy if exists "anyone can read seniors" on public.students;
create policy "anyone can read seniors" on public.students for select using (true);
-- Everyone may read every column except the PIN hash. All writes go through the functions below.
revoke all on public.students from anon, authenticated;
grant select (id, name, university, quote, photo_url, baby_photo_url, created_at, updated_at) on public.students to anon, authenticated;

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
create or replace function public._check_class_code(p_code text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (select 1 from settings where class_code_hash = crypt(coalesce(p_code, ''), class_code_hash)) then
    raise exception 'wrong_class_code' using errcode = 'P0001';
  end if;
end $$;

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

create or replace function public._check_pin(p_pin text) returns void
language plpgsql as $$
begin
  if p_pin is null or p_pin !~ '^[0-9]{4,8}$' then
    raise exception 'bad_pin' using errcode = 'P0001';
  end if;
end $$;

revoke all on function public._check_class_code(text) from public, anon, authenticated;
revoke all on function public._check_url(text) from public, anon, authenticated;
revoke all on function public._check_pin(text) from public, anon, authenticated;
revoke all on function public._clean(text) from public, anon, authenticated;

-- ── Public functions ───────────────────────────────────────────────────────
create or replace function public.add_student(
  p_class_code text, p_pin text, p_name text, p_university text, p_quote text, p_photo_url text, p_baby_photo_url text
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare new_id uuid;
begin
  perform _check_class_code(p_class_code);
  perform _check_pin(p_pin);
  perform _check_url(p_photo_url);
  perform _check_url(_clean(p_baby_photo_url));
  if (select count(*) from students) >= (select max_students from settings) then
    raise exception 'class_full' using errcode = 'P0001';
  end if;
  insert into students (name, university, quote, photo_url, baby_photo_url, pin_hash)
  values (btrim(p_name), _clean(p_university), _clean(p_quote), p_photo_url, _clean(p_baby_photo_url), crypt(p_pin, gen_salt('bf')))
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.update_student(
  p_id uuid, p_pin text, p_name text, p_university text, p_quote text, p_photo_url text, p_baby_photo_url text
) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _check_url(p_photo_url);
  perform _check_url(_clean(p_baby_photo_url));
  update students set
    name = btrim(p_name),
    university = _clean(p_university),
    quote = _clean(p_quote),
    photo_url = p_photo_url,
    baby_photo_url = _clean(p_baby_photo_url),
    updated_at = now()
  where id = p_id and pin_hash = crypt(coalesce(p_pin, ''), pin_hash);
  if not found then
    raise exception 'wrong_pin' using errcode = 'P0001';
  end if;
end $$;

create or replace function public.delete_student(p_id uuid, p_pin text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  delete from students where id = p_id and pin_hash = crypt(coalesce(p_pin, ''), pin_hash);
  if not found then
    raise exception 'wrong_pin' using errcode = 'P0001';
  end if;
end $$;

create or replace function public.add_gallery_photo(p_class_code text, p_url text, p_caption text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare new_id uuid;
begin
  perform _check_class_code(p_class_code);
  perform _check_url(p_url);
  if p_url is null then raise exception 'bad_photo_url' using errcode = 'P0001'; end if;
  insert into gallery (url, caption) values (p_url, _clean(p_caption)) returning id into new_id;
  return new_id;
end $$;

revoke all on function public.add_student(text, text, text, text, text, text, text) from public;
revoke all on function public.update_student(uuid, text, text, text, text, text, text) from public;
revoke all on function public.delete_student(uuid, text) from public;
revoke all on function public.add_gallery_photo(text, text, text) from public;
grant execute on function public.add_student(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.update_student(uuid, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.delete_student(uuid, text) to anon, authenticated;
grant execute on function public.add_gallery_photo(text, text, text) to anon, authenticated;

-- ── Photo storage ──────────────────────────────────────────────────────────
-- A public bucket for images only, max 8 MB each (the site shrinks photos before uploading).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anyone can upload photos" on storage.objects;
create policy "anyone can upload photos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'photos');
