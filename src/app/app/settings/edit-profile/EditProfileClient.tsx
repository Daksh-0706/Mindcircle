'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '../../../../components/layout/AppNavContext'
import {
  AtSign,
  BarChart3,
  Check,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Play,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import { MOOD_EMOJIS } from '../../../../lib/constants'
import { cn } from '../../../../lib/utils'
import NotoEmoji from '../../../../components/ui/NotoEmoji'

const VIBE_EMOJIS: string[] = ['🌱', '🌙', '⭐', '🍀', '🦋', '🌸']

const ALL_AVATARS: string[] = [...MOOD_EMOJIS.map((m) => m.emoji), ...VIBE_EMOJIS]

const VIBE_TINTS: Record<string, string> = {
  '🌱': '#E7F1E2',
  '🌙': '#FBEDE2',
  '⭐': '#FDF3E9',
  '🍀': '#E7F1E2',
  '🦋': '#EDEAF9',
  '🌸': '#FBE8EE',
}

const MOOD_TINTS: string[] = ['#FDF3E9', '#FDF3E9', '#F5F2F4', '#FDF3E9', '#EFEAF9', '#FDF3E9']

/** Right-hand leaf decoration shared with the About page. */
const FADE_BOTTOM_LEFT = {
  maskImage: 'radial-gradient(ellipse 75% 75% at 70% 25%, black 45%, transparent 90%)',
  WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 70% 25%, black 45%, transparent 90%)',
} as const

/** Small hand-drawn accent strokes used beside headings in the mockups. */
function Dashes({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="3" y1="12" x2="7.5" y2="5.5" />
        <line x1="9.5" y1="14" x2="15" y2="6.5" />
        <line x1="16" y1="15.5" x2="19" y2="11" />
      </g>
    </svg>
  )
}

