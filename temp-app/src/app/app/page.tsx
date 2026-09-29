'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Flame,
  BookOpen,
  Smile,
  TrendingUp,
  ArrowRight,
  Users,
  HeartPulse,
  Wind,
  ChevronRight,
  Check,
} from 'lucide-react'
import { MOOD_EMOJIS } from '../../lib/constants'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/utils'

/* Mock weekly mood scores (1–5) for the insights preview. */
const WEEK = [
  { day: 'M', score: 3 },
  { day: 'T', score: 4 },
  { day: 'W', score: 2 },
  { day: 'T', score: 4 },
  { day: 'F', score: 5 },
  { day: 'S', score: 4 },
  { day: 'S', score: 3 },
]

const STATS = [
  { icon: Flame, value: '7', label: 'Day streak', tint: 'from-terracotta to-terracotta-light' },
  { icon: BookOpen, value: '24', label: 'Journal entries', tint: 'from-plum to-plum-light' },
  { icon: Smile, value: '4.1', label: 'Avg mood', tint: 'from-sage to-sage-light' },
  { icon: TrendingUp, value: '+12%', label: 'This week', tint: 'from-plum to-terracotta' },
]

const QUICK_ACTIONS = [
  { href: '/app/journal', label: 'New Journal', icon: BookOpen, tint: 'from-plum to-plum-light' },
  { href: '/app/connect', label: 'Connect', icon: Users, tint: 'from-sage to-sage-light' },
  { href: '/app/activities', label: 'Activities', icon: Sparkles, tint: 'from-terracotta to-terracotta-light' },
  { href: '/app/crisis', label: 'Get Support', icon: HeartPulse, tint: 'from-danger to-terracotta' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const isDesktop = useIsDesktop()
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const today = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    []
  )
  const selectedMood = MOOD_EMOJIS.find((m) => m.label === mood)

  const handleSave = () => {
    if (!mood) return
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

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
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-plum to-terracotta">
                <Sparkles className="h-5 w-5 text-cream" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-charcoal">{greeting()}</h1>
                <p className="text-sm text-warm-gray">{today}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
          {/* Mood check-in */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card relative overflow-hidden rounded-3xl p-6 md:p-8">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-terracotta/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-plum/10 blur-2xl" />

              <div className="relative">
                <h2 className="font-heading text-xl font-bold text-charcoal md:text-2xl">
                  How are you feeling right now?
                </h2>
                <p className="mt-1 text-sm text-warm-gray">
                  A quick check-in helps you notice patterns over time.
                </p>

                {/* Emoji picker */}
                <div className="mt-6 flex flex-wrap gap-2.5 sm:gap-3">
                  {MOOD_EMOJIS.map((m) => {
                    const active = mood === m.label
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setMood(m.label)}
                        aria-pressed={active}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-all duration-200 sm:px-4',
                          active ? 'scale-105 bg-white shadow-medium' : 'bg-white/50 hover:bg-white/80'
                        )}
                        style={active ? { boxShadow: `0 0 0 2px ${m.color}` } : undefined}
                      >
                        <span className="text-2xl sm:text-3xl">{m.emoji}</span>
                        <span
                          className="text-[11px] font-medium sm:text-xs"
                          style={{ color: active ? m.color : '#8A8A8A' }}
                        >
                          {m.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Note + save */}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label htmlFor="mood-note" className="mb-1.5 block text-sm font-medium text-charcoal">
                      Add a note <span className="text-warm-gray-light">(optional)</span>
                    </label>
                    <input
                      id="mood-note"
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="What's on your mind?"
                      className="input-warm w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!mood}
                    className={cn(
                      'btn-gradient flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold',
                      !mood && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {saved ? (
                      <>
                        <Check className="h-4 w-4" /> Saved
                      </>
                    ) : (
                      <>
                        Check in <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {saved && selectedMood && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm font-medium text-sage"
                  >
                    {selectedMood.emoji} Logged — thanks for checking in.
                  </motion.p>
                )}
              </div>
            </div>
          </motion.section>

          {/* Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <div
                    className={cn(
                      'mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-cream',
                      s.tint
                    )}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="font-heading text-2xl font-bold text-charcoal">{s.value}</p>
                  <p className="text-xs text-warm-gray">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Insights preview + Today's activity */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Weekly mood preview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="glass-card h-full rounded-2xl p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-charcoal">This week's mood</h3>
                    <p className="text-sm text-warm-gray">Your emotional rhythm</p>
                  </div>
                  <Link
                    href="/app/insights"
                    className="flex items-center gap-1 text-sm font-medium text-plum transition-colors hover:text-plum-dark"
                  >
                    Insights <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
                  {WEEK.map((d, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.score / 5) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-[28px] rounded-full bg-gradient-to-t from-plum to-terracotta"
                        style={{ minHeight: 8 }}
                      />
                      <span className="text-xs text-warm-gray">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Today's suggested activity */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="lg:col-span-2"
            >
              <Link href="/app/activities" className="block h-full">
                <div className="glass-card relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-5 transition-all hover:shadow-strong md:p-6">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sage/15 blur-xl" />
                  <div className="relative">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sage to-sage-light text-cream">
                      <Wind className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-medium text-warm-gray">Suggested for you</span>
                    <h3 className="mt-1 font-heading text-lg font-bold text-charcoal">4-7-8 Breathing</h3>
                    <p className="mt-1 text-sm text-warm-gray">
                      A 3-minute exercise to calm your nervous system.
                    </p>
                  </div>
                  <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-plum">
                    Try now <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.section>
          </div>

          {/* Quick actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="mb-3 font-heading text-lg font-bold text-charcoal">Quick actions</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="glass-card flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all hover:shadow-medium"
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-cream',
                      a.tint
                    )}
                  >
                    <a.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-charcoal">{a.label}</span>
                </Link>
              ))}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}
