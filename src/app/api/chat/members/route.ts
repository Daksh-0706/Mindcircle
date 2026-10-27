import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asUuid, badRequest } from '@/lib/security'

/**
 * GET /api/chat/members?room_id=<uuid> → { data: [user_id, …] }
 *
 * The room key must be wrapped to every member's identity key, so members
 * need the id list of their own rooms. RLS grants exactly that: migration 014
 * lets a member select room_members rows of rooms they belong to (ids only —
 * the table has no personal data). Non-members see nothing.
 */
export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roomId = asUuid(new URL(request.url).searchParams.get('room_id'))
  if (!roomId) return badRequest('Bad room id.')

  const { data, error } = await supabase
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId)
    .limit(60)

  if (error) return NextResponse.json({ error: 'Lookup failed.' }, { status: 500 })
  return NextResponse.json({ data: (data ?? []).map((r) => r.user_id) })
}
