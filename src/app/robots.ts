import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // Crisis and support pages are the highest-value pages on the site for
        // someone in distress, so they must stay crawlable even though they sit
        // under /app/. Listed first because crawlers apply the most specific
        // matching rule.
        allow: ['/app/crisis', '/app/help/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/app/', // authenticated app shell — no public content
          '/api/', // never index API responses
          '/auth/', // OAuth and email-confirmation callbacks
          '/onboarding',
          '/verify-otp',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
