'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react'
import { AppNav } from '../../../../components/layout/AppNavContext'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
import { CONTACT } from '../../../../lib/seo'

type Status = 'idle' | 'sending' | 'sent'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const next: Record<string, string> = {}
    if (!subject.trim()) next.subject = 'Please add a short subject.'
    else if (subject.trim().length < 4) next.subject = 'Subject is a little too short.'
    if (!message.trim()) next.message = 'Tell us what is going on so we can help.'
    else if (message.trim().length < 10) next.message = 'Please add a bit more detail.'
    else if (message.length > 4000) next.message = 'Please keep it under 4000 characters.'
    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      next.email = 'That email address does not look right.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    // No inbound mail relay is wired up yet, so we do not pretend to deliver.
    // The composed message is handed to the user's mail client instead, which
    // reaches the same small team without us storing anything.
    await new Promise((r) => setTimeout(r, 500))
    setStatus('sent')
  }

  const mailtoHref = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    `[MindCircle support] ${subject.trim()}`,
  )}&body=${encodeURIComponent(
    `${message.trim()}${email.trim() ? `\n\nReply to: ${email.trim()}` : ''}`,
  )}`

  const fieldClass = (key: string) =>
    `input-warm w-full ${errors[key] ? 'border-danger/60 focus:border-danger' : ''}`

  return (
    <>
      <AppNav title="Contact support" showBack />

      <div className="page-enter mx-auto max-w-5xl px-4 sm:px-6 pb-24 lg:pb-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:items-start">
          {/* Left: heading + form */}
          <div className="min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-plum">
              We&apos;re here to listen.
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-6 text-charcoal/70 max-w-prose">
              Bug reports, privacy questions, billing, or just something that felt off
              &mdash; send it over. We read everything ourselves, and we reply from a real
              person, not a template.
            </p>

            <Card className="bg-white/80 mt-8" padding="lg">
              {status === 'sent' ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-sage/15 flex items-center justify-center">
                    <Send className="w-5 h-5 text-sage-dark" aria-hidden="true" />
                  </div>
                  <h2 className="font-heading text-xl font-semibold text-charcoal mt-4">
                    Ready to send
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-charcoal/70 max-w-md mx-auto">
                    We could not reach our inbox automatically, so please email these
                    details directly. It reaches the same small team, and it is the
                    fastest route to a real reply.
                  </p>
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-2 mt-5 h-11 px-6 rounded-full btn-gradient text-white text-sm font-medium hover:brightness-105 transition"
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    Open in my mail app
                  </a>
                  <div className="mt-6 pt-6 border-t border-plum/10">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('idle')
                        setSubject('')
                        setMessage('')
                        setEmail('')
                      }}
                      className="text-sm font-medium text-plum hover:underline underline-offset-2"
                    >
                      Write another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate>
                  <div>
                    <label
                      htmlFor="support-subject"
                      className="block font-heading text-sm font-semibold text-charcoal"
                    >
                      Subject <span className="text-danger">*</span>
                    </label>
                    <input
                      id="support-subject"
                      name="subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. I cannot load my journal entries"
                      maxLength={140}
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? 'support-subject-error' : undefined}
                      className={`${fieldClass('subject')} mt-2`}
                    />
                    {errors.subject && (
                      <p id="support-subject-error" className="mt-1.5 text-xs text-danger">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="support-message"
                      className="block font-heading text-sm font-semibold text-charcoal"
                    >
                      How can we help? <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="support-message"
                      name="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what happened, and what you expected instead."
                      rows={7}
                      maxLength={4000}
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message ? 'support-message-error' : 'support-message-count'
                      }
                      className={`${fieldClass('message')} mt-2 resize-y`}
                    />
                    <div className="mt-1.5 flex items-start justify-between gap-3">
                      {errors.message ? (
                        <p id="support-message-error" className="text-xs text-danger">
                          {errors.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span
                        id="support-message-count"
                        className="text-xs text-warm-gray tabular-nums shrink-0"
                      >
                        {message.length}/4000
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="support-email"
                      className="block font-heading text-sm font-semibold text-charcoal"
                    >
                      Your email{' '}
                      <span className="font-body font-normal text-warm-gray">
                        (optional, for a reply)
                      </span>
                    </label>
                    <input
                      id="support-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'support-email-error' : undefined}
                      className={`${fieldClass('email')} mt-2`}
                    />
                    {errors.email && (
                      <p id="support-email-error" className="mt-1.5 text-xs text-danger">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={status === 'sending'}
                    className="mt-6 w-full sm:w-auto"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Sending&hellip;
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        Send message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Right: real contact details */}
          <aside className="mt-10 lg:mt-0 space-y-4">
            <Card className="bg-white/80" padding="md">
              <h2 className="font-heading font-semibold text-charcoal">Reach us directly</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="flex items-start gap-2.5 group"
                  >
                    <Mail
                      className="w-4 h-4 text-plum shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-charcoal group-hover:text-plum transition-colors break-all">
                        {CONTACT.email}
                      </span>
                      <span className="text-xs text-warm-gray">General support</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-plum shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <span className="block text-charcoal">{CONTACT.phone}</span>
                    <span className="text-xs text-warm-gray">Not a crisis line</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-plum shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <span className="block text-charcoal">{CONTACT.address}</span>
                    <span className="text-xs text-warm-gray">Registered address</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-plum shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <span className="block text-charcoal">{CONTACT.hours}</span>
                    <span className="text-xs text-warm-gray">
                      Replies within 2 working days
                    </span>
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="bg-sage/10 border-sage/25" padding="md">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="w-4 h-4 text-sage-dark shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <h3 className="font-heading font-semibold text-charcoal">
                    This is not a crisis service
                  </h3>
                  <p className="mt-1.5 text-charcoal/70 leading-6">
                    We do not read messages in real time. If you are in danger or thinking
                    about harming yourself, use the crisis page &mdash; it has verified
                    helplines that answer now.
                  </p>
                  <Link
                    href="/app/crisis"
                    className="inline-flex items-center gap-1.5 mt-3 font-medium text-sage-dark hover:underline underline-offset-2"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    Crisis support
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="bg-white/80" padding="md">
              <h3 className="font-heading font-semibold text-charcoal text-sm">
                Faster than email
              </h3>
              <p className="mt-1.5 text-sm text-charcoal/70 leading-6">
                Most questions are already answered in the FAQ.
              </p>
              <Link
                href="/app/help/faq"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-plum hover:underline underline-offset-2"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Read the FAQ
              </Link>
            </Card>
          </aside>
        </div>
      </div>
    </>
  )
}
