'use client'

import { cn } from '../../lib/utils'

/**
 * Map of emoji character → Noto image filename in /public/emojis.
 * Any emoji not in this map falls back to the system glyph.
 */
export const NOTO_EMOJIS: Record<string, string> = {
  // Moods
  '😊': 'happy.png',
  '😌': 'peaceful.png',
  '😐': 'neutral.png',
  '😤': 'frustrated.png',
  '😰': 'anxious.png',
  '😔': 'sad.png',
  // Rooms & activities
  '☕': 'coffee.png',
  '📚': 'books.png',
  '🤝': 'handshake.png',
  '🎧': 'headphone.png',
  '🎨': 'art.png',
  '✍️': 'writing.png',
  '💬': 'speech.png',
  '🌿': 'herb.png',
  '🦋': 'butterfly.png',
  // Misc UI
  '🔥': 'fire.png',
  '🌱': 'seedling.png',
  '🌙': 'moon.png',
  '⭐': 'star.png',
  '🍀': 'clover.png',
  '🌸': 'blossom.png',
  '🔒': 'lock.png',
  // Activities
  '🧘': 'meditation.png',
  '🌻': 'sunflower.png',
  '🌬️': 'wind.png',
  '📵': 'phone-off.png',
  '📷': 'camera.png',
  // Onboarding
  '📝': 'memo.png',
  '💜': 'purple-heart.png',
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
