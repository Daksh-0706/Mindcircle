'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Lock,
  Globe,
  Check,
  Loader2,
  Tag as TagIcon,
  X,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { MOOD_EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type SaveState = 'idle' | 'saving' | 'saved'

const RECENT = [
  { id: '1', title: 'Small wins today', excerpt: 'Managed to finish my assignment before the deadline and even had time to…', date: 'Today', mood: '😊', private: true },
  { id: '2', title: 'Feeling overwhelmed', excerpt: 'So much on my plate this week. Trying to remember to breathe and take it…', date: 'Yesterday', mood: '😰', private: true },
  { id: '3', title: 'A good conversation', excerpt: 'Opened up to a friend about how I have been feeling. It helped more than…', date: 'Mon', mood: '😌', private: false },
  { id: '4', title: 'Reset', excerpt: 'Took a long walk and left my phone at home. The quiet was exactly what…', date: 'Sun', mood: '😐', private: true },
]

export default function JournalPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [isPrivate, setIsPrivate] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [save, setSave] = useState<SaveState>('idle')
  const firstEdit = useRef(true)

  // Simple auto-save simulation: whenever content changes, show saving → saved.
  useEffect(() => {
    if (firstEdit.current) {
      firstEdit.current = false
      return
    }
    if (!title && !body) return
    setSave('saving')
    const t = setTimeout(() => setSave('saved'), 800)
    return () => clearTimeout(t)
  }, [title, body, mood, isPrivate, tags])

  const addTag = () => {
    const t = tagInput.trim().replace(/,$/, '')
    if (t && !tags.includes(t) && tags.length < 6) setTags([...tags, t])
    setTagInput('')
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

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
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-plum to-plum-light">
                <BookOpen className="h-5 w-5 text-cream" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-charcoal">Journal</h1>
                <p className="text-sm text-warm-gray">{today}</p>
              </div>
            </div>

            {/* Save indicator */}
            <div className="flex items-center gap-1.5 text-sm text-warm-gray">
              {save === 'saving' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              )}
              {save === 'saved' && (
                <span className="flex items-center gap-1.5 text-sage">
                  <Check className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_340px]">
          {/* Editor */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card rounded-3xl p-5 md:p-7">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title…"
                className="w-full border-none bg-transparent font-heading text-2xl font-bold text-charcoal placeholder:text-warm-gray-light focus:outline-none md:text-3xl"
              />

              {/* Mood row */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-warm-gray">Mood:</span>
                {MOOD_EMOJIS.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(mood === m.label ? null : m.label)}
                    aria-pressed={mood === m.label}
                    title={m.label}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all',
                      mood === m.label ? 'scale-110 bg-white shadow-soft' : 'bg-white/40 hover:bg-white/70'
                    )}
                    style={mood === m.label ? { boxShadow: `0 0 0 2px ${m.color}` } : undefined}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write freely. This is your space — no judgement, no filter."
                rows={12}
                className="mt-5 w-full resize-none border-none bg-transparent leading-relaxed text-charcoal placeholder:text-warm-gray-light focus:outline-none"
              />

              {/* Tags */}
              <div className="mt-4 border-t border-warm-gray-lighter pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <TagIcon className="h-4 w-4 text-warm-gray" />
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 rounded-full bg-plum/10 px-3 py-1 text-xs font-medium text-plum"
                    >
                      {t}
                      <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    onBlur={addTag}
                    placeholder={tags.length ? 'Add another…' : 'Add tags…'}
                    className="min-w-[120px] flex-1 bg-transparent text-sm text-charcoal placeholder:text-warm-gray-light focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer: privacy + count */}
              <div className="mt-5 flex flex-col gap-3 border-t border-warm-gray-lighter pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setIsPrivate((p) => !p)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isPrivate ? 'bg-plum/10 text-plum' : 'bg-sage/15 text-sage-dark'
                  )}
                >
                  {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {isPrivate ? 'Private — only you' : 'Shared to community'}
                </button>
                <span className="text-sm text-warm-gray">{wordCount} words</span>
              </div>
            </div>
          </motion.section>

          {/* Recent entries */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="lg:sticky lg:top-24">
              <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-charcoal">
                <Calendar className="h-5 w-5 text-warm-gray" /> Recent entries
              </h2>
              <div className="space-y-3">
                {RECENT.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className="glass-card group w-full rounded-2xl p-4 text-left transition-all hover:shadow-medium"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{e.mood}</span>
                        <h3 className="font-heading font-bold text-charcoal">{e.title}</h3>
                      </div>
                      {e.private ? (
                        <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-warm-gray-light" />
                      ) : (
                        <Globe className="mt-1 h-3.5 w-3.5 shrink-0 text-sage" />
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-warm-gray">{e.excerpt}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-warm-gray-light">{e.date}</span>
                      <ChevronRight className="h-4 w-4 text-warm-gray-light transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.div>
    </div>
  )
}
