'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppNav } from '../../../components/layout/AppNavContext'
import { EnergySlider } from '../../../components/ui/EnergySlider'
import { SupportSelect } from '../../../components/ui/SupportSelect'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'

/**
 * What someone might need in the moment. Deliberately concrete and
 * low-commitment — most of these are things they can do right now without
 * talking to anyone, and professional support is one option rather than the
 * loudest one.
 */
const SUPPORT_OPTIONS = [
  'A quiet moment',
  'A gentle walk outside',
  'Music or something creative',
  'Someone to talk to',
  'Time with someone I trust',
  'Just to vent — no advice needed',
  'Professional support',
]

export default function AssessmentPage() {
  const router = useRouter()
  const [energy, setEnergy] = useState(5)
  const [support, setSupport] = useState(SUPPORT_OPTIONS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const score = Math.max(1, Math.min(5, Math.round(energy / 2)))
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_score: score,
          mood_emoji: score >= 4 ? '😌' : score === 3 ? '😐' : '😔',
          note: `Check-in: energy ${energy}/10 · what would help: ${support}`,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error || 'Could not save your check-in. Please try again.')
      }
      setDone(true)
      setTimeout(() => router.push('/app'), 1400)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppNav title="Check-in" showBack />
      <div className="page-enter mx-auto flex max-w-2xl justify-center pb-8">
        <div className="w-full rounded-[20px] border border-warm-gray-lighter bg-white p-8 text-center">
          {done ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
                <Check size={28} />
              </div>
              <h1 className="mt-6 font-heading text-3xl font-bold text-plum">Saved. Thank you.</h1>
              <p className="mt-3 text-sm text-warm-gray">Taking you back to your dashboard…</p>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/15 text-sage">
                <Sparkles size={28} />
              </div>
              <p className="mt-6 text-sm text-warm-gray">A 2-minute check-in</p>
              <h1 className="mt-1 font-heading text-3xl font-bold text-plum">How are things, really?</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-charcoal">
                A few gentle questions can help you notice what you need today. There are no wrong answers.
              </p>
              <div className="mt-8 space-y-5 text-left">
                <div className="block text-sm font-medium">
                  How much energy do you have today?{' '}
                  <span className="text-warm-gray">({energy}/10)</span>
                  <EnergySlider value={energy} onChange={setEnergy} className="mt-3" />
                </div>
                <div className="block text-sm font-medium">
                  <label htmlFor="support">What would support you right now?</label>
                  <SupportSelect
                    id="support"
                    options={SUPPORT_OPTIONS}
                    value={support}
                    onChange={setSupport}
                    className="mt-3"
                  />
                </div>
              </div>
              {error && (
                <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-left text-sm text-danger">{error}</p>
              )}
              <div className="mt-8 flex justify-between">
                <button onClick={() => router.push('/app')} className="inline-flex items-center gap-2 text-sm text-warm-gray">
                  <ArrowLeft size={16} /> Exit
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-plum px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save check-in'} <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
