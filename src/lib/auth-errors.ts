/**
 * User-facing wording for Supabase auth failures.
 *
 * Raw Supabase messages leak internals and read badly ("Error sending
 * confirmation email"), and some of them distinguish whether an account
 * exists — which is account enumeration. This maps them to something a person
 * can actually act on, without revealing more than we intend.
 */

/** Shown when a delivery email (confirmation / recovery) couldn't be sent. */
export const EMAIL_DELIVERY_ERROR =
  'We couldn’t send the confirmation email just now. Please try again in a minute.'

/** Shown when the user tries again too soon. */
export const EMAIL_RATE_LIMIT_ERROR =
  'Too many emails requested. Please wait a minute before trying again.'

export function authErrorMessage(
  error: { message?: string; status?: number; code?: string } | null | undefined,
): string {
  if (!error) return 'Something went wrong. Please try again.'

  const message = error.message ?? ''

  // Delivery failure — almost always the built-in SMTP service hitting its
  // hourly quota rather than anything the user did wrong.
  if (
    /sending confirmation email|sending email|smtp|email.*(fail|error)/i.test(message)
  ) {
    return EMAIL_DELIVERY_ERROR
  }

  if (/rate limit|too many|security purposes/i.test(message)) {
    return EMAIL_RATE_LIMIT_ERROR
  }

  if (/already registered|already been registered|user already/i.test(message)) {
    return 'An account with that email already exists. Try logging in.'
  }

  if (/invalid login credentials/i.test(message)) {
    return 'Those credentials didn’t match. Please try again.'
  }

  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email address first — check your inbox.'
  }

  if (/password should be|password.*at least|weak password/i.test(message)) {
    return 'Please choose a stronger password (at least 8 characters, with a number).'
  }

  if (/token.*expired|expired.*token|otp.*expired/i.test(message)) {
    return 'That code has expired. Please request a new one.'
  }

  if (/unable to validate email|invalid email/i.test(message)) {
    return 'Please enter a valid email address.'
  }

  if (/fetch failed|network|failed to fetch/i.test(message)) {
    return 'We couldn’t reach the server. Check your connection and try again.'
  }

  // Unknown: show it, since a blank error state helps nobody.
  return message || 'Something went wrong. Please try again.'
}