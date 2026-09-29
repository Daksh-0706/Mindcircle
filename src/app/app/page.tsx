'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Flame,
  LockKeyhole,
  Search,
  Sparkles,
} from 'lucide-react'
import { AppNav } from '../../components/layout/AppNavContext'
import MoodCheckin from '../../components/ui/MoodCheckin'
import Skeleton from '../../components/ui/Skeleton'
import { formatLongDate } from '../../lib/dates'

type MoodLog = { id: string; mood_score: number; created_at: string }
type JournalEntry = { id: string; content: string; created_at: string }

const activities = [
  { icon: '🌬️', title: 'Box breathing exercise', detail: 'Duration: 4 mins • Anxiety release', bg: 'bg-sage/15', href: '/app/activities' },
  { icon: '✍️', title: 'Write placement worries', detail: 'Duration: 10 mins • Grounding therapy', bg: 'bg-plum/10', href: '/app/journal' },
  { icon: '🎧', title: 'Anxiety release audio', detail: 'Duration: 6 mins • Calm guidance', bg: 'bg-terracotta/10', href: '/app/activities' },
]

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

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'ME'
}

function relativeDays(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState('')
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [now] = useState(() => new Date())

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/me').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/mood').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/journal').then((res) => (res.ok ? res.json() : { data: [] })),
    ])
      .then(([meJson, moodJson, journalJson]) => {
        if (!active) return
        setFirstName(nameFromEmail(meJson?.user?.email))
        setMoodLogs((moodJson.data ?? []) as MoodLog[])
        setEntries((journalJson.data ?? []) as JournalEntry[])
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const displayName = firstName || 'friend'
  const initials = initialsFor(displayName)

  const dayMs = 86400000
  const weekAgo = now.getTime() - dayMs * 7
  const weekMoods = moodLogs.filter((m) => new Date(m.created_at).getTime() >= weekAgo)
  const weekEntries = entries.filter((e) => new Date(e.created_at).getTime() >= weekAgo)
  const checkinCount = weekMoods.length
  const journalDays = new Set(weekEntries.map((e) => new Date(e.created_at).toDateString())).size
  const streakDays = new Set([
    ...moodLogs.map((m) => new Date(m.created_at).toDateString()),
    ...entries.map((e) => new Date(e.created_at).toDateString()),
  ]).size
  const lastEntry = entries[0]
  const lastEntryLabel = lastEntry
    ? `Last entry ${relativeDays(lastEntry.created_at)}`
    : 'No entries yet — your first one is waiting'

  return (
    <>
      <AppNav title="Dashboard" />
      <div className="page-enter space-y-6 pb-8">
        {/* Hero banner */}
        <section className="relative overflow-hidden rounded-[20px] px-9 py-9 text-cream" style={{ background: 'linear-gradient(180deg, #4A2C5E, #C45D3E)' }}>
          <div className="pointer-events-none absolute -left-10 -top-24 h-56 w-56 rounded-full bg-white/10 blob-shape" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-40 w-48 rounded-2xl bg-white/5" />
          <div className="relative flex flex-col gap-4">
            <div>
              <p className="text-[13px] font-bold text-cream/80">
                {formatLongDate(now)}
              </p>
              <h1 className="mt-1 font-heading text-[28px] font-bold">
                {greetingFor(now.getHours())}, {displayName}.
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-cream/90">Take a minute to center your head space.</p>
              <Link href="/app/assessment" className="rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-plum transition-transform hover:-translate-y-0.5">
                Check in now
              </Link>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
          <MoodCheckin className="rounded-[20px] border border-warm-gray-lighter bg-white/75 p-7 shadow-[0px_4px_16px_#4A2C5E08]" />
          {/* Week card */}
          <div className="rounded-[20px] border border-warm-gray-lighter bg-white/75 p-7 shadow-[0px_4px_16px_#4A2C5E08]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-warm-gray">This Week</p>
                <p className="mt-1 text-sm text-charcoal">Total completed actions</p>
              </div>
              <div className="flex items-start gap-2">
                {loading ? (
                  <Skeleton width={48} height={48} />
                ) : (
                  <span className="font-heading text-5xl font-bold text-plum">{checkinCount}</span>
                )}
                <span className="mt-[30px] text-sm font-bold text-warm-gray">check-ins</span>
              </div>
            </div>
            <div className="mb-4 h-px bg-warm-gray-lighter" />
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-charcoal">{loading ? '—' : journalDays} journal days completed</span>
              <Sparkles size={16} className="text-sage" />
            </div>
            <div className="mb-3 h-px bg-warm-gray-lighter" />
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-charcoal">{loading ? '—' : `${streakDays} day streak`}</span>
              <Flame size={16} className="text-terracotta" />
            </div>
            <div className="h-px bg-warm-gray-lighter" />
            <Link href="/app/insights" className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-terracotta">View insights</span>
              <ChevronRight size={16} className="text-terracotta" />
            </Link>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Activities */}
          <div className="rounded-[20px] border border-warm-gray-lighter bg-white/75 p-7 shadow-[0px_4px_16px_#4A2C5E08]">
            <h2 className="font-heading text-xl font-bold text-plum">Try something that helps</h2>
            <div className="mt-5 space-y-3">
              {activities.map((activity) => (
                <Link
                  key={activity.title}
                  href={activity.href}
                  className="flex items-center gap-4 rounded-xl p-3 transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: activity.bg.includes('sage') ? 'rgba(123,158,107,0.08)' : activity.bg.includes('plum') ? 'rgba(74,44,94,0.10)' : 'rgba(196,93,62,0.10)' }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-xl">{activity.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-charcoal">{activity.title}</span>
                    <span className="block text-xs text-warm-gray">{activity.detail}</span>
                  </span>
                  <ChevronRight size={16} className="text-warm-gray" />
                </Link>
              ))}
            </div>
          </div>
          {/* Privacy card */}
          <div className="flex flex-col gap-5 rounded-[20px] bg-plum p-7 text-cream">
            <h2 className="font-heading text-xl font-bold">Private by design</h2>
            <p className="text-sm leading-6 text-cream/90">
              Your identity stays entirely yours. Your journal and mood history are never shared — you choose what leaves this space, if anything.
            </p>
            <Link href="/app/settings" className="flex items-center gap-2 text-sm font-bold hover:opacity-80">
              Privacy settings <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Continue reflection */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warm-gray-lighter bg-white/75 px-7 py-5 shadow-[0px_4px_16px_#4A2C5E08]">
          <div>
            <p className="font-heading text-base font-bold text-plum">Continue your reflection</p>
            <p className="mt-1 text-[13px] text-warm-gray">
              {loading ? 'Loading…' : lastEntryLabel}
            </p>
          </div>
          <Link href="/app/journal" className="rounded-full bg-cream-dark px-5 py-2.5 text-[13px] font-bold text-plum transition-transform hover:-translate-y-0.5">
            Open journal
          </Link>
        </div>
      </div>
    </>
  )
}
