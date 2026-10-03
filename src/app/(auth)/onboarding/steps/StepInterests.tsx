'use client'

import { Check } from 'lucide-react'
import NotoEmoji from '@/components/ui/NotoEmoji'
import { INTERESTS } from '@/lib/profile-options'
import { cn } from '@/lib/utils'
import type { Draft, DraftPatch } from '../draft'

interface StepInterestsProps {
  draft: Draft
  patch: (next: DraftPatch) => void
}

/** Step 2 — multi-select interest chips. */
export default function StepInterests({ draft, patch }: StepInterestsProps) {
  const toggle = (label: string) => {
    const on = draft.interests.includes(label)
    patch({ interests: on ? draft.interests.filter((i) => i !== label) : [...draft.interests, label] })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-[#7B7799]">Pick at least three — you can change these later.</p>
        <span className="rounded-full bg-[#EDEBFB] px-3 py-1 text-[12px] font-bold text-[#5B3ACF]">
          {draft.interests.length} selected
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {INTERESTS.map((interest) => {
          const active = draft.interests.includes(interest.label)
          return (
            <button
              key={interest.label}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(interest.label)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all',
                active
                  ? 'border-[#6C4CE0] bg-[#EDEBFB] text-[#3B2C8F]'
                  : 'border-[#E4E2F0] bg-white text-[#4A4763] hover:-translate-y-0.5 hover:border-[#C9C4EE]',
              )}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: interest.disc }}
              >
                <NotoEmoji emoji={interest.emoji} size={14} />
              </span>
              {interest.label}
              {active && <Check size={15} className="text-[#6C4CE0]" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
