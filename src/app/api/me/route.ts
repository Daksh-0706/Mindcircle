import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asEnum, asText, badRequest, readJson, serverError } from '@/lib/security'

const AVATARS = [
  // Profile setup (step 1)
  '🌱', '☀️', '☁️', '💜', '🎮', '📚', '☕', '🌙', '🐱',
  // Settings → Edit Profile (moods + vibes)
  '😊', '😌', '😐', '😤', '😰', '😔',
  '⭐', '🍀', '🦋', '🌸',
  // Kept for older accounts that already stored one of these
  '🙂', '😉', '🥰', '😴', '🌿', '🔥',
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

  // `maybeSingle`, not `single`: a brand-new account can legitimately have no
  // `users` row yet, and a missing row must not read as a server error —
  // that used to turn every fresh signup into a wall of 500s.
  const { data: profile, error } = await supabase
    .from('users')
    .select('id, email, anonymous_id, avatar_emoji, settings, display_name, alias, location, bio, interests, goals, is_public, share_moods, onboarded_at')
    .eq('id', user.id)
    .maybeSingle()

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
    // Convenience mirror of the real column: older screens read the auth
    // metadata name, newer ones read this.
    displayName: profile?.display_name ?? null,
    profile,
  })
}

/**
 * PATCH /api/me — update the profile row.
 * Body: {
 *   display_name?, alias?, location?, bio?, interests?, goals?,
 *   is_public?, avatar_emoji?, settings?
 * }
 *
 * The profile fields are the real columns added in
 * supabase_migration_profiles.sql. `settings` stays supported (and is merged,
 * not replaced) because notification toggles still live there.
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

  // The community alias is the primary identity (names can collide, aliases
  // cannot), so changing it needs its own checks: shape, and uniqueness.
  if (body.alias !== undefined) {
    const alias = asText(body.alias, { min: 3, max: 24 })
    if (!alias) return badRequest('Aliases are 3 to 24 characters.')

    const cleaned = alias.toLowerCase().trim()
    if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(cleaned)) {
      return badRequest('Use lowercase words separated by dashes, like silver-otter.')
    }

    // Check before writing so the user gets a readable message instead of a
    // raw unique-violation from the database.
    const { data: taken, error: takenError } = await supabase
      .from('users')
      .select('id')
      .ilike('alias', cleaned)
      .neq('id', user.id)
      .maybeSingle()

    if (takenError) return serverError('alias uniqueness check', takenError)
    if (taken) return badRequest(`"${cleaned}" is already taken. Pick another.`)

    updates.alias = cleaned
  }

  if (body.display_name !== undefined) {
    if (body.display_name === null || body.display_name === '') {
      updates.display_name = null
    } else {
      const name = asText(body.display_name, { min: 1, max: 60 })
      if (!name) return badRequest('Please provide a name up to 60 characters.')
      updates.display_name = name
    }
  }

  if (body.location !== undefined) {
    if (body.location === null || body.location === '') {
      updates.location = null
    } else {
      const location = asText(body.location, { min: 1, max: 60 })
      if (!location) return badRequest('Please provide a location up to 60 characters.')
      updates.location = location
    }
  }

  if (body.bio !== undefined) {
    if (body.bio === null || body.bio === '') {
      updates.bio = null
    } else {
      const bio = asText(body.bio, { min: 1, max: 400 })
      if (!bio) return badRequest('Please keep your bio under 400 characters.')
      updates.bio = bio
    }
  }

  if (body.interests !== undefined) {
    const list = asStringList(body.interests, 20, 40)
    if (!list) return badRequest('Interests must be a list of up to 20 short labels.')
    updates.interests = list
  }

  if (body.goals !== undefined) {
    const list = asStringList(body.goals, 12, 60)
    if (!list) return badRequest('Goals must be a list of up to 12 labels.')
    updates.goals = list
  }

  if (body.onboarded_at !== undefined) {
    const stamp = asText(body.onboarded_at, { min: 1, max: 40 })
    if (!stamp || Number.isNaN(Date.parse(stamp))) {
      return badRequest('Invalid onboarded_at timestamp.')
    }
    updates.onboarded_at = stamp
  }

  if (body.share_moods !== undefined) {
    if (typeof body.share_moods !== 'boolean') {
      return badRequest('share_moods must be true or false.')
    }
    updates.share_moods = body.share_moods
  }

  if (body.is_public !== undefined) {
    // Strictly boolean: anything else would silently become truthy, and this
    // decides whether strangers can read your profile.
    if (typeof body.is_public !== 'boolean') {
      return badRequest('is_public must be true or false.')
    }
    updates.is_public = body.is_public
  }

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
    // Merge instead of replace. `settings` is a shared bag (profile setup,
    // notification toggles, …) and a replace would let any one caller wipe
    // what every other screen stored there.
    const { data: current, error: currentError } = await supabase
      .from('users')
      .select('settings')
      .eq('id', user.id)
      .maybeSingle()

    if (currentError) {
      return serverError('me settings merge', currentError)
    }

    updates.settings = {
      ...((current?.settings as Record<string, unknown>) ?? {}),
      ...(body.settings as Record<string, unknown>),
    }
  }

  if (Object.keys(updates).length === 0) {
    return badRequest('Nothing to update.')
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, anonymous_id, avatar_emoji, settings, display_name, alias, location, bio, interests, goals, is_public, share_moods, onboarded_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}

/**
 * Validates a list of short labels (interests, goals).
 *
 * Returns null for anything malformed so the caller can turn it into a 400,
 * and always returns a de-duplicated array so repeated picks cannot inflate
 * the stored column.
 */
function asStringList(value: unknown, maxItems: number, maxLen: number): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems) return null
  const out: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') return null
    const cleaned = item.trim()
    if (!cleaned) continue
    if (cleaned.length > maxLen) return null
    if (!out.includes(cleaned)) out.push(cleaned)
  }
  return out
}
