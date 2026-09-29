'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Flame,
  Smile,
  CalendarDays,
  Download,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import { MOOD_EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const PERIODS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
]

const SERIES: Record<string, { label: string; score: number }[]> = {
  week: [
    { label: 'Mon', score: 3 },
    { label: 'Tue', score: 4 },
    { label: 'Wed', score: 2 },
    { label: 'Thu', score: 4 },
    { label: 'Fri', score: 5 },
    { label: 'Sat', score: 4 },
    { label: 'Sun', score: 3.5 },
  ],
  month: [
    { label: 'W1', score: 3.2 },
    { label: 'W2', score: 3.8 },
    { label: 'W3', score: 2.9 },
    { label: 'W4', score: 4.2 },
  ],
  year: [
    { label: 'Jan', score: 3 }, { label: 'Feb', score: 3.4 }, { label: 'Mar', score: 3.1 },
    { label: 'Apr', score: 3.8 }, { label: 'May', score: 4.1 }, { label: 'Jun', score: 3.6 },
    { label: 'Jul', score: 4.3 }, { label: 'Aug', score: 4.0 }, { label: 'Sep', score: 4.4 },
    { label: 'Oct', score: 3.9 }, { label: 'Nov', score: 4.2 }, { label: 'Dec', score: 4.5 },
  ],
}

const DISTRIBUTION = [
  { label: 'Happy', pct: 34 },
  { label: 'Peaceful', pct: 26 },
  { label: 'Neutral', pct: 18 },
  { label: 'Anxious', pct: 12 },
  { label: 'Sad', pct: 6 },
  { label: 'Frustrated', pct: 4 },
]

const PATTERNS = [
  { icon: Sun, title: 'Mornings are brighter', text: 'Your mood tends to peak before noon. Consider scheduling harder tasks early.', tint: 'from-terracotta to-terracotta-light' },
  { icon: CalendarDays, title: 'Midweek dips', text: 'Wednesdays are consistently lower. A planned break might help.', tint: 'from-plum to-plum-light' },
  { icon: Moon, title: 'Better sleep, better days', text: 'Entries mentioning good sleep score 20% higher on average.', tint: 'from-sage to-sage-light' },
]

const STATS = [
  { icon: Smile, value: '4.1', label: 'Average mood', trend: '+0.3', up: true },
  { icon: Flame, value: '7', label: 'Day streak', trend: '+2', up: true },
  { icon: BarChart3, value: '24', label: 'Check-ins', trend: '+5', up: true },
  { icon: TrendingUp, value: '78%', label: 'Positive days', trend: '+6%', up: true },
]

/* Build a smooth-ish area/line path from scores (1–5) across an SVG viewbox. */
function useChart(data: { label: string; score: number }[]) {
  return useMemo(() => {
    const W = 100
    const H = 100
    const max = 5
    const min = 1
    const step = data.length > 1 ? W / (data.length - 1) : W
    const pts = data.map((d, i) => {
      const x = i * step
      const y = H - ((d.score - min) / (max - min)) * (H - 12) - 6
      return [x, y] as const
    })
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
    const area = `${line} L${W},${H} L0,${H} Z`
    return { pts, line, area, W, H }
  }, [data])
}

export default function InsightsPage() {
  const [period, setPeriod] = useState('week')
  const data = SERIES[period]
  const { pts, line, area, W, H } = useChart(data)

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
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-plum to-terracotta">
                <BarChart3 className="h-5 w-5 text-cream" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-charcoal">Insights</h1>
                <p className="text-sm text-warm-gray">Understand your patterns</p>
              </div>
            </div>
            <button
              type="button"
              className="hidden items-center gap-2 rounded-xl border border-warm-gray-lighter bg-white px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-cream-dark sm:flex"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
          {/* Period selector */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            <Tabs tabs={PERIODS} active={period} onChange={setPeriod} />
          </motion.div>

          {/* Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            {STATS.map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-plum/10 text-plum">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="font-heading text-2xl font-bold text-charcoal">{s.value}</p>
                  <span className={cn('text-xs font-semibold', s.up ? 'text-sage' : 'text-terracotta')}>{s.trend}</span>
                </div>
                <p className="text-xs text-warm-gray">{s.label}</p>
              </div>
            ))}
          </motion.section>

          {/* Mood trend chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="glass-card rounded-3xl p-5 md:p-7">
              <h2 className="font-heading text-lg font-bold text-charcoal">Mood trend</h2>
              <p className="mb-5 text-sm text-warm-gray">Average mood over the {period}</p>

              <div className="relative w-full" style={{ aspectRatio: '16 / 7' }}>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="moodArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C45D3E" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#4A2C5E" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="moodLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4A2C5E" />
                      <stop offset="100%" stopColor="#C45D3E" />
                    </linearGradient>
                  </defs>
                  {[0, 25, 50, 75, 100].map((g) => (
                    <line key={g} x1="0" y1={g} x2={W} y2={g} stroke="#8A8A8A" strokeOpacity="0.12" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                  ))}
                  <motion.path
                    d={area}
                    fill="url(#moodArea)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  />
                  <motion.path
                    d={line}
                    fill="none"
                    stroke="url(#moodLine)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {pts.map(([x, y], i) => (
                    <motion.circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="1.6"
                      fill="#fff"
                      stroke="#C45D3E"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.04 }}
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-2 flex justify-between">
                {data.map((d) => (
                  <span key={d.label} className="flex-1 text-center text-xs text-warm-gray">{d.label}</span>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Distribution + patterns */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Mood distribution */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card h-full rounded-3xl p-5 md:p-6">
                <h2 className="mb-5 font-heading text-lg font-bold text-charcoal">Mood distribution</h2>
                <div className="space-y-3.5">
                  {DISTRIBUTION.map((d, i) => {
                    const m = MOOD_EMOJIS.find((x) => x.label === d.label)
                    return (
                      <div key={d.label} className="flex items-center gap-3">
                        <span className="w-6 text-lg">{m?.emoji}</span>
                        <span className="w-20 text-sm text-charcoal">{d.label}</span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-dark">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${d.pct}%` }}
                            transition={{ delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: m?.color ?? '#8A8A8A' }}
                          />
                        </div>
                        <span className="w-9 text-right text-sm font-medium text-warm-gray">{d.pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.section>

            {/* Patterns */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-plum" />
                <h2 className="font-heading text-lg font-bold text-charcoal">Patterns we noticed</h2>
              </div>
              <div className="space-y-3">
                {PATTERNS.map((p) => (
                  <div key={p.title} className="glass-card flex items-start gap-4 rounded-2xl p-4">
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-cream', p.tint)}>
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-charcoal">{p.title}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-warm-gray">{p.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
