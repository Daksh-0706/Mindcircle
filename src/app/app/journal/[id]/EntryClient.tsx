'use client'

import { useEffect, useState } from 'react'
import { AppNav } from '@/components/layout/AppNavContext'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { ArrowLeft, AlertCircle, Clock, FileText, Heart, Sun, Star, Leaf } from 'lucide-react'
import Link from 'next/link'
import MoodPicker from '@/components/ui/MoodPicker'
import { MOOD_EMOJIS } from '@/lib/constants'
import { formatShortDate, formatTime } from '@/lib/dates'

/** emoji → label, so the saved mood_tag (an emoji) renders as a word. */
const MOOD_LABELS: Record<string, string> = Object.fromEntries(
  MOOD_EMOJIS.map((m) => [m.emoji, m.label]),
)

type JournalEntry = {
  id: string
  content: string
  mood_tag?: string | null
  created_at: string
}

const SIDE_PROMPTS = [
  { text: "What's one pressure you can release today?", icon: Leaf, bg: 'bg-[#EFEAFB]', iconBg: 'bg-white' },
  { text: 'Describe a small boundary you set this week.', icon: Sun, bg: 'bg-[#FBEEDC]', iconBg: 'bg-transparent' },
  { text: 'Who in your college makes you feel safest?', icon: Heart, bg: 'bg-[#FBE7EC]', iconBg: 'bg-transparent' },
  { text: 'Write about a private hope for the next semester.', icon: Star, bg: 'bg-[#EAF2FB]', iconBg: 'bg-transparent' },
]

/** Entries are stored as `title\n\nbody`; split them back apart for display. */
function splitEntry(content: string): { title: string; body: string } {
  const trimmed = content.replace(/\r\n/g, '\n').trim()
  const [first, ...rest] = trimmed.split('\n')
  const bodyLines = rest.join('\n').replace(/^\n+/, '')
  if (!bodyLines) return { title: '', body: first }
  return { title: first.trim(), body: bodyLines }
}

function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return formatShortDate(d)
}

