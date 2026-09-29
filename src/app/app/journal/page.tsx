'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppNav } from '../../../components/layout/AppNavContext'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'
import { LockKeyhole, Plus, Search } from 'lucide-react'
import { MOOD_EMOJIS } from '../../../lib/constants'

type JournalEntry = {
  id: string
  content: string
  mood_tag?: string | null
  created_at: string
}

const PROMPT_CHIPS = [
  'How is my body feeling today?',
  'One tiny win this week...',
  'Placement worries',
]

const SIDE_PROMPTS = [
  "What's one pressure you can release today?",
  'Describe a small boundary you set this week.',
  'Who in your college makes you feel safest?',
  'Write about a private hope for the next semester.',
]

function dayLabel(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setSavedAt(new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }))
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
      <div className="page-enter space-y-8 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-[32px] font-bold text-plum">Private Journal</h1>
            <p className="mt-1 text-sm text-charcoal">A quiet place to unpack thoughts, safely and anonymously.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-sage-dark">
            <LockKeyhole size={14} /> Only you can see this
          </div>
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          {/* Editor */}
          <div className="min-w-0 flex-1 space-y-5 rounded-[20px] border border-warm-gray-lighter bg-white p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-bold text-plum">Need a prompt?</span>
              <div className="flex flex-wrap gap-2">
                {PROMPT_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      if (!title.trim()) setTitle(chip)
                      else setContent((prev) => (prev ? `${prev}\n\n${chip} ` : `${chip} `))
                    }}
                    className="rounded-full bg-cream-dark px-3 py-1.5 text-xs text-plum transition-colors hover:bg-plum/10"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this entry a title…"
              className="w-full border-0 bg-transparent font-heading text-[22px] font-bold text-plum outline-none placeholder:text-warm-gray-light"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? There's no right way to write here…"
              className="min-h-[280px] w-full resize-none border-0 bg-transparent text-base leading-7 text-charcoal outline-none placeholder:text-warm-gray-light"
            />

            {error && (
              <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm-gray-lighter pt-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-warm-gray">Mood Check:</span>
                <div className="flex items-center gap-1">
                  {MOOD_EMOJIS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(mood === m.emoji ? null : m.emoji)}
                      aria-label={m.label}
                      aria-pressed={mood === m.emoji}
                      className={`rounded-full p-1.5 text-lg transition-colors ${mood === m.emoji ? 'bg-plum/10' : 'hover:bg-cream-dark'}`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
                {savedAt && <span className="ml-2 text-xs text-[#80698A]">Saved {savedAt}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-warm-gray">{content.length} characters</span>
                <button
                  onClick={handleSave}
                  disabled={saving || !content.trim()}
                  className="rounded-full bg-plum px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Publish to private journal'}
                </button>
              </div>
            </div>
          </div>

          {/* Reflective prompts rail */}
          <div className="w-full space-y-3 rounded-[20px] border border-warm-gray-lighter bg-white p-6 lg:w-[280px] lg:shrink-0">
            <h2 className="font-heading text-lg font-bold text-plum">Reflective prompts</h2>
            {SIDE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setContent((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `))}
                className="w-full rounded-xl bg-cream-dark p-3 text-left text-[13px] text-plum transition-colors hover:bg-plum/10"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Past entries */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-[22px] font-bold text-plum">Past Entries</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-warm-gray-lighter bg-white">
                <Search size={13} className="ml-3 text-warm-gray" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="w-44 bg-transparent py-1.5 pl-2 pr-3 text-xs outline-none placeholder:text-warm-gray"
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
                  <div key={entry.id} className="flex items-center gap-6 rounded-2xl border border-warm-gray-lighter bg-white p-5">
                    <span className="w-16 shrink-0 text-[13px] font-bold text-[#80698A]">{dayLabel(entry.created_at)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-plum">{titleOf(entry.content)}</p>
                      <p className="mt-0.5 truncate text-[13px] text-charcoal/90">{excerpt(entry.content)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      {entry.mood_tag && <span className="text-xl">{entry.mood_tag}</span>}
                      <span className="text-xs text-[#80698A]">{words} words</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
