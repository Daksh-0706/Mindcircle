'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Skeleton from '../../../../components/ui/Skeleton'
import { Camera, ChevronLeft, Image as ImageIcon, Loader2, Send, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '../../../../lib/dates'
import { roomEmoji } from '../../../../lib/alias'
import NotoEmoji from '../../../../components/ui/NotoEmoji'
import { AppNav } from '../../../../components/layout/AppNavContext'

type ChatMessage = {
  id: string
  room_id?: string | null
  sender_id: string
  receiver_id?: string | null
  content: string
  /** Storage path, e.g. "<uid>/<file>.jpg" — not directly loadable. */
  media_url?: string | null
  /** Short-lived signed URL produced by the API for `media_url`. */
  image_url?: string | null
  created_at: string
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
  const [attachment, setAttachment] = useState<{ preview: string; blob: Blob } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
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

  const pickFile = async (file: File | undefined | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only images can be sent.')
      return
    }
    try {
      const { dataUrl, blob } = await compressImage(file)
      setAttachment({ preview: dataUrl, blob })
      setError('')
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
        if (blob) void pickFile(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
    setCameraOpen(false)
  }

  /** Uploads to the private chat-media bucket and returns the stored path. */
  const uploadAttachment = async () => {
    if (!attachment) return null
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Please sign in again.')

    // Random name: the path must not be guessable from message ids.
    const path = `${user.id}/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage
      .from('chat-media')
      .upload(path, attachment.blob, { contentType: 'image/jpeg' })
    if (error) throw new Error(`Upload failed: ${error.message}`)
    return path
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

  const handleSend = async () => {
    const content = message.trim()
    const pendingImage = attachment
    if ((!content && !pendingImage) || sending || uploading || isRoom === null) return

    setSending(true)
    setMessage('')
    if (pendingImage) setUploading(true)
    if (pendingImage) setAttachment(null)

    const tempId = `temp-${Date.now()}`
    if (myId) {
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender_id: myId,
          content,
          created_at: new Date().toISOString(),
          // Show the local copy straight away; the saved row replaces it.
          image_url: pendingImage?.preview ?? null,
          media_url: null,
        },
      ])
    }

    try {
      const mediaPath = pendingImage ? await uploadAttachment() : null

      const res = isRoom
        ? await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              room_id: peerId,
              content,
              ...(mediaPath ? { media_url: mediaPath } : {}),
            }),
          })
        : await fetch('/api/chat/dm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receiver_id: peerId,
              content,
              ...(mediaPath ? { media_url: mediaPath } : {}),
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
                  { ...saved, image_url: mediaPath ? (m.image_url ?? null) : null }
                : m,
            )
          : prev.filter((m) => m.id !== tempId),
      )
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setMessage(content)
      // Give the photo back rather than losing it to a failed upload.
      if (pendingImage) setAttachment(pendingImage)
      setError(e instanceof Error ? e.message : 'Message could not be sent.')
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  return (
    <>
      {/* Full-screen thread: suppress the app's mobile header and bottom nav
          so the conversation owns the whole viewport. */}
      <AppNav showBack showMobileHeader={false} showBottomNav={false} />
      <div className="flex h-[calc(100dvh-4.5rem)] flex-col lg:h-[calc(100dvh-3rem)]">
      {/* Chat header — back arrow, ring avatar, name. Nothing else: no call,
          video, sticker or attach affordances on this surface. */}
      <div className="mb-4 flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          aria-label={isRoom ? 'Back to circles' : 'Back to chats'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-charcoal/80 transition-colors hover:bg-plum/5 hover:text-plum"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-plum/10 ring-2 ring-plum">
          <NotoEmoji emoji={isRoom ? roomEmoji(roomName) : peerAvatar} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-[19px] font-extrabold leading-tight text-charcoal">
            {roomName}
          </h1>
          <p className="truncate text-[13px] text-warm-gray">
            {isRoom
              ? `Anonymous room${memberCount !== null ? ` · ${memberCount} here` : ''}`
              : 'Mindcircle user'}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Messages */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-1 py-2">
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
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={
                      mine
                        ? 'max-w-[80%] rounded-[18px] rounded-br-md bg-plum px-3.5 py-2.5 text-[14px] leading-6 text-cream shadow-[0_2px_8px_rgba(74,44,94,0.14)]'
                        : 'max-w-[80%] rounded-[18px] rounded-bl-md border border-warm-gray-lighter/60 bg-white px-3.5 py-2.5 text-[14px] leading-6 text-charcoal shadow-[0_2px_8px_rgba(74,44,94,0.06)]'
                    }
                  >
                    {m.image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={m.image_url}
                        alt="Shared image"
                        className="-mx-1 mb-1.5 max-h-64 w-[calc(100%+0.5rem)] rounded-[14px] object-cover"
                      />
                    )}
                    {m.content && (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    )}
                    <p
                      className={
                        mine
                          ? 'mt-0.5 text-right text-[10px] text-cream/60'
                          : 'mt-0.5 text-right text-[10px] text-warm-gray'
                      }
                    >
                      {timeLabel(m.created_at)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {/* Picked image, shown above the composer with a way to discard it. */}
        {attachment && (
          <div className="mt-2 flex items-end gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.preview}
              alt="Image ready to send"
              className="h-20 w-20 rounded-[14px] object-cover shadow-[0_2px_10px_rgba(74,44,94,0.14)]"
            />
            <button
              type="button"
              onClick={() => setAttachment(null)}
              aria-label="Remove image"
              className="rounded-full bg-[#F1EDFB] px-3 py-1.5 text-[12px] font-bold text-charcoal/70"
            >
              Remove
            </button>
          </div>
        )}

        {/* Composer — a single pill bar pinned to the bottom. */}
        <div className="mt-3 flex items-center gap-2 rounded-full border border-plum/10 bg-[#EDEBFB] p-1.5 pl-2">
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
            aria-label="Choose an image"
            className="hidden"
            onChange={(e) => {
              void pickFile(e.target.files?.[0])
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
            disabled={sending || uploading || (!message.trim() && !attachment)}
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


