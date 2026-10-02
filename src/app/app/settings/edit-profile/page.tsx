import type { Metadata } from 'next'
import EditProfileClient from './EditProfileClient'

export const metadata: Metadata = {
  title: 'Edit profile',
  description: 'Update your display name, avatar and the details other members can see.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the EditProfileClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <EditProfileClient />
}
