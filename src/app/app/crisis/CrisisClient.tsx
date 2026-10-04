'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Heart,
  Phone,
  Shield,
  BookOpen,
  Sparkles,
  X,
  AlertCircle,
  Leaf,
  Flower2,
  Play,
} from 'lucide-react'

const helplines = [
  {
    id: 'icall',
    name: 'iCall',
    number: '9152987821',
    hours: '24/7',
    color: '#7B9E6B',
    cardBg: 'linear-gradient(135deg, #E5F0DC 0%, #EDF4E6 45%, #F6FAF2 100%)',
    buttonBg: 'linear-gradient(90deg, #7B9E6B 0%, #5C7A4F 100%)',
    description: 'Professional counseling via phone & email',
    icon: Phone,
  },
  {
    id: 'vandrevala',
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    hours: '24/7',
    color: '#4A2C5E',
    cardBg: 'linear-gradient(135deg, #EDE7F7 0%, #F2ECFA 45%, #F9F6FD 100%)',
    buttonBg: 'linear-gradient(90deg, #3A1F4A 0%, #6B4A80 100%)',
    description: 'Mental health support & crisis intervention',
    icon: Shield,
  },
  {
    id: 'aasra',
    name: 'AASRA',
    number: '9820466726',
    hours: '24/7',
    color: '#C45D3E',
    cardBg: 'linear-gradient(135deg, #FBE7DB 0%, #FDEFE5 45%, #FDF7F2 100%)',
    buttonBg: 'linear-gradient(90deg, #A04830 0%, #D4785C 100%)',
    description: 'Suicide prevention & emotional support',
    icon: Heart,
  },
]

const ANXIETY_FACT_SHEET_URL =
  'https://headspace.org.au/assets/Factsheets/headspace_understanding-anxiety_Fact-Sheet_FA01_DIGI.pdf'

const resources = [
  {
    title: 'Understanding Anxiety',
    description: 'Learn about anxiety symptoms, triggers, and evidence-based coping strategies.',
    href: ANXIETY_FACT_SHEET_URL,
    icon: BookOpen,
    color: '#4A2C5E',
    tint: '#EFE9F8',
    showCta: true,
  },
  {
    title: 'Grounding Techniques',
    description: 'Quick 5-4-3-2-1 sensory exercises to manage panic and dissociation.',
    href: ANXIETY_FACT_SHEET_URL,
    icon: Leaf,
    color: '#5C7A4F',
    tint: '#E9F1E3',
    showCta: false,
  },
]

const BREATHING_PHASES = [
  { label: 'Breathe in...', ms: 3000, scale: 1.16 },
  { label: 'Hold', ms: 2000, scale: 1.16 },
  { label: 'Breathe out...', ms: 5000, scale: 1 },
]

