'use client'

/**
 * The E2EE runtime for the web client.
 *
 * Holds the account root key (ARK) in memory, seals it for this device with a
 * non-extractable AES key in IndexedDB so a reload stays unlocked, and talks to
 * `/api/e2ee` for the envelopes the server may store (which are all ciphertext).
 *
 * The recovery phrase is the ONLY thing that can re-derive the ARK on a new
 * device or browser. It is shown once, never stored, and cannot be recovered
 * from the ARK â€” that asymmetry is the whole design.
 */

import {
  AAD_ACCOUNT,
  AAD_ARK,
  AAD_CONTENT,
  aeadDecrypt,
  aeadEncrypt,
  deriveJournalKey,
  fromB64u,
  generateIdentityKey,
  importIdentityPrivate,
  isEnvelope,
  pbkdf2Sha256,
  randomBytes,
  sealText,
  openText,
  toB64u,
  unwrapKeyBytes,
  utf8,
  utf8s,
  wrapKeyBytes,
  type IdentityKeyPair,
} from './crypto'
import { generateMnemonic, mnemonicFromText } from './mnemonic'

export const KDF_ID = 'pbkdf2-sha256'
export const KDF_ITERATIONS = 600_000

export type E2eeStatus = 'unknown' | 'not-setup' | 'locked' | 'unlocked' | 'unavailable'

export type E2eeSnapshot = {
  status: E2eeStatus
  busy: boolean
  error: string | null
  info: { userId: string; iterations: number } | null
}

type ServerStatus = {
  initialized: boolean
  userId: string
  publicKey?: string
  encryptedPrivateKey?: string
  kdf?: string
  iterations?: number
  salt?: string
  wrappedRootKey?: string
}

// â”€â”€ React-syncable store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let snapshot: E2eeSnapshot = { status: 'unknown', busy: false, error: null, info: null }
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function patch(p: Partial<E2eeSnapshot>) {
  snapshot = { ...snapshot, ...p }
  emit()
}

export function subscribeE2ee(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getE2eeSnapshot(): E2eeSnapshot {
  return snapshot
}

/**
 * The identity private key while unlocked. Chats use it for the static-static
 * DM key derivation (src/lib/e2ee/chat.ts); null means locked / not set up.
 */
export function getIdentityPrivate(): CryptoKey | null {
  return identityPrivate
}

// â”€â”€ key material (module scope, never rendered) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let ark: Uint8Array | null = null
let identityPrivate: CryptoKey | null = null
let identityPublic: string | null = null
let journalKey: Uint8Array | null = null

function resetKeys() {
  ark = null
  identityPrivate = null
  identityPublic = null
  journalKey = null
  pending = null
}

type Pending = {
  words: string[]
  identity: IdentityKeyPair
  rootKey: Uint8Array
  salt: string
  kek: Uint8Array
  wrappedRootKey: string
  encryptedPrivateKey: string
}
let pending: Pending | null = null

// â”€â”€ device-local sealed ARK (IndexedDB, non-extractable AES key) â”€â”€â”€
const DB_NAME = 'mindcircle-e2ee'
const STORE = 'secrets'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbPut(key: string, value: unknown): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDb()
  const value = await new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve((req.result ?? null) as T | null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return value
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

/**
 * A key that lives only inside this browser profile and can never be read out
 * of IndexedDB â€” it seals the ARK between sessions, but the phrase remains the
 * only way onto a *new* device.
 */
async function getDeviceKey(): Promise<CryptoKey | null> {
  const existing = await idbGet<CryptoKey>('device-key')
  if (existing) return existing
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  await idbPut('device-key', key)
  return key
}

async function persistDeviceSeal(userId: string): Promise<void> {
  if (!ark) return
  const key = await getDeviceKey()
  if (!key) return
  const iv = randomBytes(12)
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv } as AesGcmParams, key, ark as BufferSource))
  await idbPut(`ark-${userId}`, { iv: toB64u(iv), ct: toB64u(ct) })
}

async function clearDeviceSeal(userId: string): Promise<void> {
  try {
    await idbDelete(`ark-${userId}`)
  } catch {
    // nothing to clean up
  }
}

