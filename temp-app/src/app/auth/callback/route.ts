import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth callback — Supabase redirects here after an email confirmation link
 * (or OAuth). Exchanges the one-time `code` for a real session, then sends the
 * user on to the authenticated app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/app/activities'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Verification failed → drop back to login with a readable message.
  const url = new URL('/login', origin)
  url.searchParams.set(
    'error',
    'We could not verify your email. Please try logging in again.'
  )
  return NextResponse.redirect(url)
}