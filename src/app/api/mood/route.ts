import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('mood_logs')
    .insert([{
      user_id: body.user_id,
      mood_score: body.mood_score,
      mood_emoji: body.mood_emoji,
      note: body.note
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