// â”€â”€ server envelope API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function fetchStatus(): Promise<ServerStatus> {
  const res = await fetch('/api/e2ee', { cache: 'no-store' })
  if (!res.ok) throw new Error('Could not reach the encryption service. Try again.')
  return res.json() as Promise<ServerStatus>
}

async function loadIdentityFromServer(server: ServerStatus, rootKey: Uint8Array): Promise<CryptoKey> {
  const jwkBytes = server.encryptedPrivateKey
    ? await unwrapKeyBytes(rootKey, server.encryptedPrivateKey, AAD_ACCOUNT)
    : null
  if (!jwkBytes) throw new Error('Could not open the account key envelope.')
  return importIdentityPrivate(JSON.parse(utf8s(jwkBytes)) as JsonWebKey)
}

// â”€â”€ public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Refresh state from the server and try this device's sealed key. */
let initInFlight: Promise<void> | null = null

export async function initE2ee(): Promise<void> {
  // The gate re-renders while `busy` flips, and each render re-runs its
  // effect; collapse those into one in-flight round trip.
  if (initInFlight) return initInFlight
  initInFlight = (async () => {
    patch({ busy: true, error: null })
    try {
      const server = await fetchStatus()
      const info = { userId: server.userId, iterations: server.iterations ?? KDF_ITERATIONS }
      if (!server.initialized) {
        resetKeys()
        patch({ status: 'not-setup', busy: false, info: null })
        return
      }
      if (ark && identityPublic === server.publicKey) {
        patch({ status: 'unlocked', busy: false, info })
        return
      }
      // Try the device-sealed ARK first; the phrase is only needed once per device.
      const deviceKey = await getDeviceKey()
      const sealed = await idbGet<{ iv: string; ct: string }>(`ark-${server.userId}`)
      if (deviceKey && sealed) {
        try {
          const iv = fromB64u(sealed.iv)
          const ct = fromB64u(sealed.ct)
          const restored = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv } as AesGcmParams, deviceKey, ct as BufferSource))
          ark = restored
          journalKey = null
          identityPrivate = await loadIdentityFromServer(server, restored)
          identityPublic = server.publicKey ?? null
          patch({ status: 'unlocked', busy: false, info })
          return
        } catch {
          await clearDeviceSeal(server.userId)
        }
      }
      resetKeys()
      patch({ status: 'locked', busy: false, info })
    } catch (e) {
      patch({ status: 'unavailable', busy: false, error: e instanceof Error ? e.message : 'Encryption service unavailable.' })
    } finally {
      patch({ busy: false })
      initInFlight = null
    }
  })()
  return initInFlight
}

/** Generate a fresh phrase + ARK; nothing is sent until confirmSetup(). */
export async function startSetup(): Promise<string[]> {
  patch({ busy: true, error: null })
  try {
    const server = await fetchStatus()
    if (server.initialized) throw new Error('Encryption is already set up for this account.')
    const identity = await generateIdentityKey()
    const rootKey = randomBytes(32)
    const words = await generateMnemonic()
    const salt = `mindcircle-recovery-v1:${server.userId}`
    const kek = await pbkdf2Sha256(words.join(' '), salt, KDF_ITERATIONS)
    const wrappedRootKey = await wrapKeyBytes(kek, rootKey, AAD_ARK)
    const encryptedPrivateKey = await wrapKeyBytes(rootKey, utf8(JSON.stringify(identity.privateJwk)), AAD_ACCOUNT)
    pending = { words, identity, rootKey, salt, kek, wrappedRootKey, encryptedPrivateKey }
    return words
  } catch (e) {
    pending = null
    patch({ error: e instanceof Error ? e.message : 'Could not start setup.' })
    throw e
  } finally {
    patch({ busy: false })
  }
}

/** Persist the pending setup. Call only after the user confirmed their phrase. */
export async function confirmSetup(): Promise<void> {
  const p = pending
  if (!p) throw new Error('Setup was not started.')
  patch({ busy: true, error: null })
  try {
    const res = await fetch('/api/e2ee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_key: p.identity.publicB64u,
        encrypted_private_key: p.encryptedPrivateKey,
        kdf: KDF_ID,
        iterations: KDF_ITERATIONS,
        salt: p.salt,
        wrapped_root_key: p.wrappedRootKey,
      }),
    })
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(json.error ?? 'Could not enable encryption.')
    }
    ark = p.rootKey
    journalKey = null
    identityPrivate = p.identity.privateKey
    identityPublic = p.identity.publicB64u
    const server = await fetchStatus()
    await persistDeviceSeal(server.userId)
    pending = null
    patch({ status: 'unlocked', info: { userId: server.userId, iterations: KDF_ITERATIONS } })
  } finally {
    patch({ busy: false })
  }
}

