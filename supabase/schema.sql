-- Run this once in your Supabase project's SQL editor (Project → SQL Editor → New query).
-- Everything here fits comfortably in Supabase's free tier.

create extension if not exists "pgcrypto";

-- ---------- ADMINS ----------
-- Whoever's email is in this table can log into /admin and manage posts.
-- Add your own email as a row once you've created your Supabase Auth user
-- (Authentication → Users → Add user), then run:
--   insert into admins (email) values ('you@example.com');
create table if not exists admins (
  email text primary key
);

alter table admins enable row level security;
-- No policies on purpose: this table is never read from the public site,
-- only referenced inside other tables' policies below.

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

create policy "Public can read published posts"
  on posts for select
  using (published = true);

create policy "Admins can read all posts"
  on posts for select
  using (exists (select 1 from admins where email = auth.jwt() ->> 'email'));

create policy "Admins can insert posts"
  on posts for insert
  with check (exists (select 1 from admins where email = auth.jwt() ->> 'email'));

create policy "Admins can update posts"
  on posts for update
  using (exists (select 1 from admins where email = auth.jwt() ->> 'email'));

create policy "Admins can delete posts"
  on posts for delete
  using (exists (select 1 from admins where email = auth.jwt() ->> 'email'));

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

alter table contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on contact_messages for select
  using (exists (select 1 from admins where email = auth.jwt() ->> 'email'));

-- ---------- NEWSLETTER SUBSCRIBERS ----------
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "Admins can read subscribers"
  on newsletter_subscribers for select
  using (exists (select 1 from admins where email = auth.jwt() ->> 'email'));

-- ---------- SITE SETTINGS ----------
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "Anyone can read site settings"
  on site_settings for select
  using (true);

create policy "Admins can update site settings"
  on site_settings for all
  using (exists (select 1 from admins where email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admins where email = auth.jwt() ->> 'email'));

-- Insert default site settings
insert into site_settings (key, value) values
  ('hero', '{"title": "Words that were never said.", "subtitle": "Poems, blogs, and midnight thoughts — a little corner for everything in between.", "buttonText": "Explore writings"}'::jsonb),
  ('about', '{"title": "A little, about me!", "subtitle": "The girl behind the words", "bio": "Hi, I''m Avni aka Karutoki. I write in between the moments when words feel like the only thing that makes sense."}'::jsonb)
on conflict (key) do nothing;

-- ---------- SAMPLE DATA (optional — delete this block if you don't want it) ----------
insert into posts (slug, title, excerpt, content, category, reading_time)
values
  (
    'tired-of-the-same-sky',
    'Tired of the same sky.',
    'A little poem about the nights when you feel everything but nothing.',
    E'Some nights feel strangely familiar.\n\nThe sky hasn''t changed,\nthe stars are still somewhere above,\nand yet something feels different.\n\nMaybe it''s not the sky\nthat we get tired of looking at.\n\nMaybe it''s everything\nwe carry underneath it.',
    'poem',
    '3 min'
  ),
  (
    'the-quiet-in-between',
    'The quiet in between.',
    'A few words on stillness, and what it teaches you.',
    E'The quiet in between two thoughts is where I have learned the most about myself.',
    'blog',
    '4 min'
  ),
  (
    'maybe-it-will-be-different',
    'Maybe it will be different.',
    'Midnight thoughts on starting over.',
    E'It is 1am and I am thinking about all the ways things could still turn out fine.',
    'midnight-talk',
    '2 min'
  )
on conflict (slug) do nothing;
