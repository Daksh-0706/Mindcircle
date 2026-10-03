import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest, serverError } from '@/lib/security'

/**
 * GET  /api/blocks        — the people I have blocked (ids only)
 * POST /api/blocks        { user_id }  — block someone
 * DELETE /api/blocks      { user_id }  — unblock
 *
 * The list is returned as bare ids on purpose: every listing surface
 * (directory, DM list, search, messaging) filters with it, and nothing in the
 * UI needs to explain *why* someone is hidden.
 *
 * Blocking is one-directional on purpose. Blocker A → blocked B removes B from
 * A's surfaces without touching B's, which is what people expect from a block
 * button: relief for me, no notification or signal for them.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id)

  if (error) {
    return serverError('blocks list', error)
  }

  return NextResponse.json({ data: (data ?? []).map((r) => r.blocked_id) })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const targetId = asUuid((body as { user_id?: unknown } | null)?.user_id)
  if (!targetId) return badRequest('Invalid user_id.')
  if (targetId === user.id) return badRequest('You cannot block yourself.')

  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('id', targetId)
    .maybeSingle()

  if (!target) return badRequest('That person is no longer available.')

  // on conflict makes a double-tap harmless instead of a 500.
  const { error } = await supabase
    .from('blocks')
    .upsert(
      { blocker_id: user.id, blocked_id: targetId },
      { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true },
    )

  if (error) {
    return serverError('blocks create', error)
  }

  // Drop the connection too. Leaving a chat with someone you have just blocked
  // open would be the one way to still reach them, and the two states are
  // incompatible: blocking exists precisely to end the relationship.
  const [a, b] =
    user.id < targetId
      ? [user.id, targetId]
      : [targetId, user.id]
  await supabase.from('connections').delete().eq('user_a', a).eq('user_b', b)

  return NextResponse.json({ ok: true, blocked_id: targetId }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const targetId = asUuid((body as { user_id?: unknown } | null)?.user_id)
  if (!targetId) return badRequest('Invalid user_id.')

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetId)

  if (error) {
    return serverError('blocks delete', error)
  }

  return NextResponse.json({ ok: true })
}