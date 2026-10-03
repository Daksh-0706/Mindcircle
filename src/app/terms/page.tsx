import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { CONTACT, SITE_URL, OG_IMAGE_PATH } from '@/lib/seo'
import { Logo } from '@/components/common/Logo'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The terms that govern your use of MindCircle: your account, your content, acceptable use, and our limits as a support platform rather than a medical service.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: 'Terms & Conditions | MindCircle',
    description:
      'The terms that govern your use of MindCircle — your account, your content, acceptable use, and our limits.',
    url: `${SITE_URL}/terms`,
    type: 'article',
    images: [
      { url: OG_IMAGE_PATH, width: 1200, height: 630, alt: 'Terms & Conditions | MindCircle' },
    ],
  },
}

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of these terms" },
  { id: "what-is-mindcircle", title: "2. What MindCircle is — and is not" },
  { id: "not-medical-advice", title: "3. Not medical advice" },
  { id: "crisis", title: "4. Crisis situations" },
  { id: "account", title: "5. Your account" },
  { id: "your-content", title: "6. Your content" },
  { id: "acceptable-use", title: "7. Acceptable use" },
  { id: "community", title: "8. Community and peer support" },
  { id: "counsellors", title: "9. Counsellors" },
  { id: "intellectual-property", title: "10. Intellectual property" },
  { id: "third-party", title: "11. Third-party services" },
  { id: "disclaimers", title: "12. Disclaimers" },
  { id: "liability", title: "13. Limitation of liability" },
  { id: "termination", title: "14. Suspension and termination" },
  { id: "changes", title: "15. Changes to these terms" },
  { id: "governing-law", title: "16. Governing law" },
  { id: "contact", title: "17. Contact us" },
] as const

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-card border-b border-plum/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-charcoal hover:text-plum transition-colors"
          >
            <Logo height={30} withWordmark />
          </Link>
          <Link
            href="/"
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
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm text-warm-gray">
          Last updated: 2 October 2026 · Applies to{" "}
          {SITE_URL.replace(/^https?:\/\//, "")} and the MindCircle mobile
          experience.
        </p>

        {/* The single most important thing, before the legal text. */}
        <div className="mt-8 rounded-[var(--radius-xl)] border border-terracotta/25 bg-terracotta/8 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="w-5 h-5 shrink-0 text-terracotta mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-heading font-semibold text-charcoal">
                MindCircle is a support tool, not a medical service
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-charcoal/75">
                Nothing here is diagnosis, therapy or emergency care. If you may
                hurt yourself or someone else, call an emergency number or go to
                the nearest emergency department now — do not wait for anything
                on this site.{" "}
                <Link
                  href="/app/crisis"
                  className="text-plum font-medium underline underline-offset-2"
                >
                  Crisis support
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Body + sticky section nav, side by side on desktop */}
        <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12 lg:items-start">
          <article className="min-w-0 space-y-10 text-[15px] leading-7 text-charcoal/80">
            <section id="acceptance">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[0].title}
              </h2>
              <p className="mt-3">
                By creating an account or using MindCircle (the
                &ldquo;App&rdquo;, available at {SITE_URL}), you agree to these
                Terms &amp; Conditions. If you do not agree, please do not use
                the App. If you use the App on behalf of someone else — for
                example a minor or a person in your care — you confirm you are
                authorised to do so, and you accept these terms on their behalf.
              </p>
            </section>

            <section id="what-is-mindcircle">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[1].title}
              </h2>
              <p className="mt-3">
                MindCircle is a peer-support and self-reflection platform. It
                lets you keep a private journal, log and visualise your moods,
                join community spaces, use guided wellbeing activities, and
                browse verified counsellors.
              </p>
              <p className="mt-3">
                It is designed to complement professional care. It does not
                replace it, and using MindCircle is not a substitute for a
                clinical assessment.
              </p>
            </section>

            <section id="not-medical-advice">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[2].title}
              </h2>
              <p className="mt-3">
                Content on the App — including journal prompts, mood labels,
                community posts, activity descriptions and automated insights —
                is informational and general in nature. It has not been reviewed
                by a clinician and is not a diagnosis, treatment plan, or
                medical opinion about your situation.
              </p>
              <p className="mt-3">
                If you are unsure about your mental or physical health, please
                consult a qualified professional. Never start or stop medication
                based on anything you read here.
              </p>
            </section>

            <section id="crisis">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[3].title}
              </h2>
              <p className="mt-3">
                We provide a Crisis Support page with helpline numbers for a
                number of countries. Those numbers are provided for convenience
                and may change. We do not monitor the App in real time, we do
                not read your messages, and we cannot dispatch emergency help on
                your behalf.
              </p>
              <p className="mt-3">
                If you are in immediate danger, contact your local emergency
                number (112 in India, 911 in the US and Canada, 999 in the UK)
                or go to the nearest emergency department.
              </p>
            </section>

            <section id="account">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[4].title}
              </h2>
              <p className="mt-3">
                You need an account to use the App. You are responsible for
                keeping your login credentials confidential and for all activity
                that happens under your account. You must be at least 16 years
                old to create an account.
              </p>
              <p className="mt-3">
                You can sign in with an email address and password, or with a
                third-party identity provider such as Google. If you use a
                third-party provider, that provider&apos;s own terms also apply
                to how your identity is managed.
              </p>
              <p className="mt-3">
                Tell us promptly at{" "}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-plum underline underline-offset-2"
                >
                  {CONTACT.email}
                </a>{" "}
                if you believe your account has been accessed by someone else.
              </p>
            </section>

            <section id="your-content">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[5].title}
              </h2>
              <p className="mt-3">
                Your journal entries, mood logs, photos and posts remain yours.
                We claim no ownership over them. You grant us only the limited
                licence needed to operate the App — to store your content,
                display it back to you, generate your private insights, and
                moderate it as described in these terms.
              </p>
              <p className="mt-3">
                You can export or permanently delete your content from Settings
                at any time. Deletion is immediate from your view, and we purge
                it from our backups on our routine backup rotation (within 30
                days).
              </p>
            </section>

            <section id="acceptable-use">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[6].title}
              </h2>
              <p className="mt-3">You agree not to:</p>
              <ul className="mt-3 list-disc pl-6 space-y-2 marker:text-plum/50">
                <li>
                  post content that is unlawful, hateful, threatening, sexually
                  explicit, or promotes self-harm, violence, or the harming of
                  others
                </li>
                <li>
                  harass, bully, stalk, dox, or impersonate any other person
                </li>
                <li>
                  attempt to access another user&apos;s account, content, or
                  private messages, or to probe, scan or overload the App or its
                  infrastructure
                </li>
                <li>
                  upload malware, or content you do not have the right to
                  upload, including material that infringes someone else&apos;s
                  privacy or intellectual property
                </li>
                <li>
                  scrape, reverse-engineer, or circumvent rate limits, access
                  controls, or the anonymity protections the App provides
                </li>
                <li>
                  use the App to send unsolicited bulk messages or advertising.
                </li>
              </ul>
            </section>

            <section id="community">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[7].title}
              </h2>
              <p className="mt-3">
                Community spaces and peer chats are shared. Other members are
                not verified clinicians, and nothing they write is advice. We
                provide a reporting tool and remove content that breaks these
                terms, but we cannot guarantee that every post is safe, accurate
                or supportive.
              </p>
              <p className="mt-3">
                If a post or message makes you feel unsafe, report it and leave
                the space. You are never obliged to reply to anyone.
              </p>
            </section>

            <section id="counsellors">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[8].title}
              </h2>
              <p className="mt-3">
                Counsellor profiles are submitted by the practitioners
                themselves and are reviewed by us for identity and credential
                documentation. That review is not an endorsement and does not
                guarantee clinical quality. Counselling relationships are formed
                directly between you and the counsellor, subject to their own
                terms, licence and professional obligations.
              </p>
            </section>

            <section id="intellectual-property">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[9].title}
              </h2>
              <p className="mt-3">
                The App, its name, logo, design, illustrations, copy, animations
                and underlying software are owned by MindCircle or its
                licensors, and are protected by copyright and trade mark law. We
                grant you a personal, non-exclusive, non-transferable, revocable
                licence to use the App as intended. You may not copy, modify, or
                create derivative works from it.
              </p>
            </section>

            <section id="third-party">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[10].title}
              </h2>
              <p className="mt-3">
                The App relies on third-party infrastructure, including
                authentication, database hosting and email delivery. Those
                providers process data under their own terms and privacy
                policies, which we do not control. Their names and logos are
                trademarks of their respective owners.
              </p>
            </section>

            <section id="disclaimers">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[11].title}
              </h2>
              <p className="mt-3">
                The App is provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis, without warranties of any kind, whether
                express or implied, including fitness for a particular purpose,
                merchantability, non-infringement, or uninterrupted
                availability.
              </p>
              <p className="mt-3">
                We work hard to keep your data safe and the service running, but
                we do not warrant that the App will always be error-free, that
                backups are lossless, or that any particular result will follow
                from your use of it.
              </p>
            </section>

            <section id="liability">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[12].title}
              </h2>
              <p className="mt-3">
                To the fullest extent permitted by law, MindCircle and its team
                are not liable for indirect or consequential loss, or for loss
                of data, profits, goodwill or opportunity, arising from your use
                of the App. Nothing in these terms excludes liability for death
                or personal injury caused by negligence, for fraud, or for
                anything else that cannot lawfully be excluded.
              </p>
            </section>

            <section id="termination">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[13].title}
              </h2>
              <p className="mt-3">
                You can close your account at any time from Settings. We may
                suspend or terminate an account that breaches these terms, is
                used to harass or endanger others, or requires us to do so by
                law. Where practical, we will tell you why and give you a chance
                to respond.
              </p>
            </section>

            <section id="changes">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[14].title}
              </h2>
              <p className="mt-3">
                We may update these terms. Material changes will be announced in
                the App or by email at least 14 days before they take effect.
                Continuing to use the App after that date means you accept the
                revised terms. This page always shows the current version and
                its date.
              </p>
            </section>

            <section id="governing-law">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[15].title}
              </h2>
              <p className="mt-3">
                These terms are governed by the laws of India, and the courts of
                Bengaluru, Karnataka have exclusive jurisdiction, without
                affecting any mandatory consumer protections available to you
                where you live. If a provision is found unenforceable, the rest
                of these terms remain in force.
              </p>
            </section>

            <section id="contact">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold text-plum">
                {SECTIONS[16].title}
              </h2>
              <p className="mt-3">Questions about these terms:</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-2.5">
                  <Mail
                    className="w-4 h-4 text-plum shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="text-plum underline underline-offset-2 break-all"
                  >
                    {CONTACT.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin
                    className="w-4 h-4 text-plum shrink-0"
                    aria-hidden="true"
                  />
                  <span>{CONTACT.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone
                    className="w-4 h-4 text-plum shrink-0"
                    aria-hidden="true"
                  />
                  <span>{CONTACT.hours}</span>
                </li>
              </ul>
            </section>
          </article>

          {/* Section nav — inline on mobile, sticky rail on desktop */}
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

        {/* Cross-links */}
        <div className="mt-14 pt-8 border-t border-plum/10 flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
          <Link
            href="/privacy"
            className="text-plum font-medium hover:underline underline-offset-2"
          >
            Privacy Policy
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
          <Link
            href="/app/crisis"
            className="text-charcoal/70 hover:text-plum transition-colors"
          >
            Crisis support
          </Link>
        </div>
      </div>
    </div>
  )
}
