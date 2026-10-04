import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { GUIDES } from '@/lib/guides'
import { SITE_URL, OG_IMAGE_PATH } from '@/lib/seo'
import { Logo } from '@/components/common/Logo'

export const metadata: Metadata = {
  title: 'Guides',
  description:
    'Practical, judgement-free guides on exam stress, supporting a friend who is anxious, and looking after your mental health as a student.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Guides | MindCircle',
    description:
      'Practical, judgement-free guides on exam stress, supporting a friend who is anxious, and looking after your mental health as a student.',
    url: `${SITE_URL}/blog`,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: 'MindCircle guides',
      },
    ],
  },
  robots: { index: true, follow: true },
}

/**
 * Index of the public guides.
 *
 * This page is how the articles get discovered: the landing page links here,
 * here each article links to the others' siblings, and every URL is in the
 * sitemap. An article nobody links to is much slower to rank, so internal
 * linking is part of the setup rather than an afterthought.
 */
export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 border-b border-warm-gray-lighter/60 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="MindCircle home" className="flex items-center gap-2">
            <Logo height={26} withWordmark />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-plum hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>

        <h1 className="mt-4 font-heading text-3xl font-bold text-plum-dark sm:text-4xl">
          Guides
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-charcoal/75">
          Short, practical writing on the things students actually search for at
          two in the morning. MindCircle is a support tool and not medical care,
          so nothing here replaces a professional — it just helps you get your
          bearings first.
        </p>

        <div className="mt-8 space-y-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/blog/${guide.slug}`}
              className="group block rounded-2xl border border-warm-gray-lighter/70 bg-white/70 p-5 transition-colors hover:border-plum/25 hover:bg-white"
            >
              <h2 className="font-heading text-lg font-semibold text-charcoal group-hover:text-plum">
                {guide.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-charcoal/70">
                {guide.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-plum">
                Read the guide
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 rounded-2xl border border-plum/15 bg-plum/5 p-5 text-sm leading-6 text-charcoal/80">
          If you are in crisis right now, reading is not the priority — the{' '}
          <Link href="/app/crisis" className="font-semibold text-plum underline">
            Crisis Support page
          </Link>{' '}
          lists 24/7 helplines, and 112 is the emergency number in India.
        </p>
      </main>
    </div>
  )
}