function Squiggle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 7C10 2 18 2 26 7s16 5 24 0 16-5 24 0 16 5 24 0 16-5 20-3"
        stroke="#E8955C"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function CrisisPage() {
  const [popupOpen, setPopupOpen] = useState(false)
  const [breathing, setBreathing] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)

  // Auto-open the gentle nudge popup after a moment
  useEffect(() => {
    const t = setTimeout(() => setPopupOpen(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Breathing phase cycle
  useEffect(() => {
    if (!breathing) return
    const t = setTimeout(
      () => setPhaseIdx((i) => (i + 1) % BREATHING_PHASES.length),
      BREATHING_PHASES[phaseIdx].ms
    )
    return () => clearTimeout(t)
  }, [breathing, phaseIdx])

  const phase = BREATHING_PHASES[phaseIdx]

  const toggleBreathing = () => {
    if (breathing) {
      setBreathing(false)
      setPhaseIdx(0)
    } else {
      setPhaseIdx(0)
      setBreathing(true)
    }
  }

  return (
    <>
    <div className="min-h-screen bg-cream pb-safe">
      <div className="relative min-h-screen overflow-hidden bg-[#FFF8F0]">
        {/* Soft peach + lavender blob background.

            The base wash is translucent, not a solid colour. It used to be an
            opaque `linear-gradient(165deg, #FDF4EC …)`, and because this layer
            begins partway down the page while everything above it is the plain
            page cream (#FFF8F0), that one-stop difference drew a hard
            horizontal line straight across the screen. A translucent base has
            no edge to show: it simply tints whatever is behind it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            /* This layer starts directly below the standalone header, so its
               top edge lands right against the header's flat cream. A vertical
               mask dissolves the first ~110px into that cream, which removes
               the seam no matter which gradient stop sits nearest the top. */
            maskImage: 'linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.35) 55px, black 110px)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.35) 55px, black 110px)',
            background: `
              radial-gradient(circle at 12% 18%, rgba(244, 196, 176, 0.45) 0%, rgba(244, 196, 176, 0) 40%),
              radial-gradient(circle at 88% 30%, rgba(214, 196, 240, 0.40) 0%, rgba(214, 196, 240, 0) 42%),
              radial-gradient(circle at 20% 65%, rgba(233, 214, 244, 0.35) 0%, rgba(233, 214, 244, 0) 45%),
              radial-gradient(circle at 85% 85%, rgba(244, 204, 180, 0.35) 0%, rgba(244, 204, 180, 0) 45%),
              linear-gradient(165deg, rgba(255, 248, 240, 0) 0%, rgba(251, 240, 244, 0.55) 50%, rgba(247, 238, 249, 0.75) 100%)
            `,
          }}
        />

        {/* Hero background illustration (user-provided).
            The artwork's own top edge is a pale pink band, and it butts directly
            against the flat cream header, which drew a hard line across the
            screen. Two nested wrappers each carry one mask, so the edges
            feather independently: the outer one dissolves the artwork into the
            header above it, the inner ellipse softens the sides and bottom. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[440px] sm:h-[540px]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.45) 60px, black 130px)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.45) 60px, black 130px)',
          }}
        >
          <div
            className="h-full w-full overflow-hidden"
            style={{
              maskImage:
                'radial-gradient(ellipse 82% 78% at 50% 42%, black 52%, rgba(0,0,0,0.35) 78%, transparent 100%)',
              WebkitMaskImage:
                '-webkit-radial-gradient(ellipse 82% 78% at 50% 42%, black 52%, rgba(0,0,0,0.35) 78%, transparent 100%)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/crisis-hero.png"
              alt=""
              className="h-full w-full object-cover object-center"
              style={{ objectPosition: 'center 42%' }}
            />
          </div>
        </div>

        <div className="relative mx-auto max-w-3xl px-4 py-5 sm:px-6 lg:px-8">
          {/* ── Title. The back button lives in the standalone header now. ── */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-[#E0685C]" fill="currentColor" />
              <span aria-hidden="true" className="h-6 w-px bg-[#2A1B3D]/25" />
              <span className="font-heading text-xl font-bold text-[#2A1B3D]">Crisis Support</span>
            </div>
          </div>

          {/* ── Hero ─────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Spacer so the heading sits below the background illustration */}
            <div aria-hidden="true" className="h-[250px] sm:h-[330px]" />
            <h1 className="font-heading text-4xl font-bold leading-tight text-[#2A1B3D] sm:text-5xl">
              You&apos;re not alone
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-7 text-[#6B6B6B] sm:text-xl">
              If you&apos;re in crisis, please reach out right now. Help is available 24/7, and you matter.
            </p>
          </motion.section>

          {/* ── Immediate Help Cards ─────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <h2 className="font-heading text-2xl font-bold text-[#2A1B3D] sm:text-3xl">Immediate Help</h2>
            <Squiggle className="mt-1 h-3 w-24" />

            <div className="mt-5 grid gap-5">
              {helplines.map((helpline, index) => (
                <motion.article
                  key={helpline.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-[28px] p-6 shadow-[0_8px_32px_rgba(42,27,61,0.10)]"
                  style={{ background: helpline.cardBg }}
                >
                  {/* Decorative leaf bleeding from the right edge */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/deco-leaf-right.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-6 top-2 h-full w-auto opacity-60 mix-blend-multiply"
                    style={{
                      maskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
                    }}
                  />

                  <div className="relative flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_20px_rgba(42,27,61,0.22)]"
                      style={{ backgroundColor: helpline.color }}
                    >
                      <helpline.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-xl font-bold text-[#2A1B3D]">{helpline.name}</h3>
                      <p className="mt-1 text-base leading-6 text-[#8A8A8A]">{helpline.description}</p>
                      <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-[#4A4A4A]">
                        <span className="h-2 w-2 rounded-full bg-[#4CAF50]" />
                        {helpline.hours}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`tel:${helpline.number.replace(/\D/g, '')}`}
                    className="relative mt-5 flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-lg font-bold text-white shadow-[0_6px_20px_rgba(42,27,61,0.25)] transition-transform hover:-translate-y-0.5"
                    style={{ background: helpline.buttonBg }}
                  >
                    <Phone className="h-5 w-5" />
                    Call {helpline.number}
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* ── Breathing Exercise ───────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 text-center"
          >
            <h2 className="font-heading text-2xl font-bold text-[#2A1B3D] sm:text-3xl">Breathing Exercise</h2>
            <Squiggle className="mx-auto mt-1 h-3 w-28" />
            <p className="mx-auto mt-3 max-w-md text-base leading-6 text-[#8A8A8A]">
              Take a moment for yourself. Breathe, relax, and feel better.
            </p>

            <div className="relative mt-8 flex justify-center">
              {/* Outer ring */}
              <div
                aria-hidden="true"
                className="absolute h-[19rem] w-[19rem] rounded-full border border-[#E4D5F0]/70 sm:h-[21rem] sm:w-[21rem]"
              />
              <motion.button
                type="button"
                onClick={toggleBreathing}
                aria-label={breathing ? 'Pause breathing exercise' : 'Start breathing exercise'}
                animate={{ scale: breathing ? phase.scale : 1 }}
                transition={{ duration: (breathing ? phase.ms : 600) / 1000, ease: 'easeInOut' }}
                className="relative flex h-64 w-64 items-center justify-center rounded-full border-2 border-white/80 shadow-[0_16px_48px_rgba(74,44,94,0.18)] sm:h-72 sm:w-72"
                style={{
                  background: 'linear-gradient(160deg, #D6C8EF 0%, #E7D6EE 45%, #F7DFCC 100%)',
                }}
              >
                <span className="flex flex-col items-center gap-3 px-8">
                  <Flower2 className="h-9 w-9 text-[#6B4A80]" />
                  <span className="font-heading text-3xl font-medium text-[#3A2B54]">
                    {breathing ? phase.label : 'Breathe in...'}
                  </span>
                  <span className="text-base text-[#7A6B8A]">
                    {breathing ? 'Follow the circle' : 'Tap to start'}
                  </span>
                </span>
              </motion.button>
            </div>

            <button
              type="button"
              onClick={toggleBreathing}
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#E6DBF6] px-9 py-3.5 font-heading text-lg font-bold text-[#4A2C5E] shadow-[0_6px_20px_rgba(74,44,94,0.14)] transition-transform hover:-translate-y-0.5"
            >
              <Play className="h-5 w-5" fill="currentColor" />
              {breathing ? 'Pause' : 'Start'}
            </button>
          </motion.section>

          {/* ── Helpful Resources ────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            <h2 className="font-heading text-2xl font-bold text-[#2A1B3D] sm:text-3xl">Helpful Resources</h2>
            <Squiggle className="mt-1 h-3 w-24" />

            <div className="mt-5 grid gap-4">
              {resources.map((resource) => (
                <article
                  key={resource.title}
                  className="rounded-[28px] bg-white p-6 shadow-[0_8px_32px_rgba(42,27,61,0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: resource.tint, color: resource.color }}
                    >
                      <resource.icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-xl font-bold text-[#2A1B3D]">{resource.title}</h3>
                        <ArrowRight className="h-4 w-4 rotate-[-45deg] text-[#6B4A80]" />
                      </div>
                      <p className="mt-1 text-base leading-6 text-[#8A8A8A]">{resource.description}</p>
                      {resource.showCta && (
                        <a
                          href={resource.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#EFE9F8] px-5 py-2.5 text-sm font-bold text-[#4A2C5E] transition-transform hover:-translate-y-0.5"
                        >
                          Read the fact sheet <BookOpen className="h-4 w-4" /> <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </motion.section>

          {/* ── Emergency Notice ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 rounded-[28px] bg-white p-6 shadow-[0_8px_32px_rgba(42,27,61,0.08)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C45D3E]/12 text-[#C45D3E]">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg font-bold text-[#A04830]">Emergency Notice</p>
                <p className="mt-1 text-base leading-6 text-[#C45D3E]">
                  If you or someone else is in immediate danger, please call emergency services (112) or go to the
                  nearest emergency room.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="h-28" aria-hidden="true" />
        </div>

        {/* ── Floating gradient CTA pill ────────────── */}
        {/*
          The bottom offset comes from `--mc-bottom-offset`, which AppLayout
          sets to 0 for a guest and to the height of the bottom nav for a
          signed-in member. So the pill sits low for someone who arrived from
          the landing page, and floats clear of the nav for a member.
        */}
        <a
          href="tel:9152987821"
          style={{ bottom: 'calc(1.25rem + var(--mc-bottom-offset, 0rem))' }}
          className="fixed left-4 right-4 z-50 mx-auto flex w-auto max-w-xl items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#3A1F4A] via-[#5B3E8E] to-[#C45D3E] px-6 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(42,27,61,0.35)] transition-transform hover:-translate-y-0.5 sm:left-1/2 sm:right-auto sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:hover:-translate-x-1/2 sm:hover:-translate-y-0.5 lg:bottom-8"
        >
          <Phone className="h-5 w-5" />
          Call iCall Now: 9152987821
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>

      {/* ── Popup nudge card ────────────────────────── */}
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            role="dialog"
            aria-label="Feeling anxious right now?"
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{ bottom: 'calc(5.75rem + var(--mc-bottom-offset, 0rem))' }}
            className="fixed left-4 right-4 z-[60] mx-auto max-w-md rounded-[28px] bg-white p-5 shadow-[0_24px_64px_rgba(42,27,61,0.22)] sm:left-auto sm:right-8 sm:bottom-32 sm:mx-0"
          >
            <button
              type="button"
              onClick={() => setPopupOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#B0B0B0] transition-colors hover:bg-black/5 hover:text-[#4A4A4A]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-4 pr-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFE9F8] text-[#4A2C5E]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-lg font-bold text-[#2A1B3D]">Feeling anxious right now?</h2>
                <p className="mt-1 text-sm leading-5 text-[#8A8A8A]">
                  A gentle, easy-to-read guide to understanding anxiety is one tap away.
                </p>
                <a
                  href={ANXIETY_FACT_SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3A1F4A] to-[#A04830] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(42,27,61,0.28)] transition-transform hover:-translate-y-0.5"
                >
                  <BookOpen className="h-4 w-4" />
                  Read it now
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  )
}
