'use client'

import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  /** Distance in px that dragging downward must exceed to dismiss. */
  dismissThreshold?: number
}

/**
 * Mobile bottom sheet that slides up from the bottom of the screen.
 * Includes a drag handle bar and a blurred backdrop overlay.
 * Dragging down past `dismissThreshold` (or with enough velocity) closes it.
 */
export default function BottomSheet({
  isOpen,
  onClose,
  children,
  className,
  dismissThreshold = 120,
}: BottomSheetProps) {
  // Lock body scroll while the sheet is open.
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'absolute inset-x-0 bottom-0 z-10 mx-auto max-w-lg rounded-t-3xl bg-white pb-safe shadow-strong',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > dismissThreshold || info.velocity.y > 600) onClose()
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-warm-gray-lighter" />
            </div>

            <div className="px-5 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
