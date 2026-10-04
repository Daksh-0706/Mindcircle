'use client'
import { AppNav } from '../../../../components/layout/AppNavContext'
import Card from '../../../../components/ui/Card'
import StructuredData from '../../../../components/seo/StructuredData'
import { faqs } from '../../../../lib/faq'
import { faqPageLd } from '../../../../lib/seo-structured-data'

// Content now lives in lib/faq.ts so the visible list and the FAQPage
// structured data are generated from one source and cannot drift apart.

export default function FaqPage() {
  return (
    <>
      <AppNav title="Help & FAQ" showBack />
      {/* Q&A markup for the same questions rendered below. */}
      <StructuredData data={faqPageLd()} />
      <div className="page-enter mx-auto max-w-3xl space-y-6 px-4 sm:px-6 pb-8">
        <div>
          <p className="text-sm text-warm-gray">Answers for common questions</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold">How can we help?</h1>
        </div>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-warm-gray-lighter bg-white/75 px-5 py-4 font-medium">
                {q}
                <span className="text-xl text-plum transition-transform group-open:rotate-45">+</span>
              </summary>
              <Card padding="md" className="mt-1 rounded-t-none bg-cream-dark text-sm leading-6 text-charcoal/90">
                {a}
              </Card>
            </details>
          ))}
        </div>
      </div>
    </>
  )
}
