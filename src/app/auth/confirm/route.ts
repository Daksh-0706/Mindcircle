import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /auth/confirm — completes email confirmation from a link.
 *
 * Supabase's email templates link here with a `token_hash` when they are
 * configured for the PKCE/SSR flow (the app uses PKCE). This route exchanges
 * that hash for a session, sets the auth cookies, and forwards the user on.
 *
 * Without this, clicking the confirmation link 404s and the account can never
 * be verified.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/onboarding'

  // Only ever bounce within this app — `next` arrives from the email link, so
  // an absolute or protocol-relative value would be an open redirect.
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')
      ? next
      : '/onboarding'

  if (tokenHash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

    if (!error) {
      // Session cookies are set on the response by the server client; send the
      // newly-verified user into onboarding so their profile gets provisioned.
      const target = new URL(safeNext, origin)
      target.searchParams.delete('token_hash')
      target.searchParams.delete('type')
      redirect(target.toString())
    }

    console.error('[auth/confirm] verifyOtp failed:', error.message)
  }

  redirect(`/verify-otp?error=confirm_failed&email=${encodeURIComponent(searchParams.get('email') ?? '')}`)
}