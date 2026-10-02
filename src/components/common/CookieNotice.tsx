"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

const STORAGE_KEY = "cookie-notice-dismissed"
const DISMISS_TTL_MS = 365 * 24 * 60 * 60 * 1000

/**
 * Cookie notice.
 *
 * Necessity: MindCircle sets **only strictly necessary** cookies — Supabase
 * session/refresh tokens and this banner's own dismissal flag. Under GDPR and
 * the ePrivacy rules these are exempt from consent, because they are required
 * to deliver a service the user explicitly asked for by signing in. So this is
 * a transparency *notice* with a single dismiss action, not an opt-in
 * consent wall: there is nothing here to refuse, and no non-essential
 * tracking to switch off.
 *
 * If analytics, ad pixels or any marketing tag are ever added, this component
 * must be upgraded to real granular consent (reject-able categories) before
 * those tags are allowed to fire.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let dismissedAt = 0
    try {
      dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || 0)
    } catch {
      // Private mode / storage blocked — show the notice every visit.
    }
    if (!dismissedAt || Date.now() - dismissedAt > DISMISS_TTL_MS) {
      // Small delay so it settles after the page transition.
      const t = setTimeout(() => setVisible(true), 900)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      // Ignore write failures; the notice simply returns next visit.
    }
    setVisible(false)
  }

  // Flag on <html> while we are open. The sticky mobile CTA also pins to the
  // bottom of the viewport, so it needs to know to step aside rather than
  // stack on top of us on small screens.
  useEffect(() => {
    const root = document.documentElement
    if (visible) root.dataset.cookieNotice = 'open'
    else delete root.dataset.cookieNotice
    return () => {
      delete root.dataset.cookieNotice
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-5 sm:pb-5 print:hidden"
    >
      <div className="mx-auto max-w-3xl rounded-[var(--radius-xl)] glass-card border border-plum/15 bg-white/90 shadow-strong p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-plum/10 flex items-center justify-center">
          <Cookie className="w-4 h-4 text-plum" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-sm font-semibold text-charcoal">
            We use only essential cookies
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-charcoal/70">
            MindCircle sets no advertising, analytics or tracking cookies. The
            only cookies we use keep you signed in and remember that you
            dismissed this notice. Read more in our{" "}
            <Link
              href="/privacy"
              className="text-plum font-medium underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={dismiss}
            className="h-9 px-4 rounded-full btn-gradient text-white text-sm font-medium hover:brightness-105 transition"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss cookie notice"
            className="w-9 h-9 rounded-full flex items-center justify-center text-warm-gray hover:text-plum hover:bg-plum/8 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
