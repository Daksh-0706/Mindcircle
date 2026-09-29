'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, Phone, Shield, BookOpen, Leaf, Play, Pause,
  Loader2, CheckCircle, AlertCircle, X
} from 'lucide-react'
import Link from 'next/link'
import { useIsMobile, useIsDesktop } from '../../../hooks/useMediaQuery'
import { cn } from '../../../lib/utils'

const helplines = [
  {
    id: 'icall',
    name: 'iCall',
    number: '9152987821',
    hours: '24/7',
    color: '#7B9E6B',
    bgColor: 'bg-sage',
    description: 'Professional counseling via phone & email',
    icon: Phone,
  },
  {
    id: 'vandrevala',
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    hours: '24/7',
    color: '#4A2C5E',
    bgColor: 'bg-plum',
    description: 'Mental health support & crisis intervention',
    icon: Shield,
  },
  {
    id: 'aasra',
    name: 'AASRA',
    number: '9820466726',
    hours: '24/7',
    color: '#C45D3E',
    bgColor: 'bg-terracotta',
    description: 'Suicide prevention & emotional support',
    icon: Heart,
  },
]

const resources = [
  {
    title: 'Understanding Anxiety',
    description: 'Learn about anxiety symptoms, triggers, and evidence-based coping strategies.',
    icon: BookOpen,
    color: '#4A2C5E',
    bg: 'from-plum/10 to-plum/5',
  },
  {
    title: 'Grounding Techniques',
    description: 'Quick 5-4-3-2-1 sensory exercises to manage panic and dissociation.',
    icon: Leaf,
    color: '#7B9E6B',
    bg: 'from-sage/10 to-sage/5',
  },
]

const BREATHING_PHASES = [
  { label: 'Breathe in...', duration: 4000, scale: 1.4 },
  { label: 'Hold...', duration: 2000, scale: 1.4 },
  { label: 'Breathe out...', duration: 6000, scale: 1.0 },
] as const

