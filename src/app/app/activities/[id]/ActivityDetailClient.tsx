'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { AppNav } from '../../../../components/layout/AppNavContext'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { ArrowLeft, Clock3, Pause, Play, Sparkles, Wind } from 'lucide-react'
import NotoEmoji from '../../../../components/ui/NotoEmoji'

const MEDITATION_SECONDS = 5 * 60 // 5:00

const details: Record<string, { title: string; description: string; duration: string; emoji: string; steps: string[] }> = {
  meditation: { title: '5-Minute Meditation', description: 'A short reset to help you return to the present moment.', duration: '5 minutes', emoji: '🧘', steps: ['Find a comfortable position.', 'Notice three slow breaths.', 'Let thoughts come and go without following them.'] },
  gratitude: { title: 'Gratitude Journaling', description: 'Shift your attention toward the small things that are carrying you.', duration: '10 minutes', emoji: '🌻', steps: ['Name one thing that felt good today.', 'Write why it mattered to you.', 'Notice how your body feels as you remember it.'] },
  breathing: { title: 'Breathing Exercise', description: 'Use a steady 4-7-8 rhythm to help your body soften.', duration: '3 minutes', emoji: '🌬️', steps: ['Breathe in for 4 counts.', 'Hold gently for 7 counts.', 'Exhale slowly for 8 counts.'] },
  nature: { title: 'Nature Walk', description: 'A mindful walk to reconnect with your senses and surroundings.', duration: '15 minutes', emoji: '🌿', steps: ['Look for five things you can see.', 'Notice four things you can feel.', 'Take one unhurried step at a time.'] },
  creative: { title: 'Creative Expression', description: 'Make something without judging the result.', duration: '20 minutes', emoji: '🎨', steps: ['Choose a colour that matches your mood.', 'Draw or write continuously for five minutes.', 'Keep what feels meaningful and let go of the rest.'] },
  detox: { title: 'Digital Detox', description: 'A quiet pause from notifications and scrolling.', duration: '30 minutes', emoji: '📵', steps: ['Put your phone on silent.', 'Choose one offline activity.', 'Return when you feel more settled.'] },
}

/**
 * 5-Minute Meditation — hero designed around the meditation-grad.webp
 * background (image 2/3 from the reference): lavender → peach → indigo.
 * Kept the app's cream/plum palette so the rest of the app stays in sync.
 */
