import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { asText, asUuid, badRequest, readJson, serverError } from '@/lib/security'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const safeId = asUuid(id)
  if (!safeId) {
    return badRequest('A valid entry id is required.')
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', safeId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return serverError('journal entry fetch', error)
  }

  // A missing row and someone else's row are the same answer on purpose:
  // distinguishing them would leak whether an id exists.
  if (!data) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

/**
 * Re-write an entry's content in place. The only caller is the E2EE migration
 * in the client (docs/E2EE.md): the server cannot encrypt, so the browser/phone
 * fetches its own entries, seals each one and PATCHes the envelope back. The
 * server keeps storing an opaque string either way.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const safeId = asUuid(id)
  if (!safeId) return badRequest('A valid entry id is required.')

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const content = asText(body.content, { min: 1, max: 40_000 })
  if (!content) return badRequest('Entry content is required (max 40,000 characters).')

  const { data, error } = await supabase
    .from('journal_entries')
    .update({ content })
    .eq('id', safeId)
    .eq('user_id', user.id)
    .select()

  if (error) return serverError('journal entry update', error)
  if (!data || data.length === 0) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

  return NextResponse.json({ data: data[0] })
}
