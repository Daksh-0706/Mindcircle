'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Shield,
  Sparkles,
  UserPlus,
  UserRound,
  Ban,
} from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import ReportDialog from '@/components/ui/ReportDialog'
import BlockDialog from '@/components/ui/BlockDialog'
import NotoEmoji from '@/components/ui/NotoEmoji'
import { AppNav } from '@/components/layout/AppNavContext'
import { cn } from '@/lib/utils'

type Person = {
  id: string
  alias: string | null
  name: string
  avatar_emoji: string
  location: string
  bio: string
  interests: string[]
  goals: string[]
  is_public: boolean
  share_moods: boolean
  connected: boolean
  joined: string
}

/** One tappable row in the settings-style list at the bottom. */
function Row({
  icon,
  title,
  subtitle,
  tone = 'default',
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  tone?: 'default' | 'danger'
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors sm:px-6',
        tone === 'danger' ? 'hover:bg-danger/5' : 'hover:bg-plum/[0.03]',
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
          tone === 'danger' ? 'bg-[#FDEAEA] text-[#C0392B]' : 'bg-[#F0EBFC] text-plum',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-heading text-[16px] font-bold text-charcoal">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-charcoal/55">{subtitle}</span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-charcoal/30" aria-hidden="true" />
    </button>
  )
}