export function cancelSetup(): void {
  pending = null
}

/**
 * Restore on this device from the 12 words. Returns false (with a friendly
 * error in the snapshot) when the phrase does not match.
 */
export async function unlockWithPhrase(input: string): Promise<boolean> {
  patch({ busy: true, error: null })
  try {
    const server = await fetchStatus()
    if (!server.initialized || !server.wrappedRootKey || !server.salt) {
      throw new Error('Encryption is not set up on this account yet.')
    }
    const words = await mnemonicFromText(input)
    const kek = await pbkdf2Sha256(words.join(' '), server.salt, server.iterations ?? KDF_ITERATIONS)
    const rootKey = await unwrapKeyBytes(kek, server.wrappedRootKey, AAD_ARK)
    if (!rootKey) {
      patch({ error: 'That phrase did not match. Check every word.' })
      return false
    }
    identityPrivate = await loadIdentityFromServer(server, rootKey)
    ark = rootKey
    journalKey = null
    identityPublic = server.publicKey ?? null
    await persistDeviceSeal(server.userId)
    patch({ status: 'unlocked', info: { userId: server.userId, iterations: server.iterations ?? KDF_ITERATIONS } })
    return true
  } catch (e) {
    patch({ error: e instanceof Error ? e.message : 'Could not unlock.' })
    return false
  } finally {
    patch({ busy: false })
  }
}

/** Wipe key material from memory and this device. The phrase still works. */
export async function lockE2ee(): Promise<void> {
  const userId = snapshot.info?.userId
  resetKeys()
  if (userId) await clearDeviceSeal(userId)
  patch({ status: 'locked', error: null })
}

/** New 12 words, same ARK â€” for users who lost their copy. Needs unlock. */
export async function rotatePhrase(): Promise<string[]> {
  if (!ark) throw new Error('Unlock first.')
  patch({ busy: true, error: null })
  try {
    const server = await fetchStatus()
    const words = await generateMnemonic()
    const salt = `mindcircle-recovery-v1:${server.userId}`
    const kek = await pbkdf2Sha256(words.join(' '), salt, KDF_ITERATIONS)
    const wrappedRootKey = await wrapKeyBytes(kek, ark, AAD_ARK)
    const res = await fetch('/api/e2ee', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kdf: KDF_ID, iterations: KDF_ITERATIONS, salt, wrapped_root_key: wrappedRootKey }),
    })
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(json.error ?? 'Could not save the new phrase.')
    }
    return words
  } finally {
    patch({ busy: false })
  }
}

// â”€â”€ content helpers (journal today, chats in Phase 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function ensureJournalKey(): Promise<Uint8Array> {
  if (!ark) throw new Error('Encryption is locked.')
  if (!journalKey) journalKey = await deriveJournalKey(ark)
  return journalKey
}

/** Encrypt content for storage. Legacy rows can only be migrated, never re-encrypted silently. */
export async function encryptPrivateText(plaintext: string): Promise<string> {
  const key = await ensureJournalKey()
  return sealText(key, plaintext, AAD_CONTENT)
}

/**
 * Read a stored value. Unencrypted legacy rows pass through unchanged â€”
 * the prefix is what makes the difference explicit.
 */
export async function decryptPrivateText(stored: string): Promise<string> {
  if (!isEnvelope(stored)) return stored
  const key = await ensureJournalKey()
  const out = await openText(key, stored, AAD_CONTENT)
  if (out === null) throw new Error('This entry could not be decrypted with this deviceâ€™s key.')
  return out
}

/** Test helper used by the crypto round-trip check in the settings screen. */
export async function selfTestRoundTrip(): Promise<boolean> {
  try {
    const probe = `mindcircle self-test ${Date.now()}`
    const sealed = await encryptPrivateText(probe)
    return sealed.startsWith('mc1:') && (await decryptPrivateText(sealed)) === probe
  } catch {
    return false
  }
}

export { utf8, utf8s, fromB64u, toB64u }
