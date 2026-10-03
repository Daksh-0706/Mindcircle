import type { Metadata, Viewport } from 'next'
import './globals.css'
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  OG_IMAGE_PATH,
} from '@/lib/seo'
import { CookieNotice } from '@/components/common/CookieNotice'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | MindCircle',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'mental health',
    'student mental health',
    'anonymous journal',
    'mood tracking',
    'peer support',
    'online counselling',
    'anxiety relief',
    'mindfulness exercises',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: 'en_IN',
    images: [
      { url: OG_IMAGE_PATH, width: 1200, height: 630, alt: 'MindCircle — Your Safe Space' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'health',
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [
      // src/app/favicon.ico and src/app/apple-icon.png are picked up
      // automatically by the App Router; these fill in the PWA sizes.
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF8F0' },
    { media: '(prefers-color-scheme: dark)', color: '#3A1F4A' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/*
          Fonts are loaded browser-side via <link>, matching the --font-heading /
          --font-body families in globals.css. Avoids a build-time fetch to
          Google Fonts so the build stays portable across CI environments.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400..700&family=Playfair+Display:wght@600;700&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-charcoal font-body antialiased">
        <div className="grain-overlay min-h-screen">
          {children}
          <CookieNotice />
        </div>
      </body>
    </html>
  )
}
