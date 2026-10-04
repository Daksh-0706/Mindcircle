'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, Globe, Loader2, MessageCircle, Search, UserPlus, X } from 'lucide-react'
import { AppNav } from '../../../components/layout/AppNavContext'
import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import NotoEmoji from '../../../components/ui/NotoEmoji'
import { cn } from '../../../lib/utils'

/** How the viewer relates to a person in the directory. */
type ConnectionState = 'none' | 'pending' | 'accepted' | 'outgoing' | 'incoming'

type Person = {
  id: string
  alias: string | null
  name: string
  avatar_emoji: string
  location: string
  pronouns: string
  bio: string
  interests: string[]
  goals: string[]
  connection: ConnectionState
  is_public: boolean
}

const PAGE = 8

export default function DiscoverClient() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(PAGE)
  const [query, setQuery] = useState('')
  // What the input shows vs. what the last request used, so typing feels
  // instant while we still wait for the debounce before hitting the API.
  const [settled, setSettled] = useState('')

  const load = useCallback(async (q = '') => {
    try {
      const params = new URLSearchParams({ limit: '40' })
      if (q) params.set('q', q)
      const res = await fetch(`/api/profiles?${params.toString()}`)
      if (!res.ok) throw new Error('Could not load people.')
      const json = await res.json()
      setPeople((json.data ?? []) as Person[])
      setError('')
    } catch {
      setError('Could not load people. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  // Debounced search: the server does the matching, so we never filter a
  // page-sized list on the client and miss matches beyond it.
  useEffect(() => {
    const handle = setTimeout(() => {
      void load(query).then(() => setSettled(query))
    }, 350)
    return () => clearTimeout(handle)
  }, [query, load])

  // Spinner shows only while the request is in flight; once the results for
  // the current text are back, `settled === query` and it disappears.
  const searching = query !== settled

  /**
   * Sends a connection request. If the other person already asked us, the
   * endpoint accepts it in the same call, so one button covers both cases.
   * Afterwards we re-read the list instead of guessing the new state here.
   */
  const connect = async (id: string) => {
    setBusy(id)
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not send the request.')
      }
      await load(query)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the request.')
    } finally {
      setBusy(null)
    }
  }

  /**
   * Withdraws a request we sent, so tapping "Pending" again removes it.
   * Sending and withdrawing share the button because both are about the same
   * one request between the same two people — a separate cancel button would
   * mean two controls doing the same thing on one card.
   */
  const withdraw = async (id: string) => {
    setBusy(id)
    try {
      const res = await fetch('/api/connections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not withdraw the request.')
      }
      await load(query)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not withdraw the request.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <AppNav title="Discover People" />
      <div className="page-enter space-y-5 pb-24">
        {/* ── Header ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white px-5 py-6 sm:px-7">
          {/* soft lavender wash in the top-right corner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#EFE6FB] blur-3xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-[32px] font-extrabold leading-[1.1] tracking-tight text-[#3D2A52] sm:text-[38px]">
                Discover People
              </h1>
              <p className="mt-2 max-w-xl text-[14px] leading-6 text-charcoal/70">
                Meet and connect with people who share similar experiences and vibes.
              </p>
            </div>
            <p className="hidden shrink-0 text-right text-[12px] leading-5 text-plum/60 sm:block">
              Different stories.
              <br />
              Same journey. <NotoEmoji emoji="💜" size={13} />
            </p>
          </div>
        </section>

        {/* ── Search ─────────────────────────────────────────── */}
        <section>
          <label htmlFor="discover-search" className="sr-only">
            Search alias or name
          </label>
          <div className="relative">
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray-light"
            />
            <input
              id="discover-search"
              type="search"
              inputMode="search"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                // A new search always starts again from the first page.
                setVisible(PAGE)
              }}
              placeholder="Search alias or name"
              className="w-full rounded-2xl border border-warm-gray-lighter bg-white py-3 pl-11 pr-11 text-[14px] text-charcoal placeholder:text-warm-gray-light focus:border-plum/40 focus:outline-none focus:ring-2 focus:ring-plum/15"
            />
            {searching && (
              <Loader2
                size={16}
                aria-hidden="true"
                className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-plum/60"
              />
            )}
            {query && !searching && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-warm-gray-light transition-colors hover:bg-plum/5 hover:text-plum"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {/* ── People grid ────────────────────────────────────── */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rect" height={210} />
            ))}
          </div>
        ) : people.length === 0 ? (
          <EmptyState
            icon={<UserPlus size={26} />}
            title={query ? 'No matches found' : 'No one here yet'}
            description={
              query
                ? `No one here matches "${query}". Try an alias like "silver-otter".`
                : 'New people will show up here as they join.'
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {people.slice(0, visible).map((person, index) => {
              const accepted = person.connection === 'accepted'
              const sent = person.connection === 'outgoing' || person.connection === 'pending'
              const incoming = person.connection === 'incoming'
              // Everyone in the directory opens. A private profile opens in a locked form
// (alias + avatar + "send a request"), which is the whole point of Discover —
// it shows who is here before you decide who to connect to.
const viewable = true
              // Alternates so the grid keeps the mockup's checkerboard rhythm.
              const solid = index % 2 === 0
              const working = busy === person.id

              return (
                <div
                  key={person.id}
                  className="flex flex-col rounded-[18px] border border-warm-gray-lighter/60 bg-white p-4 shadow-[0_2px_12px_rgba(74,44,94,0.05)] transition-transform hover:-translate-y-0.5"
                >
                  {/* Tapping always opens the profile. The API decides how much of it
                      comes back — a private profile opens in a locked form. */}
                  <button
                    type="button"
                    onClick={() => viewable && router.push(`/app/profile/${person.id}`)}
                    disabled={!viewable}
                    aria-label={viewable ? `View ${person.alias ?? person.name}` : undefined}
                    className={cn(
                      'flex w-full items-start text-left',
                      viewable ? 'cursor-pointer' : 'cursor-default',
                    )}
                  >
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EFEAFB]">
                      <NotoEmoji emoji={person.avatar_emoji} size={28} />
                      {person.is_public && (
                        <span
                          title="Open profile"
                          aria-label="Open profile"
                          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2E9E4F] text-white ring-2 ring-white"
                        >
                          <Globe size={9} aria-hidden="true" />
                        </span>
                      )}
                    </span>
                  </button>

                  {/* Only the alias is shown. The display name is deliberately left out: two
                    people can share a name, and the alias is the one identity
                    that is guaranteed unique — showing both invited the exact
                    confusion the alias exists to prevent.

                    It is a button, not text: the name is what people aim for
                    when they tap a card, and the avatar target above it is a
                    56px circle they can easily miss. */}
                  <button
                    type="button"
                    onClick={() => router.push(`/app/profile/${person.id}`)}
                    aria-label={`View ${person.alias ?? person.name}`}
                    className="mt-3 -ml-1 max-w-full cursor-pointer truncate rounded px-1 text-left font-heading text-[15px] font-bold text-[#3D2A52] transition-colors hover:text-plum"
                  >
                    {person.alias ?? person.name}
                  </button>

                  {/* Location first, then pronouns as a plain value — no
                      "pronouns:" label, so the card stays scannable. */}
                  <p className="mt-1 text-[11px] font-medium text-charcoal/60">
                    📍 {person.location || 'Somewhere near you'}
                    {person.pronouns && (
                      <>
                        {' · '}
                        <span className="text-charcoal/50">{person.pronouns}</span>
                      </>
                    )}
                  </p>

                  <p className="mt-2 line-clamp-2 flex-1 text-[12.5px] leading-5 text-charcoal/70">
                    {person.bio || 'No bio yet — say hello and find out.'}
                  </p>

                  {accepted ? (
                    <Link
                      href={`/app/chat/${person.id}`}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4A2C5E] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#3A1F4A]"
                    >
                      <MessageCircle size={15} aria-hidden="true" /> Message
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => (sent ? withdraw(person.id) : connect(person.id))}
                      disabled={working || incoming}
                      className={cn(
                        'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all',
                        sent || incoming
                          ? 'border border-plum/30 bg-white text-plum'
                          : solid
                            ? 'bg-[#4A2C5E] text-white hover:bg-[#3A1F4A]'
                            : 'bg-[#EFE9F8] text-[#4A2C5E] hover:bg-[#E4DBF3]',
                        (sent || incoming || working) && 'opacity-70',
                      )}
                    >
                      {working ? (
                        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                      ) : incoming ? (
                        <>
                          <Check size={15} aria-hidden="true" /> Accept
                        </>
                      ) : sent ? (
                        <>
                          {/* Tapping again withdraws the request. */}
                          <X size={15} aria-hidden="true" /> Cancel request
                        </>
                      ) : (
                        <>
                          <UserPlus size={15} aria-hidden="true" /> Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {visible < people.length && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setVisible((n) => n + PAGE)}
              className="rounded-full border border-plum/20 bg-white px-6 py-2.5 text-[13px] font-bold text-plum shadow-[0_2px_10px_rgba(74,44,94,0.08)] transition-transform hover:-translate-y-0.5"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </>
  )
}
