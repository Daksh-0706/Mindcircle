/* eslint-disable @next/next/no-img-element */

import { cn } from '@/lib/utils'

type LogoProps = {
  /** Overall height of the mark. The asset is ~1.8:1, so width follows. */
  height?: number
  /** Show the "MindCircle" wordmark beside the mark. */
  withWordmark?: boolean
  /**
   * `light` is for dark surfaces (footer, sidebar art), `dark` for cream and
   * white. The mark itself is a mid-tone gradient and reads on either.
   */
  variant?: 'light' | 'dark'
  className?: string
}

/**
 * The MindCircle brand mark: two reaching hands inside a gradient ring.
 *
 * Sourced from `public/logo.webp`, which is the design's artwork with its flat
 * backdrop keyed out (see `scripts/process-logo.py`). Sized by height so every
 * call site renders the same artwork at the same proportions.
 */
export function Logo({
  height = 32,
  withWordmark = false,
  variant = 'dark',
  className,
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.webp"
        alt="MindCircle"
        height={height}
        // Matches the asset's intrinsic 512x284.
        width={Math.round(height * (512 / 284))}
        className="w-auto shrink-0 select-none"
        style={{ height }}
      />
      {withWordmark && (
        <span
          className={cn(
            'font-heading font-bold',
            variant === 'light' ? 'text-cream' : 'gradient-text',
          )}
          style={{ fontSize: height * 0.62 }}
        >
          MindCircle
        </span>
      )}
    </span>
  )
}
