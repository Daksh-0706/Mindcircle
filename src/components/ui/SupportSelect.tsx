'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SupportSelectProps {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  className?: string
  id?: string
}

/**
 * "What would support you right now?" — a styled dropdown in place of a
 * native `<select>`.
 *
 * The native control paints its own menu in OS chrome, which cannot be made
 * to match the rest of the design, so this is a button + listbox built from
 * scratch. The keyboard contract is the part worth being careful about:
 * arrows move the highlighted option, Enter/Space pick it, Escape closes and
 * returns focus to the trigger, and the highlighted option is scrolled into
 * view — all the behaviour the platform control gives you for free.
 */
export function SupportSelect({
  options,
  value,
  onChange,
  className,
  id,
}: SupportSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.indexOf(value)),
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  // Close when the click lands outside the control.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  // Move focus into the list once it opens, whether it was opened by mouse or
  // keyboard. Without this, opening with a click leaves focus on the trigger
  // and the arrow keys would never reach the listbox.
  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  // Keep the highlighted option visible while arrowing through the list.
  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const selectedIndex = options.indexOf(value)

  const openList = (startAt: number) => {
    setActiveIndex(startAt)
    setOpen(true)
  }

  const commit = (index: number) => {
    onChange(options[index])
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openList(selectedIndex >= 0 ? selectedIndex : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openList(selectedIndex >= 0 ? selectedIndex : options.length - 1)
    }
  }

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + options.length) % options.length)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      commit(activeIndex)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => (open ? setOpen(false) : openList(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-5 text-left text-[15px] font-medium transition-all duration-200',
          'h-14 focus:outline-none focus-visible:ring-2 focus-visible:ring-plum/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
          open
            ? 'border-[1.5px] border-plum shadow-[0_10px_30px_rgba(58,31,74,0.18)]'
            : 'border-[1.5px] border-warm-gray-lighter hover:border-plum/40',
        )}
      >
        <span className={cn('truncate', open ? 'text-charcoal' : 'text-charcoal/85')}>
          {value}
        </span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-plum transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="What would support you right now?"
            aria-activedescendant={`${listboxId}-option-${activeIndex}`}
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-2xl border border-plum/10 bg-white p-1.5 shadow-[0_24px_60px_rgba(58,31,74,0.22)]"
          >
            {options.map((option, index) => {
              const isSelected = index === selectedIndex
              const isActive = index === activeIndex
              return (
                <div
                  key={option}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  data-index={index}
                  aria-selected={isSelected}
                  onClick={() => commit(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-[15px] transition-colors duration-150',
                    isSelected
                      ? 'bg-plum font-semibold text-white'
                      : isActive
                        ? 'bg-plum/[0.07] text-charcoal'
                        : 'text-charcoal/80',
                  )}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <Check size={16} aria-hidden="true" className="shrink-0" />}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}