'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import Button from './Button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  }
  className?: string
}

/**
 * Centered empty state layout with icon, title, description,
 * and optional CTA button. Used when lists have no items.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col items-center justify-center text-center gap-4 py-12 px-4',
        className,
      )}
    >
      <div
        className="flex shrink-0 items-center justify-center h-16 w-16 rounded-2xl bg-plum/10 text-plum"
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="max-w-xs">
        <h3 className="font-heading text-xl font-semibold text-charcoal">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-warm-gray">{description}</p>
        )}
      </div>

      {action && (
        <Button variant={action.variant} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}