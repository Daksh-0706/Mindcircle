import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindCircle — Your Safe Space',
  description: 'A privacy-first mental health platform for students and young professionals. Journal, connect, and heal in a safe space.',
}

export const viewport: Viewport = {
  themeColor: '#4A2C5E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded browser-side via <link> (Fraunces + DM Sans), which is
          what the `--font-heading` / `--font-body` families in globals.css @theme
          reference. This avoids a build-time fetch to Google Fonts, keeping the
          production build portable across network-restricted CI/deploy environments.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-charcoal font-body antialiased">
        <div className="grain-overlay min-h-screen">{children}</div>
      </body>
    </html>
  )
}
