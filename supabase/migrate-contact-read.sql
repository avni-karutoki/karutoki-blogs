-- Run this in the Supabase Dashboard → SQL Editor.
-- Fixes the admin "Mark Read" toggle if messages refuse to leave Unread.
--
-- 1) The live table may predate the `read` column — schema.sql's
--    create-if-not-exists never adds columns to an existing table.
-- 2) The update policy may be missing on an older database.

alter table public.contact_messages
  add column if not exists read boolean not null default false;

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
drop policy if exists "Admins can read contact messages" on public.contact_messages;
drop policy if exists "Admins can update contact messages" on public.contact_messages;
drop policy if exists "Admins can delete contact messages" on public.contact_messages;

create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);

-- admin = JWT app_metadata.role == 'admin' (same rule as posts)
create policy "Admins can read contact messages"
  on public.contact_messages for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update contact messages"
  on public.contact_messages for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Publish the refreshed policies/columns in PostgREST's schema cache.
notify pgrst, 'reload schema';
