'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, Search, UserPlus } from 'lucide-react'
import { AppNav } from '../../../../components/layout/AppNavContext'
import Skeleton from '../../../../components/ui/Skeleton'
import EmptyState from '../../../../components/ui/EmptyState'
import NotoEmoji from '../../../../components/ui/NotoEmoji'


type Connection = {
  id: string
  status: string
  direction: 'accepted' | 'incoming' | 'outgoing'
  person: {
    id: string
    name: string
    avatar_emoji: string
    location: string
    bio: string
    interests: string[]
  } | null
}

type DmThread = {
  participant_id: string
  last_message: string
  last_at: string
  unread: number
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

/**
 * "New chat" picker.
 *
 * Recent conversations come from the real DM threads API; the directory below
 * them is still the shared sample list, so those ids are placeholders until
 * people discovery gets a backend.
 */
export default function NewChatClient() {
  const router = useRouter()
  const [threads, setThreads] = useState<DmThread[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [working, setWorking] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/chat/dm').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/connections').then((res) => (res.ok ? res.json() : { data: [] })),
    ])
      .then(([dmJson, connJson]) => {
        if (!active) return
        setThreads((dmJson.data ?? []) as DmThread[])
        setConnections((connJson.data ?? []) as Connection[])
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  /** Accepts an incoming request and refreshes both lists. */
  const accept = async (peerId: string) => {
    setWorking(peerId)
    try {
      const res = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: peerId }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not accept the request.')
      }
      const connRes = await fetch('/api/connections')
      const connJson = await connRes.json()
      setConnections((connJson.data ?? []) as Connection[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not accept the request.')
    } finally {
      setWorking(null)
    }
  }

  const q = query.trim().toLowerCase()
  const visibleThreads = useMemo(
    () => threads.filter((t) => !q || t.last_message.toLowerCase().includes(q)),
    [threads, q],
  )
  // Only accepted connections are messageable; pending ones are shown with a
  // hint so the other person knows a request is waiting for them.
  const visiblePeople = useMemo(() => {
    const list = connections.filter((c) => c.person)
    if (!q) return list
    return list.filter(
      (c) =>
        c.person!.name.toLowerCase().includes(q) ||
        c.person!.interests.some((i) => i.toLowerCase().includes(q)),
    )
  }, [connections, q])

  return (
    <>
      <AppNav title="New chat" showBack />
      <div className="page-enter space-y-5 pb-24">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter px-6 py-7 sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chats-header.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative max-w-full sm:max-w-[62%]">
            <h1 className="font-display text-[34px] font-bold leading-[1.1] text-[#3D2A52]">
              Start a <span className="bg-gradient-to-r from-[#A78BDA] to-[#8B7BD8] bg-clip-text text-transparent">New Message</span>
            </h1>
            <p className="mt-2 text-[14px] text-charcoal/70">
              Pick someone you have connected with and start a quiet one-on-one.
            </p>
          </div>
        </section>

        {/* ── Search ───────────────────────────────────────── */}
        <div className="flex items-center rounded-full border border-warm-gray-lighter bg-white px-4 shadow-[0_2px_10px_rgba(74,44,94,0.06)]">
          <Search size={16} className="text-warm-gray" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your chats or people..."
            className="flex-1 bg-transparent py-3 pl-2.5 pr-3 text-sm text-charcoal outline-none placeholder:text-warm-gray"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {/* ── Recent ───────────────────────────────────────── */}
        <section>
          <h2 className="font-heading text-[13px] font-bold uppercase tracking-[.14em] text-warm-gray">
            Recent
          </h2>
          <div className="mt-3 space-y-2.5">
            {loading ? (
              <>
                <Skeleton variant="rect" height={64} />
                <Skeleton variant="rect" height={64} />
              </>
            ) : visibleThreads.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-warm-gray-lighter px-4 py-6 text-center text-[13.5px] text-warm-gray">
                {q ? 'No chats match that search.' : 'No conversations yet — pick someone below.'}
              </p>
            ) : (
              visibleThreads.map((thread) => (
                <Link
                  key={thread.participant_id}
                  href={`/app/chat/${thread.participant_id}`}
                  className="flex items-center gap-3.5 rounded-[20px] border border-warm-gray-lighter/60 bg-white p-3 pr-5 transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFEAFB] text-[14px] font-bold text-plum">
                    A
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-charcoal/80">
                      {thread.last_message || 'No messages yet'}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {thread.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8506E] px-1.5 text-[11px] font-bold text-white">
                        {thread.unread}
                      </span>
                    )}
                    <span className="text-[11px] text-warm-gray/80">{timeAgo(thread.last_at)}</span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* ── Connected people ─────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-[13px] font-bold uppercase tracking-[.14em] text-warm-gray">
              People you connected with
            </h2>
            <Link
              href="/app/discover"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-plum transition-colors hover:text-plum/80"
            >
              <UserPlus size={14} /> Find more
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {visiblePeople.map((conn) => {
              const person = conn.person!
              const accepted = conn.direction === 'accepted'
              return (
                <div
                  key={conn.id}
                  className="flex min-w-0 items-center gap-3 rounded-[20px] border border-warm-gray-lighter/60 bg-white p-3 pr-3 sm:gap-3.5 sm:pr-4"
                >
                  <Link
                    href={`/app/profile/${person.id}`}
                    aria-label={`View ${person.name}`}
                    className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden transition-opacity hover:opacity-80 sm:gap-3.5"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFEAFB]">
                      <NotoEmoji emoji={person.avatar_emoji} size={21} />
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span className="block truncate text-[15px] font-bold text-charcoal">
                        {person.name}
                      </span>
                      <span className="block truncate text-[12.5px] text-charcoal/65">
                        {accepted
                          ? person.interests.length
                            ? `Into ${person.interests.slice(0, 2).join(', ')}`
                            : 'Connected'
                          : conn.direction === 'incoming'
                            ? 'Wants to connect'
                            : 'Request sent'}
                      </span>
                    </span>
                  </Link>
                  {accepted ? (
                    <Link
                      href={`/app/chat/${person.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-3 py-2 text-[12px] font-bold text-white shadow-[0_3px_10px_rgba(91,75,158,0.25)] transition-transform hover:-translate-y-0.5 sm:px-4 sm:text-[12.5px]"
                    >
                      <MessageCircle size={13} className="shrink-0" />
                      Message
                    </Link>
                  ) : conn.direction === 'incoming' ? (
                    <button
                      type="button"
                      onClick={() => accept(conn.id)}
                      disabled={working === conn.id}
                      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-plum px-3 py-2 text-[12px] font-bold text-white sm:px-4 sm:text-[12.5px]"
                    >
                      Accept
                    </button>
                  ) : (
                    <span className="shrink-0 whitespace-nowrap rounded-full border border-plum/25 px-3.5 py-2 text-[12px] font-bold text-plum sm:text-[12.5px]">
                      Pending
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {visiblePeople.length === 0 && (
            <div className="mt-3">
              <EmptyState
                icon={<UserPlus size={26} />}
                title="Nobody here"
                description="Try a different name, or find someone new in Discover."
                action={{ label: 'Find people', onClick: () => router.push('/app/discover') }}
              />
            </div>
          )}
        </section>

        {/* ── Back to chats ────────────────────────────────── */}
        <div className="flex justify-center pt-1">
          <Link
            href="/app/chats"
            className="inline-flex items-center gap-2 rounded-full border border-plum/20 bg-white px-5 py-2.5 text-[13px] font-bold text-plum transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft size={15} /> Back to chats
          </Link>
        </div>
      </div>
    </>
  )
}
