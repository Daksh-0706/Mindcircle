import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asInt } from '@/lib/security'

const MAX_LIMIT = 60

/**
 * GET /api/profiles
 *   ?q=<text>        match on alias, display name, location or bio
 *   ?interest=<name> only people who picked that interest
 *   ?limit=<n>       default 24, capped at 60
 *
 * Returns the directory of other members plus the viewer's connection state
 * with each of them, so Discover can render "Connect" / "Pending" /
 * "Message" without a second round trip.
 *
 * `users` is world-readable to signed-in members by design (the "users
 * select" policy is `using (true)`), which is what makes this listing
 * possible without a service-role key.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim().toLowerCase()
  const interest = (searchParams.get('interest') ?? '').trim()
  const limit = asInt(searchParams.get('limit'), { min: 1, max: MAX_LIMIT }) ?? 24

  // Only people who finished setup are worth showing in the directory.
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name, alias, location, bio, avatar_emoji, interests, goals, is_public, created_at')
    .neq('id', user.id)
    .order('created_at', { ascending: false })
    .limit(MAX_LIMIT * 3)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let people = data ?? []

  // Blocked people vanish from the directory entirely — not greyed out, not
  // moved down the list. Search and "Load more" share this array, so filtering
  // here covers every way this list can surface.
  const { data: blocked } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', user.id)

  if (blocked && blocked.length > 0) {
    const hidden = new Set(blocked.map((b) => b.blocked_id))
    people = people.filter((p) => !hidden.has(p.id))
  }

  if (interest) {
    people = people.filter((p) => Array.isArray(p.interests) && p.interests.includes(interest))
  }

  if (q) {
    // Match against what the card actually shows: the display name when set,
    // otherwise the email prefix we fall back to. Searching the raw columns
    // alone would make everyone without a display name unfindable.
    people = people.filter((p) =>
      [p.alias, displayName(p.display_name, p.email), p.email, p.location, p.bio].some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q),
      ),
    )
  }

  people = people.slice(0, limit)

  // Connection state for exactly the page we are returning.
  const ids = people.map((p) => p.id)
  const byId = new Map<string, 'none' | 'pending' | 'accepted' | 'outgoing' | 'incoming'>()
  for (const id of ids) byId.set(id, 'none')

  if (ids.length > 0) {
    const { data: links } = await supabase
      .from('connections')
      .select('user_a, user_b, status')
      .or(`user_a.in.(${ids.join(',')}),user_b.in.(${ids.join(',')})`)

    for (const link of links ?? []) {
      for (const id of [link.user_a, link.user_b]) {
        if (!byId.has(id)) continue
        if (link.status === 'accepted') {
          byId.set(id, 'accepted')
          continue
        }
        // Pending is "outgoing" for the sender, "incoming" for the recipient.
        const iAmFirst = link.user_a === user.id
        byId.set(id, iAmFirst ? 'outgoing' : 'incoming')
      }
    }
  }

  return NextResponse.json({
    data: people.map((p) => ({
      id: p.id,
      alias: p.alias ?? null,
      // Display name is what the card leads with; alias is always present too,
      // so a client can fall back to it when the name is empty or duplicated.
      name: displayName(p.display_name, p.email),
      avatar_emoji: p.avatar_emoji ?? '😊',
      location: p.location ?? '',
      bio: p.bio ?? '',
      interests: p.interests ?? [],
      goals: p.goals ?? [],
      connection: byId.get(p.id) ?? 'none',
      is_public: p.is_public ?? false,
    })),
  })
}

/**
 * Display name, with the email prefix as a fallback.
 *
 * Kept in sync with the app shell's own naming so a person is called the same
 * thing everywhere.
 */
export function displayName(name: string | null, email: string | null | undefined) {
  const explicit = typeof name === 'string' ? name.trim() : ''
  if (explicit) return explicit
  const local = (email ?? '').split('@')[0]
  if (!local) return 'Mindcircle user'
  return local.charAt(0).toUpperCase() + local.slice(1)
}
