'use client'

import { motion } from 'framer-motion'
import { MOOD_EMOJIS } from '../../lib/constants'
import { cn } from '../../lib/utils'

interface MoodPickerProps {
  /** Currently selected emoji, or null for none. */
  selected: string | null
  onSelect: (emoji: string | null) => void
  /** Compact = single tight row (editor toolbar). Full = labeled grid. */
  variant?: 'compact' | 'full'
  className?: string
}

/**
 * Mood picker using Google Noto emoji images (consistent on every OS).
 * - compact: inline row that wraps on small screens (journal editor bar)
 * - full: grid with labels under each emoji (dashboard check-in)
 */
export default function MoodPicker({ selected, onSelect, variant = 'full', className }: MoodPickerProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap items-center gap-0.5', className)} role="group" aria-label="Select your mood">
        {MOOD_EMOJIS.map((m) => {
          const isSelected = selected === m.emoji
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => onSelect(isSelected ? null : m.emoji)}
              aria-label={m.label}
              aria-pressed={isSelected}
              title={m.label}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-full transition-all sm:h-10 sm:w-10',
                'hover:scale-110 active:scale-95',
                isSelected ? 'ring-2 ring-plum/60 bg-plum/10' : 'hover:bg-cream-dark',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.image} alt="" draggable={false} className="h-6 w-6 select-none sm:h-7 sm:w-7" />
              {isSelected && (
                <motion.span
                  layoutId="mood-picker-dot"
                  className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-plum"
                />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn('grid w-full grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3', className)}
      role="group"
      aria-label="Select your mood"
    >
      {MOOD_EMOJIS.map((m) => {
        const isSelected = selected === m.emoji
        return (
          <button
            key={m.label}
            type="button"
            onClick={() => onSelect(isSelected ? null : m.emoji)}
            aria-pressed={isSelected}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all sm:p-3',
              'hover:-translate-y-0.5 active:scale-95',
              isSelected ? 'bg-plum/10 ring-2 ring-plum/40' : 'hover:bg-cream-dark',
            )}
          >
            <motion.span
              animate={{ scale: isSelected ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14"
              style={isSelected ? { backgroundColor: `${m.color}22`, boxShadow: `0 4px 20px ${m.color}44` } : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.image} alt="" draggable={false} className="h-9 w-9 select-none sm:h-11 sm:w-11" />
            </motion.span>
            <span
              className={cn(
                'text-[11px] sm:text-xs',
                isSelected ? 'font-semibold text-charcoal' : 'text-warm-gray',
              )}
            >
              {m.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
