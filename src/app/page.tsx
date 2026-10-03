import type { Metadata } from 'next'
import LandingClient from './(auth)/landing/LandingClient'
import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_URL } from '@/lib/seo'

/**
 * The site root is the landing page — `mindcircle.vercel.app` and nothing
 * else. `/landing` still exists but only as a redirect back here, so old
 * links and bookmarks keep working without competing with `/` in search.
 *
 * This page opts out of the root layout's `%s | MindCircle` title template,
 * otherwise the title renders as "MindCircle — Your Safe Space | MindCircle".
 */
export const metadata: Metadata = {
  title: {
    absolute: 'MindCircle — Your Safe Space',
  },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MindCircle — Your Safe Space',
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: 'MindCircle — Your Safe Space' }],
  },
  robots: { index: true, follow: true },
}

/**
 * All of the UI lives in the colocated client component under (auth)/landing;
 * this server shell exists so the route can export real `metadata`, which is
 * rendered into the HTML for crawlers that never execute JavaScript.
 */
export default function Home() {
  return <LandingClient />
}
