'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CloudOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { authErrorMessage } from '@/lib/auth-errors'
import {
  EMAIL_AUTH_AVAILABLE,
  EMAIL_AUTH_UNAVAILABLE_MESSAGE,
} from '@/lib/auth-availability'
import {
  GOOGLE_DIRECT_AUTH_AVAILABLE,
  startGoogleDirectSignIn,
} from '@/lib/auth/google-oauth'
import { Logo } from '../../../components/common/Logo'
import { AuthArt, AuthQuote, Flourish } from '../../../components/auth/AuthArt'

const supabase = createClient()

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

/* ── Social Login Icons ───────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

/* ── Page ─────────────────────────────────────────────────── */

export default function LoginPage() {
  return (
    <>
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
    </>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Where the middleware wanted to send us before bouncing to login. Only a
  // same-origin relative path is honoured, so this can't become an open
  // redirect (the middleware applies the same rule on its side).
  const nextPath =
    searchParams.get('next')?.startsWith('/') && !searchParams.get('next')?.startsWith('//')
      ? searchParams.get('next')!
      : '/app'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Google OAuth. Prefers our own Google client when NEXT_PUBLIC_GOOGLE_CLIENT_ID
  // is set, so the consent screen names this app's domain instead of
  // Supabase's; falls back to the Supabase-hosted flow otherwise.
  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    if (GOOGLE_DIRECT_AUTH_AVAILABLE) {
      try {
        await startGoogleDirectSignIn(nextPath)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not start Google sign-in.')
        setLoading(false)
      }
      // On success the browser navigates away to Google; nothing else to do.
      return
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_AUTH_AVAILABLE) return
    setError('')
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setLoading(false)
      // Deliberately vague: don't reveal whether the account exists.
      setError(authErrorMessage(signInError))
      return
    }
    // Make sure the profile row exists before we route anywhere that reads it.
    await fetch('/api/profile/ensure', { method: 'POST' }).catch(() => undefined)
    setLoading(false)
    router.replace(nextPath)
    router.refresh()
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex"
    >
      {/* ── Left: Form ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10">
            <Logo height={32} withWordmark />
            
          </Link>

          <h1 className="flex items-center gap-2 mb-2">
            <span className="font-display text-3xl sm:text-4xl font-bold text-charcoal">
              Welcome back
            </span>
            <Flourish className="w-6 h-5 text-terracotta/70 shrink-0" />
          </h1>
          <p className="text-warm-gray mb-8">
            Log in to continue your wellness journey.
          </p>

          {/* Social buttons */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mb-6 flex w-full items-center justify-center gap-2 py-3 rounded-xl border border-warm-gray-lighter bg-white hover:bg-cream-dark transition-colors text-sm font-medium text-charcoal disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-warm-gray-lighter" />
            <span className="text-xs text-warm-gray">
              {EMAIL_AUTH_AVAILABLE ? 'or continue with email' : 'email sign-in'}
            </span>
            <div className="flex-1 h-px bg-warm-gray-lighter" />
          </div>

          {EMAIL_AUTH_AVAILABLE ? (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-charcoal mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-warm w-full pl-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-charcoal"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-plum font-medium hover:text-plum-dark transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-warm w-full pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            {error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in…' : 'Log In'} {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
          ) : (
            /* No working outbound SMTP yet, so the email form is replaced
               outright rather than shown and left to fail. Google above is
               the working way in. */
            <div className="flex items-start gap-3 rounded-2xl border border-warm-gray-lighter bg-white px-4 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-dark text-warm-gray">
                <CloudOff className="w-4 h-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal">
                  Email sign-in is currently unavailable
                </p>
                <p className="mt-1 text-[13px] leading-6 text-warm-gray">
                  {EMAIL_AUTH_UNAVAILABLE_MESSAGE}
                </p>
              </div>
            </div>
          )}

          {/* Sign up link */}
          <p className="text-center text-sm text-warm-gray mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-plum font-semibold hover:text-plum-dark transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: artwork + quote (desktop) ──────────────── */}
      <div className="relative hidden lg:flex w-1/2 shrink-0">
        <div className="absolute inset-y-0 left-0 w-px bg-plum/10" />
        <AuthArt accent="plum" />
        <div className="relative z-10 mt-auto w-full px-10 pb-24">
          <AuthQuote author="Julia Julian">
            You are not your illness. You have an individual story to tell; you
            have a name, a history, a personality.
          </AuthQuote>
        </div>
      </div>

    </motion.div>
  )
}
