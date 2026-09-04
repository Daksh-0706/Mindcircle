export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/app', icon: 'Home' },
  { label: 'Journal', href: '/app/journal', icon: 'BookOpen' },
  { label: 'Connect', href: '/app/connect', icon: 'Users' },
  { label: 'Insights', href: '/app/insights', icon: 'BarChart3' },
  { label: 'Chats', href: '/app/chats', icon: 'MessageCircle' },
] as const

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/app', icon: 'Home' },
  { label: 'Journal', href: '/app/journal', icon: 'BookOpen' },
  { label: 'Connect', href: '/app/connect', icon: 'Users' },
  { label: 'Insights', href: '/app/insights', icon: 'BarChart3' },
  { label: 'Chats', href: '/app/chats', icon: 'MessageCircle' },
  { label: 'Activities', href: '/app/activities', icon: 'Sparkles' },
  { label: 'Counsellors', href: '/app/counsellors', icon: 'Stethoscope' },
  { label: 'Settings', href: '/app/settings', icon: 'Settings' },
  { label: 'Crisis Support', href: '/app/crisis', icon: 'Heart' },
] as const

export const MOOD_EMOJIS = [
  { emoji: '😊', label: 'Happy', color: '#F4C542' },
  { emoji: '😌', label: 'Peaceful', color: '#7B9E6B' },
  { emoji: '😔', label: 'Sad', color: '#6B8CBA' },
  { emoji: '😤', label: 'Frustrated', color: '#C45D3E' },
  { emoji: '😰', label: 'Anxious', color: '#9B6B9E' },
  { emoji: '😐', label: 'Neutral', color: '#8A8A8A' },
] as const

export const FEATURES = [
  {
    title: 'Private Journaling',
    description: 'Write freely with end-to-end encryption. Your thoughts stay yours — always.',
    icon: 'Lock',
  },
  {
    title: 'Mood Tracking',
    description: 'Visualize your emotional patterns over time with beautiful, insightful charts.',
    icon: 'TrendingUp',
  },
  {
    title: 'Peer Support',
    description: 'Connect with like-minded students in anonymous, safe community spaces.',
    icon: 'Users',
  },
  {
    title: 'Guided Activities',
    description: 'Explore breathing exercises, grounding techniques, and mindfulness practices.',
    icon: 'Compass',
  },
  {
    title: 'Professional Help',
    description: 'Access verified counselors when you need more than peer support.',
    icon: 'Stethoscope',
  },
  {
    title: 'Crisis Support',
    description: 'Instant access to helplines and grounding exercises when you need them most.',
    icon: 'Phone',
  },
] as const

export const TESTIMONIALS = [
  {
    name: 'Priya S.',
    role: 'College Student',
    text: 'MindCircle helped me understand that I was not alone. The anonymous community made it safe to open up about my anxiety.',
    initials: 'PS',
    color: '#7B9E6B',
  },
  {
    name: 'Arjun K.',
    role: 'Graduate Student',
    text: 'The journaling feature changed my life. I can see my growth over months, and the mood tracking helped me identify my triggers.',
    initials: 'AK',
    color: '#4A2C5E',
  },
  {
    name: 'Maya R.',
    role: 'Young Professional',
    text: 'Finally, a mental health app that does not feel clinical. The warm design and community rooms make it feel like a safe space.',
    initials: 'MR',
    color: '#C45D3E',
  },
] as const
