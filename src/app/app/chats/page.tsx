'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppNav } from '../../../components/layout/AppNavContext'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'
import { Heart, LockKeyhole, MessageCircle, Search, Users } from 'lucide-react'
import { roomEmoji } from '../../../lib/alias'

type Room = {
  id: string
  name: string
  member_count: number
  is_member: boolean
  last_message: { content: string; created_at: string } | null
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

const SAFETY_RULES = [
  'Be kind and empathetic to student struggles.',
  'No sharing of phone numbers or real-world names.',
  'Your university ID is never exposed to anyone.',
]

export default function ChatsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [threads, setThreads] = useState<DmThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'rooms' | 'people'>('all')

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/chat').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/chat/dm').then((res) => (res.ok ? res.json() : { data: [] })),
    ])
      .then(([roomsJson, dmJson]) => {
        if (!active) return
        setRooms((roomsJson.data ?? []) as Room[])
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
  const filteredRooms = useMemo(
    () => rooms.filter((r) => !q || r.name.toLowerCase().includes(q)),
    [rooms, q],
  )
  const filteredThreads = useMemo(
    () => threads.filter((t) => !q || t.last_message.toLowerCase().includes(q)),
    [threads, q],
  )
  const showRooms = filter !== 'people'
  const showPeople = filter !== 'rooms'
  const hasAny = rooms.length > 0 || threads.length > 0
  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0)

  return (
    <>
      <AppNav title="Chats" />
      <div className="page-enter flex flex-col items-start gap-6 pb-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-heading text-[32px] font-bold text-plum">Your Conversations</h1>
            <Link href="/app/connect" className="rounded-full bg-plum px-5 py-2.5 text-sm font-bold text-white">
              New Chat
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex min-w-56 flex-1 items-center rounded-lg border border-warm-gray-lighter bg-white">
              <Search size={16} className="ml-4 text-warm-gray" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rooms or names..."
                className="flex-1 bg-transparent py-2.5 pl-2.5 pr-3 text-sm text-charcoal outline-none placeholder:text-warm-gray"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilter('all')} className={filter === 'all' ? 'rounded-full bg-plum px-4 py-1.5 text-[13px] font-bold text-white' : 'rounded-full bg-cream-dark px-4 py-1.5 text-[13px] text-plum'}>All</button>
              <button onClick={() => setFilter('people')} className={filter === 'people' ? 'rounded-full bg-plum px-4 py-1.5 text-[13px] font-bold text-white' : 'rounded-full bg-cream-dark px-4 py-1.5 text-[13px] text-plum'}>Unread {totalUnread > 0 ? `(${totalUnread})` : ''}</button>
              <button onClick={() => setFilter('rooms')} className={filter === 'rooms' ? 'rounded-full bg-plum px-4 py-1.5 text-[13px] font-bold text-white' : 'rounded-full bg-cream-dark px-4 py-1.5 text-[13px] text-plum'}>Rooms</button>
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

          <div className="space-y-1 rounded-2xl border border-warm-gray-lighter bg-white p-2 shadow-[0px_4px_16px_#4A2C5E08]">
            {loading ? (
              <div className="space-y-2 p-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-plum/5 p-4">
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
                description="Join a room from Connect and your chats will appear here."
                action={{ label: 'Browse rooms', onClick: () => { window.location.href = '/app/connect' } }}
              />
            ) : (
              <>
                {showRooms && filteredRooms.map((room) => (
                  <Link
                    href={`/app/chat/${room.id}`}
                    key={room.id}
                    className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-plum/5"
                  >
                    <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-3xl bg-cream-dark text-lg font-bold text-plum">
                      {roomEmoji(room.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-[15px] font-bold text-charcoal">{room.name}</span>
                        <span className="text-xs text-warm-gray">{room.last_message ? timeAgo(room.last_message.created_at) : ''}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-3">
                        <span className="truncate text-[13px] text-charcoal/80">
                          {room.last_message ? room.last_message.content : `${room.member_count} members · say hello`}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-warm-gray">
                          <Users size={11} /> {room.member_count}
                        </span>
                      </span>
                    </span>
                  </Link>
                ))}
                {showPeople && filteredThreads.map((thread) => (
                  <Link
                    href={`/app/chat/${thread.participant_id}`}
                    key={thread.participant_id}
                    className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-plum/5"
                  >
                    <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-3xl bg-plum text-[15px] font-bold text-white">
                      A
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-[15px] font-bold text-charcoal">Anonymous</span>
                        <span className="text-xs text-warm-gray">{timeAgo(thread.last_at)}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-3">
                        <span className="truncate text-[13px] text-charcoal/80">{thread.last_message}</span>
                        {thread.unread > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-terracotta px-1.5 text-[11px] font-bold text-white">{thread.unread}</span>
                        )}
                      </span>
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-warm-gray">
            <LockKeyhole size={12} /> Anonymous and private by default.
          </div>
        </div>

        {/* Right rail */}
        <div className="w-full space-y-6 lg:w-[280px] lg:shrink-0">
          <div className="rounded-2xl border border-warm-gray-lighter bg-white p-6">
            <h2 className="mb-4 font-heading text-base font-bold text-plum">Comfort Circle</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage text-xs font-bold text-white">MF</span>
                <div>
                  <p className="text-[13px] font-bold text-charcoal">Meera Fernandez</p>
                  <p className="text-[11px] text-warm-gray">Counsellor</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-2xl bg-terracotta text-xs font-bold text-white">RS</span>
                <div>
                  <p className="text-[13px] font-bold text-charcoal">Rahul Sen</p>
                  <p className="text-[11px] text-warm-gray">Counsellor</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-2xl bg-plum text-xs font-bold text-white">A</span>
                <div>
                  <p className="text-[13px] font-bold text-charcoal">Aisha</p>
                  <p className="text-[11px] text-warm-gray">Student Companion</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sage/25 bg-sage/10 p-6">
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
    </>
  )
}
