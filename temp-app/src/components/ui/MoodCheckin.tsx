'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MOOD_EMOJIS } from '../../lib/constants'
import EmojiSlider from './EmojiSlider'
import { cn } from '../../lib/utils'

export interface MoodCheckinResult {
  mood: string
  emoji: string
  notes: string
}

interface MoodCheckinProps {
  /** Called when the user saves their mood entry. */
  onSave?: (result: MoodCheckinResult) => void
  className?: string
}

/**
 * Mood check-in widget. Shows a horizontal row of 6 emoji options (from the
 * MOOD_EMOJIS constant) via EmojiSlider. Once one is selected, a note text
 * area and save button appear inside a glass-card wrapper.
 */
export default function MoodCheckin({ onSave, className }: MoodCheckinProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const selectedMood = MOOD_EMOJIS.find((m) => m.label === selected)

  const handleSave = () => {
    if (!selectedMood) return
    onSave?.({ mood: selectedMood.label, emoji: selectedMood.emoji, notes })
  }

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-semibold text-charcoal">
          How are you feeling?
        </h3>
        <p className="text-sm text-warm-gray">Tap an emoji to log your mood</p>
      </div>

      <EmojiSlider emojis={MOOD_EMOJIS} selected={selected} onSelect={setSelected} />

      <AnimatePresence initial={false}>
        {selectedMood && (
          <motion.div
            key="mood-notes"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about how you're feeling…"
                className="input-warm w-full resize-none"
                rows={3}
              />
              <button
                type="button"
                onClick={handleSave}
                className="btn-gradient w-full rounded-xl py-3 text-sm font-semibold"
              >
                Save mood
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
