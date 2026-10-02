'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Sticky mobile call-to-action.
 *
 * The landing hero CTA is already above the fold, but the page is long and the
 * nav CTA is hidden below `md`. This pins a single "Get Started" bar to the
 * bottom of the viewport on small screens so the primary action is always one
 * tap away.
 *
 * It hides itself once the user scrolls past the hero — at that point they have
 * either signed up or read enough that a permanent bar is just in the way, and
 * it also yields to the cookie notice so the two never overlap.
 */
export function StickyMobileCta() {
  const [pastHero, setPastHero] = useState(false)
  const [cookieNoticeOpen, setCookieNoticeOpen] = useState(false)

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('#hero')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  // CookieNotice sets this flag on <html> while it is on screen.
  useEffect(() => {
    const root = document.documentElement
    const sync = () => setCookieNoticeOpen(root.dataset.cookieNotice === 'open')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['data-cookie-notice'] })
    return () => observer.disconnect()
  }, [])

  if (pastHero || cookieNoticeOpen) return null

  return (
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pointer-events-none print:hidden">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/95 backdrop-blur border border-plum/12 shadow-strong py-2 pl-5 pr-2">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-charcoal leading-tight truncate">
            Your safe space starts here
          </p>
          <p className="text-[11px] text-warm-gray leading-tight">Free · private · no ads</p>
        </div>
        <Link
          href="/signup"
          className="btn-gradient h-10 px-5 rounded-full text-white text-sm font-semibold inline-flex items-center gap-1.5 shrink-0"
        >
          Get Started
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
