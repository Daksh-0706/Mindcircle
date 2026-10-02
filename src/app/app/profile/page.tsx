import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'My Profile',
  description:
    'Your MindCircle profile.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the ProfileClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <ProfileClient />
}
