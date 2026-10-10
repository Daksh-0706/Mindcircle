'use client'
import { useEffect, useState } from 'react'
import { AppNav } from '../../../components/layout/AppNavContext'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'
import { Lock, Plus, Search, Send, ChevronRight, Leaf, Heart, Sun, Star, Sparkle, Flower2 } from 'lucide-react'
import Link from 'next/link'
import MoodPicker from '../../../components/ui/MoodPicker'
import { MOOD_EMOJIS } from '../../../lib/constants'
import { formatShortDate, formatTime } from '../../../lib/dates'

/** emoji → label, for showing the mood name next to the picker. */
const MOOD_LABELS: Record<string, string> = Object.fromEntries(
  MOOD_EMOJIS.map((m) => [m.emoji, m.label]),
)
/** emoji → Noto image path, so past entries render consistently on every OS. */
const MOOD_IMAGES: Record<string, string> = Object.fromEntries(
  MOOD_EMOJIS.map((m) => [m.emoji, m.image]),
)

type JournalEntry = {
  id: string
  content: string
  mood_tag?: string | null
  created_at: string
}

const PROMPT_CHIPS = [
  { text: 'How is my body feeling today?', icon: Leaf, bg: 'bg-[#EFEAFB]', iconBg: 'bg-white' },
  { text: 'One tiny win this week...', icon: Flower2, bg: 'bg-[#FBEEDC]', iconBg: 'bg-transparent' },
  { text: 'Placement worries', icon: Heart, bg: 'bg-[#FBE7EC]', iconBg: 'bg-transparent' },
]

const SIDE_PROMPTS = [
  { text: "What's one pressure you can release today?", icon: Leaf, bg: 'bg-[#EFEAFB]', iconBg: 'bg-white' },
  { text: 'Describe a small boundary you set this week.', icon: Sun, bg: 'bg-[#FBEEDC]', iconBg: 'bg-transparent' },
  { text: 'Who in your college makes you feel safest?', icon: Heart, bg: 'bg-[#FBE7EC]', iconBg: 'bg-transparent' },
  { text: 'Write about a private hope for the next semester.', icon: Star, bg: 'bg-[#EAF2FB]', iconBg: 'bg-transparent' },
]

function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return formatShortDate(d)
}

function excerpt(content: string, max = 130) {
  const lines = content.trim().split('\n')
  const body = lines.length > 1 ? lines.slice(1).join(' ').trim() : lines[0]
  const cleaned = body.replace(/\s+/g, ' ')
  if (cleaned.length <= max) return cleaned
  return cleaned.slice(0, max).trimEnd() + '…'
}

function titleOf(content: string, max = 52) {
  const first = (content.trim().split('\n')[0] || '').replace(/\s+/g, ' ')
  if (first.length <= max) return first || 'Untitled entry'
  return first.slice(0, max).trimEnd() + '…'
}

