'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Clock, Loader2, MoreVertical, Trash2, X } from 'lucide-react'

/** Menu metrics, used to flip and clamp it against the viewport. */
const MENU_WIDTH = 176
const MENU_HEIGHT = 100
const VIEWPORT_PAD = 8

/**
 * The three-dot affordance on a chat bubble.
 *
 * Only the sender's own messages get one. Allowing a recipient to delete
 * somebody else's message is not a UI decision — the server refuses it too —
 * but showing the option and then erroring is worse than not offering it.
 *
 * The menu is rendered into a portal and positioned against the viewport.
 * Anchoring it inside the bubble is what clipped it in the screenshot: the
 * thread list is a scroll container, and a scroll container clips anything
 * that overflows it — so a menu opened on a bubble near the top of the thread
 * had its top edge (and the Delete row) cut off. A portal escapes that
 * clipping context entirely, and the placement below flips above the trigger
 * only when there is genuinely no room underneath.
 */
export function MessageMenu({
  onShowDetails,
  onDelete,
}: {
  onShowDetails: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Measured in the click handler (an event), not in an effect: the menu is a
  // one-shot position, and setting state from an effect would cause a second
  // render pass before the menu is even visible.
  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < MENU_HEIGHT + VIEWPORT_PAD && rect.top > MENU_HEIGHT + VIEWPORT_PAD
    const top = openUp ? rect.top - MENU_HEIGHT - VIEWPORT_PAD : rect.bottom + VIEWPORT_PAD
    // Right-align to the dots, then keep the whole menu on screen.
    const left = Math.min(
      Math.max(VIEWPORT_PAD, rect.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - VIEWPORT_PAD,
    )
    setPos({ top, left })
    setOpen(true)
  }

  // Dismiss on an outside click or Escape. A menu that only closes on its own
  // trigger feels broken on a phone, where "outside" is the whole rest of
  // the screen. Scrolling the thread also closes it — a viewport-anchored menu
  // would otherwise float away from the bubble it belongs to.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      // The menu lives in a portal, so it is not inside the trigger's subtree.
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onScrollOrResize = () => setOpen(false)

    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open])

  return (
    <div className="relative shrink-0 self-end">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="Message options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal/50 transition-colors hover:bg-plum/10 hover:text-plum focus-visible:opacity-100"
      >
        <MoreVertical size={16} />
      </button>

      {open && pos && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
              className="fixed z-[70] overflow-hidden rounded-2xl border border-plum/10 bg-white py-1 shadow-[0_10px_30px_rgba(74,44,94,0.18)]"
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
            </div>,
            document.body,
          )
        : null}
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
