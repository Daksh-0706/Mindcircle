'use client'
import Link from 'next/link'
import { AppNav } from '../../../components/layout/AppNavContext'
import { ArrowRight, BadgeCheck, Calendar, ShieldCheck } from 'lucide-react'
import { COUNSELLORS } from '../../../lib/counsellors'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Verified professionals', bg: 'bg-sage/10', color: 'text-sage-dark' },
  { icon: Calendar, label: 'Flexible sessions', bg: 'bg-terracotta/10', color: 'text-terracotta' },
  { icon: BadgeCheck, label: 'Private & secure', bg: 'bg-plum/10', color: 'text-plum' },
]

export default function CounsellorsPage() {
  return (
    <>
      <AppNav title="Counsellors" />
      <div className="page-enter space-y-6 pb-8">
        <div>
          <h1 className="font-heading text-[32px] font-bold text-plum">Find someone who gets it.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-charcoal">
            Verified counsellors are here when peer support isn’t quite enough. Take your time finding the right fit.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3 rounded-2xl border border-warm-gray-lighter bg-white px-4 py-3">
              <badge.icon className={badge.color} size={20} />
              <span className="text-sm font-medium text-charcoal">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COUNSELLORS.map((counsellor) => (
            <div key={counsellor.slug} className="rounded-[20px] border border-warm-gray-lighter bg-white p-6 transition-shadow hover:shadow-medium">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-cream ${counsellor.color}`}>
                {counsellor.initials}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <h2 className="font-heading text-xl font-bold text-plum">{counsellor.name}</h2>
                <BadgeCheck className="text-sage" size={17} />
              </div>
              <p className="mt-1 text-sm text-terracotta">{counsellor.specialty}</p>
              <p className="mt-2 text-[13px] text-warm-gray">{counsellor.experience} experience · Online</p>
              <Link
                href={`/app/counsellor/${counsellor.slug}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-full border border-plum py-2.5 text-[13px] font-bold text-plum transition-colors hover:bg-plum/5"
              >
                View profile <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
