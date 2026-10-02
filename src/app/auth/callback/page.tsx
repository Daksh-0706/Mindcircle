'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * OAuth callback route — Supabase redirects here after Google sign-in.
 *
 * Handles both flows, because which one is in play depends on how the client
 * was configured:
 *  - Implicit: tokens arrive in the URL hash; supabase-js parses and persists
 *    them automatically.
 *  - PKCE:      a `?code=` query param is exchanged for a session.
 *
 * Then it makes sure the `users` profile row exists before routing, so a new
 * Google user doesn't land on a dashboard that can't resolve their profile.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let active = true

    const finish = async () => {
      try {
        // Do NOT call exchangeCodeForSession here.
        //
        // @supabase/ssr's browser client has detectSessionInUrl enabled, so it
        // consumes the ?code= (PKCE) or #access_token= (implicit) by itself
        // during initialisation. Manually exchanging the same code afterwards
        // fails with "PKCE code verifier not found in storage" — the verifier
        // has already been used and discarded.
        //
        // So: just wait for the session to materialise.
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(
              () => reject(new Error('Timed out waiting for sign-in to complete.')),
              10_000,
            )
            const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
              if (session || event === 'SIGNED_OUT') {
                clearTimeout(timer)
                sub.subscription.unsubscribe()
                resolve()
              }
            })
          })
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No user after sign-in.')

        // Provision the profile row if the DB trigger didn't (e.g. it wasn't
        // installed, or the account predates it). Idempotent.
        await fetch('/api/profile/ensure', { method: 'POST' })

        // Clear any OAuth artefacts (PKCE ?code= or implicit #tokens) from the
        // address bar so they can't leak via copy-paste, screenshots or the
        // Referer header on the next navigation.
        if (window.location.hash || window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        if (!active) return
        router.replace('/app')
        router.refresh()
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.')
        }
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