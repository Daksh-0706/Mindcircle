'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  Info,
  Lightbulb,
  Moon,
  PieChart,
  TrendingUp,
} from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { AppNav } from '@/components/layout/AppNavContext'
import { cn } from '@/lib/utils'

type Range = '1w' | '1m' | '3m' | '1y'

const RANGES: { key: Range; label: string }[] = [
  { key: '1w', label: '1W' },
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '1y', label: '1Y' },
]

type Insights = {
  range: Range
  total: number
  average: number
  positivePct: number
  headline: string
  summary: string
  series: { at: string; label: string; value: number | null }[]
  breakdown: { key: string; label: string; color: string; pct: number }[]
  patterns: { title: string; detail: string }[]
}

type Person = { alias: string | null; name: string }

const FACE_BY_PCT = (pct: number) => (pct >= 70 ? '🙂' : pct >= 45 ? '😐' : '😔')

export default function MoodInsightsClient() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const personId = params?.id ?? ''

  const [range, setRange] = useState<Range>('1w')
  const [person, setPerson] = useState<Person | null>(null)
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!personId) return
    let active = true
    fetch(`/api/profile/${encodeURIComponent(personId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.person) setPerson(json.person)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [personId])

  const load = useCallback(
    async (next: Range) => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/profile/${encodeURIComponent(personId)}/mood?range=${next}`,
        )
        if (!res.ok) {
          setData(null)
          setError('unavailable')
          return
        }
        setData((await res.json()) as Insights)
        setError('')
      } catch {
        setError('failed')
      } finally {
        setLoading(false)
      }
    },
    [personId],
  )

  useEffect(() => {
    // Deferred by a tick so the effect only schedules work; every setState then
    // happens inside the async callback rather than in the effect body.
    const handle = setTimeout(() => void load(range), 0)
    return () => clearTimeout(handle)
  }, [load, range])

  // Derived rather than built inside the fetch: the message depends on who we
  // are looking at, which can arrive after the request does.
  const errorMessage =
    error === 'unavailable'
      ? `${person?.alias ?? 'They'} keep their mood private, so there is nothing to show here.`
      : error === 'failed'
        ? 'Could not load mood insights.'
        : ''

  return (
    <>
      <AppNav title="Mood insights" showBack showMobileHeader={false} />

      <header className="sticky top-0 z-30 border-b border-warm-gray-lighter/60 bg-cream/90 px-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5 hover:text-plum"
          >
            <ChevronLeft size={26} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-[20px] font-bold leading-tight text-charcoal">
              Mood insights
            </h1>
            <p className="truncate text-[13px] text-charcoal/55">
              {person?.alias ?? person?.name ?? '—'}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5 sm:px-6">
        {/* Range tabs */}
        <div className="grid grid-cols-4 gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={cn(
                'rounded-full py-2.5 text-[14px] font-bold transition-colors',
                range === r.key
                  ? 'bg-[#4A2C5E] text-white shadow-[0_4px_14px_rgba(74,44,94,0.28)]'
                  : 'bg-[#EFEBF8] text-charcoal/70 hover:bg-[#E7E1F4]',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height={200} />
            <Skeleton variant="rect" height={220} />
            <Skeleton variant="rect" height={140} />
          </div>
        ) : errorMessage || !data ? (
          <div className="rounded-[22px] bg-white p-8 text-center shadow-[0_8px_28px_rgba(74,44,94,0.07)]">
            <p className="font-heading text-lg font-bold text-charcoal">Nothing to show</p>
            <p className="mt-2 text-sm leading-6 text-charcoal/60">{errorMessage}</p>
            <Link
              href={`/app/profile/${personId}`}
              className="mt-5 inline-flex rounded-full bg-plum px-6 py-3 text-sm font-bold text-white"
            >
              Back to profile
            </Link>
          </div>
        ) : (
          <>
            {/* ── Overall ────────────────────────────────────── */}
            <section className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(74,44,94,0.07)] sm:p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold text-charcoal/50">
                    Overall mood
                    <span title="Averaged from their shared mood check-ins">
                      <Info size={14} className="text-charcoal/35" aria-hidden="true" />
                    </span>
                  </p>
                  <h2 className="mt-2 font-heading text-[24px] font-extrabold leading-tight text-charcoal sm:text-[26px]">
                    {data.headline}
                  </h2>
                  <p className="mt-2 max-w-[15rem] text-[14px] leading-6 text-charcoal/65">
                    {data.summary}
                  </p>
                </div>

                {/* Donut — the progress ring is the percentage itself. */}
                <div className="relative shrink-0">
                  <svg width="124" height="124" viewBox="0 0 124 124" aria-hidden="true">
                    <circle
                      cx="62" cy="62" r="54" fill="none"
                      stroke="#EDE7F8" strokeWidth="13"
                    />
                    <circle
                      cx="62" cy="62" r="54" fill="none"
                      stroke="#4A2C5E" strokeWidth="13" strokeLinecap="round"
                      strokeDasharray={`${(data.positivePct / 100) * 339.29} 339.29`}
                      // Start the arc at 12 o'clock instead of 3.
                      transform="rotate(-90 62 62)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[26px] leading-none">{FACE_BY_PCT(data.positivePct)}</span>
                    <span className="mt-1 font-heading text-[19px] font-extrabold leading-none text-charcoal">
                      {data.positivePct}%
                    </span>
                    <span className="mt-0.5 text-[10.5px] text-charcoal/50">positive days</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Trend ──────────────────────────────────────── */}
            <section className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(74,44,94,0.07)] sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                  <BarChart3 size={19} />
                </span>
                <div>
                  <h2 className="font-heading text-[18px] font-bold text-charcoal">Mood trend</h2>
                  <p className="text-[13px] text-charcoal/50">
                    How their mood has moved across this period.
                  </p>
                </div>
              </div>

              <TrendChart series={data.series} />
            </section>

            {/* ── Breakdown ──────────────────────────────────── */}
            <section className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(74,44,94,0.07)] sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                  <PieChart size={19} />
                </span>
                <div>
                  <h2 className="font-heading text-[18px] font-bold text-charcoal">Mood breakdown</h2>
                  <p className="text-[13px] text-charcoal/50">How their days went.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {data.breakdown.map((b) => (
                  <div key={b.key} className="rounded-[16px] bg-[#F6F3FC] px-3 py-3 text-center">
                    <span className="text-[20px]" aria-hidden="true">
                      {b.key === 'good'
                        ? '😊'
                        : b.key === 'neutral'
                          ? '😐'
                          : b.key === 'bad'
                            ? '😔'
                            : '😰'}
                    </span>
                    <p className="mt-1 text-[12px] font-semibold text-charcoal/60">{b.label}</p>
                    <p className="font-heading text-[19px] font-extrabold text-charcoal">
                      {b.pct}%
                    </p>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[#E4DEF0]">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Patterns ───────────────────────────────────── */}
            {data.patterns.length > 0 && (
              <section className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(74,44,94,0.07)] sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                    <Lightbulb size={19} />
                  </span>
                  <div>
                    <h2 className="font-heading text-[18px] font-bold text-charcoal">
                      Common patterns
                    </h2>
                    <p className="text-[13px] text-charcoal/50">
                      What their shared check-ins actually show.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {data.patterns.map((p, i) => (
                    <div key={p.title} className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                        {i === 0 ? (
                          <Lightbulb size={19} />
                        ) : i === 1 ? (
                          <CalendarDays size={19} />
                        ) : (
                          <TrendingUp size={19} />
                        )}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="font-heading text-[15.5px] font-bold text-charcoal">
                          {p.title}
                        </p>
                        <p className="mt-0.5 text-[13.5px] leading-6 text-charcoal/60">
                          {p.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-warm-gray">
              <Moon size={12} /> Based on {data.total} shared check-in{data.total === 1 ? '' : 's'}.
            </div>
          </>
        )}
      </div>
    </>
  )
}

/**
 * Area chart for the trend.
 *
 * Gaps (days with no check-in) break the line instead of being interpolated
 * across: drawing straight through a day we know nothing about would claim
 * something the data does not say.
 */
function TrendChart({ series }: { series: Insights['series'] }) {
  const points = series.filter((p) => p.value !== null) as {
    label: string
    value: number
  }[]

  if (points.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-charcoal/50">
        Not enough shared check-ins to draw a trend yet.
      </p>
    )
  }

  const W = 320
  const H = 130
  const PAD = 8
  const values = points.map((p) => p.value)
  const min = Math.min(...values) - 0.5
  const max = Math.max(...values) + 0.5
  const span = Math.max(0.1, max - min)

  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2)
  const y = (v: number) => PAD + (1 - (v - min) / span) * (H - PAD * 2)

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ')
  const area = `${line} L${x(points.length - 1)},${H} L${x(0)},${H} Z`

  return (
    <div className="mt-5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[150px] w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0} x2={W}
            y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)}
            stroke="#EFEAF8" strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#moodFill)" />
        <path d={line} fill="none" stroke="#4A2C5E" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r="3.6" fill="#4A2C5E" />
        ))}
        <defs>
          <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C5FD4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7C5FD4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-1.5 flex justify-between">
        {points.map((p, i) => (
          <span key={i} className="text-[11px] font-semibold text-charcoal/45">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}