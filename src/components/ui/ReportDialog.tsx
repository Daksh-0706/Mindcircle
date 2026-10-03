'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ban,
  Loader2,
  MessageCircle,
  ShieldAlert,
  TriangleAlert,
  UserRound,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DETAILS_MAX = 500

/** Reason list. Kept identical to the API's REASONS and the DB CHECK. */
const REASONS = [
  {
    key: 'harassment',
    label: 'Harassment or bullying',
    hint: 'Harmful, abusive or intimidating behaviour',
    icon: MessageCircle,
  },
  {
    key: 'inappropriate',
    label: 'Inappropriate content',
    hint: 'Nudity, sexual content or explicit material',
    icon: UserRound,
  },
  {
    key: 'hate',
    label: 'Hate speech',
    hint: 'Attacks based on identity, religion, caste, etc.',
    icon: TriangleAlert,
  },
  {
    key: 'spam',
    label: 'Spam',
    hint: 'Repeated, unwanted or misleading content',
    icon: Ban,
  },
  {
    key: 'fake',
    label: 'Fake profile',
    hint: 'Impersonation or suspicious activity',
    icon: ShieldAlert,
  },
  {
    key: 'other',
    label: 'Other',
    hint: 'Something else that goes against our guidelines',
    icon: MoreIcon,
  },
] as const

function MoreIcon(props: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="text-[15px] font-bold leading-none"
      style={{ fontSize: (props.size ?? 20) - 5 }}
    >
      •••
    </span>
  )
}

export default function ReportDialog({
  open,
  onClose,
  onReported,
  reportedId,
  reportedName,
}: {
  open: boolean
  onClose: () => void
  onReported: () => void
  reportedId: string
  reportedName: string
}) {
  const [reason, setReason] = useState<string>('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // State is reset by remounting: the parent passes a key that changes with
  // `open`, so a cancelled report never leaks into the next one without this
  // component having to write to state from inside an effect.

  // Escape closes, and the page behind must not scroll under the sheet.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose, submitting])

  const submit = async () => {
    if (!reason || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: reportedId,
          reason,
          details: details.trim() || null,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not send the report.')
      }
      onReported()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the report.')
      setSubmitting(false)
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
          aria-label="Report user"
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/55 p-2 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[94dvh] w-full max-w-lg overscroll-contain overflow-y-auto rounded-[24px] bg-white p-4 shadow-2xl"
          >
            {/* drag handle — a mobile-sheet affordance, decorative on desktop */}
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-warm-gray-lighter sm:hidden"
            />

            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBE4E6] text-[#D92D3F]">
                <ShieldAlert size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-[20px] font-extrabold leading-tight text-charcoal">
                  Report user
                </h2>
                <p className="text-[12.5px] leading-5 text-charcoal/60">
                  Help us keep Mindcircle safe and supportive for everyone.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1EDFB] text-charcoal/70 transition-colors hover:bg-[#E8E1F7] disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Single column on purpose: at phone widths a two-column grid forced every
                label and hint to wrap onto three or four lines, which made the
                dialog taller, not shorter. */}
            <div className="mt-3 space-y-1.5">
              {REASONS.map((r) => {
                const Icon = r.icon
                const selected = reason === r.key
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setReason(r.key)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left transition-all',
                      selected
                        ? 'bg-[#F6F2FF] ring-2 ring-[#5B3FD6]'
                        : 'bg-[#F8F7FC] hover:bg-[#F2F0F9]',
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-charcoal">
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-heading text-[13.5px] font-bold leading-tight text-charcoal">
                        {r.label}
                      </span>
                      {/* Kept to one line on purpose: letting hints wrap to two
                          lines each was what pushed the sheet into a scroll. */}
                      <span className="block truncate text-[12px] leading-tight text-charcoal/55">
                        {r.hint}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        selected
                          ? 'border-[#5B3FD6] bg-[#5B3FD6]'
                          : 'border-warm-gray-lighter',
                      )}
                    >
                      {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4">
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, DETAILS_MAX))}
                rows={2}
                placeholder="Add additional details (optional)"
                aria-label="Additional details"
                className="w-full resize-none rounded-[16px] bg-[#F8F7FC] px-3.5 py-2.5 text-[14px] leading-6 text-charcoal outline-none placeholder:text-charcoal/40 focus:ring-2 focus:ring-plum/20"
              />
              <p className="mt-1 text-right text-[11px] text-charcoal/40">
                {details.length}/{DETAILS_MAX}
              </p>
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-2xl bg-[#F1EDFB] py-3 text-[14.5px] font-bold text-charcoal/80 transition-colors hover:bg-[#E8E1F7] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!reason || submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#5B3FD6] py-3 text-[14.5px] font-bold text-white shadow-[0_8px_24px_rgba(91,63,214,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Sending…' : 'Submit report'}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] leading-4 text-charcoal/40">
              Reports about {reportedName} are private and are not shown to them.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}