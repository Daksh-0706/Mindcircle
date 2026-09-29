'use client'

import { cn } from '../../lib/utils'

interface BlobBackgroundProps {
  className?: string
}

/**
 * Decorative background of 2-3 overlapping, organically-shaped gradient
 * circles. Each uses the `blob-shape` animation with a staggered delay.
 * Pointer-events are disabled so it never blocks interaction.
 */
export default function BlobBackground({ className }: BlobBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div
        className="blob-shape absolute -left-20 -top-20 h-72 w-72 rounded-full bg-plum/15 sm:h-96 sm:w-96"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="blob-shape absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-terracotta/15 sm:h-80 sm:w-80"
        style={{ animationDelay: '1.75s' }}
      />
      <div
        className="blob-shape absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-sage/15 sm:h-72 sm:w-72"
        style={{ animationDelay: '3.5s' }}
      />
    </div>
  )
}
