import type { Metadata } from 'next'
import EntryClient from './EntryClient'

export const dynamic = 'force-dynamic'

/**
 * Server shell for a single journal entry.
 *
 * The entry itself is loaded on the client, where the signed-in Supabase
 * session already lives — a server-side fetch to /api/journal/[id] would carry
 * no cookies and always come back 401 (and a relative URL cannot be fetched
 * from a Server Component at all).
 */
export const metadata: Metadata = {
  title: 'Journal entry',
  robots: { index: false, follow: false },
}

export default async function EntryViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EntryClient id={id} />
}
