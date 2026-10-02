import type { Metadata } from 'next'
import ChangePasswordClient from './ChangePasswordClient'

export const metadata: Metadata = {
  title: 'Change password',
  description: 'Choose a new password for your MindCircle account.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the ChangePasswordClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <ChangePasswordClient />
}
