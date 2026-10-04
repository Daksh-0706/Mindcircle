-- ============================================================
-- MindCircle — Part B: real data enablement
-- Run this whole file in the Supabase SQL Editor, once.
-- Safe to re-run (idempotent).
-- Run Part A (supabase_migration_auth.sql) first if you haven't.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. users.settings column (Settings page persistence)
-- ────────────────────────────────────────────────────────────
alter table public.users
  add column if not exists settings jsonb not null default '{}'::jsonb;

-- ────────────────────────────────────────────────────────────
-- 1. story_likes table (real like counts on stories)
-- ────────────────────────────────────────────────────────────
create table if not exists public.story_likes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (story_id, user_id)
);

alter table public.story_likes enable row level security;

drop policy if exists "story_likes select" on public.story_likes;
create policy "story_likes select"
  on public.story_likes for select
  using (true);

drop policy if exists "story_likes insert" on public.story_likes;
create policy "story_likes insert"
  on public.story_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "story_likes delete" on public.story_likes;
create policy "story_likes delete"
  on public.story_likes for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 2. RLS policies on existing tables
--    (drop if exists + recreate → consistent and idempotent)
-- ────────────────────────────────────────────────────────────

-- mood_logs ──────────────────────────────────────────────────
alter table public.mood_logs enable row level security;
drop policy if exists "mood_logs owner select" on public.mood_logs;
create policy "mood_logs owner select" on public.mood_logs
  for select using (auth.uid() = user_id);
drop policy if exists "mood_logs owner insert" on public.mood_logs;
create policy "mood_logs owner insert" on public.mood_logs
  for insert with check (auth.uid() = user_id);
drop policy if exists "mood_logs owner delete" on public.mood_logs;
create policy "mood_logs owner delete" on public.mood_logs
  for delete using (auth.uid() = user_id);

-- journal_entries ────────────────────────────────────────────
alter table public.journal_entries enable row level security;
drop policy if exists "journal owner select" on public.journal_entries;
create policy "journal owner select" on public.journal_entries
  for select using (auth.uid() = user_id);
drop policy if exists "journal owner insert" on public.journal_entries;
create policy "journal owner insert" on public.journal_entries
  for insert with check (auth.uid() = user_id);
drop policy if exists "journal owner update" on public.journal_entries;
create policy "journal owner update" on public.journal_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "journal owner delete" on public.journal_entries;
create policy "journal owner delete" on public.journal_entries
  for delete using (auth.uid() = user_id);

-- stories (public anonymous feed, owner-managed) ─────────────
alter table public.stories enable row level security;
drop policy if exists "stories select" on public.stories;
create policy "stories select" on public.stories
  for select to authenticated using (true);
drop policy if exists "stories owner insert" on public.stories;
create policy "stories owner insert" on public.stories
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "stories owner delete" on public.stories;
create policy "stories owner delete" on public.stories
  for delete to authenticated using (auth.uid() = user_id);

-- chat_rooms (visible to any signed-in user) ─────────────────
alter table public.chat_rooms enable row level security;
drop policy if exists "chat_rooms select" on public.chat_rooms;
create policy "chat_rooms select" on public.chat_rooms
  for select to authenticated using (true);

-- room_members (see/join your own memberships) ───────────────
alter table public.room_members enable row level security;
drop policy if exists "room_members own select" on public.room_members;
create policy "room_members own select" on public.room_members
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "room_members own insert" on public.room_members;
create policy "room_members own insert" on public.room_members
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "room_members own delete" on public.room_members;
create policy "room_members own delete" on public.room_members
  for delete to authenticated using (auth.uid() = user_id);

-- messages (only room members read/write) ────────────────────
alter table public.messages enable row level security;
drop policy if exists "messages member select" on public.messages;
create policy "messages member select" on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = messages.room_id and rm.user_id = auth.uid()
    )
  );
drop policy if exists "messages member insert" on public.messages;
create policy "messages member insert" on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.room_members rm
      where rm.room_id = messages.room_id and rm.user_id = auth.uid()
    )
  );
drop policy if exists "messages sender update" on public.messages;
create policy "messages sender update" on public.messages
  for update to authenticated
  using (sender_id = auth.uid()) with check (sender_id = auth.uid());

-- direct_messages (only the two participants) ────────────────
alter table public.direct_messages enable row level security;
drop policy if exists "dm participant select" on public.direct_messages;
create policy "dm participant select" on public.direct_messages
  for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());
drop policy if exists "dm sender insert" on public.direct_messages;
create policy "dm sender insert" on public.direct_messages
  for insert to authenticated
  with check (sender_id = auth.uid());

-- matches (only the two matched users) ───────────────────────
alter table public.matches enable row level security;
drop policy if exists "matches participant select" on public.matches;
create policy "matches participant select" on public.matches
  for select to authenticated
  using (user1_id = auth.uid() or user2_id = auth.uid());

-- users (public anonymous profile info, owner-managed) ───────
alter table public.users enable row level security;
drop policy if exists "users select" on public.users;
create policy "users select" on public.users
  for select to authenticated using (true);
drop policy if exists "users owner update" on public.users;
create policy "users owner update" on public.users
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ────────────────────────────────────────────────────────────
-- 3. Realtime: messages + direct_messages broadcast changes
-- ────────────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'direct_messages'
  ) then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end $$;

-- ────────────────────────────────────────────────────────────
-- 4. Storage: public 'story-media' bucket, folder-per-user
--    Upload path must be: <auth.uid()>/<filename>
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('story-media', 'story-media', true)
on conflict (id) do update set public = true;

drop policy if exists "story-media insert own folder" on storage.objects;
create policy "story-media insert own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'story-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "story-media public read" on storage.objects;
create policy "story-media public read" on storage.objects
  for select using (bucket_id = 'story-media');

drop policy if exists "story-media delete own folder" on storage.objects;
create policy "story-media delete own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'story-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ────────────────────────────────────────────────────────────
-- 5. Demo seed (only when empty — delete rows to reset)
-- ────────────────────────────────────────────────────────────
insert into public.chat_rooms (name, is_active)
select v.name, true
from (values ('Quiet mornings'), ('Exam overwhelm'), ('Anonymous support')) as v(name)
where not exists (
  select 1 from public.chat_rooms where name = v.name
);

-- Sample anonymous stories, attributed to the first signed-up
-- user only so FK constraints hold. Skipped until Part A has
-- run and at least one user exists.
insert into public.stories (user_id, content, mood_emoji, is_active, expires_at)
select
  (select id from public.users order by created_at limit 1),
  v.content, v.emoji, true, now() + interval '48 hours'
from (values
  ('Today was overwhelming but I found a quiet moment during lunch to just breathe. Sometimes the smallest pauses make the biggest difference. 🌿', '😌'),
  ('Reminder to everyone: it''s okay to not be okay. You don''t have to have it all figured out. Take it one moment at a time. 💜', '😐'),
  ('Started journaling again after a break. Forgot how much it helps to get thoughts out of my head and onto the page. Day 1: feeling hopeful.', '😊')
) as v(content, emoji)
where (select id from public.users order by created_at limit 1) is not null
  and not exists (select 1 from public.stories);
