'use client'

import { motion } from 'framer-motion'
import {
  Sparkles, Brain, BookOpen, Wind, TreePine, Palette, Smartphone,
  ChevronRight, Clock, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

const activities = [
  {
    id: 'meditation',
    title: '5-Minute Meditation',
    description: 'A quick guided meditation to center your mind and reduce stress.',
    icon: Brain,
    gradient: 'from-plum/30 to-terracotta/30',
    accent: 'bg-gradient-to-br from-plum to-terracotta',
    duration: '5 min',
    level: 'Beginner',
    color: '#4A2C5E',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Journaling',
    description: 'Reflect on three things you\'re grateful for to shift your perspective.',
    icon: BookOpen,
    gradient: 'from-sage/30 to-sage-light/30',
    accent: 'bg-gradient-to-br from-sage to-sage-light',
    duration: '10 min',
    level: 'Beginner',
    color: '#7B9E6B',
  },
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'Practice 4-7-8 breathing technique to calm your nervous system.',
    icon: Wind,
    gradient: 'from-terracotta/30 to-terracotta-light/30',
    accent: 'bg-gradient-to-br from-terracotta to-terracotta-light',
    duration: '3 min',
    level: 'Beginner',
    color: '#C45D3E',
  },
  {
    id: 'nature',
    title: 'Nature Walk',
    description: 'Mindful walking practice to connect with your surroundings.',
    icon: TreePine,
    gradient: 'from-sage-dark/30 to-sage/30',
    accent: 'bg-gradient-to-br from-sage-dark to-sage',
    duration: '15 min',
    level: 'All levels',
    color: '#5C7A4F',
  },
  {
    id: 'creative',
    title: 'Creative Expression',
    description: 'Free-form drawing or writing to process emotions creatively.',
    icon: Palette,
    gradient: 'from-plum-light/30 to-plum/30',
    accent: 'bg-gradient-to-br from-plum-light to-plum',
    duration: '20 min',
    level: 'All levels',
    color: '#6B4A80',
  },
  {
    id: 'detox',
    title: 'Digital Detox',
    description: 'Guided session to unplug and reconnect with yourself.',
    icon: Smartphone,
    gradient: 'from-warm-gray/30 to-warm-gray-light/30',
    accent: 'bg-gradient-to-br from-warm-gray to-warm-gray-light',
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
        {/* Header */}
        <div className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md border-b border-warm-gray-lighter">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plum to-terracotta flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cream" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-charcoal">Activities for You</h1>
                <p className="text-sm text-warm-gray">Personalized suggestions to support your wellbeing</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Intro */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plum/20 to-terracotta/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-7 h-7" style={{ color: '#4A2C5E' }} />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-xl font-bold text-charcoal mb-2">Find what works for you</h2>
                  <p className="text-warm-gray leading-relaxed">
                    Explore guided activities designed to support your mental wellbeing. Each activity is evidence-based and can be done anywhere, anytime. Start with just a few minutes a day.
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
              'gap-4',
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

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <div className="glass-card rounded-2xl p-6 md:p-8 text-center">
              <h3 className="font-heading text-xl md:text-2xl font-bold text-charcoal mb-3">
                Want more personalized suggestions?
              </h3>
              <p className="text-warm-gray mb-6 max-w-md mx-auto">
                Take a quick wellness assessment to get activities tailored to your current mood and goals.
              </p>
              <Link
                href="/app/assessment"
                className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
              >
                Take Assessment
                <ChevronRight className="w-4 h-4" />
              </Link>
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
    >
      {/* Gradient placeholder for image */}
      <div className={cn(
        'h-36 md:h-40 relative overflow-hidden',
        activity.gradient
      )}>
        <div className="absolute inset-0" style={{ background: activity.accent }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <activity.icon className="w-16 h-16 text-cream/90" />
        </div>
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/80 backdrop-blur text-warm-gray">
            {activity.level}
          </span>
          <div className="flex items-center gap-1 text-xs text-warm-gray-light bg-white/80 backdrop-blur px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{activity.duration}</span>
          </div>
        </div>

        <h3 className="font-heading text-lg font-bold text-charcoal mb-2 line-clamp-1">
          {activity.title}
        </h3>
        <p className="text-sm text-warm-gray mb-4 line-clamp-2 leading-relaxed">
          {activity.description}
        </p>

        <Link
          href={`/app/activities/${activity.id}`}
          className={cn(
            'btn-gradient w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2',
            'transition-all hover:shadow-strong',
            'group-hover:scale-[1.02]'
          )}
        >
          Try Now
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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