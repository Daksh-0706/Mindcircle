import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const body = await request.json()

  const updates: Record<string, unknown> = {}
  if (typeof body.avatar_emoji === 'string') updates.avatar_emoji = body.avatar_emoji
  if (body.settings && typeof body.settings === 'object') updates.settings = body.settings

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
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
