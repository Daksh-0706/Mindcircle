import type { Metadata } from 'next'
import ActivityDetailClient from './ActivityDetailClient'

export const metadata: Metadata = {
  title: 'Guided activity',
  description: 'A guided breathing, grounding or mindfulness practice you can do in a few minutes.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the ActivityDetailClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <ActivityDetailClient />
}
