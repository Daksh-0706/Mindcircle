'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppNav } from '../../../components/layout/AppNavContext'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'
import NotoEmoji from '../../../components/ui/NotoEmoji'
import { Compass, Heart, LockKeyhole, MessageCircle, Search } from 'lucide-react'
import { cn } from '../../../lib/utils'

type DmThread = {
  participant_id: string
  name: string
  alias: string | null
  avatar_emoji: string
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

const SAFETY_RULES = [
  'Be kind and empathetic to student struggles.',
  'No sharing of phone numbers or real-world names.',
  'Your university ID is never exposed to anyone.',
]

/** Per-conversation themed card art, assigned round-robin by index. */
const CHAT_ART = [
  { art: '/chat-card-heart.webp', tint: 'bg-[#FBE7EC]' },
  { art: '/chat-card-night.webp', tint: 'bg-[#EFEAFB]' },
  { art: '/chat-card-morning.webp', tint: 'bg-[#FBEEDC]' },
  { art: '/chat-card-green.webp', tint: 'bg-[#EAF3EA]' },
  { art: '/chat-card-study.webp', tint: 'bg-[#EFEAFB]' },
  { art: '/chat-card-default.webp', tint: 'bg-[#FDF4EC]' },
] as const

/** Fades card art into the tint so there is no hard vertical seam. */
const CARD_ART_FADE = {
  maskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
} as const

export default function ChatsPage() {
  const [threads, setThreads] = useState<DmThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'people'>('all')

  useEffect(() => {
    let active = true
    fetch('/api/chat/dm')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((dmJson) => {
        if (!active) return
        setThreads((dmJson.data ?? []) as DmThread[])
      })
      .catch(() => {
        if (active) setError('Could not load conversations. Please refresh.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const q = query.trim().toLowerCase()
  const filteredThreads = useMemo(
    () =>
      threads.filter(
        (t) =>
          !q ||
          t.last_message.toLowerCase().includes(q) ||
          (t.alias ?? '').toLowerCase().includes(q),
      ),
    [threads, q],
  )
  const hasAny = threads.length > 0
  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0)

  return (
    <>
      <AppNav title="Chats" />
      <div className="page-enter flex flex-col items-start gap-6 pb-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          {/* ── Hero header with lavender sky bg ─────────────── */}
          <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter px-6 py-8 sm:px-8">
            {/* lavender clouds + leaves bg */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chats-header.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative max-w-[65%]">
              <h1 className="font-display text-[38px] font-bold leading-[1.1] text-[#3D2A52]">
                Your{' '}<span className="bg-gradient-to-r from-[#A78BDA] to-[#8B7BD8] bg-clip-text text-transparent">Conversations</span>
              </h1>
              <p className="mt-2 text-[14px] text-charcoal/70">Quiet one-on-ones, all in one place.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/app/discover"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(91,75,158,0.3)] transition-transform hover:-translate-y-0.5"
                >
                  <Compass size={15} /> Find People
                </Link>
                <Link
                  href="/app/chats/new"
                  className="inline-flex items-center gap-2 rounded-full border border-plum/20 bg-white px-6 py-2.5 text-[14px] font-semibold text-plum shadow-[0_4px_14px_rgba(91,75,158,0.14)] transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={15} /> New Chat
                </Link>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex min-w-56 flex-1 items-center rounded-full border border-warm-gray-lighter bg-white px-4 shadow-[0_2px_10px_rgba(74,44,94,0.06)]">
              <Search size={16} className="text-warm-gray" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search names..."
                className="flex-1 bg-transparent py-3 pl-2.5 pr-3 text-sm text-charcoal outline-none placeholder:text-warm-gray"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilter('all')} className={filter === 'all' ? 'rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-4 py-2 text-[13px] font-bold text-white shadow-[0_3px_10px_rgba(91,75,158,0.25)]' : 'rounded-full border border-warm-gray-lighter bg-white px-4 py-2 text-[13px] font-semibold text-plum transition-colors hover:border-plum/30'}>All</button>
              <button onClick={() => setFilter('people')} className={filter === 'people' ? 'rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-4 py-2 text-[13px] font-bold text-white shadow-[0_3px_10px_rgba(91,75,158,0.25)]' : 'rounded-full border border-warm-gray-lighter bg-white px-4 py-2 text-[13px] font-semibold text-plum transition-colors hover:border-plum/30'}>Unread {totalUnread > 0 ? `(${totalUnread})` : ''}</button>
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl border border-warm-gray-lighter bg-white p-4">
                    <Skeleton variant="circle" width={52} height={52} />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="35%" height={14} />
                      <Skeleton variant="text" width="70%" height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasAny ? (
              <EmptyState
                icon={<MessageCircle size={26} />}
                title="No conversations yet"
                description="Start a quiet one-on-one and it will show up here."
              />
            ) : (
              <>
                {filteredThreads.map((thread, i) => {
                  const theme = CHAT_ART[(i + 2) % CHAT_ART.length]
                  return (
                    <Link
                      // The row *is* the conversation, so it opens the thread.
                      // (New Chat links the same way; a profile is reached from
                      // inside the thread, not by tapping the message list.)
                      href={`/app/chat/${thread.participant_id}`}
                      key={thread.participant_id}
                      className={cn(
                        'relative flex items-center gap-3.5 overflow-hidden rounded-[20px] border border-warm-gray-lighter/60 p-3 pr-5 transition-transform hover:-translate-y-0.5',
                        theme.tint,
                      )}
                    >
                      {/* themed art bleeding from the right edge */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={theme.art}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[38%] object-cover object-right"
                        style={CARD_ART_FADE}
                      />
                      <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_rgba(74,44,94,0.08)]">
                        <NotoEmoji emoji={thread.avatar_emoji ?? '😊'} size={22} />
                      </span>
                      <span className="relative z-10 min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate text-[13px] font-bold text-charcoal/85">
                            {thread.alias ?? thread.name}
                          </span>
                          <span className="shrink-0 text-[11px] text-warm-gray/80">{timeAgo(thread.last_at)}</span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-end gap-3">
                          <span className="truncate text-[13px] text-charcoal/70">{thread.last_message || 'No messages yet'}</span>
                          {thread.unread > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#E8506E] px-1.5 text-[11px] font-bold text-white">{thread.unread}</span>
                          )}
                        </span>
                      </span>
                    </Link>
                  )
                })}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-warm-gray">
            <LockKeyhole size={12} /> Anonymous and private by default.
          </div>
        </div>

        {/* Right rail — safety card with soft waves */}
        <div className="w-full space-y-6 lg:w-[280px] lg:shrink-0">
          <div className="relative overflow-hidden rounded-[22px] border border-sage/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/deco-leaf-right.webp"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full object-cover object-top opacity-60"
            />
            <div className="relative bg-[#EAF3EA]/95 p-6 pb-24">
              <div className="mb-4 flex items-center gap-2">
                <Heart size={16} className="text-sage-dark" />
                <h2 className="font-heading text-base font-bold text-sage-dark">Safety Sanctuary</h2>
              </div>
              <div className="space-y-3">
                {SAFETY_RULES.map((rule) => (
                  <div key={rule} className="flex items-start gap-2.5">
                    <span className="text-xs text-sage-dark">•</span>
                    <p className="flex-1 text-xs text-charcoal">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
