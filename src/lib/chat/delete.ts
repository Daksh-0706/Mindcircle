import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

import { asUuid, badRequest } from '@/lib/security'

/**
 * Marks a message as deleted and clears its content.
 *
 * Only the sender may call this — RLS enforces it too, so a recipient cannot
 * strip a message from the other person's history even with a valid session.
 *
 * The row is kept rather than removed so the thread keeps its shape and the
 * "this message was deleted" placeholder has something to render, but the text
 * and the attached images are gone. On a mental health app, a message someone
 * chose to retract should not sit readable in the database.
 *
 * The image files themselves are left in storage: deleting them would break any
 * other message that shares the path, and the bucket is private and
 * unreachable once the path is cleared from the row.
 */
export async function deleteMessage(
  supabase: SupabaseClient,
  table: 'messages' | 'direct_messages',
  id: string,
  userId: string,
) {
  if (!asUuid(id)) return badRequest('A valid message id is required.')

  const { data, error } = await supabase
    .from(table)
    .update({
      is_deleted: true,
      content: '',
      media_url: null,
      media_paths: null,
    })
    // Scoping by sender_id is what makes this a no-op for someone else's
    // message instead of an error, so the response does not leak whether the
    // id exists.
    .eq('id', id)
    .eq('sender_id', userId)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'That message could not be deleted.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
