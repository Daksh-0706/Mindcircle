import type { MetadataRoute } from 'next'
import { SITE_NAME, DEFAULT_DESCRIPTION } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Your Safe Space`,
    short_name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    start_url: '/app',
    display: 'standalone',
    background_color: '#FFF8F0',
    theme_color: '#4A2C5E',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'New journal entry', short_name: 'Journal', url: '/app/journal' },
      { name: 'Log your mood', short_name: 'Mood', url: '/app/insights' },
      { name: 'Crisis support', short_name: 'Crisis', url: '/app/crisis' },
    ],
    categories: ['health', 'lifestyle', 'medical'],
  }
}
