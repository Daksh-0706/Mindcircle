/**
 * E2EE primitives for the web client.
 *
 * Design contract: docs/E2EE.md. Every function here is a thin wrapper over
 * a platform-vetted WebCrypto primitive — nothing homemade except HKDF's
 * extract/expand loop, which is the RFC 5869 construction, and the envelope
 * string format, which is pure framing.
 *
 * The Android client (`core/e2ee/E2ee.kt`) implements the exact same wire
 * format, so content sealed on the web restores on the phone.
 */

const te = new TextEncoder()
const td = new TextDecoder()

export function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n)
  crypto.getRandomValues(out)
  return out
}

/** base64url, unpadded — safe inside JSON, Postgres text and URLs. */
export function toB64u(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromB64u(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function utf8(s: string): Uint8Array {
  return te.encode(s)
}

export function utf8s(b: Uint8Array): string {
  return td.decode(b)
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', data as BufferSource))
}

async function hmacBytes(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', key as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data as BufferSource))
}

/** RFC 5869 HKDF-SHA256. Zero-length salt is the empty key, not "use default". */
export async function hkdfSha256(
  ikm: Uint8Array,
  info: Uint8Array,
  salt: Uint8Array = new Uint8Array(32),
  length = 32,
): Promise<Uint8Array> {
  const prk = await hmacBytes(salt.length ? salt : new Uint8Array(32), ikm)
  const one = new Uint8Array([1])
  const t1 = await hmacBytes(prk, new Uint8Array([...info, ...one]))
  if (length <= 32) return t1.slice(0, length)
  const out = new Uint8Array(length)
  out.set(t1, 0)
  let t = t1
  let written = t1.length
  for (let counter = 2; written < length; counter++) {
    const t2 = await hmacBytes(prk, new Uint8Array([...t, ...info, ...new Uint8Array([counter])]))
    const take = Math.min(t2.length, length - written)
    out.set(t2.slice(0, take), written)
    written += take
    t = t2
  }
  return out
}

/** Purpose-bound AES-256-GCM. Returns {iv, ct} with the tag inside ct. */
export async function aeadEncrypt(key: Uint8Array, plaintext: Uint8Array, aad: string): Promise<{ iv: Uint8Array; ct: Uint8Array }> {
  const iv = randomBytes(12)
  const k = await crypto.subtle.importKey('raw', key as BufferSource, 'AES-GCM', false, ['encrypt'])
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: utf8(aad) as BufferSource }, k, plaintext as BufferSource),
  )
  return { iv, ct }
}

export async function aeadDecrypt(key: Uint8Array, iv: Uint8Array, ct: Uint8Array, aad: string): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', key as BufferSource, 'AES-GCM', false, ['decrypt'])
  return new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: utf8(aad) as BufferSource }, k, ct as BufferSource),
  )
}

/** PBKDF2-HMAC-SHA256 for the recovery phrase, exactly as Android does it. */
export async function pbkdf2Sha256(phrase: string, salt: string, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', utf8(phrase) as BufferSource, 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: utf8(salt) as BufferSource, iterations },
    key,
    256,
  )
  return new Uint8Array(bits)
}

// ─────────────────────────── envelopes ───────────────────────────

export const ENVELOPE_PREFIX = 'mc1:'

/** Anything not carrying the prefix is a legacy plaintext row. */
export function isEnvelope(stored: string | null | undefined): stored is string {
  return typeof stored === 'string' && stored.startsWith(ENVELOPE_PREFIX)
}

function packEnvelope(payload: Record<string, unknown>): string {
  return ENVELOPE_PREFIX + toB64u(utf8(JSON.stringify({ v: 1, ...payload })))
}

function unpackEnvelope<T extends Record<string, unknown>>(stored: string): T {
  const json = JSON.parse(utf8s(fromB64u(stored.slice(ENVELOPE_PREFIX.length)))) as T
  if (json.v !== 1) throw new Error('Unsupported envelope version')
  return json
}

/** Seal text into a `mc1:` string. AAD must match what open uses for this field. */
export async function sealText(key: Uint8Array, plaintext: string, aad: string): Promise<string> {
  const { iv, ct } = await aeadEncrypt(key, utf8(plaintext), aad)
  return packEnvelope({ iv: toB64u(iv), ct: toB64u(ct) })
}

/** Open a `mc1:` string. Returns null when tampered with or the wrong key. */
export async function openText(key: Uint8Array, stored: string, aad: string): Promise<string | null> {
  try {
    const { iv, ct } = unpackEnvelope<{ iv: string; ct: string }>(stored)
    return utf8s(await aeadDecrypt(key, fromB64u(iv), fromB64u(ct), aad))
  } catch {
    return null
  }
}

