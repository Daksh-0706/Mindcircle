'use client'

import { motion } from 'framer-motion'
import {
  Sparkles, ChevronRight, Clock, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useIsMobile, useIsDesktop } from '../../../hooks/useMediaQuery'
import { cn } from '../../../lib/utils'

const activities = [
  {
    id: 'meditation',
    title: '5-Minute Meditation',
    description: 'A quick guided meditation to center your mind and reduce stress.',
    image: '/activities/meditation.png',
    duration: '5 min',
    level: 'Beginner',
    color: '#4A2C5E',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Journaling',
    description: 'Reflect on three things you\'re grateful for to shift your perspective.',
    image: '/activities/journaling.png',
    duration: '10 min',
    level: 'Beginner',
    color: '#7B9E6B',
  },
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'Practice 4-7-8 breathing technique to calm your nervous system.',
    image: '/activities/breathing.png',
    duration: '3 min',
    level: 'Beginner',
    color: '#C45D3E',
  },
  {
    id: 'nature',
    title: 'Nature Walk',
    description: 'Mindful walking practice to connect with your surroundings.',
    image: '/activities/nature-walk.png',
    duration: '15 min',
    level: 'All levels',
    color: '#5C7A4F',
  },
  {
    id: 'creative',
    title: 'Creative Expression',
    description: 'Free-form drawing or writing to process emotions creatively.',
    image: '/activities/creative.png',
    duration: '20 min',
    level: 'All levels',
    color: '#6B4A80',
  },
  {
    id: 'detox',
    title: 'Digital Detox',
    description: 'Guided session to unplug and reconnect with yourself.',
    image: '/activities/detox.png',
    duration: '30 min',
    level: 'Intermediate',
    color: '#8A8A8A',
  },
]

