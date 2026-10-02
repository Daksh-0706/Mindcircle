'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BookOpen, Sparkles, BellRing, MessageCircle, HeartHandshake } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useNotifications, timeAgo, type NotificationKind } from './NotificationsContext'

const KIND_STYLES: Record<NotificationKind, { icon: typeof BookOpen; classes: string }> = {
  resource: { icon: BookOpen, classes: 'bg-plum/10 text-plum' },
  reminder: { icon: BellRing, classes: 'bg-sage/15 text-sage-dark' },
  achievement: { icon: Sparkles, classes: 'bg-terracotta/10 text-terracotta' },
  message: { icon: MessageCircle, classes: 'bg-plum/10 text-plum' },
  system: { icon: HeartHandshake, classes: 'bg-warm-gray/10 text-warm-gray' },
}

interface NotificationBellProps {
  /** Adds an offset for the small ring around the unread dot. */
  className?: string
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'relative flex h-12 w-12 items-center justify-center rounded-full transition-colors',
          'bg-gradient-to-br from-[#FBEAF2] to-[#F6E3EE] shadow-[0_4px_16px_rgba(74,44,94,0.12)]',
          'hover:shadow-[0_6px_20px_rgba(74,44,94,0.18)] active:scale-95',
          open && 'ring-2 ring-plum/30',
        )}
      >
        <Bell size={22} strokeWidth={2.4} className="text-[#2A1B3D]" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8506E] px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Notifications"
            className={cn(
              'absolute right-0 top-full mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl',
              'border border-warm-gray-lighter bg-white shadow-strong origin-top-right z-50',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-warm-gray-lighter">
              <h2 className="font-heading text-sm font-bold text-charcoal">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-plum hover:text-plum/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Bell size={28} className="mx-auto text-warm-gray/50" />
                  <p className="mt-3 text-sm font-medium text-charcoal">No notifications yet</p>
                  <p className="mt-1 text-xs text-warm-gray">
                    Updates and gentle reminders will show up here.
                  </p>
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => {
                    const style = KIND_STYLES[n.kind] ?? KIND_STYLES.system
                    const Icon = style.icon
                    const content = (
                      <div className="flex items-start gap-3 px-4 py-3">
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                            style.classes,
                          )}
                        >
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-charcoal">
                            <span className="font-semibold">{n.title}</span>{' '}
                            <span className="text-warm-gray">{n.body}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-warm-gray">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-terracotta" aria-label="Unread" />
                        )}
                      </div>
                    )
                    return (
                      <li key={n.id} className={cn(!n.read && 'bg-plum/[0.04]')}>
                        {n.href ? (
                          n.href.startsWith('/') ? (
                            <Link
                              href={n.href}
                              onClick={() => {
                                markRead(n.id)
                                setOpen(false)
                              }}
                              className="block transition-colors hover:bg-plum/5"
                            >
                              {content}
                            </Link>
                          ) : (
                            <a
                              href={n.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                markRead(n.id)
                                setOpen(false)
                              }}
                              className="block transition-colors hover:bg-plum/5"
                            >
                              {content}
                            </a>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => markRead(n.id)}
                            className="block w-full text-left transition-colors hover:bg-plum/5"
                          >
                            {content}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
