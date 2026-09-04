'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
  disabled?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'btn-gradient text-white font-medium',
  secondary:
    'bg-cream-dark text-charcoal border border-warm-gray-lighter hover:bg-white hover:border-plum/30',
  ghost:
    'bg-transparent text-charcoal hover:bg-cream-dark',
  danger:
    'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-6 text-sm rounded-full',
  lg: 'h-13 px-8 text-base rounded-full',
}

/**
 * Animated button with four variants and three sizes.
 * Primary uses the gradient background; others use softer fills.
 * Spring-based hover/tap animations via Framer Motion.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-body transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
