import type { Metadata } from 'next'
import CounsellorDetailClient from './CounsellorDetailClient'

export const metadata: Metadata = {
  title: 'Counsellor profile',
  description:
    'Verified counsellor credentials, specialisations, availability and session booking.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the CounsellorDetailClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript. The route id is threaded through
 * from the server rather than read on the client.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CounsellorDetailClient id={id} />
}