function MeditationPage() {
  const [started, setStarted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(MEDITATION_SECONDS)
  const [paused, setPaused] = useState(false)
  const activity = details.meditation

  const done = secondsLeft <= 0

  const resetTimer = useCallback(() => {
    setSecondsLeft(MEDITATION_SECONDS)
    setPaused(false)
  }, [])

  // Countdown: ticks every second while the session runs and isn't paused.
  useEffect(() => {
    if (!started || paused || done) return
    const id = setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => clearInterval(id)
  }, [started, paused, done])

  // Starting a session (re)starts the clock at 5:00 and keeps the panel open.
  const startSession = useCallback(() => {
    resetTimer()
    setStarted(true)
  }, [resetTimer])

  const stepCards = [
    { n: '01', title: 'Settle in', body: activity.steps[0] },
    { n: '02', title: 'Breathe slowly', body: activity.steps[1] },
    { n: '03', title: 'Let thoughts pass', body: activity.steps[2] },
  ]

  return (
    <>
      <AppNav title={activity.title} showBack />
      <div className="page-enter mx-auto max-w-4xl px-4 pb-10 sm:px-6">
        <Link
          href="/app/activities"
          className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-plum"
        >
          <ArrowLeft size={16} /> Back to activities
        </Link>

        {/* ── Hero card · gradient background block ─────────────── */}
        <section className="relative mt-4 overflow-hidden rounded-[28px] shadow-[0_8px_32px_rgba(74,44,94,0.14)]">
          {/* gradient background from the reference (images 2/3) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/activities/meditation-grad.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          {/* soft overlay keeps the cream/plum copy readable */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/55 to-white/20"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-5 p-5 sm:p-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#5B3E8E] shadow-sm backdrop-blur-sm">
                <Clock3 size={13} /> {activity.duration} · Beginner
              </span>
              <h1 className="mt-3 font-heading text-3xl font-bold leading-[1.08] text-[#3D2A52] sm:text-4xl">
                {activity.title}
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#3D2A52]/80 sm:text-[15px]">
                {activity.description}
              </p>
            </div>

            {/* breathing circle — expanding rings around the 🧘 */}
            <BreathingCircle className="mx-auto h-36 w-36 md:h-44 md:w-44" />
          </div>
        </section>

        {/* ── How it works · 3 blocks ───────────────────────────── */}
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          {stepCards.map((step, index) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
              className="glass-card rounded-2xl p-4"
            >
              <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#8B7BD8] to-[#D4674C] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                {step.n}
              </span>
              <h3 className="mt-2.5 font-heading text-base font-bold text-[#3D2A52]">{step.title}</h3>
              <p className="mt-1 text-sm leading-5 text-warm-gray">{step.body}</p>
            </motion.div>
          ))}
        </section>

        {/* ── CTA band · gradient image background ─────────────── */}
        <section className="relative mt-4 overflow-hidden rounded-[28px] px-6 py-7 text-center shadow-[0_8px_32px_rgba(138,62,121,0.35)] md:py-9">
          {/* meditation gradient background — anchored bottom so the deep indigo shows */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/activities/meditation-grad.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-[#2A1B3D]/35" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-md font-heading text-xl font-bold leading-snug text-white md:text-2xl">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/85">
              Give yourself five quiet minutes. There is nowhere else you need to be.
            </p>
            {!started && (
              <Button
                size="lg"
                className="mt-4 bg-white text-[#8A3E79] shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:bg-cream"
                onClick={startSession}
              >
                <Play size={18} /> Start Session
              </Button>
            )}
          </div>
        </section>

        {/* ── Active session · indigo gradient panel ────────────── */}
        {started && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="relative mt-4 overflow-hidden rounded-[28px] shadow-[0_8px_32px_rgba(42,27,61,0.28)]"
          >
            {/* same gradient, anchored to the bottom so the deep indigo shows */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/activities/meditation-grad.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-bottom"
            />
            <div className="absolute inset-0 bg-[#2A1B3D]/35" aria-hidden="true" />
            <div className="relative flex flex-col items-center px-6 py-7 text-center">
              <TimerRing
                secondsLeft={secondsLeft}
                totalSeconds={MEDITATION_SECONDS}
                paused={paused}
              />
              <p className="mt-4 font-heading text-lg font-semibold text-white">
                {done ? 'Session complete. 🌿' : 'Take this moment for yourself.'}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {done ? 'You gave yourself five quiet minutes.' : 'Follow the rhythm. In… and out…'}
              </p>

              {/* pill controls — pause/resume + end */}
              <div className="mt-5 flex items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-white text-[#2A1B3D] shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:bg-cream"
                  onClick={() => setPaused((value) => !value)}
                  disabled={done}
                >
                  {paused ? <Play size={18} /> : <Pause size={18} />}
                  {paused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/60"
                  onClick={() => {
                    setStarted(false)
                    resetTimer()
                  }}
                >
                  <Wind size={18} /> End
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-warm-gray">
          <Wind size={14} /> Stop anytime and return when you feel ready.
        </div>
      </div>
    </>
  )
}

/**
 * Gratitude Journaling — hero built around the gratitude-bg.webp illustration
 * (the "JOURNALING" badge, title and duration pill sit over a soft cream wash
 * so the plum copy stays readable), then three numbered step rows and a
 * gradient "Start activity" CTA. Mirrors MeditationPage so every designed
 * activity shares one visual language.
 */
const GRATITUDE_STEPS = [
  { n: '01', title: 'Name one thing that felt good today.', body: 'It can be anything — big or small.' },
  { n: '02', title: 'Write why it mattered to you.', body: 'Take a moment to reflect.' },
  { n: '03', title: 'Notice how your body feels as you remember it.', body: 'Stay with the feeling for a few seconds.' },
]

function GratitudePage() {
  const activity = details.gratitude

  return (
    <>
      <AppNav title={activity.title} showBack />
      {/*
       * Single-screen layout on desktop — no page scroll (the reference design
       * is one screen). The height budget is:
       *   100vh − top bar (h-14 = 3.5rem) − main padding (pt-5 pb-6 = 2.75rem)
       * with a little slack so rounding never produces a scrollbar. The hero is
       * the flex child that absorbs the leftover space, but it is capped so it
       * reads as a banner instead of ballooning on tall screens
       * (min 180px, max 300px). Mobile keeps normal document flow.
       */}
      <div className="page-enter mx-auto flex w-full max-w-4xl flex-col px-4 pb-1 sm:px-6 lg:h-[calc(100vh-6.5rem)]">
        <Link
          href="/app/activities"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-warm-gray hover:text-plum"
        >
          <ArrowLeft size={16} /> Back to activities
        </Link>

        {/* ── Hero card · illustration background block ────────── */}
        <section className="relative mt-2.5 flex min-h-[180px] flex-col justify-center overflow-hidden rounded-[28px] shadow-[0_8px_32px_rgba(74,44,94,0.16)] lg:min-h-[180px] lg:max-h-[300px] lg:flex-1">
          {/* the gratitude illustration fills the whole block */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/activities/gratitude-bg.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
          {/* soft left-to-right wash keeps the copy readable over the art */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#FDF4EC]/95 via-[#FDF4EC]/70 to-[#FDF4EC]/10"
            aria-hidden="true"
          />

          <div className="relative p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5B3E8E] shadow-sm backdrop-blur-sm">
                <Sparkles size={13} /> Journaling
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-[#3D2A52] shadow-sm backdrop-blur-sm">
                <Clock3 size={13} /> {activity.duration} · Beginner
              </span>
            </div>

            <h1 className="mt-2.5 max-w-lg font-display text-[28px] font-bold leading-[1.06] text-[#3D2A52] sm:text-[34px]">
              {activity.title}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#3D2A52]/75 sm:text-[15px]">
              {activity.description}
            </p>
          </div>
        </section>

        {/* ── How it works · three numbered steps ──────────────── */}
        <section className="mt-2.5 shrink-0 space-y-2">
          {GRATITUDE_STEPS.map((step, index) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
              className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/70 px-3.5 py-2.5 shadow-[0_2px_14px_rgba(74,44,94,0.06)] backdrop-blur-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8B7BD8] to-[#D4674C] text-[11px] font-bold text-white shadow-sm">
                {step.n}
              </span>
              <div className="pt-0.5">
                <h3 className="font-heading text-[15px] font-bold leading-snug text-[#3D2A52]">{step.title}</h3>
                <p className="mt-0.5 text-[13px] leading-5 text-warm-gray">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ── CTA · opens the journal to start writing ─────────── */}
        <Link
          href="/app/journal"
          className="mt-2.5 flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5B4B9E] via-[#8A4E8E] to-[#D4674C] px-8 py-3 text-base font-bold text-white shadow-[0_6px_20px_rgba(138,78,142,0.35)] transition-transform hover:-translate-y-0.5"
        >
          <Play size={18} /> Start activity
        </Link>

        <div className="mt-2.5 flex shrink-0 items-center justify-center gap-2 text-xs text-warm-gray">
          <Wind size={14} /> Stop anytime and return when you feel ready.
        </div>
      </div>
    </>
  )
}

/**
 * Breathing circle — soft expanding rings around the meditation cutout.
 * Used in the hero and in the running-session panel.
 */
function BreathingCircle({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className ?? ''}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-[#8B7BD8]/40"
          animate={{ scale: [1, 1.12 + i * 0.14], opacity: [0.55, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeOut', delay: i * 1.2 }}
        />
      ))}
      {/* the cutout itself — no pill/circle wrapper, shown as-is */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/activities/meditation-figure-cutout.webp"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain drop-shadow-[0_10px_28px_rgba(74,44,94,0.25)]"
          draggable={false}
        />
      </motion.div>
    </div>
  )
}

/**
 * Timer ring — circular SVG progress ring showing the 5:00 countdown.
 * The ring depletes clockwise as time runs out; text flips to 0:00 at the end.
 */
function TimerRing({
  secondsLeft,
  totalSeconds,
  paused,
}: {
  secondsLeft: number
  totalSeconds: number
  paused: boolean
}) {
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const label = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Circle geometry: radius 88, circumference 2πr ≈ 552.92
  const R = 88
  const C = 2 * Math.PI * R
  const progress = secondsLeft / totalSeconds
  const dashOffset = C * (1 - progress)

  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      <svg width="208" height="208" viewBox="0 0 208 208" className="absolute inset-0">
        <circle cx="104" cy="104" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <motion.circle
          cx="104"
          cy="104"
          r={R}
          fill="none"
          stroke="url(#timerGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          transform="rotate(-90 104 104)"
        />
        <defs>
          <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EDB6D2" />
            <stop offset="100%" stopColor="#DE6951" />
          </linearGradient>
        </defs>
      </svg>

      {/* breathing figure sits behind the timer text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
        <BreathingCircle className="h-44 w-44" />
      </div>

      <div className="relative text-center">
        <p className="font-display text-6xl font-bold tabular-nums tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          {label}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
          {paused ? 'Paused' : secondsLeft <= 0 ? 'Complete' : 'minutes'}
        </p>
      </div>
    </div>
  )
}

/** Existing simple layout, kept for every activity except meditation. */
function SimpleActivityPage({ id }: { id: string }) {
  const activity = details[id] ?? details.meditation
  const [started, setStarted] = useState(false)
  return (
    <>
      <AppNav title={activity.title} showBack />
      <div className="page-enter mx-auto max-w-3xl space-y-6 pb-8">
        <Link href="/app/activities" className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-plum">
          <ArrowLeft size={16} /> Back to activities
        </Link>
        <Card className="overflow-hidden bg-white/80" padding="lg">
          <div className="flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-plum to-terracotta">
            <NotoEmoji emoji={activity.emoji} size={72} />
          </div>
          <div className="mt-7 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-semibold">{activity.title}</h1>
              <p className="mt-2 text-sm leading-6 text-warm-gray">{activity.description}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-cream-dark px-3 py-1.5 text-xs text-warm-gray">
              <Clock3 size={13} /> {activity.duration}
            </span>
          </div>
          <div className="mt-8 space-y-3">
            {activity.steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl bg-cream-dark/70 px-4 py-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-plum text-xs font-semibold text-cream">{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
          {started && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 overflow-hidden rounded-2xl bg-sage/10 p-6 text-center"
            >
              <motion.div
                animate={id === 'breathing' ? { scale: [1, 1.35, 1] } : { y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
                transition={{ duration: id === 'breathing' ? 8 : 4, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sage to-plum shadow-medium"
              >
                <NotoEmoji emoji={activity.emoji} size={40} />
              </motion.div>
              <p className="mt-4 font-heading text-xl font-semibold text-plum">
                {id === 'breathing' ? 'Breathe in… and out…' : 'Take this moment for yourself.'}
              </p>
              <p className="mt-1 text-sm text-warm-gray">Follow the rhythm. There is nowhere else you need to be.</p>
            </motion.div>
          )}
          <Button className="mt-8 w-full" onClick={() => setStarted((value) => !value)}>
            <Play size={16} /> {started ? 'Pause activity' : 'Start activity'}
          </Button>
        </Card>
        <div className="flex items-center justify-center gap-2 text-xs text-warm-gray">
          <Wind size={14} /> Stop anytime and return when you feel ready.
        </div>
      </div>
    </>
  )
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (id === 'meditation') return <MeditationPage />
  if (id === 'gratitude') return <GratitudePage />
  return <SimpleActivityPage id={id ?? 'meditation'} />
}