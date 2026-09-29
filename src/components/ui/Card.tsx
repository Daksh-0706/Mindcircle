'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

type CardPadding = 'sm' | 'md' | 'lg'

interface CardProps {
  children: ReactNode
  padding?: CardPadding
  hover?: boolean
  className?: string
}

const paddingStyles: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

/**
 * Glass-card wrapper with optional hover lift animation.
 * Uses the CSS glass-card class and rounded-xl corners.
 */
export default function Card({
  children,
  padding = 'md',
  hover = false,
  className,
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'glass-card rounded-[var(--radius-xl)]',
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
