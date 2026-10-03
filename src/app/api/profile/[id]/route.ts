import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, serverError } from '@/lib/security'
import { displayName } from '@/app/api/profiles/route'

/**
 * GET /api/profile/[id]
 *
 * One person's profile, visible when either:
 *   - they made their account public (users.is_public), or
 *   - you are connected with them.
 *
 * The check lives here rather than in the UI because a profile id is guessable
 * in practice — it comes out of the directory — so a client-side gate would
 * stop the tap but not the fetch.
 *
 * 404 (not 403) when neither holds: from the caller's side a profile they may
 * not see and a profile that does not exist are the same fact, and saying
 * otherwise would confirm that a private person exists at all.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const personId = asUuid(id)
  if (!personId || personId === user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Blocking hides someone completely, public or not.
  const { data: blocked } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', personId)
    .maybeSingle()

  if (blocked) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Both directions, because the pair is stored canonically — we do not know
  // from here whether we are user_a or user_b.
  const { data: link, error: linkError } = await supabase
    .from('connections')
    .select('status')
    .or(`and(user_a.eq.${user.id},user_b.eq.${personId}),and(user_a.eq.${personId},user_b.eq.${user.id})`)
    .eq('status', 'accepted')
    .maybeSingle()

  if (linkError) {
    return serverError('profile connection check', linkError)
  }

  const { data: person, error } = await supabase
    .from('users')
    .select('id, email, display_name, alias, avatar_emoji, location, bio, interests, goals, personality, note, is_public, share_moods, created_at')
    .eq('id', personId)
    .maybeSingle()

  if (error) {
    return serverError('profile load', error)
  }
  if (!person) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Private profile with no accepted connection: not viewable.
  if (!person.is_public && !link) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    person: {
      id: person.id,
      alias: person.alias ?? null,
      name: displayName(person.display_name, person.email),
      avatar_emoji: person.avatar_emoji ?? '😊',
      location: person.location ?? '',
      bio: person.bio ?? '',
      interests: person.interests ?? [],
      goals: person.goals ?? [],
      personality: person.personality ?? [],
      note: person.note ?? '',
      is_public: person.is_public ?? false,
      // Whether the row opens the mood insights screen. The API enforces the
      // opt-in itself; this only lets the UI word the link honestly.
      share_moods: Boolean(person.share_moods) && Boolean(link),
      connected: Boolean(link),
      joined: person.created_at,
    },
  })
}