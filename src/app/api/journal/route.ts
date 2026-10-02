import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  asBoolean,
  asHttpUrl,
  asText,
  asUuid,
  badRequest,
  readJson,
} from '@/lib/security'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
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

  const content = asText(body.content, { min: 1, max: 20000 })
  if (!content) return badRequest('Entry content is required (max 20,000 characters).')

  const mediaUrls = Array.isArray(body.media_urls)
    ? body.media_urls
        .slice(0, 9)
        .map((u) => asHttpUrl(u))
        .filter((u): u is string => u !== null)
    : []

  const moodTag = asText(body.mood_tag, { min: 1, max: 40 })

  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{
      user_id: user.id,
      content,
      media_urls: mediaUrls,
      mood_tag: moodTag,
      is_anonymous: asBoolean(body.is_anonymous, true),
      is_private: asBoolean(body.is_private, true),
    }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = asUuid(searchParams.get('id'))

  if (!id) {
    return badRequest('A valid entry id is required.')
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Deleted successfully' })
}
