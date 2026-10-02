import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest } from '@/lib/security'

/**
 * GET /api/chat/dm
 *   ?receiver_id=<uuid> — full conversation with that person
 *   (no params)         — all of my DM threads with last-message previews
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rawReceiverId = searchParams.get('receiver_id')
  const receiverId = asUuid(rawReceiverId)

  // Present but malformed means a tampered id, not "list my threads".
  if (rawReceiverId !== null && !receiverId) {
    return badRequest('Invalid receiver_id.')
  }

  if (!receiverId) {
    const { data: mine, error: mineError } = await supabase
      .from('direct_messages')
      .select('sender_id, receiver_id, content, created_at, is_read')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(300)

    if (mineError) {
      return NextResponse.json({ error: mineError.message }, { status: 500 })
    }

    // Group by the other participant; the first hit per thread is the latest
    // message because the query is newest-first.
    const threads = new Map<
      string,
      { participant_id: string; last_message: string; last_at: string; unread: number }
    >()
    for (const dm of mine ?? []) {
      const other = dm.sender_id === user.id ? dm.receiver_id : dm.sender_id
      if (!threads.has(other)) {
        threads.set(other, {
          participant_id: other,
          last_message: dm.content,
          last_at: dm.created_at,
          unread: 0,
        })
      }
      if (dm.receiver_id === user.id && !dm.is_read) {
        threads.get(other)!.unread += 1
      }
    }

    // Drop threads whose participant no longer exists (stale references).
    const { data: allUsers } = await supabase.from('users').select('id')
    const validIds = new Set((allUsers ?? []).map((u) => u.id))
    const liveThreads = [...threads.values()].filter((t) => validIds.has(t.participant_id))

    return NextResponse.json({ data: liveThreads })
  }

  // Does this peer still exist? (deleted accounts leave dead links behind)
  const { data: peer } = await supabase
    .from('users')
    .select('id')
    .eq('id', receiverId)
    .maybeSingle()
  const peerExists = Boolean(peer)

  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, peer_exists: peerExists })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | { receiver_id?: unknown; content?: unknown }
    | null

  const receiverId = asUuid(body?.receiver_id)
  const content =
    typeof body?.content === 'string' ? body.content.trim().slice(0, 4000) : ''

  if (!receiverId || !content) {
    return badRequest('A valid receiver_id and message content are required.')
  }

  // Verify the receiver actually exists — otherwise the FK violation leaks
  // an ugly internal error when a stale/deleted user id is referenced.
  const { data: receiver, error: receiverError } = await supabase
    .from('users')
    .select('id')
    .eq('id', receiverId)
    .maybeSingle()

  if (receiverError) {
    return NextResponse.json({ error: receiverError.message }, { status: 500 })
  }
  if (!receiver) {
    return NextResponse.json(
      { error: 'This person is no longer available on MindCircle.' },
      { status: 404 },
    )
  }

  const { data, error } = await supabase
    .from('direct_messages')
    .insert([{
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
