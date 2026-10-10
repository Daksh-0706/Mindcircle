'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Skeleton from '../../../../components/ui/Skeleton'
import { Camera, ChevronLeft, Image as ImageIcon, Loader2, Send, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MAX_IMAGES_PER_MESSAGE as MAX_IMAGES } from '@/lib/chat/limits'
import { formatTime } from '../../../../lib/dates'
import { roomEmoji } from '../../../../lib/alias'
import NotoEmoji from '../../../../components/ui/NotoEmoji'
import { AppNav } from '../../../../components/layout/AppNavContext'
import {
  AttachmentPreview,
  ImageGrid,
  ImageLightbox,
} from '../../../../components/chat/AttachmentPreview'
import { MessageDetails, MessageMenu } from '../../../../components/chat/MessageMenu'

type ChatMessage = {
  id: string
  room_id?: string | null
  sender_id: string
  receiver_id?: string | null
  content: string
  /** Storage paths, e.g. "<uid>/<file>.jpg" — not directly loadable. */
  media_url?: string | null
  media_paths?: string[] | null
  /** Short-lived signed URLs produced by the API, one per image. */
  image_urls?: string[] | null
  /** First signed URL, kept for older rows that predate multi-image. */
  image_url?: string | null
  created_at: string
}

/** Signed URLs for a message, whichever shape the API returned it in. */
function imageUrlsOf(m: ChatMessage): string[] {
  if (m.image_urls && m.image_urls.length > 0) return m.image_urls
  return m.image_url ? [m.image_url] : []
}

/** Longest edge we store. Photos are downscaled before upload to keep them light. */
const MAX_EDGE = 1280
const JPEG_QUALITY = 0.82

function timeLabel(iso: string) {
  return formatTime(new Date(iso))
}

/**
 * Draw an image into a canvas and return a JPEG data URL capped at MAX_EDGE.
 *
 * Phone cameras produce 4000px-wide files; sending those raw makes every
 * message megabytes and makes the thread unusable on a slow connection.
 * Canvas is also the only way to re-encode a HEIC file into something every
 * browser can render.
 */
async function compressImage(source: Blob): Promise<{ dataUrl: string; blob: Blob }> {
  const image = await decodeImage(source)
  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process the image.')
  ctx.drawImage(image.el, 0, 0, width, height)
  if ('close' in image.el && typeof image.el.close === 'function') image.el.close()

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)

  // toBlob rather than fetch(dataUrl): the data URL is already in hand, and
  // round-tripping it through fetch only adds a failure mode for no gain.
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error('Could not process the image.')),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })

  return { dataUrl, blob }
}

/**
 * Decodes a blob to something drawable.
 *
 * createImageBitmap is the fast path, but it is missing in some embedded and
 * older browsers, so we fall back to an <img> + object URL rather than failing
 * the whole attachment.
 */
async function decodeImage(
  source: Blob,
): Promise<{ el: CanvasImageSource & { close?: () => void }; width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(source)
    return { el: bitmap, width: bitmap.width, height: bitmap.height }
  }

  const url = URL.createObjectURL(source)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return { el: img, width: img.naturalWidth, height: img.naturalHeight }
  } finally {
    // The bitmap is already decoded, so the URL can go.
    URL.revokeObjectURL(url)
  }
}

