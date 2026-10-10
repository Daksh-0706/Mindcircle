import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { asUuid, badRequest, serverError } from '@/lib/security'

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
