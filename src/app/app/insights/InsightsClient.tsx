'use client'
import { useEffect, useMemo, useState } from 'react'
import { AppNav } from '../../../components/layout/AppNavContext'
import Skeleton from '../../../components/ui/Skeleton'
import { MOOD_EMOJIS } from '../../../lib/constants'
import { formatDefaultDate, formatShortDate, formatWeekday } from '../../../lib/dates'
import { useIsMobile } from '../../../hooks/useMediaQuery'
import NotoEmoji from '../../../components/ui/NotoEmoji'

type MoodLog = {
  id: string
  mood_score: number
  mood_emoji: string
  note?: string | null
  created_at: string
}

const RANGES = [
  { key: 'week', label: '7 Days', days: 7 },
  { key: 'month', label: '30 Days', days: 30 },
  { key: 'year', label: '3 Months', days: 90 },
] as const

const BAR_COLORS: Record<string, string> = {
  '😔': 'bg-[#6B8CBA]', // Sad — blue
  '😌': 'bg-[#7B9E6B]', // Peaceful — sage
  '😐': 'bg-[#8A8A8A]', // Neutral — gray
  '😤': 'bg-[#C45D3E]', // Frustrated — terracotta
  '😰': 'bg-[#9B6B9E]', // Anxious — purple
  '😊': 'bg-[#E9B94A]', // Happy — gold
}

