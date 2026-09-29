const ADJECTIVES = [
  'quiet', 'gentle', 'warm', 'calm', 'soft', 'brave', 'kind', 'misty',
  'golden', 'silver', 'little', 'steady', 'bright', 'mellow', 'cosmic',
]

const ANIMALS = [
  'sparrow', 'breeze', 'clover', 'river', 'willow', 'ember', 'cloud',
  'fern', 'lantern', 'harbor', 'meadow', 'pebble', 'raven', 'thistle', 'wren',
]

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Stable anonymous alias like "quiet-sparrow-42" derived from a uuid.
 * Same uuid always maps to the same alias within a session's lifetime.
 */
export function aliasFor(id: string): string {
  const h = hash(id)
  const adjective = ADJECTIVES[h % ADJECTIVES.length]
  const animal = ANIMALS[(h >> 4) % ANIMALS.length]
  const number = (h >> 8) % 90 + 10
  return `${adjective}-${animal}-${number}`
}

/** Room emoji map used across Chats/Connect/ChatDetail. */
const ROOM_EMOJI_MAP: Record<string, string> = {
  'quiet mornings': '☕',
  'exam overwhelm': '📚',
  'anonymous support': '🤝',
  'late-night listeners': '🎧',
  'creative corner': '🎨',
  'study buddies': '✍️',
}

const ROOM_DESC_MAP: Record<string, string> = {
  'quiet mornings': 'Start your day with simple positive intentions before lectures hit.',
  'exam overwhelm': 'A place to decompress and share heavy test anxieties together.',
  'anonymous support': 'Safe, heavily moderated room for deeply personal venting.',
  'late-night listeners': 'Hostel life is quiet at night but minds can wander. Sit and listen.',
  'creative corner': 'Express thoughts through non-pressure doodling, music, or poetry.',
  'study buddies': 'Quiet workspace rooms where you can co-work without expectation.',
}

export function roomEmoji(name: string): string {
  return ROOM_EMOJI_MAP[name.toLowerCase()] ?? '💬'
}

export function roomDescription(name: string): string {
  return ROOM_DESC_MAP[name.toLowerCase()] ?? 'A safe, anonymous space to share and listen.'
}
