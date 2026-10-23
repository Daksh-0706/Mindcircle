-- Give the support form a real destination.
--
-- The form on /app/help/support used to be a pure `mailto:` handoff: nothing
-- was stored and nothing was delivered until the visitor also pressed send in
-- their own mail client. Anyone without a mail client configured — which is
-- most phones — wrote a message and watched nothing happen. This table is the
-- destination the form writes to, so a message is kept the moment it is sent.
--
-- Staff read it through the service role (Supabase dashboard or a console
-- query). No policy here grants that, and none should: a support inbox is not
-- something an end user may enumerate.

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  -- Null when the sender was not signed in, which is allowed: the help pages
  -- are public and someone locked out of their account still needs to reach us.
  user_id uuid references auth.users (id) on delete set null,
  -- Null only when neither the optional field nor the account address exists.
  email text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint support_messages_subject_len
    check (char_length(subject) between 4 and 140),
  constraint support_messages_message_len
    check (char_length(message) between 10 and 4000),
  constraint support_messages_email_len
    check (email is null or char_length(email) <= 320)
);

comment on table public.support_messages is
  'Messages filed from /app/help/support. Read by staff via the service role.';

create index if not exists support_messages_created_at_idx
  on public.support_messages (created_at desc);

alter table public.support_messages enable row level security;

-- Write-only for everyone. Inserts are allowed for `anon` because the page is
-- public; there is deliberately no SELECT policy for `anon`, so a visitor can
-- never read back a row — not their own, and certainly not anyone else's.
drop policy if exists "support anyone insert" on public.support_messages;
create policy "support anyone insert"
  on public.support_messages for insert to anon, authenticated
  with check (true);

-- A signed-in author may read their own messages, so the confirmation state can
-- show what was actually stored if it ever needs to.
drop policy if exists "support author select" on public.support_messages;
create policy "support author select"
  on public.support_messages for select to authenticated
  using (user_id = auth.uid());

grant insert on public.support_messages to anon, authenticated;
grant select on public.support_messages to authenticated;
