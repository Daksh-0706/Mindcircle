/**
 * Whether email + password sign-in and sign-up are offered.
 *
 * These flows depend on Supabase being able to deliver a confirmation email,
 * and the project has no working outbound SMTP yet: the built-in Supabase
 * mailer is quota-limited and restricted to project members, and custom SMTP
 * (Resend) is still waiting on a verified domain. Turning "Confirm email" on
 * without that would let anyone type an address, never receive a code, and be
 * stuck on a verification screen with no way forward.
 *
 * So rather than show a form that cannot complete, both auth screens say the
 * option is unavailable and leave Google as the working way in.
 *
 * FLIP THIS TO `true` once custom SMTP is live and a confirmation email has
 * been verified end-to-end — it is the only edit needed to bring email
 * sign-in back.
 */
export const EMAIL_AUTH_AVAILABLE = false

/**
 * Body copy shown wherever the email form is, in place of it. Deliberately
 * does not repeat the heading each screen already renders above it.
 */
export const EMAIL_AUTH_UNAVAILABLE_MESSAGE =
  'We’re still setting up reliable email delivery. Please continue with Google — we’ll bring email back as soon as it works.'