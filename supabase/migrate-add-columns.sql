-- Run this in the Supabase Dashboard → SQL Editor.
-- (Your live `posts` table is missing these columns, and every save that
-- mentions them currently gets skipped by the schema-safe fallbacks.)

-- Tag labels for writings ("night, love, rain" in the editor)
alter table public.posts
  add column if not exists tags text[];

-- "Feature on home" checkbox → the Featured writings shelf on the homepage
alter table public.posts
  add column if not exists featured boolean default false;

-- Gallery pictures per writing (admin upload)
alter table public.posts
  add column if not exists gallery_images text[];

-- Publish newly tagged/featured rows in PostgREST's schema cache
notify pgrst, 'reload schema';

-- No RLS changes needed: existing policies keep applying to the new columns.
