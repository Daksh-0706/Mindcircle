'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight, ChevronRight } from 'lucide-react'

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

/* ── Slide Data ───────────────────────────────────────────── */

const slides = [
  {
    title: 'Welcome to MindCircle',
    description: 'A safe space for your mental wellness journey',
    emoji: '🌱',
    bgColor: 'from-sage/20 to-sage-light/20',
    accentColor: 'bg-sage',
  },
  {
    title: 'Journal & Track',
    description:
      'Express yourself freely with private journaling and mood tracking',
    emoji: '📝',
    bgColor: 'from-plum/20 to-plum-light/20',
    accentColor: 'bg-plum',
  },
  {
    title: 'Connect & Heal',
    description:
      'Find support in a community that understands',
    emoji: '💜',
    bgColor: 'from-terracotta/20 to-terracotta-light/20',
    accentColor: 'bg-terracotta',
  },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
}

/* ── Page ─────────────────────────────────────────────────── */

export default function OnboardingPage() {
  const router = useRouter()
  const [[current, direction], setCurrent] = useState([0, 0])
  const isLast = current === slides.length - 1

  const slide = slides[current]

  const paginate = (newDirection: number) => {
    const next = current + newDirection
    if (next < 0) return
    if (next >= slides.length) {
      router.push('/app')
      return
    }
    setCurrent([next, newDirection])
  }

  const handleSkip = () => {
    router.push('/app')
  }

  const handleGetStarted = () => {
    router.push('/app')
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex flex-col items-center justify-between px-4 py-12 sm:py-16"
    >
      {/* Top: Skip button */}
      <div className="w-full max-w-md flex justify-end">
        {!isLast && (
          <button
            onClick={handleSkip}
            className="text-sm text-warm-gray font-medium hover:text-charcoal transition-colors px-3 py-1.5"
          >
            Skip
          </button>
        )}
      </div>

      {/* Middle: Slides */}
      <div className="flex-1 flex items-center justify-center w-full max-w-md">
        <div className="w-full relative overflow-hidden" style={{ minHeight: 420 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="text-center">
                {/* Illustration placeholder: colored circle with emoji */}
                <div className="relative mx-auto mb-10 w-56 h-56">
                  {/* Outer ring */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className={`w-52 h-52 rounded-full bg-gradient-to-br ${slide.bgColor} flex items-center justify-center`}
                      animate={{ rotate: [0, 3, -2, 0] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <span className="text-7xl">{slide.emoji}</span>
                    </motion.div>
                  </div>

                  {/* Orbiting dot */}
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{ transformOrigin: '0 112px' }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full ${slide.accentColor} shadow-medium`}
                    />
                  </motion.div>
                </div>

                {/* Text */}
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal mb-3">
                  {slide.title}
                </h2>
                <p className="text-warm-gray text-base leading-relaxed max-w-xs mx-auto">
                  {slide.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: Navigation */}
      <div className="w-full max-w-md">
        {/* Pagination dots */}
        <div className="flex justify-center gap-2.5 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const dir = i > current ? 1 : -1
                setCurrent([i, dir])
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-gradient-to-r from-plum to-terracotta'
                  : 'w-2 bg-warm-gray-lighter hover:bg-warm-gray-light'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Action button */}
        {isLast ? (
          <button
            onClick={handleGetStarted}
            className="btn-gradient w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => paginate(1)}
            className="btn-gradient w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-plum to-terracotta flex items-center justify-center">
            <Heart className="w-2.5 h-2.5 text-cream" />
          </div>
          <span className="font-heading text-xs text-warm-gray">
            MindCircle
          </span>
        </div>
      </div>
    </motion.div>
  )
}
