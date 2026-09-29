'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Smile,
  Zap,
  Flame,
  Leaf,
  Star,
  Moon,
  Sun,
  UserPlus,
} from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import { MOOD_EMOJIS } from '@/lib/constants'
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery'

const STORY_TABS = [
  { label: 'Stories', value: 'stories' },
  { label: 'Rooms', value: 'rooms' },
  { label: 'People', value: 'people' },
] as const

const STORIES = [
  { id: 'you', name: 'Your Story', initials: 'YS', color: 'plum', hasStory: false },
  { id: '1', name: 'Anonymous', initials: 'A', color: 'sage', hasStory: true },
  { id: '2', name: 'Anonymous', initials: 'A', color: 'terracotta', hasStory: true },
  { id: '3', name: 'Anonymous', initials: 'A', color: 'plum-light', hasStory: true },
  { id: '4', name: 'Anonymous', initials: 'A', color: 'sage-light', hasStory: true },
  { id: '5', name: 'Anonymous', initials: 'A', color: 'terracotta-light', hasStory: true },
  { id: '6', name: 'Anonymous', initials: 'A', color: 'plum', hasStory: false },
  { id: '7', name: 'Anonymous', initials: 'A', color: 'sage-dark', hasStory: true },
]

const FEED_STORIES = [
  {
    id: 's1',
    initials: 'A',
    color: 'sage',
    timeAgo: '2h ago',
    content: 'Today was overwhelming but I found a quiet moment during lunch to just breathe. Sometimes the smallest pauses make the biggest difference. 🌿',
    mood: '😌 Peaceful',
    moodColor: 'sage',
    likes: 12,
    comments: 3,
  },
  {
    id: 's2',
    initials: 'A',
    color: 'terracotta',
    timeAgo: '5h ago',
    content: 'Had a panic attack before my presentation but used the 4-7-8 breathing technique from the activities section. It actually worked! Proud of myself for getting through it.',
    mood: '😤 Frustrated',
    moodColor: 'terracotta',
    likes: 24,
    comments: 8,
  },
  {
    id: 's3',
    initials: 'A',
    color: 'plum',
    timeAgo: '1d ago',
    content: 'Started journaling again after a 3-month break. Forgot how much it helps to get thoughts out of my head and onto paper. Day 1: feeling hopeful.',
    mood: '😊 Happy',
    moodColor: 'plum',
    likes: 31,
    comments: 5,
  },
  {
    id: 's4',
    initials: 'A',
    color: 'sage-light',
    timeAgo: '2d ago',
    content: 'Reminder to everyone: it\'s okay to not be okay. You don\'t have to have it all figured out. Take it one moment at a time. 💜',
    mood: '😐 Neutral',
    moodColor: 'sage-light',
    likes: 47,
    comments: 12,
  },
] as const

const COLORS: Record<string, string> = {
  plum: 'bg-plum',
  'plum-light': 'bg-plum-light',
  'plum-dark': 'bg-plum-dark',
  terracotta: 'bg-terracotta',
  'terracotta-light': 'bg-terracotta-light',
  'terracotta-dark': 'bg-terracotta-dark',
  sage: 'bg-sage',
  'sage-light': 'bg-sage-light',
  'sage-dark': 'bg-sage-dark',
}

const RING_COLORS: Record<string, string> = {
  plum: 'ring-plum',
  'plum-light': 'ring-plum-light',
  'plum-dark': 'ring-plum-dark',
  terracotta: 'ring-terracotta',
  'terracotta-light': 'ring-terracotta-light',
  'terracotta-dark': 'ring-terracotta-dark',
  sage: 'ring-sage',
  'sage-light': 'ring-sage-light',
  'sage-dark': 'ring-sage-dark',
}

const TEXT_COLORS: Record<string, string> = {
  plum: 'text-plum',
  'plum-light': 'text-plum-light',
  'plum-dark': 'text-plum-dark',
  terracotta: 'text-terracotta',
  'terracotta-light': 'text-terracotta-light',
  'terracotta-dark': 'text-terracotta-dark',
  sage: 'text-sage',
  'sage-light': 'text-sage-light',
  'sage-dark': 'text-sage-dark',
}

