'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { readMyRequests, rememberMyRequests } from '@/lib/my-requests'

export type NotificationKind = 'resource' | 'achievement' | 'reminder' | 'message' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: number
  read: boolean
  /** Optional deep link within the app or an external URL. */
  href?: string
}

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
  /** Push a new notification (auto-generates id & timestamp). */
  push: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { id?: string }) => void
  remove: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

/** Shape returned by `GET /api/connections?status=all` (the fields we use). */
type ConnectionRow = {
  id?: string
  connection_id?: string
  status?: string
  direction?: 'incoming' | 'outgoing' | 'accepted'
  accepted_at?: string | null
  person?: { id?: string; alias?: string | null; name?: string | null } | null
}

/** Shape returned by `GET /api/chat/dm` (the thread list, the fields we use). */
type DmThread = {
  participant_id: string
  last_message: string
  last_at: string
  /** True when the newest message in the thread was written by the other person. */
  from_peer?: boolean
  name?: string
  alias?: string | null
}

const STORAGE_KEY = 'mindcircle:notifications'

/**
 * A single reminder per calendar day. The id is date-stamped, so the list
 * itself is the dedupe: an old "yesterday" reminder simply ages out instead
 * of being re-pushed on every visit.
 */
const CHECKIN_KEY = 'mindcircle:last-checkin-day'
const CHECKIN_ID = 'daily-checkin'

/** Local (not UTC) day stamp — a reminder at 1am is still *today* for the user. */
function localDayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Hard ceiling so daily + request notifications cannot outgrow localStorage. */
const MAX_STORED = 50

function seedNotifications(): AppNotification[] {
  const now = Date.now()
  const minutes = (m: number) => now - m * 60_000
  return [
    {
      id: 'seed-anxiety-guide',
      kind: 'resource',
      title: 'New resource for you 💜',
      body: 'A gentle, easy-to-read guide to understanding anxiety is now available on the Crisis Support page.',
      createdAt: minutes(2),
      read: false,
      href: '/app/crisis',
    },
    {
      id: 'seed-breathe',
      kind: 'reminder',
      title: 'Time for a mindful minute',
      body: 'You have been going for a while — a short breathing exercise can help you reset.',
      createdAt: minutes(45),
      read: false,
      href: '/app/crisis',
    },
    {
      id: 'seed-welcome',
      kind: 'system',
      title: 'Welcome to MindCircle',
      body: 'We are glad you are here. Explore journals, activities and supportive tools made just for you.',
      createdAt: minutes(60 * 26),
      read: true,
    },
  ]
}

