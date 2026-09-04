'use client'

import { cn } from '../../lib/utils'

type OrbColor = 'plum' | 'terracotta' | 'sage'
type OrbSpeed = 'float' | 'float-slow'

interface FloatingOrbProps {
  /** Diameter in pixels. Defaults to 64. */
  size?: number
  color?: OrbColor
  /** Absolute-positioning classes, e.g. 'top-8 right-6'. */
  position?: string
  speed?: OrbSpeed
  className?: string
}

const colorGradients: Record<OrbColor, string> = {
  plum: 'bg-gradient-to-br from-plum-light to-plum-dark',
  terracotta: 'bg-gradient-to-br from-terracotta-light to-terracotta-dark',
  sage: 'bg-gradient-to-br from-sage-light to-sage-dark',
}

/**
 * Single decorative floating orb with a soft gradient and gentle float
 * animation. Rendered absolutely-positioned and non-interactive.
 */
export default function FloatingOrb({
  size = 64,
  color = 'plum',
  position,
  speed = 'float',
  className,
}: FloatingOrbProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full opacity-80',
        position,
        speed === 'float' ? 'animate-float' : 'animate-float-slow',
        colorGradients[color],
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
}
