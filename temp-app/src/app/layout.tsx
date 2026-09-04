import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MindCircle — Your Safe Space',
  description: 'A privacy-first mental health platform for students and young professionals. Journal, connect, and heal in a safe space.',
  themeColor: '#4A2C5E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-cream text-charcoal font-body antialiased">
        <div className="grain-overlay min-h-screen">{children}</div>
      </body>
    </html>
  )
}
