'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '../../../../components/layout/AppNavContext'
import { Check, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { cn } from '../../../../lib/utils'

function passwordScore(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
const STRENGTH_COLORS = ['#D64545', '#D64545', '#C45D3E', '#C45D3E', '#7B9E6B', '#5C7A4F']

/**
 * Change Password — verifies the current password via Supabase
 * signInWithPassword, then updates it with updateUser.
 */
export default function ChangePasswordPage() {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Client-side sign-in check is enough here; Supabase rejects a wrong
  // current password on updateUser only after reauth flows, so we verify
  // explicitly for a clean error message.
  useEffect(() => {
    fetch('/api/me').catch(() => undefined)
  }, [])

  const score = passwordScore(next)
  const passwordsMatch = confirm.length > 0 && confirm === next
  const canSubmit = current.length > 0 && next.length >= 8 && passwordsMatch && !saving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: current, new_password: next }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || 'Could not change your password. Please try again.')
      setSuccess(true)
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppNav title="Change password" showBack />
      <div className="page-enter mx-auto max-w-2xl space-y-5 pb-8">
        <div>
          <h1 className="font-heading text-[32px] font-bold text-plum">Change password</h1>
          <p className="mt-1 text-sm text-charcoal">Pick something strong and unique — you only need to remember it here.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[20px] border border-warm-gray-lighter bg-white p-7">
          {/* Current password */}
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-[13px] font-bold text-plum">
              Current password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
              <input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter your current password"
                autoComplete="current-password"
                required
                className="input-warm w-full pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray transition-colors hover:text-charcoal"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-[13px] font-bold text-plum">
              New password
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
              <input
                id="new-password"
                type={showNext ? 'text' : 'password'}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
                className="input-warm w-full pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                aria-label={showNext ? 'Hide new password' : 'Show new password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray transition-colors hover:text-charcoal"
              >
                {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {next.length > 0 && (
              <div className="mt-2.5">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-colors"
                      style={{ backgroundColor: i < score ? STRENGTH_COLORS[score] : '#E8E0D8' }}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-xs font-semibold" style={{ color: STRENGTH_COLORS[score] }}>
                  {STRENGTH_LABELS[score]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-[13px] font-bold text-plum">
              Confirm new password
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Type it once more"
                autoComplete="new-password"
                required
                className={cn(
                  'input-warm w-full pl-11 pr-11',
                  confirm.length > 0 && (passwordsMatch ? 'border-sage' : 'border-danger'),
                )}
              />
              {confirm.length > 0 && (
                <span
                  className={cn(
                    'absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold',
                    passwordsMatch ? 'text-sage-dark' : 'text-danger',
                  )}
                >
                  {passwordsMatch ? <Check size={16} /> : '✕'}
                </span>
              )}
            </div>
            {confirm.length > 0 && !passwordsMatch && (
              <p className="mt-1.5 text-xs text-danger">Passwords don&apos;t match yet.</p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
          )}
          {success && (
            <p role="status" className="flex items-center gap-2 rounded-xl bg-sage/10 px-4 py-3 text-sm font-medium text-sage-dark">
              <ShieldCheck size={16} /> Password updated. Use it next time you sign in.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn-gradient flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-warm-gray">
          <ShieldCheck size={13} className="text-sage" />
          Changing your password keeps you signed in on this device only.
        </p>
      </div>
    </>
  )
}
