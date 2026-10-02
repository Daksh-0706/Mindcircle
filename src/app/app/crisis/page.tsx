import type { Metadata } from 'next'
import CrisisClient from './CrisisClient'

export const metadata: Metadata = {
  title: 'Crisis Support',
  description:
    'If you are in immediate danger or thinking about harming yourself, these verified helplines are available right now. You are not alone.',

  alternates: { canonical: '/app/crisis' },
  robots: { index: true, follow: true },
}

/**
 * Server shell for the CrisisClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <CrisisClient />
}
