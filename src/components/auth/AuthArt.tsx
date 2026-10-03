'use client'

import { motion } from 'framer-motion'
import { Logo } from '@/components/common/Logo'

/** The mark, sized for the disc and with the wordmark left off. */
function BrandMark() {
  return <Logo height={44} className="brightness-0 invert" />
}


/* ── Flourish: the little accent strokes beside a heading ──────────────── */

/**
 * Two short hand-drawn ticks that sit beside the page heading in the design —
 * a bit of the mockup's energy without shipping a bitmap.
 */
export function Flourish({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 34"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
        <line x1="9" y1="4" x2="3" y2="14" />
        <line x1="21" y1="2" x2="15" y2="13" />
        <line x1="34" y1="6" x2="28" y2="16" />
      </g>
    </svg>
  )
}

/* ── Right-hand decorative panel ───────────────────────────────────────── */

/** Four-point sparkle used in the auth artwork. */
function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 0c.6 5.4 6.6 11.4 12 12-5.4.6-11.4 6.6-12 12-.6-5.4-6.6-11.4-12-12C5.4 11.4 11.4 5.4 12 0Z" />
    </svg>
  )
}

/** A leaf sprig, mirroring the botanical strokes in the mockup. */
function LeafSprig({
  className = '',
  flip = false,
}: {
  className?: string
  flip?: boolean
}) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 158C34 116 58 78 104 26" />
        {[
          { x: 30, y: 128, r: -46 },
          { x: 46, y: 104, r: -58 },
          { x: 62, y: 82, r: -70 },
          { x: 78, y: 60, r: -84 },
        ].map((l, i) => (
          <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r})`}>
            <path d="M0 0c-14-4-22-16-20-28 12-1 22 8 20 28Z" fill="currentColor" fillOpacity=".28" />
            <path d="M0 0c12-6 17-19 13-30-11 2-18 13-13 30Z" fill="currentColor" fillOpacity=".45" />
          </g>
        ))}
      </g>
    </svg>
  )
}

type AuthArtProps = {
  /** Gradient accent used behind the logo disc. */
  accent?: 'plum' | 'sage'
}
/**
 * Decorative panel shown to the right of the login and signup forms.
 *
 * All of it is aria-hidden: the quote lives next to it in the page, not inside,
 * so screen readers never announce the artwork.
 */
export function AuthArt({ accent = 'plum' }: AuthArtProps) {
  const disc =
    accent === 'plum'
      ? 'from-[#3A1F4A] via-[#7C3F63] to-[#C45D3E]'
      : 'from-[#5C7A4F] via-[#6B8C6B] to-[#C45D3E]'

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden mesh-gradient"
    >
      {/* Soft pastel blobs */}
      <div className="absolute top-24 left-16 w-52 h-44 bg-[#FBE3D6] blob-shape opacity-70" />
      <div className="absolute top-40 right-24 w-40 h-52 bg-[#E6DCF7] blob-shape opacity-70" />
      <div className="absolute bottom-24 right-40 w-44 h-44 bg-[#F7D9E2] blob-shape opacity-60" />
      <div className="absolute top-16 right-1/3 w-16 h-16 bg-[#E9D9F2] rounded-full opacity-70" />

      {/* Thin swirl lines */}
      <svg
        viewBox="0 0 600 800"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full text-terracotta/35"
      >
        <path
          d="M120 120C240 40 360 200 300 300s-180 60-120 160 220 80 240 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M500 60C420 120 470 240 380 260s-160-40-200 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Sparkles */}
      <Sparkle className="absolute top-32 right-28 w-7 h-7 text-terracotta/45" />
      <Sparkle className="absolute bottom-44 left-28 w-5 h-5 text-plum/35" />
      <Sparkle className="absolute top-1/2 right-16 w-4 h-4 text-terracotta/30" />

      {/* Botanical strokes */}
      <LeafSprig className="absolute -right-6 bottom-0 w-44 h-56 text-plum/45" />
      <LeafSprig
        className="absolute -bottom-4 left-4 w-32 h-44 text-terracotta/35"
        flip
      />

      {/* Logo disc */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-[26%] -translate-x-1/2 w-44 h-44 rounded-full bg-cream/40 backdrop-blur-[2px] p-2 flex items-center justify-center shadow-[0_18px_50px_rgba(58,31,74,0.22)]"
      >
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${disc} flex items-center justify-center`}
        >
          <BrandMark />
        </div>
      </motion.div>
    </div>
  )
}

/* ── Quote ─────────────────────────────────────────────────────────────── */

type AuthQuoteProps = {
  /** Plain text of the quotation, wrapped in typographic quotes. */
  children: React.ReactNode
  author: string
  className?: string
}

/**
 * Serif italic quotation with attribution, as in the design. `font-display` is
 * Playfair, which is what gives the quote its bookish voice against the
 * sans-serif form.
 */
export function AuthQuote({ children, author, className = '' }: AuthQuoteProps) {
  return (
    <blockquote
      className={`relative z-10 mx-auto max-w-sm text-center ${className}`}
    >
      <p className="font-display text-xl xl:text-2xl italic leading-relaxed text-charcoal">
        &ldquo;{children}&rdquo;
      </p>
      <footer className="mt-5 text-sm text-warm-gray">&mdash; {author}</footer>
    </blockquote>
  )
}