export default function CrisisPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [breathingScale, setBreathingScale] = useState(1)
  const phaseRef = useRef(currentPhase)
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    phaseRef.current = currentPhase
  }, [currentPhase])

  useEffect(() => {
    if (!isPlaying) return

    const runCycle = () => {
      const phase = BREATHING_PHASES[phaseRef.current]
      setBreathingScale(phase.scale)

      const phaseTimeout = setTimeout(() => {
        setCurrentPhase(prev => (prev + 1) % BREATHING_PHASES.length)
      }, phase.duration)

      const cycleTimeout = setTimeout(() => {
        if (isPlaying) runCycle()
      }, BREATHING_PHASES.reduce((sum, p) => sum + p.duration, 0))

      animationRef.current = cycleTimeout
      return () => {
        clearTimeout(phaseTimeout)
        clearTimeout(cycleTimeout)
      }
    }

    runCycle()

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current)
    }
  }, [isPlaying])

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
            <div className="flex items-center justify-between">
              <Link
                href="/app"
                className="glass-card p-2 rounded-xl hover:shadow-medium transition-shadow"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal" />
              </Link>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <Heart className="w-6 h-6" style={{ color: '#D64545' }} />
                <span className="font-heading text-xl font-bold text-charcoal">Crisis Support</span>
              </motion.div>

              {/* Desktop: Call Now button in header */}
              {isDesktop && (
                <a
                  href="tel:9152987821"
                  className="btn-gradient px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-strong"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ backgroundColor: '#D64545' }}
            >
              <Heart className="w-8 h-8 text-cream" />
            </motion.div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
              You&apos;re not alone
            </h1>
            <p className="text-lg text-warm-gray max-w-xl mx-auto">
              If you&apos;re in crisis, please reach out right now. Help is available 24/7, and you matter.
            </p>
          </motion.section>

          {/* Helpline Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-heading text-xl font-bold text-charcoal mb-4">Immediate Help</h2>
            <div className={cn(
              'gap-4',
              isDesktop ? 'grid grid-cols-3' : 'space-y-4'
            )}>
              {helplines.map((helpline, index) => (
                <motion.article
                  key={helpline.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={cn(
                    'rounded-2xl p-5 relative overflow-hidden shadow-soft',
                    helpline.bgColor,
                    isDesktop ? 'h-full flex flex-col' : ''
                  )}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -translate-x-1/2 translate-y-1/2" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <helpline.icon className="w-6 h-6 text-cream" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-lg font-bold text-cream mb-1">{helpline.name}</h3>
                      <p className="text-cream/80 text-sm mb-2">{helpline.description}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 bg-sage rounded-full" />
                          <span className="font-medium">{helpline.hours}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`tel:${helpline.number.replace(/\D/g, '')}`}
                    className="mt-4 block w-full text-center bg-white/20 hover:bg-white/30 text-cream font-medium py-3 rounded-xl transition-colors"
                  >
                    Call {helpline.number}
                  </a>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Breathing Circle */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-heading text-xl font-bold text-charcoal mb-4 text-center">Breathing Exercise</h2>
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-[280px] h-[280px]">
                {/* Outer rings */}
                {[3, 2, 1].map((ring) => (
                  <motion.div
                    key={ring}
                    animate={{
                      scale: isPlaying ? breathingScale : 1,
                      opacity: [0.15, 0.1, 0.05][ring - 1],
                    }}
                    transition={{
                      duration: isPlaying ? BREATHING_PHASES.reduce((sum, p) => sum + p.duration, 0) / 1000 : 0,
                      ease: 'easeInOut',
                      repeat: isPlaying ? Infinity : 0,
                    }}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: '#4A2C5E' }}
                  />
                ))}

                {/* Main circle */}
                <motion.div
                  animate={{
                    scale: isPlaying ? breathingScale : 1,
                    boxShadow: isPlaying
                      ? '0 0 60px rgba(74, 44, 94, 0.3)'
                      : '0 0 30px rgba(74, 44, 94, 0.15)',
                  }}
                  transition={{
                    duration: isPlaying ? BREATHING_PHASES.reduce((sum, p) => sum + p.duration, 0) / 1000 : 0.3,
                    ease: 'easeInOut',
                    repeat: isPlaying ? Infinity : 0,
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-plum/20 to-terracotta/20 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.p
                      key={currentPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="font-heading text-2xl font-medium text-plum"
                    >
                      {BREATHING_PHASES[currentPhase].label}
                    </motion.p>
                    <p className="text-sm text-warm-gray mt-2">
                      {isPlaying ? 'Follow the circle' : 'Tap to start'}
                    </p>
                  </div>
                </motion.div>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="glass-card px-8 py-3 rounded-xl flex items-center gap-2 font-medium text-charcoal hover:shadow-medium transition-shadow"
                aria-label={isPlaying ? 'Pause breathing exercise' : 'Start breathing exercise'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start</span>
                  </>
                )}
              </button>
            </div>
          </motion.section>

          {/* Resources */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="font-heading text-xl font-bold text-charcoal mb-4">Helpful Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource, index) => (
                <motion.article
                  key={resource.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="glass-card rounded-2xl p-5 hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      resource.bg
                    )}>
                      <resource.icon className="w-6 h-6" style={{ color: resource.color }} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-charcoal">{resource.title}</h3>
                      <p className="text-sm text-warm-gray mt-1">{resource.description}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Emergency Disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-4 border border-terracotta/30 bg-terracotta/5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-terracotta-dark">Emergency Notice</p>
                <p className="text-sm text-terracotta/80 mt-1">
                  If you or someone else is in immediate danger, please call emergency services (112/911) or go to the nearest emergency room.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile: Sticky Call Now button */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="fixed bottom-0 left-0 right-0 pb-safe z-50 px-4 py-4 bg-gradient-to-t from-cream to-transparent"
          >
            <a
              href="tel:9152987821"
              className="btn-gradient w-full py-4 rounded-xl font-medium text-base flex items-center justify-center gap-2 shadow-strong"
            >
              <Phone className="w-5 h-5" />
              Call iCall Now: 9152987821
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
