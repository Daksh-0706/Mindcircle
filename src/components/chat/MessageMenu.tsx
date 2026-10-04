'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock, Loader2, MoreVertical, Trash2, X } from 'lucide-react'


/**
 * The three-dot affordance on a chat bubble.
 *
 * Only the sender's own messages get one. Allowing a recipient to delete
 * somebody else's message is not a UI decision — the server refuses it too —
 * but showing the option and then erroring is worse than not offering it.
 */
export function MessageMenu({
  onShowDetails,
  onDelete,
}: {
  onShowDetails: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Dismiss on an outside click or Escape. A menu that only closes on its own
  // trigger feels broken on a phone, where "outside" is the whole rest of
  // the screen.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative shrink-0 self-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Message options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal/45 opacity-70 transition-opacity hover:bg-plum/10 hover:text-plum focus-visible:opacity-100 lg:opacity-0"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-8 z-30 min-w-[168px] overflow-hidden rounded-2xl border border-plum/10 bg-white py-1 shadow-[0_10px_30px_rgba(74,44,94,0.18)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onShowDetails()
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-charcoal transition-colors hover:bg-plum/5"
          >
            <Clock size={16} className="text-plum/70" />
            Details
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onDelete()
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-danger transition-colors hover:bg-danger/8"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * The details sheet: when was this sent, in full.
 *
 * The bubble already shows a clock time, which is all anyone needs while
 * reading a thread. This is for the other question — "when did I actually say
 * this?", usually asked the day after.
 */
export function MessageDetails({
  sentAt,
  hasImage,
  deleting,
  onClose,
  onDelete,
}: {
  sentAt: string
  hasImage: boolean
  deleting: boolean
  onClose: () => void
  onDelete: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const when = new Date(sentAt)
  // Built from the same locale the rest of the app uses, so the detail sheet
  // cannot disagree with the date shown elsewhere in a thread. Rendered on the
  // client only (the sheet opens on tap), which is what makes a locale that
  // differs between server and browser safe here.
  const full = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(when)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Message details"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-charcoal/50 p-4 backdrop-blur-sm sm:items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(42,42,42,0.3)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-lg font-extrabold text-charcoal">Details</p>
            <p className="mt-0.5 text-xs text-warm-gray">
              {hasImage ? 'Sent with a photo' : 'Text message'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-full p-1.5 text-charcoal/50 transition-colors hover:bg-plum/8"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-cream-dark px-4 py-3.5">
          <p className="text-[11px] font-bold tracking-wide text-warm-gray uppercase">
            Sent
          </p>
          <p className="mt-1 text-[15px] leading-6 font-semibold text-charcoal">{full}</p>
        </div>

        <p className="mt-3 text-[13px] leading-5 text-warm-gray">
          Deleting removes this message for everyone. It cannot be undone.
        </p>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-cream-dark py-3 text-sm font-bold text-charcoal/70 transition-colors hover:bg-warm-gray-lighter"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-danger py-3 text-sm font-bold text-white transition-colors hover:bg-danger/90 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
