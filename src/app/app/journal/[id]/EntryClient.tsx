'use client'

import { useEffect, useState } from 'react'
import { AppNav } from '@/components/layout/AppNavContext'
import EmptyState from '@/components/ui/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { ArrowLeft, Clock, FileText } from 'lucide-react'
import Link from 'next/link'
import NotoEmoji from '@/components/ui/NotoEmoji'
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
  // The mood that was picked when this entry was written, and its colour for
  // the tint. Resolved here so the render body stays declarative.
  const moodTag = entry?.mood_tag ?? null
  const mood = moodTag ? (MOOD_EMOJIS.find((m) => m.emoji === moodTag) ?? null) : null

  return (
    <>
      <AppNav title="Journal" />
      <div className="page-enter space-y-6 pb-8">
        {/* ── Entry card ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white shadow-[0px_4px_16px_#4A2C5E08]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-bg.webp"
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
              {/* Read-only: the one mood that was logged when this entry was
                  written. The whole row of faces used to render here through a
                  picker whose onSelect was a no-op, so it read as selectable
                  without doing anything. Hidden entirely when the entry has no
                  mood; the footer below still shows. */}
              {moodTag && (
                <>
                  <span className="font-heading text-[17px] font-bold text-charcoal">Mood check:</span>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={
                        mood
                          ? { backgroundColor: `${mood.color}22`, boxShadow: `0 4px 20px ${mood.color}44` }
                          : undefined
                      }
                    >
                      <NotoEmoji emoji={moodTag} size={28} label={MOOD_LABELS[moodTag] ?? moodTag} />
                    </span>
                    <span className="rounded-full bg-plum/10 px-2.5 py-1 text-[11px] font-semibold text-plum">
                      {MOOD_LABELS[moodTag] ?? moodTag}
                    </span>
                  </div>
                </>
              )}
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
      </div>
    </>
  )
}
