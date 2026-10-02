import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { serverError } from '@/lib/security'

/**
 * POST /api/profile/ensure
 *
 * Idempotently creates the caller's `users` profile row if it is missing.
 *
 * Why this exists: every other table in the app references `users.id`, and
 * several routes (`/api/me`, the DM thread joiner) do `.single()` on it — so a
 * missing row breaks the app in ways that look unrelated to signup. Rather
 * than depend on a database trigger that may or may not be installed, the
 * client calls this right after it obtains a session.
 *
 * Safe to call repeatedly: an existing row is left untouched.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Already provisioned? Nothing to do.
  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (lookupError) {
    return serverError('profile/ensure lookup', lookupError)
  }
  if (existing) {
    return NextResponse.json({ data: existing, created: false })
  }

  // Mirror the shape used by the handle_new_user() DB trigger so this
  // endpoint and the trigger cannot drift apart.
  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email,
      anonymous_id: `anon-${user.id.replace(/-/g, '').slice(0, 8)}`,
      avatar_emoji: '😊',
    })
    .select('id')
    .single()

  if (insertError) {
    // 23505 = unique violation: a concurrent request won the race, which is
    // a success for our purposes.
    if (insertError.code === '23505') {
      return NextResponse.json({ data: { id: user.id }, created: false })
    }
    return serverError('profile/ensure insert', insertError)
  }

  return NextResponse.json({ data: created, created: true }, { status: 201 })
}