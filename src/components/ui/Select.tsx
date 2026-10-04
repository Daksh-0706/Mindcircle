'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export type SelectOption = {
  value: string
  label: string
}

interface SelectProps {
  options: readonly (string | SelectOption)[]
  value: string
  onChange: (value: string) => void
  /** Rendered when `value` is not in `options` (e.g. nothing chosen yet). */
  placeholder?: string
  ariaLabel: string
  /** Visual size. `field` matches the onboarding inputs, `control` the app's own. */
  size?: 'field' | 'control'
  className?: string
  id?: string
}

type Rect = { top: number; left: number; width: number; height: number }

/**
 * A styled dropdown in place of a native `<select>`.
 *
 * The native control paints its menu in OS chrome — grey rows, a system
 * highlight colour, a different font — which cannot be made to match this
 * design, so this is a button plus a listbox built from scratch.
 *
 * The menu is rendered in a portal and positioned with `fixed`, which matters
 * here: the onboarding card is a scroll container, so an absolutely-positioned
 * menu would be clipped by it, and the app's fixed bottom nav would paint over
 * it. Portalling escapes both.
 *
 * The keyboard contract is the part worth being careful about: arrows move the
 * highlighted option, Home/End jump, Enter/Space pick, Escape closes and returns
 * focus to the trigger, and the highlighted option is scrolled into view — all
 * the behaviour the platform control gives you for free.
 */
export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select',
  ariaLabel,
  size = 'field',
  className,
  id,
}: SelectProps) {
  const items: SelectOption[] = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  )

  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, items.findIndex((o) => o.value === value)),
  )
  // Where the menu should sit, in viewport coordinates. Null until measured.
  const [rect, setRect] = useState<Rect | null>(null)
  const [flipUp, setFlipUp] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selectedIndex = items.findIndex((o) => o.value === value)

  /** Measured on open so the menu tracks the trigger even if the page scrolls. */
  const place = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const box = trigger.getBoundingClientRect()
    setRect({ top: box.top, left: box.left, width: box.width, height: box.height })

    // Flip above the trigger when the menu would run past the viewport bottom.
    const menuHeight = items.length * 44 + 12
    setFlipUp(window.innerHeight - (box.bottom + 8) < menuHeight && box.top > menuHeight)
  }

  useLayoutEffect(() => {
    if (!open) return
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items.length])

  // Close when the click lands outside the control or the menu.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [open])

  // Move focus into the list once it opens, whether by mouse or keyboard.
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

  const openList = (startAt: number) => {
    setActiveIndex(startAt)
    setOpen(true)
  }

  const commit = (index: number) => {
    onChange(items[index].value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openList(selectedIndex >= 0 ? selectedIndex : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openList(selectedIndex >= 0 ? selectedIndex : items.length - 1)
    }
  }

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + items.length) % items.length)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(items.length - 1)
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

  const selectedLabel = selectedIndex >= 0 ? items[selectedIndex].label : null
  const compact = size === 'field'

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
        aria-label={ariaLabel}
        className={cn(
          'flex w-full items-center justify-between gap-2 text-left transition-all duration-200',
          compact
            ? 'rounded-xl px-3.5 py-2 text-[16px] font-semibold'
            : 'h-12 rounded-[18px] pl-12 pr-12 text-base font-bold sm:h-14 sm:text-lg',
          open
            ? 'border-[#6C4CE0] bg-white shadow-[0_8px_24px_rgba(108,76,224,0.14)]'
            : cn(
                'border border-[#E4E2F0] bg-white hover:border-[#C9C3E8]',
                !compact && 'border-transparent bg-[#F3EFF8] hover:border-plum/30',
              ),
        )}
      >
        <span
          className={cn(
            'truncate',
            compact
              ? selectedLabel
                ? 'text-[#241B4F]'
                : 'font-normal text-[#B3B0C7]'
              : selectedLabel
                ? 'text-[#2A1B3D]'
                : 'font-medium text-[#8A8A8A]',
          )}
        >
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={cn(
            'shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            compact ? 'text-[#A09CC4]' : 'text-[#8A8A8A]',
            open && 'rotate-180 text-[#6C4CE0]',
          )}
        />
      </button>

      {open &&
        rect &&
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              aria-activedescendant={`${listboxId}-option-${activeIndex}`}
              tabIndex={-1}
              onKeyDown={onListKeyDown}
              initial={{ opacity: 0, y: flipUp ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: flipUp ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                left: rect.left,
                width: rect.width,
                ...(flipUp
                  ? { bottom: window.innerHeight - rect.top + 8 }
                  : { top: rect.top + rect.height + 8 }),
              }}
              className="z-[100] origin-top overflow-hidden rounded-2xl border border-[#E4E2F0] bg-white p-1.5 shadow-[0_24px_60px_rgba(58,31,74,0.22)]"
            >
              {items.map((option, index) => {
                const isSelected = index === selectedIndex
                const isActive = index === activeIndex
                return (
                  <div
                    key={option.value}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    onClick={() => commit(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3.5 transition-colors duration-150',
                      compact
                        ? 'py-2.5 text-[15px]'
                        : 'px-4 py-3 text-[15px]',
                      isSelected
                        ? 'bg-[#F0ECFF] font-bold text-[#3B2C8F]'
                        : isActive
                          ? 'bg-[#F7F4FF] text-[#241B4F]'
                          : 'text-[#4A4763]',
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check size={16} aria-hidden="true" className="shrink-0 text-[#6C4CE0]" />
                    )}
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}