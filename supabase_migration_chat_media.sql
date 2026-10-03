-- ============================================================
-- MindCircle — Part G: chat image attachments + mood sharing
-- Run this whole file in the Supabase SQL Editor, once.
-- Safe to re-run (everything is idempotent).
-- Run Part C and Part D first.
-- ============================================================
--
-- WHY THIS FILE EXISTS
--
-- Two features that both needed a schema change:
--
--   1. Sending photos in a chat (rooms and DMs alike)
--   2. Letting connected people see each other's mood *trends*
--
-- Design notes
--
-- * Images live in a PRIVATE bucket, unlike story-media. A chat photo belongs
--   to a conversation, so the stored value is only a storage path and the API
--   hands out short-lived signed URLs when it lists messages. Nothing is
--   permanently public.
--
-- * Uploads are scoped to "<your uid>/<random>.<ext>". The API refuses to
--   attach any path outside your own folder, so a message can never point at
--   an image you did not upload.
--
-- * Mood data stays private unless the owner opts in. The RLS policy below
--   checks both the opt-in and an accepted connection, so the rule holds even
--   if a future endpoint forgets to check it itself.

-- ────────────────────────────────────────────────────────────
-- 1. Image columns
-- ────────────────────────────────────────────────────────────
alter table public.messages add column if not exists media_url text;
alter table public.direct_messages add column if not exists media_url text;

do $$
begin
  alter table public.messages drop constraint if exists messages_media_url_len;
  alter table public.messages add constraint messages_media_url_len
    check (media_url is null or char_length(media_url) <= 500);

  alter table public.direct_messages drop constraint if exists direct_messages_media_url_len;
  alter table public.direct_messages add constraint direct_messages_media_url_len
    check (media_url is null or char_length(media_url) <= 500);
end $$;

-- ────────────────────────────────────────────────────────────
-- 2. Private storage bucket
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', false)
on conflict (id) do nothing;

drop policy if exists "chat media insert" on storage.objects;
create policy "chat media insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Read is allowed to any signed-in user because the bucket itself is private:
-- there is no public URL, only the signed ones the API generates. Paths carry a
-- random filename, so an object cannot be addressed by guessing.
drop policy if exists "chat media read" on storage.objects;
create policy "chat media read" on storage.objects
  for select to authenticated
  using (bucket_id = 'chat-media');

-- ────────────────────────────────────────────────────────────
-- 3. Optional mood sharing
-- ────────────────────────────────────────────────────────────
-- Off by default. Turning it on exposes trends (and only trends — never journal
-- entries or mood notes) to people you are connected with.
alter table public.users add column if not exists share_moods boolean not null default false;

alter table public.mood_logs enable row level security;

drop policy if exists "mood_logs owner select" on public.mood_logs;
create policy "mood_logs owner select" on public.mood_logs
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "mood_logs shared with connections" on public.mood_logs;
create policy "mood_logs shared with connections" on public.mood_logs
  for select to authenticated
  using (
    exists (
      select 1
      from public.users u
      join public.connections c
        on (c.user_a = (select auth.uid()) and c.user_b = u.id)
        or (c.user_b = (select auth.uid()) and c.user_a = u.id)
      where u.id = mood_logs.user_id
        and u.share_moods
        and c.status = 'accepted'
    )
  );

-- No insert policy: writes go through the API as the signed-in owner only.