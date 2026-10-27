import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asInt, asText, badRequest, readJson, rateLimit, tooManyRequests } from '@/lib/security'

/**
 * Envelope storage for E2EE. Every field is opaque ciphertext produced by
 * docs/E2EE.md â€” these routes never see plaintext, cannot decrypt, and only
 * ever touch rows belonging to the caller's session (Supabase RLS is the
 * second gate after these explicit `.eq('user_id', â€¦)` filters).
 *
 * GET    â†’ the envelopes this device needs to unlock
 * POST   â†’ one-time bootstrap of the identity + recovery envelope
 * PATCH  â†’ rotate the recovery phrase (new wrap of the same ARK)
 */

const RATE = { limit: 20, windowMs: 60_000 } as const

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET() {
  const { supabase, user } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [identity, recovery] = await Promise.all([
    supabase.from('e2ee_identities').select('public_key, encrypted_private_key').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('e2ee_recovery')
      .select('kdf, iterations, salt, wrapped_root_key')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (identity.error || recovery.error) {
    return NextResponse.json({ error: 'Could not load encryption state.' }, { status: 500 })
  }

  const initialized = Boolean(identity.data && recovery.data)
  if (!initialized) {
    return NextResponse.json({ initialized: false, userId: user.id })
  }

  return NextResponse.json({
    initialized: true,
    userId: user.id,
    publicKey: identity.data!.public_key,
    encryptedPrivateKey: identity.data!.encrypted_private_key,
    kdf: recovery.data!.kdf,
    iterations: recovery.data!.iterations,
    salt: recovery.data!.salt,
    wrappedRootKey: recovery.data!.wrapped_root_key,
  })
}

const ENVELOPE_MAX = 20_000

export async function POST(request: Request) {
  const { supabase, user } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimit(`e2ee:${user.id}`, RATE).ok) return tooManyRequests(60)

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const publicKey = asText(body.public_key, { min: 40, max: 200 })
  const encryptedPrivateKey = asText(body.encrypted_private_key, { min: 40, max: ENVELOPE_MAX })
  const wrappedRootKey = asText(body.wrapped_root_key, { min: 40, max: ENVELOPE_MAX })
  const salt = asText(body.salt, { min: 8, max: 256 })
  const iterations = asInt(body.iterations ?? 600_000, { min: 100_000, max: 2_000_000 })
  const kdf = asText(body.kdf, { min: 3, max: 32 }) ?? 'pbkdf2-sha256'

  if (!publicKey || !encryptedPrivateKey || !wrappedRootKey || !salt) {
    return badRequest('Missing encryption envelope fields.')
  }

  // Bootstrap is one-time by design: a second "first key" would be a coercion
  // vector. Rotating the *phrase* (PATCH) is the supported re-key path.
  const { count, error: checkError } = await supabase
    .from('e2ee_identities')
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if (checkError) return NextResponse.json({ error: 'Could not verify encryption state.' }, { status: 500 })
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Encryption is already set up. Use rotate instead.' }, { status: 409 })
  }

  const [identityResult, recoveryResult] = await Promise.all([
    supabase.from('e2ee_identities').insert({
      user_id: user.id,
      public_key: publicKey,
      encrypted_private_key: encryptedPrivateKey,
    }),
    supabase.from('e2ee_recovery').insert({
      user_id: user.id,
      kdf,
      iterations,
      salt,
      wrapped_root_key: wrappedRootKey,
    }),
  ])

  if (identityResult.error || recoveryResult.error) {
    // Best-effort cleanup so a half bootstrap cannot wedge the account.
    await supabase.from('e2ee_identities').delete().eq('user_id', user.id)
    return NextResponse.json({ error: 'Could not enable encryption.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { supabase, user } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimit(`e2ee-rot:${user.id}`, RATE).ok) return tooManyRequests(60)

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const wrappedRootKey = asText(body.wrapped_root_key, { min: 40, max: ENVELOPE_MAX })
  const salt = asText(body.salt, { min: 8, max: 256 })
  const iterations = asInt(body.iterations ?? 600_000, { min: 100_000, max: 2_000_000 })
  const kdf = asText(body.kdf, { min: 3, max: 32 }) ?? 'pbkdf2-sha256'
  if (!wrappedRootKey || !salt) return badRequest('A new recovery envelope is required.')

  const { error } = await supabase
    .from('e2ee_recovery')
    .update({ kdf, iterations, salt, wrapped_root_key: wrappedRootKey, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'Could not rotate the recovery phrase.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
