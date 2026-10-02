'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * OAuth callback route — Supabase redirects here after Google sign-in.
 * Exchanges the auth code for a session, then sends the user on their way:
 *  - First-time Google users (no profile row yet) → onboarding
 *  - Returning users → dashboard
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let active = true

    // Implicit flow: Supabase JS detects tokens in the URL hash fragment
    // and stores the session automatically. We just wait for it.
    const finish = async () => {
      // Give the Supabase client a beat to parse the hash and persist the session.
      await new Promise((r) => setTimeout(r, 300))
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('No user after sign-in.')
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()
        if (!active) return
        router.replace(profile ? '/app' : '/onboarding')
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.')
      }
    }

    finish()

    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="text-center">
        {error ? (
          <>
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            <a href="/login" className="mt-4 inline-block text-sm font-semibold text-plum hover:underline">
              Back to login
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-plum/20 border-t-plum" />
            <p className="mt-4 text-sm text-warm-gray">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  )
}
