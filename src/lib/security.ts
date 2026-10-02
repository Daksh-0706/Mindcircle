/**
 * Shared request-safety helpers for the API routes.
 *
 * Every route here builds Supabase filters by string interpolation (e.g.
 * `.or(\`sender_id.eq.${id}\`)`). PostgREST filter syntax has its own operators
 * and punctuation, so an unvalidated value coming straight from the request can
 * terminate the intended clause and append new ones. These helpers make the
 * boundary explicit so a route only ever interpolates a value that has already
 * been proven to be a bare token.
 */

/* ── Format validators ────────────────────────────────────── */

// Canonical UUID form. Deliberately anchored — `.` or `,` or `)` never passes.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

/** Returns the id if it is a safe UUID, otherwise null. */
export function asUuid(value: unknown): string | null {
  return isUuid(value) ? (value as string).toLowerCase() : null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function asEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toLowerCase()
  if (trimmed.length > 254 || !EMAIL_RE.test(trimmed)) return null
  return trimmed
}

/**
 * Normalises free text: trims, collapses control characters (which would
 * otherwise let a caller smuggle newlines into log lines), and enforces a
 * length ceiling. Returns null when the value is unusable.
 */
export function asText(
  value: unknown,
  { min = 1, max = 2000 }: { min?: number; max?: number } = {},
): string | null {
  if (typeof value !== 'string') return null
  // Strip C0/C1 control chars except tab and newline.
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
  if (cleaned.length < min || cleaned.length > max) return null
  return cleaned
}

/** Constrains a value to a fixed set of allowed tokens. */
export function asEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback?: T,
): T | undefined {
  if (typeof value !== 'string') return fallback
  const match = allowed.find((a) => a === value)
  return match ?? fallback
}

export function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function asInt(
  value: unknown,
  { min, max }: { min: number; max: number },
): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return null
  const i = Math.trunc(n)
  return i >= min && i <= max ? i : null
}

/**
 * Only http(s) URLs may be stored. Without this, a caller could persist
 * `javascript:` or `data:` and have it rendered into an href/src later.
 */
export function asHttpUrl(value: unknown): string | null {
  const raw = asText(value, { min: 1, max: 2000 })
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

/* ── Request body ─────────────────────────────────────────── */

/**
 * Parses a JSON body without ever throwing, and rejects oversized payloads.
 * A malformed body should be a 400, not an unhandled 500.
 */
export async function readJson(
  request: Request,
  { maxBytes = 64 * 1024 }: { maxBytes?: number } = {},
): Promise<Record<string, unknown> | null> {
  const declared = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declared) && declared > maxBytes) return null

  let text: string
  try {
    text = await request.text()
  } catch {
    return null
  }
  if (text.length > maxBytes) return null

  try {
    const parsed = JSON.parse(text)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/* ── Responses ────────────────────────────────────────────── */

export function badRequest(message = 'Invalid request.') {
  return Response.json({ error: message }, { status: 400 })
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Logs the real error server-side but returns a generic message. Supabase
 * errors can carry schema and constraint detail that is not for the client.
 */
export function serverError(context: string, error: unknown) {
  console.error(`[api] ${context}:`, error)
  return Response.json(
    { error: 'Something went wrong. Please try again.' },
    { status: 500 },
  )
}

/* ── Rate limiting ────────────────────────────────────────── */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/**
 * Best-effort in-memory fixed-window limiter. Stops casual abuse and runaway
 * clients in a single instance. It is NOT a substitute for a shared store —
 * with several server instances each keeps its own counters — so treat it as
 * defence in depth, not the only control.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

/** Best-effort caller identity for rate-limit keys. */
export function clientKey(request: Request, userId?: string): string {
  if (userId) return `u:${userId}`

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anon'
  return `ip:${ip}`
}

export function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: 'Too many attempts. Please wait and try again.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.max(1, retryAfter)) },
    },
  )
}

/**
 * Convenience gate: resolve the caller, apply a limit, and return either the
 * user or a ready-to-return error response.
 */
export async function requireUser(
  request: Request,
  opts: { limit?: number; windowMs?: number } = {},
): Promise<{ user: { id: string; email?: string } } | { response: Response }> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { response: unauthorized() }

  if (opts.limit) {
    const { ok, retryAfter } = rateLimit(clientKey(request, user.id), {
      limit: opts.limit,
      windowMs: opts.windowMs ?? 60_000,
    })
    if (!ok) return { response: tooManyRequests(retryAfter) }
  }

  return { user }
}