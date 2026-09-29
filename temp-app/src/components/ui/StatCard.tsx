'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  trend?: { value: string; positive: boolean }
  className?: string
}

/**
 * Dashboard stat card with icon, large value, label,
 * and optional trend indicator (up/down).
 */
export default function StatCard({
  icon,
  value,
  label,
  trend,
  className,
}: StatCardProps) {
  return (
    <motion.div
      className={cn(
        'glass-card rounded-[var(--radius-xl)] p-5',
        className,
      )}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-warm-gray">{label}</p>
          <p className="font-heading text-3xl font-semibold text-charcoal">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                trend.positive ? 'text-sage' : 'text-danger',
              )}
            >
              {trend.positive ? '▲' : '▼'}
              <span className={cn(
                trend.positive ? 'text-sage' : 'text-danger',
              )}>
                {trend.value}
              </span>
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center h-12 w-12 rounded-xl bg-plum/10 text-plum">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}