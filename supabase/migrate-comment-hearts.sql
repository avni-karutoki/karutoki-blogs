-- Karutoki upgrade: comment hearts + moderation support.
-- Run once in Supabase → SQL Editor → New query. Safe to re-run.
-- Until you run this, hearts simply stay hidden and everything else is fine.

-- ---------- 1. HEARTS ON COMMENTS ----------
alter table comments
  add column if not exists likes integer not null default 0;

create or replace function change_comment_likes(p_comment_id uuid, p_delta integer)
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
  update comments
    set likes = greatest(0, likes + p_delta)
    where id = p_comment_id
    returning likes into new_likes;
  return new_likes;
end;
$$;
