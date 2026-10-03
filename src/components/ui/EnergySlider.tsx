'use client'

import { cn } from '../../lib/utils'

interface EnergySliderProps {
  /** Current value. */
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  /** Labels under the two ends of the track. */
  lowLabel?: string
  highLabel?: string
  className?: string
}

/**
 * A 1–10 "how much energy do you have" slider.
 *
 * Deliberately still a native `<input type="range">` — that keeps arrow-key
 * stepping, Home/End, and the screen-reader value announcement working, which
 * a div-based slider would have to re-implement. All the premium look comes
 * from the `.slider-premium` CSS in globals.css: a plum pill track with a
 * white thumb that lifts and glows on hover and presses in on drag.
 *
 * The filled part of the track is driven by a `--slider-fill` custom property
 * so React, not CSS, stays the single source of truth for the value.
 */
export function EnergySlider({
  value,
  min = 1,
  max = 10,
  onChange,
  lowLabel = 'Drained',
  highLabel = 'Full of energy',
  className,
}: EnergySliderProps) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('select-none', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-premium"
        style={{ '--slider-fill': `${percent}%` } as React.CSSProperties}
        aria-valuetext={`${value} out of ${max}`}
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium tracking-wide text-warm-gray">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}