export default function EntryClient({ id }: { id: string }) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    // Every setState below happens after an await, so the effect never triggers
    // a synchronous cascading render. The API session cookie is the source of
    // truth — checking the client session first would just race this request.
    const load = async () => {
      try {
        const res = await fetch(`/api/journal/${id}`, { cache: 'no-store' })
        if (cancelled) return
        if (res.status === 401) {
          setError('Please sign in to read your journal.')
          return
        }
        if (res.status === 404) {
          setError('This entry no longer exists.')
          return
        }
        if (!res.ok) {
          setError('Something went wrong while loading this entry.')
          return
        }
        const json = await res.json()
        if (cancelled) return
        const data = json?.data
        const loaded = Array.isArray(data) ? data[0] : data
        if (!loaded || typeof loaded.content !== 'string' || !loaded.content.trim()) {
          setError('This entry no longer exists.')
          return
        }
        setEntry(loaded as JournalEntry)
      } catch {
        if (!cancelled) setError('Something went wrong while loading this entry.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  const parsed = entry ? splitEntry(entry.content) : null
  const words = entry ? entry.content.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <>
      <AppNav title="Journal" />
      <div className="page-enter space-y-6 pb-8">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter px-6 py-8 sm:px-8 sm:py-10"
          style={{
            background: `
              radial-gradient(circle at 78% 55%, rgba(253,215,190,0.55) 0%, rgba(253,215,190,0) 45%),
              radial-gradient(circle at 92% 20%, rgba(240,190,220,0.4) 0%, rgba(240,190,220,0) 35%),
              radial-gradient(circle at 60% 100%, rgba(230,220,250,0.5) 0%, rgba(230,220,250,0) 40%),
              linear-gradient(105deg, #FDF4EC 0%, #FBEFE6 55%, #F6E9EE 100%)
            `,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-book.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 top-1/2 hidden h-[135%] w-auto -translate-y-1/2 object-contain mix-blend-multiply sm:block"
            style={{
              maskImage: 'radial-gradient(ellipse 75% 75% at 60% 50%, black 55%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 60% 50%, black 55%, transparent 100%)',
            }}
          />
          <div className="relative max-w-full sm:max-w-[55%]">
            <h1 className="font-display text-[44px] font-bold leading-[1.08] tracking-tight text-[#3D2A52] sm:text-[52px]">
              <span className="block">Private</span>
              <span className="block bg-gradient-to-r from-[#E88A8A] via-[#C98BB8] to-[#8B7BD8] bg-clip-text text-transparent">
                Journal
              </span>
            </h1>
            <p className="mt-4 text-[16px] leading-7 text-charcoal/80">
              A quiet place to unpack thoughts,
              <br className="hidden sm:block" /> safely and anonymously.
            </p>
            <span className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#EAF3EA]/90 px-5 py-2.5 text-[14px] font-semibold text-[#3E7A52] backdrop-blur-sm">
              <AlertCircle size={15} /> Only you can see this
            </span>
          </div>
        </section>

        {/* ── Entry card ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white shadow-[0px_4px_16px_#4A2C5E08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-bg.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="pointer-events-none absolute inset-0 bg-white/70" aria-hidden="true" />

          <div className="relative p-6 sm:p-7">
            <Link
              href="/app/journal"
              className="inline-flex items-center gap-2 text-sm font-semibold text-plum transition-colors hover:text-plum/80"
            >
              <ArrowLeft size={16} />
              Back to all entries
            </Link>

            {loading ? (
              <div className="mt-6 space-y-4">
                <Skeleton variant="rect" height={36} width="60%" />
                <Skeleton variant="rect" height={240} />
              </div>
            ) : error || !parsed ? (
              <div className="mt-6">
                <EmptyState
                  icon={<FileText size={26} />}
                  title="Entry unavailable"
                  description={error || 'This entry could not be loaded.'}
                />
              </div>
            ) : (
              <>
                {parsed.title && (
                  <h2 className="mt-6 font-heading text-[26px] font-bold leading-snug text-charcoal">
                    {parsed.title}
                  </h2>
                )}
                <article className="mt-3 whitespace-pre-wrap break-words text-[17px] leading-7 text-charcoal">
                  {parsed.body}
                </article>
              </>
            )}

            <div className="mt-6 border-t border-warm-gray-lighter/70 pt-4">
              <span className="font-heading text-[17px] font-bold text-charcoal">Mood check:</span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <MoodPicker variant="compact" selected={entry?.mood_tag ?? null} onSelect={() => {}} />
                {entry?.mood_tag && (
                  <span className="rounded-full bg-plum/10 px-2.5 py-1 text-[11px] font-semibold text-plum">
                    {MOOD_LABELS[entry.mood_tag] ?? entry.mood_tag}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-warm-gray">{words} words</span>
                {entry?.created_at && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#80698A]">
                    <Clock size={13} />
                    {dayLabel(entry.created_at)} · {formatTime(new Date(entry.created_at))}
                  </span>
                )}
                <Link
                  href="/app/journal"
                  className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(91,75,158,0.35)] transition-transform hover:-translate-y-0.5"
                >
                  <ArrowLeft size={17} />
                  Write a new entry
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reflective prompts ─────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white p-6 shadow-[0px_4px_16px_#4A2C5E08] sm:p-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-bg.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full object-cover object-bottom opacity-70"
          />
          <div className="pointer-events-none absolute inset-0 bg-white/60" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-[26px] font-bold text-[#2A1B3D]">Reflective prompts</h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-1 text-[#F0B45A]">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" />
              </svg>
            </div>
            <div className="mt-4 space-y-3">
              {SIDE_PROMPTS.map((prompt) => (
                <Link
                  key={prompt.text}
                  href="/app/journal"
                  className={`flex w-full items-center gap-3.5 rounded-2xl ${prompt.bg} px-4 py-3.5 text-left transition-transform hover:-translate-y-0.5`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${prompt.iconBg}`}>
                    <prompt.icon size={17} className="text-[#8B7BD8]" />
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] leading-6 text-charcoal">{prompt.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
