-- Multiple images per message.
--
-- `media_url` holds a single storage path and predates this change, so it stays:
-- older rows and any client that has not been updated keep working, and
-- `media_paths` is only ever non-null for messages sent after this migration.
--
-- The API reads whichever column is populated (preferring `media_paths`), so a
-- deploy is safe in any order: new code with old rows, old code with new rows
-- both behave. Nothing needs a backfill because a one-image message is exactly
-- a one-element `media_paths` array.

alter table public.messages
  add column if not exists media_paths text[];

alter table public.direct_messages
  add column if not exists media_paths text[];

-- Capped so a message cannot be used to pin an unbounded number of uploads to
-- a row. Nine is WhatsApp's limit and keeps the bubble readable on a phone.
alter table public.messages
  drop constraint if exists messages_media_paths_len;

alter table public.messages
  add constraint messages_media_paths_len
  check (media_paths is null or coalesce(array_length(media_paths, 1), 0) <= 9);

alter table public.direct_messages
  drop constraint if exists direct_messages_media_paths_len;

alter table public.direct_messages
  add constraint direct_messages_media_paths_len
  check (media_paths is null or coalesce(array_length(media_paths, 1), 0) <= 9);

comment on column public.messages.media_paths is
  'Storage paths for a message with several images. Supersedes media_url when set.';

comment on column public.direct_messages.media_paths is
  'Storage paths for a message with several images. Supersedes media_url when set.';
