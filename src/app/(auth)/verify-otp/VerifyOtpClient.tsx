'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { authErrorMessage } from '@/lib/auth-errors'
import { useSearchParams } from 'next/navigation'

const supabase = createClient()

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

// Supabase email OTP tokens are 6 digits by default.
const OTP_LENGTH = 6
// Server-side resend rate limit is 60s — match it so the button never lies.
const RESEND_SECONDS = 60

function maskedEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!domain) return email
  const visible = name.slice(0, 2)
  return `${visible}${'•'.repeat(Math.max(1, name.length - 2))}@${domain}`
}

/* ── Page ─────────────────────────────────────────────────── */

export default function VerifyOtpPage() {
  return (
    <>
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
    </>
  )
}

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = useCallback(
    (index: number, value: string) => {
      // Only accept single digit
      if (value.length > 1) return
      if (value && !/^\d$/.test(value)) return

      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otp]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!otp[index] && index > 0) {
          const newOtp = [...otp]
          newOtp[index - 1] = ''
          setOtp(newOtp)
          inputRefs.current[index - 1]?.focus()
        } else {
          const newOtp = [...otp]
          newOtp[index] = ''
          setOtp(newOtp)
        }
      }
      if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
      if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    },
    [otp]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
      if (!pasted) return

      const newOtp = Array(OTP_LENGTH).fill('')
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i]
      }
      setOtp(newOtp)

      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
      inputRefs.current[focusIndex]?.focus()
    },
    []
  )

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== OTP_LENGTH || !email) return
    setError('')
    setLoading(true)
    // Signup OTPs are verified with type: 'signup' (the email change
    // flow uses 'email', but we only send signup codes from this app).
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    setLoading(false)
    if (verifyError) {
      setError(
        verifyError.message === 'Email not confirmed'
          ? 'Code galat hai ya expire ho gaya. Naya code maango ya dobara try karo.'
          : authErrorMessage(verifyError)
      )
      return
    }
    setVerified(true)
    // Provision the profile row before onboarding reads from it.
    await fetch('/api/profile/ensure', { method: 'POST' }).catch(() => undefined)
    setTimeout(() => router.push('/onboarding'), 1200)
  }

  const handleResend = async () => {
    if (!canResend || resending || !email) return
    setError('')
    setResending(true)
    // type must match how the code was originally sent (signup OTP).
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      // Keep link-based confirmations pointed at /auth/confirm on resend too.
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    })
    setResending(false)
    if (resendError) {
      setError(authErrorMessage(resendError))
      return
    }
    setCountdown(RESEND_SECONDS)
    setCanResend(false)
    setOtp(Array(OTP_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
  }

  const isComplete = otp.every((d) => d !== '')

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex bg-white"
    >
      {/* ── Left: Form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-cream px-4 py-12 sm:px-8">
        <div className="w-full max-w-[420px]">
          {/* Brand + secure badge */}
          <div className="flex items-center justify-between mb-12">
            <Link href="/landing" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-plum to-terracotta">
                <Heart className="h-4 w-4 text-cream" />
              </span>
              <span className="font-heading text-[22px] font-bold text-plum">MindCircle</span>
            </Link>
            <span className="flex items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-bold text-sage-dark">
              <Mail size={12} /> Secure Loop
            </span>
          </div>

          <div className="rounded-[20px] border border-warm-gray-lighter bg-white p-8 shadow-[0px_4px_16px_#4A2C5E08]">
            {verified ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/15">
                  <CheckCircle2 className="h-8 w-8 text-sage-dark" />
                </div>
                <h1 className="mt-6 font-heading text-3xl font-bold text-plum">Email Verified!</h1>
                <p className="mt-3 text-sm text-warm-gray">Taking you to onboarding…</p>
              </div>
            ) : (
              <>
                <h1 className="font-heading text-[32px] font-bold text-plum">Check your messages</h1>
                <p className="mt-3 text-base leading-6 text-charcoal">
                  We sent a 6-digit verification code to{' '}
                  <span className="font-bold text-plum">{email ? maskedEmail(email) : 'your email'}</span>
                </p>

                {email && (
                  <div className="mt-8">
                    <p className="text-[13px] font-bold text-charcoal">Verification Code</p>
                    {/* OTP inputs */}
                    <div className="mt-3 flex justify-start gap-2 sm:gap-3">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { inputRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          onPaste={handlePaste}
                          className="h-12 w-11 rounded-lg border-2 border-transparent bg-cream-dark text-center font-heading text-[22px] font-bold text-plum outline-none transition-all focus:border-plum focus:bg-white sm:h-12 sm:w-12"
                          aria-label={`OTP digit ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!email && (
                  <p role="alert" className="mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                    Email missing from the link. Go back and sign up again.
                  </p>
                )}

                {/* Resend row */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-charcoal">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                    {canResend ? 'Didn’t get it? You can resend now' : `Resend code in ${countdown}s`}
                  </span>
                  <button
                    onClick={handleResend}
                    disabled={!canResend || resending}
                    className="text-xs font-bold text-warm-gray transition-colors hover:text-plum disabled:opacity-40 disabled:hover:text-warm-gray"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                </div>

                {error && <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

                {/* Verify */}
                <button
                  onClick={handleVerify}
                  disabled={!isComplete || loading || !email}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-[13px] text-[15px] font-bold text-white transition-opacity disabled:opacity-50"
                  style={{ background: 'linear-gradient(180deg, #4A2C5E, #C45D3E)' }}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Verifying…' : 'Verify'}
                </button>

                <div className="mt-4 text-center">
                  <Link href="/login" className="text-xs font-bold text-terracotta-dark underline">
                    Use password instead
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-warm-gray">
            Didn&apos;t receive an email? Check your spam folder or contact support@mindcircle.in
          </p>
        </div>
      </div>

      {/* ── Right: Brand panel (desktop) ───────────────────── */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-plum p-12 lg:flex">
        <div className="pointer-events-none absolute -right-16 top-16 h-96 w-72 rounded-3xl bg-plum-light/40 rotate-12" />
        <div className="pointer-events-none absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-terracotta/25 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-cream/15">
              <Heart className="h-4 w-4 text-cream" />
            </span>
            <span className="font-heading text-[22px] font-bold text-cream">MindCircle</span>
          </div>
          <h2 className="mt-14 max-w-sm font-heading text-[38px] font-bold leading-tight text-cream">
            Your campus sanctuary is one step away.
          </h2>
          <div className="mt-4 h-[3px] w-[60px] rounded bg-terracotta" />
        </div>

        <div className="relative space-y-6">
          <p className="text-[13px] font-bold text-cream/80">Reflections from the Circle</p>
          <div className="space-y-2">
            <p className="text-base leading-6 text-cream">
              &ldquo;Verified circles are led by trained guides who understand our daily hostel struggles.&rdquo;
            </p>
            <p className="text-xs text-cream/70">— Second Year Design Student, Delhi</p>
          </div>
          <div className="space-y-2">
            <p className="text-base leading-6 text-cream">
              &ldquo;I love that I can track my mood daily and get personalized prompts right when exams start.&rdquo;
            </p>
            <p className="text-xs text-cream/70">— First Year MBA Candidate, Pune</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