/** Wrap raw 32-byte key material with another key (envelope, same format). */
export async function wrapKeyBytes(kek: Uint8Array, material: Uint8Array, aad: string): Promise<string> {
  const { iv, ct } = await aeadEncrypt(kek, material, aad)
  return packEnvelope({ iv: toB64u(iv), ct: toB64u(ct) })
}

export async function unwrapKeyBytes(kek: Uint8Array, stored: string, aad: string): Promise<Uint8Array | null> {
  try {
    const { iv, ct } = unpackEnvelope<{ iv: string; ct: string }>(stored)
    const out = await aeadDecrypt(kek, fromB64u(iv), fromB64u(ct), aad)
    return out
  } catch {
    return null
  }
}

// ─────────────────────────── identity keys ───────────────────────────

export type IdentityKeyPair = {
  /** 65-byte uncompressed point, base64url — the same bytes WebCrypto raw-exports and Android decodes. */
  publicB64u: string
  privateJwk: JsonWebKey
  privateKey: CryptoKey
}

export async function generateIdentityKey(): Promise<IdentityKeyPair> {
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey))
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
  return { publicB64u: toB64u(raw), privateJwk: jwk, privateKey: pair.privateKey }
}

export async function importIdentityPrivate(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
}

export async function importIdentityPublic(rawB64u: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', fromB64u(rawB64u) as BufferSource, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
}

/** Raw ECDH shared secret (the 32-byte x coordinate, as Android's KeyAgreement yields it). */
export async function computeSharedSecret(privateKey: CryptoKey, publicB64u: string): Promise<Uint8Array> {
  const pub = await importIdentityPublic(publicB64u)
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: pub }, privateKey, 256))
}

/**
 * ECIES-lite: wrap a random key to a recipient's identity key.
 * `contextId` binds the wrap to one conversation so it cannot be replayed
 * against a different chat record (Phase 2 — chats).
 */
export async function wrapToPublicKey(material: Uint8Array, recipientPublicB64u: string, contextId: string): Promise<string> {
  const ephemeral = await generateIdentityKey()
  const shared = await computeSharedSecret(ephemeral.privateKey, recipientPublicB64u)
  const kek = await hkdfSha256(shared, utf8('mindcircle:ck:v1'))
  const { iv, ct } = await aeadEncrypt(kek, material, `mindcircle:ck:v1:${contextId}`)
  return packEnvelope({ t: 'ecies', epk: ephemeral.publicB64u, iv: toB64u(iv), ct: toB64u(ct) })
}

export function isEciesEnvelope(stored: string | null | undefined): stored is string {
  if (!isEnvelope(stored)) return false
  try {
    return Boolean(unpackEnvelope<{ t?: string }>(stored).t === 'ecies')
  } catch {
    return false
  }
}

/** Unwrap an ECIES envelope with the own identity private key. */
export async function unwrapFromPublicKey(stored: string, identityPrivateKey: CryptoKey, contextId: string): Promise<Uint8Array | null> {
  try {
    const env = unpackEnvelope<{ epk: string; iv: string; ct: string }>(stored)
    const shared = await computeSharedSecret(identityPrivateKey, env.epk)
    const kek = await hkdfSha256(shared, utf8('mindcircle:ck:v1'))
    return await aeadDecrypt(kek, fromB64u(env.iv), fromB64u(env.ct), `mindcircle:ck:v1:${contextId}`)
  } catch {
    return null
  }
}

// ─────────────────────────── domain keys ───────────────────────────

/** Deterministic, zero-exchange key for single-owner content (journal, moods). */
export async function deriveJournalKey(ark: Uint8Array): Promise<Uint8Array> {
  return hkdfSha256(ark, utf8('mindcircle:journal:v1'))
}

/**
 * Static-static key for a DM pair (docs/E2EE.md §chats). Both sides derive the
 * same CEK from their identity keys alone — no key-distribution step, and the
 * conversation id is the HKDF salt so a key cannot be replayed across chats.
 */
export async function deriveDmKey(shared: Uint8Array, conversationId: string): Promise<Uint8Array> {
  return hkdfSha256(shared, utf8('mindcircle:dm:v1'), utf8(conversationId))
}

export const AAD_CONTENT = 'mindcircle:content:v1'
export const AAD_ARK = 'mindcircle:ark:v1'
export const AAD_ACCOUNT = 'mindcircle:account:v1'
