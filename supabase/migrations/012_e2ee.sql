-- ============================================================
-- MindCircle E2EE — envelope storage (migration 012)
-- Run in Supabase SQL editor BEFORE deploying the encrypted
-- clients. Matching design: docs/E2EE.md
--
-- Nothing here can decrypt anything: the only thing stored is
-- ciphertext plus a public key. If the client vanishes, these
-- tables are opaque.
-- ============================================================

-- 1. Identity public key + the ARK-encrypted private half ─────────
create table if not exists public.e2ee_identities (
  user_id uuid primary key references auth.users (id) on delete cascade,
  public_key text not null,
  -- "mc1:..." — AES-256-GCM(ARK, private JWK), aad "mindcircle:account:v1"
  encrypted_private_key text not null,
  algo text not null default 'ec-p256',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Recovery: the ARK wrapped by the 12-word phrase ───────────────
create table if not exists public.e2ee_recovery (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kdf text not null default 'pbkdf2-sha256',
  iterations integer not null default 600000,
  salt text not null,                       -- "mindcircle-recovery-v1:{userId}"
  -- "mc1:..." — AES-256-GCM(KEK, ARK), aad "mindcircle:ark:v1"
  wrapped_root_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint e2ee_recovery_iterations_range check (iterations between 100000 and 2000000),
  constraint e2ee_recovery_kdf_value check (kdf = 'pbkdf2-sha256')
);

-- 3. Per-conversation keys, wrapped ECIES-style to each member (Phase 2) ──
create table if not exists public.e2ee_conversation_keys (
  conversation_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  wrapped_key text not null,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create index if not exists e2ee_conversation_keys_user
  on public.e2ee_conversation_keys (user_id);

-- 4. RLS: a row exists for its own user and nobody else, which also means
--    the anon key learns nothing.
alter table public.e2ee_identities enable row level security;
alter table public.e2ee_recovery enable row level security;
alter table public.e2ee_conversation_keys enable row level security;

drop policy if exists "e2ee identities own" on public.e2ee_identities;
create policy "e2ee identities own" on public.e2ee_identities
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "e2ee recovery own" on public.e2ee_recovery;
create policy "e2ee recovery own" on public.e2ee_recovery
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "e2ee conversation keys own" on public.e2ee_conversation_keys;
create policy "e2ee conversation keys own" on public.e2ee_conversation_keys
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- extra defence: no anon or service-level read access through grants
revoke all on public.e2ee_identities from anon;
revoke all on public.e2ee_recovery from anon;
revoke all on public.e2ee_conversation_keys from anon;
