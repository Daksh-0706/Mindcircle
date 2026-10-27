'use client'

/**
 * Chats E2EE (docs/E2EE.md §chats): direct messages and rooms.
 *
 * DMs derive one 32-byte conversation key (CEK) with static-static
 * ECDH — my identity private key against the peer's identity PUBLIC key — so
 * there is no key-distribution step, no per-device table, and the same key
 * exists on every device once the phrase has unlocked the vault. The HKDF
 * salt is the canonical conversation id (`dm:<smaller-id>:<larger-id>`), which
 * binds the key to exactly this pair of people.
 *
 * Rooms (multi-party) use a random CEK wrapped to each member's identity key
 * via ECIES — see the rooms section below.
 *
 * Messages ride the same `mc1:` envelope as everything else. A row without
 * the prefix is legacy plaintext and passes through unchanged; a row that
 * cannot be opened here (the peer re-enrolled, or this device is locked)
 * renders as a placeholder — never as garbage ciphertext.
 *
 * The Android twin of this file lives in E2eeManager.encryptDmText.
 */

import {
  AAD_CONTENT,
  AAD_MEDIA,
  aeadDecrypt,
  aeadEncrypt,
  computeSharedSecret,
  deriveDmKey,
  isEnvelope,
  openText,
  randomBytes,
  sealText,
  unwrapFromPublicKey,
  utf8,
  wrapToPublicKey,
} from './crypto'
import { getE2eeSnapshot, getIdentityPrivate, subscribeE2ee } from './client'

/** Placeholder rendered for sealed content this device cannot open right now. */
export const DM_PLACEHOLDER = '🔒 Encrypted message'

/** Both sides derive the same id no matter who messages first. */
export function dmConversationId(a: string, b: string): string {
  return a < b ? `dm:${a}:${b}` : `dm:${b}:${a}`
}

// ── peer identity public keys (public data, cached for the session) ──

const peerKeys = new Map<string, string>()

/**
 * Public keys for one or more peers. Missing entries simply come back absent —
 * a peer who has not set up encryption yet has no row, and that is a normal
 * state, not an error.
 */
export async function fetchPeerPublicKeys(userIds: string[]): Promise<Map<string, string>> {
  const wanted = [...new Set(userIds.filter((id) => id && !peerKeys.has(id)))]
  if (wanted.length > 0) {
    try {
      const res = await fetch(
        `/api/e2ee/pubkeys?ids=${encodeURIComponent(wanted.join(','))}`,
        { cache: 'no-store' },
      )
      if (res.ok) {
        const json = (await res.json()) as { data?: { user_id: string; public_key: string }[] }
        for (const row of json.data ?? []) {
          if (row.public_key) peerKeys.set(row.user_id, row.public_key)
        }
      }
    } catch {
      // Callers treat a missing key as "peer not enrolled" and fall back.
    }
  }
  const out = new Map<string, string>()
  for (const id of userIds) {
    const key = peerKeys.get(id)
    if (key) out.set(id, key)
  }
  return out
}

// ── conversation keys ──

/** convId → CEK. Derived keys stay valid while the identity keys do. */
const ceks = new Map<string, Uint8Array>()

// The vault locking wipes the identity private key, so everything derived
// from it has to go too. (Rotation keeps the identity, so it needs no wipe.)
subscribeE2ee(() => {
  if (getE2eeSnapshot().status !== 'unlocked') {
    ceks.clear()
    roomCeks.clear()
  }
})

async function dmKey(myId: string, peerId: string, peerPublic: string): Promise<Uint8Array | null> {
  const identityPrivate = getIdentityPrivate()
  if (!identityPrivate) return null
  const convId = dmConversationId(myId, peerId)
  const cached = ceks.get(convId)
  if (cached) return cached
  const shared = await computeSharedSecret(identityPrivate, peerPublic)
  const cek = await deriveDmKey(shared, convId)
  ceks.set(convId, cek)
  return cek
}

// ── rooms (phase 3) ──

/**
 * Rooms are multi-party, so there is no static-static shortcut: the room's
 * content key is random, wrapped with ECIES to every member's identity public
 * key and stored in `e2ee_conversation_keys` (migration 014 lets members write
 * wraps for each other; only the owner can read their own row). Whoever sends
 * first effectively creates the key; later sends refresh the wraps so members
 * who joined late — or whose wrap went missing — pick it up going forward.
 * Two concurrent first-send creators can momentarily diverge; the last wrap
 * wins and everyone converges on their next send (documented honestly).
 *
 * convId (`room:<uuid>`) doubles as the HKDF/wrap context, binding wraps to
 * exactly this room.
 */

const roomCeks = new Map<string, Uint8Array>()

/**
 * The room's content key for this member — from the stored wrap, or freshly
 * created and distributed to every member when none exists yet. Null means
 * the vault is locked or no wrap could be established; callers send plaintext
 * and the UI says so.
 */
export async function ensureRoomKey(roomId: string): Promise<Uint8Array | null> {
  const identityPrivate = getIdentityPrivate()
  if (!identityPrivate) return null
  const convId = `room:${roomId}`
  const cached = roomCeks.get(convId)
  if (cached) return cached

  try {
    const res = await fetch(`/api/e2ee/convkeys?conversation=${encodeURIComponent(convId)}`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const json = (await res.json()) as { data?: { wrapped_key: string } | null }
      if (json.data?.wrapped_key) {
        const cek = await unwrapFromPublicKey(json.data.wrapped_key, identityPrivate, convId)
        if (cek) {
          roomCeks.set(convId, cek)
          return cek
        }
      }
    }
  } catch {
    // Fall through and try to establish one.
  }

  const cek = randomBytes(32)
  if (!(await distributeRoomKey(roomId, convId, cek))) return null
  roomCeks.set(convId, cek)
  return cek
}

