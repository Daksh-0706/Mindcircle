/**
 * Central SEO + site config.
 *
 * Single source of truth for the canonical origin, default titles, contact
 * details and the public route list used by robots.ts and sitemap.ts, so a new
 * public page only has to be registered here.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://mindcircle.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'MindCircle'

export const DEFAULT_TITLE = 'MindCircle — Your Safe Space'

export const DEFAULT_DESCRIPTION =
  'A privacy-first mental health platform for students and young professionals. Journal privately, track your mood, join anonymous peer support, and reach verified counsellors — in a warm, judgement-free space.'

export const OG_IMAGE_PATH = '/og-image.png'

/**
 * Real contact details.
 *
 * These are placeholders pending the registered business address and a
 * monitored support inbox. Update them here and every page picks the change
 * up — the support page, the Terms, the Privacy Policy and the landing footer
 * all read from this object rather than hard-coding their own.
 */
export const CONTACT = {
  email: 'hello@mindcircle.app',
  supportEmail: 'support@mindcircle.app',
  crisisEmail: 'crisis@mindcircle.app',
  phone: '+91 00000 00000',
  address: 'Bengaluru, Karnataka, India',
  hours: 'Monday–Saturday, 9:00 AM – 7:00 PM IST',
} as const

/**
 * Public, indexable routes.
 *
 * `/app` pages that need a signed-in session are deliberately absent — they
 * are disallowed in robots.ts, not merely omitted here. The four help/crisis
 * pages are the exception: they are public, useful to search engines, and are
 * explicitly re-allowed in robots.ts.
 */
export const PUBLIC_ROUTES: {
  path: string
  title: string
  description: string
  priority: number
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
}[] = [
  {
    path: '/',
    title: 'MindCircle — Your Safe Space',
    description: DEFAULT_DESCRIPTION,
    priority: 1,
    changeFrequency: 'weekly',
  },
  {
    path: '/app/crisis',
    title: 'Crisis Support — MindCircle',
    description:
      'If you are in immediate danger or thinking about harming yourself, these verified helplines are available right now. You are not alone.',
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/app/help/faq',
    title: 'Frequently Asked Questions — MindCircle',
    description:
      'Answers about privacy, journal security, counsellor verification, data handling and how peer support works on MindCircle.',
    priority: 0.6,
    changeFrequency: 'monthly',
  },
  {
    path: '/app/help/about',
    title: 'About MindCircle',
    description:
      'Why we built MindCircle: a privacy-first, judgement-free mental health space designed for students and young professionals.',
    priority: 0.6,
    changeFrequency: 'monthly',
  },
  {
    path: '/app/help/support',
    title: 'Contact Support — MindCircle',
    description:
      'Send us a message or reach us by email. Our support team responds Monday to Saturday, 9:00 AM – 7:00 PM IST.',
    priority: 0.5,
    changeFrequency: 'monthly',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions — MindCircle',
    description:
      'The terms that govern your use of MindCircle: your account, your content, acceptable use, and our limits as a support platform rather than a medical service.',
    priority: 0.4,
    changeFrequency: 'yearly',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy — MindCircle',
    description:
      'What we collect, why we collect it, how long we keep it and the controls you have. MindCircle is privacy-first by design.',
    priority: 0.4,
    changeFrequency: 'yearly',
  },
]
