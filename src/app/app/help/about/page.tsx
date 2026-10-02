import { AppNav } from '../../../../components/layout/AppNavContext'
import { BookOpen, Code2, GraduationCap, Heart, Mail, Sparkles, Target } from 'lucide-react'

/** Soft fade so right-hand illustration crops blend into the card. */
const FADE_LEFT = {
  maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
} as const

const FADE_BOTTOM_LEFT = {
  maskImage: 'radial-gradient(ellipse 75% 75% at 70% 25%, black 45%, transparent 90%)',
  WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 70% 25%, black 45%, transparent 90%)',
} as const

const FADE_TOP = {
  maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
} as const

function Squiggle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2 7C10 2 18 2 26 7s16 5 24 0 16-5 24 0 16 5 24 0 16-5 20-3"
        stroke="#F0876B"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Small hand-drawn accent strokes used beside headings in the mockups. */
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

const pillars = [
  {
    icon: Target,
    title: 'Why',
    text: 'Student mental health deserves tools built with care, not afterthoughts.',
    art: '/about-why.png',
    bg: 'linear-gradient(115deg, #F9F2FC 0%, #F3ECFB 55%, #EEE7F8 100%)',
    iconBg: '#EDE4FA',
  },
  {
    icon: Heart,
    title: 'How',
    text: 'Private-first design, anonymous community, zero judgment anywhere.',
    art: '/about-how.png',
    bg: 'linear-gradient(115deg, #FDEEE3 0%, #FCE6E8 55%, #F9DEE6 100%)',
    iconBg: '#FBDBE1',
  },
  {
    icon: Sparkles,
    title: 'What next',
    text: 'Verified counsellor onboarding and smarter, gentler insights.',
    art: '/about-next.png',
    bg: 'linear-gradient(115deg, #F4F0FC 0%, #E9E8FC 55%, #E1E0FB 100%)',
    iconBg: '#E4E6FB',
  },
]

const insideItems = [
  { icon: BookOpen, label: 'Private journal & mood tracking', desc: 'Only you ever see what you write.', tint: '#ECE7F8' },
  { icon: Sparkles, label: 'Guided activities', desc: 'Breathing, meditation, journaling prompts, and more.', tint: '#FBDDE3' },
  { icon: Heart, label: 'Anonymous peer circles & stories', desc: 'Support that disappears after 24 hours.', tint: '#FBDDE3' },
  { icon: Mail, label: 'Crisis support, always', desc: '24/7 helplines reachable in one tap.', tint: '#ECE7F8' },
]

/**
 * About — who built MindCircle and why. Personal, warm, and honest.
 */
