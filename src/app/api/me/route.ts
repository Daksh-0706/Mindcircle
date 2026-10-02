import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asEnum, badRequest, readJson } from '@/lib/security'

const AVATARS = [
  '😊', '😌', '🙂', '😉', '🥰', '😴',
  '🌿', '🌙', '☀️', '🔥', '🦋', '🌸',
] as const

/** Settings is a free-form blob, so cap its shape and size before storing. */
const SETTINGS_MAX_BYTES = 4000
const SETTINGS_MAX_KEYS = 24

/**
 * GET /api/me — the signed-in user's auth identity + profile row.
 * Used by Dashboard, Profile and Settings instead of hardcoded names.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, email, anonymous_id, avatar_emoji, settings')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
    },
    profile,
  })
}

/**
 * PATCH /api/me — update the profile row (avatar emoji, settings blob).
 * Body: { avatar_emoji?: string, settings?: Record<string, unknown> }
 */
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const updates: Record<string, unknown> = {}

  if (body.avatar_emoji !== undefined) {
    // Must be one of the known avatars — otherwise any string (including a
    // long payload) lands in the profile row.
    const avatar = asEnum(body.avatar_emoji, AVATARS)
    if (!avatar) return badRequest('That avatar is not available.')
    updates.avatar_emoji = avatar
  }

  if (body.settings !== undefined) {
    if (!body.settings || typeof body.settings !== 'object' || Array.isArray(body.settings)) {
      return badRequest('Settings must be an object.')
    }
    const entries = Object.entries(body.settings as Record<string, unknown>)
    if (entries.length > SETTINGS_MAX_KEYS) {
      return badRequest(`Settings may hold at most ${SETTINGS_MAX_KEYS} keys.`)
    }
    // Values must be JSON scalars or shallow arrays of them — no nesting,
    // no functions, no unbounded blobs.
    for (const [key, value] of entries) {
      if (typeof key !== 'string' || key.length > 40) {
        return badRequest('Invalid settings key.')
      }
      const isScalar =
        value === null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      const isScalarArray =
        Array.isArray(value) &&
        value.length <= 20 &&
        value.every(
          (v) =>
            v === null ||
            typeof v === 'string' ||
            typeof v === 'number' ||
            typeof v === 'boolean',
        )
      if (!isScalar && !isScalarArray) {
        return badRequest(`Unsupported value for settings.${key}.`)
      }
      if (JSON.stringify(value).length > SETTINGS_MAX_BYTES) {
        return badRequest('Settings value is too large.')
      }
    }
    updates.settings = body.settings
  }

  if (Object.keys(updates).length === 0) {
    return badRequest('Nothing to update.')
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, anonymous_id, avatar_emoji, settings')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
