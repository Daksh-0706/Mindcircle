import type { Metadata } from 'next'
import ChatThreadClient from './ChatThreadClient'

export const metadata: Metadata = {
  title: 'Conversation',
  description: 'Your private conversation. Messages are visible only to you and the person you are talking to.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the ChatThreadClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <ChatThreadClient />
}
