-- ============================================================
-- MindCircle — Part E: profile "About" fields
-- Run this whole file in the Supabase SQL Editor, once.
-- Safe to re-run (everything is idempotent).
-- Run Part C (supabase_migration_profile_setup.sql) and Part D
-- (supabase_migration_profiles.sql) first.
-- ============================================================
--
-- WHY THIS FILE EXISTS
--
-- The "About" screen behind a person's profile shows five things: bio,
-- interests, goals, personality and a short note. The first three already
-- exist; the last two had nowhere to live, so the screen had nothing real to
-- render for them.
--
-- Both are nullable/empty by default so the signup trigger from Part C keeps
-- working untouched.

alter table public.users
  add column if not exists personality text[] not null default '{}',
  add column if not exists note text;

-- Keep it tidy: nothing longer than the UI allows.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'personality'
  ) then
    alter table public.users drop constraint if exists users_personality_count;
    alter table public.users add constraint users_personality_count
      check (array_length(personality, 1) is null or array_length(personality, 1) <= 8);

    alter table public.users drop constraint if exists users_note_len;
    alter table public.users add constraint users_note_len
      check (note is null or char_length(note) <= 160);
  end if;
end $$;