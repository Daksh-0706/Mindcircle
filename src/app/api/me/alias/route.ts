import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/me/alias?alias=<text>
 *
 * Availability probe for the community alias field in Edit Profile. It exists
 * so the UI can say "taken" while typing, instead of only after a failed save.
 *
 * Deliberately a separate lightweight route: saving still goes through
 * PATCH /api/me, which re-checks uniqueness. This endpoint is advisory.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const raw = (new URL(request.url).searchParams.get('alias') ?? '').trim().toLowerCase()

  const valid =
    raw.length >= 3 &&
    raw.length <= 24 &&
    /^[a-z0-9]+(-[a-z0-9]+)+$/.test(raw)

  if (!valid) {
    return NextResponse.json({ alias: raw, available: false, valid: false })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .ilike('alias', raw)
    .neq('id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ alias: raw, available: !data, valid: true })
}