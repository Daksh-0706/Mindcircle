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

const STORAGE_KEY = 'mindcircle:notifications'

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
  const loadedRef = useRef(false)

  // Hydrate from localStorage on mount (client-only).
  useEffect(() => {
    setNotifications(load())
    loadedRef.current = true
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
      ...prev,
    ])
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
