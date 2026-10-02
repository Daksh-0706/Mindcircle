'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '../../../../components/layout/AppNavContext'
import { ImagePlus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MOOD_EMOJIS } from '@/lib/constants'

export default function CreateStoryPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('mindcircle-story-photo')
    if (!stored) return
    fetch(stored)
      .then((res) => res.blob())
      .then((blob) => {
        setPhoto(stored)
        setPhotoFile(new File([blob], 'story.jpg', { type: 'image/jpeg' }))
      })
      .catch(() => undefined)
  }, [])

  const handleFile = (file: File | undefined) => {
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  const handleShare = async () => {
    if (!text.trim() || sharing) return
    setSharing(true)
    setError('')
    try {
      let mediaUrl: string | null = null

      if (photoFile) {
        const supabase = createClient()
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) throw new Error('Please sign in again.')
        const ext = photoFile.name.includes('.') ? photoFile.name.split('.').pop() : 'jpg'
        const path = `${userData.user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('story-media')
          .upload(path, photoFile, { contentType: photoFile.type })
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`)
        const { data: urlData } = supabase.storage.from('story-media').getPublicUrl(path)
        mediaUrl = urlData.publicUrl
      }

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim(), media_url: mediaUrl, mood_emoji: mood }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not share your story. Please try again.')
      }
      sessionStorage.removeItem('mindcircle-story-photo')
      router.push('/app/connect')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSharing(false)
    }
  }

  return (
    <>
      <AppNav title="Create a story" showBack />
      <div className="page-enter mx-auto max-w-3xl space-y-6 pb-8">
        <div>
          <h1 className="font-heading text-[32px] font-bold text-plum">Share a moment</h1>
          <p className="mt-1 text-sm text-charcoal">Share only what feels right — your story can help someone feel less alone.</p>
        </div>

        <div
          className="rounded-[20px] p-7 text-cream"
          style={{ background: 'linear-gradient(180deg, #4A2C5E, #C45D3E)' }}
        >
          {photo && <img src={photo} alt="Your captured story" className="mb-5 max-h-72 w-full rounded-2xl object-cover" />}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write an anonymous thought…"
            className="min-h-[240px] w-full resize-none bg-transparent font-heading text-2xl leading-tight text-cream outline-none placeholder:text-cream/50"
          />
          {error && (
            <p role="alert" className="mb-4 rounded-xl bg-charcoal/60 px-4 py-3 text-sm text-cream">{error}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-cream/20 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-full bg-cream/15 p-3 transition-colors hover:bg-cream/25" aria-label="Attach a photo">
                <ImagePlus size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
              <div className="flex flex-wrap items-center gap-1 rounded-full bg-cream/15 px-2 py-1.5" role="group" aria-label="How do you feel?">
                {MOOD_EMOJIS.map((m) => {
                  const isSelected = mood === m.emoji
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(isSelected ? null : m.emoji)}
                      aria-label={m.label}
                      aria-pressed={isSelected}
                      title={m.label}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
                        isSelected ? 'scale-110 bg-cream/30 ring-2 ring-cream' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.image} alt="" draggable={false} className="h-6 w-6 select-none" />
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              onClick={handleShare}
              disabled={sharing || !text.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-[13px] font-bold text-plum disabled:opacity-50"
            >
              {sharing && <Loader2 size={15} className="animate-spin" />}
              {sharing ? 'Sharing…' : 'Share anonymously'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-warm-gray">🔒 Stories are anonymous, seen by the community, and disappear after 24 hours.</p>
      </div>
    </>
  )
}
