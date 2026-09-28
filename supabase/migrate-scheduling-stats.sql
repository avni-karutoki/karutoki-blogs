-- Karutoki upgrade: scheduling + likes/views.
-- Run once in Supabase → SQL Editor → New query.
-- Safe to re-run (all statements are IF NOT EXISTS / OR REPLACE).
-- Until you run this, the site keeps working: scheduling, likes and view
-- counts simply stay hidden/disabled and everything else is unaffected.

-- ---------- 1. SCHEDULING ----------
alter table posts
  add column if not exists scheduled_for timestamptz;

create index if not exists posts_scheduled_for_idx
  on posts (scheduled_for);

-- ---------- 2. LIKES + VIEWS ----------
alter table posts
  add column if not exists likes integer not null default 0,
  add column if not exists views integer not null default 0;

-- Public counter updates go through these functions so anonymous visitors
-- can never edit anything else on the post row.
create or replace function increment_post_views(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update posts set views = views + 1 where slug = p_slug;
end;
$$;

create or replace function change_post_likes(p_slug text, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_likes integer;
begin
  if p_delta not in (1, -1) then
    raise exception 'delta must be 1 or -1';
  end if;
  update posts
    set likes = greatest(0, likes + p_delta)
    where slug = p_slug
    returning likes into new_likes;
  return new_likes;
end;
$$;

-- ---------- 3. FULLY AUTOMATIC SCHEDULING (optional) ----------
-- The site already auto-publishes due posts whenever you open /admin.
-- If you want it fully automatic without opening admin, enable pg_cron
-- (Database → Extensions) and uncomment the lines below. It flips due
-- posts to published every 15 minutes.

-- select cron.schedule(
--   'karutoki-publish-due',
--   '*/15 * * * *',
--   $$ update posts set published = true, scheduled_for = null
--      where published = false and scheduled_for is not null
--      and scheduled_for <= now() $$
-- );
