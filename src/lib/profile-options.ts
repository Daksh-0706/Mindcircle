/**
 * Everything the profile-setup flow (and Discover) picks from.
 *
 * Kept in one place so the onboarding screens, the Discover grid and the
 * settings avatar picker cannot drift apart — an avatar the API refuses to
 * store is the classic failure here.
 */

/** Emoji avatars offered on step 1. Each needs a pastel disc behind it. */
export const ONBOARDING_AVATARS: { emoji: string; disc: string }[] = [
  { emoji: '🌱', disc: '#E7F3E4' },
  { emoji: '☀️', disc: '#FBF1DC' },
  { emoji: '☁️', disc: '#E8EFFA' },
  { emoji: '💜', disc: '#F2EAFB' },
  { emoji: '🎮', disc: '#EFEAFB' },
  { emoji: '📚', disc: '#E7F3E4' },
  { emoji: '☕', disc: '#F7EDE6' },
  { emoji: '🌙', disc: '#EDEAFB' },
  { emoji: '🐱', disc: '#FBF1DC' },
]

export type Interest = { label: string; emoji: string; disc: string }

export const INTERESTS: Interest[] = [
  { label: 'Mental Health', emoji: '🧠', disc: '#FBE7EC' },
  { label: 'Music', emoji: '🎧', disc: '#EFEAFB' },
  { label: 'Tech', emoji: '💻', disc: '#E8EFFA' },
  { label: 'Gaming', emoji: '🎮', disc: '#F2EAFB' },
  { label: 'Reading', emoji: '📚', disc: '#E7F3E4' },
  { label: 'Personal Growth', emoji: '🌱', disc: '#E7F3E4' },
  { label: 'Movies & TV', emoji: '🎬', disc: '#FBF1DC' },
  { label: 'Art & Design', emoji: '🎨', disc: '#FBE7EC' },
  { label: 'Fitness', emoji: '💪', disc: '#E8EFFA' },
  { label: 'Travel', emoji: '✈️', disc: '#EFEAFB' },
  { label: 'Cooking', emoji: '🍳', disc: '#FBF1DC' },
  { label: 'Photography', emoji: '📷', disc: '#E8EFFA' },
  { label: 'Spirituality', emoji: '🧘', disc: '#E7F3E4' },
  { label: 'Fashion', emoji: '👗', disc: '#FBE7EC' },
  { label: 'Sports', emoji: '⚽', disc: '#E7F3E4' },
  { label: 'Volunteering', emoji: '🤝', disc: '#F2EAFB' },
]

export type Goal = { id: string; title: string; description: string; emoji: string; disc: string }

/** Step 3. `preselected` mirrors the mockup's starting selection. */
export const GOALS: Goal[] = [
  {
    id: 'mental-health',
    title: 'Take care of my mental health',
    description: 'Feel better, manage stress and anxiety.',
    emoji: '🧠',
    disc: '#FBE7EC',
  },
  {
    id: 'like-minded',
    title: 'Meet like-minded people',
    description: 'Find a supportive community.',
    emoji: '👥',
    disc: '#E8EFFA',
  },
  {
    id: 'habits',
    title: 'Build better habits',
    description: 'Stay consistent and feel more productive.',
    emoji: '🎯',
    disc: '#FDECE4',
  },
  {
    id: 'self',
    title: 'Understand myself better',
    description: 'Explore my thoughts, patterns and emotions.',
    emoji: '🌱',
    disc: '#E7F3E4',
  },
  {
    id: 'emotional',
    title: 'Find emotional support',
    description: 'Talk, share and feel less alone.',
    emoji: '❤️',
    disc: '#FBE7EC',
  },
  {
    id: 'guidance',
    title: 'Get guidance from professionals',
    description: 'Access expert advice when needed.',
    emoji: '🎓',
    disc: '#EFEAFB',
  },
  {
    id: 'positive',
    title: 'Feel more positive',
    description: 'Build a happier, healthier mindset.',
    emoji: '☀️',
    disc: '#FBF1DC',
  },
  {
    id: 'community',
    title: 'Be part of a safe community',
    description: 'Connect in a respectful and judgment-free space.',
    emoji: '👥',
    disc: '#EFEAFB',
  },
  {
    id: 'explore',
    title: 'Just explore',
    description: "I'm here to see what it's about.",
    emoji: '♾️',
    disc: '#FDF4EC',
  },
]

