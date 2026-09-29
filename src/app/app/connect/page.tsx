'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Camera,
  Heart,
  Plus,
  Share2,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery'
import { roomDescription, roomEmoji } from '@/lib/alias'

const CIRCLE_TABS = ['All rooms active', 'Stories', 'People'] as const

type Story = {
  id: string
  content: string
  mood_emoji: string | null
  media_url: string | null
  like_count: number
  liked_by_me: boolean
  is_mine: boolean
  created_at: string
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

function StoryCard({ story, onLike }: { story: Story; onLike: (story: Story) => Promise<void> }) {
  const [liked, setLiked] = useState(story.liked_by_me)
  const [likes, setLikes] = useState(story.like_count)
  const [liking, setLiking] = useState(false)

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
          <span className="text-xs text-warm-gray">{timeAgo(story.created_at)}</span>
        </div>
        <p className="mt-1 text-[13px] leading-6 text-charcoal/90">{story.content}</p>
        {story.media_url && (
          <img src={story.media_url} alt="Shared story moment" className="mt-3 max-h-72 w-full rounded-xl object-cover" />
        )}
        {story.mood_emoji && (
          <span className="mt-2 inline-flex items-center rounded-full bg-cream-dark px-2.5 py-1 text-[11px] text-plum">
            {story.mood_emoji} feeling
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
        </div>
      </div>
    </div>
  )
}

export default function ConnectPage() {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const [activeTab, setActiveTab] = useState<(typeof CIRCLE_TABS)[number]>('All rooms active')
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
    sessionStorage.setItem('mindcircle-story-photo', captured)
  }

  return (
    <div className="min-h-screen">
      <div className="page-enter space-y-8 pb-24">
        {/* Header + tabs */}
        <div className="flex flex-col items-start gap-1">
          <h1 className="font-heading text-[32px] font-bold text-plum">Peer Circles</h1>
          <p className="text-sm text-charcoal">Anonymous, small campus discussion rooms moderated for safety.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CIRCLE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors',
                  activeTab === tab ? 'bg-sage text-white' : 'border border-warm-gray-lighter bg-white text-plum',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link href="/app/story/create" className="btn-gradient rounded-full px-5 py-2.5 text-[13px] font-bold">
            + New story
          </Link>
        </div>

        {/* Rooms (default tab) */}
        {activeTab === 'All rooms active' && (
          <div className="space-y-2 rounded-[20px] border border-warm-gray-lighter bg-white p-3">
            {loading ? (
              <div className="space-y-3 p-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} variant="rect" height={72} />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <EmptyState icon={<Sparkles size={26} />} title="No rooms yet" description="Support circles will appear here once they are created." />
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="flex flex-wrap items-center gap-4 p-5">
                  <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-3xl bg-cream-dark text-[22px]">
                    {roomEmoji(room.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-plum">{room.name}</p>
                    <p className="mt-0.5 text-[13px] text-charcoal/90">{roomDescription(room.name)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-6">
                    <span className="flex items-center gap-1.5 text-xs text-[#80698A]">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                      {room.member_count} members
                    </span>
                    <Link
                      href={`/app/chat/${room.id}`}
                      className="rounded-full border border-sage-dark px-[18px] py-2 text-[13px] font-bold text-sage-dark transition-colors hover:bg-sage/10"
                    >
                      {room.is_member ? 'Open room' : 'Join quietly'}
                    </Link>
                  </div>
                </div>
              ))
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
              stories.map((story) => <StoryCard key={story.id} story={story} onLike={handleLike} />)
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
              {photo && <button type="button" onClick={() => setPhoto(null)} className="rounded-full border border-cream/30 px-4 py-3 text-sm text-cream">Retake</button>}
              <button type="button" onClick={takePhoto} disabled={Boolean(photo)} className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-plum disabled:opacity-40" aria-label="Take photo"><Camera size={23} /></button>
              <button type="button" onClick={() => window.location.href = '/app/story/create'} className="rounded-full border border-cream/30 px-5 py-3 text-sm font-semibold text-cream">Continue to editor</button>
            </div>
          </div>
        </div>
      )}

      {/* FAB - Create Story */}
      <Link
        href="/app/story/create"
        className="fixed bottom-6 right-4 z-20 lg:bottom-8 lg:right-8"
        aria-label="Create new story"
      >
        <motion.button
          type="button"
          className="btn-gradient flex h-14 w-14 items-center justify-center rounded-full shadow-strong"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Create story"
        >
          <Plus className="h-6 w-6 text-cream" />
        </motion.button>
      </Link>
    </div>
  )
}
