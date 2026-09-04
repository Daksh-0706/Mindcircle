'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ArrowLeft, CheckCircle2 } from 'lucide-react'

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const OTP_LENGTH = 6

/* ── Page ─────────────────────────────────────────────────── */

export default function VerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [verified, setVerified] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
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
          // Move to previous and clear
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

      // Focus last filled or next empty
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
      inputRefs.current[focusIndex]?.focus()
    },
    []
  )

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length === OTP_LENGTH) {
      setVerified(true)
      setTimeout(() => router.push('/onboarding'), 1500)
    }
  }

  const handleResend = () => {
    if (!canResend) return
    setCountdown(30)
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
      className="min-h-screen flex items-center justify-center mesh-gradient px-4 py-12"
    >
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign up
        </Link>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plum to-terracotta flex items-center justify-center shadow-medium">
              {verified ? (
                <CheckCircle2 className="w-7 h-7 text-cream" />
              ) : (
                <Heart className="w-7 h-7 text-cream" />
              )}
            </div>
          </div>

          <h1 className="font-heading text-2xl font-bold text-charcoal text-center mb-2">
            {verified ? 'Email Verified!' : 'Verify Your Email'}
          </h1>
          <p className="text-warm-gray text-sm text-center mb-8">
            {verified
              ? 'Redirecting you to get started...'
              : 'We sent a 6-digit code to your email. Enter it below.'}
          </p>

          {!verified && (
            <>
              {/* OTP inputs */}
              <div className="flex justify-center gap-2.5 sm:gap-3 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-semibold font-heading rounded-xl bg-cream-dark border-2 border-transparent focus:border-plum focus:bg-white focus:outline-none transition-all text-charcoal"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerify}
                disabled={!isComplete}
                className={`btn-gradient w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                  !isComplete ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Verify
              </button>

              {/* Resend */}
              <div className="text-center mt-6">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-sm text-plum font-semibold hover:text-plum-dark transition-colors"
                  >
                    Resend Code
                  </button>
                ) : (
                  <p className="text-sm text-warm-gray">
                    Resend code in{' '}
                    <span className="font-medium text-charcoal">
                      {countdown}s
                    </span>
                  </p>
                )}
              </div>
            </>
          )}

          {verified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-sage text-sm font-medium">
                Taking you to onboarding...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
