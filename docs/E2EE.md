# MindCircle End-to-End Encryption (E2EE)

Status: **Phase 1 shipped (journal + foundation); Phase 2 shipped (direct
messages).** Rooms, stories and media still plaintext — see the phase plan.
Everything below is the contract both clients (web + Android) implement, so
read it before touching either crypto module.

## Threat model — what is and is not protected

| Observer | Can they read private content? |
|---|---|
| Someone sniffing network traffic | No (HTTPS/WSS, plaintext never leaves the device) |
| Reading the Postgres DB, a backup, or an SQL dump | No (ciphertext everywhere) |
| Browsing the Supabase dashboard / Storage bucket | No (ciphertext) |
| Someone with a stolen auth session | No (they also need the recovery phrase) |
| The Next.js API routes | No — they move opaque strings |
| **MindCircle itself (operator)** | **Yes, deliberately not possible.** That is the point. |
| A user who loses their 12-word phrase | Nobody can ever recover that data. No exceptions, no support reset. |

Explicitly, the operator gives up: moderation of message/journal contents,
server-side search, and crisis-content detection inside private spaces.
Support messages stay in plaintext **by decision** — the team must read them to reply.

## Cryptographic choices

Only platform-vetted primitives — no homemade cipher, no novel protocol family:

| Purpose | Web | Android |
|---|---|---|
| Key agreement | P-256 ECDH (`crypto.subtle`) | P-256 ECDH (`KeyAgreement` "ECDH") |
| Bulk cipher | AES-256-GCM | AES-256-GCM (`Cipher` "AES/GCM/NoPadding") |
| Key derivation | HKDF-SHA256 | HKDF-SHA256 (implemented over `Mac` "HmacSHA256") |
| Recovery KDF | PBKDF2-HMAC-SHA256, 600 000 iterations | same, `SecretKeyFactory` "PBKDF2WithHmacSHA256" |
| Recovery phrase | BIP-39, 12 words (128-bit entropy + checksum) | same wordlist from `assets/bip39-english.txt` |

## Key hierarchy

```
128-bit random ──BIP-39──▶ 12-word recovery phrase ──PBKDF2(salt=user_id)──▶ KEK
                                                                             │ AES-GCM wraps
ARK (account root key, 32 random bytes) ◀──────────────────────────────────────┘
  ├── HKDF(info="mindcircle:journal:v1") ──▶ journal content key
  ├── wraps identity private key (P-256)   └─ identity PUBLIC key is stored plaintext
  └── HKDF(ECDH with peer, info="mindcircle:dm:v1",
           salt=conversation id)           └─ DM pair keys (Phase 2)
```

- **ARK** is 32 random bytes generated on the user's first device. It never
  reaches the server unencrypted.
- **Identity keypair** — per account, P-256. Its *private* half lives only
  inside the ARK-encrypted account blob; the *public* half is stored plaintext
  on `e2ee_identities` because wrapping conversation keys to a recipient
  requires it. Anyone can derive the shared secret *toward* it; only the
  owner's devices can derive it *back*.
- **Journal key** — derived from the ARK with a fixed HKDF salt, so every device
  that has the ARK has the same journal key with no exchange round trip.
- **DM pair key (Phase 2)** — static-static: `CEK = HKDF(ECDH(myIdPriv,
  peerIdPub), info="mindcircle:dm:v1", salt="dm:<smaller-id>:<larger-id>")`.
  Both sides derive the same key with **no exchange step** — the public key
  table is all the "distribution" there is. Falls back to plaintext (with a
  visible hint) only when the peer has not enrolled yet.

## Envelope format (the only wire format, both clients agree on it)

A stored `content` string is either legacy plaintext (any string that does not
start with `mc1:`) or:

```
mc1:<base64url of compact JSON>
```

- Symmetric envelope: `{"v":1,"iv":"<b64u>","ct":"<b64u>"}` — AES-256-GCM, where
  `iv` is 12 bytes, `ct` includes the 16-byte auth tag. AAD binds purpose, so a
  blob cannot be replayed into a different field.
- ECIES envelope (Phase 2, wrapping to a public key adds `"t":"ecies"` and a
  `"epk"` field holding the *ephemeral* public key).
- AAD values: `mindcircle:content:v1` (message/journal text),
  `mindcircle:ark:v1` (recovery wrap), `mindcircle:account:v1` (identity blob),
  `mindcircle:ck:v1:<conversationId>` (conversation key wrap).
- base64url, **no padding**, stays ASCII-safe in `text` columns.

Detecting legacy rows is therefore `!stored.startsWith("mc1:")` — explicit, not
a silent assumption.

## Server-side storage

`supabase/migrations/012_e2ee.sql` creates:

- `e2ee_identities` — `user_id PK, public_key, encrypted_private_key` (RLS: owner only)
- `e2ee_recovery` — `user_id PK, kdf, iterations, salt, wrapped_root_key` (owner only)
- `e2ee_conversation_keys` — `(conversation_id, user_id) PK, wrapped_key` (Phase 2; owner only)

No service role is ever granted these tables, and the API routes only proxy the
user's own envelopes with their session/RLS. Nothing in the server code can
decrypt.

## Phase plan

1. **Foundation + journal (shipped)** — crypto core on both platforms,
   recovery phrase setup/restore, journal content encryption, Privacy &
   Security settings screens, legacy-entry migration button.
2. **Direct messages (shipped)** — static-static pair key per conversation
   (see *DM pair key* above); message text becomes `mc1:…` on both platforms;
   previews, notifications and the thread view all decrypt client-side.
   Photos are **not yet** sealed (phase 4). Migration 013 adds a read policy
   so any signed-in member can fetch *public* identity keys.
3. **Rooms** — per-room CEK, wrapped to every member's identity key, re-wrapped on join
   (the ECIES wrap in `crypto.ts` already exists for this).
4. **Stories / moods / chat photos** — same helpers, one by one. `mood_tag`
   emoji stays metadata (it renders as an icon in feeds), not encrypted.

Each phase ends with both clients able to read everything the other wrote.

## Honest limitations (documented on purpose)

- Static ECDH means **no forward secrecy**: if an identity key is ever
  extracted offline, past messages sealed to it become readable. Signal-style
  ratchets are the fix and are a Phase 5 item, not a phase-1 shortcut.
- Recovery phrases are brute-force-resistant only because 128 bits of entropy
  back them; users must never invent words.
- Multiple devices work, but the phrase (never the ARK itself) is the
  transfer mechanism — logging in on a second device prompts for it once.
