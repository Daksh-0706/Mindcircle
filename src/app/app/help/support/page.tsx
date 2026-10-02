import type { Metadata } from 'next'
import SupportClient from './SupportClient'

export const metadata: Metadata = {
  title: 'Contact Support',
  description:
    'Send us a message or reach us by email. Our support team responds Monday to Saturday, 9:00 AM - 7:00 PM IST.',
  alternates: { canonical: '/app/help/support' },
  robots: { index: true, follow: true },
}

/**
 * Server shell for the SupportClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <SupportClient />
}
