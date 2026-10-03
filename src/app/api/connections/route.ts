import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest, readJson, serverError } from '@/lib/security'

type ConnectionState = 'pending' | 'accepted'

/** Canonical ordering so (a,b) and (b,a) collapse into one row. */
function pair(a: string, b: string) {
  return a < b ? { user_a: a, user_b: b } : { user_a: b, user_b: a }
}

/**
 * GET /api/connections
 *   ?status=accepted|pending|all   (default: all)
 *
 * Returns the viewer's connections with the other person's profile folded
 * in, plus `direction` so the UI can tell an incoming request from an
 * outgoing one.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = new URL(request.url).searchParams.get('status') ?? 'all'

  const { data: links, error } = await supabase
    .from('connections')
    .select('user_a, user_b, status, created_at, accepted_at')
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)

  if (error) {
    return serverError('connections list', error)
  }

  const filtered = (links ?? []).filter(
    (l) => status === 'all' || l.status === status,
  )

  const peerIds = filtered.map((l) => (l.user_a === user.id ? l.user_b : l.user_a))
  const profiles = new Map<string, Record<string, unknown>>()
  if (peerIds.length > 0) {
    const { data: people } = await supabase
      .from('users')
      .select('id, email, display_name, alias, location, bio, avatar_emoji, interests')
      .in('id', peerIds)
    for (const p of people ?? []) profiles.set(p.id, p)
  }

  return NextResponse.json({
    data: filtered.map((l) => {
      const peerId = l.user_a === user.id ? l.user_b : l.user_a
      const peer = profiles.get(peerId)
      const iAmRecipient = l.user_b === user.id
      return {
        id: peerId,
        status: l.status,
        direction: l.status === 'accepted' ? 'accepted' : iAmRecipient ? 'incoming' : 'outgoing',
        created_at: l.created_at,
        accepted_at: l.accepted_at,
        person: peer
          ? {
              id: peer.id,
              alias: peer.alias ?? null,
              name: nameOf(peer),
              avatar_emoji: peer.avatar_emoji ?? '😊',
              location: peer.location ?? '',
              bio: peer.bio ?? '',
              interests: peer.interests ?? [],
            }
          : null,
      }
    }),
  })
}

/**
 * POST /api/connections  { user_id }
 *
 * Sends a request, or accepts one if this user is the recipient. Idempotent:
 * connecting twice with the same person never creates a second row.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await readJson(request)
  const targetId = asUuid(body?.user_id)
  if (!targetId || targetId === user.id) {
    return badRequest('Pick someone other than yourself.')
  }

  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('id', targetId)
    .maybeSingle()

  if (!target) {
    return badRequest('That person is no longer available.')
  }

  const { user_a, user_b } = pair(user.id, targetId)

  const { data: existing } = await supabase
    .from('connections')
    .select('id, user_a, user_b, status')
    .eq('user_a', user_a)
    .eq('user_b', user_b)
    .maybeSingle()

  // Already connected — nothing to do.
  if (existing?.status === 'accepted') {
    return NextResponse.json({ data: existing, created: false })
  }

  // A request already exists.
  //  - I am the sender  → tell them it is pending
  //  - I am the recipient → accept it right away
  if (existing) {
    const iAmRecipient = existing.user_b === user.id
    if (!iAmRecipient) {
      return NextResponse.json({ data: existing, created: false })
    }
    const { data: accepted, error } = await supabase
      .from('connections')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select('id, user_a, user_b, status')
      .single()
    if (error) return serverError('connections accept', error)
    return NextResponse.json({ data: accepted, created: false })
  }

  const { data: created, error } = await supabase
    .from('connections')
    .insert({ user_a, user_b, status: 'pending' satisfies ConnectionState })
    .select('id, user_a, user_b, status')
    .single()

  if (error) return serverError('connections create', error)
  return NextResponse.json({ data: created, created: true }, { status: 201 })
}

/**
 * PATCH /api/connections  { user_id }
 * Accepts a pending request. Only the recipient is allowed to.
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
  const targetId = asUuid(body?.user_id)
  if (!targetId) return badRequest('Invalid user_id.')

  const { data: updated, error } = await supabase
    .from('connections')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('user_a', user.id)
    .eq('user_b', targetId)
    .eq('status', 'pending')
    .select('id, user_a, user_b, status')
    .maybeSingle()

  if (error) return serverError('connections accept', error)
  if (!updated) return badRequest('No pending request from that person.')

  return NextResponse.json({ data: updated })
}

/**
 * DELETE /api/connections  { user_id }
 * Withdraws or removes a connection. Either side may do it.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await readJson(request)
  const targetId = asUuid(body?.user_id)
  if (!targetId) return badRequest('Invalid user_id.')

  const { user_a, user_b } = pair(user.id, targetId)

  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('user_a', user_a)
    .eq('user_b', user_b)

  if (error) return serverError('connections delete', error)
  return NextResponse.json({ ok: true })
}

function nameOf(peer: { display_name?: string | null; email?: string | null }) {
  const explicit = (peer.display_name ?? '').trim()
  if (explicit) return explicit
  const local = (peer.email ?? '').split('@')[0]
  if (!local) return 'Mindcircle user'
  return local.charAt(0).toUpperCase() + local.slice(1)
}
