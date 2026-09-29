'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppNav } from '../../../../components/layout/AppNavContext'
import Skeleton from '../../../../components/ui/Skeleton'
import { LockKeyhole, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { aliasFor, roomDescription, roomEmoji } from '../../../../lib/alias'

type ChatMessage = {
  id: string
  room_id?: string | null
  sender_id: string
  receiver_id?: string | null
  content: string
  created_at: string
}

const MAX_CHARS = 500

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
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
  const [memberCount, setMemberCount] = useState<number | null>(null)
  const [isMember, setIsMember] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [myId, setMyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
        setIsMember(room.is_member)
        const msgsRes = await fetch(`/api/chat/messages?room_id=${encodeURIComponent(peerId)}`)
        if (!msgsRes.ok) {
          const errJson = await msgsRes.json().catch(() => null)
          throw new Error(errJson?.error || 'Could not load messages')
        }
        const msgsJson = await msgsRes.json()
        setMessages((msgsJson.data ?? []) as ChatMessage[])
      } else {
        setIsRoom(false)
        setRoomName('Anonymous')
        const dmRes = await fetch(`/api/chat/dm?receiver_id=${encodeURIComponent(peerId)}`)
        if (!dmRes.ok) throw new Error('Could not load messages')
        const dmJson = await dmRes.json()
        // Dead conversation (the other account was deleted) — bounce to the
        // chats list instead of showing a thread that can never work.
        if (dmJson.peer_exists === false) {
          router.replace('/app/chats')
          return
        }
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

  const handleSend = async () => {
    const content = message.trim().slice(0, MAX_CHARS)
    if (!content || sending || isRoom === null) return
    setSending(true)
    setMessage('')

    const tempId = `temp-${Date.now()}`
    if (myId) {
      setMessages((prev) => [
        ...prev,
        { id: tempId, sender_id: myId, content, created_at: new Date().toISOString() },
      ])
    }

    try {
      const res = isRoom
        ? await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_id: peerId, content }),
          })
        : await fetch('/api/chat/dm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: peerId, content }),
          })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Message could not be sent.')
      }
      const json = await res.json()
      const saved = (json.data?.[0] ?? null) as ChatMessage | null
      setMessages((prev) =>
        saved
          ? prev.map((m) => (m.id === tempId ? saved : m))
          : prev.filter((m) => m.id !== tempId),
      )
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setMessage(content)
      setError(e instanceof Error ? e.message : 'Message could not be sent.')
    } finally {
      setSending(false)
    }
  }

  const handleLeave = async () => {
    if (!isRoom || leaving) return
    setLeaving(true)
    try {
      await fetch(`/api/chat?room_id=${encodeURIComponent(peerId)}`, { method: 'DELETE' })
      router.push('/app/chats')
    } catch {
      setLeaving(false)
    }
  }

  // Deterministic per-sender labels: "You" for self, A1/A2… for others.
  const senderLabels = new Map<string, string>()
  let counter = 0
  for (const m of messages) {
    if (m.sender_id === myId) continue
    if (!senderLabels.has(m.sender_id)) {
      counter += 1
      senderLabels.set(m.sender_id, `A${counter}`)
    }
  }

  return (
    <>
      <AppNav title={roomName} showBack />
      <div className="page-enter flex flex-col items-stretch gap-6 pb-8 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Room header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[19px] bg-cream-dark text-lg">
                {isRoom ? roomEmoji(roomName) : '💬'}
              </span>
              <div>
                <h1 className="font-heading text-lg font-bold text-plum">{roomName}</h1>
                <p className="text-xs text-warm-gray">
                  {isRoom
                    ? `Anonymous room${memberCount !== null ? ` · ${memberCount} here` : ''}`
                    : 'Anonymous direct message'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-[420px] flex-1 space-y-4 rounded-[20px] border border-warm-gray-lighter bg-white p-6 lg:p-8">
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
                if (mine) {
                  return (
                    <div key={m.id} className="flex flex-col items-end">
                      <div className="max-w-[85%] rounded-tl-2xl rounded-br rounded-tr-2xl rounded-bl-2xl bg-plum px-4 py-3 text-sm leading-6 text-cream">
                        {m.content}
                      </div>
                      <span className="mt-1 text-[11px] text-warm-gray">You · {timeLabel(m.created_at)}</span>
                    </div>
                  )
                }
                return (
                  <div key={m.id} className="flex items-start gap-2.5">
                    <span className="flex h-8 shrink-0 items-center rounded-2xl bg-cream-dark px-2.5 text-xs font-bold text-charcoal">
                      {senderLabels.get(m.sender_id) ?? 'A'}
                    </span>
                    <div className="min-w-0">
                      <div className="w-fit max-w-full rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl bg-cream-dark px-4 py-3 text-sm leading-6 text-charcoal">
                        {m.content}
                      </div>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-warm-gray">
                        Anonymous · {timeLabel(m.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}

          {/* Composer */}
          <div className="mt-4 rounded-[20px] bg-cream-dark/60 p-5">
            <p className="mb-3 rounded-xl bg-cream-dark py-2 pl-6 text-xs text-charcoal">
              🔒 Everything shared here is private and entirely anonymous. Support one another with kindness.
            </p>
            <div className="flex items-center gap-4">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your safe reflection here..."
                className="flex-1 rounded-lg border border-warm-gray-lighter bg-white px-4 py-3 text-sm text-charcoal outline-none placeholder:text-warm-gray focus:border-plum"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="btn-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['❤️', '😌', '🙌', '🫂'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMessage((prev) => (prev + ' ' + emoji).trim().slice(0, MAX_CHARS))}
                    className="rounded-full border border-warm-gray-lighter bg-white px-3 py-1.5 text-xs"
                    aria-label={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-warm-gray">{message.length} / {MAX_CHARS} characters</span>
            </div>
          </div>
        </div>

        {/* Right rail — About this room */}
        <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
          <div className="flex flex-col items-center rounded-2xl border border-warm-gray-lighter bg-white p-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-[32px] bg-cream-dark text-[32px]">
              {isRoom ? roomEmoji(roomName) : '💬'}
            </span>
            <h2 className="mt-4 font-heading text-xl font-bold text-plum">{roomName}</h2>
            <p className="mt-1 text-[13px] text-warm-gray">
              {memberCount !== null ? `${memberCount} members active now` : 'Anonymous conversation'}
            </p>
          </div>

          {isRoom && (
            <>
              <div className="h-px bg-warm-gray-lighter" />
              <div>
                <p className="mb-2 text-xs font-bold text-warm-gray">About this room</p>
                <p className="text-[13px] leading-6 text-charcoal">{roomDescription(roomName)} Completely unrecorded.</p>
              </div>
              {isMember && (
                <button
                  onClick={handleLeave}
                  disabled={leaving}
                  className="w-full rounded-full border border-danger/25 bg-danger/5 py-3 text-sm font-bold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                >
                  {leaving ? 'Leaving…' : 'Leave room'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}


