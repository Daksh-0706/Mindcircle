import type { Metadata } from 'next'
import CounsellorsClient from './CounsellorsClient'

export const metadata: Metadata = {
  title: 'Counsellors',
  description:
    'Browse verified counsellors and book a session when you need more than peer support.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the CounsellorsClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <CounsellorsClient />
}