export default function InsightsPage() {
  const [target, setTarget] = useState<'week' | 'month' | 'year'>('week')
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch('/api/mood')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then((json) => {
        if (!active) return
        setLogs((json.data ?? []) as MoodLog[])
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const isMobile = useIsMobile()
  const days = RANGES.find((r) => r.key === target)?.days ?? 7
  const cutoff = now - days * 86400000
  const filtered = useMemo(() => logs.filter((l) => new Date(l.created_at).getTime() >= cutoff), [logs, cutoff])

  // Daily averages across EVERY day in the range (gaps become null),
  // oldest first — this drives the line chart.
  const timeline = useMemo(() => {
    const byDay = new Map<string, { sum: number; count: number }>()
    for (const log of filtered) {
      const key = new Date(log.created_at).toDateString()
      const entry = byDay.get(key) ?? { sum: 0, count: 0 }
      entry.sum += log.mood_score
      entry.count += 1
      byDay.set(key, entry)
    }
    const out: { day: Date; avg: number | null }[] = []
    const start = new Date(now - (days - 1) * 86400000)
    start.setHours(0, 0, 0, 0)
    for (let i = 0; i < days; i++) {
      const day = new Date(start.getTime() + i * 86400000)
      const entry = byDay.get(day.toDateString())
      out.push({ day, avg: entry ? entry.sum / entry.count : null })
    }
    return out
  }, [filtered, days, now])

  // Compact the label list: show ~6 evenly spaced date labels.
  const labelEvery = Math.max(1, Math.ceil(timeline.length / 6))

  // Distribution by emoji (count of distinct days each feeling was logged).
  const distribution = useMemo(() => {
    const counts = new Map<string, Set<string>>()
    for (const log of filtered) {
      const day = new Date(log.created_at).toDateString()
      const set = counts.get(log.mood_emoji) ?? new Set<string>()
      set.add(day)
      counts.set(log.mood_emoji, set)
    }
    return MOOD_EMOJIS.map((m) => ({
      emoji: m.emoji,
      label: m.label,
      days: counts.get(m.emoji)?.size ?? 0,
    }))
      .filter((d) => d.days > 0)
      .sort((a, b) => b.days - a.days)
  }, [filtered])
  const maxDistDays = Math.max(1, ...distribution.map((d) => d.days))

  const avg = filtered.length
    ? (filtered.reduce((sum, l) => sum + l.mood_score, 0) / filtered.length).toFixed(1)
    : '—'
  const avgEmoji = filtered.length
    ? MOOD_EMOJIS.slice().sort((a, b) => Math.abs(a.score - Number(avg)) - Math.abs(b.score - Number(avg)))[0]
    : null
  const checkinDays = new Set(filtered.map((l) => new Date(l.created_at).toDateString())).size

  // Best day = logged day with the highest average mood.
  const loggedDays = useMemo(() => timeline.filter((t): t is { day: Date; avg: number } => t.avg !== null), [timeline])
  const bestDay = loggedDays.length
    ? loggedDays.reduce((best, t) => (t.avg > best.avg ? t : best), loggedDays[0])
    : null

  // Trend takeaway: compare the last 3 logged days to the previous 3.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const takeaway = useMemo(() => {
    if (loggedDays.length < 2) return null
    const recent = loggedDays.slice(-3)
    const older = loggedDays.slice(-6, -3)
    if (older.length === 0) return null
    const recentAvg = recent.reduce((s, t) => s + t.avg, 0) / recent.length
    const olderAvg = older.reduce((s, t) => s + t.avg, 0) / older.length
    if (recentAvg > olderAvg + 0.2) return 'Your mood has been steadily improving over the recent check-ins. Keep going gently.'
    if (recentAvg < olderAvg - 0.2) return 'The last few days feel heavier than before. That is okay — notice it without judgment.'
    return 'Your mood has held steady across recent check-ins. Consistency itself is a win.'
  }, [loggedDays])

  return (
    <>
      <AppNav title="Insights" />
      <div className="page-enter space-y-6 pb-8">
        {/* ── Hero with header background ─────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/insights-header.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative px-6 py-7 sm:px-8">
            <h1 className="font-display text-[40px] font-bold leading-[1.1] sm:text-[46px]">
              <span className="block text-[#2A1B3D]">Wellbeing</span>
              <span className="block bg-gradient-to-r from-[#C45D3E] via-[#C98BB8] to-[#6B4A80] bg-clip-text text-transparent">Insights</span>
            </h1>
            <p className="mt-3 max-w-sm text-[15px] leading-6 text-charcoal/80">
              Non-diagnostic patterns and trends from your head space reflections.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setTarget(r.key)}
                  className={
                    target === r.key
                      ? 'rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#A8546B] px-6 py-2.5 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(91,75,158,0.3)]'
                      : 'rounded-full bg-white/90 px-6 py-2.5 text-[14px] font-bold text-charcoal shadow-[0_2px_10px_rgba(74,44,94,0.08)] backdrop-blur-sm transition-transform hover:-translate-y-0.5'
                  }
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height={220} />
            <Skeleton variant="rect" height={160} />
          </div>
        ) : (
          <>
            {/* Timeline — mood line chart */}
            <div className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white shadow-[0px_4px_16px_#4A2C5E08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/insights-chart-bg.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
              />
              <div className="pointer-events-none absolute inset-0 bg-white/60" aria-hidden="true" />
              <div className="relative p-5 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-heading text-[22px] font-bold text-[#4A2C6E]">Your head space timeline</h2>
                  <span className="flex items-center gap-3 text-[12px] font-semibold text-charcoal/70">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sage" /> Good</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-plum-light" /> Okay</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-terracotta" /> Heavy</span>
                  </span>
                </div>
                {timeline.every((t) => t.avg === null) ? (
                  <p className="py-10 text-center text-sm text-warm-gray">
                    No check-ins in this range yet. Log a mood from the dashboard and your timeline will appear here.
                  </p>
                ) : (
                  <>
                    <MoodLineChart
                      data={timeline}
                      // The viewBox width must track the rendered width, or the
                      // SVG scales the whole chart down: at a fixed 720 on a
                      // 330px phone the chart rendered ~92px tall with 4px text.
                      width={isMobile ? 360 : 720}
                      height={isMobile ? 240 : 280}
                      compact={isMobile}
                      // Fewer date labels on a phone — at the desktop count
                      // they collide once the chart is only ~330px wide.
                      labelEvery={isMobile ? Math.max(1, Math.ceil(timeline.length / 4)) : labelEvery}
                    />
                    <div className="mb-5 mt-4 h-px bg-warm-gray-lighter" />
                    {takeaway && (
                      <p className="text-sm leading-6 text-charcoal">
                        <span className="font-bold text-plum">Takeaway: </span>
                        {takeaway}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-6">
              {/* Mood distribution */}
              <div className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white shadow-[0px_4px_16px_#4A2C5E08]">
                {/* soft waves + leaves background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/insights-dist-bg.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-white/40" aria-hidden="true" />
                <div className="relative p-5 sm:p-7">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="font-heading text-[22px] font-bold text-[#4A2C6E]">Mood distribution</h2>
                      <p className="mt-1 text-[13px] text-warm-gray">How you&apos;ve been feeling this week</p>
                    </div>
                  </div>
                  {distribution.length === 0 ? (
                    <p className="py-6 text-sm text-warm-gray">No data in this range yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {distribution.map((d) => (
                        <div key={d.label} className="flex items-center gap-4">
                          <span className="flex w-24 shrink-0 items-center gap-2 text-[15px] font-semibold text-charcoal">
                            <NotoEmoji emoji={d.emoji} size={22} />
                            {d.label}
                          </span>
                          <div className="h-2.5 flex-1 rounded-full bg-[#EFE6DC]">
                            <div className={`h-2.5 rounded-full ${BAR_COLORS[d.emoji] ?? 'bg-plum'}`} style={{ width: `${(d.days / maxDistDays) * 100}%` }} />
                          </div>
                          <span className="w-16 shrink-0 text-right text-[14px] font-bold text-[#80698A]">{d.days} day{d.days === 1 ? '' : 's'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reflection metrics — themed stat rows */}
              <div className="rounded-[24px] border border-warm-gray-lighter bg-white p-5 shadow-[0px_4px_16px_#4A2C5E08] sm:p-7">
                <div className="mb-5">
                  <h2 className="font-heading text-[22px] font-bold">
                    <span className="text-[#4A2C6E]">Your reflection </span>
                    <span className="text-[#C4506B]">metrics</span>
                  </h2>
                  <p className="mt-1 text-[13px] text-warm-gray">A quick snapshot from your entries.</p>
                </div>
                <div className="space-y-3">
                  {/* Average Mood — purple */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F3EFFB] to-[#EFEAFB] p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/insights-stat-purple.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[38%] object-cover object-right opacity-70" />
                    <div className="relative flex items-center gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4DBF7] text-xl"><NotoEmoji emoji="🧠" size={24} /></span>
                      <span className="flex-1 text-[15px] font-semibold text-charcoal">Average Mood</span>
                      <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-[14px] font-bold text-[#5B3E8E]">
                        {avgEmoji ? <><NotoEmoji emoji={avgEmoji.emoji} size={16} /> {avgEmoji.label}</> : '—'}
                      </span>
                    </div>
                  </div>
                  {/* Best Day — blue */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EAF1FB] to-[#E7EEFA] p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/insights-stat-blue.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[38%] object-cover object-right opacity-70" />
                    <div className="relative flex items-center gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D9E5F9] text-xl"><NotoEmoji emoji="📅" size={24} /></span>
                      <span className="flex-1 text-[15px] font-semibold text-charcoal">Best Day</span>
                      <span className="rounded-full bg-white/70 px-4 py-1.5 text-[14px] font-bold text-[#3E5FA8]">
                        {bestDay ? formatWeekday(bestDay.day) : '—'}
                      </span>
                    </div>
                  </div>
                  {/* Check-in Days — peach */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FBEDE7] to-[#FAE9E4] p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/insights-stat-peach.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[38%] object-cover object-right opacity-70" />
                    <div className="relative flex items-center gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F8DCCF] text-xl"><NotoEmoji emoji="🔥" size={24} /></span>
                      <span className="flex-1 text-[15px] font-semibold text-charcoal">Check-in Days</span>
                      <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-[14px] font-bold text-[#B5472F]">
                        {checkinDays} day{checkinDays === 1 ? '' : 's'} <NotoEmoji emoji="🔥" size={15} />
                      </span>
                    </div>
                  </div>
                  {/* Total Check-ins — green */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E9F5EB] to-[#E6F4E9] p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/insights-stat-green.png" alt="" aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[38%] object-cover object-right opacity-70" />
                    <div className="relative flex items-center gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#CFEBD6] text-xl"><NotoEmoji emoji="📊" size={24} /></span>
                      <span className="flex-1 text-[15px] font-semibold text-charcoal">Total Check-ins</span>
                      <span className="rounded-full bg-white/70 px-4 py-1.5 text-[14px] font-bold text-[#2E7D4F]">
                        {filtered.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

/**
 * Colors for a mood average: sage (good) → plum (okay) → terracotta (heavy).
 *
 * Thresholds are the same 1–10 bands the profile mood page and the API use
 * (`good ≥ 7`, `neutral ≥ 5`), so a score cannot read "good" in one place and
 * "okay" in another.
 */
function moodColor(avg: number) {
  if (avg >= 7) return '#7B9E6B'
  if (avg >= 5) return '#6B4A80'
  return '#C45D3E'
}

/**
 * SVG line chart of daily mood averages. Gaps (no check-in) are spanned by
 * the line but not filled; dots + value labels mark real check-in days.
 */
function MoodLineChart({
  data,
  width,
  height,
  compact,
  labelEvery,
}: {
  data: { day: Date; avg: number | null }[]
  width: number
  height: number
  /** Phone rendering: bigger type and dots, since the SVG no longer shrinks. */
  compact?: boolean
  labelEvery: number
}) {
  const W = width
  const H = height
  const PAD = compact
    ? { top: 24, right: 10, bottom: 26, left: 26 }
    : { top: 30, right: 18, bottom: 30, left: 34 }
  const iw = W - PAD.left - PAD.right
  const ih = H - PAD.top - PAD.bottom

  const font = compact ? 11 : 9.5
  const dotR = compact ? 5 : 4.5

  const x = (i: number) => PAD.left + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw)
  const y = (v: number) => PAD.top + ih - ((v - 1) / 9) * ih // score 1..10

  const points = data
    .map((t, i) => ({ ...t, i, x: x(i), y: t.avg !== null ? y(t.avg) : null }))
  type RealPoint = { day: Date; avg: number; i: number; x: number; y: number }
  const real = points.filter((p): p is RealPoint => p.y !== null && p.avg !== null)

  // Smooth curve through real points using Catmull-Rom → cubic Bézier.
  // (Plain computation — the chart re-renders only when data changes, so
  // memoization is unnecessary and React Compiler dislikes `real` deps.)
  //
  // The control points are clamped to the segment they belong to. Raw
  // Catmull-Rom overshoots: around a sharp dip it sends the curve *below* the
  // lowest value, which drew a dip that hung under the "1" gridline. Clamping
  // keeps the curve monotone between any two points, so it can never leave
  // the 1–10 band.
  const linePath = (() => {
    if (real.length === 0) return ''
    if (real.length === 1) return `M${real[0].x.toFixed(1)},${real[0].y.toFixed(1)}`
    const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
    let d = `M${real[0].x.toFixed(1)},${real[0].y.toFixed(1)}`
    for (let i = 0; i < real.length - 1; i++) {
      const p0 = real[Math.max(0, i - 1)]
      const p1 = real[i]
      const p2 = real[i + 1]
      const p3 = real[Math.min(real.length - 1, i + 2)]
      const lo = Math.min(p1.y, p2.y)
      const hi = Math.max(p1.y, p2.y)
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = clamp(p1.y + (p2.y - p0.y) / 6, lo, hi)
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = clamp(p2.y - (p3.y - p1.y) / 6, lo, hi)
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }
    return d
  })()
  // Area under the curved line down to baseline (score 1).
  const areaPath =
    real.length > 1
      ? `${linePath} L${real[real.length - 1].x.toFixed(1)},${(PAD.top + ih).toFixed(1)} L${real[0].x.toFixed(1)},${(PAD.top + ih).toFixed(1)} Z`
      : ''

  const gridLines = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Mood timeline chart">
      {/* Grid + y-axis labels */}
      {gridLines.map((v) => (
        <g key={v}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="#E8E0D8"
            strokeWidth={1}
            strokeDasharray={v === 5 ? '0' : '3 4'}
          />
          <text x={PAD.left - 7} y={y(v) + font / 3} textAnchor="end" fontSize={font} fill="#B0B0B0">
            {v}
          </text>
        </g>
      ))}

      {/* Area fill */}
      {areaPath && <path d={areaPath} fill="url(#moodGrad)" opacity={0.35} />}
      <defs>
        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6B4A80" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#6B4A80" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Line */}
      {real.length > 1 && <path d={linePath} fill="none" stroke="#6B4A80" strokeWidth={compact ? 3 : 2.5} strokeLinejoin="round" strokeLinecap="round" />}

      {/* Dots + value labels on real check-in days */}
      {real.map((p) => (
        <g key={p.day.toISOString()}>
          <circle cx={p.x} cy={p.y} r={dotR} fill={moodColor(p.avg)} stroke="#fff" strokeWidth={2} />
          <text x={p.x} y={p.y - dotR - 5} textAnchor="middle" fontSize={font} fontWeight={600} fill={moodColor(p.avg)}>
            {p.avg.toFixed(1)}
          </text>
        </g>
      ))}

      {/* X-axis date labels, evenly thinned */}
      {points.map((p, i) =>
        i % labelEvery === 0 || i === points.length - 1 ? (
          <text
            key={`lbl-${p.day.toISOString()}`}
            x={p.x}
            y={H - 8}
            textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
            fontSize={font}
            fill="#80698A"
          >
            {formatShortDate(p.day)}
          </text>
        ) : null,
      )}
    </svg>
  )
}
