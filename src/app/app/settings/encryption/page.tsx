import EncryptionClient from './EncryptionClient'

export const metadata = {
  title: 'End-to-End Encryption · MindCircle',
  description: 'Manage end-to-end encryption and your recovery phrase.',
}

export default function EncryptionSettingsPage() {
  return <EncryptionClient />
}
