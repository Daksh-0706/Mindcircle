'use client'

import { cn } from '../../lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

interface AvatarProps {
  src?: string
  alt?: string
  initials?: string
  size?: AvatarSize
  online?: boolean
  className?: string
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; dot: string }> = {
  sm:  { container: 'h-9 w-9',   text: 'text-xs', dot: 'h-2.5 w-2.5 border' },
  md:  { container: 'h-11 w-11', text: 'text-sm', dot: 'h-3 w-3 border-2' },
  lg:  { container: 'h-14 w-14', text: 'text-base', dot: 'h-3.5 w-3.5 border-2' },
  xl:  { container: 'h-20 w-20', text: 'text-lg', dot: 'h-4 w-4 border-2' },
  '2xl': { container: 'h-[100px] w-[100px]', text: 'text-xl', dot: 'h-4 w-4 border-2' },
  '3xl': { container: 'h-[120px] w-[120px]', text: 'text-2xl', dot: 'h-5 w-5 border-2' },
}

/**
 * Avatar with image or initials fallback, gradient background,
 * and an optional online indicator dot.
 */
export default function Avatar({
  src,
  alt,
  initials,
  size = 'md',
  online,
  className,
}: AvatarProps) {
  const s = sizeStyles[size]

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={alt || ''}
          className={cn(
            s.container,
            'rounded-full object-cover',
          )}
        />
      ) : (
        <div
          className={cn(
            s.container,
            'flex items-center justify-center rounded-full bg-gradient-to-br from-plum to-terracotta text-white font-heading font-semibold select-none',
          )}
          aria-label={alt}
        >
          <span className={s.text}>{initials || '?'}</span>
        </div>
      )}

      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-cream',
            online ? 'bg-sage' : 'bg-warm-gray-light',
            s.dot,
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  )
}
