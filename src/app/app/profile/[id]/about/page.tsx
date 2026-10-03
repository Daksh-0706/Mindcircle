import type { Metadata } from 'next'
import ProfileAboutClient from './ProfileAboutClient'

export const metadata: Metadata = {
  title: 'About',
  description: 'More about someone you have connected with on MindCircle.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for the About page.
 *
 * Split out from the profile screen so the design's "About ›" row has somewhere
 * real to go, and so the two screens can be edited independently.
 */
export default function Page() {
  return <ProfileAboutClient />
}