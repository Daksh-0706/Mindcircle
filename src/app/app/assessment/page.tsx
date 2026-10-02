import type { Metadata } from 'next'
import AssessmentClient from './AssessmentClient'

export const metadata: Metadata = {
  title: 'Mood Assessment',
  description:
    'A short check-in to help us understand how you have been feeling.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the AssessmentClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <AssessmentClient />
}