export default function AboutPage() {
  return (
    <>
      <AppNav title="About MindCircle" showBack />
      <div className="page-enter mx-auto max-w-2xl space-y-5 pb-10">
        {/* ── Brand hero ─────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-[24px] text-white shadow-[0_12px_40px_rgba(74,44,94,0.20)]"
          style={{ background: 'linear-gradient(115deg, #5E4378 0%, #7C4C7C 30%, #A35877 58%, #C97391 78%, #DE9796 100%)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-hero-art.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-auto"
            style={FADE_LEFT}
          />
          <div className="relative px-6 py-7">
            <div className="flex items-start gap-2">
              <h1 className="font-heading text-3xl font-bold sm:text-4xl">MindCircle</h1>
              <Dashes className="mt-2 h-5 w-5 shrink-0 text-white/85" />
            </div>
            <p className="mt-2 max-w-[62%] text-sm leading-6 text-white/90">
              A private, student-first wellbeing companion — built on the belief that nobody should have to carry it
              alone.
            </p>
          </div>
        </section>

        {/* ── The person behind it ───────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_12px_40px_rgba(74,44,94,0.10)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-dk-corner.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 w-[40%]"
            style={FADE_BOTTOM_LEFT}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-dk-bottom.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
            style={FADE_TOP}
          />
          <div className="relative px-6 pb-24 pt-6 sm:px-7">
            <div className="relative inline-flex">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#4A2C5E] via-[#8E4A6B] to-[#C45D3E] font-heading text-2xl font-bold text-white shadow-[0_8px_24px_rgba(74,44,94,0.28)] ring-4 ring-white">
                DK
              </div>
              <Dashes className="absolute -right-7 -top-2 h-5 w-5 text-[#F0876B]" />
            </div>

            <h1 className="mt-5 font-heading text-3xl font-bold text-[#2A1B3D]">Hi, I&apos;m Daksh 👋</h1>
            <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#8A8A8A]">
              <GraduationCap size={16} className="mt-0.5 shrink-0 text-[#E0685C]" />
              Student &amp; developer — building for my own community
            </p>

            <p className="mt-4 text-sm leading-7 text-[#5A5A5A]">
              MindCircle started as something I wish existed on my own campus. Between placements, deadlines, and the
              quiet pressure nobody talks about, I watched friends struggle in silence — not because help didn&apos;t
              exist, but because reaching for it felt too heavy, too visible, too complicated.
            </p>
          </div>
        </section>

        {/* ── The belief (continues on the page bg) ──── */}
        <section className="relative px-1 pb-1 pt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-dk-corner.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 w-[34%]"
            style={FADE_BOTTOM_LEFT}
          />
          <p className="relative max-w-[88%] text-base leading-8 text-[#3A3A3A]">
            So I built the thing I wanted to hand them: a place that is{' '}
            <strong className="font-bold text-[#2A1B3D]">private by default</strong>, where journaling stays yours,
            sharing is anonymous by design, and real help — peer rooms, activities, counsellors, crisis lines — is
            never more than a tap away.
          </p>
        </section>

        {/* ── Why / How / What next ──────────────────── */}
        <div className="grid gap-4">
          {pillars.map((item) => (
            <section
              key={item.title}
              className="relative overflow-hidden rounded-[24px] p-6 shadow-[0_8px_32px_rgba(42,27,61,0.08)]"
              style={{ background: item.bg }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.art}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-full w-auto"
                style={FADE_LEFT}
              />
              <div className="relative max-w-[62%]">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-[#4A2C5E]"
                  style={{ backgroundColor: item.iconBg }}
                >
                  <item.icon size={24} />
                </span>
                <h3 className="mt-4 font-heading text-2xl font-bold text-[#3A2B54]">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#7A7590]">{item.text}</p>
              </div>
            </section>
          ))}
        </div>

        {/* ── What's inside ──────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#FDF9F5] p-6 shadow-[0_12px_40px_rgba(74,44,94,0.10)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-dk-corner.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 w-[32%]"
            style={FADE_BOTTOM_LEFT}
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-2xl font-bold text-[#2A1B3D]">What&apos;s inside</h2>
              <Dashes className="h-4 w-4 shrink-0 text-[#F0876B]" />
            </div>
            <Squiggle className="mt-1 h-3 w-20" />

            <ul className="relative z-10 mt-5 space-y-3">
              {insideItems.map((item) => (
                <li key={item.label} className="flex items-start gap-3.5 rounded-[20px] bg-white p-4 shadow-[0_4px_16px_rgba(42,27,61,0.05)]">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#4A2C5E]"
                    style={{ backgroundColor: item.tint }}
                  >
                    <item.icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#2A1B3D]">{item.label}</p>
                    <p className="mt-0.5 text-sm leading-5 text-[#8A8A8A]">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Say hello ──────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-[24px] shadow-[0_12px_40px_rgba(74,44,94,0.20)]"
          style={{ background: 'linear-gradient(115deg, #432A60 0%, #4B3068 50%, #583A6C 100%)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-say-hello.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-auto"
            style={FADE_LEFT}
          />
          <div className="relative px-6 py-6">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-2xl font-bold text-white">Say hello</h2>
              <Dashes className="h-4 w-4 shrink-0 text-[#F0876B]" />
            </div>
            <p className="mt-2 max-w-[55%] text-sm leading-6 text-white/75">
              Feedback, ideas, or just a note — everything is read.
            </p>
            <a
              href="mailto:daksh.24b0101340@abes.ac.in"
              className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#4A2C5E] shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5"
            >
              <Mail size={15} className="shrink-0" />
              <span className="truncate">daksh.24b0101340@abes.ac.in</span>
            </a>
          </div>
        </section>

        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-[#8A8A8A]">
          <Code2 size={13} /> Designed &amp; built with care by Daksh · MindCircle {new Date().getFullYear()}
        </p>
      </div>
    </>
  )
}
