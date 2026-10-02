import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

/**
 * `/` is a thin redirect to `/landing`, which carries the real metadata and
 * content. It is kept out of the index so the two URLs never compete, and so
 * the canonical landing page stays the single result for the brand name.
 */
export const metadata: Metadata = {
  title: 'MindCircle — Your Safe Space',
  robots: { index: false, follow: true },
}

export default function Home() {
  redirect('/landing')
}
