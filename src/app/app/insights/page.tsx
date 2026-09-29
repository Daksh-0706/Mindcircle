'use client'
import { useEffect, useMemo, useState } from 'react'
import { AppNav } from '../../../components/layout/AppNavContext'
import Skeleton from '../../../components/ui/Skeleton'
import { TrendingUp } from 'lucide-react'
import { MOOD_EMOJIS } from '../../../lib/constants'
import { formatDefaultDate, formatShortDate, formatWeekday } from '../../../lib/dates'

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
  '😌': 'bg-plum',
  '😊': 'bg-sage',
  '😐': 'bg-plum-light',
  '😤': 'bg-terracotta',
  '😰': 'bg-terracotta-light',
  '😔': 'bg-warm-gray',
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

  const days = RANGES.find((r) => r.key === target)?.days ?? 7
  const cutoff = now - days * 86400000
  const filtered = useMemo(() => logs.filter((l) => new Date(l.created_at).getTime() >= cutoff), [logs, cutoff])

  // Daily averages, oldest first, for the timeline bars.
  const timeline = useMemo(() => {
    const byDay = new Map<string, { sum: number; count: number }>()
    for (const log of filtered) {
      const key = new Date(log.created_at).toDateString()
      const entry = byDay.get(key) ?? { sum: 0, count: 0 }
      entry.sum += log.mood_score
      entry.count += 1
      byDay.set(key, entry)
    }
    return [...byDay.entries()]
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-14)
      .map(([day, v]) => ({ day: new Date(day), avg: v.sum / v.count }))
  }, [filtered])

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

  // Best day = day with the highest average mood.
  const bestDay = timeline.length
    ? timeline.reduce((best, t) => (t.avg > best.avg ? t : best), timeline[0])
    : null

  // Trend takeaway: compare the last 3 logged days to the previous 3.
  const takeaway = useMemo(() => {
    if (timeline.length < 2) return null
    const recent = timeline.slice(-3)
    const older = timeline.slice(-6, -3)
    if (older.length === 0) return null
    const recentAvg = recent.reduce((s, t) => s + t.avg, 0) / recent.length
    const olderAvg = older.reduce((s, t) => s + t.avg, 0) / older.length
    if (recentAvg > olderAvg + 0.2) return 'Your mood has been steadily improving over the recent check-ins. Keep going gently.'
    if (recentAvg < olderAvg - 0.2) return 'The last few days feel heavier than before. That is okay — notice it without judgment.'
    return 'Your mood has held steady across recent check-ins. Consistency itself is a win.'
  }, [timeline])

  return (
    <>
      <AppNav title="Insights" />
      <div className="page-enter space-y-8 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-[32px] font-bold text-plum">Wellbeing Insights</h1>
            <p className="mt-1 text-sm text-charcoal">Non-diagnostic patterns and trends from your head space reflections.</p>
          </div>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setTarget(r.key)}
                className={target === r.key ? 'rounded-full bg-plum px-4 py-2 text-[13px] font-bold text-white' : 'rounded-full border border-warm-gray-lighter px-4 py-2 text-[13px] font-bold text-plum'}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height={220} />
            <Skeleton variant="rect" height={160} />
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="rounded-[20px] border border-warm-gray-lighter bg-white p-7">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-plum">
                  Your head space timeline (last {Math.max(timeline.length, 1)} check-in day{timeline.length === 1 ? '' : 's'})
                </h2>
                <span className="flex items-center gap-1.5 text-xs text-warm-gray">
                  <TrendingUp size={12} /> Mood level
                </span>
              </div>
              {timeline.length === 0 ? (
                <p className="py-10 text-center text-sm text-warm-gray">
                  No check-ins in this range yet. Log a mood from the dashboard and your timeline will appear here.
                </p>
              ) : (
                <>
                  <div className="flex h-36 items-end gap-2 sm:gap-3">
                    {timeline.map((t) => (
                      <div key={t.day.toISOString()} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                        <span className="text-[11px] text-warm-gray">{t.avg.toFixed(1)}</span>
                        <div
                          className={`w-full max-w-[40px] rounded-t-lg ${BAR_COLORS['😌']}`}
                          style={{ height: `${Math.max(8, (t.avg / 5) * 100)}%`, backgroundColor: t.avg >= 4 ? '#7B9E6B' : t.avg >= 3 ? '#6B4A80' : '#C45D3E' }}
                          title={formatDefaultDate(t.day)}
                        />
                        <span className="w-full truncate text-center text-[10px] text-[#80698A]">
                          {formatShortDate(t.day)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mb-5 mt-4 h-px bg-warm-gray-lighter" />
                  {takeaway && (
                    <p className="text-sm text-charcoal">
                      <span className="font-bold text-plum">Takeaway: </span>
                      {takeaway}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-2">
              {/* Mood distribution */}
              <div className="rounded-[20px] border border-warm-gray-lighter bg-white p-7">
                <h2 className="mb-5 font-heading text-lg font-bold text-plum">Mood distribution</h2>
                {distribution.length === 0 ? (
                  <p className="py-6 text-sm text-warm-gray">No data in this range yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {distribution.map((d) => (
                      <div key={d.label} className="flex items-center gap-4">
                        <span className="w-24 shrink-0 text-[13px] font-bold text-charcoal">{d.label}</span>
                        <div className="h-2 flex-1 rounded bg-cream-dark">
                          <div className={`h-2 rounded ${BAR_COLORS[d.emoji] ?? 'bg-plum'}`} style={{ width: `${(d.days / maxDistDays) * 100}%` }} />
                        </div>
                        <span className="w-16 shrink-0 text-right text-[13px] text-[#80698A]">{d.days} day{d.days === 1 ? '' : 's'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reflection metrics */}
              <div className="rounded-[20px] border border-warm-gray-lighter bg-white p-7">
                <h2 className="mb-5 font-heading text-lg font-bold text-plum">Your reflection metrics</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-sm text-charcoal">Average Mood</span>
                    <span className="text-sm font-bold text-plum">{avgEmoji ? `${avgEmoji.label} ${avgEmoji.emoji}` : '—'}</span>
                  </div>
                  <div className="h-px bg-warm-gray-lighter" />
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-charcoal">Best Day</span>
                    <span className="text-sm font-bold text-plum">
                      {bestDay ? formatWeekday(bestDay.day) : '—'}
                    </span>
                  </div>
                  <div className="h-px bg-warm-gray-lighter" />
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-charcoal">Check-in Days</span>
                    <span className="text-sm font-bold text-plum">{checkinDays} day{checkinDays === 1 ? '' : 's'} 🔥</span>
                  </div>
                  <div className="h-px bg-warm-gray-lighter" />
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-charcoal">Total Check-ins</span>
                    <span className="text-sm font-bold text-plum">{filtered.length}</span>
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
