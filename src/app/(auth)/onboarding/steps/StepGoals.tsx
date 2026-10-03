'use client'

import { Check } from 'lucide-react'
import NotoEmoji from '@/components/ui/NotoEmoji'
import { GOALS } from '@/lib/profile-options'
import { cn } from '@/lib/utils'
import type { Draft, DraftPatch } from '../draft'

interface StepGoalsProps {
  draft: Draft
  patch: (next: DraftPatch) => void
}

/** Step 3 — pick the goals that should shape the experience. */
export default function StepGoals({ draft, patch }: StepGoalsProps) {
  const toggle = (id: string) => {
    const on = draft.goals.includes(id)
    patch({ goals: on ? draft.goals.filter((g) => g !== id) : [...draft.goals, id] })
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {GOALS.map((goal) => {
          const active = draft.goals.includes(goal.id)
          return (
            <button
              key={goal.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(goal.id)}
              className={cn(
                'relative flex items-start gap-3 rounded-2xl border bg-white p-3.5 text-left transition-all',
                active
                  ? 'border-[#6C4CE0] shadow-[0_6px_20px_rgba(108,76,224,0.14)]'
                  : 'border-[#E4E2F0] hover:-translate-y-0.5 hover:border-[#C9C4EE]',
              )}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: goal.disc }}
              >
                <NotoEmoji emoji={goal.emoji} size={18} />
              </span>

              <span className="min-w-0 flex-1 pr-5">
                <span className="block font-heading text-[13.5px] font-bold leading-[1.35] text-[#241B4F]">
                  {goal.title}
                </span>
                <span className="mt-0.5 block text-[12px] leading-[1.45] text-[#7B7799]">
                  {goal.description}
                </span>
              </span>

              <span
                aria-hidden="true"
                className={cn(
                  'absolute right-3.5 top-3.5 flex items-center justify-center rounded-full border-2 transition-colors',
                  active
                    ? 'border-[#6C4CE0] bg-[#6C4CE0] text-white'
                    : 'border-[#D8D5E8] bg-white text-transparent',
                )}
                style={{ height: 22, width: 22 }}
              >
                {active && <Check size={13} strokeWidth={3} />}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-[12.5px] text-[#7B7799]">
        {draft.goals.length === 0
          ? 'Nothing selected yet — pick as many as you like.'
          : `${draft.goals.length} goal${draft.goals.length === 1 ? '' : 's'} selected.`}
      </p>
    </div>
  )
}
