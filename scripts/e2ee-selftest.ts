/**
 * Round-trip + known-answer self-test for the web E2EE core.
 * Run: npx -y tsx scripts/e2ee-selftest.ts
 *
 * Prints the exact vectors Android's E2eeSelfTest must reproduce, so the two
 * platforms are provably speaking the same wire format (docs/E2EE.md).
 */

import {
  aeadDecrypt,
  aeadEncrypt,
  computeSharedSecret,
  deriveDmKey,
  deriveJournalKey,
  generateIdentityKey,
  hkdfSha256,
  importIdentityPrivate,
  openText,
  pbkdf2Sha256,
  sealText,
  toB64u,
  unwrapFromPublicKey,
  utf8,
  wrapToPublicKey,
} from '../src/lib/e2ee/crypto'
import { entropyToMnemonic, mnemonicToEntropy, randomEntropy } from '../src/lib/e2ee/mnemonic'

async function expect(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) {
    console.log('   got :', got)
    console.log('   want:', want)
    process.exitCode = 1
  }
}

async function main() {
  // 1. BIP-39 round trip, fixed entropy → known words.
  const entropy = new Uint8Array(16)
  entropy.fill(7)
  const words = await entropyToMnemonic(entropy)
  await expect('mnemonic of 0x0707… is 12 words', words.length, 12)
  console.log('   mnemonic(07*16) =', words.join(' '))
  const back = await mnemonicToEntropy(words)
  await expect('mnemonic → entropy round trip', Array.from(back), Array.from(entropy))
  try {
    await mnemonicToEntropy([...words.slice(0, 11), 'zoology'])
    await expect('typo rejected', false, true)
  } catch {
    await expect('typo rejected', true, true)
  }

  // 2. PBKDF2 known answer (Android must match byte-for-byte).
  const kek = await pbkdf2Sha256('abandon abandon abandon ability', 'mindcircle-recovery-v1:test', 600_000)
  console.log('   VEC pbkdf2 =', toB64u(kek))

  // 3. HKDF + journal key derivation determinism.
  const ark = new Uint8Array(32).fill(9)
  const jk1 = await deriveJournalKey(ark)
  const jk2 = await deriveJournalKey(ark)
  await expect('journal key deterministic', Array.from(jk1), Array.from(jk2))
  console.log('   VEC journalkey(09*32) =', toB64u(jk1))

  // 4. Envelope round trip + tamper detection.
  const sealed = await sealText(jk1, 'secret diary text', 'mindcircle:content:v1')
  await expect('seal → open round trip', await openText(jk1, sealed, 'mindcircle:content:v1'), 'secret diary text')
  await expect('legacy passthrough flag', sealed.startsWith('mc1:'), true)
  await expect('tamper rejected', await openText(jk1, sealed, 'mindcircle:content:v2'), null)
  const flipped = sealed.slice(0, -4) + (sealed.endsWith('AAAA') ? 'BBBB' : 'AAAA')
  await expect('bit-flip rejected', await openText(jk1, flipped, 'mindcircle:content:v1'), null)

  // 5. ECDH: both sides derive the same secret.
  const a = await generateIdentityKey()
  const b = await generateIdentityKey()
  const ab = await computeSharedSecret(a.privateKey, b.publicB64u)
  const ba = await computeSharedSecret(b.privateKey, a.publicB64u)
  await expect('ECDH agreement', Array.from(ab), Array.from(ba))
  await expect('ECDH secret is 32 bytes', ab.length, 32)
  console.log('   VEC ecdh pubs:', a.publicB64u.slice(0, 12), b.publicB64u.slice(0, 12))

  // 6. Random phrase each time (no static seed bug).
  const w1 = await entropyToMnemonic(randomEntropy())
  const w2 = await entropyToMnemonic(randomEntropy())
  await expect('random phrases differ', w1.join(' ') !== w2.join(' '), true)

  // 7. DM pair key, fixed identities (Android pins the same vector, so a
  // message sealed on one platform opens on the other).
  const dA = await importIdentityPrivate({ kty: 'EC', crv: 'P-256', x: 'ykbGW0UB2sR0H7vCoYgvQHXrGtWoTK8zw6MLxXXIc-M', y: 'tyk5V8a63DojUdFjZFv0bSEe_2oVg6tp_EE_X6MbJMY', d: 'V9Xsawn0dD8bab7U3wvP9Xjz9qNxqJO8A2YgK3GYqmM' })
  const dB = await importIdentityPrivate({ kty: 'EC', crv: 'P-256', x: 'icSiY5y_AJsPw5Vy5DzlTH3xe8UQXznnBijYrKR2d14', y: 'v5VQGn6e17yC295PC3KqBxSywpn9sTs8MMcB60iqUNQ', d: 'ui5ly0KTZ1ubFzkvAjKVKF2MRZaczhEhtD6CvR_MQs8' })
  const pubB = 'BInEomOcvwCbD8OVcuQ85Ux98XvFEF855wYo2Kykdndev5VQGn6e17yC295PC3KqBxSywpn9sTs8MMcB60iqUNQ'
  const pubA = 'BMpGxltFAdrEdB-7wqGIL0B16xrVqEyvM8OjC8V1yHPjtyk5V8a63DojUdFjZFv0bSEe_2oVg6tp_EE_X6MbJMY'
  const conv = 'dm:11111111-1111-1111-1111-111111111111:22222222-2222-2222-2222-222222222222'
  const cekA = await deriveDmKey(await computeSharedSecret(dA, pubB), conv)
  const cekB = await deriveDmKey(await computeSharedSecret(dB, pubA), conv)
  await expect('DM key matches pinned vector', toB64u(cekA), 'jiSQGReKAryg5Pl9lxHIrfIoAu66082hTI9O3ZJxCjY')
  await expect('DM key agrees both ways', Array.from(cekA), Array.from(cekB))

  // 8. ECIES (room key wraps): open a wrap minted on the web with the pinned
  // identities — Android must open the exact same envelope, and a wrap bound
  // to another context id must be refused (docs/E2EE.md §rooms).
  const dBPriv = dB
  const roomCtx = 'room:00000000-0000-0000-0000-000000000000'
  const eciesEnvelope =
    'mc1:eyJ2IjoxLCJ0IjoiZWNpZXMiLCJlcGsiOiJCRmpoNXVEenhQQ2M1ZVYtZlREdzlxOGVBa25Odmx5V2djME90UWtkQ2ZLbVVwQWVGcGJYV0llZlpjZUNiYjgyS18zOTByY1pDSERGYXZycVBObU5LMXMiLCJpdiI6IldIY0RZdVJWUnpNWlRnb2oiLCJjdCI6ImFTM2RaalFvbDg2TE5OekduYnJXYWRXZXFtQ21lMFJVY25sM2d5UTNhRDc5WEpMd0dqc3I2UmtzemZUaktJWlMifQ'
  const opened = await unwrapFromPublicKey(eciesEnvelope, dBPriv, roomCtx)
  await expect(
    'ECIES web-wrap opens',
    opened ? toB64u(opened) : null,
    'AwoRGB8mLTQ7QklQV15lbHN6gYiPlp2kq7K5wMfO1dw',
  )
  await expect(
    'ECIES foreign context rejected',
    await unwrapFromPublicKey(eciesEnvelope, dBPriv, 'room:11111111-1111-1111-1111-111111111111'),
    null,
  )
  const roundTrip = await wrapToPublicKey(new Uint8Array(32).fill(4), pubB, roomCtx)
  await expect(
    'ECIES wrap → unwrap round trip',
    Array.from((await unwrapFromPublicKey(roundTrip, dBPriv, roomCtx)) ?? []),
    Array.from(new Uint8Array(32).fill(4)),
  )

  console.log(process.exitCode ? 'SELFTEST FAILED' : 'SELFTEST OK')
}

void main()
