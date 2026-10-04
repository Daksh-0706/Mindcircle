-- Allow a sender to delete a message they sent, in both DMs and rooms.
--
-- Room messages already had `is_deleted` and a sender-scoped UPDATE policy, so
-- rooms needed nothing new. DMs had neither, and their two existing SELECT
-- policies are *permissive*: Postgres ORs multiple permissive policies together,
-- so adding a stricter one alongside them would change nothing — the old,
-- looser policy would still let deleted rows through. Both have to be replaced
-- rather than added to.
--
-- Deletion is soft but scrubs the content: the row stays so the thread keeps its
-- shape and the "this message was deleted" placeholder has something to render,
-- while `content` and `media_paths` are emptied. On a mental health app, a
-- message someone chose to retract should not linger in the database — only the
-- fact that it existed.

alter table public.direct_messages
  add column if not exists is_deleted boolean not null default false;

comment on column public.direct_messages.is_deleted is
  'Set when the sender deleted their own message. Content is cleared at the same time.';

-- ── direct_messages ────────────────────────────────────────────────

drop policy if exists "Users can view own DMs" on public.direct_messages;
drop policy if exists "dm participant select" on public.direct_messages;

create policy "dm participant select"
  on public.direct_messages for select
  using (
    (sender_id = auth.uid() or receiver_id = auth.uid())
    and is_deleted = false
  );

-- Scoped to the sender on purpose: a recipient may read a message but must not
-- be able to remove it from the other person's history.
create policy "dm sender update"
  on public.direct_messages for update
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- ── messages (rooms) ───────────────────────────────────────────────

-- Existing "messages member select" hides deleted rows at the app level, but
-- RLS still let them through. Adding the flag here means a deleted room
-- message cannot be read even with a valid session.
drop policy if exists "messages member select" on public.messages;

create policy "messages member select"
  on public.messages for select
  using (
    (not is_deleted)
    and exists (
      select 1 from room_members rm
      where rm.room_id = messages.room_id and rm.user_id = auth.uid()
    )
  );
