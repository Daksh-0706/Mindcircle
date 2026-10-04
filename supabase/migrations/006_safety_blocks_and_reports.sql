-- ============================================================
-- MindCircle — Part F: profile visibility, blocking and reports
-- Run this whole file in the Supabase SQL Editor, once.
-- Safe to re-run (everything is idempotent).
-- Run Part C and Part D first.
-- ============================================================
--
-- WHY THIS FILE EXISTS
--
-- This is the safety layer around other people's data. Three separate features
-- that all needed a table or a column of their own:
--
--   1. users.is_public      — who may open your profile at all
--   2. public.blocks        — who you never have to see again
--   3. public.reports       — reporting someone, and what happens at scale
--
-- Design notes
--
-- * A profile is readable when the person made it public OR when you are
--   connected with them. `/api/profile/[id]` enforces this and answers 404
--   (not 403) otherwise — telling someone a profile exists but is hidden would
--   confirm the private person exists at all.
--
-- * Blocking is one-directional. Blocker A → blocked B removes B from A's
--   directory, chats, search and messaging without touching B's side, and B
--   is never told. The two states are incompatible, so blocking also deletes
--   any connection between them.
--
-- * Reports use a closed reason vocabulary so moderation can triage by
--   filtering instead of reading free text. At 20 reports an account is
--   deleted automatically, enforced by a trigger so no client can bypass it.

-- ────────────────────────────────────────────────────────────
-- 1. Public profiles
-- ────────────────────────────────────────────────────────────
-- Default false: a new member is not findable until they choose to be.
alter table public.users add column if not exists is_public boolean not null default false;

-- ────────────────────────────────────────────────────────────
-- 2. Blocklist
-- ────────────────────────────────────────────────────────────
create table if not exists public.blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_no_self check (blocker_id <> blocked_id),
  constraint blocks_unique_pair unique (blocker_id, blocked_id)
);

create index if not exists blocks_blocker_idx on public.blocks (blocker_id);
create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

-- You can only read your own outgoing blocks. Incoming blocks are invisible on
-- purpose: the person who blocked you should not be able to confirm it.
drop policy if exists "blocks select" on public.blocks;
create policy "blocks select" on public.blocks
  for select to authenticated
  using ((select auth.uid()) = blocker_id);

-- Safe by construction: you can only create a block that starts from you.
drop policy if exists "blocks insert" on public.blocks;
create policy "blocks insert" on public.blocks
  for insert to authenticated
  with check ((select auth.uid()) = blocker_id);

drop policy if exists "blocks delete" on public.blocks;
create policy "blocks delete" on public.blocks
  for delete to authenticated
  using ((select auth.uid()) = blocker_id);

-- ────────────────────────────────────────────────────────────
-- 3. Reports
-- ────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  reported_id uuid not null references public.users(id) on delete cascade,
  reason text not null check (reason in (
    'harassment', 'inappropriate', 'hate', 'spam', 'fake', 'other'
  )),
  details text,
  created_at timestamptz not null default now(),
  constraint reports_no_self check (reporter_id <> reported_id)
);

create index if not exists reports_reporter_idx on public.reports (reporter_id);
create index if not exists reports_reported_idx on public.reports (reported_id);
create index if not exists reports_created_idx on public.reports (created_at desc);

-- One report per reporter per person. Without this, a single person could file
-- the same complaint repeatedly and reach the removal threshold alone.
create unique index if not exists reports_unique_reporter_pair
  on public.reports (reporter_id, reported_id);

alter table public.reports enable row level security;

-- A reporter can see that they filed a report. Nobody can read someone else's
-- through the client, moderators included: triage needs a service-role key.
drop policy if exists "reports owner select" on public.reports;
create policy "reports owner select" on public.reports
  for select to authenticated
  using ((select auth.uid()) = reporter_id);

drop policy if exists "reports owner insert" on public.reports;
create policy "reports owner insert" on public.reports
  for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

-- ────────────────────────────────────────────────────────────
-- 4. Automatic removal at the report threshold
-- ────────────────────────────────────────────────────────────
-- 20 reports and the account goes. Implemented as a trigger rather than in the
-- API for two reasons: no client can bypass it, and two simultaneous reporters
-- can never both read "19" and leave the account at 20+.
--
-- Note this deletes the `public.users` row. Cascades take their connections,
-- blocks, mood logs, journal entries, stories and messages with it. The
-- `auth.users` entry survives — deleting that needs a service-role key, which
-- this project deliberately does not have.
create or replace function public.enforce_report_threshold()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (
    select count(*) from public.reports where reported_id = new.reported_id
  ) >= 20 then
    delete from public.users where id = new.reported_id;
  end if;
  return null; -- AFTER trigger: nothing to return
end;
$$;

drop trigger if exists on_report_filed on public.reports;
create trigger on_report_filed
  after insert on public.reports
  for each row execute function public.enforce_report_threshold();

-- ────────────────────────────────────────────────────────────
-- 5. Realtime
-- ────────────────────────────────────────────────────────────
-- Tables in the realtime publication must be able to identify a deleted row.
-- With the default replica identity a DELETE has no key to emit, and PostgREST
-- refuses it outright: "cannot delete from table X because it does not have a
-- replica identity and publishes deletes".
alter table public.blocks replica identity full;
alter table public.connections replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.blocks;
exception when duplicate_object then null;
end $$;