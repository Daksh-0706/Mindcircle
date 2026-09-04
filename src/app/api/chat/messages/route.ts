import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('room_id')

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
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      room_id: body.room_id,
      sender_id: body.sender_id,
      content: body.content,
      message_type: body.message_type || 'text',
      is_anonymous: body.is_anonymous ?? true
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