export default function JournalPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const loadEntries = () => {
    fetch('/api/journal')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then((json) => setEntries((json.data ?? []) as JournalEntry[]))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const handleSave = async () => {
    if (!content.trim() || saving) return
    setSaving(true)
    setError('')
    const fullContent = title.trim() ? `${title.trim()}\n\n${content}` : content
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fullContent, mood_tag: mood }),
      })
      if (!res.ok) throw new Error('Could not save your entry. Please try again.')
      setTitle('')
      setContent('')
      setMood(null)
      setSavedAt(formatTime(new Date()))
      loadEntries()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const q = query.trim().toLowerCase()
  const filteredEntries = q
    ? entries.filter((e) => e.content.toLowerCase().includes(q))
    : entries

  return (
    <>
      <AppNav title="Journal" />
      <div className="page-enter space-y-6 pb-8">
        {/* ── Hero: Private Journal + book illustration ──────────── */}
        <section
          className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter px-6 py-8 sm:px-8 sm:py-10"
          style={{
            background: `
              radial-gradient(circle at 78% 55%, rgba(253,215,190,0.55) 0%, rgba(253,215,190,0) 45%),
              radial-gradient(circle at 92% 20%, rgba(240,190,220,0.4) 0%, rgba(240,190,220,0) 35%),
              radial-gradient(circle at 60% 100%, rgba(230,220,250,0.5) 0%, rgba(230,220,250,0) 40%),
              linear-gradient(105deg, #FDF4EC 0%, #FBEFE6 55%, #F6E9EE 100%)
            `,
          }}
        >
          {/* book illustration blending into the background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-book.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 top-1/2 hidden h-[135%] w-auto -translate-y-1/2 object-contain mix-blend-multiply sm:block"
            style={{
              maskImage: 'radial-gradient(ellipse 75% 75% at 60% 50%, black 55%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 60% 50%, black 55%, transparent 100%)',
            }}
          />
          <div className="relative max-w-full sm:max-w-[55%]">
            <h1 className="font-display text-[44px] font-bold leading-[1.08] tracking-tight text-[#3D2A52] sm:text-[52px]">
              <span className="block">Private</span>
              <span className="block bg-gradient-to-r from-[#E88A8A] via-[#C98BB8] to-[#8B7BD8] bg-clip-text text-transparent">Journal</span>
            </h1>
            <p className="mt-4 text-[16px] leading-7 text-charcoal/80">
              A quiet place to unpack thoughts,
              <br className="hidden sm:block" /> safely and anonymously.
            </p>
            <span className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#EAF3EA]/90 px-5 py-2.5 text-[14px] font-semibold text-[#3E7A52] backdrop-blur-sm">
              <Lock size={15} /> Only you can see this
            </span>
          </div>
        </section>

        {/* ── Editor card with soft background ───────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white shadow-[0px_4px_16px_#4A2C5E08]">
          {/* soft waves background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-bg.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="pointer-events-none absolute inset-0 bg-white/70" aria-hidden="true" />

          <div className="relative p-6 sm:p-7">
            {/* prompt chips */}
            <div className="flex flex-col items-start gap-2.5">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip.text}
                  type="button"
                  onClick={() => {
                    if (!title.trim()) setTitle(chip.text)
                    else setContent((prev) => (prev ? `${prev}\n\n${chip.text} ` : `${chip.text} `))
                  }}
                  className={`inline-flex items-center gap-2.5 rounded-full ${chip.bg} px-4 py-2.5 text-[14px] text-charcoal transition-transform hover:-translate-y-0.5`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${chip.iconBg}`}>
                    <chip.icon size={15} className="text-[#8B7BD8]" />
                  </span>
                  {chip.text}
                </button>
              ))}
            </div>
            <Sparkle size={22} className="absolute right-8 top-10 text-[#F0B45A]" aria-hidden="true" />

            {/* title + body */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this entry a title…"
              className="mt-6 w-full border-0 bg-transparent font-heading text-[26px] font-bold text-charcoal outline-none placeholder:text-warm-gray-light"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? There's no right way to write here…"
              className="mt-3 min-h-[260px] w-full resize-none border-0 bg-transparent text-[17px] leading-7 text-charcoal outline-none placeholder:text-warm-gray-light"
            />

            {error && (
              <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            <div className="border-t border-warm-gray-lighter/70 pt-4">
              <span className="font-heading text-[17px] font-bold text-charcoal">Mood check:</span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <MoodPicker variant="compact" selected={mood} onSelect={setMood} />
                {mood && (
                  <span className="rounded-full bg-plum/10 px-2.5 py-1 text-[11px] font-semibold text-plum">
                    {MOOD_LABELS[mood] ?? mood}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-warm-gray">{content.length} characters</span>
                {savedAt && <span className="text-xs text-[#80698A]">Saved {savedAt}</span>}
                <button
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(91,75,158,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Send size={17} />
                  {saving ? 'Saving…' : 'Publish to private journal'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reflective prompts ─────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-white p-6 shadow-[0px_4px_16px_#4A2C5E08] sm:p-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/journal-bg.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full object-cover object-bottom opacity-70"
          />
          <div className="pointer-events-none absolute inset-0 bg-white/60" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-[26px] font-bold text-[#2A1B3D]">Reflective prompts</h2>
              <Sparkle size={20} className="mt-1 text-[#F0B45A]" aria-hidden="true" />
            </div>
            <div className="mt-4 space-y-3">
              {SIDE_PROMPTS.map((prompt) => (
                <button
                  key={prompt.text}
                  type="button"
                  onClick={() => setContent((prev) => (prev ? `${prev}\n\n${prompt.text} ` : `${prompt.text} `))}
                  className={`flex w-full items-center gap-3.5 rounded-2xl ${prompt.bg} px-4 py-3.5 text-left transition-transform hover:-translate-y-0.5`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${prompt.iconBg}`}>
                    <prompt.icon size={17} className="text-[#8B7BD8]" />
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] leading-6 text-charcoal">{prompt.text}</span>
                  <ChevronRight size={16} className="shrink-0 text-charcoal/50" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Past entries ───────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[30px] font-bold text-[#2A1B3D]">Past Entries</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-warm-gray-lighter bg-white px-3">
                <Search size={15} className="text-warm-gray" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="w-44 bg-transparent py-2.5 pl-2.5 pr-2 text-[13px] outline-none placeholder:text-warm-gray"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="rect" height={84} />
              <Skeleton variant="rect" height={84} />
              <Skeleton variant="rect" height={84} />
            </div>
          ) : filteredEntries.length === 0 ? (
            <EmptyState
              icon={<Plus size={26} />}
              title={q ? 'No matching entries' : 'No entries yet'}
              description={q ? 'Try a different search.' : 'Write your first entry and it will appear here.'}
            />
          ) : (
            <div className="space-y-3">
              {filteredEntries.slice(0, 10).map((entry) => {
                const words = entry.content.trim().split(/\s+/).filter(Boolean).length
                return (
                  <Link
                    key={entry.id}
                    href={`/app/journal/${entry.id}`}
                    className="flex items-center gap-6 rounded-2xl border border-warm-gray-lighter bg-white p-5 transition-colors hover:bg-[#FBF7F2]"
                  >
                    <span className="w-16 shrink-0 text-[13px] font-bold text-[#80698A]">{dayLabel(entry.created_at)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-plum">{titleOf(entry.content)}</p>
                      <p className="mt-0.5 truncate text-[13px] text-charcoal/90">{excerpt(entry.content)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      {entry.mood_tag && (
                        <span title={MOOD_LABELS[entry.mood_tag] ?? entry.mood_tag} className="flex h-7 w-7 items-center justify-center">
                          {MOOD_IMAGES[entry.mood_tag] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={MOOD_IMAGES[entry.mood_tag]} alt={MOOD_LABELS[entry.mood_tag] ?? 'mood'} className="h-6 w-6" />
                          ) : (
                            <span className="text-xl">{entry.mood_tag}</span>
                          )}
                        </span>
                      )}
                      <span className="text-xs text-[#80698A]">{words} words</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
