import type { Metadata } from 'next'
import GoogleCallbackClient from './GoogleCallbackClient'

export const metadata: Metadata = {
  title: 'Signing you in',
  description: 'Completing sign-in.',
  robots: { index: false, follow: false },
}

/**
 * Server shell for GoogleCallbackClient.
 *
 * The UI lives in the colocated client component; this file exists so the
 * route can export real `metadata`, matching the other auth routes.
 */
export default function Page() {
  return <GoogleCallbackClient />
}