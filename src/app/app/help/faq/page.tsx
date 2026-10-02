import type { Metadata } from 'next'
import FaqClient from './FaqClient'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers about privacy, journal security, counsellor verification, data handling and how peer support works on MindCircle.',

  alternates: { canonical: '/app/help/faq' },
  robots: { index: true, follow: true },
}

/**
 * Server shell for the FaqClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <FaqClient />
}