function load(): AppNotification[] {
  if (typeof window === 'undefined') return seedNotifications()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedNotifications()
    const parsed = JSON.parse(raw) as AppNotification[]
    return Array.isArray(parsed) ? parsed : seedNotifications()
  } catch {
    return seedNotifications()
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [hydrated, setHydrated] = useState(false)
  const loadedRef = useRef(false)

  // Hydrate from localStorage on mount (client-only).
  //
  // The read is deferred to a microtask so the effect itself never triggers a
  // synchronous cascading render — React has already committed the empty list
  // by then, which is what keeps the server and first client render identical.
  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setNotifications(load())
      loadedRef.current = true
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Persist whenever the list changes.
  useEffect(() => {
    if (!loadedRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch {
      // storage full/blocked — non-fatal
    }
  }, [notifications])

  // One gentle nudge per day: write an entry and check in. Runs after
  // hydration so it cannot clobber the stored list on the first render, and
  // the day key in localStorage stops it firing twice in the same day.
  useEffect(() => {
    if (!hydrated) return
    // Deferred to a microtask for the same reason as hydration above: the
    // effect body must not commit state synchronously.
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      const today = localDayKey()
      try {
        if (window.localStorage.getItem(CHECKIN_KEY) === today) return
      } catch {
        // storage blocked — the date-stamped id still keeps it to one a day
      }
      setNotifications((prev) =>
        prev.some((n) => n.id === `${CHECKIN_ID}-${today}`)
          ? prev
          : [
              {
                id: `${CHECKIN_ID}-${today}`,
                kind: 'reminder' as const,
                title: "Today's check-in 🌿",
                body: 'A minute with yourself: write a journal entry and check in with how you are feeling.',
                href: '/app/journal',
                createdAt: Date.now(),
                read: false,
              },
              ...prev,
            ],
      )
      try {
        window.localStorage.setItem(CHECKIN_KEY, today)
      } catch {
        // non-fatal
      }
    })
    return () => {
      cancelled = true
    }
  }, [hydrated])

  // Mirror what happens elsewhere in the app into the bell:
  //   - a new incoming connection request,
  //   - one of *our* requests being accepted by the other person,
  //   - a new direct message.
  // Polls once a minute, and re-syncs the moment a connection changes anywhere
  // in the app. Connections and DMs come from two endpoints but share one
  // timer, so a minute costs two requests rather than two schedules.
  useEffect(() => {
    if (!hydrated) return
    let cancelled = false
    let stopPolling = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const sync = async () => {
      if (stopPolling) return
      try {
        const [connRes, dmRes] = await Promise.all([
          fetch('/api/connections?status=all').catch(() => null),
          fetch('/api/chat/dm').catch(() => null),
        ])
        // Signed out — there is nothing to notify about, and retrying would
        // only produce a 401 every minute.
        if (connRes?.status === 401 || dmRes?.status === 401) {
          stopPolling = true
          return
        }
        if (!connRes?.ok && !dmRes?.ok) return

        const connJson = connRes?.ok
          ? ((await connRes.json().catch(() => null)) as { data?: ConnectionRow[] } | null)
          : null
        const dmJson = dmRes?.ok
          ? ((await dmRes.json().catch(() => null)) as { data?: DmThread[] } | null)
          : null
        if (cancelled) return

        // `null` (rather than `[]`) when the call failed, so a blip cannot be
        // mistaken for "no requests anymore" and wipe the bell.
        const rows = connJson ? (connJson.data ?? []) : null
        const incoming = (rows ?? []).filter((c) => c.direction === 'incoming')

        // Still-pending requests of ours are the backstop for the record written
        // at send time (another tab, another device, or a very fast acceptance).
        if (rows) {
          rememberMyRequests(
            rows.filter((c) => c.direction === 'outgoing').map((c) => c.connection_id),
          )
        }
        const mine = readMyRequests()
        // Only rows *we* sent count: accepting someone else's request is our own
        // action, not news.
        const acceptedByThem = (rows ?? []).filter(
          (c) => c.status === 'accepted' && c.connection_id !== undefined && mine.has(c.connection_id),
        )
        const dmFromPeer = (dmJson?.data ?? []).filter(
          (t) => t.from_peer && t.participant_id && t.last_at,
        )

        setNotifications((prev) => {
          let next = prev

          if (rows) {
            const liveRequests = new Set(incoming.map((c) => `conn-${c.connection_id ?? c.id}`))
            // Drop request notifications whose request is no longer pending.
            next = next.filter((n) => !n.id.startsWith('conn-') || liveRequests.has(n.id))

            for (const c of incoming) {
              const id = `conn-${c.connection_id ?? c.id}`
              if (next.some((n) => n.id === id)) continue
              next = [
                {
                  id,
                  kind: 'system',
                  title: `${c.person?.alias ?? c.person?.name ?? 'Someone'} sent you a request`,
                  body: 'Open your notifications to accept or decline the connection.',
                  href: c.person?.id ? `/app/profile/${c.person.id}` : '/app/discover',
                  createdAt: Date.now(),
                  read: false,
                },
                ...next,
              ]
            }

            for (const c of acceptedByThem) {
              // Ids are stable, so the acceptance is announced exactly once no
              // matter how often the poll runs.
              const id = `connacc-${c.connection_id}`
              if (next.some((n) => n.id === id)) continue
              next = [
                {
                  id,
                  kind: 'system',
                  title: `${c.person?.alias ?? c.person?.name ?? 'Someone'} accepted your request`,
                  body: 'You are connected now — say hello.',
                  href: c.person?.id ? `/app/chat/${c.person.id}` : '/app/chats',
                  createdAt: (c.accepted_at && Date.parse(c.accepted_at)) || Date.now(),
                  read: false,
                },
                ...next,
              ]
            }
          }

          // One entry per conversation, refreshed in place: a newer message from
          // them replaces the old one (and marks it unread again), while a poll
          // that sees the same message leaves the read state alone.
          for (const t of dmFromPeer) {
            const id = `dm-${t.participant_id}`
            const at = Date.parse(t.last_at) || Date.now()
            const idx = next.findIndex((n) => n.id === id)
            if (idx >= 0 && next[idx].createdAt === at) continue
            const fresh: AppNotification = {
              id,
              kind: 'message',
              title: `${t.alias ?? t.name ?? 'Someone'} sent you a message`,
              // A media-only message has an empty `content`, and the thread
              // list does not say what kind, so the fallback stays vague
              // rather than claiming a photo when it might be audio.
              body: t.last_message.trim().slice(0, 140) || 'Sent you something.',
              href: `/app/chat/${t.participant_id}`,
              createdAt: at,
              read: false,
            }
            next = next.filter((n) => n.id !== id)
            next = [fresh, ...next]
          }

          if (next.length === prev.length && next.every((n, i) => n === prev[i])) return prev
          return next.slice(0, MAX_STORED)
        })
      } catch {
        // offline / flaky — the next tick will try again
      } finally {
        if (!cancelled && !stopPolling) timer = setTimeout(sync, 60_000)
      }
    }

    const wake = () => {
      if (stopPolling || document.visibilityState !== 'visible') return
      void sync()
    }

    void sync()
    window.addEventListener('connections-changed', wake)
    document.addEventListener('visibilitychange', wake)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      window.removeEventListener('connections-changed', wake)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [hydrated])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const push = useCallback<NotificationsContextValue['push']>((n) => {
    setNotifications((prev) => [
      {
        id: n.id ?? `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        read: false,
        ...n,
      },
      // An explicit id is a de-duplication key (the daily reminder and the
      // per-request notifications both rely on it), so it never doubles up.
      ...prev.filter((existing) => (n.id ? existing.id !== n.id : true)),
    ].slice(0, MAX_STORED))
  }, [])

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markAllRead,
      markRead,
      push,
      remove,
    }),
    [notifications, markAllRead, markRead, push, remove],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within <NotificationsProvider>')
  return ctx
}

/** "2m ago", "Yesterday", "3d ago" — Instagram-style relative timestamps. */
export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return 'now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d}d`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
