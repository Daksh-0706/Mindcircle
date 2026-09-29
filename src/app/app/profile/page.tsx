'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronRight, Edit, Flame, Heart, LockKeyhole, Star, TrendingUp, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import { useIsMobile, useIsDesktop } from '../../../hooks/useMediaQuery'
import { cn } from '../../../lib/utils'
import { aliasFor } from '../../../lib/alias'
import { formatMonthYear, formatShortDate } from '../../../lib/dates'
import Skeleton from '../../../components/ui/Skeleton'
import EmptyState from '../../../components/ui/EmptyState'

type Entry = { id: string; content: string; mood_tag?: string | null; created_at: string }
type Match = { id: string; user1_id: string; user2_id: string; similarity_score: number; match_reason: string | null }
type Achievement = { id: string; title: string; description: string; icon: React.ComponentType<{ className?: string }>; earned: boolean }

const tabs = [
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'connections', label: 'Connections', icon: Users },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
]

const INTEREST_TAGS = ['Journaling', 'Peer support', 'Mood tracking']

function formatDate(iso: string) {
  return formatShortDate(new Date(iso))
}

function titleOf(content: string, max = 48) {
  const first = (content.trim().split('\n')[0] || '').replace(/\s+/g, ' ')
  if (first.length <= max) return first || 'Untitled entry'
  return first.slice(0, max).trimEnd() + '…'
}

