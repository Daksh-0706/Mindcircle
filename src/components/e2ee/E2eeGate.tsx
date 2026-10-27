'use client'

/**
 * The gate every private screen renders through.
 *
 * Not-setup → walk the user through the 12 words (shown once, confirmed in
 * writing). Locked → ask for the phrase. Unlocked → children.
 *
 * The words are deliberately never shown again after setup; the rotate flow
 * in Settings issues a *new* phrase, it cannot recover the old one. That is
 * not a UX oversight, it is the property that keeps the operator out.
 */

import { useEffect, useState } from 'react'
import { Check, Copy, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import { useE2ee } from '@/lib/e2ee/useE2ee'

export default function E2eeGate({ children }: { children: React.ReactNode }) {
  const e2ee = useE2ee()

  useEffect(() => {
    if (e2ee.status === 'unknown') void e2ee.init()
  }, [e2ee])

  if (e2ee.status === 'unknown') {
    return (
      <div className="space-y-3">
        <Skeleton variant="rect" height={120} />
        <Skeleton variant="rect" height={260} />
      </div>
    )
  }

  if (e2ee.status === 'unavailable') {
    return (
      <div className="rounded-[24px] border border-warm-gray-lighter bg-white p-8 text-center">
        <p className="font-heading text-[20px] font-bold text-charcoal">Private space unavailable</p>
        <p className="mt-2 text-sm text-warm-gray">{e2ee.error ?? 'Encryption could not be reached.'}</p>
        <button
          onClick={() => void e2ee.init()}
          className="mt-5 rounded-full bg-plum px-6 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    )
  }

  if (e2ee.status === 'not-setup') {
    return <SetupPanel />
  }

  if (e2ee.status === 'locked') {
    return <UnlockPanel />
  }

  return <>{children}</>
}

function SetupPanel() {
  const e2ee = useE2ee()
  const [words, setWords] = useState<string[] | null>(null)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(true)

  const start = async () => {
    try {
      const next = await e2ee.startSetup()
      setWords(next)
    } catch {
      // error surfaces through the snapshot
    }
  }

  const confirm = async () => {
    try {
      await e2ee.confirmSetup()
    } catch {
      // error surfaces through the snapshot
    }
  }

  return (
    <section className="rounded-[24px] border border-warm-gray-lighter bg-white p-6 shadow-[0px_4px_16px_#4A2C5E08] sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFEAFB]">
          <ShieldCheck size={22} className="text-plum" />
        </span>
        <div>
          <h2 className="font-display text-[22px] font-bold text-charcoal">Turn on end-to-end encryption</h2>
          <p className="text-sm text-warm-gray">One-time setup — about a minute.</p>
        </div>
      </div>

      {!words ? (
        <>
          <ul className="mt-5 space-y-2.5 text-[15px] leading-6 text-charcoal/90">
            <li className="flex gap-2.5"><Lock size={17} className="mt-1 shrink-0 text-plum" />Your journal and private chats will be encrypted on this device before they leave it. The server only ever stores unreadable ciphertext.</li>
            <li className="flex gap-2.5"><Lock size={17} className="mt-1 shrink-0 text-plum" />You will get a 12-word phrase. It is the only key to your data — we cannot reset or recover it.</li>
            <li className="flex gap-2.5"><Lock size={17} className="mt-1 shrink-0 text-plum" />New phone or browser? Enter the phrase once and everything opens again.</li>
          </ul>
          {e2ee.error && <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{e2ee.error}</p>}
          <button
            onClick={start}
            disabled={e2ee.busy}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(91,75,158,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {e2ee.busy ? 'Preparing…' : 'Set up encryption'}
          </button>
        </>
      ) : (
        <>
          <p className="mt-5 rounded-xl bg-[#FBEEDC] px-4 py-3 text-sm leading-6 text-[#7A4A1E]">
            Write these 12 words on paper, in order. This screen is the only place they will ever appear.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {words.map((w, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-warm-gray-lighter bg-[#FBF7F2] px-3 py-2.5">
                <span className="w-5 text-xs font-bold text-warm-gray">{i + 1}</span>
                <span className={revealed ? 'font-heading text-[15px] font-bold text-charcoal' : 'font-heading text-[15px] font-bold text-charcoal blur-[5px] select-none'}>
                  {w}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={() => setRevealed((r) => !r)} className="inline-flex items-center gap-1.5 rounded-full border border-warm-gray-lighter bg-white px-4 py-2 text-xs font-semibold text-charcoal">
              {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
              {revealed ? 'Hide' : 'Reveal'}
            </button>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(words.join(' '))
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1500)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-warm-gray-lighter bg-white px-4 py-2 text-xs font-semibold text-charcoal"
            >
              {copied ? <Check size={14} className="text-sage-dark" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-charcoal">
            <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5 h-5 w-5 accent-plum" />
            <span>I wrote the words down and keep them somewhere safe. I understand this phrase cannot be recovered.</span>
          </label>
          {e2ee.error && <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{e2ee.error}</p>}
          <button
            onClick={confirm}
            disabled={!saved || e2ee.busy}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(91,75,158,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {e2ee.busy ? 'Enabling…' : 'Enable encryption'}
          </button>
        </>
      )}
    </section>
  )
}

function UnlockPanel() {
  const e2ee = useE2ee()
  const [phrase, setPhrase] = useState('')

  const unlock = async () => {
    await e2ee.unlockWithPhrase(phrase)
  }

  return (
    <section className="rounded-[24px] border border-warm-gray-lighter bg-white p-6 shadow-[0px_4px_16px_#4A2C5E08] sm:p-7">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFEAFB]">
          <Lock size={22} className="text-plum" />
        </span>
        <div>
          <h2 className="font-display text-[22px] font-bold text-charcoal">Your private space is locked</h2>
          <p className="text-sm text-warm-gray">Enter your 12-word recovery phrase to open it on this device.</p>
        </div>
      </div>
      <textarea
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            void unlock()
          }
        }}
        placeholder="word1 word2 … word12"
        rows={2}
        className="mt-5 w-full rounded-2xl border border-warm-gray-lighter bg-[#FBF7F2] p-4 font-heading text-[16px] text-charcoal outline-none placeholder:text-warm-gray-light"
      />
      {e2ee.error && <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{e2ee.error}</p>}
      <button
        onClick={unlock}
        disabled={e2ee.busy || phrase.trim().split(/\s+/).length !== 12}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5B4B9E] to-[#7C5FA8] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_16px_rgba(91,75,158,0.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
      >
        {e2ee.busy ? 'Unlocking…' : 'Unlock'}
      </button>
      <p className="mt-3 text-xs text-warm-gray">Lost the words? Nobody can restore this data — that is what makes it private.</p>
    </section>
  )
}
