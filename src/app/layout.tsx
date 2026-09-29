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
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-cream text-charcoal font-body antialiased">
        <div className="grain-overlay min-h-screen">{children}</div>
      </body>
    </html>
  )
}
