import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, serverError } from '@/lib/security'
import { asEnum } from '@/lib/security'

type Range = '1w' | '1m' | '3m' | '1y'

const RANGE_DAYS: Record<Range, number> = { '1w': 7, '1m': 30, '3m': 90, '1y': 365 }

type Log = {
  created_at: string
  mood_score: number
}

/** Buckets the design shows in "Mood breakdown". */
const BANDS = [
  { key: 'good', label: 'Good', min: 7, color: '#2E9E4F' },
  { key: 'neutral', label: 'Neutral', min: 5, color: '#8A8A8A' },
  { key: 'bad', label: 'Bad', min: 3, color: '#E23D6B' },
  { key: 'stressed', label: 'Stressed', min: 0, color: '#C9A227' },
] as const

function bandOf(score: number) {
  return BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1]
}

/**
 * GET /api/profile/[id]/mood?range=1w|1m|3m|1y
 *
 * Mood trends for someone I am connected with, *if* they opted in to sharing
 * (users.share_moods). The read is filtered by RLS as well as checked here, so
 * the opt-in cannot be bypassed by calling this endpoint directly.
 *
 * Returns aggregates only — never the individual log entries or their notes.
 * Notes are journal text; a chart has no use for them, and returning them would
 * make this an export feature wearing a chart's clothes.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const personId = asUuid(id)
  if (!personId || personId === user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const range = asEnum(searchParams.get('range'), Object.keys(RANGE_DAYS) as Range[]) ?? '1w'
  const days = RANGE_DAYS[range]
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()

  // Only these three columns are read, so notes never leave the database.
  const { data, error } = await supabase
    .from('mood_logs')
    .select('created_at, mood_score')
    .eq('user_id', personId)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(2000)

  if (error) {
    return serverError('mood insights', error)
  }

  // An empty array is what RLS returns when the viewer is not allowed to read
  // these rows, so we cannot tell "no data" from "not shared". Both are hidden
  // behind the same message on purpose.
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'unavailable' }, { status: 404 })
  }

  return NextResponse.json(buildInsights(data as Log[], days, range))
}

/**
 * Aggregates raw logs into what the design renders.
 *
 * Split out from the route so the maths is readable and testable on its own:
 * everything here is pure and depends only on its arguments.
 */
function buildInsights(logs: Log[], days: number, range: Range) {
  const total = logs.length
  const scores = logs.map((l) => l.mood_score)
  const average = scores.reduce((a, b) => a + b, 0) / total

  const goodCount = scores.filter((s) => s >= 7).length
  const positivePct = Math.round((goodCount / total) * 100)

  // ── Trend series ────────────────────────────────────────────────
  // One point per day for a week; for longer ranges the points are bucketed
  // into equal spans so a chart never has more points than it can draw.
  const buckets = range === '1w' ? 7 : days <= 30 ? 7 : days <= 90 ? 9 : 12
  const now = Date.now()
  const spanStart = now - days * 24 * 3600 * 1000
  const bucketMs = (now - spanStart) / buckets

  const series = Array.from({ length: buckets }, (_, i) => {
    const from = spanStart + i * bucketMs
    const to = from + bucketMs
    const inBucket = logs.filter((l) => {
      const t = new Date(l.created_at).getTime()
      return t >= from && (i === buckets - 1 ? t <= to : t < to)
    })
    const avg = inBucket.length
      ? inBucket.reduce((a, l) => a + l.mood_score, 0) / inBucket.length
      : null
    const at = new Date(from)
    return {
      at: at.toISOString(),
      // Single-letter day labels for a week read better than short dates.
      label: range === '1w'
        ? at.toLocaleDateString(undefined, { weekday: 'short' })
        : at.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: avg === null ? null : Math.round(avg * 10) / 10,
    }
  })

  // ── Breakdown ───────────────────────────────────────────────────
  const counts = new Map(BANDS.map((b) => [b.key, 0]))
  for (const s of scores) counts.set(bandOf(s).key, (counts.get(bandOf(s).key) ?? 0) + 1)

  const breakdown = BANDS.map((b) => ({
    key: b.key,
    label: b.label,
    color: b.color,
    pct: Math.round(((counts.get(b.key) ?? 0) / total) * 100),
  }))

  // ── Patterns ────────────────────────────────────────────────────
  // Each pattern states something the data actually shows. Anything the data
  // does not support is left out rather than filled with a pleasant default.
  const patterns: { title: string; detail: string }[] = []

  const morning = logs.filter((l) => new Date(l.created_at).getHours() < 12)
  const evening = logs.filter((l) => new Date(l.created_at).getHours() >= 18)
  if (morning.length >= 2 && evening.length >= 2) {
    const avg = (xs: Log[]) => xs.reduce((a, l) => a + l.mood_score, 0) / xs.length
    if (avg(evening) - avg(morning) >= 0.4) {
      patterns.push({
        title: 'Better moods in the evening',
        detail: 'Their mood tends to be higher after 6 PM.',
      })
    }
  }

  // Compare each weekday against the mean, using at least a couple of samples
  // so one unusual Tuesday does not become a "pattern".
  const byWeekday = new Map<number, number[]>()
  for (const l of logs) {
    const d = new Date(l.created_at).getDay()
    byWeekday.set(d, [...(byWeekday.get(d) ?? []), l.mood_score])
  }
  let worstDay: { day: number; avg: number } | null = null
  for (const [day, xs] of byWeekday) {
    if (xs.length < 2) continue
    const dayAvg = xs.reduce((a, b) => a + b, 0) / xs.length
    if (dayAvg < average - 0.4 && (!worstDay || dayAvg < worstDay.avg)) {
      worstDay = { day, avg: dayAvg }
    }
  }
  if (worstDay && total >= 5) {
    patterns.push({
      title: `Slight dip on ${new Date(2024, 0, 7 + worstDay.day).toLocaleDateString(undefined, { weekday: 'long' })}s`,
      detail: 'That day is usually a bit tougher for them.',
    })
  }

  if (series.length >= 4) {
    const points = series.filter((p) => p.value !== null) as { value: number }[]
    if (points.length >= 4) {
      const half = Math.floor(points.length / 2)
      const early = points.slice(0, half).reduce((a, p) => a + p.value, 0) / half
      const late = points.slice(-half).reduce((a, p) => a + p.value, 0) / half
      if (late - early >= 0.5) {
        patterns.push({
          title: 'Overall improving trend',
          detail: 'Their mood has been getting better over this period.',
        })
      } else if (early - late >= 0.8) {
        patterns.push({
          title: 'A dip lately',
          detail: 'Their mood has been lower towards the end of this period.',
        })
      }
    }
  }

  return {
    range,
    total,
    average: Math.round(average * 10) / 10,
    positivePct,
    headline: positivePct >= 70 ? 'Mostly positive' : positivePct >= 45 ? 'Mixed' : 'Tough stretch',
    summary:
      positivePct >= 70
        ? 'They have had more good days than rough ones in this period.'
        : positivePct >= 45
          ? 'Their days in this period have been fairly balanced.'
          : 'This has been a harder stretch for them.',
    series,
    breakdown,
    patterns,
  }
}