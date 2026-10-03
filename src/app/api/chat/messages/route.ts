import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asBoolean, asEnum, asText, asUuid, badRequest, readJson } from '@/lib/security'

const MESSAGE_TYPES = ['text', 'image', 'audio'] as const
const MESSAGE_MAX = 10000

/**
 * GET /api/chat/messages?room_id=<uuid>
 * Ensures the caller is a member of the room first (auto-join), then
 * returns the room's messages. The auto-join here is the reliable path —
 * the client-side join can silently fail and leave RLS blocking reads.
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
  const roomId = asUuid(searchParams.get('room_id'))

  if (!roomId) {
    return badRequest('A valid room_id is required.')
  }

  // Auto-join (idempotent): without a membership row, RLS hides every message.
  const { data: membership } = await supabase
    .from('room_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    const { error: joinError } = await supabase
      .from('room_members')
      .insert([{ room_id: roomId, user_id: user.id }])
    // Unique-violation (already joined concurrently) is fine; anything else
    // is a real problem and must surface.
    if (joinError && joinError.code !== '23505') {
      return NextResponse.json(
        { error: `Could not join room: ${joinError.message}` },
        { status: 500 },
      )
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: await withSignedImages(supabase, data ?? []) })
}

/**
 * Attach a short-lived signed URL to every row that carries an image.
 *
 * The bucket is private, so the stored value is only a storage path. Signing
 * here — rather than in the browser — means the bucket can stay private and the
 * URLs still expire on their own.
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
  const signed = new Map(
    (data ?? []).map((f) => [f.path, f.signedUrl]),
  )

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

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const roomId = asUuid(body.room_id)
  const content = asText(body.content, { min: 0, max: MESSAGE_MAX })
  const mediaUrl = asText(body.media_url, { min: 1, max: 500 })

  if (!roomId || (!content && !mediaUrl)) {
    return badRequest('A valid room_id and either content or an image are required.')
  }

  // Only the sender's own folder may be attached, so nobody can point a message
  // at an image they did not upload — or at any other path in the bucket.
  if (mediaUrl && !mediaUrl.startsWith(`${user.id}/`)) {
    return badRequest('That image does not belong to you.')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      room_id: roomId,
      sender_id: user.id,
      content: content ?? '',
      media_url: mediaUrl ?? null,
      message_type: mediaUrl
        ? ('image' as const)
        : asEnum(body.message_type, MESSAGE_TYPES, 'text'),
      is_anonymous: asBoolean(body.is_anonymous, true),
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
