import type { Metadata } from 'next'
import SettingsClient from './SettingsClient'

export const metadata: Metadata = {
  title: 'Settings',
  description:
    'Manage your account, privacy and preferences.',

  robots: { index: false, follow: false },
}

/**
 * Server shell for the SettingsClient.
 *
 * All of the UI lives in the colocated client component; this file exists so
 * the route can export real `metadata`, which is rendered into the HTML for
 * crawlers that never execute JavaScript.
 */
export default function Page() {
  return <SettingsClient />
}
