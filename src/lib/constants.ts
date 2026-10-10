export const NAV_ITEMS = [
  { label: 'Home', href: '/app', icon: 'Home' },
  { label: 'Journal', href: '/app/journal', icon: 'BookOpen' },
  { label: 'Connect', href: '/app/connect', icon: 'Users' },
  { label: 'Discover', href: '/app/discover', icon: 'Compass' },
  { label: 'Chats', href: '/app/chats', icon: 'MessageCircle' },
] as const

export const SIDEBAR_ITEMS = [
  { label: 'Home', href: '/app', icon: 'Home' },
  { label: 'Journal', href: '/app/journal', icon: 'BookOpen' },
  { label: 'Connect', href: '/app/connect', icon: 'Users' },
  { label: 'Discover', href: '/app/discover', icon: 'Compass' },
  { label: 'Insights', href: '/app/insights', icon: 'BarChart3' },
  { label: 'Chats', href: '/app/chats', icon: 'MessageCircle' },
  { label: 'Activities', href: '/app/activities', icon: 'Sparkles' },
  { label: 'Counsellors', href: '/app/counsellors', icon: 'Stethoscope' },
  { label: 'Settings', href: '/app/settings', icon: 'Settings' },
  { label: 'Crisis Support', href: '/app/crisis', icon: 'Heart' },
] as const

export const MOOD_EMOJIS = [
  { emoji: '😊', image: '/emojis/happy.webp', label: 'Happy', color: '#F4C542', score: 5 },
  { emoji: '😌', image: '/emojis/peaceful.webp', label: 'Peaceful', color: '#7B9E6B', score: 4 },
  { emoji: '😐', image: '/emojis/neutral.webp', label: 'Neutral', color: '#8A8A8A', score: 3 },
  { emoji: '😤', image: '/emojis/frustrated.webp', label: 'Frustrated', color: '#C45D3E', score: 2 },
  { emoji: '😰', image: '/emojis/anxious.webp', label: 'Anxious', color: '#9B6B9E', score: 2 },
  { emoji: '😔', image: '/emojis/sad.webp', label: 'Sad', color: '#6B8CBA', score: 1 },
] as const

export const FEATURES = [
  {
    title: 'Private Journaling',
    description:
      'Write freely in a journal locked to your account alone. Your thoughts stay yours — always.',
    icon: 'Lock',
    tile: 'bg-[#EDE4FB]',
    iconColor: 'text-plum',
    card: 'bg-[#F3EEFC]',
  },
  {
    title: 'Mood Tracking',
    description: 'Visualize your emotional patterns over time with beautiful, insightful charts.',
    icon: 'TrendingUp',
    tile: 'bg-[#FCE0EA]',
    iconColor: 'text-[#C0477A]',
    card: 'bg-[#FCEDF3]',
  },
  {
    title: 'Peer Support',
    description: 'Connect with like-minded students in anonymous, safe community spaces.',
    icon: 'Users',
    tile: 'bg-[#FDE3D3]',
    iconColor: 'text-terracotta',
    card: 'bg-[#FDF0E6]',
  },
  {
    title: 'Guided Activities',
    description: 'Explore breathing exercises, grounding techniques, and mindfulness practices.',
    icon: 'Compass',
    tile: 'bg-[#E2EFDB]',
    iconColor: 'text-sage-dark',
    card: 'bg-[#EDF4E8]',
  },
  {
    title: 'Professional Help',
    description: 'Access verified counselors when you need more than peer support.',
    icon: 'Stethoscope',
    tile: 'bg-[#EDE4FB]',
    iconColor: 'text-plum',
    card: 'bg-[#F3EEFC]',
  },
  {
    title: 'Crisis Support',
    description: 'Instant access to helplines and grounding exercises when you need them most.',
    icon: 'Phone',
    tile: 'bg-[#FCE0EA]',
    iconColor: 'text-[#C0477A]',
    card: 'bg-[#FCEDF3]',
  },
] as const

/* Testimonials used to live here as three invented reviews (Priya S., Arjun
   K., Maya R.) rendered on the landing page. They were removed rather than
   softened: we had no real users behind them, and publishing invented
   testimonials from a mental-health app is both misleading and, in most
   consumer-protection regimes, unlawful. Real quotes belong here once they
   exist, with the person's actual permission to be named. */
