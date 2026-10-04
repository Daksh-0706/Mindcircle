-- ============================================================
-- MindCircle — Pronouns
-- Step 1 of the profile setup collects pronouns, so the column
-- lives next to display_name in public.users.
--
-- Free text on purpose: the app enforces the closed PRONOUNS list
-- in /api/me, but storing text means a new option can be added to
-- the UI without another migration.
--
-- Safe to re-run.
-- ============================================================

alter table public.users add column if not exists pronouns text;

-- Only indexed where a value exists — nearly every row is null, and
-- an index over mostly-null rows is dead weight.
create index if not exists users_pronouns_idx on public.users (pronouns)
  where pronouns is not null;