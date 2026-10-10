'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react'
import { AppNav } from '../../components/layout/AppNavContext'
import Skeleton from '../../components/ui/Skeleton'
import { formatLongDate } from '../../lib/dates'
import { MOOD_EMOJIS } from '../../lib/constants'
import { cn } from '../../lib/utils'

type MoodLog = { id: string; mood_score: number; created_at: string }
type JournalEntry = { id: string; content: string; created_at: string }

const activities = [
  { image: '/activities/breathing.webp', title: 'Box breathing exercise', detail: 'Duration: 4 mins • Anxiety release', bg: 'rgba(123,158,107,0.08)', href: '/app/activities' },
  { image: '/activities/journaling.webp', title: 'Write placement worries', detail: 'Duration: 10 mins • Grounding therapy', bg: 'rgba(74,44,94,0.10)', href: '/app/journal' },
  { image: '/activities/anxiety-relief.webp', title: 'Anxiety release audio', detail: 'Duration: 6 mins • Calm guidance', bg: 'rgba(196,93,62,0.10)', href: '/app/activities' },
]

function relativeDays(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

function greetingFor(hour: number) {
  if (hour < 5) return 'Still awake'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function nameFromEmail(email: string | null | undefined) {
  if (!email) return 'friend'
  const local = (email.split('@')[0] || '').replace(/[._-]+/g, ' ').trim()
  if (!local) return 'friend'
  const first = local.split(' ')[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState('')
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [now] = useState(() => new Date())
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [savingMood, setSavingMood] = useState(false)
  const [moodSaved, setMoodSaved] = useState(false)
  const [moodError, setMoodError] = useState('')
  /** True until the 4-step setup is finished, so we can nudge about it. */
  const [needsSetup, setNeedsSetup] = useState(false)
  const [setupHidden, setSetupHidden] = useState(false)

  useEffect(() => {
    const active = true
    Promise.all([
      fetch('/api/me').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/mood').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/journal').then((res) => (res.ok ? res.json() : { data: [] })),
    ])
      .then(([meJson, moodJson, journalJson]) => {
        if (!active) return
        const savedName = typeof meJson?.user?.fullName === 'string' ? meJson.user.fullName.trim() : ''
        setFirstName(savedName ? savedName.split(' ')[0] : nameFromEmail(meJson?.user?.email))
        // "Skip for now" sets a cookie but never finishes setup, so this is the
        // only reliable signal that the profile is still incomplete.
        const legacy = (meJson?.profile?.settings as Record<string, unknown> | undefined)
          ?.onboarded_at
        setNeedsSetup(!meJson?.profile?.onboarded_at && !legacy)
        setMoodLogs((moodJson.data ?? []) as MoodLog[])
        setEntries((journalJson.data ?? []) as JournalEntry[])
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
  }, [])

  const displayName = firstName || 'friend'

  // ── Save a mood check-in ─────────────────────────────────────
  const handleSaveMood = async () => {
    const mood = MOOD_EMOJIS.find((m) => m.label === selectedMood)
    if (!mood || savingMood) return

    setSavingMood(true)
    setMoodError('')
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_score: mood.score, mood_emoji: mood.emoji, note: '' }),
      })
      if (!res.ok) throw new Error('Could not save your mood. Please try again.')
      // Prepend the fresh row so the "This Week" stats and weekday dots
      // update without a reload.
      const saved = (await res.json().catch(() => null))?.data as MoodLog | undefined
      if (saved) setMoodLogs((prev) => [saved, ...prev])
      setMoodSaved(true)
      setSelectedMood(null)
      window.setTimeout(() => setMoodSaved(false), 2000)
    } catch (e) {
      setMoodError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSavingMood(false)
    }
  }

  // ── Week stats ──────────────────────────────────────────────
  const dayMs = 86400000
  const weekAgo = now.getTime() - dayMs * 7
  const weekMoods = moodLogs.filter((m) => new Date(m.created_at).getTime() >= weekAgo)
  const weekEntries = entries.filter((e) => new Date(e.created_at).getTime() >= weekAgo)
  const totalActions = weekMoods.length + weekEntries.length
  const journalDays = new Set(weekEntries.map((e) => new Date(e.created_at).toDateString())).size

  // Weekday dots — Monday-first, matching the reference design.
  // JS getDay(): 0 = Sun … 6 = Sat. Offset by -1 with wraparound.
  const activeDays = new Set<string>()
  for (const iso of [...moodLogs.map((m) => m.created_at), ...entries.map((e) => e.created_at)]) {
    const d = new Date(iso)
    if (now.getTime() - d.getTime() < dayMs * 7) activeDays.add(d.toDateString())
  }
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
  const todayIndex = (now.getDay() + 6) % 7
  const dotDone = weekdays.map((_, i) => {
    if (i > todayIndex) return false
    const date = new Date(now.getTime() - (todayIndex - i) * dayMs)
    return activeDays.has(date.toDateString())
  })

  return (
    <>
      <AppNav title="Home" />
      <div className="page-enter space-y-5 pb-8">
        {/* ── Setup reminder ─────────────────────────────────── */}
        {needsSetup && !setupHidden && (
          <div className="flex items-center gap-3 rounded-[20px] border border-[#D9D2F2] bg-[#F3EFFF] px-4 py-3.5">
            <Sparkles size={18} className="shrink-0 text-plum" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-[13.5px] leading-5 text-charcoal/75">
              Your profile is not set up yet — interests and goals help us show you the right
              people.
            </p>
            <Link
              href="/onboarding"
              className="shrink-0 rounded-full bg-plum px-4 py-2 text-[12.5px] font-bold text-white"
            >
              Set up
            </Link>
            <button
              type="button"
              onClick={() => setSetupHidden(true)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-1.5 text-charcoal/40 hover:bg-plum/5"
            >
              <X size={15} />
            </button>
          </div>
        )}
        {/* ── Sunset hero banner ───────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-[24px] bg-plum px-7 py-8 text-cream sm:px-9 sm:py-10"
        >
          {/* sunset landscape background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-sunset.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          {/* subtle left-edge scrim so text stays readable */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#3A1F4A]/55 via-[#3A1F4A]/15 to-transparent" aria-hidden="true" />

          <div className="relative max-w-sm">
            <p className="text-[14px] font-medium text-cream/85">{formatLongDate(now)}</p>
            <h1 className="mt-1 font-display text-[32px] font-semibold leading-tight">
              {greetingFor(now.getHours())},{' '}
              <span className="text-[#F5C98A]">{displayName}.</span>
            </h1>
            <p className="mt-3 text-[15px] leading-snug text-cream/90">
              Take a minute to center your head space.
            </p>
            <Link
              href="/app/assessment"
              className="mt-5 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-[15px] font-bold text-plum shadow-medium transition-transform hover:-translate-y-0.5"
            >
              Check in now
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-plum/10">
                <ArrowRight size={16} className="text-plum" />
              </span>
            </Link>
          </div>
        </section>

        {/* ── How are you feeling? ─────────────────────────────── */}
        <section className="rounded-[24px] border border-warm-gray-lighter bg-white/80 px-6 py-8 shadow-[0px_4px_16px_#4A2C5E08] sm:px-9 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-[26px] font-bold leading-tight text-charcoal sm:text-[30px]">
                How are you feeling?
              </h2>
              <p className="mt-2 text-[15px] text-warm-gray sm:text-base">Tap an emoji to log your mood</p>
            </div>

            {/* Top-right save — always visible; dimmed until a mood is picked */}
            <button
              type="button"
              onClick={handleSaveMood}
              disabled={!selectedMood || savingMood}
              aria-label="Save mood"
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold',
                'sm:px-5 sm:py-2.5 sm:text-sm',
                'transition-all duration-200',
                moodSaved
                  ? 'bg-sage text-white'
                  : selectedMood
                    ? 'btn-gradient shadow-medium hover:-translate-y-0.5'
                    : 'bg-warm-gray-lighter text-warm-gray',
              )}
            >
              {moodSaved ? (
                <>
                  <Check size={15} strokeWidth={3} aria-hidden="true" /> Saved
                </>
              ) : savingMood ? (
                'Saving…'
              ) : (
                'Save'
              )}
            </button>
          </div>

          {/* Airy 3-up grid: a big3D emoji floating over its own soft pastel
              pill, no tile background — the chip is the only color. */}
          <div className="mt-7 grid grid-cols-3 gap-x-3 gap-y-7 sm:mt-9 sm:gap-x-6 sm:gap-y-10">
            {MOOD_EMOJIS.map((mood) => {
              const isSelected = selectedMood === mood.label
              return (
                <button
                  key={mood.label}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedMood(isSelected ? null : mood.label)}
                  className="group flex flex-col items-center gap-3 rounded-2xl outline-none sm:gap-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mood.image}
                    alt=""
                    draggable={false}
                    className={cn(
                      'h-12 w-12 select-none transition-transform duration-200 sm:h-[68px] sm:w-[68px]',
                      'group-hover:scale-105 group-active:scale-95',
                      isSelected && 'scale-110',
                    )}
                  />
                  {/* Mobile keeps the chip small enough that the longest
                      label ("Frustrated") still fits inside a 3-up column. */}
                  <span
                    className={cn(
                      'flex min-h-10 max-w-full items-center justify-center rounded-full px-3',
                      'text-[13px] font-medium text-charcoal transition-all duration-200',
                      'sm:min-h-12 sm:px-7 sm:text-[17px]',
                      isSelected && 'font-semibold',
                    )}
                    style={{
                      backgroundColor: mood.pill,
                      boxShadow: isSelected
                        ? `0 0 0 2px ${mood.color}66, 0 8px 20px ${mood.color}33`
                        : '0 2px 8px rgba(74,44,94,0.05)',
                    }}
                  >
                    {mood.label}
                  </span>
                </button>
              )
            })}
          </div>

          {moodError && (
            <p role="alert" className="mt-5 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {moodError}
            </p>
          )}
        </section>

        {/* ── This Week ────────────────────────────────────────── */}
        <section className="rounded-[24px] border border-warm-gray-lighter bg-white/80 p-6 shadow-[0px_4px_16px_#4A2C5E08] sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[22px] font-bold text-charcoal">This Week</h2>
            <Link
              href="/app/insights"
              className="inline-flex items-center gap-1.5 rounded-full bg-plum/10 px-4 py-2 text-[13px] font-semibold text-plum transition-transform hover:-translate-y-0.5"
            >
              View details <ArrowRight size={14} />
            </Link>
          </div>

          {/* stat tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-plum/[0.07] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum/15">
                <Check size={20} className="text-plum" />
              </span>
              <span>
                <span className="block font-heading text-2xl font-bold text-charcoal">
                  {loading ? <Skeleton width={40} height={28} /> : totalActions}
                </span>
                <span className="block text-[13px] leading-tight text-warm-gray">Total completed actions</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-terracotta/[0.08] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta/15">
                <BookOpen size={20} className="text-terracotta" />
              </span>
              <span>
                <span className="block font-heading text-2xl font-bold text-charcoal">
                  {loading ? <Skeleton width={40} height={28} /> : journalDays}
                </span>
                <span className="block text-[13px] leading-tight text-warm-gray">Journal days completed</span>
              </span>
            </div>
          </div>

          {/* weekday dots */}
          <div className="mt-6 grid grid-cols-7 gap-1 text-center">
            {weekdays.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-2.5">
                <span className={cn('text-[13px]', i === todayIndex ? 'font-bold text-charcoal' : 'text-warm-gray')}>
                  {label}
                </span>
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    dotDone[i] ? 'bg-plum text-cream' : 'border-2 border-warm-gray-lighter bg-white',
                  )}
                  aria-label={`${label}: ${dotDone[i] ? 'completed' : 'not completed'}`}
                >
                  {dotDone[i] && <Check size={15} strokeWidth={3} />}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Try something that helps ─────────────────────────── */}
        <section className="rounded-[24px] border border-warm-gray-lighter bg-white/80 p-6 shadow-[0px_4px_16px_#4A2C5E08] sm:p-7">
          <h2 className="font-heading text-[22px] font-bold text-plum">Try something that helps</h2>
          <div className="mt-5 space-y-3">
            {activities.map((activity) => (
              <Link
                key={activity.title}
                href={activity.href}
                className="group flex items-center gap-4 rounded-2xl p-3 transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: activity.bg }}
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/70">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activity.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-charcoal">{activity.title}</span>
                  <span className="block text-xs text-warm-gray">{activity.detail}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-warm-gray" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── Private by design ────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] bg-plum p-7 text-cream">
          {/* cozy room background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/private-room.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
          />
          {/* left scrim so text stays readable */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#3A1F4A]/90 via-[#3A1F4A]/45 to-transparent" aria-hidden="true" />
          <div className="relative flex max-w-[60%] flex-col gap-4">
          <h2 className="font-heading text-[22px] font-bold">
            <span className="text-cream">Private </span>
            <span className="text-[#F5C98A]">by design</span>
          </h2>
          <p className="text-sm leading-6 text-cream/90">
            Your identity stays entirely yours. Your journal and mood history are never shared — you choose what leaves this space, if anything.
          </p>
          <Link
            href="/app/settings"
            className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-plum shadow-medium transition-transform hover:-translate-y-0.5"
          >
            Privacy settings <ArrowRight size={16} />
          </Link>
          </div>
        </section>

        {/* ── Continue your reflection ─────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white/80 px-6 py-5 shadow-[0px_4px_16px_#4A2C5E08] sm:px-7">
          {/* journal book illustration on the right */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-book.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-[120%] w-auto max-w-[45%] object-contain object-bottom"
          />
          <div className="relative pr-28 sm:pr-44">
            <p className="font-heading text-lg font-bold text-plum">Continue your reflection</p>
            <p className="mt-1 text-[14px] text-warm-gray">
              {loading
                ? 'Loading…'
                : entries[0]
                  ? `Last entry ${relativeDays(entries[0].created_at)}`
                  : 'No entries yet — your first one is waiting'}
            </p>
            <Link
              href="/app/journal"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-plum/10 px-5 py-2.5 text-[14px] font-semibold text-plum transition-transform hover:-translate-y-0.5"
            >
              <BookOpen size={16} />
              Open journal
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
