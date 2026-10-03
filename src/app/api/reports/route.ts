import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { asEnum, asText, asUuid, badRequest, readJson, serverError } from '@/lib/security'

/**
 * The closed reason vocabulary. Kept in one place so the modal, the API and
 * the database CHECK constraint cannot drift apart.
 */
export const REASONS = [
  'harassment',
  'inappropriate',
  'hate',
  'spam',
  'fake',
  'other',
] as const

const DETAILS_MAX = 500

/**
 * GET  /api/reports — the reports I filed, newest first.
 * POST /api/reports  { user_id, reason, details? }
 *
 * Filing is deliberately anonymous to the person reported: there is no column
 * carrying "who said this" into any surface they can read, and the select
 * policy means the reporter can only ever see their own reports. Moderation
 * triage needs a service-role key and is not wired up yet.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('reports')
    .select('id, reported_id, reason, details, created_at')
    .eq('reporter_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return serverError('reports list', error)
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await readJson(request)
  if (!body) return badRequest('Invalid request body.')

  const reportedId = asUuid(body.user_id)
  if (!reportedId) return badRequest('Invalid user_id.')
  if (reportedId === user.id) return badRequest('You cannot report yourself.')

  // asEnum against the shared list: an unknown reason would otherwise hit the
  // CHECK constraint and surface as an opaque 500.
  const reason = asEnum(body.reason, REASONS)
  if (!reason) return badRequest('Please choose a reason.')

  const details =
    body.details === undefined || body.details === null || body.details === ''
      ? null
      : (asText(body.details, { min: 1, max: DETAILS_MAX }) ?? null)
  if (body.details && !details) {
    return badRequest(`Please keep details under ${DETAILS_MAX} characters.`)
  }

  const { data: target } = await supabase
    .from('users')
    .select('id')
    .eq('id', reportedId)
    .maybeSingle()

  if (!target) return badRequest('That person is no longer available.')

  // Checked up front purely so the message is readable; the unique index on
  // (reporter_id, reported_id) is what actually prevents duplicates, and the
  // code below still handles that race.
  const { data: already } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('reported_id', reportedId)
    .maybeSingle()

  if (already) {
    return NextResponse.json(
      { error: 'You have already reported this person.' },
      { status: 409 },
    )
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({ reporter_id: user.id, reported_id: reportedId, reason, details })
    .select('id, reported_id, reason, details, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You have already reported this person.' },
        { status: 409 },
      )
    }
    return serverError('reports create', error)
  }

  return NextResponse.json({ data }, { status: 201 })
}