export const NAV_ITEMS = [
  { label: 'Home', href: '/app', icon: 'Home' },
  { label: 'Journal', href: '/app/journal', icon: 'BookOpen' },
  { label: 'Connect', href: '/app/connect', icon: 'Users' },
  { label: 'Insights', href: '/app/insights', icon: 'BarChart3' },
  { label: 'Chats', href: '/app/chats', icon: 'MessageCircle' },
] as const

export const SIDEBAR_ITEMS = [
  { label: 'Home', href: '/app', icon: 'Home' },
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
  { emoji: '😊', image: '/emojis/happy.png', label: 'Happy', color: '#F4C542', score: 5 },
  { emoji: '😌', image: '/emojis/peaceful.png', label: 'Peaceful', color: '#7B9E6B', score: 4 },
  { emoji: '😐', image: '/emojis/neutral.png', label: 'Neutral', color: '#8A8A8A', score: 3 },
  { emoji: '😤', image: '/emojis/frustrated.png', label: 'Frustrated', color: '#C45D3E', score: 2 },
  { emoji: '😰', image: '/emojis/anxious.png', label: 'Anxious', color: '#9B6B9E', score: 2 },
  { emoji: '😔', image: '/emojis/sad.png', label: 'Sad', color: '#6B8CBA', score: 1 },
] as const

export const FEATURES = [
  {
    title: 'Private Journaling',
    description: 'Write freely with end-to-end encryption. Your thoughts stay yours — always.',
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
