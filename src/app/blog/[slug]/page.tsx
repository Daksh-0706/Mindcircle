import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GUIDES, getGuide } from '@/lib/guides'
import { SITE_URL, OG_IMAGE_PATH } from '@/lib/seo'
import StructuredData from '@/components/seo/StructuredData'
import { Logo } from '@/components/common/Logo'

/**
 * One public guide article.
 *
 * Every guide is rendered at build time (see `guidePaths`), so each one is a
 * real HTML file a crawler can read — not a client-side shell. That is the whole
 * point: a page that only renders after JavaScript is much harder for a search
 * engine to index.
 */
export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/blog/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/blog/${guide.slug}`,
      type: 'article',
      images: [
        { url: OG_IMAGE_PATH, width: 1200, height: 630, alt: guide.title },
      ],
    },
    robots: { index: true, follow: true },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  return (
    <div className="min-h-screen bg-cream">
      {/* Article structured data, so the page can be surfaced with its author
          and date rather than as a bare link. */}
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          url: `${SITE_URL}/blog/${guide.slug}`,
          image: `${SITE_URL}${OG_IMAGE_PATH}`,
          author: { '@type': 'Organization', name: 'MindCircle' },
          publisher: { '@id': `${SITE_URL}/#organization` },
          inLanguage: 'en-IN',
          isAccessibleForFree: true,
        }}
      />

      <header className="sticky top-0 z-10 border-b border-warm-gray-lighter/60 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="MindCircle home"
            className="flex items-center gap-2"
          >
            <Logo height={26} withWordmark />
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-plum hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All guides
        </Link>

        <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-plum-dark sm:text-4xl">
          {guide.title}
        </h1>

        <p className="mt-3 text-sm text-warm-gray">{guide.readingTime}</p>

        <p className="mt-5 rounded-2xl border border-warm-gray-lighter/70 bg-white/70 p-5 text-[15px] leading-7 text-charcoal/85">
          {guide.summary}
        </p>

        <div className="mt-8 space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-xl font-semibold text-charcoal sm:text-2xl">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-4">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[15px] leading-7 text-charcoal/80"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-12 rounded-2xl border border-plum/15 bg-plum/5 p-5">
          <h2 className="font-heading text-base font-semibold text-plum-dark">
            Where to go from here
          </h2>
          <p className="mt-2 text-sm leading-6 text-charcoal/80">
            MindCircle has a journal that stays locked to your account, mood
            check-ins that turn into gentle patterns over time, and peer spaces
            where nobody knows your real name. If you need to talk to someone
            right now rather than read, the Crisis Support page lists helplines
            that answer 24/7.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-plum px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-plum-dark"
            >
              Create a private account
            </Link>
            <Link
              href="/app/crisis"
              className="inline-flex items-center rounded-xl border border-plum/25 px-4 py-2 text-sm font-bold text-plum transition-colors hover:bg-plum/5"
            >
              Crisis Support
            </Link>
          </div>
        </aside>
      </article>
    </div>
  )
}