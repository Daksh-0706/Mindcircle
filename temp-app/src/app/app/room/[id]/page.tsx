'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Mic, Send, Plus, Shield, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type RoomMsg = { id: number; author: string; initials: string; color: string; text: string; time: string; me?: boolean }

const MEMBERS = [
  { name: 'Maya', initials: 'M', color: '#7B9E6B' },
  { name: 'Arjun', initials: 'A', color: '#4A2C5E' },
  { name: 'Priya', initials: 'P', color: '#C45D3E' },
  { name: 'Sam', initials: 'S', color: '#6B4A80' },
  { name: 'Kai', initials: 'K', color: '#5C7A4F' },
]

const SEED: RoomMsg[] = [
  { id: 1, author: 'Maya', initials: 'M', color: '#7B9E6B', text: 'Morning everyone 🌤️ How’s the week treating you?', time: '8:40' },
  { id: 2, author: 'Arjun', initials: 'A', color: '#4A2C5E', text: 'Rough start tbh, exams are piling up.', time: '8:42' },
  { id: 3, author: 'Priya', initials: 'P', color: '#C45D3E', text: 'Sending you strength 💛 one thing at a time.', time: '8:43' },
  { id: 4, author: 'You', initials: 'Y', color: '#C45D3E', text: 'This circle honestly gets me through the week.', time: '8:45', me: true },
]

function titleize(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function RoomPage() {
  const params = useParams<{ id: string }>()
  const name = params?.id ? titleize(params.id) : 'Support Room'

  const [messages, setMessages] = useState<RoomMsg[]>(SEED)
  const [draft, setDraft] = useState('')
  const [inVoice, setInVoice] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((m) => [
      ...m,
      { id: m.length + 1, author: 'You', initials: 'Y', color: '#C45D3E', me: true, text, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    ])
    setDraft('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-warm-gray-lighter bg-cream/85 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-3 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/app/chats"
              aria-label="Back to chats"
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-plum to-terracotta text-cream">
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-heading text-lg font-bold text-charcoal">{name}</h1>
              <p className="text-xs text-warm-gray">128 members · 12 online</p>
            </div>
            <button
              type="button"
              onClick={() => setInVoice((v) => !v)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                inVoice ? 'bg-sage text-cream' : 'btn-gradient'
              )}
            >
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">{inVoice ? 'In voice' : 'Join voice'}</span>
            </button>
          </div>

          {/* Member avatars */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {MEMBERS.map((m) => (
                <span
                  key={m.name}
                  title={m.name}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-cream ring-2 ring-cream"
                  style={{ backgroundColor: m.color }}
                >
                  {m.initials}
                </span>
              ))}
            </div>
            <span className="text-xs text-warm-gray">+123 others</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="mx-auto mb-6 flex max-w-md items-center gap-2 rounded-2xl bg-sage/10 px-4 py-2.5 text-center text-xs text-sage-dark">
            <Shield className="h-4 w-4 shrink-0" />
            Be kind. This is a moderated, judgement-free space.
          </div>

          <div className="space-y-3">
            {messages.map((m, i) => {
              const prev = messages[i - 1]
              const grouped = prev && prev.author === m.author
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex gap-2.5', m.me ? 'flex-row-reverse' : 'flex-row', grouped ? 'mt-1' : 'mt-3')}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-cream',
                      grouped && 'invisible'
                    )}
                    style={{ backgroundColor: m.color }}
                  >
                    {m.initials}
                  </span>
                  <div className={cn('max-w-[78%] sm:max-w-[65%]', m.me && 'text-right')}>
                    {!grouped && (
                      <span className="mb-0.5 block px-1 text-xs font-medium text-warm-gray">{m.me ? 'You' : m.author}</span>
                    )}
                    <div
                      className={cn(
                        'inline-block rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed',
                        m.me
                          ? 'rounded-br-md bg-gradient-to-br from-plum to-terracotta text-cream'
                          : 'rounded-bl-md bg-white text-charcoal shadow-soft'
                      )}
                    >
                      <p>{m.text}</p>
                      <span className={cn('mt-1 block text-right text-[10px]', m.me ? 'text-cream/70' : 'text-warm-gray-light')}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            <div ref={endRef} />
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="sticky bottom-16 z-10 border-t border-warm-gray-lighter bg-cream/90 backdrop-blur-md lg:bottom-0">
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-3 py-3">
          <button aria-label="Add" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-plum/5 hover:text-plum">
            <Plus className="h-5 w-5" />
          </button>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder="Share with the circle…"
            className="input-warm max-h-32 flex-1 resize-none py-3"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Send"
            className={cn(
              'btn-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              !draft.trim() && 'cursor-not-allowed opacity-50'
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
