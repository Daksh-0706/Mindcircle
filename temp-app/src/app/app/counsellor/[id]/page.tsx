'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  BadgeCheck,
  MessageCircle,
  Video,
  Globe,
  GraduationCap,
  Heart,
  Quote,
  CalendarCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SLOTS = [
  { day: 'Today', times: ['4:00 PM', '7:30 PM'] },
  { day: 'Tomorrow', times: ['10:00 AM', '1:00 PM', '6:00 PM'] },
  { day: 'Thu', times: ['11:00 AM', '3:00 PM'] },
]

const SPECIALTIES = ['Anxiety', 'Academic Stress', 'Panic Attacks', 'Sleep', 'Self-esteem']
const LANGUAGES = ['English', 'Hindi', 'Marathi']

const REVIEWS = [
  { name: 'Anonymous', text: 'Dr. Mehta made me feel heard for the first time in years. Truly grateful.', rating: 5, when: '2 weeks ago' },
  { name: 'R. K.', text: 'Practical, warm, and never rushed. The breathing techniques actually stuck.', rating: 5, when: '1 month ago' },
]

function titleize(slug: string) {
  const cleaned = slug.replace(/^dr-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return slug.startsWith('dr-') ? `Dr. ${cleaned}` : cleaned
}

export default function CounsellorProfilePage() {
  const params = useParams<{ id: string }>()
  const name = params?.id ? titleize(params.id) : 'Counsellor'
  const initials = name.replace('Dr. ', '').split(' ').map((w) => w[0]).slice(0, 2).join('')

  const [selected, setSelected] = useState<string | null>(null)
  const [booked, setBooked] = useState(false)

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mesh-gradient min-h-screen"
      >
        {/* Header bar */}
        <div className="sticky top-0 z-10 border-b border-warm-gray-lighter bg-cream/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-3">
            <Link
              href="/app/counsellors"
              aria-label="Back to counsellors"
              className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-heading text-lg font-bold text-charcoal">Counsellor profile</h1>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Main */}
            <div className="space-y-6">
              {/* Identity */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-3xl p-6"
              >
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                  <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-plum to-terracotta text-3xl font-bold text-cream">
                    {initials}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <h2 className="font-heading text-2xl font-bold text-charcoal">{name}</h2>
                      <BadgeCheck className="h-5 w-5 text-plum" />
                    </div>
                    <p className="text-warm-gray">Clinical Psychologist · 8 yrs experience</p>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-terracotta text-terracotta" />
                        <span className="font-semibold text-charcoal">4.9</span>
                        <span className="text-warm-gray-light">(214 reviews)</span>
                      </span>
                      <span className="flex items-center gap-1 text-sm text-warm-gray">
                        <Globe className="h-4 w-4" /> {LANGUAGES.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* About */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card rounded-3xl p-6"
              >
                <h3 className="mb-2 font-heading text-lg font-bold text-charcoal">About</h3>
                <p className="leading-relaxed text-warm-gray">
                  I work with students and young professionals navigating anxiety, academic pressure, and
                  burnout. My approach is warm, collaborative, and grounded in CBT and mindfulness — no
                  jargon, no judgement. Sessions are a space where you set the pace.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum/10 text-plum">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">Education</p>
                      <p className="text-sm text-warm-gray">M.Phil Clinical Psychology, NIMHANS</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage/15 text-sage-dark">
                      <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">Approach</p>
                      <p className="text-sm text-warm-gray">CBT · Mindfulness · Person-centred</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-charcoal">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((s) => (
                      <span key={s} className="rounded-full bg-cream-dark px-3 py-1 text-xs font-medium text-charcoal">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.section>

              {/* Reviews */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl p-6"
              >
                <h3 className="mb-4 font-heading text-lg font-bold text-charcoal">What people say</h3>
                <div className="space-y-4">
                  {REVIEWS.map((r, i) => (
                    <div key={i} className="rounded-2xl bg-white/50 p-4">
                      <Quote className="h-5 w-5 text-plum/40" />
                      <p className="mt-1 text-sm leading-relaxed text-charcoal">{r.text}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-warm-gray">{r.name}</span>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {Array.from({ length: r.rating }).map((_, k) => (
                              <Star key={k} className="h-3 w-3 fill-terracotta text-terracotta" />
                            ))}
                          </div>
                          <span className="text-xs text-warm-gray-light">· {r.when}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Booking sidebar */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="lg:sticky lg:top-24">
                <div className="glass-card rounded-3xl p-5">
                  <p className="font-heading text-lg font-bold text-charcoal">Book a session</p>
                  <p className="text-sm text-sage">Free for verified students</p>

                  <div className="mt-4 space-y-4">
                    {SLOTS.map((s) => (
                      <div key={s.day}>
                        <p className="mb-2 text-sm font-medium text-charcoal">{s.day}</p>
                        <div className="flex flex-wrap gap-2">
                          {s.times.map((t) => {
                            const key = `${s.day} ${t}`
                            const active = selected === key
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setSelected(key)}
                                className={cn(
                                  'rounded-xl border px-3 py-2 text-sm font-medium transition-all',
                                  active
                                    ? 'border-transparent bg-gradient-to-br from-plum to-terracotta text-cream'
                                    : 'border-warm-gray-lighter bg-white text-charcoal hover:border-plum/40'
                                )}
                              >
                                {t}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => selected && setBooked(true)}
                    disabled={!selected}
                    className={cn(
                      'btn-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold',
                      !selected && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {booked ? (
                      <>
                        <CalendarCheck className="h-4 w-4" /> Requested — {selected}
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4" /> {selected ? `Book ${selected}` : 'Select a time'}
                      </>
                    )}
                  </button>

                  <Link
                    href={`/app/chat/${params?.id ?? 'counsellor'}`}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-warm-gray-lighter bg-white py-3 text-sm font-medium text-charcoal transition-colors hover:bg-cream-dark"
                  >
                    <MessageCircle className="h-4 w-4" /> Send a message
                  </Link>

                  <p className="mt-4 text-center text-xs text-warm-gray-light">
                    Sessions are confidential. Cancel up to 2 hours before.
                  </p>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
