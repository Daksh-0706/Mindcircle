import type { Metadata } from 'next'
import Link from 'next/link'
import { Compass, Heart, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'That page does not exist. Head back to your safe space.',
  robots: { index: false, follow: true },
}

/** Small hand-drawn accent strokes used beside the logo in the mockup. */
function Dashes({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <line x1="3" y1="12" x2="7.5" y2="5.5" />
        <line x1="9.5" y1="14" x2="15" y2="6.5" />
        <line x1="16" y1="15.5" x2="19" y2="11" />
      </g>
    </svg>
  )
}

/**
 * Custom 404 — cream page with the mockup layout: nav pill, dancing mascot
 * animation on the left, 404 art + copy + actions on the right.
 */
export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FDF5F1]">
      {/* Soft pastel blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 24% 46%, rgba(250, 222, 228, 0.55) 0%, rgba(250, 222, 228, 0) 42%),
            radial-gradient(circle at 88% 40%, rgba(233, 224, 248, 0.55) 0%, rgba(233, 224, 248, 0) 34%),
            radial-gradient(circle at 96% 72%, rgba(249, 224, 235, 0.50) 0%, rgba(249, 224, 235, 0) 36%),
            radial-gradient(circle at 10% 12%, rgba(252, 236, 228, 0.60) 0%, rgba(252, 236, 228, 0) 38%)
          `,
        }}
      />

      {/* Decorative corners lifted from the template */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/notfound-cloud-left.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 hidden w-[34%] max-w-[620px] md:block"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/notfound-right.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[17vh] hidden w-[150px] xl:block xl:w-[217px]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/notfound-leaves.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 hidden w-[130px] md:block lg:w-[175px]"
      />

      {/* ── Nav pill ─────────────────────────────────── */}
      <header className="relative mx-auto max-w-[1520px] px-4 pt-5 sm:px-8">
        <nav className="flex items-center justify-between rounded-full bg-white/90 px-5 py-3 shadow-[0_6px_24px_rgba(74,44,94,0.07)] sm:px-7">
          <span className="flex items-start gap-1">
            <span className="font-heading text-lg font-bold text-[#4A2C5E] sm:text-xl">MindCircle</span>
            <Dashes className="-mt-1 h-4 w-4 text-[#F0876B]" />
          </span>
          <div className="hidden items-center gap-6 text-[15px] font-medium text-[#6B5A80] md:flex lg:gap-8">
            <Link href="/" className="transition-colors hover:text-[#4A2C5E]">
              Home
            </Link>
            <Link href="/app/journal" className="transition-colors hover:text-[#4A2C5E]">
              Journal
            </Link>
            <Link href="/app/connect" className="transition-colors hover:text-[#4A2C5E]">
              Connect
            </Link>
            <Link href="/app/help/faq" className="transition-colors hover:text-[#4A2C5E]">
              Help
            </Link>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full bg-[#EFEAF9] px-4 py-2 text-sm font-bold text-[#4A2C5E] transition-colors hover:bg-[#E7DFF7] sm:px-5 sm:py-2.5"
          >
            <Home size={16} />
            Go Home
          </Link>
        </nav>
      </header>

      {/* ── Main ─────────────────────────────────────── */}
      <main className="relative mx-auto flex max-w-[1520px] flex-col items-center gap-10 px-5 pb-28 pt-10 sm:px-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6 lg:pt-14">
        {/* Dancing mascot animation */}
        <div className="flex justify-center lg:order-none lg:justify-center lg:pl-6">
          <div className="relative w-[180px] sm:w-[260px] lg:w-[330px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-[48px] bg-gradient-to-br from-[#F9DEE7]/80 via-transparent to-[#E9E0F8]/80 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[32px] ring-4 ring-white shadow-[0_24px_60px_rgba(74,44,94,0.22)]">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                src="/notfound-dancer.webm"
                className="block aspect-[9/16] w-full object-cover"
              />
              {/* Palette wash so the grey-room footage reads as pastel artwork */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F7DCE7]/85 via-[#E9E0F8]/70 to-[#FADCE4]/85 mix-blend-color"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#4A2C5E]/10 via-transparent to-white/20"
              />
            </div>
          </div>
        </div>

        {/* Copy + actions */}
        <div className="text-center lg:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/notfound-404.png"
            alt=""
            aria-hidden="true"
            className="mx-auto w-[300px] max-w-full sm:w-[400px] lg:mx-0 lg:w-full lg:max-w-[560px]"
          />
          <h1 className="font-heading text-[32px] font-bold leading-tight text-[#3D2659] sm:text-[44px]">
            Oops! Page not found.
          </h1>
          <p className="mx-auto mt-4 max-w-[430px] text-[15px] leading-7 text-[#8A7FA0] sm:text-base lg:mx-0">
            Looks like this page took a little detour. It might be moved, deleted, or never existed — but you&apos;re
            still in the right place{' '}
            <Heart size={15} className="inline -mt-0.5 text-[#F0776B]" aria-hidden="true" />
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/app"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4A2C5E] via-[#8A5A78] to-[#E08A6A] px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_28px_rgba(196,110,90,0.35)] transition-transform hover:-translate-y-0.5 sm:px-8 sm:py-4 sm:text-base"
            >
              <Home size={18} />
              Go to Home
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-[#CFBBF0] bg-white/60 px-7 py-3.5 text-[15px] font-bold text-[#4A2C5E] transition-colors hover:bg-[#F6F1FD] sm:px-8 sm:py-4 sm:text-base"
            >
              <Compass size={18} />
              Explore MindCircle
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
