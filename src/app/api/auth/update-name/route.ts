import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/update-name
 * Body: { full_name: string }
 * Stores the display name in the auth user's metadata.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : ''

  if (!fullName || fullName.length > 40) {
    return NextResponse.json({ error: 'Please provide a name between 1 and 40 characters.' }, { status: 400 })
  }

  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, full_name: fullName },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Name updated.' })
}
