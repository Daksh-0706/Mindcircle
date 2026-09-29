'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Stethoscope, Search, Star, BadgeCheck, Clock, ArrowRight, Video, MessageCircle } from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'

type Counsellor = {
  id: string
  name: string
  title: string
  specialty: string
  focus: string
  rating: number
  reviews: number
  next: string
  price: string
  color: string
  initials: string
  modes: ('video' | 'chat')[]
}

const COUNSELLORS: Counsellor[] = [
  { id: 'dr-mehta', name: 'Dr. Anjali Mehta', title: 'Clinical Psychologist', specialty: 'anxiety', focus: 'Anxiety & Stress', rating: 4.9, reviews: 214, next: 'Today, 4:00 PM', price: 'Free for students', color: '#4A2C5E', initials: 'AM', modes: ['video', 'chat'] },
  { id: 'dr-rao', name: 'Dr. Vikram Rao', title: 'Counselling Psychologist', specialty: 'depression', focus: 'Depression & Mood', rating: 4.8, reviews: 176, next: 'Tomorrow, 11:00 AM', price: '₹800 / session', color: '#7B9E6B', initials: 'VR', modes: ['video'] },
  { id: 'ms-fernandes', name: 'Rhea Fernandes', title: 'Therapist, MA', specialty: 'relationships', focus: 'Relationships', rating: 4.7, reviews: 92, next: 'Today, 7:30 PM', price: '₹600 / session', color: '#C45D3E', initials: 'RF', modes: ['video', 'chat'] },
  { id: 'dr-khan', name: 'Dr. Sara Khan', title: 'Psychiatrist', specialty: 'anxiety', focus: 'Anxiety & Sleep', rating: 4.9, reviews: 301, next: 'Wed, 2:00 PM', price: '₹1200 / session', color: '#6B4A80', initials: 'SK', modes: ['video'] },
  { id: 'mr-das', name: 'Aditya Das', title: 'Wellness Coach', specialty: 'stress', focus: 'Burnout & Focus', rating: 4.6, reviews: 64, next: 'Today, 9:00 PM', price: 'Free for students', color: '#5C7A4F', initials: 'AD', modes: ['chat'] },
  { id: 'dr-iyer', name: 'Dr. Meera Iyer', title: 'Clinical Psychologist', specialty: 'depression', focus: 'Grief & Depression', rating: 4.8, reviews: 138, next: 'Fri, 10:00 AM', price: '₹900 / session', color: '#4A2C5E', initials: 'MI', modes: ['video', 'chat'] },
]

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Anxiety', value: 'anxiety' },
  { label: 'Depression', value: 'depression' },
  { label: 'Stress', value: 'stress' },
  { label: 'Relationships', value: 'relationships' },
]

export default function CounsellorsPage() {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const list = useMemo(
    () =>
      COUNSELLORS.filter((c) => filter === 'all' || c.specialty === filter).filter(
        (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.focus.toLowerCase().includes(query.toLowerCase())
      ),
    [filter, query]
  )

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
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-plum to-terracotta">
                <Stethoscope className="h-5 w-5 text-cream" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-charcoal">Counsellors</h1>
                <p className="text-sm text-warm-gray">Verified professionals, ready to listen</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or focus area…"
                className="input-warm w-full pl-11"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="mb-5 overflow-x-auto scroll-x-hidden">
            <Tabs tabs={FILTERS} active={filter} onChange={setFilter} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
              >
                <Link href={`/app/counsellor/${c.id}`} className="glass-card block rounded-2xl p-5 transition-all hover:shadow-strong">
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-cream"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-heading font-bold text-charcoal">{c.name}</h3>
                        <BadgeCheck className="h-4 w-4 shrink-0 text-plum" />
                      </div>
                      <p className="text-sm text-warm-gray">{c.title}</p>
                      <div className="mt-1 flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-terracotta text-terracotta" />
                        <span className="font-medium text-charcoal">{c.rating}</span>
                        <span className="text-warm-gray-light">({c.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-plum/10 px-3 py-1 text-xs font-medium text-plum">{c.focus}</span>
                    {c.modes.includes('video') && (
                      <span className="flex items-center gap-1 rounded-full bg-sage/15 px-3 py-1 text-xs font-medium text-sage-dark">
                        <Video className="h-3 w-3" /> Video
                      </span>
                    )}
                    {c.modes.includes('chat') && (
                      <span className="flex items-center gap-1 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-medium text-terracotta">
                        <MessageCircle className="h-3 w-3" /> Chat
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-warm-gray-lighter pt-3">
                    <div>
                      <p className="flex items-center gap-1 text-xs text-warm-gray">
                        <Clock className="h-3.5 w-3.5" /> Next: {c.next}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-charcoal">{c.price}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-plum">
                      View <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {list.length === 0 && (
            <div className="glass-card rounded-2xl px-6 py-16 text-center">
              <Stethoscope className="mx-auto mb-3 h-10 w-10 text-warm-gray-light" />
              <p className="font-heading font-bold text-charcoal">No counsellors match</p>
              <p className="mt-1 text-sm text-warm-gray">Try a different filter or search term.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
