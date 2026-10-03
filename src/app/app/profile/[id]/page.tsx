import type { Metadata } from 'next'
import ProfileClient from './ProfileClient'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'The profile of someone you have connected with on MindCircle.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the ProfileClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`.
 */
export default function Page() {
  return <ProfileClient />
}