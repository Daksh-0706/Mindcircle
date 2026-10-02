import type { Metadata } from 'next'
import ConnectClient from './ConnectClient'

export const metadata: Metadata = {
  title: 'Connect',
  description:
    'Find anonymous peer support and verified counsellors in a safe community space.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the ConnectClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <ConnectClient />
}
