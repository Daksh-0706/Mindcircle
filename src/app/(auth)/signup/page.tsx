import type { Metadata } from 'next'
import SignupClient from './SignupClient'

export const metadata: Metadata = {
  title: 'Create your free MindCircle account',
  description:
    'Start your journey in under a minute. Private journaling, mood tracking, anonymous support and guided activities — free, and always yours.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the SignupClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <SignupClient />
}
