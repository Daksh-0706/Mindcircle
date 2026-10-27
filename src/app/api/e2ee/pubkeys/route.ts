import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest } from '@/lib/security'

/**
 * Identity PUBLIC keys for other members (docs/E2EE.md §chats).
 *
 * Public keys are public by design — they are what another client derives a
 * shared DM key against. The private-key envelope on the same row stays
 * owner-only through the "e2ee identities own" policy; this route selects the
 * `public_key` column only.
 *
 * GET ?ids=<uuid>,<uuid>,… → { data: [{ user_id, public_key }] }
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ids = (new URL(request.url).searchParams.get('ids') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (ids.length === 0) return badRequest('No ids requested.')
  if (ids.length > 60) return badRequest('Too many ids.')
  for (const id of ids) {
    if (!asUuid(id)) return badRequest('Invalid id.')
  }

  const { data, error } = await supabase
    .from('e2ee_identities')
    .select('user_id, public_key')
    .in('user_id', ids)

  if (error) return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}
