'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Camera,
  ChevronRight,
  Heart,
  ImagePlus,
  Loader2,
  PenLine,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery'
import NotoEmoji from '@/components/ui/NotoEmoji'
import { roomDescription } from '@/lib/alias'

const CIRCLE_TABS = ['All rooms active', 'Stories', 'People'] as const

/** Per-room themed card art, assigned round-robin by index. */
const ROOM_ART = [
  { art: '/connect-card-purple.png', tint: 'bg-[#EFEAFB]' },
  { art: '/connect-card-pink.png', tint: 'bg-[#FBE7EC]' },
  { art: '/connect-card-blue.png', tint: 'bg-[#EAF2FB]' },
  { art: '/connect-card-green.png', tint: 'bg-[#EAF3EA]' },
] as const

/** Fades card art into the tint so there is no hard vertical seam. */
const CARD_ART_FADE = {
  maskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
} as const

type Story = {
  id: string
  content: string
  mood_emoji: string | null
  media_url: string | null
  like_count: number
  liked_by_me: boolean
  is_mine: boolean
  created_at: string
  expires_at: string
}

type Room = {
  id: string
  name: string
  member_count: number
  is_member: boolean
  last_message: { content: string; created_at: string } | null
}

type Match = {
  id: string
  user1_id: string
  user2_id: string
  similarity_score: number
  match_reason: string | null
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/** Time left until a story expires, e.g. "23h left". */
function timeLeft(iso: string) {
  const minsLeft = Math.floor((new Date(iso).getTime() - Date.now()) / 60000)
  if (minsLeft <= 0) return 'expired'
  if (minsLeft < 60) return `${minsLeft}m left`
  return `${Math.floor(minsLeft / 60)}h left`
}

function StoryCard({ story, onLike, onDelete }: { story: Story; onLike: (story: Story) => Promise<void>; onDelete: (story: Story) => Promise<void> }) {
  const [liked, setLiked] = useState(story.liked_by_me)
  const [likes, setLikes] = useState(story.like_count)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleLike = async () => {
    if (liking) return
    setLiking(true)
    setLiked(!liked)
    setLikes((n) => n + (liked ? -1 : 1))
    await onLike(story)
    setLiking(false)
  }

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'MindCircle story', text: story.content }).catch(() => undefined)
    }
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    await onDelete(story)
    setDeleting(false)
  }

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-warm-gray-lighter bg-white p-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-plum text-sm font-bold text-cream">
        A
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-bold text-charcoal">
            Anonymous{story.is_mine ? ' (you)' : ''}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-gray">{timeAgo(story.created_at)}</span>
            {story.expires_at && (
              <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[10px] font-semibold text-[#80698A]">
                {timeLeft(story.expires_at)}
              </span>
            )}
          </div>
        </div>
        <p className="mt-1 text-[13px] leading-6 text-charcoal/90">{story.content}</p>
        {story.media_url && (
          <img src={story.media_url} alt="Shared story moment" className="mt-3 max-h-72 w-full rounded-xl object-cover" />
        )}
        {story.mood_emoji && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-cream-dark px-2.5 py-1 text-[11px] text-plum">
            <NotoEmoji emoji={story.mood_emoji} size={14} /> feeling
          </span>
        )}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
            aria-pressed={liked}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
              liked ? 'bg-plum/10 text-plum' : 'bg-cream-dark text-warm-gray hover:text-plum',
            )}
          >
            <Heart size={13} className={cn(liked && 'fill-current')} /> {likes}
          </button>
          <button
            type="button"
            onClick={share}
            aria-label="Share"
            className="flex items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-bold text-warm-gray transition-colors hover:text-plum"
          >
            <Share2 size={13} /> Share
          </button>
          {story.is_mine && (
            confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1.5 text-xs font-bold text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full bg-cream-dark px-3 py-1.5 text-xs font-bold text-warm-gray transition-colors hover:text-charcoal"
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete story"
                className="flex items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1.5 text-xs font-bold text-warm-gray transition-colors hover:text-danger"
              >
                <Trash2 size={13} /> Delete
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConnectPage() {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<(typeof CIRCLE_TABS)[number]>('All rooms active')
  const [createOpen, setCreateOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [stories, setStories] = useState<Story[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  const loadStories = () => {
    fetch('/api/stories')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setStories((json.data ?? []) as Story[]))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true
    Promise.all([
      fetch('/api/chat').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/matches').then((res) => (res.ok ? res.json() : { data: [] })),
      fetch('/api/me').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([roomsJson, matchJson, meJson]) => {
        if (!active) return
        setRooms((roomsJson.data ?? []) as Room[])
        setMatches((matchJson.data ?? []) as Match[])
        setMyId(meJson?.user?.id ?? null)
      })
      .catch(() => undefined)
    loadStories()
    return () => {
      active = false
    }
  }, [])

  const handleLike = async (story: Story) => {
    try {
      const res = await fetch('/api/stories/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: story.id }),
      })
      if (!res.ok) return
      const json = await res.json()
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, liked_by_me: json.liked, like_count: json.likes } : s)),
      )
    } catch {
      // Optimistic state already applied; next load corrects it.
    }
  }

  const handleDelete = async (story: Story) => {
    // Optimistic removal; refetch keeps things consistent if the delete fails.
    setStories((prev) => prev.filter((s) => s.id !== story.id))
    try {
      const res = await fetch(`/api/stories?id=${story.id}`, { method: 'DELETE' })
      if (!res.ok) loadStories()
    } catch {
      loadStories()
    }
  }

  useEffect(() => {
    if (!cameraOpen) return
    let stream: MediaStream | undefined
    navigator.mediaDevices?.getUserMedia({ video: true }).then((nextStream) => {
      stream = nextStream
      if (videoRef.current) videoRef.current.srcObject = nextStream
    }).catch(() => setCameraError('Camera access was unavailable. You can still create a story with text.'))
    return () => stream?.getTracks().forEach((track) => track.stop())
  }, [cameraOpen])

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const captured = canvas.toDataURL('image/jpeg', 0.9)
    setPhoto(captured)
    setPostError('')
    sessionStorage.setItem('mindcircle-story-photo', captured)
  }

  /** Instagram-style instant post: one click after capture and the story is live. */
  const postStoryNow = async () => {
    if (!photo || posting) return
    setPosting(true)
    setPostError('')
    try {
      const blob = await (await fetch(photo)).blob()
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Please sign in again.')
      const path = `${userData.user.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('story-media')
        .upload(path, new File([blob], 'story.jpg', { type: 'image/jpeg' }), { contentType: 'image/jpeg' })
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
      const { data: urlData } = supabase.storage.from('story-media').getPublicUrl(path)

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '📷 A moment from my day', media_url: urlData.publicUrl, mood_emoji: null }), // 📷 has no Noto asset; fallback glyph is fine
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not share your story. Please try again.')
      }
      sessionStorage.removeItem('mindcircle-story-photo')
      setPhoto(null)
      setCameraOpen(false)
      setCreateOpen(false)
      setActiveTab('Stories')
      loadStories()
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="page-enter space-y-6 pb-24">
        {/* ── Hero header with people illustration ───────────── */}
        <section className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter bg-gradient-to-r from-[#FDF4EC] via-[#FBEFE6] to-[#F3ECFA] px-6 py-7 sm:px-8">
          {/* people illustration on the right, blended */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/connect-hero.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-1/2 hidden h-[130%] w-auto -translate-y-1/2 object-contain mix-blend-multiply sm:block"
            style={{
              maskImage: 'radial-gradient(ellipse 70% 80% at 55% 50%, black 50%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 55% 50%, black 50%, transparent 95%)',
            }}
          />
          <div className="relative max-w-full sm:max-w-[55%]">
            <h1 className="font-display text-[38px] font-bold leading-[1.1] text-[#3D2A52]">
              Peer{' '}<span className="bg-gradient-to-r from-[#E88A8A] via-[#C98BB8] to-[#8B7BD8] bg-clip-text text-transparent">Circles</span>
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-charcoal/80">
              Anonymous, small campus discussion rooms moderated for safety.
            </p>
          </div>
        </section>

        {/* Tabs + new story */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CIRCLE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-4 py-2.5 text-[13px] font-bold transition-all',
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] text-white shadow-[0_4px_14px_rgba(91,75,158,0.3)]'
                    : 'border border-warm-gray-lighter bg-white text-plum hover:border-plum/30',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link
            href="/app/story/create"
            className="btn-gradient hidden rounded-full px-5 py-2.5 text-[13px] font-bold lg:inline-flex"
            onClick={(e) => {
              e.preventDefault()
              setCreateOpen(true)
            }}
          >
            + New story
          </Link>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="btn-gradient rounded-full px-5 py-2.5 text-[13px] font-bold lg:hidden"
          >
            + New story
          </button>
        </div>

        {/* Rooms (default tab) */}
        {activeTab === 'All rooms active' && (
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <>
                <Skeleton variant="rect" height={150} />
                <Skeleton variant="rect" height={150} />
                <Skeleton variant="rect" height={150} />
                <Skeleton variant="rect" height={150} />
              </>
            ) : rooms.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyState icon={<Sparkles size={26} />} title="No rooms yet" description="Support circles will appear here once they are created." />
              </div>
            ) : (
              rooms.map((room, i) => {
                const theme = ROOM_ART[i % ROOM_ART.length]
                return (
                  <div
                    key={room.id}
                    className={cn(
                      'relative flex items-center gap-3.5 overflow-hidden rounded-[20px] border border-warm-gray-lighter/60 p-3 pr-5 transition-transform hover:-translate-y-0.5',
                      theme.tint,
                    )}
                  >
                    {/* themed art bleeding from the right edge */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={theme.art}
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-0 h-full w-[36%] object-cover object-right"
                      style={CARD_ART_FADE}
                    />
                    <div className="relative z-10 min-w-0 flex-1">
                      <p className="truncate font-heading text-[16px] font-bold text-[#3D2A52]">{room.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-[13px] text-charcoal/70">{roomDescription(room.name)}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-[#80698A]">
                          <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                          {room.member_count} members
                        </span>
                        <Link
                          href={`/app/chat/${room.id}`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 px-3.5 py-1.5 text-[12px] font-bold text-plum shadow-[0_2px_10px_rgba(74,44,94,0.10)] backdrop-blur-sm transition-transform hover:-translate-y-0.5"
                        >
                          {room.is_member ? 'Open room' : 'Join quietly'}
                          <ChevronRight size={13} className="text-plum/60" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Stories tab */}
        {activeTab === 'Stories' && (
          <div className={cn('space-y-4', isDesktop ? 'max-w-2xl' : 'w-full')}>
            {loading ? (
              <>
                <Skeleton variant="rect" height={140} />
                <Skeleton variant="rect" height={140} />
              </>
            ) : stories.length === 0 ? (
              <EmptyState
                icon={<Sparkles size={26} />}
                title="No stories yet"
                description="Be the first to share something — your words might be exactly what someone needs today."
                action={{ label: 'Create a story', onClick: () => { window.location.href = '/app/story/create' } }}
              />
            ) : (
              stories.map((story) => <StoryCard key={story.id} story={story} onLike={handleLike} onDelete={handleDelete} />)
            )}
          </div>
        )}

        {/* People tab */}
        {activeTab === 'People' && (
          <div className="space-y-5">
            <div className="flex flex-col items-start gap-1">
              <h2 className="font-heading text-[22px] font-bold text-plum">People you may relate with</h2>
              <p className="text-xs text-[#80698A]">Aliases are generated and are never real names.</p>
            </div>
            {loading ? (
              <div className="grid gap-5 md:grid-cols-3">
                <Skeleton variant="rect" height={150} />
                <Skeleton variant="rect" height={150} />
                <Skeleton variant="rect" height={150} />
              </div>
            ) : matches.length === 0 ? (
              <EmptyState
                icon={<UserPlus size={26} />}
                title="No matches yet"
                description="When another member with a similar journey joins, you'll see them here."
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                {matches.map((match) => {
                  const otherId = match.user1_id === myId ? match.user2_id : match.user1_id
                  return (
                    <div key={match.id} className="flex flex-col gap-4 rounded-2xl border border-warm-gray-lighter bg-white p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-plum text-sm font-bold text-white">
                          A
                        </span>
                        <p className="text-sm font-bold text-charcoal">Anonymous</p>
                      </div>
                      {match.match_reason && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-cream-dark px-2.5 py-1 text-[11px] text-plum">{match.match_reason}</span>
                        </div>
                      )}
                      <Link
                        href={`/app/chat/${otherId}`}
                        className="rounded-full border border-plum py-2.5 text-center text-[13px] font-bold text-plum transition-colors hover:bg-plum/5"
                      >
                        Say hello
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Mobile bottom padding for FAB */}
        <div className={cn('h-4', !isMobile && 'hidden')} />
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-plum/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-charcoal shadow-strong">
            <div className="flex items-center justify-between px-5 py-4 text-cream">
              <div>
                <p className="text-xs uppercase tracking-[.16em] text-cream/60">Your story</p>
                <h2 className="font-heading text-xl font-semibold">Capture a moment</h2>
              </div>
              <button type="button" onClick={() => setCameraOpen(false)} aria-label="Close camera" className="rounded-full p-2 hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="relative aspect-[4/3] bg-plum/30">
              {photo ? <img src={photo} alt="Captured story preview" className="h-full w-full object-cover" /> : <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />}
              <canvas ref={canvasRef} className="hidden" />
              <div className="pointer-events-none absolute inset-8 rounded-[24px] border border-cream/40" />
              {cameraError && !photo && <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl bg-charcoal/80 p-4 text-center text-sm text-cream">{cameraError}</p>}
            </div>
            <div className="flex items-center justify-center gap-4 px-5 py-5">
              {photo ? (
                <>
                  <button type="button" onClick={() => setPhoto(null)} disabled={posting} className="rounded-full border border-cream/30 px-4 py-3 text-sm text-cream disabled:opacity-40">Retake</button>
                  <button
                    type="button"
                    onClick={postStoryNow}
                    disabled={posting}
                    className="flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-bold text-plum transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {posting && <Loader2 size={15} className="animate-spin" />}
                    {posting ? 'Sharing…' : 'Share story'}
                  </button>
                </>
              ) : (
                <button type="button" onClick={takePhoto} className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-plum" aria-label="Take photo"><Camera size={23} /></button>
              )}
            </div>
            {postError && <p role="alert" className="mx-5 mb-4 rounded-xl bg-charcoal/80 px-4 py-3 text-center text-sm text-cream">{postError}</p>}
          </div>
        </div>
      )}

      {/* FAB - Create Story (opens the pop-out with Write / Upload choices) */}
      <motion.button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="btn-gradient fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-strong lg:bottom-8 lg:right-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Create new story"
        aria-haspopup="dialog"
      >
        <Plus className="h-6 w-6 text-cream" />
      </motion.button>

      {/* Create-story pop-out: two aesthetic choices */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Create a story"
            onClick={() => setCreateOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-plum/50 p-4 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-strong"
            >
              {/* Gradient header */}
              <div className="relative px-6 pb-5 pt-6 text-cream" style={{ background: 'linear-gradient(135deg, #4A2C5E, #C45D3E)' }}>
                <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10 blur-xl" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.18em] text-cream/70">Your story</p>
                    <h2 className="mt-1 font-heading text-2xl font-bold">Share a moment</h2>
                    <p className="mt-1 text-sm text-cream/80">Anonymous, kind, and gone in 24 hours.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    aria-label="Close"
                    className="rounded-full p-2 transition-colors hover:bg-white/10"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Two choices */}
              <div className="space-y-3 p-5">
                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false)
                    router.push('/app/story/create')
                  }}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-warm-gray-lighter p-4 text-left transition-all hover:-translate-y-0.5 hover:border-plum/30 hover:shadow-medium"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-plum/10 text-plum transition-colors group-hover:bg-plum group-hover:text-cream">
                    <PenLine size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-charcoal">Write a story</span>
                    <span className="block text-[13px] text-warm-gray">Put your thoughts into words — with a mood and a photo if you like.</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false)
                    setCameraOpen(true)
                  }}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-warm-gray-lighter p-4 text-left transition-all hover:-translate-y-0.5 hover:border-terracotta/30 hover:shadow-medium"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta transition-colors group-hover:bg-terracotta group-hover:text-cream">
                    <ImagePlus size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold text-charcoal">Click a story</span>
                    <span className="block text-[13px] text-warm-gray">Snap a moment — one more tap and it&apos;s live. Nothing to write.</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
