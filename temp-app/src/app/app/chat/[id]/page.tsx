'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, Video, Send, Plus, Smile, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

type Msg = { id: number; from: 'me' | 'them'; text: string; time: string }

const SEED: Msg[] = [
  { id: 1, from: 'them', text: 'Hey! How are you holding up today?', time: '9:02' },
  { id: 2, from: 'me', text: 'Honestly a bit anxious about the presentation later 😬', time: '9:04' },
  { id: 3, from: 'them', text: 'That’s completely understandable. You’ve prepared so much for this.', time: '9:05' },
  { id: 4, from: 'them', text: 'Want to run through your opening line together?', time: '9:05' },
  { id: 5, from: 'me', text: 'Yeah, that would actually help a lot. Thank you 💛', time: '9:07' },
]

function titleize(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ChatDetailPage() {
  const params = useParams<{ id: string }>()
  const name = params?.id ? titleize(params.id) : 'Conversation'
  const initials = name.slice(0, 1).toUpperCase()

  const [messages, setMessages] = useState<Msg[]>(SEED)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((m) => [
      ...m,
      { id: m.length + 1, from: 'me', text, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    ])
    setDraft('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-warm-gray-lighter bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-3">
          <Link
            href="/app/chats"
            aria-label="Back to chats"
            className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sage to-sage-light text-base font-semibold text-cream">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-lg font-bold text-charcoal">{name}</h1>
            <p className="flex items-center gap-1.5 text-xs text-sage">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Active now
            </p>
          </div>
          <button aria-label="Voice call" className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5">
            <Phone className="h-5 w-5" />
          </button>
          <button aria-label="Video call" className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5">
            <Video className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Privacy note */}
          <div className="mx-auto mb-6 flex max-w-sm items-center gap-2 rounded-2xl bg-plum/5 px-4 py-2.5 text-center text-xs text-plum">
            <Shield className="h-4 w-4 shrink-0" />
            Messages are private and end-to-end encrypted.
          </div>

          <div className="space-y-3">
            {messages.map((m, i) => {
              const mine = m.from === 'me'
              const prev = messages[i - 1]
              const grouped = prev && prev.from === m.from
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('flex', mine ? 'justify-end' : 'justify-start', grouped ? 'mt-1' : 'mt-3')}
                >
                  <div
                    className={cn(
                      'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%]',
                      mine
                        ? 'rounded-br-md bg-gradient-to-br from-plum to-terracotta text-cream'
                        : 'rounded-bl-md bg-white text-charcoal shadow-soft'
                    )}
                  >
                    <p>{m.text}</p>
                    <span className={cn('mt-1 block text-right text-[10px]', mine ? 'text-cream/70' : 'text-warm-gray-light')}>
                      {m.time}
                    </span>
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
          <button aria-label="Add attachment" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-plum/5 hover:text-plum">
            <Plus className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
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
              placeholder="Type a message…"
              className="input-warm max-h-32 w-full resize-none py-3 pr-11"
            />
            <button aria-label="Emoji" className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray transition-colors hover:text-plum">
              <Smile className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Send message"
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
