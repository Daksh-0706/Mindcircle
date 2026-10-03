import type { Metadata } from 'next'
import DiscoverClient from './DiscoverClient'

export const metadata: Metadata = {
  title: 'Discover People',
  description:
    'Meet and connect with students who share similar experiences, courses and vibes.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the DiscoverClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <DiscoverClient />
}
