-- ============================================================
-- MindCircle — Part C: profile provisioning for new accounts
-- Run this whole file in the Supabase SQL Editor, once.
-- Safe to re-run (everything is idempotent).
-- Run Part A (supabase_migration_auth.sql) and Part B
-- (supabase_migration_real_data.sql) first if you haven't.
-- ============================================================
--
-- WHY THIS FILE EXISTS
--
-- `public.users` only ever got SELECT + UPDATE policies, and row creation
-- was left to the `handle_new_user()` trigger. On the live project that
-- trigger was missing, so every new signup had no `users` row at all:
--
--   [api] profile/ensure insert: 42501 new row violates row-level
--   security policy for table "users"
--   GET /api/me 500   (it does .single() on a row that does not exist)
--
-- That also broke the profile-setup gate in AppLayout, which reads
-- /api/me to decide whether to send someone to /onboarding.
--
-- This file fixes it on both levels: the trigger is reinstalled (so rows
-- are created automatically at signup) *and* an INSERT policy is added
-- (so /api/profile/ensure can still create a row if the trigger is ever
-- missing). Belt and braces, because a missing profile row breaks the
-- dashboard in ways that look unrelated to signup.

-- ────────────────────────────────────────────────────────────
-- 1. users INSERT policy — the caller may only insert their own row
-- ────────────────────────────────────────────────────────────
-- Safe by construction: `with check` pins the new row's id to the
-- caller's own auth uid, so nobody can plant a row for someone else.
drop policy if exists "users owner insert" on public.users;
create policy "users owner insert" on public.users
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

-- ────────────────────────────────────────────────────────────
-- 2. Reinstall the auto-create trigger on auth.users
-- ────────────────────────────────────────────────────────────
-- SECURITY DEFINER so it bypasses RLS entirely; `search_path` pinned so
-- this cannot be hijacked via a poisoned schema.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, anonymous_id, avatar_emoji)
  values (new.id, new.email,
          'anon-' || substr(md5(new.id::text), 1, 8), '😊')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 3. Backfill every auth user that never got a row
-- ────────────────────────────────────────────────────────────
-- This is what repairs the accounts you already signed up while the
-- trigger was missing.
insert into public.users (id, email, anonymous_id, avatar_emoji)
select id, email,
       'anon-' || substr(md5(id::text), 1, 8), '😊'
from auth.users
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- 4. Orphan rows — auth users deleted from the dashboard but still
--    referenced by public.users. The FK cascade usually handles this,
--    but older rows can predate the constraint.
-- ────────────────────────────────────────────────────────────
--    delete from public.users
--    where id not in (select id from auth.users);