export default function ProfileClient() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const personId = params?.id ?? ''

  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [removing, setRemoving] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)

  const connect = async () => {
    if (requesting || !person) return
    setRequesting(true)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: person.id }),
      })
      if (!res.ok) throw new Error('Could not send the request.')
      // The endpoint auto-accepts when they had asked us first, so re-read the
      // state instead of assuming we are now pending.
      await load()
      setNotice('Request sent.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setRequesting(false)
    }
  }

  const load = useCallback(async () => {
    if (!personId) return
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(personId)}`)
      if (res.status === 404) {
        // Either they do not exist, they are private and we are not connected,
        // or we blocked them. All three read the same to the caller on purpose.
        setError('This profile is not available.')
        return
      }
      if (!res.ok) throw new Error('Could not load this profile.')
      const json = await res.json()
      setPerson(json.person as Person)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [personId])

  useEffect(() => {
    // Initial load — every setState happens inside the async callback.
    void load()
  }, [load])

  const memberSince = (() => {
    if (!person?.joined) return ''
    const then = new Date(person.joined)
    if (Number.isNaN(then.getTime())) return ''
    return then.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  })()

  const removeConnection = async () => {
    if (removing || !person) return
    setRemoving(true)
    try {
      const res = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: person.id }),
      })
      if (!res.ok) throw new Error('Could not remove this connection.')
      // A public profile stays viewable after unconnecting, so staying here is
      // fine — only a private profile would go dark, and it is not one.
      setPerson((p) => (p ? { ...p, connected: false } : p))
      setNotice('Connection removed.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setRemoving(false)
    }
  }

  const block = async () => {
    if (blocking || !person) return
    setBlocking(true)
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: person.id }),
      })
      if (!res.ok) throw new Error('Could not block this person.')
      setBlockOpen(false)
      // Blocking drops the connection too, and even a public profile stops
      // rendering for the blocker — so leaving this screen is the honest move.
      router.push('/app/chats')
    } catch (e) {
      setBlockOpen(false)
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBlocking(false)
    }
  }

  return (
    <>
      <AppNav title={person?.alias ?? 'Profile'} showBack showMobileHeader={false} />

      <div className="page-enter mx-auto w-full max-w-2xl pb-16">
        {/* Back arrow — its own row, matching the design's top-left placement. */}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="-ml-2 mb-2 flex h-11 w-11 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5 hover:text-plum"
        >
          <ChevronLeft size={26} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <Skeleton variant="circle" width={150} height={150} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="rect" height={72} />
          </div>
        ) : error || !person ? (
          <div className="mt-10 rounded-[24px] bg-white p-8 text-center shadow-[0_12px_40px_rgba(74,44,94,0.10)]">
            <p className="font-heading text-lg font-bold text-charcoal">Profile unavailable</p>
            <p className="mt-2 text-sm leading-6 text-charcoal/60">{error}</p>
            <Link
              href="/app/discover"
              className="mt-5 inline-flex rounded-full bg-plum px-6 py-3 text-sm font-bold text-white"
            >
              Find people
            </Link>
          </div>
        ) : (
          <>
            {/* ── Identity ─────────────────────────────────── */}
            <section className="flex flex-col items-center text-center">
              <span className="relative">
                {/* Soft halo, as in the design. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -m-3 rounded-full bg-[#EFE6FB] blur-[2px]"
                />
                <span className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full bg-[#4A2C5E] ring-4 ring-white shadow-[0_12px_36px_rgba(74,44,94,0.28)]">
                  <NotoEmoji emoji={person.avatar_emoji} size={64} />
                </span>
                {/* Presence dot. Community members have no live presence signal
                    yet, so it marks membership rather than "online right now". */}
                <span className="absolute bottom-1 right-3 h-6 w-6 rounded-full border-4 border-white bg-[#2E9E4F]" />
              </span>

              <h1 className="mt-5 font-heading text-[28px] font-extrabold leading-tight text-charcoal">
                {person.alias ?? person.name}
              </h1>
              <p className="mt-1 text-[15px] text-charcoal/55">
                {person.bio || 'Mindcircle user'}
              </p>
            </section>

            {notice && (
              <p role="status" className="mt-5 rounded-xl bg-sage/10 px-4 py-3 text-center text-sm text-sage-dark">
                {notice}
              </p>
            )}

            {/* ── Actions ──────────────────────────────────── */}
            <section className="mt-7 grid grid-cols-2 gap-3">
              {person.connected ? (
                <Link
                  href={`/app/chat/${person.id}`}
                  className="flex flex-col items-center gap-2 rounded-[20px] bg-[#EFEAFB] px-4 py-5 text-plum transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={24} aria-hidden="true" />
                  <span className="text-[15px] font-bold">Message</span>
                </Link>
              ) : (
                // Not connected yet: send the request from here instead of
                // pretending a conversation already exists.
                <button
                  type="button"
                  onClick={connect}
                  disabled={requesting}
                  className="flex flex-col items-center gap-2 rounded-[20px] bg-[#EFEAFB] px-4 py-5 text-plum transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <UserPlus size={24} aria-hidden="true" />
                  <span className="text-[15px] font-bold">
                    {requesting ? 'Sending…' : 'Connect'}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={removeConnection}
                disabled={removing || !person.connected}
                className="flex flex-col items-center gap-2 rounded-[20px] bg-[#F5F2F8] px-4 py-5 text-charcoal/70 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
              >
                <UserRound size={24} aria-hidden="true" />
                <span className="text-[15px] font-bold">
                  {removing ? 'Removing…' : person.connected ? 'Remove connection' : 'Not connected'}
                </span>
              </button>
            </section>

            {/* ── Current mood ─────────────────────────────── */}
            {/* Moods are private journal data, so nothing is shown here. The
                card exists to mirror the design and to say so plainly, rather
                than leaving a gap that looks like something failed to load. */}
            <section className="mt-4 rounded-[20px] bg-[#F1EDFC] px-5 py-4 sm:px-6">
              <p className="flex items-center gap-2 text-[13px] font-bold text-charcoal/50">
                <Sparkles size={16} className="text-plum" aria-hidden="true" />
                Current mood
              </p>
              <p className="mt-1.5 font-heading text-[17px] font-bold text-charcoal">
                Kept private — only you can see your own.
              </p>
            </section>

            {/* ── About ────────────────────────────────────── */}
            <section className="mt-4 overflow-hidden rounded-[20px] bg-white shadow-[0_8px_28px_rgba(74,44,94,0.07)]">
              <Link
                href={`/app/profile/${person.id}/about`}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-plum/[0.03] sm:px-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                  <UserRound size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-heading text-[16px] font-bold text-charcoal">
                    About
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-charcoal/55">
                    {[
                      person.location,
                      memberSince && `Here since ${memberSince}`,
                      person.interests.length
                        ? `Into ${person.interests.slice(0, 3).join(', ')}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Nothing shared yet'}
                  </span>
                </span>
                <ChevronRight size={20} className="shrink-0 text-charcoal/30" aria-hidden="true" />
              </Link>
              <div className="mx-5 h-px bg-warm-gray-lighter/60 sm:mx-6" />
              <div className="px-5 pb-5 pt-1 sm:px-6">
                {person.goals.length > 0 && (
                  <>
                    <p className="mt-4 text-[12px] font-bold uppercase tracking-wide text-charcoal/40">
                      Goals
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {person.goals.map((goal) => (
                        <span
                          key={goal}
                          className="rounded-full bg-[#F3EFF8] px-3 py-1.5 text-[12px] font-semibold text-plum"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ── Safety ───────────────────────────────────── */}
            {/* Report is a placeholder until moderation tooling exists. Block
                is live. Mood insights opens only when they have opted in to
                sharing their trends — the API 404s otherwise, so a dead link
                is not possible here. */}
            <section className="mt-4 overflow-hidden rounded-[20px] bg-white shadow-[0_8px_28px_rgba(74,44,94,0.07)]">
              <Link
                href={`/app/profile/${person.id}/mood`}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-plum/[0.03] sm:px-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0EBFC] text-plum">
                  <BarChart3 size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-heading text-[16px] font-bold text-charcoal">
                    Mood insights
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-charcoal/55">
                    {person.share_moods
                      ? 'They have chosen to share their mood trends'
                      : 'Mood data stays private'}
                  </span>
                </span>
                <ChevronRight size={20} className="shrink-0 text-charcoal/30" aria-hidden="true" />
              </Link>
              <div className="mx-5 h-px bg-warm-gray-lighter/60 sm:mx-6" />
              <Row
                icon={<Shield size={20} />}
                title="Report"
                subtitle={`Report ${person.alias ?? person.name}`}
                onClick={() => setReportOpen(true)}
              />
              <div className="mx-5 h-px bg-warm-gray-lighter/60 sm:mx-6" />
              <Row
                icon={<Ban size={20} />}
                title="Block"
                subtitle={
                  blocking
                    ? 'Working…'
                    : 'They will disappear from Discover, chats and search'
                }
                tone="danger"
                onClick={() => setBlockOpen(true)}
              />
            </section>
          </>
        )}
      </div>

      {person && (
        <ReportDialog
          // Remounting on every open resets the form: reason, details and any
          // error all start clean for the next report. The key is namespaced per
          // dialog so it cannot collide with the Block dialog beside it.
          key={`report-${reportOpen ? 'open' : 'closed'}`}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          onReported={() => {
            setReportOpen(false)
            setNotice(`Thanks. Your report about ${person.alias ?? person.name} was sent.`)
          }}
          reportedId={person.id}
          reportedName={person.alias ?? person.name}
        />
      )}

      {person && (
        <BlockDialog
          // Remounting per open resets the busy/error state for each attempt.
          key={`block-${blockOpen ? 'open' : 'closed'}`}
          open={blockOpen}
          onClose={() => setBlockOpen(false)}
          onBlocked={block}
          blockedName={person.alias ?? person.name}
        />
      )}
    </>
  )
}