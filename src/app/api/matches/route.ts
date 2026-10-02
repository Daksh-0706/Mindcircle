import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asInt, asText, asUuid, badRequest, readJson } from '@/lib/security'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('similarity_score', { ascending: false })
    .limit(20)

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

  const user2Id = asUuid(body.user2_id)
  if (!user2Id) return badRequest('A valid user2_id is required.')
  if (user2Id === user.id) return badRequest('You cannot match with yourself.')

  const score = asInt(body.similarity_score, { min: 0, max: 100 })
  const reason = asText(body.match_reason, { min: 0, max: 500 })

  if (score === null) return badRequest('Similarity score must be 0-100.')

  const { data, error } = await supabase
    .from('matches')
    .insert([{
      user1_id: user.id,
      user2_id: user2Id,
      similarity_score: score,
      match_reason: reason,
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
