import type { Metadata } from 'next'
import OnboardingClient from './OnboardingClient'

export const metadata: Metadata = {
  title: 'Welcome to MindCircle',
  description:
    'A few quick questions so we can shape MindCircle around you.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the OnboardingClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <OnboardingClient />
}
