'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Cake,
  ChevronLeft,
  Compass,
  FileText,
  Heart,
  Leaf,
  Lock,
  MapPin,
  Quote,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import NotoEmoji from '@/components/ui/NotoEmoji'
import { AppNav } from '@/components/layout/AppNavContext'
import { interestLabel } from '@/lib/profile-options'

type Person = {
  id: string
  alias: string | null
  name: string
  pronouns: string
  avatar_emoji: string
  location: string
  bio: string
  interests: string[]
  goals: string[]
  personality: string[]
  note: string
  joined: string
  /**
   * Private profile we are not connected with. The API sends the alias and
   * avatar only, so this screen shows a "connect to view" notice instead of
   * the sections below — there is nothing behind them to render.
   */
  locked?: boolean
}

/** Section wrapper: lavender icon, bold title, then whatever belongs under it. */
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(74,44,94,0.07)] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
          {icon}
        </span>
        <h2 className="font-heading text-[18px] font-bold text-charcoal">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Pill list. Renders nothing at all when there is nothing to show. */
function Pills({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-[#F3EFF8] px-3.5 py-2 text-[13px] font-semibold text-[#4A2C5E]"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function ProfileAboutClient() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const personId = params?.id ?? ''

  const [person, setPerson] = useState<Person | null>(null)
  // Captured once so "how long have they been here" never changes mid-render.
  const [now] = useState(() => Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!personId) return
    let active = true
    fetch(`/api/profile/${encodeURIComponent(personId)}`)
      .then((res) => {
        if (res.status === 404) throw new Error('notfound')
        if (!res.ok) throw new Error('Could not load this profile.')
        return res.json()
      })
      .then((json) => {
        const raw = json.person as Partial<Person>
        if (active) {
          setPerson({
            id: raw.id ?? personId,
            alias: raw.alias ?? null,
            name: raw.name ?? '',
            pronouns: raw.pronouns ?? '',
            avatar_emoji: raw.avatar_emoji ?? '😊',
            location: raw.location ?? '',
            bio: raw.bio ?? '',
            interests: raw.interests ?? [],
            goals: raw.goals ?? [],
            personality: raw.personality ?? [],
            note: raw.note ?? '',
            joined: raw.joined ?? '',
            locked: Boolean(raw.locked),
          })
        }
      })
      .catch((e) => {
        if (active) {
          setError(
            e.message === 'notfound'
              ? 'This profile is not available.'
              : 'Something went wrong.',
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [personId])

  const joinedLabel = (() => {
    if (!person?.joined) return '—'
    const then = new Date(person.joined)
    if (Number.isNaN(then.getTime())) return '—'
    return then.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  })()

  // Years of membership, not age. MindCircle deliberately does not collect a
  // date of birth, so showing one here would have to be invented.
  const yearsHere = (() => {
    if (!person?.joined) return null
    const then = new Date(person.joined)
    if (Number.isNaN(then.getTime())) return null
    const years = Math.max(
      0,
      // `now` is captured once per load, so this stays pure during renders.
      Math.floor((now - then.getTime()) / (365.25 * 24 * 3600 * 1000)),
    )
    return years === 0 ? 'New here' : `${years} yr${years > 1 ? 's' : ''}`
  })()

  return (
    <>
      {/* This page owns its own header, so the app's mobile header is hidden —
          otherwise two bars stack and the title appears twice. */}
      <AppNav title="About" showBack showMobileHeader={false} />
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-warm-gray-lighter/60 bg-cream/90 px-4 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5 hover:text-plum"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="font-heading text-[22px] font-bold text-charcoal">About</h1>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5 sm:px-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="rect" height={200} />
            <Skeleton variant="rect" height={120} />
            <Skeleton variant="rect" height={140} />
          </div>
        ) : error || !person ? (
          <div className="rounded-[22px] bg-white p-8 text-center shadow-[0_8px_28px_rgba(74,44,94,0.07)]">
            <p className="font-heading text-lg font-bold text-charcoal">Profile unavailable</p>
            <p className="mt-2 text-sm leading-6 text-charcoal/60">{error}</p>
            <Link
              href="/app/discover"
              className="mt-5 inline-flex rounded-full bg-plum px-6 py-3 text-sm font-bold text-white"
            >
              Find people
            </Link>
          </div>
        ) : person.locked ? (
            /* Locked profile: this screen exists to show their details, and
               there are none. Say why, and send them back to the one action
               that would unlock it. */
            <div className="rounded-[22px] bg-white p-8 text-center shadow-[0_8px_28px_rgba(74,44,94,0.07)]">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                <Lock size={22} aria-hidden="true" />
              </span>
              <p className="mt-4 font-heading text-lg font-bold text-charcoal">
                This is a private profile
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-charcoal/60">
                {person.alias ?? person.name} has kept their details private. Send a
                connection request to view their profile.
              </p>
              <button
                type="button"
                onClick={() => router.push(`/app/profile/${person.id}`)}
                className="mt-5 inline-flex rounded-full bg-plum px-6 py-3 text-sm font-bold text-white"
              >
                Send connection request
              </button>
            </div>
          ) : (
          <>
            {/* ── Identity card ─────────────────────────────── */}
            <section className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(74,44,94,0.07)] sm:p-6">
              <div className="flex items-center gap-4">
                <span className="relative shrink-0">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -m-2 rounded-full bg-[#EFE6FB]"
                  />
                  <span className="relative flex h-[86px] w-[86px] items-center justify-center rounded-full bg-[#4A2C5E] ring-4 ring-white shadow-[0_8px_24px_rgba(74,44,94,0.26)]">
                    <NotoEmoji emoji={person.avatar_emoji} size={40} />
                  </span>
                  <span className="absolute bottom-0.5 right-1 h-5 w-5 rounded-full border-3 border-white bg-[#2E9E4F]" />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-heading text-[22px] font-extrabold leading-tight text-charcoal">
                    {person.alias ?? person.name}
                  </h2>
                  <p className="mt-0.5 truncate text-[14px] text-charcoal/55">
                    {[person.name, person.pronouns].filter(Boolean).join(' · ')}
                  </p>
                  {person.bio && (
                    <p className="mt-2 inline-block max-w-full truncate rounded-[14px] rounded-br-[4px] bg-[#F1EDFC] px-3.5 py-2 text-[13px] font-semibold text-[#4A2C5E]">
                      {person.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Facts strip. Values wrap rather than truncate: "New here" and
                  a city name are both short, but truncating them to "Ne…"
                  made the row unreadable at narrow widths. */}
              <div className="mt-5 grid grid-cols-3 divide-x divide-warm-gray-lighter/70 border-t border-warm-gray-lighter/70 pt-4">
                <div className="flex flex-col items-center gap-1.5 px-1 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                    <Cake size={17} />
                  </span>
                  <p className="text-[12.5px] font-bold leading-tight text-charcoal">
                    {yearsHere ?? '—'}
                  </p>
                  <p className="text-[11px] leading-tight text-charcoal/45">on MindCircle</p>
                </div>
                <div className="flex flex-col items-center gap-1.5 px-1 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                    <MapPin size={17} />
                  </span>
                  <p className="text-[12.5px] font-bold leading-tight text-charcoal">
                    {person.location || 'Not shared'}
                  </p>
                  <p className="text-[11px] leading-tight text-charcoal/45">location</p>
                </div>
                <div className="flex flex-col items-center gap-1.5 px-1 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                    <Compass size={17} />
                  </span>
                  <p className="text-[12.5px] font-bold leading-tight text-charcoal">
                    {joinedLabel}
                  </p>
                  <p className="text-[11px] leading-tight text-charcoal/45">joined</p>
                </div>
              </div>
            </section>

            {/* ── Bio ──────────────────────────────────────── */}
            <Section icon={<FileText size={19} />} title="Bio">
              {person.bio ? (
                <p className="text-[14.5px] leading-7 text-charcoal/75">{person.bio}</p>
              ) : (
                <p className="text-[14.5px] leading-7 text-charcoal/45">
                  {person.alias ?? person.name} hasn&apos;t written a bio yet.
                </p>
              )}
            </Section>

            {/* ── Interests ─────────────────────────────────── */}
            <Section icon={<Sparkles size={19} />} title="Interests">
              {person.interests.length > 0 ? (
                <Pills
                  items={person.interests.map((i) => interestLabel(i).label)}
                />
              ) : (
                <p className="text-[14.5px] text-charcoal/45">No interests shared yet.</p>
              )}
            </Section>

            {/* ── Goals ─────────────────────────────────────── */}
            <Section icon={<Target size={19} />} title="What they&apos;re here for">
              {person.goals.length > 0 ? (
                <Pills items={person.goals} />
              ) : (
                <p className="text-[14.5px] text-charcoal/45">No goals shared yet.</p>
              )}
            </Section>

            {/* ── Personality ───────────────────────────────── */}
            <Section icon={<UserRound size={19} />} title="Personality">
              {person.personality.length > 0 ? (
                <Pills items={person.personality} />
              ) : (
                <p className="text-[14.5px] text-charcoal/45">No personality traits shared yet.</p>
              )}
            </Section>

            {/* ── A little note ─────────────────────────────── */}
            {person.note && (
              <section className="rounded-[22px] bg-[#F3EFFB] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-plum">
                    <Quote size={19} />
                  </span>
                  <h2 className="font-heading text-[18px] font-bold text-charcoal">A little note</h2>
                </div>
                <p className="mt-3 flex items-start gap-2.5 font-display text-[17px] italic leading-8 text-[#4A2C5E]">
                  <Leaf size={18} className="mt-1.5 shrink-0 text-sage" aria-hidden="true" />
                  {person.note}
                </p>
              </section>
            )}

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-warm-gray">
              <Heart size={12} /> Shared by {person.alias ?? person.name} themselves.
            </div>
          </>
        )}
      </div>
    </>
  )
}