function StoryAvatar({ story, index }: { story: typeof STORIES[number]; index: number }) {
  const ringColor = RING_COLORS[story.color] || 'ring-plum'
  const bgColor = COLORS[story.color] || 'bg-plum'
  const textColor = TEXT_COLORS[story.color] || 'text-plum'

  return (
    <motion.div
      key={story.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', damping: 20, stiffness: 300 }}
      className="flex shrink-0 flex-col items-center gap-2"
    >
      <div className="relative">
        <div
          className={cn(
            'flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-offset-2 ring-offset-white shadow-soft',
            story.id === 'you' ? 'bg-cream-dark' : bgColor,
            story.hasStory && story.id !== 'you' ? ringColor : 'ring-warm-gray-lighter',
          )}
        >
          {story.id === 'you' ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-plum to-terracotta">
              <Plus className="h-5 w-5 text-cream" />
            </div>
          ) : (
            <span className="text-xl font-semibold text-cream">{story.initials}</span>
          )}
        </div>
        {story.hasStory && story.id !== 'you' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-soft"
          >
            <Flame className={cn('h-3 w-3', textColor)} />
          </motion.div>
        )}
      </div>
      <span className="text-xs font-medium text-charcoal text-center max-w-[68px] truncate">
        {story.name}
      </span>
    </motion.div>
  )
}

function FeedStoryCard({ story, index }: { story: typeof FEED_STORIES[number]; index: number }) {
  const bgColor = COLORS[story.color] || 'bg-plum'
  const textColor = TEXT_COLORS[story.color] || 'text-plum'
  const moodColorClass = `text-${story.moodColor}`

  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState<number>(story.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  return (
    <motion.article
      key={story.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', damping: 20, stiffness: 300 }}
      className={cn('glass-card rounded-2xl p-5', 'pb-safe')}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', bgColor)}>
          <span className="text-sm font-semibold text-cream">{story.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-charcoal truncate">Anonymous</p>
          <p className="text-xs text-warm-gray">{story.timeAgo}</p>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-dark text-warm-gray transition-colors hover:text-charcoal"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="text-charcoal mb-3 leading-relaxed">{story.content}</p>

      <div className="flex items-center gap-2 mb-4">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-cream-dark',
            moodColorClass,
          )}
        >
          {story.mood}
        </span>
      </div>

      <div className="flex items-center gap-1 border-t border-warm-gray-lighter pt-3">
        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
          aria-pressed={liked}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition-all',
            liked ? 'bg-plum/10 text-plum' : 'text-warm-gray hover:bg-cream-dark hover:text-charcoal',
          )}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          <span>{likes}</span>
        </button>
        <button
          type="button"
          aria-label="Comment"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium text-warm-gray hover:bg-cream-dark hover:text-charcoal transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{story.comments}</span>
        </button>
        <button
          type="button"
          aria-label="Share"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium text-warm-gray hover:bg-cream-dark hover:text-charcoal transition-colors"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  )
}

function RoomsTab() {
  return (
    <div className="space-y-4">
      <p className="text-center text-warm-gray py-12">Rooms coming soon</p>
    </div>
  )
}

function PeopleTab() {
  return (
    <div className="space-y-4">
      <p className="text-center text-warm-gray py-12">People coming soon</p>
    </div>
  )
}

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState('stories')
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  return (
    <div className="min-h-screen">
      {/* Sticky Tab Bar */}
      <div className="sticky top-16 z-10 lg:top-0 bg-cream/80 backdrop-blur-md border-b border-warm-gray-lighter">
        <Tabs tabs={STORY_TABS} active={activeTab} onChange={setActiveTab} className="px-4 pb-3 lg:px-0" />
      </div>

      <div className="px-4 pb-24 lg:px-8 lg:pb-16">
        {/* Stories Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Stories Horizontal Scroll */}
              <div className="scroll-x-hidden overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
                <div className="flex gap-3 min-w-max lg:justify-center">
                  {STORIES.map((story, index) => (
                    <StoryAvatar key={story.id} story={story} index={index} />
                  ))}
                </div>
              </div>

              {/* Feed */}
              <div className={cn('space-y-4', isDesktop ? 'max-w-xl mx-auto' : 'w-full')}>
                {FEED_STORIES.map((story, index) => (
                  <FeedStoryCard key={story.id} story={story} index={index} />
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'rooms' && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RoomsTab />
            </motion.div>
          )}
          {activeTab === 'people' && (
            <motion.div
              key="people"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PeopleTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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