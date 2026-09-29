'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, EyeOff, AlignLeft, AlignCenter, Type, Sparkles } from 'lucide-react'
import { MOOD_EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const BACKGROUNDS = [
  { id: 'plum', className: 'from-plum to-terracotta' },
  { id: 'sage', className: 'from-sage to-sage-light' },
  { id: 'terracotta', className: 'from-terracotta to-terracotta-light' },
  { id: 'dusk', className: 'from-plum-dark via-plum to-terracotta' },
  { id: 'calm', className: 'from-sage-dark via-sage to-plum-light' },
  { id: 'warm', className: 'from-terracotta-light via-terracotta to-plum' },
]

export default function StoryCreatePage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [bg, setBg] = useState(BACKGROUNDS[0])
  const [mood, setMood] = useState<string | null>(null)
  const [align, setAlign] = useState<'center' | 'left'>('center')
  const [big, setBig] = useState(true)
  const [posting, setPosting] = useState(false)

  const selectedMood = MOOD_EMOJIS.find((m) => m.label === mood)

  const post = () => {
    if (!text.trim()) return
    setPosting(true)
    setTimeout(() => router.push('/app/connect'), 1100)
  }

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-warm-gray-lighter bg-cream/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-3">
            <div className="flex items-center gap-2">
              <Link
                href="/app/connect"
                aria-label="Cancel"
                className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="font-heading text-lg font-bold text-charcoal">New Story</h1>
            </div>
            <button
              type="button"
              onClick={post}
              disabled={!text.trim() || posting}
              className={cn(
                'btn-gradient flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold',
                (!text.trim() || posting) && 'cursor-not-allowed opacity-50'
              )}
            >
              {posting ? (
                <>
                  <Check className="h-4 w-4" /> Posted
                </>
              ) : (
                'Share'
              )}
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
          {/* Live preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto w-full max-w-sm"
          >
            <div
              className={cn(
                'relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-6 shadow-strong',
                bg.className,
                align === 'center' ? 'items-center justify-center text-center' : 'items-start justify-end text-left'
              )}
            >
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-black/10 blur-2xl" />

              {selectedMood && (
                <span className="absolute right-4 top-4 text-4xl drop-shadow-sm">{selectedMood.emoji}</span>
              )}

              <p
                className={cn(
                  'relative font-heading font-bold leading-snug text-cream drop-shadow-sm',
                  big ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                )}
              >
                {text || 'Tap to share what’s on your mind…'}
              </p>

              <span className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 text-xs font-medium text-cream/80">
                <EyeOff className="h-3.5 w-3.5" /> Shared anonymously
              </span>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-5"
          >
            {/* Text */}
            <div className="glass-card rounded-2xl p-4">
              <label htmlFor="story-text" className="mb-2 block text-sm font-semibold text-charcoal">
                Your words
              </label>
              <textarea
                id="story-text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 200))}
                rows={3}
                placeholder="Something you're feeling, a small win, a reminder…"
                className="input-warm w-full resize-none"
                autoFocus
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAlign('center')}
                    aria-label="Align center"
                    className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition-colors', align === 'center' ? 'bg-plum/10 text-plum' : 'text-warm-gray hover:bg-plum/5')}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlign('left')}
                    aria-label="Align left"
                    className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition-colors', align === 'left' ? 'bg-plum/10 text-plum' : 'text-warm-gray hover:bg-plum/5')}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBig((b) => !b)}
                    aria-label="Toggle text size"
                    className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition-colors', big ? 'bg-plum/10 text-plum' : 'text-warm-gray hover:bg-plum/5')}
                  >
                    <Type className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-warm-gray-light">{text.length}/200</span>
              </div>
            </div>

            {/* Backgrounds */}
            <div className="glass-card rounded-2xl p-4">
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                <Sparkles className="h-4 w-4 text-plum" /> Background
              </p>
              <div className="flex flex-wrap gap-2.5">
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBg(b)}
                    aria-label={`Background ${b.id}`}
                    className={cn(
                      'h-11 w-11 rounded-xl bg-gradient-to-br transition-transform',
                      b.className,
                      bg.id === b.id ? 'scale-110 ring-2 ring-charcoal ring-offset-2 ring-offset-cream' : 'hover:scale-105'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Mood sticker */}
            <div className="glass-card rounded-2xl p-4">
              <p className="mb-3 text-sm font-semibold text-charcoal">Mood sticker</p>
              <div className="flex flex-wrap gap-2">
                {MOOD_EMOJIS.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(mood === m.label ? null : m.label)}
                    aria-pressed={mood === m.label}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all',
                      mood === m.label ? 'scale-110 bg-white shadow-soft' : 'bg-white/40 hover:bg-white/70'
                    )}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <p className="flex items-center gap-2 rounded-2xl bg-plum/5 px-4 py-3 text-xs text-plum">
              <EyeOff className="h-4 w-4 shrink-0" />
              Your name is never attached to stories. Shared with kindness, kept anonymous.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
