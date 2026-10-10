'use client'

import { cn } from '../../lib/utils'

/**
 * Map of emoji character → Noto image filename in /public/emojis.
 * Any emoji not in this map falls back to the system glyph.
 */
export const NOTO_EMOJIS: Record<string, string> = {
  // Moods
  '😊': 'happy.webp',
  '😌': 'peaceful.webp',
  '😐': 'neutral.webp',
  '😤': 'frustrated.webp',
  '😰': 'anxious.webp',
  '😔': 'sad.webp',
  // Rooms & activities
  '☕': 'coffee.webp',
  '📚': 'books.webp',
  '🤝': 'handshake.webp',
  '🎧': 'headphone.webp',
  '🎨': 'art.webp',
  '✍️': 'writing.webp',
  '💬': 'speech.webp',
  '🌿': 'herb.webp',
  '🦋': 'butterfly.webp',
  // Misc UI
  '🔥': 'fire.webp',
  '🌱': 'seedling.webp',
  '🌙': 'moon.webp',
  '⭐': 'star.webp',
  '🍀': 'clover.webp',
  '🌸': 'blossom.webp',
  '🔒': 'lock.webp',
  // Activities
  '🧘': 'meditation.webp',
  '🌻': 'sunflower.webp',
  '🌬️': 'wind.webp',
  '📵': 'phone-off.webp',
  '📷': 'camera.webp',
  // Onboarding
  '📝': 'memo.webp',
  '💜': 'purple-heart.webp',
}

interface NotoEmojiProps {
  emoji: string
  /** Pixel size of the rendered image. */
  size?: number
  className?: string
  label?: string
}

/**
 * Renders an emoji as a Google Noto PNG so it looks identical on every
 * platform (Windows emoji rendering is inconsistent). Falls back to the
 * raw glyph when no Noto asset exists for that emoji.
 */
export default function NotoEmoji({ emoji, size = 20, className, label }: NotoEmojiProps) {
  const file = NOTO_EMOJIS[emoji]
  if (!file) return <span className={className}>{emoji}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/emojis/${file}`}
      alt={label ?? emoji}
      width={size}
      height={size}
      draggable={false}
      className={cn('inline-block select-none align-[-0.15em]', className)}
      style={{ width: size, height: size }}
    />
  )
}