export default function ChatDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const peerId = params?.id ?? ''
  // router imported above for dead-thread redirect
  // Rooms AND DM peers both use uuid routes. Try the room lookup first;
  // if the id isn't a room, treat it as a DM participant.
  const [isRoom, setIsRoom] = useState<boolean | null>(null)

  const [roomName, setRoomName] = useState('Loading…')
  const [peerAvatar, setPeerAvatar] = useState('😌')
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  // Image attachment state: a picked/captured photo, then the uploaded path.
  const [attachments, setAttachments] = useState<{ preview: string; blob: Blob }[]>([])
  const [uploading, setUploading] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  // Caption typed over a picked image. Kept apart from `message` so closing
  // the preview without sending does not leave stray text in the composer.
  const [caption, setCaption] = useState('')
  // Full-screen preview of the picked image, and of anything already sent.
  const [previewOpen, setPreviewOpen] = useState(false)
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null)
  // The message the three-dot menu is acting on, and whether it is being
  // removed. Kept as state rather than a ref so the sheet renders from it.
  const [menuMessage, setMenuMessage] = useState<ChatMessage | null>(null)
  const [deleting, setDeleting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Live camera preview while the capture sheet is open.
  useEffect(() => {
    if (!cameraOpen) return
    let stream: MediaStream | undefined
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((next) => {
        stream = next
        if (videoRef.current) videoRef.current.srcObject = next
      })
      .catch(() =>
        setCameraError('Camera access was unavailable. You can still pick an image.'),
      )
    return () => stream?.getTracks().forEach((track) => track.stop())
  }, [cameraOpen])

  /**
   * Adds one or more picked files to the pending set.
   *
   * Existing picks are kept: the gallery picker on Android and iOS lets you
   * add to a selection, and replacing the set every time would silently drop
   * images the user already chose.
   */
  const pickFiles = async (files: FileList | File[] | null | undefined) => {
    const list = Array.from(files ?? [])
    if (list.length === 0) return

    const room = MAX_IMAGES - attachments.length
    if (room <= 0) {
      setError(`You can send up to ${MAX_IMAGES} images at once.`)
      return
    }

    const images = list.filter((f) => f.type.startsWith('image/'))
    if (images.length < list.length) setError('Only images can be sent.')
    if (images.length === 0) return

    const accepted = images.slice(0, room)
    if (images.length > room) {
      setError(`You can send up to ${MAX_IMAGES} images at once.`)
    }

    try {
      const compressed = await Promise.all(accepted.map((f) => compressImage(f)))
      setAttachments((prev) => [
        ...prev,
        ...compressed.map(({ dataUrl, blob }) => ({ preview: dataUrl, blob })),
      ])
      setPreviewOpen(true)
    } catch {
      setError('Could not read that image.')
    }
  }

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob) void pickFiles([new File([blob], 'photo.jpg', { type: 'image/jpeg' })])
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
    setCameraOpen(false)
  }

  /**
   * Uploads every pending image to the private chat-media bucket.
   *
   * They go up in parallel because each is a few hundred KB and the requests
   * are independent. One failure fails the whole send rather than posting a
   * message with a silent gap in the set, which is worse than an error the
   * user can retry.
   */
  const uploadAttachments = async (pending: { preview: string; blob: Blob }[]) => {
    if (pending.length === 0) return null
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Please sign in again.')

    const results = await Promise.all(
      pending.map(async ({ blob }) => {
        // Random name: the path must not be guessable from message ids.
        const path = `${user.id}/${crypto.randomUUID()}.jpg`
        const { error } = await supabase.storage
          .from('chat-media')
          .upload(path, blob, { contentType: 'image/jpeg' })
        if (error) throw new Error(`Upload failed: ${error.message}`)
        return path
      }),
    )
    return results
  }

  // Resolve the signed-in user id once.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setMyId(data.user?.id ?? null))
      .catch(() => undefined)
  }, [])

  const load = useCallback(async () => {
    if (!peerId) return
    try {
      // 1. Is this id one of our chat rooms?
      const roomsRes = await fetch('/api/chat')
      let room: { id: string; name: string; member_count: number; is_member: boolean } | undefined
      if (roomsRes.ok) {
        const json = await roomsRes.json()
        room = (json.data ?? []).find((r: { id: string }) => r.id === peerId)
      }

      if (room) {
        setIsRoom(true)
        setRoomName(room.name)
        setMemberCount(room.member_count)
        const msgsRes = await fetch(`/api/chat/messages?room_id=${encodeURIComponent(peerId)}`)
        if (!msgsRes.ok) {
          const errJson = await msgsRes.json().catch(() => null)
          throw new Error(errJson?.error || 'Could not load messages')
        }
        const msgsJson = await msgsRes.json()
        setMessages((msgsJson.data ?? []) as ChatMessage[])
      } else {
        setIsRoom(false)
        const dmRes = await fetch(`/api/chat/dm?receiver_id=${encodeURIComponent(peerId)}`)
        if (!dmRes.ok) throw new Error('Could not load messages')
        const dmJson = await dmRes.json()
        // Dead conversation (the other account was deleted) — bounce to the
        // chats list instead of showing a thread that can never work.
        if (dmJson.peer_exists === false) {
          router.replace('/app/chats')
          return
        }
        setRoomName(dmJson?.peer?.name || 'Mindcircle user')
        setPeerAvatar(dmJson?.peer?.avatar_emoji || '😌')
        setMessages((dmJson.data ?? []) as ChatMessage[])
      }
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [peerId, router])

  useEffect(() => {
    // Initial load — all setState calls inside `load` happen in async callbacks.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  // Realtime: new messages appear instantly without refresh.
  useEffect(() => {
    if (!peerId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${peerId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: isRoom ? 'messages' : 'direct_messages' },
        (payload) => {
          const row = payload.new as ChatMessage
          const relevant = isRoom
            ? row.room_id === peerId
            : row.sender_id === peerId || row.receiver_id === peerId
          // isRoom is stable by the time messages flow; null means still loading.
          if (!relevant) return
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]))
          // A realtime INSERT only carries the storage path; signed URLs are
          // issued by the list endpoints, so re-read to make the image load.
          if (row.media_url) {
            const handle = setTimeout(() => void load(), 400)
            return () => clearTimeout(handle)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [peerId, isRoom === true])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  /**
   * Where the back arrow goes. A room was opened from Connect, so returning
   * there keeps the user in context; a 1:1 thread came from Chats. Default is
   * Chats because `isRoom === null` only lasts the first request.
   */
  const backHref = isRoom ? '/app/connect' : '/app/chats'

  /**
   * Which text field the outgoing message should take.
   *
   * Sending a photo happens from the preview sheet, so its caption wins while
   * the sheet is open; sending plain text uses the composer.
   */
  const pendingCaptionSource = () =>
    previewOpen && caption.trim() ? caption : message

  const handleSend = async () => {
    // With an image open, the caption bar is the source of the text — the
    // composer behind it is not visible and may still hold a draft.
    const content = (pendingCaptionSource()).trim()
    const pendingImages = attachments
    if ((!content && pendingImages.length === 0) || sending || uploading || isRoom === null) return

    setSending(true)
    setMessage('')
    setCaption('')
    setPreviewOpen(false)
    if (pendingImages.length > 0) {
      setUploading(true)
      setAttachments([])
    }

    const tempId = `temp-${Date.now()}`
    if (myId) {
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender_id: myId,
          content,
          created_at: new Date().toISOString(),
          // Show the local copies straight away; the saved row replaces them.
          image_urls: pendingImages.map((a) => a.preview),
          image_url: null,
          media_url: null,
          media_paths: null,
        },
      ])
    }

    try {
      const mediaPaths = pendingImages.length > 0 ? await uploadAttachments(pendingImages) : null

      const res = isRoom
        ? await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              room_id: peerId,
              content,
              ...(mediaPaths ? { media_paths: mediaPaths } : {}),
            }),
          })
        : await fetch('/api/chat/dm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receiver_id: peerId,
              content,
              ...(mediaPaths ? { media_paths: mediaPaths } : {}),
            }),
          })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Message could not be sent.')
      }
      const json = await res.json()
      const saved = (json.data?.[0] ?? null) as ChatMessage | null
      setMessages((prev) =>
        saved
          ? prev.map((m) =>
              m.id === tempId
                ? // The POST response carries the path but no signed URL, so the
                  // local preview is kept until the next fetch signs it.
                  {
                    ...saved,
                    image_urls: mediaPaths ? (m.image_urls ?? null) : null,
                    image_url: null,
                  }
                : m,
            )
          : prev.filter((m) => m.id !== tempId),
      )
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setMessage(content)
      // Give the photos back rather than losing them to a failed upload.
      if (pendingImages.length > 0) setAttachments(pendingImages)
      setError(e instanceof Error ? e.message : 'Message could not be sent.')
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  /**
   * Deletes one of my own messages, then drops it from the thread.
   *
   * The row is only marked deleted server-side, so the optimistic removal here
   * is what the sender sees immediately; everyone else gets the placeholder on
   * their next fetch.
   */
  const handleDelete = async (m: ChatMessage) => {
    setDeleting(true)
    setError('')
    try {
      const endpoint = isRoom ? '/api/chat/messages' : '/api/chat/dm'
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(m.id)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'That message could not be deleted.')
      }
      setMessages((prev) => prev.filter((x) => x.id !== m.id))
      setMenuMessage(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That message could not be deleted.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Full-screen thread: suppress the app's mobile header and bottom nav
          so the conversation owns the whole viewport. */}
      <AppNav showBack showMobileHeader={false} showBottomNav={false} />
      {/*
        Phone/tablet: the app shell's wrapper only grows with content, so
        `h-full` collapsed to the content height and the whole page scrolled —
        the composer slid below the fold once the thread got long. Pin the
        surface to the dynamic viewport height instead (minus the shell's pt-3
        and a small bottom gap) so messages scroll internally and the composer
        stays on screen. Desktop has the same failure: the shell chain above
        this page never locks a definite height, so a long thread grows the
        document and scrolls the whole page. Give desktop an explicit dvh too,
        subtracting its chrome (TopBar h-14 + the content wrapper's p-6 pt-5),
        so the message list — not the page — is what scrolls.
      */}
      <div className="flex h-[calc(100dvh_-_2.25rem)] flex-col lg:h-[calc(100dvh_-_6.25rem)]">
      {/* Chat header — back arrow, ring avatar, name. Nothing else: no call,
          video, sticker or attach affordances on this surface. */}
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          aria-label={isRoom ? 'Back to circles' : 'Back to chats'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-charcoal/80 transition-colors hover:bg-plum/5 hover:text-plum"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum/10 ring-2 ring-plum">
          <NotoEmoji emoji={isRoom ? roomEmoji(roomName) : peerAvatar} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-[17px] font-extrabold leading-tight text-charcoal">
            {roomName}
          </h1>
          <p className="truncate text-[12px] text-warm-gray">
            {isRoom
              ? `Anonymous room${memberCount !== null ? ` · ${memberCount} here` : ''}`
              : 'Mindcircle user'}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-1">
          {loading ? (
            <div className="space-y-4">
              <Skeleton variant="rect" width="55%" height={48} />
              <Skeleton variant="rect" width="55%" height={48} className="ml-auto" />
              <Skeleton variant="rect" width="60%" height={48} />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-warm-gray">
              No messages yet. Write something kind to start the conversation.
            </p>
          ) : (
            messages.map((m) => {
              const mine = myId !== null && m.sender_id === myId
              const urls = imageUrlsOf(m)
              return (
                <div
                  key={m.id}
                  className={`group flex items-end gap-1 ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={
                      mine
                        ? 'max-w-[70%] rounded-[18px] rounded-br-md bg-plum px-3.5 py-2.5 text-[14px] leading-6 text-cream shadow-[0_2px_8px_rgba(74,44,94,0.14)]'
                        : 'max-w-[70%] rounded-[18px] rounded-bl-md border border-warm-gray-lighter/60 bg-white px-3.5 py-2.5 text-[14px] leading-6 text-charcoal shadow-[0_2px_8px_rgba(74,44,94,0.06)]'
                    }
                  >
                    {urls.length > 0 && (
                      <ImageGrid
                        urls={urls}
                        onOpen={(index) => setLightbox({ urls, index })}
                      />
                    )}
                    {m.content && (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    )}
                    <p
                      className={
                        mine
                          ? 'mt-0.5 text-right text-[9px] text-cream/60'
                          : 'mt-0.5 text-right text-[9px] text-warm-gray'
                      }
                    >
                      {timeLabel(m.created_at)}
                    </p>
                  </div>
                  {/* Only ever on the caller's own messages: the server refuses
                      a delete for anybody else's, so offering it would be a
                      dead end. Hidden on desktop until the row is hovered, so a
                      thread does not turn into a wall of dots; always visible on
                      touch, where there is no hover to reveal it. */}
                  {mine && !m.id.startsWith('temp-') && (
                    <MessageMenu
                      onShowDetails={() => setMenuMessage(m)}
                      onDelete={() => setMenuMessage(m)}
                    />
                  )}
                </div>
              )
            })
          )}
          <div ref={bottomRef} className="mt-auto" />
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {/* A picked image gets the full-screen sheet, not a thumbnail strip —
            a 20px square is not enough to confirm the right photo. The sheet
            stays up until it is sent or dismissed. */}
        {attachments.length > 0 && previewOpen && (
          <AttachmentPreview
            images={attachments}
            caption={caption}
            onCaptionChange={setCaption}
            onClose={() => {
              setPreviewOpen(false)
              setCaption('')
              setAttachments([])
            }}
            onSend={() => void handleSend()}
            onRemove={(i) =>
              setAttachments((prev) => prev.filter((_, idx) => idx !== i))
            }
            onAddMore={() => fileInputRef.current?.click()}
            canAddMore={attachments.length < MAX_IMAGES}
            sending={sending || uploading}
          />
        )}

        {menuMessage && (
          <MessageDetails
            sentAt={menuMessage.created_at}
            hasImage={imageUrlsOf(menuMessage).length > 0}
            deleting={deleting}
            onClose={() => (deleting ? null : setMenuMessage(null))}
            onDelete={() => void handleDelete(menuMessage)}
          />
        )}

        {/* Lightbox for an image that is already in the thread. */}
        {lightbox && (
          <ImageLightbox
            urls={lightbox.urls}
            index={lightbox.index}
            onIndexChange={(index) => setLightbox((prev) => (prev ? { ...prev, index } : prev))}
            onClose={() => setLightbox(null)}
          />
        )}

        {/* Composer — a single pill bar pinned to the bottom. */}
        <div className="shrink-0 mt-2 flex items-center gap-2 rounded-full border border-plum/10 bg-[#EDEBFB] p-1.5 pl-2">
          <button
            type="button"
            onClick={() => {
              setCameraError('')
              setCameraOpen(true)
            }}
            disabled={sending || uploading}
            aria-label="Take a photo"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum/25 text-plum disabled:opacity-40"
          >
            <Camera size={18} />
          </button>

          {/* Storage picker. Lives in the DOM (not a ref-triggered element)
              so the browser opens the standard photos/files chooser. */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            aria-label="Choose images"
            className="hidden"
            onChange={(e) => {
              void pickFiles(e.target.files)
              // Reset so picking the same file twice still fires onChange.
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
            aria-label="Send an image"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-plum disabled:opacity-40"
          >
            <ImageIcon size={18} />
          </button>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Message..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[15px] text-charcoal outline-none placeholder:text-plum/45"
            disabled={sending}
          />

          <button
            onClick={handleSend}
            disabled={sending || uploading || (!message.trim() && attachments.length === 0)}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum text-white shadow-[0_6px_18px_rgba(74,44,94,0.28)] transition-transform active:scale-95 disabled:opacity-40"
          >
            {sending || uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Camera capture sheet */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-charcoal/92 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 text-cream">
            <p className="font-heading text-lg font-bold">Take a photo</p>
            <button
              type="button"
              onClick={() => setCameraOpen(false)}
              aria-label="Close camera"
              className="rounded-full p-2 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative flex-1 overflow-hidden bg-black">
            {cameraError ? (
              <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl bg-charcoal/80 p-4 text-center text-sm text-cream">
                {cameraError}
              </p>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex items-center justify-center gap-6 p-6">
            <button
              type="button"
              onClick={() => {
                setCameraOpen(false)
                fileInputRef.current?.click()
              }}
              className="flex items-center gap-2 rounded-full border border-cream/30 px-4 py-3 text-sm font-semibold text-cream"
            >
              <ImageIcon size={16} /> Gallery
            </button>
            <button
              type="button"
              onClick={capture}
              disabled={!!cameraError}
              aria-label="Capture photo"
              className="h-16 w-16 rounded-full border-4 border-cream bg-plum transition-transform active:scale-95 disabled:opacity-40"
            />
            <span className="w-[74px]" />
          </div>
        </div>
      )}
      </div>
    </>
  )
}