/** Wrap the room key to every member and store the wraps. */
async function distributeRoomKey(roomId: string, convId: string, cek: Uint8Array): Promise<boolean> {
  try {
    const membersRes = await fetch(`/api/chat/members?room_id=${encodeURIComponent(roomId)}`, {
      cache: 'no-store',
    })
    if (!membersRes.ok) return false
    const membersJson = (await membersRes.json()) as { data?: string[] }
    const ids = [...new Set(membersJson.data ?? [])].slice(0, 40)
    if (ids.length === 0) return false

    const keys = await fetchPeerPublicKeys(ids)
    const identityPrivate = getIdentityPrivate()
    if (!identityPrivate) return false
    const wraps: { user_id: string; wrapped_key: string }[] = []
    for (const id of ids) {
      const pub = keys.get(id)
      if (!pub) continue
      wraps.push({ user_id: id, wrapped_key: await wrapToPublicKey(cek, pub, convId) })
    }
    if (wraps.length === 0) return false

    const post = await fetch('/api/e2ee/convkeys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: convId, wraps }),
    })
    return post.ok
  } catch {
    return false
  }
}

/**
 * Re-wrap the room key to all members. Cheap (ECIES to a handful of people),
 * fired after each send so late joiners and displaced wraps self-heal. Errors
 * are swallowed — the next send retries.
 */
export async function refreshRoomWraps(roomId: string): Promise<void> {
  const cek = roomCeks.get(`room:${roomId}`)
  if (!cek) return
  await distributeRoomKey(roomId, `room:${roomId}`, cek)
}

/** Seal one room message. Plaintext passthrough when no key could be set up. */
export async function encryptRoomText(roomId: string, plaintext: string): Promise<string> {
  const key = await ensureRoomKey(roomId)
  if (!key) return plaintext
  return sealText(key, plaintext, AAD_CONTENT)
}

/** Read one room message; placeholder instead of ciphertext when unopenable. */
export async function decryptRoomText(roomId: string, stored: string): Promise<string> {
  if (!isEnvelope(stored)) return stored
  const key = await ensureRoomKey(roomId)
  if (!key) return DM_PLACEHOLDER
  return (await openText(key, stored, AAD_CONTENT)) ?? DM_PLACEHOLDER
}

// ── content ──

/**
 * Seal one outgoing message. Returns the plaintext unchanged when the peer has
 * not enrolled (nothing to derive a key against) — callers surface that with a
 * visible "not encrypted" hint rather than failing the send.
 */
export async function encryptDmText(
  myId: string,
  peerId: string,
  peerPublic: string | null,
  plaintext: string,
): Promise<string> {
  if (!peerPublic || !myId) return plaintext
  const key = await dmKey(myId, peerId, peerPublic)
  if (!key) return plaintext
  return sealText(key, plaintext, AAD_CONTENT)
}

/**
 * Read one stored message. Legacy plaintext passes through; sealed content
 * opens with the pair key or degrades to the placeholder — never ciphertext.
 */
export async function decryptDmText(
  myId: string,
  peerId: string,
  peerPublic: string | null,
  stored: string,
): Promise<string> {
  if (!isEnvelope(stored)) return stored
  const key = myId && peerPublic ? await dmKey(myId, peerId, peerPublic) : null
  if (!key) return DM_PLACEHOLDER
  return (await openText(key, stored, AAD_CONTENT)) ?? DM_PLACEHOLDER
}

export { isEnvelope } from './crypto'

// ── chat media (photos) ──

/**
 * Seal one photo for upload: AES-256-GCM over the JPEG bytes, stored as
 * `iv(12) ‖ ct` and uploaded as `application/octet-stream` with a `.jpg.enc`
 * path — the suffix is the marker that the bytes need opening before decode.
 * Returns null when there is no pair key (peer not enrolled / vault locked),
 * which callers treat as "send the photo the legacy way".
 */
export async function encryptDmMedia(
  myId: string,
  peerId: string,
  peerPublic: string | null,
  bytes: Uint8Array,
): Promise<Uint8Array | null> {
  if (!peerPublic || !myId) return null
  const key = await dmKey(myId, peerId, peerPublic)
  if (!key) return null
  const { iv, ct } = await aeadEncrypt(key, bytes, AAD_MEDIA)
  const out = new Uint8Array(iv.length + ct.length)
  out.set(iv, 0)
  out.set(ct, iv.length)
  return out
}

/** Open a sealed photo. Null = no key here or the bytes are not for this pair. */
export async function decryptDmMedia(
  myId: string,
  peerId: string,
  peerPublic: string | null,
  sealed: Uint8Array,
): Promise<Uint8Array | null> {
  if (sealed.length < 12 + 16) return null
  const key = myId && peerPublic ? await dmKey(myId, peerId, peerPublic) : null
  if (!key) return null
  try {
    return await aeadDecrypt(key, sealed.slice(0, 12), sealed.slice(12), AAD_MEDIA)
  } catch {
    return null
  }
}