export default function ActivitiesPage() {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mesh-gradient min-h-screen"
      >
        {/* ── Hero: two-tone heading over pastel bg ───────────── */}
        <section className="relative overflow-hidden px-4 pt-6 sm:px-6">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 85% 20%, rgba(240,190,220,0.35) 0%, rgba(240,190,220,0) 40%),
                radial-gradient(circle at 70% 80%, rgba(230,220,250,0.45) 0%, rgba(230,220,250,0) 45%),
                linear-gradient(120deg, #FDF4EC 0%, #FAF0F4 60%, #F3ECFA 100%)
              `,
            }}
            aria-hidden="true"
          />
          <div className="relative max-w-4xl mx-auto pb-2">
            <h1 className="font-display text-[42px] font-bold leading-[1.05] sm:text-[48px]">
              <span className="block text-[#3D2A52]">Activities</span>
              <span className="block bg-gradient-to-r from-[#8B7BD8] to-[#E88A8A] bg-clip-text text-transparent">for You</span>
            </h1>
            <p className="mt-3 max-w-xs text-[15px] leading-6 text-charcoal/80">
              Personalized suggestions to support your wellbeing
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* ── Find what works card with hand-heart art ───────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-[24px] border border-white/70 shadow-[0_8px_32px_rgba(74,44,94,0.10)]">
              {/* pastel wash + leaf blobs background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(circle at 88% 85%, rgba(196,93,62,0.10) 0%, transparent 45%),
                    radial-gradient(circle at 95% 10%, rgba(123,158,107,0.10) 0%, transparent 40%),
                    radial-gradient(circle at 10% 95%, rgba(123,158,107,0.08) 0%, transparent 40%),
                    linear-gradient(115deg, #F6F1FB 0%, #FBF2F6 55%, #F1EDFB 100%)
                  `,
                }}
                aria-hidden="true"
              />
              {/* hand holding heart, blended on the right */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/activities/creative.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-4 top-1/2 hidden h-[150%] w-auto -translate-y-1/2 object-contain mix-blend-multiply md:block"
                style={{
                  maskImage: 'radial-gradient(ellipse 70% 70% at 55% 50%, black 45%, transparent 92%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 55% 50%, black 45%, transparent 92%)',
                }}
              />
              <div className="relative flex items-start gap-4 p-6 md:p-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EFEAFB] shadow-[0_2px_10px_rgba(74,44,94,0.08)]">
                  <Sparkles className="h-7 w-7 text-[#8B7BD8]" />
                </div>
                <div className="max-w-sm flex-1">
                  <h2 className="font-heading text-[22px] font-bold leading-snug text-[#3D2A52]">
                    Find what works<br />for you
                  </h2>
                  <p className="mt-3 text-[15px] leading-7 text-charcoal/75">
                    <span className="font-bold">Explore</span> guided activities designed to support your mental <span className="font-bold">wellbeing</span>. Each activity is evidence-based and can be done anywhere, anytime. Start with just a few minutes a day.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Activities Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={cn(
              'gap-3.5 sm:gap-4',
              isMobile ? 'grid grid-cols-2' : 'grid grid-cols-3'
            )}>
              {activities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  index={index}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </motion.section>

          {/* ── CTA: assessment card with garden bg ─────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <div className="relative overflow-hidden rounded-[28px] shadow-[0_8px_32px_rgba(74,44,94,0.12)]">
              {/* garden + clipboard background from the mockup */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/activities-cta-bg.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
              <div className="relative flex flex-col items-center px-6 py-10 text-center md:py-12">
                <h3 className="max-w-sm font-heading text-[24px] font-bold leading-snug text-[#3D2A52]">
                  Want more personalized suggestions?
                </h3>
                <p className="mt-3 max-w-xs text-[15px] leading-7 text-charcoal/75">
                  Take a quick wellness assessment to get activities tailored to your current mood and goals.
                </p>
                <Link
                  href="/app/assessment"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B4B9E] via-[#8A4E8E] to-[#D4674C] px-8 py-3.5 text-[16px] font-bold text-white shadow-[0_6px_20px_rgba(138,78,142,0.4)] transition-transform hover:-translate-y-0.5"
                >
                  Take Assessment
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  )
}

function ActivityCard({ activity, index, isMobile }: { activity: typeof activities[0]; index: number; isMobile: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 400, damping: 30 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn(
        'glass-card rounded-2xl overflow-hidden relative group',
        'transition-all duration-300 hover:shadow-strong'
      )}
    >      {/* Cover image */}
      <div className="relative h-28 md:h-32 overflow-hidden bg-cream-dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activity.image}
          alt={activity.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      <div className="p-3.5 md:p-4">
        <div className="mb-2.5 flex items-center justify-between gap-1.5">
          <span className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap',
            activity.level === 'Intermediate' ? 'bg-[#FBEEDC] text-[#B4762E]' : 'bg-[#EFEAFB] text-[#5B3E8E]',
          )}>
            {activity.level}
          </span>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#EFEAFB] px-2.5 py-1 text-[11px] font-semibold text-[#5B3E8E]">
            <Clock className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{activity.duration.replace(' min', 'm')}</span>
          </div>
        </div>

        <h3 className="font-heading text-[15px] md:text-base font-bold text-[#3D2A52] mb-1 line-clamp-1">
          {activity.title}
        </h3>
        <p className="text-[13px] text-warm-gray mb-3.5 line-clamp-2 leading-snug">
          {activity.description}
        </p>

        <Link
          href={`/app/activities/${activity.id}`}
          className={cn(
            'flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#5B4B9E] via-[#8A4E8E] to-[#D4674C] py-2.5 text-[13px] font-bold text-white',
            'shadow-[0_4px_16px_rgba(138,78,142,0.35)] transition-all hover:shadow-strong group-hover:scale-[1.02]'
          )}
        >
          Try Now
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Completion indicator (mock) */}
      {activity.id === 'meditation' && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="w-6 h-6 bg-sage text-cream rounded-full flex items-center justify-center shadow-medium" />
        </div>
      )}
    </motion.article>
  )
}
