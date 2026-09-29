'use client'

import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface TabItem {
  label: string
  value: string
}

interface TabsProps {
  tabs: readonly TabItem[]
  active: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Horizontal tab bar. Horizontally scrollable (scrollbar hidden) on mobile,
 * centered on desktop. The active tab has an animated underline that slides
 * between tabs using a shared `layoutId`.
 */
export default function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="scroll-x-hidden flex gap-1 overflow-x-auto sm:justify-center">
        {tabs.map((tab) => {
          const isActive = tab.value === active
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              aria-selected={isActive}
              role="tab"
              className={cn(
                'relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                isActive ? 'text-plum' : 'text-warm-gray hover:text-charcoal',
              )}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-plum to-terracotta"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
