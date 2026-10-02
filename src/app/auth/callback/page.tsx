import type { Metadata } from 'next'
import AuthCallbackClient from './AuthCallbackClient'

export const metadata: Metadata = {
  title: 'Signing you in',
  description:
    'Completing sign-in.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the AuthCallbackClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <AuthCallbackClient />
}
