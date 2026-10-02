import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/change-password
 * Body: { current_password: string, new_password: string }
 * Verifies the current password by re-authenticating, then updates it.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const currentPassword = typeof body?.current_password === 'string' ? body.current_password : ''
  const newPassword = typeof body?.new_password === 'string' ? body.new_password : ''

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing current or new password.' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  // Verify the current password by signing in with it.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) {
    return NextResponse.json({ error: 'Your current password is incorrect.' }, { status: 401 })
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Password updated.' })
}
