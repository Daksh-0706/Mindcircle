'use client'

import { cn } from '../../lib/utils'

type SkeletonVariant = 'text' | 'circle' | 'rect'

interface SkeletonProps {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  className?: string
}

/**
 * Shimmering skeleton placeholder with three variants:
 * - text: single-line text block (uses height prop, full width)
 * - circle: avatar/image placeholder (square)
 * - rect: rectangular content block (card, button, etc.)
 */
export default function Skeleton({
  variant = 'rect',
  width,
  height,
  className,
}: SkeletonProps) {
  const baseStyles = 'skeleton rounded'

  const variantStyles: Record<SkeletonVariant, string> = {
    text: 'rounded-full',
    circle: 'rounded-full',
    rect: 'rounded-[var(--radius-lg)]',
  }

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
      aria-hidden="true"
    />
  )
}