import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
  const roomId = searchParams.get('room_id')

  if (!roomId) {
    return NextResponse.json({ error: 'Missing room_id' }, { status: 400 })
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

  const body = await request.json()

  if (!body.room_id || !body.content?.trim()) {
    return NextResponse.json({ error: 'Missing room_id or content' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      room_id: body.room_id,
      sender_id: user.id,
      content: body.content.trim(),
      message_type: body.message_type || 'text',
      is_anonymous: body.is_anonymous ?? true,
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
