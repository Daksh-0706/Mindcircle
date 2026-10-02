import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asInt, asText, badRequest, readJson } from '@/lib/security'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

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

  const moodScore = asInt(body.mood_score, { min: 1, max: 10 })
  if (moodScore === null) {
    return badRequest('Mood score must be a whole number between 1 and 10.')
  }

  const moodEmoji = asText(body.mood_emoji, { min: 1, max: 16 })
  if (!moodEmoji) return badRequest('Please choose a mood.')

  const note = asText(body.note, { min: 0, max: 1000 }) ?? null

  const { data, error } = await supabase
    .from('mood_logs')
    .insert([{
      user_id: user.id,
      mood_score: moodScore,
      mood_emoji: moodEmoji,
      note,
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
