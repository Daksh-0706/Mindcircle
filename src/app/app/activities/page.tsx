import type { Metadata } from 'next'
import ActivitiesClient from './ActivitiesClient'

export const metadata: Metadata = {
  title: 'Guided Activities',
  description:
    'Breathing, grounding and mindfulness exercises you can do in minutes.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the ActivitiesClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <ActivitiesClient />
}
