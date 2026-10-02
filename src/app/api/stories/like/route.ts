import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest, readJson, rateLimit, clientKey, tooManyRequests } from '@/lib/security'

/**
 * POST /api/stories/like — toggle the signed-in user's like on a story.
 * Body: { story_id: string }
 * Returns the new liked state and the story's total like count.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Likes are a high-frequency write path, so cap them per user.
  const limit = rateLimit(clientKey(request, user.id), { limit: 60, windowMs: 60_000 })
  if (!limit.ok) return tooManyRequests(limit.retryAfter)

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const storyId = asUuid(body.story_id)
  if (!storyId) return badRequest('A valid story_id is required.')

  const { data: existing, error: findError } = await supabase
    .from('story_likes')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 })
  }

  let liked: boolean
  if (existing) {
    const { error: deleteError } = await supabase
      .from('story_likes')
      .delete()
      .eq('id', existing.id)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    liked = false
  } else {
    const { error: insertError } = await supabase
      .from('story_likes')
      .insert([{ story_id: storyId, user_id: user.id }])
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    liked = true
  }

  const { count, error: countError } = await supabase
    .from('story_likes')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', storyId)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  return NextResponse.json({ liked, likes: count ?? 0 })
}
