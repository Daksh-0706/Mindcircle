'use client'

import { cn } from '../../lib/utils'

type BadgeVariant = 'plum' | 'terracotta' | 'sage' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  plum: 'bg-plum/10 text-plum border-plum/20',
  terracotta: 'bg-terracotta/10 text-terracotta border-terracotta/20',
  sage: 'bg-sage/10 text-sage border-sage/20',
  neutral: 'bg-warm-gray-lighter text-warm-gray border-warm-gray-light/50',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

/**
 * Small pill-shaped badge with color variants and two sizes.
 * Uses subtle backgrounds with matching text/border colors.
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </span>
  )
}