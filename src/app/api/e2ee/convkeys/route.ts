import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asText, asUuid, badRequest, readJson, tooManyRequests } from '@/lib/security'

/**
 * Per-conversation key wraps for rooms (docs/E2EE.md §phase plan 4).
 *
 * `e2ee_conversation_keys` holds, per (conversation, user), the room's content
 * key sealed with ECIES to that user's identity public key. Any MEMBER of the
 * room may add or refresh wraps for the others — the bytes only open with the
 * recipient's private key, so writing one is harmless; the sender simply
 * cannot be the reader. RLS: everyone can insert, only the owner can read
 * their own row.
 *
 * GET  ?conversation=room:<uuid>          → { data: { wrapped_key } | null }
 * POST { conversation, wraps: [...] }     → { inserted }
 */

const CONVERSATION_RE = /^room:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const WRAP_MAX = 40

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET(request: Request) {
  const { supabase, user } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversation = new URL(request.url).searchParams.get('conversation') ?? ''
  if (!CONVERSATION_RE.test(conversation)) return badRequest('Bad conversation id.')

  const { data, error } = await supabase
    .from('e2ee_conversation_keys')
    .select('wrapped_key')
    .eq('conversation_id', conversation)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 })
  return NextResponse.json({ data: data ?? null })
}

type WrapRow = { user_id: string; wrapped_key: string }

export async function POST(request: Request) {
  const { supabase, user } = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!rateLimitOnce(user.id)) return tooManyRequests(60)

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const conversation = asText(body.conversation, { min: 5, max: 120 })
  if (!conversation || !CONVERSATION_RE.test(conversation)) return badRequest('Bad conversation id.')
  const roomId = conversation.slice('room:'.length)

  // Only a member of the room may hand out its key wraps.
  const membership = await supabase
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership.data) return badRequest('You are not a member of that room.')

  const raw = Array.isArray(body.wraps) ? body.wraps : []
  if (raw.length === 0) return badRequest('No wraps given.')
  if (raw.length > WRAP_MAX) return badRequest('Too many wraps.')

  const rows: WrapRow[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return badRequest('Bad wrap entry.')
    const rec = entry as Record<string, unknown>
    const userId = asUuid(rec.user_id)
    const wrappedKey = asText(rec.wrapped_key, { min: 20, max: 800 })
    if (!userId || !wrappedKey) return badRequest('Bad wrap entry.')
    if (!rows.some((r) => r.user_id === userId)) {
      rows.push({ user_id: userId, wrapped_key: wrappedKey })
    }
  }

  // Upsert (refresh) rather than insert-once: a member whose wrap was lost or
  // displaced gets a fresh one on the next send. Concurrent creators converge
  // to whoever wrapped last — documented in docs/E2EE.md.
  const { error, count } = await supabase
    .from('e2ee_conversation_keys')
    .upsert(rows.map((r) => ({ conversation_id: conversation, user_id: r.user_id, wrapped_key: r.wrapped_key })), {
      onConflict: 'conversation_id,user_id',
    })

  if (error) return NextResponse.json({ error: 'Could not store the key wraps.' }, { status: 500 })
  return NextResponse.json({ inserted: count ?? rows.length })
}

/** Small fixed-window limiter; the table write is the thing we protect. */
const attempts = new Map<string, number>()

function rateLimitOnce(userId: string): boolean {
  const now = Date.now()
  const bucket = Math.floor(now / 60_000)
  const key = `${userId}:${bucket}`
  const n = attempts.get(key) ?? 0
  attempts.set(key, n + 1)
  if (attempts.size > 5000) attempts.clear()
  return n < 30
}
