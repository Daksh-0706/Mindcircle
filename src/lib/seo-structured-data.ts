import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, OG_IMAGE_PATH, CONTACT } from './seo'
import { faqs } from './faq'

/**
 * JSON-LD structured data.
 *
 * These blocks are what let Google show a rating/logo under the site name
 * (Organization + WebSite) and, more usefully, expandable Q&A results on the
 * FAQ page instead of a plain link. Every value here is either from `seo.ts`
 * or from content that is visibly on the page — Google penalises markup that
 * claims things a visitor can't verify.
 *
 * `audience: 'general'` is intentional: the FAQ and support pages are readable
 * by anyone, including search crawlers, and marking them as content for a
 * medical audience would let Google serve them as clinical guidance.
 */

/** Identity of the site itself, shown as the publisher of every page. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}${OG_IMAGE_PATH}`,
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: CONTACT.address,
    },
    sameAs: [],
  }
}

/** Ties the site to its own search action, the standard sitelinks search box. */
export function webSiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-IN',
  }
}

/**
 * The app itself, described as a web application with its operating systems
 * and category. Kept separate from Organization so the two schemas stay
 * independently correct.
 */
export function webApplicationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#app`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    featureList: [
      'Private journalling',
      'Mood tracking and insights',
      'Anonymous peer support circles',
      'Guided wellbeing activities',
      '24/7 crisis helplines',
    ],
  }
}

/**
 * Q&A markup for the FAQ page, built from the same list the page renders, so
 * the rich result can never claim an answer the visitor cannot read.
 */
export function faqPageLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/app/help/faq#faq`,
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}