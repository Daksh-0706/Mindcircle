-- Identity PUBLIC keys are public by design: any signed-in member needs them
-- to derive a shared DM key (static-static ECDH, docs/E2EE.md §chats).
-- The private key envelope stays owner-only ("e2ee identities own").
drop policy if exists "e2ee identities public read" on public.e2ee_identities;
create policy "e2ee identities public read"
  on public.e2ee_identities
  for select
  to authenticated
  using (true);
