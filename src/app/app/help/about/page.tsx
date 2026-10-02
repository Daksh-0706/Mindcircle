import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About MindCircle',
  description:
    'Why we built MindCircle: a privacy-first, judgement-free mental health space designed for students and young professionals.',

  alternates: { canonical: '/app/help/about' },
  robots: { index: true, follow: true },
}

/**
 * Server shell for the AboutClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <AboutClient />
}
