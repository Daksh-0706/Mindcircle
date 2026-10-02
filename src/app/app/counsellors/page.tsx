'use client'
import Link from 'next/link'
import { AppNav } from '../../../components/layout/AppNavContext'
import { ArrowRight, BadgeCheck, Briefcase, Calendar, ChevronRight, Clock, Info, Lock, ShieldCheck, Video } from 'lucide-react'
import { COUNSELLORS } from '../../../lib/counsellors'
import { cn } from '../../../lib/utils'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Verified professionals', sub: 'Connect with qualified and reviewed counsellors.', iconBg: 'bg-[#E9F3E9]', iconColor: 'text-[#3E7A52]', tint: 'from-[#FBFDFB] to-[#F3F8F3]' },
  { icon: Calendar, label: 'Flexible sessions', sub: 'Pick a time that works for you.', iconBg: 'bg-[#FBEEDC]', iconColor: 'text-[#B4762E]', tint: 'from-[#FFFBF6] to-[#FBF3E8]' },
  { icon: Lock, label: 'Private & secure', sub: 'Your conversations stay confidential.', iconBg: 'bg-[#EFEAFB]', iconColor: 'text-[#6B4A80]', tint: 'from-[#FDFCFF] to-[#F5F1FB]' },
]

/** Per-counsellor card art. */
const CARD_ART: Record<string, string> = {
  'dr-ananya-rao': '/counsellor-card-ananya.png',
  'rhea-mehta': '/counsellor-card-rhea.png',
}

export default function CounsellorsPage() {
  return (
    <>
      <AppNav title="Counsellors" />
      <div className="page-enter space-y-5 pb-8">
        {/* ── Hero with illustration ──────────────────────────── */}
        <section className="relative overflow-hidden rounded-[24px]">
          {/* whole scene as background — girl sits naturally on the right */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/counsellors-hero.jpg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
          />
          {/* soft left wash so text stays readable */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FDF4EC]/95 via-[#FDF4EC]/60 to-transparent" aria-hidden="true" />
          <div className="relative max-w-full px-6 py-8 sm:max-w-[55%] sm:px-8 sm:py-10">
            <h1 className="font-heading text-[40px] font-bold leading-[1.08] text-[#3D2060] sm:text-[46px]">
              Find someone
              <br />
              who gets it.
            </h1>
            {/* orange squiggle underline */}
            <svg width="120" height="10" viewBox="0 0 120 10" className="mt-2" aria-hidden="true">
              <path d="M2 6 Q 20 1, 38 5 T 74 5 T 110 4" fill="none" stroke="#E08A54" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="mt-4 max-w-xs text-[15px] leading-7 text-charcoal/75">
              Verified counsellors are here when peer support isn&apos;t quite enough. Take your time finding the right fit.
            </p>
          </div>
        </section>

        {/* ── Preview banner with document illustration ───────── */}
        <section className="relative overflow-hidden rounded-[22px] border border-[#F5D9A8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/counsellors-preview.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FFF9EC]/95 via-[#FFF9EC]/80 to-transparent" aria-hidden="true" />
          <div className="relative flex items-start gap-4 px-5 py-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#E8A33D] bg-white/70">
              <Info size={20} className="text-[#E8A33D]" />
            </span>
            <div className="max-w-[70%]">
              <p className="font-heading text-[17px] font-bold leading-snug text-[#9A6B1F]">
                Preview — counsellors aren&apos;t verified or bookable yet
              </p>
              <p className="mt-1.5 text-[14px] leading-6 text-[#B08A45]">
                These profiles show how the directory will look once our counsellors complete verification and go live. Booking and messaging will open soon.
              </p>
            </div>
          </div>
        </section>

        {/* ── Feature rows ────────────────────────────────────── */}
        <section className="space-y-3.5">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.label}
              className={cn(
                'relative flex items-center gap-4 overflow-hidden rounded-[22px] border border-warm-gray-lighter/70 bg-gradient-to-r px-5 py-4 shadow-[0_2px_12px_rgba(74,44,94,0.05)] transition-transform hover:-translate-y-0.5',
                badge.tint,
              )}
            >
              <span className={cn('flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl p-3.5', badge.iconBg)}>
                <badge.icon size={22} className={badge.iconColor} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[17px] font-bold text-[#3D2A52]">{badge.label}</p>
                <p className="mt-0.5 truncate text-[14px] text-charcoal/70">{badge.sub}</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-charcoal/50" />
            </div>
          ))}
        </section>

        {/* ── Counsellor cards ────────────────────────────────── */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COUNSELLORS.map((counsellor) => {
            const art = CARD_ART[counsellor.slug] ?? '/counsellor-card-ananya.png'
            return (
              <div
                key={counsellor.slug}
                className="relative overflow-hidden rounded-[24px] border border-warm-gray-lighter/70 shadow-[0_4px_18px_rgba(74,44,94,0.07)] transition-transform hover:-translate-y-0.5"
              >
                {/* cozy room scene as card background, art on the right */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
                />
                {/* left wash for text readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" aria-hidden="true" />

                <div className="relative p-5 pr-28">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <span className={cn('flex h-14 w-14 items-center justify-center rounded-full text-base font-semibold text-cream ring-4 ring-white/70', counsellor.color)}>
                        {counsellor.initials}
                      </span>
                      {/* online dot */}
                      <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#4CAF50]" aria-label="Online" />
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h2 className="font-heading text-[18px] font-bold text-[#2A1B3D]">{counsellor.name}</h2>
                    <BadgeCheck size={16} className="shrink-0 text-[#8A8A8A]" />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {counsellor.specialty.split('·').map((tag) => (
                      <span key={tag} className="rounded-full bg-[#FBE7EC] px-3 py-1 text-[12px] font-semibold text-[#B5476B]">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-[13px] text-charcoal/75">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-charcoal/60" />
                      {counsellor.experience}
                    </span>
                    <span className="h-4 w-px bg-warm-gray-lighter" />
                    <span className="flex items-center gap-1.5">
                      <Video size={14} className="text-charcoal/60" />
                      Online
                    </span>
                  </div>

                  <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#FDF3D9] px-3 py-1.5 text-[12px] font-semibold text-[#9A6B1F]">
                    <Clock size={12} /> Verification in progress
                  </span>

                  <Link
                    href={`/app/counsellor/${counsellor.slug}`}
                    className="mt-3.5 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4A2060] via-[#8A3E78] to-[#C45D6E] py-2.5 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(138,62,120,0.35)] transition-transform hover:-translate-y-0.5"
                  >
                    Preview profile <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </>
  )
}