export const PRESELECTED_GOALS = ['mental-health', 'self', 'community']

export type MockPerson = {
  id: string
  name: string
  emoji: string
  city: string
  bio: string
  interests: string[]
  disc: string
}

/**
 * Sample directory.
 *
 * People discovery has no backend yet, so both Discover and the "Find your
 * people" panel on step 4 read this fixed list. Replace with an API response
 * when profiles become real — the card markup stays as-is.
 */
export const MOCK_PEOPLE: MockPerson[] = [
  { id: 'p1', name: 'Aarav', emoji: '🌱', city: 'Ghaziabad', bio: 'trying to be a better version of myself everyday :)', interests: ['Mental Health', 'Personal Growth', 'Reading'], disc: '#E7F3E4' },
  { id: 'p2', name: 'Riya', emoji: '🎧', city: 'Delhi', bio: 'here for good conversations and kinder days 🌸', interests: ['Mental Health', 'Music', 'Reading'], disc: '#F2EAFB' },
  { id: 'p3', name: 'Karan', emoji: '🎮', city: 'Noida', bio: 'gym, good tech and even better people.', interests: ['Tech', 'Gaming', 'Fitness'], disc: '#E8EFFA' },
  { id: 'p4', name: 'Meera', emoji: '🌻', city: 'Gurgaon', bio: 'big feelings, bigger playlists 🎧', interests: ['Music', 'Personal Growth'], disc: '#FBF1DC' },
  { id: 'p5', name: 'Vibhaan', emoji: '☕', city: 'Gurgaon', bio: 'overthinking enthusiast, chai lover, code sometimes', interests: ['Tech', 'Reading', 'Music'], disc: '#F7EDE6' },
  { id: 'p6', name: 'Sana', emoji: '🌙', city: 'Delhi', bio: 'creating a softer life ✨', interests: ['Personal Growth', 'Art & Design', 'Spirituality'], disc: '#EDEAFB' },
  { id: 'p7', name: 'Aditya', emoji: '📚', city: 'Noida', bio: 'building cool stuff and meeting cooler people.', interests: ['Tech', 'Reading', 'Gaming'], disc: '#E7F3E4' },
  { id: 'p8', name: 'Pallavi', emoji: '🌸', city: 'Delhi', bio: 'healing, learning and meeting people on the way 💗', interests: ['Mental Health', 'Personal Growth'], disc: '#FBE9F1' },
  { id: 'p9', name: 'Kabir', emoji: '🦋', city: 'Ghaziabad', bio: 'collecting good memories 🌏', interests: ['Tech', 'Gaming', 'Travel'], disc: '#E8EFFA' },
  { id: 'p10', name: 'Ishita', emoji: '💜', city: 'Noida', bio: 'mental peace > everything', interests: ['Mental Health', 'Spirituality', 'Reading'], disc: '#F2EAFB' },
  { id: 'p11', name: 'Arjun', emoji: '🎨', city: 'Delhi', bio: 'good music, good people, good days', interests: ['Music', 'Art & Design', 'Movies & TV'], disc: '#FBF1DC' },
  { id: 'p12', name: 'Tanya', emoji: '📷', city: 'Gurgaon', bio: 'just a girl trying to figure it out 🌷', interests: ['Photography', 'Reading', 'Movies & TV'], disc: '#E7F3E4' },
]

export const interestLabel = (label: string) =>
  INTERESTS.find((i) => i.label === label) ?? { label, emoji: '✨', disc: '#EFEAFB' }

/**
 * Best `limit` matches for a set of chosen interests: people sharing the most
 * interests come first, ties broken by directory order so results are stable.
 */
export function matchPeople(interests: string[], limit = 4): { person: MockPerson; shared: string[] }[] {
  return MOCK_PEOPLE.map((person) => {
    const shared = person.interests.filter((i) => interests.includes(i))
    return { person, shared }
  })
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, limit)
}
