'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { exchangeGoogleCode, takeGoogleNextPath } from '@/lib/auth/google-oauth'

/**
 * Callback for the direct Google OAuth flow (see lib/auth/google-oauth.ts).
 *
 * Google returns `?code=` here rather than routing through Supabase's hosted
 * authorize endpoint. We exchange that code for a session, provision the
 * profile row, then continue to wherever the user was originally headed.
 *
 * The attempt lives in module scope on purpose. React runs effects twice in
 * development, and the first run's cleanup fires while its async work is still
 * in flight — so a per-instance guard would let the second mount skip and the
 * first mount never render its result, leaving the spinner up forever. Every
 * mount awaits the same promise, so whichever one is still mounted finishes the
 * redirect, and a second visit with no code joins the attempt already running
 * instead of reporting a missing code.
 */
let inFlight: Promise<string> | null = null

export default function GoogleCallbackClient() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const oauthError = params.get('error')

    // Scrub the query first. The shared browser client has detectSessionInUrl
    // on, and if it initialises while `?code=` is still in the address bar it
    // will try to exchange that code against its own (absent) PKCE verifier
    // and fail. Removing it up front also keeps the code out of copy-pastes,
    // screenshots and the Referer header on the next navigation.
    window.history.replaceState({}, document.title, window.location.pathname)

    const run = async () => {
      if (oauthError) {
        throw new Error(
          oauthError === 'access_denied'
            ? 'Google sign-in was cancelled.'
            : 'Google sign-in failed. Please try again.',
        )
      }

      if (code) {
        // One exchange per code, shared by every mount of this page.
        inFlight = inFlight ?? exchangeGoogleCode(code)
      } else if (inFlight) {
        // A later mount of the same attempt (the query was already scrubbed).
        await inFlight
      } else {
        throw new Error('Google did not return a sign-in code.')
      }

      // Idempotent: covers the case where the DB trigger didn't create the
      // profile row, so a brand-new Google user doesn't land on a dashboard
      // that can't resolve their profile.
      await fetch('/api/profile/ensure', { method: 'POST' }).catch(() => undefined)

      const nextPath = takeGoogleNextPath()
      if (cancelled) return
      router.replace(nextPath)
      router.refresh()
    }

    run().catch((e) => {
      if (cancelled) return
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.')
      // Allow a fresh attempt from the login page.
      inFlight = null
    })

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="text-center">
        {error ? (
          <>
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
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