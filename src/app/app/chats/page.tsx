import type { Metadata } from 'next'
import ChatsClient from './ChatsClient'

export const metadata: Metadata = {
  title: 'Chats',
  description:
    'Continue your private conversations with peers and counsellors.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the ChatsClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <ChatsClient />
}
