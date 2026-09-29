'use client'

import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface EmojiOption {
  emoji: string
  label: string
  color: string
}

interface EmojiSliderProps {
  emojis: readonly EmojiOption[]
  /** Currently selected emoji label, or null for none. */
  selected: string | null
  onSelect: (label: string) => void
  className?: string
}

/**
 * Horizontally scrollable row of large emoji circles for mood selection.
 * The selected emoji scales up with a spring animation and is tinted with
 * its mood color. Emojis are 60px on mobile and 80px on desktop.
 */
export default function EmojiSlider({ emojis, selected, onSelect, className }: EmojiSliderProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="scroll-x-hidden flex items-center gap-3 overflow-x-auto px-1 py-1">
        {emojis.map((item) => {
          const isSelected = item.label === selected
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(item.label)}
              aria-pressed={isSelected}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <motion.span
                className={cn(
                  'flex h-[60px] w-[60px] items-center justify-center rounded-full text-3xl sm:h-20 sm:w-20 sm:text-4xl',
                  isSelected && 'shadow-medium',
                )}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${item.color}22`,
                        boxShadow: `0 4px 20px ${item.color}44`,
                      }
                    : undefined
                }
                animate={{ scale: isSelected ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {item.emoji}
              </motion.span>

              <span
                className={cn(
                  'max-w-20 truncate text-xs transition-colors',
                  isSelected ? 'font-semibold text-charcoal' : 'text-warm-gray',
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
