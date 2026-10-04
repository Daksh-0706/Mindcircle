import type { SupabaseClient } from '@supabase/supabase-js'

import { asText } from '@/lib/security'
import { MAX_IMAGES_PER_MESSAGE } from '@/lib/chat/limits'


/**
 * Normalises the image paths of an outgoing message.
 *
 * Accepts either `media_paths` (new, up to nine images) or the older single
 * `media_url`, so a client that has not been updated still works. The result is
 * written to `media_paths` only, leaving `media_url` null — reading code
 * prefers `media_paths` and falls back, so old rows stay readable forever.
 *
 * Every path is checked against the sender's own folder, which is what stops a
 * message pointing at an upload that belongs to someone else or at some other
 * object in the bucket.
 */
export function readMediaPaths(
  body: Record<string, unknown>,
  userId: string,
): { ok: true; paths: string[] } | { ok: false; error: string } {
  const raw = body.media_paths

  if (Array.isArray(raw)) {
    const paths: string[] = []
    for (const entry of raw) {
      const path = asText(entry, { min: 1, max: 500 })
      if (!path) return { ok: false, error: 'That image does not belong to you.' }
      if (!path.startsWith(`${userId}/`)) {
        return { ok: false, error: 'That image does not belong to you.' }
      }
      if (!paths.includes(path)) paths.push(path)
    }
    if (paths.length > MAX_IMAGES_PER_MESSAGE) {
      return { ok: false, error: `You can send up to ${MAX_IMAGES_PER_MESSAGE} images at once.` }
    }
    return { ok: true, paths }
  }

  // Back-compat: a single `media_url`, including the empty-string the client
  // used to send when there was no attachment.
  const legacy = asText(body.media_url, { min: 1, max: 500 })
  if (!legacy) return { ok: true, paths: [] }
  if (!legacy.startsWith(`${userId}/`)) {
    return { ok: false, error: 'That image does not belong to you.' }
  }
  return { ok: true, paths: [legacy] }
}

/**
 * The storage paths a stored row refers to, newest convention first.
 *
 * A row written before migration 009 has a null `media_paths`, so this returns
 * a single-element array built from `media_url`.
 */
export function pathsOf(row: Record<string, unknown>): string[] {
  const many = row.media_paths
  if (Array.isArray(many)) {
    return many.filter((p): p is string => typeof p === 'string' && p.length > 0)
  }
  const one = row.media_url
  return typeof one === 'string' && one.length > 0 ? [one] : []
}

/**
 * Adds signed URLs to every row that carries images.
 *
 * The bucket is private, so the stored value is only a storage path. Signing
 * here — rather than in the browser — means the bucket can stay private and
 * the URLs still expire on their own.
 *
 * Rows come back with `image_urls` (always an array, so the client has one
 * shape to render) plus `image_url`, the first entry, for older clients.
 */
export async function withSignedImages(
  supabase: SupabaseClient,
  rows: Record<string, unknown>[],
) {
  const paths = [...new Set(rows.flatMap(pathsOf))]
  if (paths.length === 0) {
    return rows.map((r) => ({ ...r, image_urls: [], image_url: null }))
  }

  const { data } = await supabase.storage.from('chat-media').createSignedUrls(paths, 3600)
  const signed = new Map<string, string>()
  for (const f of data ?? []) {
    if (f.path && f.signedUrl) signed.set(f.path, f.signedUrl)
  }

  return rows.map((r) => {
    const urls = pathsOf(r)
      .map((p) => signed.get(p))
      .filter((u): u is string => typeof u === 'string')
    return { ...r, image_urls: urls, image_url: urls[0] ?? null }
  })
}