function previewOf(content: string, max = 110) {
  const lines = content.trim().split('\n')
  const body = lines.length > 1 ? lines.slice(1).join(' ') : ''
  const cleaned = (body || lines[0] || '').replace(/\s+/g, ' ')
  if (cleaned.length <= max) return cleaned
  return cleaned.slice(0, max).trimEnd() + '…'
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('journal')
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  const [me, setMe] = useState<{ email: string | null; createdAt: string; avatarEmoji: string; anonymousId: string } | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [moodLogs, setMoodLogs] = useState<{ created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/me').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/journal').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/matches').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/mood').then((res) => (res.ok ? res.json() : { data: [] })),
    ])
      .then(([meJson, journalJson, matchJson, moodJson]) => {
        if (!active) return
        if (meJson) {
          setMe({
            email: meJson.user?.email ?? null,
            createdAt: meJson.user?.createdAt ?? '',
            avatarEmoji: meJson.profile?.avatar_emoji || '😊',
            anonymousId: meJson.profile?.anonymous_id || 'anon',
          })
        }
        setEntries((journalJson.data ?? []) as Entry[])
        setMatches((matchJson.data ?? []) as Match[])
        setMoodLogs((moodJson.data ?? []) as { created_at: string }[])
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const nameFromEmail = (email: string | null | undefined) => {
    if (!email) return 'Member'
    const local = (email.split('@')[0] || '').replace(/[._-]+/g, ' ').trim()
    if (!local) return 'Member'
    const first = local.split(' ')[0]
    return first.charAt(0).toUpperCase() + first.slice(1)
  }
  const initialsFrom = (email: string | null | undefined) => nameFromEmail(email).slice(0, 2).toUpperCase()

  const activeDays = new Set([
    ...moodLogs.map((m) => new Date(m.created_at).toDateString()),
    ...entries.map((e) => new Date(e.created_at).toDateString()),
  ]).size

  const achievements: Achievement[] = [
    { id: 'first-entry', title: 'First Entry', description: 'Wrote your first journal entry', icon: BookOpen, earned: entries.length > 0 },
    { id: 'first-checkin', title: 'Mood Checked', description: 'Logged your first mood check-in', icon: TrendingUp, earned: moodLogs.length > 0 },
    { id: 'habit-7', title: '7-Day Habit', description: 'Active on 7 different days', icon: Flame, earned: activeDays >= 7 },
    { id: 'community', title: 'Community Member', description: 'Made your first connection', icon: Users, earned: matches.length > 0 },
    { id: 'gratitude', title: 'Gratitude Master', description: 'Write 50 journal entries', icon: Heart, earned: entries.length >= 50 },
  ]

  const displayName = me ? nameFromEmail(me.email) : 'Member'
  const initials = initialsFrom(me?.email)
  const alias = me?.anonymousId ? aliasFor(me.anonymousId) : 'anonymous-you'

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="page-enter mx-auto space-y-8 pb-10"
      >
        {/* Identity card */}
        <div className="rounded-[20px] border border-warm-gray-lighter bg-white p-7">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative">
              <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border-4 border-cream bg-gradient-to-br from-plum to-terracotta shadow-strong">
                <span className="font-heading text-3xl font-bold text-cream">{loading ? '·' : initials}</span>
              </div>
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-sage" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-bold text-plum md:text-3xl">
                  {loading ? 'Loading…' : `${displayName} ${me?.avatarEmoji ?? ''}`}
                </h1>
                <button className="glass-card rounded-full p-2" aria-label="Edit profile">
                  <Edit size={16} className="text-plum" />
                </button>
              </div>
              <p className="mt-1 text-sm text-warm-gray">@{alias}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {INTEREST_TAGS.map((tag) => (
                  <span key={tag} className="rounded-full bg-cream-dark px-2.5 py-1 text-[11px] text-plum">{tag}</span>
                ))}
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-2 text-xs text-sage-dark sm:flex">
              <LockKeyhole size={14} /> Private account
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={cn('grid gap-3', isMobile ? 'grid-cols-3' : 'grid-cols-4')}>
          {[
            { icon: BookOpen, label: 'Entries', value: loading ? '—' : String(entries.length), color: '#4A2C5E' },
            { icon: Users, label: 'Connections', value: loading ? '—' : String(matches.length), color: '#7B9E6B' },
            { icon: Flame, label: 'Active days', value: loading ? '—' : String(activeDays), color: '#C45D3E' },
            ...(!isMobile ? [{ icon: Trophy, label: 'Badges', value: loading ? '—' : String(achievements.filter((a) => a.earned).length), color: '#6B8CBA' }] : []),
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                <span className="text-xs font-medium uppercase tracking-wide text-warm-gray">{stat.label}</span>
              </div>
              <p className="font-heading text-2xl font-bold text-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div>
          <div className="mb-6 flex items-center gap-1 rounded-xl bg-cream-dark p-1" role="tablist">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                  activeTab === tab.id ? 'bg-white text-plum shadow-soft' : 'text-warm-gray hover:text-charcoal',
                )}
                role="tab"
                aria-selected={activeTab === tab.id}
                layoutId="tab-underline"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                initial={false}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="tabpanel"
            >
              {activeTab === 'journal' && (
                loading ? (
                  <div className="space-y-3">
                    <Skeleton variant="rect" height={72} />
                    <Skeleton variant="rect" height={72} />
                  </div>
                ) : entries.length === 0 ? (
                  <EmptyState
                    icon={<BookOpen size={26} />}
                    title="No entries yet"
                    description="Your journal is waiting whenever you're ready."
                    action={{ label: 'Write now', onClick: () => { window.location.href = '/app/journal' } }}
                  />
                ) : (
                  <div className="space-y-3">
                    {entries.slice(0, 10).map((entry) => (
                      <div key={entry.id} className="glass-card flex items-center gap-6 rounded-2xl p-5 transition-shadow hover:shadow-medium">
                        <span className="w-16 shrink-0 text-[13px] font-bold text-[#80698A]">{formatDate(entry.created_at)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-bold text-plum">{titleOf(entry.content)}</p>
                          <p className="mt-0.5 line-clamp-1 text-[13px] text-charcoal/90">{previewOf(entry.content)}</p>
                        </div>
                        {entry.mood_tag && <span className="shrink-0 text-xl">{entry.mood_tag}</span>}
                        <ChevronRight size={16} className="shrink-0 text-warm-gray" />
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'connections' && (
                loading ? (
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton variant="rect" height={130} />
                    <Skeleton variant="rect" height={130} />
                    <Skeleton variant="rect" height={130} />
                  </div>
                ) : matches.length === 0 ? (
                  <EmptyState
                    icon={<Users size={26} />}
                    title="No connections yet"
                    description="When you match with someone from the community, they'll show up here."
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {matches.map((match) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-xl p-4 text-center transition-shadow hover:shadow-medium"
                      >
                        <div className="relative mx-auto mb-3 w-fit">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-plum font-heading text-lg font-bold text-cream">A</div>
                          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-cream bg-sage" />
                        </div>
                        <p className="truncate font-medium text-charcoal">Anonymous</p>
                        <p className="mt-1 text-xs text-warm-gray">
                          {match.similarity_score ? `${Math.round(match.similarity_score * 100)}% match` : 'New match'}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'glass-card flex items-center gap-4 rounded-xl p-4',
                        achievement.earned ? 'opacity-100' : 'opacity-50',
                      )}
                    >
                      <div className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                        achievement.earned ? 'bg-plum/10 text-plum' : 'bg-warm-gray-lighter text-warm-gray-light',
                      )}>
                        <achievement.icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-heading font-medium text-charcoal">{achievement.title}</h4>
                        <p className="mt-0.5 text-sm text-warm-gray">{achievement.description}</p>
                      </div>
                      {achievement.earned ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-cream">
                          <Star size={14} fill="currentColor" />
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-warm-gray-light text-xs">🔒</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {isDesktop && me?.createdAt && (
          <p className="text-center text-xs text-warm-gray">
            Member since {formatMonthYear(new Date(me.createdAt))} · Your identity is never shared
          </p>
        )}
      </motion.div>
    </div>
  )
}
