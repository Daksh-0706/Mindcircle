import type { Metadata } from 'next'
import JournalClient from './JournalClient'

export const metadata: Metadata = {
  title: 'My Journal',
  description:
    'Write freely. Your entries stay private to you.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the JournalClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <JournalClient />
}
