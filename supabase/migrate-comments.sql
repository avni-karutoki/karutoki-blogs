-- ============================================================================
-- Comments for every writing — public threads with replies
-- ----------------------------------------------------------------------------
-- Design:
--   * anyone can read and post comments (no login = the poetry room is open)
--   * replies are just comments with a parent_id (one thread per conversation)
--   * only admins can delete (moderation from the dashboard coming later)
-- Idempotent: safe to re-run.
-- ============================================================================

-- ── Table ────────────────────────────────────────────────────────────────────
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  parent_id uuid references comments (id) on delete cascade,
  author_name text not null default 'Anonymous'
    check (char_length(btrim(author_name)) > 0 and char_length(btrim(author_name)) <= 40),
  content text not null
    check (char_length(btrim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on comments (post_id, created_at);
create index if not exists comments_parent_idx on comments (parent_id);

-- ── Row level security ──────────────────────────────────────────────────────
alter table comments enable row level security;

-- Falling back to "do nothing on conflict" style guards — policies on this
-- table match the conventions used in schema.sql (admins via app_metadata).

create policy "Anyone can read comments"
  on comments for select
  using (true);

create policy "Anyone can leave a comment or reply"
  on comments for insert
  with check (
    char_length(btrim(content)) between 1 and 1000
    and char_length(btrim(coalesce(author_name, 'Anonymous'))) <= 40
  );

create policy "Admins can delete comments"
  on comments for delete
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- (No update policy — comments are write-once; author keeps their words as-is.)
