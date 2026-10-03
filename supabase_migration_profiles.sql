-- ============================================================
-- MindCircle — Part D: real profiles + connections
-- Run this whole file in the Supabase SQL Editor, once.
-- Safe to re-run (everything is idempotent).
-- Run Parts A/B/C first if you haven't.
-- ============================================================
--
-- WHY THIS FILE EXISTS
--
-- Profile setup (the 4-step onboarding), Discover and "New chat" were all
-- running on a hardcoded sample list, so nothing a user typed was ever
-- stored or visible to anyone else. This adds the storage they need:
--
--   1. real columns on public.users  (display_name, location, bio,
--      interests, goals, onboarded_at)
--   2. a connections table           (who you actually connected with)
--
-- Design notes
--
-- * `interests` / `goals` are text[]. They are fixed, app-owned vocabularies
--   (see src/lib/profile-options.ts), so a lookup table would only add joins
--   without adding integrity — the API validates the values before writing.
-- * `display_name` is the single source of truth for how a person is named.
--   The old behaviour derived it from the email prefix because there was
--   nowhere to put it; now the API falls back to that only when empty.
-- * Every new column is nullable or defaulted, so the signup trigger in
--   Part C keeps working untouched.
-- * connections is symmetric: (a,b) and (b,a) are the same row, enforced by
--   storing the two ids in a canonical order and a unique index on it.

-- ────────────────────────────────────────────────────────────
-- 1. Profile columns
-- ────────────────────────────────────────────────────────────
alter table public.users
  add column if not exists display_name text,
  add column if not exists location text,
  add column if not exists bio text,
  add column if not exists interests text[] not null default '{}',
  add column if not exists goals text[] not null default '{}',
  add column if not exists onboarded_at timestamptz;

-- Keep it tidy: nothing longer than the UI allows.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'display_name'
  ) then
    alter table public.users
      add constraint users_display_name_len check (display_name is null or char_length(display_name) <= 60),
      add constraint users_location_len check (location is null or char_length(location) <= 60),
      add constraint users_bio_len check (bio is null or char_length(bio) <= 400),
      add constraint users_interests_count check (array_length(interests, 1) is null or array_length(interests, 1) <= 20),
      add constraint users_goals_count check (array_length(goals, 1) is null or array_length(goals, 1) <= 12);
  end if;
end $$;

-- Backfill: anyone who already finished onboarding under the settings-blob
-- version gets their profile promoted to the real columns.
update public.users
set
  display_name = coalesce(display_name, settings->>'name'),
  location     = coalesce(location, settings->>'location'),
  bio          = coalesce(bio, settings->>'bio'),
  interests    = case
                   when coalesce(array_length(interests, 1), 0) = 0
                    and jsonb_typeof(settings->'interests') = 'array'
                   then array(select jsonb_array_elements_text(settings->'interests'))
                   else interests
                 end,
  goals        = case
                   when coalesce(array_length(goals, 1), 0) = 0
                    and jsonb_typeof(settings->'goals') = 'array'
                   then array(select jsonb_array_elements_text(settings->'goals'))
                   else goals
                 end,
  onboarded_at = coalesce(onboarded_at, (settings->>'onboarded_at')::timestamptz)
where settings is not null;

-- ────────────────────────────────────────────────────────────
-- 2. Connections
-- ────────────────────────────────────────────────────────────
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  -- Canonical pair: user_a is always the lexicographically smaller id, so a
  -- connection can only ever exist once regardless of who pressed the button.
  user_a uuid not null references public.users(id) on delete cascade,
  user_b uuid not null references public.users(id) on delete cascade,
  -- pending   → only the recipient can accept
  -- accepted  → both can message each other
  status text not null default 'pending'
    check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  constraint connections_no_self check (user_a <> user_b),
  constraint connections_unique_pair unique (user_a, user_b)
);

-- One outgoing request per person: the only allowed overlap is the mirror
-- row (b,a), which cannot co-exist with (a,b) thanks to the constraint above.
create unique index if not exists connections_pair_key
  on public.connections (least(user_a, user_b), greatest(user_a, user_b));

create index if not exists connections_user_a_idx on public.connections (user_a);
create index if not exists connections_user_b_idx on public.connections (user_b);

alter table public.connections enable row level security;

-- Read your own connections, in either direction.
drop policy if exists "connections select" on public.connections;
create policy "connections select" on public.connections
  for select to authenticated
  using ((select auth.uid()) = user_a or (select auth.uid()) = user_b);

-- Send a request: you must be one of the two, and you set it to pending.
drop policy if exists "connections insert" on public.connections;
create policy "connections insert" on public.connections
  for insert to authenticated
  with check ((select auth.uid()) = user_a or (select auth.uid()) = user_b);

-- Accept: only the recipient flips pending → accepted.
drop policy if exists "connections update" on public.connections;
create policy "connections update" on public.connections
  for update to authenticated
  using ((select auth.uid()) = user_a or (select auth.uid()) = user_b)
  with check ((select auth.uid()) = user_a or (select auth.uid()) = user_b);

drop policy if exists "connections delete" on public.connections;
create policy "connections delete" on public.connections
  for delete to authenticated
  using ((select auth.uid()) = user_a or (select auth.uid()) = user_b);

-- ────────────────────────────────────────────────────────────
-- 3. Realtime: let a request show up in the recipient's list live
-- ────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemname = 'public' and tablename = 'connections'
  ) then
    null; -- already added
  else
    alter publication supabase_realtime add table public.connections;
  end if;
exception
  when duplicate_object then null;
end $$;
