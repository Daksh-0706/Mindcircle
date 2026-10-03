import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest } from '@/lib/security'

/**
 * GET /api/chat/dm
 *   ?receiver_id=<uuid> — full conversation with that person
 *   (no params)         — all of my DM threads with last-message previews
 */
/**
 * Display name for a peer.
 *
 * `users` has no name column — the display name lives in
 * `auth.users.user_metadata`, which PostgREST cannot read with the anon key.
 * So the email local-part is the best available handle, matching how the app
 * shell names people elsewhere.
 */
function peerName(email: string | null | undefined) {
  const local = (email ?? '').split('@')[0]
  if (!local) return 'Mindcircle user'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

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

  // One place to ask "may these two talk at all?" — used by both the thread
  // view and the send path, so a blocked person cannot be read or messaged.
  const { data: blockRows } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id)
  const blockedByMe = new Set((blockRows ?? []).map((b) => b.blocked_id))

  // Present but malformed means a tampered id, not "list my threads".
  if (rawReceiverId !== null && !receiverId) {
    return badRequest('Invalid receiver_id.')
  }

  if (receiverId && blockedByMe.has(receiverId)) {
    return NextResponse.json({ error: 'This conversation is not available.' }, { status: 404 })
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
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, email, alias, avatar_emoji')
    const byId = new Map((allUsers ?? []).map((u) => [u.id, u]))
    const liveThreads = [...threads.values()]
      .filter((t) => byId.has(t.participant_id))
      // Blocked conversations disappear from the list, same as the directory.
      .filter((t) => !blockedByMe.has(t.participant_id))
      .map((t) => {
        const peer = byId.get(t.participant_id)!
        return {
          ...t,
          name: peerName(peer.email),
          alias: peer.alias ?? null,
          avatar_emoji: peer.avatar_emoji,
        }
      })

    return NextResponse.json({ data: liveThreads })
  }

  // Does this peer still exist? (deleted accounts leave dead links behind)
  const { data: peer } = await supabase
    .from('users')
    .select('id, email, avatar_emoji')
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

  return NextResponse.json({
    data: await withSignedImages(supabase, data ?? []),
    peer_exists: peerExists,
    peer: peer
      ? { id: peer.id, name: peerName(peer.email), avatar_emoji: peer.avatar_emoji }
      : null,
  })
}

/**
 * Attach a short-lived signed URL to every message carrying an image.
 *
 * The chat-media bucket is private, so `media_url` holds only a storage path;
 * signing server-side keeps the bucket closed and lets the URLs expire.
 */
async function withSignedImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: Record<string, unknown>[],
) {
  const paths = [
    ...new Set(
      rows
        .map((r) => r.media_url)
        .filter((p): p is string => typeof p === 'string' && p.length > 0),
    ),
  ]
  if (paths.length === 0) return rows

  const { data } = await supabase.storage.from('chat-media').createSignedUrls(paths, 3600)
  const signed = new Map((data ?? []).map((f) => [f.path, f.signedUrl]))

  return rows.map((r) => ({
    ...r,
    image_url: typeof r.media_url === 'string' ? (signed.get(r.media_url) ?? null) : null,
  }))
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
    typeof body?.content === 'string' ? body.content.trim() : ''
  const mediaUrl =
    typeof (body as { media_url?: unknown } | null)?.media_url === 'string'
      ? (body as { media_url: string }).media_url
      : ''

  if (!receiverId || (!content && !mediaUrl)) {
    return badRequest('A valid receiver_id and either content or an image are required.')
  }

  const { data: blockRows } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id)
  if ((blockRows ?? []).some((b) => b.blocked_id === receiverId)) {
    return badRequest('You have blocked this person.')
  }

  // Only the sender's own folder may be attached.
  if (mediaUrl && !mediaUrl.startsWith(`${user.id}/`)) {
    return badRequest('That image does not belong to you.')
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
      media_url: mediaUrl || null,
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
