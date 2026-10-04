import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asBoolean, asEnum, asText, asUuid, badRequest, readJson } from '@/lib/security'
import { readMediaPaths, withSignedImages } from '@/lib/chat/media'
import { deleteMessage } from '@/lib/chat/delete'

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
  const media = readMediaPaths(body, user.id)
  if (!media.ok) return badRequest(media.error)
  const mediaPaths = media.paths

  if (!roomId || (!content && mediaPaths.length === 0)) {
    return badRequest('A valid room_id and either content or an image are required.')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      room_id: roomId,
      sender_id: user.id,
      content: content ?? '',
      media_paths: mediaPaths.length > 0 ? mediaPaths : null,
      message_type: mediaPaths.length > 0
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

/**
 * DELETE /api/chat/messages?id=<uuid>
 *
 * Removes one of the caller's own room messages for everyone. RLS scopes the
 * update to the sender, so a message id belonging to somebody else is a 404
 * rather than a silent success.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = new URL(request.url).searchParams.get('id')
  return deleteMessage(supabase, 'messages', id ?? '', user.id)
}
