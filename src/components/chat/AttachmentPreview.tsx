'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff, Loader2, Plus, Send, X } from 'lucide-react'

type AttachmentPreviewProps = {
  /** Data URLs of the picked images, in send order. */
  images: { preview: string }[]
  /** Caption lives in the parent so closing and reopening does not lose it. */
  caption: string
  onCaptionChange: (value: string) => void
  onClose: () => void
  onSend: () => void
  onRemove: (index: number) => void
  onAddMore: () => void
  canAddMore: boolean
  sending: boolean
}

/**
 * Full-screen preview shown after a photo is picked or captured.
 *
 * A 20px thumbnail above the composer is not enough to check that the right
 * photo was picked — people routinely attach the wrong one and only notice
 * after it is sent. This gives a full-height view first, with the caption
 * field and send button in the same reach as the image.
 *
 * Dismissal is deliberately not wired to a backdrop click: people tap and drag
 * while reading a photo on mobile, and that gesture would lose the attachment.
 * The X button, Escape and the browser back gesture are the ways out.
 */
export function AttachmentPreview({
  images,
  caption,
  onCaptionChange,
  onClose,
  onSend,
  onRemove,
  onAddMore,
  canAddMore,
  sending,
}: AttachmentPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [index, setIndex] = useState(0)
  // A corrupt or unsupported file can fail to decode in the <img> itself, in
  // which case the browser shows a broken-image glyph with no way to send.
  const [broken, setBroken] = useState(false)

  // Removing the image currently on screen would leave the pager pointing past
  // the end of the array.
  const removeAt = (i: number) => {
    onRemove(i)
    setBroken(false)
    if (i < index) setIndex((v) => Math.max(0, v - 1))
    else if (i === index) setIndex((v) => Math.min(v, images.length - 2))
  }

  const total = images.length
  const go = useCallback((delta: number) => {
    setBroken(false)
    setIndex((v) => (v + delta + total) % total)
  }, [total])

  // Escape closes. The listener is on the window because the overlay itself
  // never holds focus — the caption input does, but only sometimes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (total < 2) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, go, total])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Preview image before sending"
      className="fixed inset-0 z-[60] flex flex-col bg-charcoal/94 backdrop-blur-md"
    >
      <div className="flex items-center justify-between p-4 text-cream">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X size={22} />
        </button>
      </div>

      {/* The image itself takes every pixel that is left over, so a portrait
          screenshot is never shrunk to fit beside the caption bar. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
        {broken ? (
          <div className="flex flex-col items-center gap-3 text-center text-cream/70">
            <ImageOff size={40} />
            <p className="text-sm">This image could not be shown.</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[index]?.preview ?? ''}
            alt={`Preview of image ${index + 1} of ${total} being sent`}
            onError={() => setBroken(true)}
            className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
          />
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail rail. Doubles as the picker: the last tile is an "add more"
          button, so a second photo can be chosen without leaving the sheet. */}
      {total > 1 && (
        <div className="mt-3 flex justify-center gap-2 px-4">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <button
                type="button"
                onClick={() => {
                  setBroken(false)
                  setIndex(i)
                }}
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
                className={`h-14 w-14 overflow-hidden rounded-xl ring-2 transition-all ${
                  i === index ? 'ring-cream' : 'ring-transparent opacity-55'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove image ${i + 1}`}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-cream ring-2 ring-charcoal/60"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {canAddMore && (
            <button
              type="button"
              onClick={onAddMore}
              aria-label="Add another image"
              className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-cream ring-2 ring-transparent transition-colors hover:bg-white/20"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      )}

      {/* Caption + send. Mirrors the composer pill so the send button stays in
          the same place the thumb already trained people to look. */}
      <div className="mt-4 flex items-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-1 items-center gap-3 rounded-full bg-white/10 px-4">
          <input
            ref={inputRef}
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Add a caption..."
            aria-label="Image caption"
            className="min-w-0 flex-1 bg-transparent py-3.5 text-[15px] text-cream outline-none placeholder:text-cream/45"
            disabled={sending}
          />
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          aria-label="Send image"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-plum text-white shadow-[0_6px_18px_rgba(74,44,94,0.45)] transition-transform active:scale-95 disabled:opacity-40"
        >
          {sending ? (
            <Loader2 size={19} className="animate-spin" />
          ) : (
            <Send size={19} />
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * The image grid inside a chat bubble.
 *
 * Layout follows what people already know from chat apps: a single image takes
 * the full bubble, two sit side by side, three form a row, and four or more
 * become a 2x2 grid with a `+N` badge. Every tile opens the lightbox at its own
 * index so the reader lands on the image they tapped.
 */
export function ImageGrid({
  urls,
  onOpen,
}: {
  urls: string[]
  onOpen: (index: number) => void
}) {
  const count = urls.length
  const cols = count === 1 ? 1 : count === 2 || count === 4 ? 2 : 3
  // The +N tile is a visual affordance, not a tenth image.
  const cells = count === 1 ? urls : count === 4 ? urls.slice(0, 4) : urls

  return (
    <div
      className={`-mx-1 mb-1.5 grid w-[calc(100%+0.5rem)] gap-0.5 overflow-hidden rounded-[14px] ${
        cols === 1 ? 'grid-cols-1' : 'grid-cols-2'
      }`}
    >
      {cells.map((url, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`View image ${i + 1} of ${count} full screen`}
          className={`relative cursor-zoom-in overflow-hidden ${
            count === 1 ? 'max-h-64' : 'aspect-square'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          {/* The extra images behind the badge stay tappable via the lightbox. */}
          {i === 3 && count > 4 && (
            <span className="absolute inset-0 flex items-center justify-center bg-charcoal/60 text-2xl font-bold text-cream">
              +{count - 4}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/**
 * Full-screen viewer for images already in the thread, with paging.
 *
 * Messages cap images at a small grid, which is unreadable for a timetable
 * photo or a screenshot of something that matters. Swiping between the images
 * of the same message is expected, so arrows are shown whenever there is more
 * than one, plus a counter.
 */
export function ImageLightbox({
  urls,
  index,
  onIndexChange,
  onClose,
}: {
  urls: string[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const total = urls.length
  const go = useCallback(
    (delta: number) => onIndexChange((index + delta + total) % total),
    [index, onIndexChange, total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (total < 2) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, go, total])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${total}`}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/94 p-4 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
      >
        <X size={22} />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
            aria-label="Previous image"
            className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
            aria-label="Next image"
            className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20"
          >
            <ChevronRight size={24} />
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-cream">
            {index + 1} / {total}
          </span>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[index]}
        alt={`Image ${index + 1} of ${total}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
      />
    </div>
  )
}
