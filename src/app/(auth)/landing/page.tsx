import type { Metadata } from 'next'
import LandingClient from './LandingClient'
import { DEFAULT_DESCRIPTION, OG_IMAGE_PATH, SITE_URL } from '@/lib/seo'

/**
 * The landing page is the site's canonical URL, so it opts out of the root
 * layout's `%s | MindCircle` title template — otherwise the title renders as
 * "MindCircle — Your Safe Space | MindCircle".
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
 * Server shell for the LandingClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <LandingClient />
}
