'use client'

import { useEffect, useState } from 'react'
import { Check, Heart, Lock, MapPin, Pencil, Target, Text, UserPlus } from 'lucide-react'
import NotoEmoji from '@/components/ui/NotoEmoji'
import { cn } from '@/lib/utils'
import { GOALS, INTERESTS, interestLabel } from '@/lib/profile-options'
import type { Draft } from '../draft'

interface StepSummaryProps {
  draft: Draft
  /** Jump back to an earlier step when an edit pencil is pressed. */
  onEdit: (step: number) => void
}

const chip =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-[#3B2C8F]'

/**
 * Chip counts shown before collapsing into "+N more".
 *
 * A summary is for checking your choices at a glance, not for reprinting the
 * whole list — and with 16 interests plus 9 goals the card grows past the
 * viewport and starts scrolling, which this step deliberately avoids.
 */
const MAX_INTEREST_CHIPS = 6
const MAX_GOAL_CHIPS = 6

/** Step 4 — the finished summary plus suggested people. */
export default function StepSummary({ draft, onEdit }: StepSummaryProps) {
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [suggestions, setSuggestions] = useState<
    { person: { id: string; name: string; avatar_emoji: string; interests: string[] }; shared: string[] }[]
  >([])

  // Real connections — the people you can actually message. Sample data is
  // gone, so this reads the same endpoint the New chat page uses.
  useEffect(() => {
    let active = true
    fetch('/api/connections?status=accepted')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => {
        if (!active) return
        const rows = (json.data ?? [])
          .filter(
            (c: { direction: string; person?: unknown }) => c.direction === 'accepted' && c.person,
          )
          .slice(0, 4)
          .map((c: { id: string; person: { id: string; name: string; avatar_emoji: string; interests: string[] } }) => ({
            person: c.person,
            shared: c.person.interests.filter((i: string) => draft.interests.includes(i)),
          }))
        setSuggestions(rows)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
    // Re-rank only when the person's own picks change, not on every keystroke
    // elsewhere in the draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.interests.join(',')])


  const toggleConnect = (id: string) =>
    setConnected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      {/* ── Summary card ─────────────────────────────────── */}
      <div className="rounded-2xl border border-[#E4E2F0] bg-white p-3.5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EDEBFB]">
            <NotoEmoji emoji={draft.avatar} size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-[20px] font-extrabold text-[#241B4F]">
              {draft.name || 'You'}
            </p>
            {draft.pronouns && (
              <p className="mt-0.5 text-[13px] text-[#5B5780]">{draft.pronouns}</p>
            )}
            {draft.location && (
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#7B7799]">
                <MapPin size={14} aria-hidden="true" /> {draft.location}
              </p>
            )}
          </div>
          <EditButton onClick={() => onEdit(0)} label="profile details" />
        </div>

        <SummaryRow
          icon={<Text size={16} aria-hidden="true" />}
          title="About you"
          onEdit={() => onEdit(0)}
        >
          <p className="text-[13.5px] leading-[22px] text-[#4A4763]">
            {draft.bio || 'No bio yet — add one so people know how to say hi.'}
          </p>
        </SummaryRow>

        <SummaryRow
          icon={<Lock size={16} aria-hidden="true" />}
          title="Profile visibility"
          onEdit={() => onEdit(0)}
        >
          <p className="text-[13.5px] leading-[22px] text-[#4A4763]">
            {draft.isPublic
              ? 'Public — anyone on Mindcircle can find and view your profile.'
              : 'Private — only people you connect with can view your profile.'}
          </p>
        </SummaryRow>

        <SummaryRow
          icon={<Heart size={16} aria-hidden="true" />}
          title="Interests"
          onEdit={() => onEdit(1)}
        >
          <div className="flex flex-wrap gap-1.5">
            {draft.interests.length === 0 && (
              <p className="text-[13.5px] text-[#7B7799]">Nothing picked yet.</p>
            )}
            {draft.interests.slice(0, MAX_INTEREST_CHIPS).map((label) => {
              const interest = interestLabel(label)
              return (
                <span key={label} className={chip} style={{ background: interest.disc }}>
                  {interest.emoji} {interest.label}
                </span>
              )
            })}
            {draft.interests.length > MAX_INTEREST_CHIPS && (
              <span className={cn(chip, 'bg-[#F1EFF9] text-[#7B7799]')}>
                +{draft.interests.length - MAX_INTEREST_CHIPS} more
              </span>
            )}
          </div>
        </SummaryRow>

        <SummaryRow
          icon={<Target size={16} aria-hidden="true" />}
          title="Goals"
          onEdit={() => onEdit(2)}
        >
          <div className="flex flex-wrap gap-1.5">
            {draft.goals.length === 0 && (
              <p className="text-[13.5px] text-[#7B7799]">No goals chosen yet.</p>
            )}
            {draft.goals.slice(0, MAX_GOAL_CHIPS).map((id) => {
              const goal = GOALS.find((g) => g.id === id)
              if (!goal) return null
              return (
                <span key={id} className={chip} style={{ background: goal.disc }}>
                  {goal.emoji} {goal.title}
                </span>
              )
            })}
            {draft.goals.length > MAX_GOAL_CHIPS && (
              <span className={cn(chip, 'bg-[#F1EFF9] text-[#7B7799]')}>
                +{draft.goals.length - MAX_GOAL_CHIPS} more
              </span>
            )}
          </div>
        </SummaryRow>
      </div>

      {/* ── Find your people ─────────────────────────────── */}
      <div className="rounded-2xl border border-[#E4E2F0] bg-white p-3.5">
        <h2 className="font-heading text-[18px] font-extrabold text-[#241B4F]">Find your people</h2>
        <p className="mt-1 text-[13px] leading-5 text-[#7B7799]">
          Based on your interests and goals, here are a few people you might connect with.
        </p>

        <div className="mt-3 space-y-2">
          {suggestions.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#E4E2F0] px-4 py-5 text-center text-[13px] text-warm-gray">
              Once you connect with someone they will show up here, ready to message.
            </p>
          )}
          {suggestions.map(({ person, shared }) => {
            const isConnected = connected.has(person.id)
            const into =
              shared.length > 0
                ? `Also into ${shared.slice(0, 2).join(', ')}`
                : `Also into ${person.interests.slice(0, 2).join(', ')}`
            return (
              <div
                key={person.id}
                className="flex items-center gap-3 rounded-xl border border-[#EEECF7] bg-[#FBFAFF] p-2.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFEAFB]">
                  <NotoEmoji emoji={person.avatar_emoji} size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-[#241B4F]">{person.name}</p>
                  <p className="truncate text-[12px] text-[#7B7799]">{into}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleConnect(person.id)}
                  aria-pressed={isConnected}
                  className={
                    isConnected
                      ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#C9C4EE] bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#5B3ACF]'
                      : 'inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#241B4F] px-3.5 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-[#1B1540]'
                  }
                >
                  {isConnected ? (
                    <>
                      <Check size={13} aria-hidden="true" /> Sent
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} aria-hidden="true" /> Connect
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <p className="mt-3 text-[12px] text-[#A3A0B8]">
          {INTERESTS.length} interests and {GOALS.length} goals available — edit any time from
          Settings.
        </p>
      </div>
    </div>
  )
}

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${label}`}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8C88AE] transition-colors hover:bg-[#EDEBFB] hover:text-[#5B3ACF]"
    >
      <Pencil size={15} aria-hidden="true" />
    </button>
  )
}

function SummaryRow({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ReactNode
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mt-3 border-t border-[#EEECF7] pt-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[13.5px] font-bold text-[#241B4F]">
          <span className="text-[#8C88AE]">{icon}</span>
          {title}
        </p>
        <EditButton onClick={onEdit} label={title} />
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}
