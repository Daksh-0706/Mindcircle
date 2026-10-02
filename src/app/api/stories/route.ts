import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asHttpUrl, asText, asUuid, badRequest, readJson } from '@/lib/security'

const STORY_MAX = 1000

/**
 * GET /api/stories — active (non-expired) anonymous stories with like
 * counts and whether the signed-in user liked each one.
 *
 * Stories are user-authored mental-health content, so this requires a
 * session: an anonymous visitor must not be able to enumerate everyone's
 * posts by hitting the endpoint directly.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const storyIds = data.map((s) => s.id)
  const { data: likes } = await supabase
    .from('story_likes')
    .select('story_id, user_id')
    .in('story_id', storyIds)

  const allLikes = likes ?? []
  const withLikes = data.map((story) => ({
    ...story,
    like_count: allLikes.filter((l) => l.story_id === story.id).length,
    liked_by_me: user ? allLikes.some((l) => l.story_id === story.id && l.user_id === user.id) : false,
    is_mine: user ? story.user_id === user.id : false,
  }))

  return NextResponse.json({ data: withLikes })
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

  const content = asText(body.content, { min: 1, max: STORY_MAX })
  if (!content) return badRequest(`Story text is required (max ${STORY_MAX} characters).`)

  const moodEmoji = asText(body.mood_emoji, { min: 1, max: 16 })
  if (!moodEmoji) return badRequest('Please choose a mood.')

  const mediaUrl = body.media_url == null ? null : asHttpUrl(body.media_url)
  if (body.media_url != null && !mediaUrl) {
    return badRequest('Media must be a valid http(s) URL.')
  }

  // Stories live for 24 hours, Instagram-style.
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('stories')
    .insert([{
      user_id: user.id,
      content,
      media_url: mediaUrl,
      mood_emoji: moodEmoji,
      expires_at: expiresAt,
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
    return badRequest('A valid story id is required.')
  }

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Story deleted' })
}
