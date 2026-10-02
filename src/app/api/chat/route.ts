import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest, readJson } from '@/lib/security'

/**
 * GET /api/chat — active rooms with member count + last message preview.
 * The client uses this for the Chats list and the Connect "Rooms" tab.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: rooms, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!rooms || rooms.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const roomIds = rooms.map((r) => r.id)

  const [membersRes, messagesRes, mineRes] = await Promise.all([
    supabase.from('room_members').select('room_id').in('room_id', roomIds),
    supabase
      .from('messages')
      .select('room_id, content, created_at')
      .in('room_id', roomIds)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('room_members').select('room_id').eq('user_id', user.id),
  ])

  const members = membersRes.data ?? []
  const messages = messagesRes.data ?? []
  const myRooms = new Set((mineRes.data ?? []).map((m) => m.room_id))

  const lastByRoom = new Map<string, { content: string; created_at: string }>()
  for (const m of messages) {
    // Query is newest-first, so the first hit per room is the latest message.
    if (!lastByRoom.has(m.room_id)) {
      lastByRoom.set(m.room_id, { content: m.content, created_at: m.created_at })
    }
  }

  const data = rooms.map((room) => ({
    ...room,
    member_count: members.filter((m) => m.room_id === room.id).length,
    last_message: lastByRoom.get(room.id) ?? null,
    is_member: myRooms.has(room.id),
  }))

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
  if (!roomId) return badRequest('A valid room_id is required.')

  const { data, error } = await supabase
    .from('room_members')
    .insert([{
      room_id: roomId,
      user_id: user.id,
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

/**
 * DELETE /api/chat?room_id=<uuid> — leave a room (removes membership).
 */
export async function DELETE(request: Request) {
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

  const { error } = await supabase
    .from('room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Left the room' })
}
