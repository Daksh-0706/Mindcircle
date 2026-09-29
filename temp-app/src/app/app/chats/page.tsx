'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, Search, Users, User, Pin, Check, CheckCheck } from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'

type Conversation = {
  id: string
  kind: 'person' | 'room'
  name: string
  last: string
  time: string
  unread: number
  online?: boolean
  members?: number
  pinned?: boolean
  color: string
  initials: string
  sentByMe?: boolean
  read?: boolean
}

const CONVERSATIONS: Conversation[] = [
  { id: 'anxiety-circle', kind: 'room', name: 'Anxiety Support Circle', last: 'Maya: That reframing really helped me too 💛', time: 'now', unread: 3, members: 128, pinned: true, color: '#4A2C5E', initials: 'AC' },
  { id: 'sarah', kind: 'person', name: 'Sarah (Peer Buddy)', last: 'How did the presentation go?', time: '2m', unread: 1, online: true, color: '#7B9E6B', initials: 'S' },
  { id: 'student-life', kind: 'room', name: 'Student Life', last: 'Arjun: Anyone else pulling an all-nighter?', time: '18m', unread: 0, members: 342, color: '#C45D3E', initials: 'SL' },
  { id: 'dr-mehta', kind: 'person', name: 'Dr. Mehta', last: 'You: Thank you, that means a lot.', time: '1h', unread: 0, sentByMe: true, read: true, color: '#6B4A80', initials: 'DM' },
  { id: 'mindful-mornings', kind: 'room', name: 'Mindful Mornings', last: 'Priya: Today’s gratitude: sunlight ☀️', time: '3h', unread: 0, members: 89, color: '#7B9E6B', initials: 'MM' },
  { id: 'alex', kind: 'person', name: 'Alex', last: 'You: Let’s catch up this weekend', time: '1d', unread: 0, sentByMe: true, read: false, online: false, color: '#C45D3E', initials: 'A' },
]

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'People', value: 'person' },
  { label: 'Rooms', value: 'room' },
]

export default function ChatsPage() {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    return CONVERSATIONS.filter((c) => filter === 'all' || c.kind === filter).filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [filter, query])

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mesh-gradient min-h-screen"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-warm-gray-lighter bg-cream/80 backdrop-blur-md">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-plum to-terracotta">
                <MessageCircle className="h-5 w-5 text-cream" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-charcoal">Chats</h1>
                <p className="text-sm text-warm-gray">Your conversations & rooms</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations…"
                className="input-warm w-full pl-11"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-5">
          <div className="mb-4">
            <Tabs tabs={FILTERS} active={filter} onChange={setFilter} />
          </div>

          <div className="space-y-2">
            {list.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <Link
                  href={c.kind === 'room' ? `/app/room/${c.id}` : `/app/chat/${c.id}`}
                  className="glass-card flex items-center gap-3 rounded-2xl p-3 transition-all hover:shadow-medium"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <span
                      className="flex items-center justify-center rounded-2xl text-base font-semibold text-cream"
                      style={{ backgroundColor: c.color, width: 52, height: 52 }}
                    >
                      {c.kind === 'room' ? <Users className="h-6 w-6" /> : c.initials}
                    </span>
                    {c.kind === 'person' && c.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-sage ring-2 ring-cream" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-heading font-bold text-charcoal">{c.name}</h3>
                      {c.pinned && <Pin className="h-3.5 w-3.5 shrink-0 text-warm-gray-light" />}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-warm-gray">
                      {c.sentByMe && (
                        c.read ? <CheckCheck className="h-4 w-4 shrink-0 text-plum" /> : <Check className="h-4 w-4 shrink-0 text-warm-gray-light" />
                      )}
                      <p className="truncate">{c.last}</p>
                    </div>
                    {c.kind === 'room' && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-warm-gray-light">
                        <User className="h-3 w-3" /> {c.members} members
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-xs text-warm-gray-light">{c.time}</span>
                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-plum to-terracotta px-1.5 text-xs font-semibold text-cream">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}

            {list.length === 0 && (
              <div className="glass-card rounded-2xl px-6 py-16 text-center">
                <MessageCircle className="mx-auto mb-3 h-10 w-10 text-warm-gray-light" />
                <p className="font-heading font-bold text-charcoal">No conversations found</p>
                <p className="mt-1 text-sm text-warm-gray">Try a different search or filter.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
