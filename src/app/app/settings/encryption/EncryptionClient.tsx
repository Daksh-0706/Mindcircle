'use client'

/**
 * Privacy & Security → End-to-End Encryption.
 *
 * Shows live status, seals this device (lock), and can issue a NEW recovery
 * phrase — the old words are never recoverable, so rotation is the only way
 * back for someone who lost their copy.
 */

import { useEffect, useState } from 'react'
import { AppNav } from '@/components/layout/AppNavContext'
import Skeleton from '@/components/ui/Skeleton'
import { Check, Copy, Lock, ShieldCheck, Unlock } from 'lucide-react'
import { useE2ee } from '@/lib/e2ee/useE2ee'

export default function EncryptionClient() {
  const e2ee = useE2ee()
  const [rotated, setRotated] = useState<string[] | null>(null)
  const [copied, setCopied] = useState(false)
  const [test, setTest] = useState<'idle' | 'running' | 'ok' | 'fail'>('idle')
  const [rotateError, setRotateError] = useState('')

  useEffect(() => {
    if (e2ee.status === 'unknown') void e2ee.init()
  }, [e2ee])

  const runTest = async () => {
    setTest('running')
    setTest((await e2ee.selfTest()) ? 'ok' : 'fail')
  }

  const rotate = async () => {
    setRotateError('')
    try {
      setRotated(await e2ee.rotatePhrase())
    } catch (e) {
      setRotateError(e instanceof Error ? e.message : 'Could not create a new phrase.')
    }
  }

  const statusLabel =
    e2ee.status === 'unlocked' ? 'Unlocked on this device'
      : e2ee.status === 'locked' ? 'Locked — enter your phrase to use it here'
        : e2ee.status === 'not-setup' ? 'Not set up yet'
          : e2ee.status === 'unknown' ? 'Checking…'
            : 'Service unreachable'

  return (
    <>
      <AppNav title="End-to-End Encryption" />
      <div className="page-enter mx-auto max-w-2xl space-y-5 pb-10">
        <section className="rounded-[24px] border border-warm-gray-lighter bg-white p-6 shadow-[0px_4px_16px_#4A2C5E08]">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3EA]">
              <ShieldCheck size={24} className="text-[#5F7F52]" />
            </span>
            <div>
              <h1 className="font-display text-[22px] font-bold text-charcoal">End-to-end encryption</h1>
              <p className="text-sm text-warm-gray">Journal · private chats · stories</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#FBF7F2] px-4 py-3">
              <dt className="text-warm-gray">Status</dt>
              <dd className="font-semibold text-charcoal">{statusLabel}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#FBF7F2] px-4 py-3">
              <dt className="text-warm-gray">Key derivation</dt>
              <dd className="font-semibold text-charcoal">PBKDF2-SHA256 · 600,000 iterations</dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#FBF7F2] px-4 py-3">
              <dt className="text-warm-gray">Cipher</dt>
              <dd className="font-semibold text-charcoal">AES-256-GCM + P-256 ECDH</dd>
            </div>
          </dl>

          <p className="mt-4 text-[13px] leading-6 text-warm-gray">
            Content is sealed on your device before it is sent. Neither the server nor MindCircle can read it.
            The 12-word phrase is the only key — it cannot be reset, and support cannot recover it.
          </p>

          {e2ee.status === 'unlocked' && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => void e2ee.lock()}
                className="inline-flex items-center gap-2 rounded-full border border-warm-gray-lighter bg-white px-5 py-3 text-[14px] font-semibold text-charcoal"
              >
                <Lock size={15} /> Lock on this device
              </button>
              <button
                onClick={runTest}
                disabled={test === 'running'}
                className="inline-flex items-center gap-2 rounded-full border border-warm-gray-lighter bg-white px-5 py-3 text-[14px] font-semibold text-charcoal disabled:opacity-50"
              >
                {test === 'ok' ? <Check size={15} className="text-sage-dark" /> : <Unlock size={15} />}
                {test === 'running' ? 'Testing…' : 'Run self-test'}
              </button>
            </div>
          )}
          {test === 'ok' && <p className="mt-3 text-[13px] font-semibold text-sage-dark">Self-test passed — a sealed message opened back to its original text.</p>}
          {test === 'fail' && <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">Self-test failed. Contact support before writing anything sensitive.</p>}
        </section>

        {e2ee.status === 'locked' && (
          <section className="rounded-[24px] border border-warm-gray-lighter bg-[#FBEEDC]/60 p-6">
            <p className="text-[14px] leading-6 text-[#7A4A1E]">
              This device does not hold your key. Open the Journal to enter your 12-word phrase — once entered, it stays unlocked here.
            </p>
          </section>
        )}

        {e2ee.status === 'not-setup' && (
          <section className="rounded-[24px] border border-warm-gray-lighter bg-[#FBEEDC]/60 p-6">
            <p className="text-[14px] leading-6 text-[#7A4A1E]">
              Encryption is not set up on this account yet. Open the Journal once — setup runs there.
            </p>
          </section>
        )}

        {rotated && (
          <section className="rounded-[24px] border border-warm-gray-lighter bg-white p-6 shadow-[0px_4px_16px_#4A2C5E08]">
            <h2 className="font-display text-[20px] font-bold text-charcoal">Your new phrase</h2>
            <p className="mt-1 text-[13px] text-warm-gray">Replaces the old words. Write them down — this is the only display.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {rotated.map((w, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl border border-warm-gray-lighter bg-[#FBF7F2] px-3 py-2.5">
                  <span className="w-5 text-xs font-bold text-warm-gray">{i + 1}</span>
                  <span className="font-heading text-[15px] font-bold text-charcoal">{w}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(rotated.join(' '))
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1500)
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-warm-gray-lighter bg-white px-5 py-2.5 text-[13px] font-semibold text-charcoal"
            >
              {copied ? <Check size={14} className="text-sage-dark" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy phrase'}
            </button>
          </section>
        )}

        {e2ee.status === 'unlocked' && !rotated && (
          <section className="rounded-[24px] border border-warm-gray-lighter bg-white p-6">
            <h2 className="font-heading text-[17px] font-bold text-charcoal">Lost your recovery phrase?</h2>
            <p className="mt-1 text-[13px] leading-6 text-warm-gray">
              You can generate a new one. Your data is untouched — only the envelope that protects it changes.
            </p>
            {rotateError && <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{rotateError}</p>}
            <button
              onClick={rotate}
              disabled={e2ee.busy}
              className="mt-4 rounded-full bg-plum px-6 py-3 text-[14px] font-semibold text-white disabled:opacity-50"
            >
              {e2ee.busy ? 'Working…' : 'Create a new phrase'}
            </button>
          </section>
        )}

        {e2ee.status === 'unknown' && <Skeleton variant="rect" height={120} />}
      </div>
    </>
  )
}
