import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asBoolean, asEnum, asText, asUuid, badRequest, readJson } from '@/lib/security'

const MESSAGE_TYPES = ['text', 'image', 'audio'] as const
const MESSAGE_MAX = 4000

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

  return NextResponse.json({ data })
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
  const content = asText(body.content, { min: 1, max: MESSAGE_MAX })

  if (!roomId || !content) {
    return badRequest('A valid room_id and message content are required.')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      room_id: roomId,
      sender_id: user.id,
      content,
      message_type: asEnum(body.message_type, MESSAGE_TYPES, 'text'),
      is_anonymous: asBoolean(body.is_anonymous, true),
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
