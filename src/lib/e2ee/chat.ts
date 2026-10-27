'use client'

/**
 * Chats E2EE (docs/E2EE.md §chats): direct messages only.
 *
 * Each DM pair derives one 32-byte conversation key (CEK) with static-static
 * ECDH — my identity private key against the peer's identity PUBLIC key — so
 * there is no key-distribution step, no per-device table, and the same key
 * exists on every device once the phrase has unlocked the vault. The HKDF
 * salt is the canonical conversation id (`dm:<smaller-id>:<larger-id>`), which
 * binds the key to exactly this pair of people.
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
  computeSharedSecret,
  deriveDmKey,
  isEnvelope,
  openText,
  sealText,
  utf8,
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
  if (getE2eeSnapshot().status !== 'unlocked') ceks.clear()
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
