import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/stories — active (non-expired) anonymous stories with like
 * counts and whether the signed-in user liked each one.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const body = await request.json()

  // Stories live for 24 hours, Instagram-style.
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('stories')
    .insert([{
      user_id: user.id,
      content: body.content,
      media_url: body.media_url,
      mood_emoji: body.mood_emoji,
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
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
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
