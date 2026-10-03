import type { Metadata } from 'next'
import NewChatClient from './NewChatClient'

export const metadata: Metadata = {
  title: 'New chat',
  description: 'Start a private one-on-one with someone you have connected with.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the NewChatClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <NewChatClient />
}
