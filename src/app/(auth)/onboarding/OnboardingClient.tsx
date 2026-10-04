'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '../../../components/common/Logo'
import { cn } from '@/lib/utils'
import { PRESELECTED_GOALS } from '@/lib/profile-options'
import type { Draft, DraftPatch } from './draft'
import StepProfile from './steps/StepProfile'
import StepInterests from './steps/StepInterests'
import StepGoals from './steps/StepGoals'
import StepSummary from './steps/StepSummary'

/* ── Step config ──────────────────────────────────────────── */

type StepConfig = {
  label: string
  sub: string
  heading: (draft: Draft) => string
  intro: string
  /** Full-bleed backdrop for this step (see the onboarding mockups). */
  bg: string
}

const STEPS: StepConfig[] = [
  {
    label: 'Profile Details',
    sub: 'Tell us about yourself',
    heading: () => "Let's set up your profile",
    intro:
      'A few details to help you connect with the right people and make your experience more meaningful.',
    bg: '/onboarding/bg-plain.png',
  },
  {
    label: 'Interests',
    sub: 'What are you into?',
    heading: () => 'What are you into?',
    intro: 'Pick a few interests so we can show you people and rooms that actually match your vibe.',
    bg: '/onboarding/bg-plain.png',
  },
  {
    label: 'Your Goals',
    sub: 'What do you want from Mindcircle?',
    heading: () => 'What do you want from Mindcircle?',
    intro:
      'Choose a few goals so we can personalize your experience and show you people with similar journeys.',
    bg: '/onboarding/bg-plain.png',
  },
  {
    label: "You're all set!",
    sub: "Let's begin your journey",
    heading: (draft) => (draft.name ? `You're all set, ${draft.name}! 🎉` : "You're all set! 🎉"),
    intro: "Your profile is ready. Here's a quick summary. You can always edit this later.",
    bg: '/onboarding/bg-plain.png',
  },
]

const stepTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
}

/**
 * Remembers that the setup gate has been satisfied.
 *
 * AppLayout only checks the profile once per browser; without this flag every
 * fresh visitor would bounce back to /onboarding on their next navigation.
 */
