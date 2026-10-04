'use client'

import { Camera, Globe, Lock, MapPin } from 'lucide-react'
import NotoEmoji from '@/components/ui/NotoEmoji'
import { Select } from '@/components/ui/Select'
import { ONBOARDING_AVATARS, PRONOUNS } from '@/lib/profile-options'
import { cn } from '@/lib/utils'
import type { Draft, DraftPatch } from '../draft'

interface StepProfileProps {
  draft: Draft
  patch: (next: DraftPatch) => void
}

const fieldBox =
  'block rounded-2xl border border-[#E4E2F0] bg-white px-4 py-2.5 transition-colors focus-within:border-[#6C4CE0] focus-within:ring-4 focus-within:ring-[#6C4CE0]/10'
const fieldLabel = 'block text-[12px] font-medium text-[#7B7799]'
const fieldInput =
  'mt-1 w-full bg-transparent text-[16px] font-semibold text-[#241B4F] outline-none placeholder:font-normal placeholder:text-[#B3B0C7]'

/** One of the two visibility cards in step 1. */
function VisibilityOption({
  active,
  onSelect,
  icon,
  title,
}: {
  active: boolean
  onSelect: () => void
  icon: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all',
        active
          ? 'border-[#6C4CE0] bg-white ring-2 ring-[#6C4CE0]/20'
          : 'border-[#E4E2F0] bg-white/60 hover:border-[#C9C3E8]',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          active ? 'border-[#6C4CE0]' : 'border-[#C9C6DC]',
        )}
      >
        {active && <span className="h-2 w-2 rounded-full bg-[#6C4CE0]" />}
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0ECFF] text-[#5B5780]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-heading text-[13.5px] font-bold leading-tight text-[#241B4F]">
          {title}
        </span>
      </span>
    </button>
  )
}

/**
 * Pronoun picker.
 *
 * Uses the shared Select rather than a native <select>: the native menu paints
 * itself in OS chrome, which looked nothing like the rest of the setup flow.
 * The menu is portalled, so opening it cannot grow or scroll this step.
 */
function PronounSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className={fieldBox}>
      <span className={fieldLabel}>Pronouns</span>
      <Select
        className="mt-1"
        size="field"
        ariaLabel="Pronouns"
        placeholder="Select pronouns"
        options={PRONOUNS}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

/** Step 1 — name, pronouns, location, a short bio, visibility and the avatar. */
export default function StepProfile({ draft, patch }: StepProfileProps) {
  const shuffleAvatar = () => {
    const index = ONBOARDING_AVATARS.findIndex((a) => a.emoji === draft.avatar)
    const next = ONBOARDING_AVATARS[(index + 1) % ONBOARDING_AVATARS.length]
    patch({ avatar: next.emoji })
  }

  const selected = ONBOARDING_AVATARS.find((a) => a.emoji === draft.avatar) ?? ONBOARDING_AVATARS[0]

  return (
    <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
      {/* Left: avatar preview + picker */}
      <div>
        <div className="relative mx-auto w-[136px]">
          <div
            className="flex h-[136px] w-[136px] items-center justify-center rounded-full"
            style={{ background: selected.disc }}
          >
            <NotoEmoji emoji={selected.emoji} size={58} />
          </div>
          <button
            type="button"
            onClick={shuffleAvatar}
            aria-label="Shuffle avatar"
            title="Shuffle avatar"
            className="absolute bottom-0 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#E4E2F0] bg-white text-[#5B5780] shadow-[0_4px_14px_rgba(74,44,94,0.12)] transition-transform hover:-translate-y-0.5"
          >
            <Camera size={16} aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-center font-heading text-[14px] font-bold text-[#241B4F]">
          Choose an avatar
        </p>
        <div className="mt-2.5 grid grid-cols-3 justify-items-center gap-2.5">
          {ONBOARDING_AVATARS.map((option) => {
            const active = option.emoji === draft.avatar
            return (
              <button
                key={option.emoji}
                type="button"
                aria-pressed={active}
                aria-label={`Avatar ${option.emoji}`}
                onClick={() => patch({ avatar: option.emoji })}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                  active
                    ? 'ring-2 ring-[#6C4CE0] ring-offset-4 ring-offset-white'
                    : 'hover:-translate-y-0.5',
                )}
                style={{ background: option.disc }}
              >
                <NotoEmoji emoji={option.emoji} size={22} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: fields.
          One column at every desktop width. A two-column variant was tried to
          buy vertical room, but it squeezed the inputs to ~175px — clipped
          placeholders and a scrolling textarea — which is a worse trade than
          tightening the card's own spacing (see .mc-* in globals.css). */}
      <div className="mc-fields space-y-2.5">
        <div className="space-y-2.5">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <label className={fieldBox}>
              <span className={fieldLabel}>Name</span>
              <input
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                maxLength={40}
                placeholder="What should we call you?"
                className={fieldInput}
              />
            </label>
            <PronounSelect
              value={draft.pronouns}
              onChange={(pronouns) => patch({ pronouns })}
            />
          </div>

        <label className={fieldBox}>
          <span className={fieldLabel}>Location</span>
          <span className="mt-1 flex items-center gap-2">
            <MapPin size={17} className="shrink-0 text-[#A09CC4]" aria-hidden="true" />
            <input
              value={draft.location}
              onChange={(e) => patch({ location: e.target.value })}
              maxLength={60}
              placeholder="City"
              className="w-full bg-transparent text-[16px] font-semibold text-[#241B4F] outline-none placeholder:font-normal placeholder:text-[#B3B0C7]"
            />
          </span>
        </label>

        <label className={fieldBox}>
          <span className={fieldLabel}>Tell us a little about yourself</span>
          <textarea
            value={draft.bio}
            onChange={(e) => patch({ bio: e.target.value })}
            maxLength={200}
            rows={2}
            placeholder="One line is enough — something people can start a conversation with."
            className="mt-1 w-full resize-none bg-transparent text-[15px] leading-[22px] text-[#241B4F] outline-none placeholder:text-[#B3B0C7]"
          />
          <span className="block text-right text-[12px] text-[#A3A0B8]">{draft.bio.length}/200</span>
        </label>
        </div>

        {/* Visibility — asked here, in step 1, so it is a choice the person
            makes rather than a default they discover later. */}
        {/* A div, not <fieldset>: a <legend> is rendered into the top border, which
            broke the rounded box in half. role="group" keeps the semantics. */}
        <div
          role="group"
          aria-labelledby="visibility-label"
          className="rounded-2xl border border-[#E4E2F0] bg-[#F7F4FF] p-3 xl:p-3.5"
        >
          <p
            id="visibility-label"
            className="flex items-center gap-2 font-heading text-[14px] font-bold text-[#241B4F]"
          >
            <Lock size={15} className="text-[#5B5780]" aria-hidden="true" />
            Profile visibility
          </p>
          <p className="mb-2 mt-1 text-[12px] leading-[17px] text-[#7B7799]">
            Choose who can see your profile.
          </p>

          <div role="radiogroup" aria-labelledby="visibility-label" className="grid gap-2 sm:grid-cols-2">
            <VisibilityOption
              active={draft.isPublic}
              onSelect={() => patch({ isPublic: true })}
              icon={<Globe size={17} aria-hidden="true" />}
              title="Public profile"
            />
            <VisibilityOption
              active={!draft.isPublic}
              onSelect={() => patch({ isPublic: false })}
              icon={<Lock size={17} aria-hidden="true" />}
              title="Private profile"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
