'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * Decrypted media rendering for chat photos.
 *
 * Encrypted attachments are `iv ‖ ct` blobs behind the same signed URLs as
 * always — only the storage path ends in `.enc`. An <img> cannot open those,
 * so EncryptedImage fetches the bytes, opens them with the key this surface
 * provides (the DM pair key in a thread, the journal key on journal pages),
 * and renders the plaintext copy. Legacy `.jpg` rows — and any surface that
 * provides no key — fall straight through to the plain <img>.
 */

export type MediaDecryptor = ((bytes: Uint8Array) => Promise<Uint8Array | null>) | null

const MediaCtx = createContext<MediaDecryptor>(null)

/** Wrap a surface whose photos share one key (a DM thread, the journal). */
export function MediaKeysProvider({
  decrypt,
  children,
}: {
  decrypt: MediaDecryptor
  children: ReactNode
}) {
  return <MediaCtx.Provider value={decrypt}>{children}</MediaCtx.Provider>
}

function useMediaDecryptor(): MediaDecryptor {
  return useContext(MediaCtx)
}

/** Encrypted uploads carry the suffix; signed URLs preserve the path. */
export function isEncryptedUrl(url: string): boolean {
  return /\.enc(\?|$)/.test(url)
}

// Signed URLs repeat across the grid and the lightbox, and each URL lives an
// hour; dedupe the byte fetches so opening a thread costs one request per photo.
const fetchCache = new Map<string, Promise<Uint8Array>>()

function fetchBytes(url: string): Promise<Uint8Array> {
  let p = fetchCache.get(url)
  if (!p) {
    p = fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('fetch failed'))))
      .then((buf) => new Uint8Array(buf))
    fetchCache.set(url, p)
    if (fetchCache.size > 80) {
      const oldest = fetchCache.keys().next().value
      if (oldest) fetchCache.delete(oldest)
    }
  }
  return p
}

/**
 * A chat photo that knows how to open itself. Renders exactly like the plain
 * <img> it replaces when the surface has no key or the row is legacy.
 */
export function EncryptedImage({ url, alt, className }: { url: string; alt: string; className?: string }) {
  const decrypt = useMediaDecryptor()
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const encrypted = isEncryptedUrl(url)

  useEffect(() => {
    if (!encrypted || !decrypt) return
    let cancelled = false
    void (async () => {
      try {
        const sealed = await fetchBytes(url)
        const plain = await decrypt(sealed)
        if (!plain) throw new Error('undecryptable')
        const blobUrl = URL.createObjectURL(new Blob([plain as BlobPart], { type: 'image/jpeg' }))
        if (cancelled) {
          URL.revokeObjectURL(blobUrl)
          return
        }
        setObjectUrl(blobUrl)
        setFailed(false)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [url, decrypt, encrypted])

  if (!encrypted || !decrypt) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} className={className} />
  }
  if (failed || !objectUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-warm-gray-lighter/60 text-[11px] text-warm-gray ${className ?? ''}`}
      >
        {failed ? '🔒 Photo unavailable' : '…'}
      </div>
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={objectUrl} alt={alt} className={className} />
}