function markOnboarded() {
  if (typeof document === 'undefined') return
  document.cookie = `mc_onboarded=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}

/* ── Page ─────────────────────────────────────────────────── */

export default function OnboardingClient() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<Draft>({
    name: '',
    pronouns: '',
    location: '',
    bio: '',
    avatar: '🌱',
    // Private by default: a new member has not yet chosen to be findable, and
    // making that an explicit first step keeps it from being a silent setting.
    isPublic: false,
    interests: [],
    goals: PRESELECTED_GOALS,
  })

  const patch = (next: DraftPatch) => setDraft((prev) => ({ ...prev, ...next }))

  // Session guard + profile provisioning + prefill. The dashboard and several
  // API routes read `users`, so a signup that never gets here would land on a
  // broken first screen.
  useEffect(() => {
    let active = true
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!active) return
        if (!data.user) {
          router.replace('/login')
          return
        }
        return fetch('/api/profile/ensure', { method: 'POST' })
          .then(() => (active ? fetch('/api/me') : Response.error()))
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            if (!active || !json) return
            const profile = json.profile ?? {}
            const settings = (profile.settings ?? {}) as Record<string, unknown>
            const pick = (column: unknown, key: string) =>
              column ?? (typeof settings[key] === 'string' ? settings[key] : undefined)
            setDraft((prev) => ({
              ...prev,
              name:
                (typeof profile.display_name === 'string' && profile.display_name) ||
                (typeof json.displayName === 'string' && json.displayName) ||
                (typeof json.user?.fullName === 'string' ? json.user.fullName : '') ||
                prev.name,
              avatar: profile.avatar_emoji || prev.avatar,
              pronouns:
                (pick(profile.pronouns, 'pronouns') as string) || prev.pronouns,
              location: (pick(profile.location, 'location') as string) || prev.location,
              bio: (pick(profile.bio, 'bio') as string) || prev.bio,
              isPublic:
                typeof profile.is_public === 'boolean' ? profile.is_public : prev.isPublic,
              interests: Array.isArray(profile.interests) && profile.interests.length
                ? (profile.interests as string[])
                : Array.isArray(settings.interests)
                  ? (settings.interests as string[])
                  : prev.interests,
              goals: Array.isArray(profile.goals) && profile.goals.length
                ? (profile.goals as string[])
                : Array.isArray(settings.goals)
                  ? (settings.goals as string[])
                  : prev.goals,
            }))
          })
          .catch(() => undefined)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [router])

  const config = STEPS[step]
  const isLast = step === STEPS.length - 1
  const canContinue = step !== 0 || draft.name.trim().length > 0

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      if (draft.name.trim()) {
        await fetch('/api/auth/update-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: draft.name.trim() }),
        })
      }
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_emoji: draft.avatar,
          display_name: draft.name.trim(),
          pronouns: draft.pronouns,
          location: draft.location.trim(),
          bio: draft.bio.trim(),
          is_public: draft.isPublic,
          interests: draft.interests,
          goals: draft.goals,
          onboarded_at: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not save your profile. Please try again.')
      }
      markOnboarded()
      router.replace('/app')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile. Please try again.')
      setSaving(false)
    }
  }

  /** Skip never blocks on errors — the user asked to move on. */
  const skip = () => {
    fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarded_at: new Date().toISOString() }),
    }).catch(() => undefined)
    markOnboarded()
    router.replace('/app')
    router.refresh()
  }

  const goTo = (next: number) => {
    if (saving) return
    setError('')
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)))
  }

  const renderStep = () => {
    const props = { draft, patch }
    switch (step) {
      case 0:
        return <StepProfile {...props} />
      case 1:
        return <StepInterests {...props} />
      case 2:
        return <StepGoals {...props} />
      default:
        return <StepSummary draft={draft} onEdit={goTo} />
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F3FC] lg:h-screen">
      {/* Step backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={config.bg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-white/25 lg:bg-transparent" />

      <div className="relative flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:h-screen lg:px-10 lg:py-4">
        {/* ── Top bar ─────────────────────────────────────── */}
        <header className="flex items-center justify-between gap-4">
          <Logo height={28} withWordmark />
          {!isLast && (
            <button
              type="button"
              onClick={skip}
              className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#5B5780] transition-colors hover:text-[#241B4F]"
            >
              Skip for now
            </button>
          )}
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 py-5 lg:h-[calc(100vh-6rem)] lg:min-h-0 lg:flex-row lg:gap-8 lg:py-4">
          {/* ── Step rail ─────────────────────────────────── */}
          <aside className="hidden w-[248px] shrink-0 lg:block">
            <ol className="space-y-1">
              {STEPS.map((item, index) => {
                const active = index === step
                const done = index < step
                return (
                  <li key={item.label} className="relative">
                    {index < STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[17px] top-10 h-[calc(100%-14px)] w-px bg-[#6C4CE0]/20"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      className={cn(
                        'relative flex w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition-colors',
                        active && 'bg-[#EDEBFB]/85',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13.5px] font-bold transition-colors',
                          active
                            ? 'bg-gradient-to-br from-[#6C4CE0] to-[#5533C6] text-white shadow-[0_6px_16px_rgba(108,76,224,0.35)]'
                            : done
                              ? 'bg-[#DDD8F7] text-[#5B3ACF]'
                              : 'bg-[#EAE8F6] text-[#9995BE]',
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span
                          className={cn(
                            'block text-[14.5px] font-bold',
                            active ? 'text-[#3B2C8F]' : 'text-[#3F3B63]',
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="block text-[13px] leading-5 text-[#7B7799]">{item.sub}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </aside>

          {/* ── Mobile rail ───────────────────────────────── */}
          <div className="flex items-center gap-2 lg:hidden">
            {STEPS.map((item, index) => (
              <span
                key={item.label}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  index <= step ? 'bg-[#6C4CE0]' : 'bg-white/70',
                )}
                title={item.label}
              />
            ))}
            <span className="ml-1 shrink-0 text-[12px] font-bold text-[#5B5780]">
              {step + 1}/{STEPS.length}
            </span>
          </div>

          {/* ── Card ──────────────────────────────────────── */}
          <main className="mc-card flex min-h-0 flex-1 flex-col rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_rgba(74,44,94,0.12)] backdrop-blur-sm sm:p-6 lg:overflow-y-auto lg:p-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={stepTransition}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="mc-step-label text-[13px] font-semibold text-[#8C88AE]">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h1 className="mc-step-heading mt-1.5 font-heading text-[26px] font-extrabold leading-[1.15] tracking-tight text-[#241B4F] sm:text-[34px]">
                  {config.heading(draft)}
                </h1>
                <p className="mc-step-intro mt-2 max-w-xl text-[14px] leading-5 text-[#6E6A8C]">
                  {config.intro}
                </p>

                <div className="mc-step-body mt-5">{renderStep()}</div>
              </motion.div>
            </AnimatePresence>

            {error && (
              <p role="alert" className="mt-5 rounded-xl bg-[#FDECEC] px-4 py-3 text-sm text-[#B03A3A]">
                {error}
              </p>
            )}

            {/* ── Actions ─────────────────────────────────── */}
            <div className="mc-step-actions mt-6 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#DFDCEE] bg-white px-6 py-3 text-[14.5px] font-bold text-[#3F3B63] transition-colors hover:border-[#C9C4EE] disabled:opacity-50"
                >
                  <ChevronLeft size={17} aria-hidden="true" /> Back
                </button>
              ) : (
                <span />
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex min-w-[176px] items-center justify-center gap-2 rounded-2xl bg-[#241B4F] px-7 py-2.5 text-[14.5px] font-bold text-white transition-colors hover:bg-[#1B1540] disabled:opacity-60 lg:py-2"
                >
                  {saving ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : null}
                  {saving ? 'Saving…' : 'Finish'}
                  {!saving && <ArrowRight size={17} aria-hidden="true" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo(step + 1)}
                  disabled={!canContinue}
                  className="inline-flex min-w-[176px] items-center justify-center gap-2 rounded-2xl bg-[#241B4F] px-7 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#1B1540] disabled:cursor-not-allowed disabled:opacity-40 lg:py-2.5"
                >
                  Next <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
            </div>

            {step === 0 && !canContinue && (
              <p className="mt-3 text-right text-[12.5px] text-[#A3A0B8]">
                Add a name to continue — you can change it later.
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
