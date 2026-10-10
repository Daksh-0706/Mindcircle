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
 * When neither holds the profile is still returned, but stripped down to the
 * identity the directory already shows (alias + avatar) plus `locked: true`.
 * The person is discoverable, so hiding them behind a 404 would be theatre —
 * what is protected is their bio, location, interests, goals and moods, and
 * none of those cross the wire. Only a block produces a real 404, because then
 * the person must become genuinely invisible.
 *
 * The visibility check lives here rather than in the UI because a profile id is
 * guessable in practice — it comes out of the directory — so a client-side
 * gate would stop the tap but not the fetch.
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
  // from here whether we are user_a or user_b. Read the row at *any* status so
  // an accepted connection and a pending request are told apart: a private
  // profile someone has already asked to connect on must offer "Accept", not
  // another "Send connection request".
  const { data: link, error: linkError } = await supabase
    .from('connections')
    .select('status, user_a, user_b')
    .or(`and(user_a.eq.${user.id},user_b.eq.${personId}),and(user_a.eq.${personId},user_b.eq.${user.id})`)
    .maybeSingle()

  if (linkError) {
    return serverError('profile connection check', linkError)
  }

  const accepted = link?.status === 'accepted'
  // The pair is ordered (user_a, user_b), so being user_b is what makes a
  // pending row a request *to* us rather than one *from* us.
  const pendingRequest =
    link?.status === 'pending' ? (link.user_b === user.id ? 'incoming' : 'outgoing') : null

  const { data: person, error } = await supabase
    .from('users')
    .select('id, email, display_name, alias, pronouns, avatar_emoji, location, bio, interests, goals, personality, note, is_public, share_moods, created_at')
    .eq('id', personId)
    .maybeSingle()

  if (error) {
    return serverError('profile load', error)
  }
  if (!person) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Private profile with no accepted connection: identify them, reveal nothing
  // else. The client renders the "send a request to view" screen from this.
  if (!person.is_public && !accepted) {
    return NextResponse.json({
      person: {
        id: person.id,
        alias: person.alias ?? null,
        name: displayName(person.display_name, person.email),
        avatar_emoji: person.avatar_emoji ?? '😊',
        is_public: false,
        locked: true,
        connected: false,
        pending_request: pendingRequest,
      },
    })
  }

  return NextResponse.json({
    person: {
      id: person.id,
      alias: person.alias ?? null,
      name: displayName(person.display_name, person.email),
      pronouns: person.pronouns ?? '',
      avatar_emoji: person.avatar_emoji ?? '😊',
      location: person.location ?? '',
      bio: person.bio ?? '',
      interests: person.interests ?? [],
      goals: person.goals ?? [],
      personality: person.personality ?? [],
      note: person.note ?? '',
      is_public: person.is_public ?? false,
      locked: false,
      // Whether the row opens the mood insights screen. The API enforces the
      // opt-in itself; this only lets the UI word the link honestly.
      share_moods: Boolean(person.share_moods) && accepted,
      connected: accepted,
      pending_request: pendingRequest,
      joined: person.created_at,
    },
  })
}