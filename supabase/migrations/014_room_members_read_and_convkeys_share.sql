-- Phase 3 (rooms): members need two extra abilities.
--
-- 1. See WHO ELSE is in a room they belong to (ids only) — the client wraps
--    the room's content key to every member's identity public key. Without
--    this, only your own membership row is visible ("room_members own select").
--
-- 2. Write key-wraps for OTHER members of a room into e2ee_conversation_keys.
--    A wrap is sealed to the recipient's own identity key, so only they can
--    open it; a malicious insert can at worst displace a wrap (self-healing —
--    the next send re-wraps everyone), never read anything.
--
-- Owner-only select/update/delete on that table is unchanged.

drop policy if exists "room members of my rooms" on public.room_members;
create policy "room members of my rooms"
  on public.room_members
  for select
  to authenticated
  using (
    exists (
      select 1 from public.room_members me
      where me.room_id = room_members.room_id and me.user_id = auth.uid()
    )
  );

drop policy if exists "e2ee conversation keys share" on public.e2ee_conversation_keys;
create policy "e2ee conversation keys share"
  on public.e2ee_conversation_keys
  for insert
  to authenticated
  with check (true);
