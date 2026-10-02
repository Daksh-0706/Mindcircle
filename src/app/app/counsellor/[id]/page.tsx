'use client'
import { use } from 'react'
import { AppNav } from '../../../../components/layout/AppNavContext'
import EmptyState from '../../../../components/ui/EmptyState'
import { BadgeCheck, Calendar, Clock, Info, MessageCircle } from 'lucide-react'
import { counsellorBySlug } from '../../../../lib/counsellors'

export default function CounsellorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const counsellor = counsellorBySlug(id)

  if (!counsellor) {
    return (
      <>
        <AppNav title="Counsellor profile" showBack />
        <div className="page-enter mx-auto max-w-3xl pb-8">
          <EmptyState
            icon={<BadgeCheck size={26} />}
            title="Counsellor not found"
            description="This profile doesn't exist. Browse the directory to find verified counsellors."
            action={{ label: 'All counsellors', onClick: () => { window.location.href = '/app/counsellors' } }}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <AppNav title="Counsellor profile" showBack />
      <div className="page-enter mx-auto max-w-3xl space-y-6 pb-8">
        {/* Preview notice — this counsellor isn't verified or contactable yet */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-5 py-4">
          <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-800">Preview profile — not yet verified</p>
            <p className="mt-0.5 text-[13px] leading-5 text-amber-700/90">
              Booking and messaging will open once this counsellor completes verification. This page shows how their profile will appear.
            </p>
          </div>
        </div>

        <div className="rounded-[20px] border border-warm-gray-lighter bg-white p-7">
          <div className="flex flex-wrap items-center gap-5">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold text-cream ${counsellor.color}`}>
              {counsellor.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-3xl font-bold text-plum">{counsellor.name}</h1>
                <BadgeCheck className="text-warm-gray-light" size={20} />
              </div>
              <p className="mt-1 text-sm text-terracotta">{counsellor.specialty}</p>
              <p className="mt-2 text-sm text-warm-gray">{counsellor.experience} experience · Online sessions</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <Clock size={11} /> Verification in progress
              </span>
            </div>
          </div>
          <p className="mt-6 text-sm leading-7 text-charcoal/90">{counsellor.bio}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              disabled
              title="Booking opens after verification"
              className="cursor-not-allowed rounded-full bg-warm-gray-lighter/70 py-3 text-sm font-bold text-warm-gray"
            >
              <span className="inline-flex items-center gap-2"><Calendar size={16} /> Booking opens soon</span>
            </button>
            <button
              disabled
              title="Messaging opens after verification"
              className="cursor-not-allowed rounded-full border border-warm-gray-lighter py-3 text-sm font-bold text-warm-gray"
            >
              <span className="inline-flex items-center gap-2"><MessageCircle size={16} /> Messaging opens soon</span>
            </button>
          </div>
        </div>

        <div className="rounded-[20px] bg-cream-dark p-6">
          <h2 className="font-heading text-xl font-bold text-plum">About your first session</h2>
          <p className="mt-2 text-sm leading-6 text-charcoal">
            A first conversation is simply a chance to meet, share what brings you here, and see if we feel like a good fit. You stay in control throughout.
          </p>
        </div>
      </div>
    </>
  )
}
