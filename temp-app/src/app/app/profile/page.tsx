'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, BookOpen, Users, Award, Calendar, MessageSquare, Star, Heart, Flame, TrendingUp, ChevronRight, Settings } from 'lucide-react'
import Link from 'next/link'
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery'
import { MOOD_EMOJIS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const mockEntries = [
  { id: 1, date: 'Sep 3, 2025', title: 'Feeling grateful for small wins...', mood: '😌', preview: 'Today was a good day. Managed to finish the project I\'ve been stressing about...' },
  { id: 2, date: 'Sep 1, 2025', title: 'Anxious about tomorrow\'s presentation', mood: '😰', preview: 'Have a big presentation tomorrow and I\'m feeling the pressure. Trying breathing exercises...' },
  { id: 3, date: 'Aug 28, 2025', title: 'Weekend nature walk cleared my mind', mood: '😊', preview: 'Went for a long walk in the park. The fresh air and green scenery really helped...' },
]

const mockConnections = [
  { id: 1, name: 'Priya S.', initials: 'PS', color: '#7B9E6B', status: 'Active 2h ago' },
  { id: 2, name: 'Arjun K.', initials: 'AK', color: '#4A2C5E', status: 'Active 5h ago' },
  { id: 3, name: 'Maya R.', initials: 'MR', color: '#C45D3E', status: 'Active 1d ago' },
  { id: 4, name: 'Sam T.', initials: 'ST', color: '#6B8CBA', status: 'Active 3d ago' },
  { id: 5, name: 'Leah M.', initials: 'LM', color: '#9B6B9E', status: 'Active 1w ago' },
  { id: 6, name: 'Chris W.', initials: 'CW', color: '#8A8A8A', status: 'Active 2w ago' },
]

const mockAchievements = [
  { id: 1, title: 'First Entry', description: 'Wrote your first journal entry', icon: BookOpen, earned: true, color: '#7B9E6B' },
  { id: 2, title: '7-Day Streak', description: 'Journaled for 7 days in a row', icon: Flame, earned: true, color: '#C45D3E' },
  { id: 3, title: 'Community Helper', description: 'Helped 5 community members', icon: Users, earned: false, color: '#4A2C5E' },
  { id: 4, title: 'Mood Tracker', description: 'Tracked mood for 30 days', icon: TrendingUp, earned: false, color: '#7B9E6B' },
  { id: 5, title: 'Deep Listener', description: 'Commented on 10 posts', icon: MessageSquare, earned: false, color: '#C45D3E' },
  { id: 6, title: 'Gratitude Master', description: 'Wrote 50 gratitude entries', icon: Heart, earned: false, color: '#F4C542' },
]

type MockEntry = (typeof mockEntries)[number]
type MockConnection = (typeof mockConnections)[number]
type MockAchievement = (typeof mockAchievements)[number]

const tabs = [
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'connections', label: 'Connections', icon: Users },
  { id: 'achievements', label: 'Achievements', icon: Award },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('journal')
  const [underlineRef, setUnderlineRef] = useState<HTMLDivElement | null>(null)
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mesh-gradient min-h-screen"
      >
        {/* Cover Photo Area */}
        <div className="relative">
          <div className="relative h-[200px] md:h-[250px] lg:h-[200px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-plum/20 via-plum/10 to-terracotta/20" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-plum-light/30 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-terracotta-light/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-plum/10 rounded-full blur-2xl" />
          </div>

          {/* Edit Cover Button */}
          <button
            className="absolute bottom-4 right-4 glass-card p-2 rounded-full shadow-medium hover:shadow-strong transition-shadow"
            aria-label="Edit cover photo"
          >
            <Edit className="w-5 h-5 text-plum" />
          </button>

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative -mt-12 md:-mt-16 flex justify-center"
          >
            <div className="relative">
              <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full bg-gradient-to-br from-plum to-terracotta flex items-center justify-center border-4 border-cream shadow-strong">
                <span className="font-heading text-3xl md:text-4xl font-bold text-cream">AK</span>
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-sage border-4 border-cream rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center mb-6"
          >
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal">Alex Kumar</h1>
            <p className="text-warm-gray mt-1">@alexk</p>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className={cn(
              'grid gap-3 mb-6',
              isMobile ? 'grid-cols-3' : 'grid-cols-4'
            )}
          >
            <StatCard icon={BookOpen} label="Entries" value="47" color="#4A2C5E" delay={0.1} />
            <StatCard icon={Users} label="Connections" value="23" color="#7B9E6B" delay={0.2} />
            <StatCard icon={Flame} label="Streak" value="12" suffix={<span className="ml-1">🔥</span>} color="#C45D3E" delay={0.3} />
            {!isMobile && (
              <StatCard icon={TrendingUp} label="Mood Score" value="7.8" color="#6B8CBA" delay={0.4} />
            )}
          </motion.div>

          {/* Desktop: 2-column layout */}
          {isDesktop ? (
            <div className="grid grid-cols-[300px_1fr] gap-6 max-w-6xl mx-auto">
              {/* Left: Sticky Profile Card */}
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="glass-card rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center gap-3 p-3 bg-plum/10 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-plum to-terracotta rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-cream" />
                    </div>
                    <div>
                      <p className="font-heading font-medium text-charcoal">Account Settings</p>
                      <p className="text-xs text-warm-gray">Manage your profile & preferences</p>
                    </div>
                  </div>
                  <Link href="/app/settings" className="block w-full text-center btn-gradient py-3 rounded-xl font-medium text-sm transition-all hover:shadow-strong">
                    Edit Profile
                  </Link>
                  <div className="pt-4 border-t border-warm-gray-lighter space-y-3">
                    <QuickStat label="Member since" value="Jan 2024" />
                    <QuickStat label="Total entries" value="47" />
                    <QuickStat label="Communities" value="3" />
                  </div>
                </motion.div>
              </div>

              {/* Right: Tab Content */}
              <TabsContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
                underlineRef={setUnderlineRef}
                mockEntries={mockEntries}
                mockConnections={mockConnections}
                mockAchievements={mockAchievements}
              />
            </div>
          ) : (
            // Mobile/Tablet: Stacked tabs
            <TabsContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
              underlineRef={setUnderlineRef}
              mockEntries={mockEntries}
              mockConnections={mockConnections}
              mockAchievements={mockAchievements}
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, suffix, color, delay }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string | number
  suffix?: React.ReactNode
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4 + delay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className="glass-card rounded-xl p-4 text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-xs text-warm-gray font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="font-heading text-2xl font-bold text-charcoal flex items-center justify-center">
        {value}
        {suffix}
      </div>
    </motion.div>
  )
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-warm-gray">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  )
}

