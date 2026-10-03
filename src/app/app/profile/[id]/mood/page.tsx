import type { Metadata } from 'next'
import MoodInsightsClient from './MoodInsightsClient'

export const metadata: Metadata = {
  title: 'Mood insights',
  description: 'Mood trends shared by someone you are connected with on MindCircle.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the Mood insights page.
 *
 * Only reachable for a connected member who has opted in to sharing their mood
 * trends — the API returns 404 otherwise, and the screen renders an empty
 * state rather than an error.
 */
export default function Page() {
  return <MoodInsightsClient />
}