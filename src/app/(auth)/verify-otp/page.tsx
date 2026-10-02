import type { Metadata } from 'next'
import VerifyOtpClient from './VerifyOtpClient'

export const metadata: Metadata = {
  title: 'Verify your email',
  description:
    'Enter the code we emailed you to finish setting up your MindCircle account.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the VerifyOtpClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <VerifyOtpClient />
}
