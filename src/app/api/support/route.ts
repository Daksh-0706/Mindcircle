import { createClient } from '@/lib/supabase/server'
import {
  asEmail,
  asText,
  badRequest,
  clientKey,
  rateLimit,
  readJson,
  serverError,
  tooManyRequests,
} from '@/lib/security'

/**
 * POST /api/support  { subject, message, email? }
 *
 * Stores a message filed from /app/help/support.
 *
 * The page used to hand the composed text to the visitor's own mail client and
 * call that "sent" — on a phone with no mail app configured, writing a message
 * did nothing at all. This route is the real destination.
 *
 * Signing in is optional on purpose: the help pages are public, and someone
 * locked out of their account is exactly who needs to reach us. Anonymous
 * callers are therefore accepted, which is why the route is rate-limited.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const limit = rateLimit(clientKey(request, user?.id), {
    limit: 5,
    windowMs: 10 * 60_000,
  })
  if (!limit.ok) return tooManyRequests(limit.retryAfter)

  const body = await readJson(request, { maxBytes: 16 * 1024 })
  if (!body) return badRequest('Could not read that message.')

  const subject = asText(body.subject, { min: 4, max: 140 })
  if (!subject) return badRequest('Please add a short subject.')

  const message = asText(body.message, { min: 10, max: 4000 })
  if (!message) return badRequest('Please add a bit more detail.')

  // Optional field: when it is filled in it has to be a real address, because
  // it is the one we would reply to.
  const rawEmail = typeof body.email === 'string' ? body.email.trim() : ''
  const email = rawEmail ? asEmail(rawEmail) : null
  if (rawEmail && !email) {
    return badRequest('That email address does not look right.')
  }

  const { error } = await supabase.from('support_messages').insert({
    user_id: user?.id ?? null,
    // Fall back to the account address so a reply always has somewhere to go.
    email: email ?? user?.email ?? null,
    subject,
    message,
  })

  if (error) return serverError('support insert failed', error)

  return Response.json({ ok: true })
}
