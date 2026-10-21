-- =========================================================
-- KARUTOKI BLOGS — SUPABASE SCHEMA (canonical)
-- =========================================================
-- Run this once in your Supabase project's SQL editor
-- (Project → SQL Editor → New query).
--
-- Safe to re-run: every statement is `if not exists`, `drop policy if
-- exists` + `create policy`, or `create or replace`.
--
-- Everything here fits comfortably in Supabase's free tier.
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------- ADMIN AUTHORIZATION ----------
-- Administrative access is a flag on the Supabase Auth user:
--     (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
-- which is exactly what `isAdminUser()` in
-- src/lib/supabase/authorization.ts checks. Never use `user_metadata`
-- for this — signed-in users can edit their own user_metadata.
--
-- To become an admin (Supabase → Authentication → Users → Add user first):
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
--   where id = 'PASTE-YOUR-USER-ID';

-- ---------- POSTS ----------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  category text not null default 'poem', -- 'poem' | 'blog' | 'midnight-talk'
  cover_image text,                        -- public Supabase Storage URL, optional
  reading_time text,                       -- e.g. '3 min'
  tags text[] default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_category_idx on posts (category);
create index if not exists posts_created_at_idx on posts (created_at desc);

alter table posts enable row level security;

drop policy if exists "Public can read published posts" on posts;
drop policy if exists "Admins can read all posts" on posts;
drop policy if exists "Admins can insert posts" on posts;
drop policy if exists "Admins can update posts" on posts;
drop policy if exists "Admins can delete posts" on posts;

-- Anyone can read published posts.
create policy "Public can read published posts"
  on posts for select
  using (published = true);

-- Admins can read everything, including drafts.
create policy "Admins can read all posts"
  on posts for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can insert posts"
  on posts for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update posts"
  on posts for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete posts"
  on posts for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- CONTACT MESSAGES ----------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on contact_messages (created_at desc);

alter table contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on contact_messages;
drop policy if exists "Admins can read contact messages" on contact_messages;
drop policy if exists "Admins can update contact messages" on contact_messages;
drop policy if exists "Admins can delete contact messages" on contact_messages;

create policy "Anyone can submit a contact message"
  on contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on contact_messages for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update contact messages"
  on contact_messages for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete contact messages"
  on contact_messages for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- NEWSLETTER SUBSCRIBERS ----------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

drop policy if exists "Anyone can subscribe" on newsletter_subscribers;
drop policy if exists "Admins can read subscribers" on newsletter_subscribers;

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "Admins can read subscribers"
  on newsletter_subscribers for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- SITE SETTINGS ----------
-- Key/value store for the editable Hero and About copy
-- (managed from /admin → Hero & About Managers).
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

drop policy if exists "Public can read site settings" on site_settings;
drop policy if exists "Admins can update site settings" on site_settings;

create policy "Public can read site settings"
  on site_settings for select
  using (true);

create policy "Admins can update site settings"
  on site_settings for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed defaults. Existing rows are left untouched.
insert into site_settings (key, value) values
  ('hero', '{"title": "Words that were never said.", "subtitle": "Poems, blogs, and midnight thoughts — a little corner for everything in between.", "buttonText": "Explore writings"}'::jsonb),
  ('about', '{"title": "A little, about me!", "subtitle": "The girl behind the words", "bio": "Hi, I''m Avni aka Karutoki. I write in between the moments when words feel like the only thing that makes sense."}'::jsonb)
on conflict (key) do nothing;

-- ---------- POST IMAGE STORAGE ----------
-- Public bucket for cover images. The public URL is stored on
-- posts.cover_image.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read post images" on storage.objects;
drop policy if exists "Admins can upload post images" on storage.objects;
drop policy if exists "Admins can update post images" on storage.objects;
drop policy if exists "Admins can delete post images" on storage.objects;

create policy "Public can read post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Admins can upload post images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can update post images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'post-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  with check (
    bucket_id = 'post-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admins can delete post images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'post-images'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
