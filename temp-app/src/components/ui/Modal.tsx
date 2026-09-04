'use client'

import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  /** Optional title shown in the header row. */
  title?: string
  children: ReactNode
  className?: string
}

/**
 * Centered dialog on desktop (max-w-md), full-screen on mobile.
 * Blurred backdrop that closes on click. Spring enter/exit animations.
 */
export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Lock body scroll while the modal is open.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              'relative z-10 flex h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-w-md sm:rounded-2xl sm:shadow-strong',
              'pb-safe',
              className,
            )}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="font-heading text-lg font-semibold text-charcoal">{title ?? ''}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-dark text-warm-gray transition-colors hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
