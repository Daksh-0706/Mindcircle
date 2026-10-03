import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { CONTACT, SITE_URL, OG_IMAGE_PATH } from '@/lib/seo'
import { Logo } from '@/components/common/Logo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What we collect, why we collect it, how long we keep it and the controls you have. MindCircle is privacy-first by design.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: 'Privacy Policy | MindCircle',
    description:
      'What we collect, why we collect it, how long we keep it and the controls you have.',
    url: `${SITE_URL}/privacy`,
    type: 'article',
    images: [
      { url: OG_IMAGE_PATH, width: 1200, height: 630, alt: 'Privacy Policy | MindCircle' },
    ],
  },
}

const SECTIONS = [
  { id: "summary", title: "The short version" },
  { id: "what-we-collect", title: "What we collect" },
  { id: "cookies", title: "Cookies we set" },
  { id: "how-we-use", title: "Why we use it" },
  { id: "sharing", title: "Who we share it with" },
  { id: "retention", title: "How long we keep it" },
  { id: "your-rights", title: "Your rights and controls" },
  { id: "security", title: "How we protect it" },
  { id: "children", title: "Children's privacy" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
] as const

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 glass-card border-b border-plum/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/landing"
            className="flex items-center gap-2 text-charcoal hover:text-plum transition-colors"
          >
            <Logo height={30} withWordmark />
          </Link>
          <Link
            href="/landing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/70 hover:text-plum transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-plum">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-warm-gray">
          Last updated: 2 October 2026
        </p>

        <div className="mt-8 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12 lg:items-start">
          <article className="min-w-0 space-y-10 text-[15px] leading-7 text-charcoal/80">
            <section id="summary">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[0].title}
              </h2>
              <p className="mt-3">
                We built MindCircle to keep your inner life private. Your
                journal is not read by us or shown to other members. We do not
                sell your data, we do not run advertising or tracking networks,
                and we do not use third-party analytics. We collect the minimum
                needed to run the product, and you can delete everything.
              </p>
            </section>

            <section id="what-we-collect">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[1].title}
              </h2>
              <ul className="mt-3 space-y-3">
                <li>
                  <strong className="text-charcoal">Account data.</strong> Your
                  email address, an optional display name, an avatar emoji, and
                  an anonymous ID. If you sign in with Google we receive your
                  name, email and profile picture from Google.
                </li>
                <li>
                  <strong className="text-charcoal">What you write.</strong>{" "}
                  Journal entries, their titles, attached photos, and the mood
                  you tag them with.
                </li>
                <li>
                  <strong className="text-charcoal">Wellbeing signals.</strong>{" "}
                  Mood check-ins and your activity history, used to draw the
                  private Insights charts.
                </li>
                <li>
                  <strong className="text-charcoal">Community content.</strong>{" "}
                  Posts, comments and chat messages you choose to send.
                </li>
                <li>
                  <strong className="text-charcoal">Technical data.</strong> IP
                  address, user agent, and security logs kept for abuse
                  prevention.
                </li>
              </ul>
              <p className="mt-3">
                We ask for your real name nowhere. If you choose to share
                identifying details in a post, that is a decision you make, and
                moderators may remove it.
              </p>
            </section>

            <section id="cookies">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[2].title}
              </h2>
              <p className="mt-3">
                MindCircle uses a deliberately small number of cookies. There
                are{" "}
                <strong className="text-charcoal">
                  no advertising, analytics or cross-site tracking cookies
                </strong>{" "}
                on this site.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-[520px]">
                  <thead>
                    <tr className="text-left border-b border-plum/15">
                      <th
                        scope="col"
                        className="py-2.5 pr-4 font-heading font-semibold text-charcoal"
                      >
                        Cookie
                      </th>
                      <th
                        scope="col"
                        className="py-2.5 pr-4 font-heading font-semibold text-charcoal"
                      >
                        Purpose
                      </th>
                      <th
                        scope="col"
                        className="py-2.5 font-heading font-semibold text-charcoal"
                      >
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-plum/8">
                      <td className="py-3 pr-4 font-mono text-[13px] text-charcoal">
                        sb-access-token
                      </td>
                      <td className="py-3 pr-4">
                        Keeps you signed in. Set only after you log in.
                      </td>
                      <td className="py-3">Strictly necessary</td>
                    </tr>
                    <tr className="border-b border-plum/8">
                      <td className="py-3 pr-4 font-mono text-[13px] text-charcoal">
                        sb-refresh-token
                      </td>
                      <td className="py-3 pr-4">
                        Renews that session so you are not logged out.
                      </td>
                      <td className="py-3">Strictly necessary</td>
                    </tr>
                    <tr className="border-b border-plum/8">
                      <td className="py-3 pr-4 font-mono text-[13px] text-charcoal">
                        cookie-consent
                      </td>
                      <td className="py-3 pr-4">
                        Remembers your choice on the cookie notice. Set when you
                        dismiss it.
                      </td>
                      <td className="py-3">Strictly necessary</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="how-we-use">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[3].title}
              </h2>
              <p className="mt-3">
                To provide the features you asked for (journal, insights,
                community, sessions); to keep the service secure and prevent
                abuse; to answer support requests; and to meet our legal
                obligations. That is the complete list — we do not use your data
                for advertising, profiling or AI model training.
              </p>
            </section>

            <section id="sharing">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[4].title}
              </h2>
              <p className="mt-3">We share data only with:</p>
              <ul className="mt-3 list-disc pl-6 space-y-2 marker:text-plum/50">
                <li>
                  <strong className="text-charcoal">
                    Infrastructure providers
                  </strong>{" "}
                  that host our database and authentication on our behalf, under
                  data-processing terms.
                </li>
                <li>
                  <strong className="text-charcoal">
                    An email delivery provider
                  </strong>{" "}
                  that sends only the transactional messages needed to verify
                  and secure your account.
                </li>
                <li>
                  <strong className="text-charcoal">
                    Law enforcement or regulators
                  </strong>
                  , only where we are legally compelled to respond.
                </li>
                <li>
                  <strong className="text-charcoal">
                    A professional adviser
                  </strong>{" "}
                  in a corporate transaction, if one ever happens.
                </li>
              </ul>
              <p className="mt-3">
                Counsellors see only the profile information you choose to share
                when you book, plus the messages you send them. They do not get
                your journal.
              </p>
            </section>

            <section id="retention">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[5].title}
              </h2>
              <p className="mt-3">
                Your content is kept while your account exists. When you delete
                an entry it goes immediately; when you close your account, we
                delete your data from live systems within 30 days and from
                encrypted backups within a further 30 days. Security logs are
                kept for 12 months.
              </p>
            </section>

            <section id="your-rights">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[6].title}
              </h2>
              <p className="mt-3">
                You can read, export, correct and delete your data from
                Settings. You can withdraw from community features at any time
                without losing your journal. You can also email us to access,
                correct or erase your data, or to object to processing — we
                respond within 30 days.
              </p>
            </section>

            <section id="security">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[7].title}
              </h2>
              <p className="mt-3">
                Traffic is encrypted in transit with TLS. Data is stored
                encrypted at rest. Access to production data is limited to what
                is needed to operate and secure the service, and access is
                logged. Journal media is restricted to the signed-in owner. No
                system is perfect, so please use a unique password and do not
                reuse one you use elsewhere.
              </p>
            </section>

            <section id="children">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[8].title}
              </h2>
              <p className="mt-3">
                MindCircle is not for users under 16. We do not knowingly
                collect data from children. If you believe a child has created
                an account, contact us and we will remove it.
              </p>
            </section>

            <section id="changes">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[9].title}
              </h2>
              <p className="mt-3">
                If we change what we collect, we will update this page and, for
                material changes, notify you in the App or by email. The date at
                the top always reflects the current version.
              </p>
            </section>

            <section id="contact">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[10].title}
              </h2>
              <p className="mt-3">
                For any privacy question or request, email{" "}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-plum underline underline-offset-2 break-all"
                >
                  {CONTACT.email}
                </a>{" "}
                or write to us at {CONTACT.address}. We answer within 2 working
                days.
              </p>
            </section>
          </article>

          <nav
            aria-label="Sections on this page"
            className="mt-12 lg:mt-0 lg:sticky lg:top-24 rounded-[var(--radius-xl)] glass-card p-4"
          >
            <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-warm-gray px-2">
              On this page
            </h2>
            <ol className="mt-3 grid sm:grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-0.5 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-lg px-2 py-1.5 text-charcoal/70 hover:text-plum hover:bg-plum/6 transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="mt-14 pt-8 border-t border-plum/10 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
          <Link
            href="/terms"
            className="text-plum font-medium hover:underline underline-offset-2"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/app/help/faq"
            className="text-charcoal/70 hover:text-plum transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/app/help/support"
            className="text-charcoal/70 hover:text-plum transition-colors"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