function TabsContent({ activeTab, setActiveTab, tabs, underlineRef, mockEntries, mockConnections, mockAchievements }: {
  activeTab: string
  setActiveTab: (tab: string) => void
  tabs: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }>
  underlineRef: (el: HTMLDivElement | null) => void
  mockEntries: MockEntry[]
  mockConnections: MockConnection[]
  mockAchievements: MockAchievement[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      {/* Tab Navigation */}
      <div className="relative mb-6">
        <div className="flex items-center gap-1 bg-cream-dark rounded-xl p-1" role="tablist">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all',
                activeTab === tab.id
                  ? 'text-plum bg-white shadow-soft'
                  : 'text-warm-gray hover:text-charcoal'
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              layoutId="tab-underline"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              initial={false}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Panerns */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'journal' && (
            <div className="space-y-3">
              {mockEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: mockEntries.indexOf(entry) * 0.1 }}
                  className="glass-card rounded-xl p-4 hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-plum/20 to-terracotta/20 flex items-center justify-center text-2xl flex-shrink-0">
                      {entry.mood}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-heading font-medium text-charcoal truncate">{entry.title}</h3>
                        <span className="text-xs text-warm-gray whitespace-nowrap">{entry.date}</span>
                      </div>
                      <p className="text-sm text-warm-gray mt-1 line-clamp-2">{entry.preview}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-warm-gray-light flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="grid grid-cols-3 gap-3">
              {mockConnections.map((conn) => (
                <motion.div
                  key={conn.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: mockConnections.indexOf(conn) * 0.05 }}
                  className="glass-card rounded-xl p-4 text-center hover:shadow-medium transition-shadow group"
                >
                  <div className="relative mx-auto mb-3">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-heading font-bold text-lg text-cream" style={{ backgroundColor: conn.color }}>
                      {conn.initials}
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-sage border-2 border-cream rounded-full" />
                  </div>
                  <p className="font-medium text-charcoal truncate">{conn.name}</p>
                  <p className="text-xs text-warm-gray mt-1">{conn.status}</p>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-3">
              {mockAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: mockAchievements.indexOf(achievement) * 0.05 }}
                  className={cn(
                    'glass-card rounded-xl p-4 flex items-center gap-4 transition-all',
                    achievement.earned ? 'opacity-100' : 'opacity-50'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    achievement.earned
                      ? `bg-[${achievement.color}]/20 text-[${achievement.color}]`
                      : 'bg-warm-gray-lighter text-warm-gray-light'
                  )}>
                    <achievement.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-medium text-charcoal">{achievement.title}</h4>
                    <p className="text-sm text-warm-gray mt-0.5">{achievement.description}</p>
                  </div>
                  {achievement.earned ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: mockAchievements.indexOf(achievement) * 0.05 + 0.3, type: 'spring', stiffness: 500, damping: 20 }}
                      className="w-6 h-6 bg-sage rounded-full flex items-center justify-center text-cream flex-shrink-0"
                    >
                      <Star className="w-4 h-4" fill="currentColor" />
                    </motion.div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-warm-gray-light flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-warm-gray-light font-medium">🔒</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}