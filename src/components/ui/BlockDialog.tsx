'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ban,
  EyeOff,
  Loader2,
  MessageCircle,
  Sparkles,
  UserMinus,
  X,
} from 'lucide-react'

/**
 * Consequences of blocking. Written to match what the app actually does — the
 * block is one-directional, so the list is phrased from the blocker's side
 * rather than promising the other person has been locked out of their profile.
 */
const EFFECTS = [
  'They will disappear from your Discover, chats and search',
  'You will not be able to message them',
  'Any connection between you will be removed',
  'They will not appear in your suggestions',
]

export default function BlockDialog({
  open,
  onClose,
  onBlocked,
  blockedName,
}: {
  open: boolean
  onClose: () => void
  onBlocked: () => void
  blockedName: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Escape closes; the page behind must not scroll under the sheet.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose, busy])

  const confirm = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      onBlocked()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not block this person.')
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label="Block user"
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92dvh] w-full max-w-lg overscroll-contain overflow-y-auto rounded-[24px] bg-white p-4 shadow-2xl sm:p-5"
          >
            {/* drag handle — a mobile-sheet affordance, decorative on desktop */}
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-warm-gray-lighter sm:hidden"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label="Close"
                className="-mt-1.5 -mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#F1EDFB] text-charcoal/70 transition-colors hover:bg-[#E8E1F7] disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FDE8E9]">
                <Ban size={40} className="text-[#E01B33]" />
              </span>
              <h2 className="mt-3.5 font-heading text-[23px] font-extrabold leading-tight text-charcoal">
                Block user
              </h2>
              <p className="mt-1.5 max-w-[21rem] text-[14px] leading-6 text-charcoal/70">
                {blockedName} will no longer be able to reach you on Mindcircle, and you
                will not see them anywhere in the app.
              </p>
            </div>

            <ul className="mt-4 space-y-2.5 rounded-[18px] bg-[#F6F3FC] px-4 py-4">
              {EFFECTS.map((effect, i) => {
                const Icon = [EyeOff, MessageCircle, UserMinus, Sparkles][i]
                return (
                  <li key={effect} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-charcoal/75">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-5 text-charcoal/75">
                      {effect}
                    </span>
                  </li>
                )
              })}
            </ul>

            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="flex-1 rounded-2xl bg-[#F1EDFB] py-3.5 text-[14.5px] font-bold text-charcoal/80 transition-colors hover:bg-[#E8E1F7] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E01B33] py-3.5 text-[14.5px] font-bold text-white shadow-[0_8px_24px_rgba(224,27,51,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {busy && <Loader2 size={16} className="animate-spin" />}
                {busy ? 'Blocking…' : 'Block user'}
              </button>
            </div>

            <p className="mt-3 text-center text-[11.5px] leading-5 text-charcoal/40">
              They are not told that you blocked them.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}