function CardHeader({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-[#4A2C5E]">{icon}</span>
          <h2 className="font-heading text-xl font-bold text-[#2A1B3D]">{title}</h2>
        </div>
        <p className="mt-1 text-sm leading-6 text-[#8A8A8A]">{desc}</p>
      </div>
      {action}
    </div>
  )
}

const CARD = 'rounded-[24px] bg-white p-5 shadow-[0_12px_40px_rgba(74,44,94,0.10)] sm:p-6'
const INPUT =
  'h-12 w-full rounded-[18px] border border-transparent bg-[#F3EFF8] pl-10 pr-12 text-base font-bold text-[#2A1B3D] placeholder:font-medium placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-plum/25 sm:h-14 sm:pl-12 sm:pr-14 sm:text-lg'


function nameFromEmail(email: string | null | undefined) {
  if (!email) return ''
  const local = (email.split('@')[0] || '').replace(/[._-]+/g, ' ').trim()
  return local
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Edit Profile — display name (auth metadata) + avatar emoji (profile row).
 * The email itself is read-only; changing it requires re-verification.
 */
export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('😊')
  const [isPublic, setIsPublic] = useState(false)
  const [shareMoods, setShareMoods] = useState(false)
  const [alias, setAlias] = useState('')
  /** What the alias looked like when the page loaded, so we only PATCH on a real change. */
  const [aliasOriginal, setAliasOriginal] = useState('')
  const [aliasState, setAliasState] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle')

  const moodRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return
        setEmail(json.user?.email ?? '')
        setName(json.user?.fullName ?? nameFromEmail(json.user?.email))
        setAvatar(json.profile?.avatar_emoji || '😊')
        setIsPublic(Boolean(json.profile?.is_public))
        setShareMoods(Boolean(json.profile?.share_moods))
        const existingAlias = json.profile?.alias ?? ''
        setAlias(existingAlias)
        setAliasOriginal(existingAlias)
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const aliasCleaned = alias.trim().toLowerCase()
  // Same shape rule the API enforces, so the hint never disagrees with save.
  const aliasValid = /^[a-z0-9]+(-[a-z0-9]+)+$/.test(aliasCleaned)
  const aliasChanged = aliasCleaned !== aliasOriginal && aliasValid
  const aliasBad = aliasChanged === false && aliasCleaned !== aliasOriginal && !aliasValid

  // Live availability probe while typing, debounced.
  useEffect(() => {
    if (!aliasChanged) return

    const handle = setTimeout(() => {
      fetch(`/api/me/alias?alias=${encodeURIComponent(aliasCleaned)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => setAliasState(json?.available ? 'free' : 'taken'))
        .catch(() => setAliasState('idle'))
    }, 400)

    return () => clearTimeout(handle)
  }, [aliasChanged, aliasCleaned])

  // Derived rather than stored: as soon as the text differs from the saved
  // alias we are waiting on a reply, so the spinner needs no state of its own.
  const aliasStatus: 'idle' | 'checking' | 'free' | 'taken' | 'invalid' = aliasBad
    ? 'invalid'
    : !aliasChanged
      ? 'idle'
      : aliasState === 'idle'
        ? 'checking'
        : aliasState

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      // 1. Display name → auth user metadata.
      const nameRes = await fetch('/api/auth/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name.trim() }),
      })
      if (!nameRes.ok) {
        const json = await nameRes.json().catch(() => null)
        throw new Error(json?.error || 'Could not save your name.')
      }

      // 2. Avatar emoji + community alias → profile row.
      const patch: Record<string, unknown> = {
      avatar_emoji: avatar,
      is_public: isPublic,
      share_moods: shareMoods,
    }
      if (aliasChanged) patch.alias = alias.trim().toLowerCase()

      const avatarRes = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!avatarRes.ok) {
        const json = await avatarRes.json().catch(() => null)
        throw new Error(json?.error || 'Could not save your profile.')
      }

      setSaved(true)
      if (aliasChanged) setAliasOriginal(aliasCleaned)
      setAliasState('idle')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const scrollToMoods = () => {
    moodRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    moodRowRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }

  /** Change button — cycles the avatar through every available emoji. */
  const cycleAvatar = () => {
    const idx = ALL_AVATARS.indexOf(avatar)
    setAvatar(ALL_AVATARS[(idx + 1) % ALL_AVATARS.length])
  }

  return (
    <>
      <AppNav title="Edit profile" showBack />
      <div className="page-enter mx-auto max-w-2xl space-y-4 pb-10">
        {/* ── Page header ────────────────────────────── */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-dk-corner.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 w-[34%]"
            style={FADE_BOTTOM_LEFT}
          />
          <div className="relative flex items-start gap-2">
            <h1 className="font-heading text-[30px] font-bold leading-tight text-[#2A1B3D] sm:text-[38px]">Edit profile</h1>
            <Dashes className="mt-3 h-5 w-5 shrink-0 text-[#F0876B]" />
          </div>
          <p className="relative mt-1.5 max-w-[86%] text-sm leading-6 text-[#8A8A8A] sm:text-base">
            Choose how you appear across MindCircle. Your email always stays private.
          </p>
        </div>

        {loading ? (
          <div className={`flex items-center justify-center p-14 ${CARD}`}>
            <Loader2 className="animate-spin text-plum" size={24} />
          </div>
        ) : (
          <>
            {/* ── Profile avatar ─────────────────────── */}
            <section className={CARD}>
              <CardHeader
                icon={<Play size={19} />}
                title="Profile avatar"
                desc="Pick an emoji or your own vibe"
                action={
                  <button
                    type="button"
                    onClick={cycleAvatar}
                    aria-label="Change avatar"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#EFEAF9] px-4 py-2.5 text-sm font-bold text-[#4A2C5E] transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    <ImageIcon size={15} />
                    Change
                  </button>
                }
              />

              <div className="mt-5 flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#4A2C5E] via-[#8E4A6B] to-[#C45D3E] ring-4 ring-white shadow-[0_10px_30px_rgba(74,44,94,0.30)] outline outline-1 outline-[#EFE7E0] sm:h-28 sm:w-28 sm:ring-[6px]">
                    <NotoEmoji emoji={avatar} size={48} />
                  </div>
                  <button
                    type="button"
                    onClick={scrollToMoods}
                    aria-label="Edit avatar"
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-[#EFE7E0] bg-white text-[#7A6B8A] shadow-[0_4px_14px_rgba(42,27,61,0.16)] transition-transform hover:-translate-y-0.5"
                  >
                    <Pencil size={15} />
                  </button>
                </div>

                <div className="relative min-w-0 flex-1 rounded-2xl rounded-br-[4px] bg-[#EFEAF9] px-3.5 py-3 sm:px-4 sm:py-3.5">
                  <Dashes className="absolute -top-3 right-4 h-4 w-4 text-[#9B7ED8]" />
                  <p className="font-display text-[15px] italic leading-6 text-[#4A2C5E]">
                    Same you, just a little brighter ♡
                  </p>
                </div>
              </div>

              {/* Quick emojis */}
              <p className="mt-5 text-sm font-bold text-[#2A1B3D]">Quick emojis</p>
              <div ref={moodRowRef} className="mt-3 flex flex-wrap gap-2.5 sm:gap-3">
                {MOOD_EMOJIS.map((m, i) => (
                  <button
                    key={m.emoji}
                    type="button"
                    onClick={() => setAvatar(m.emoji)}
                    aria-label={`Choose avatar ${m.label}`}
                    aria-pressed={avatar === m.emoji}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full transition-all hover:-translate-y-0.5 sm:h-12 sm:w-12',
                      avatar === m.emoji
                        ? 'ring-2 ring-[#7C5CE0] ring-offset-2 ring-offset-white shadow-[0_4px_14px_rgba(74,44,94,0.14)]'
                        : '',
                    )}
                    style={{ backgroundColor: MOOD_TINTS[i] }}
                  >
                    <NotoEmoji emoji={m.emoji} size={24} />
                  </button>
                ))}
              </div>

              <div className="my-4 h-px bg-[#F0E9E2]" />

              {/* More vibes */}
              <p className="text-sm font-bold text-[#2A1B3D]">More vibes</p>
              <div className="mt-3 flex flex-wrap gap-2.5 sm:gap-3">
                {VIBE_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setAvatar(e)}
                    aria-label={`Choose avatar ${e}`}
                    aria-pressed={avatar === e}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full transition-all hover:-translate-y-0.5 sm:h-12 sm:w-12',
                      avatar === e
                        ? 'ring-2 ring-[#7C5CE0] ring-offset-2 ring-offset-white shadow-[0_4px_14px_rgba(74,44,94,0.14)]'
                        : '',
                    )}
                    style={{ backgroundColor: VIBE_TINTS[e] ?? '#FDF3E9' }}
                  >
                    <NotoEmoji emoji={e} size={24} />
                  </button>
                ))}
              </div>
            </section>

            {/* ── Display name ───────────────────────── */}
            <section className={CARD}>
              <CardHeader
                icon={<MapPin size={19} />}
                title="Display name"
                desc="Shown on your profile and in your communities — never beside your journal."
              />
              <div className="relative mt-4">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  id="display-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we call you?"
                  maxLength={40}
                  className={INPUT}
                />
                {name && (
                  <button
                    type="button"
                    onClick={() => setName('')}
                    aria-label="Clear name"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#8A8A8A] transition-colors hover:text-[#4A4A4A]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </section>

            {/* ── Public profile ────────────────────── */}
            <section className={CARD}>
              <CardHeader
                icon={<Globe size={19} />}
                title="Public profile"
                desc="Anyone on MindCircle can open your profile and send you a request. Turn this off and only people you connect with can see it."
              />
              <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-[#F3EFF8] p-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPublic}
                  aria-label="Public profile"
                  onClick={() => setIsPublic((v) => !v)}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    isPublic ? 'bg-sage' : 'bg-warm-gray-lighter',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-all',
                      isPublic ? 'left-6' : 'left-1',
                    )}
                  />
                </button>
                <p className="min-w-0 flex-1 text-[13.5px] font-semibold leading-5 text-charcoal/70">
                  {isPublic
                    ? 'Anyone can find and view your profile.'
                    : 'Only connected people can view your profile.'}
                </p>
              </div>
            </section>

            {/* ── Share mood trends ────────────────── */}
            <section className={CARD}>
              <CardHeader
                icon={<BarChart3 size={19} />}
                title="Share mood trends"
                desc="People you are connected with can see how your mood has moved over time. Your journal entries and notes always stay private — only the trends are shared."
              />
              <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-[#F3EFF8] p-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={shareMoods}
                  aria-label="Share mood trends"
                  onClick={() => setShareMoods((v) => !v)}
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    shareMoods ? 'bg-sage' : 'bg-warm-gray-lighter',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.25)] transition-all',
                      shareMoods ? 'left-6' : 'left-1',
                    )}
                  />
                </button>
                <p className="min-w-0 flex-1 text-[13.5px] font-semibold leading-5 text-charcoal/70">
                  {shareMoods
                    ? 'Connected people can see your mood trends.'
                    : 'Nobody else can see your mood trends.'}
                </p>
              </div>
            </section>

            {/* ── Community alias ────────────────────── */}
            <section className={CARD}>
              <CardHeader
                icon={<AtSign size={19} />}
                title="Community alias"
                desc="Your unique handle in the community — this is how people find and recognise you. Lowercase words joined by dashes, like silver-otter."
              />
              <div className="relative mt-4">
                <AtSign className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  id="community-alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value.toLowerCase())}
                  placeholder="silver-otter"
                  maxLength={24}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  aria-describedby="alias-hint"
                  className={INPUT}
                />
                {aliasStatus === 'checking' && (
                  <Loader2
                    size={16}
                    aria-hidden="true"
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#8A8A8A]"
                  />
                )}
                {aliasChanged && aliasStatus === 'free' && (
                  <Check
                    size={17}
                    aria-hidden="true"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-dark"
                  />
                )}
                {aliasChanged && !alias && (
                  <button
                    type="button"
                    onClick={() => setAlias('')}
                    aria-label="Clear alias"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#8A8A8A] transition-colors hover:text-[#4A4A4A]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <p
                id="alias-hint"
                role={aliasStatus === 'taken' || aliasStatus === 'invalid' ? 'alert' : undefined}
                className={cn(
                  'mt-2.5 text-[13px] leading-5',
                  aliasStatus === 'taken' || aliasStatus === 'invalid'
                    ? 'text-danger'
                    : 'text-[#8A8A8A]',
                )}
              >
                {/* One message at a time: `aliasStatus` is a single union so
                    these branches can never render together. */}
                {aliasStatus === 'taken' && 'That alias is already taken. Try another.'}
                {aliasStatus === 'invalid' &&
                  'Use lowercase words separated by dashes, like silver-otter.'}
                {aliasStatus === 'free' && 'That alias is free — save to claim it.'}
                {aliasStatus === 'idle' &&
                  'Everyone gets one automatically. Change it any time — it has to stay unique.'}
              </p>
            </section>

            {/* ── Email + save ───────────────────────── */}
            <section className={CARD}>
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F7E6EF] to-[#EDE4F7] sm:h-16 sm:w-16">
                  <Mail size={22} className="text-[#4A2C5E] sm:hidden" />
                  <Mail size={26} className="hidden text-[#4A2C5E] sm:block" />
                </span>
                <div className="min-w-0 pt-1">
                  <h2 className="font-heading text-2xl font-bold text-[#2A1B3D]">Email</h2>
                  <p className="mt-1 text-sm leading-6 text-[#8A8A8A]">This is the email linked to your account.</p>
                </div>
              </div>

              <div className="relative mt-5">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  value={email || 'Not signed in'}
                  readOnly
                  aria-label="Email"
                  className={cn(INPUT, 'font-semibold cursor-default')}
                />
                <span className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#8A8A8A]">
                  <Lock size={14} />
                </span>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-[18px] bg-[#E8F3E8] p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C6E5C8]">
                  <ShieldCheck size={20} className="text-[#3E8E52]" />
                </span>
                <p className="text-sm leading-6 text-[#3E7D4F]">
                  Email changes require re-verification and are disabled for now.
                </p>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-[18px] bg-danger/10 px-4 py-3 text-sm text-danger">
                  {error}
                </p>
              )}
              {saved && (
                <p
                  role="status"
                  className="mt-4 flex items-center gap-2 rounded-[18px] bg-sage/10 px-4 py-3 text-sm font-medium text-sage-dark"
                >
                  <Check size={16} /> Profile saved.
                </p>
              )}

              <div className="relative mt-6">
                <button
                  onClick={handleSave}
                  disabled={
        saving ||
        !name.trim() ||
        aliasStatus === 'taken' ||
        aliasStatus === 'invalid'
      }
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#4A2C5E] via-[#7A4A72] to-[#C45D3E] py-3.5 text-[15px] font-bold text-white shadow-[0_8px_28px_rgba(74,44,94,0.28)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 sm:py-4 sm:text-base"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <Dashes className="absolute -right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#F0664A]" />
              </div>
            </section>
          </>
        )}
      </div>
    </>
  )
}
