'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { UserPlus, Loader2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type PendingPerson = {
  id?: string
  alias?: string | null
  name?: string | null
  avatar_emoji?: string | null
}

type PendingConnection = {
  id: string
  connection_id?: string
  direction?: 'incoming' | 'outgoing' | 'accepted'
  person?: PendingPerson | null
}

interface PendingRequestsDropdownProps {
  /**
   * Class for the positioning wrapper. Defaults to `relative` so the panel
   * anchors under the button; the mobile header passes `""` so the panel
   * anchors to the whole right-hand button group instead (keeps it inside
   * the viewport next to the notification bell).
   */
  rootClassName?: string
}

/**
 * The round "add person" button with the pending connection requests panel.
 * Shared by the desktop TopBar and the phone MobileHeader.
 */
export function PendingRequestsDropdown({ rootClassName = 'relative' }: PendingRequestsDropdownProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PendingConnection[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // The loading/error resets live in the toggle handler (an event), not here:
  // setting state synchronously inside an effect causes a second render pass
  // before the fetch has even started.
  useEffect(() => {
    let active = true
    if (!open) return
    fetch('/api/connections?status=pending')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active) setItems((json?.data ?? []) as PendingConnection[])
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const doAction = async (actionName: string, connectionId: string, isIncoming: boolean) => {
    console.log(`[PendingRequests] ${actionName} | connection_id=${connectionId ?? 'missing'} | isIncoming=${isIncoming}`)
    try {
      const method = isIncoming && actionName === 'Accept' ? 'PATCH' : 'DELETE'
      const res = await fetch('/api/connections', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_id: connectionId }),
      })
      let bodyText = ''
      try {
        bodyText = await res.text()
      } catch {
        // ignore
      }
      console.log(`[PendingRequests] ${actionName} response status=${res.status} ok=${res.ok} body=${bodyText.slice(0, 300)}`)
      if (!res.ok) {
        console.warn(`[PendingRequests] ${actionName} failed: status=${res.status} body=${bodyText.slice(0, 300)}`)
        throw new Error(`Could not ${actionName.toLowerCase()} the request.`)
      }
      const refreshed = await fetch('/api/connections?status=pending')
      if (refreshed.ok) {
        const json = await refreshed.json()
        setItems((json?.data ?? []) as PendingConnection[])
      }
      window.dispatchEvent(new CustomEvent('connections-changed'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the request.')
      console.warn('[PendingRequests] action error:', e)
      setOpen(false)
    }
  }

  return (
    <div className={rootClassName} ref={ref}>
      <button
        type="button"
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next) {
            setLoading(true)
            setError('')
          }
        }}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FBEAF2] to-[#F6E3EE] shadow-[0_4px_16px_rgba(74,44,94,0.12)] transition-transform hover:-translate-y-0.5 active:scale-95"
        aria-label="Pending connection requests"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <UserPlus size={18} className="text-[#2A1B3D]" />
        {items.length > 0 && (
          <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8506E] px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,340px)] overflow-hidden rounded-xl border border-warm-gray-lighter bg-white shadow-[0_8px_30px_rgba(74,44,94,0.18)]">
          <div className="flex items-center justify-between border-b border-warm-gray-lighter px-4 py-3">
            <h3 className="font-heading text-[13px] font-bold text-[#3D2A52]">Pending Requests</h3>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setLoading(false)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-warm-gray transition-colors hover:bg-plum/5"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={20} className="animate-spin text-plum" />
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-center text-xs text-danger">{error}</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <UserPlus size={24} className="mx-auto text-warm-gray/50" />
                <p className="mt-2 text-xs font-medium text-charcoal">No pending requests</p>
                <p className="mt-0.5 text-[10px] text-warm-gray">People will send you requests here.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {items.map((conn) => {
                  const isIncoming = conn.direction === 'incoming'
                  return (
                    <li key={conn.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-plum/[0.03]">
                      <Link
                        href={`/app/profile/${conn.person?.id ?? conn.id}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFEAFB] text-base transition-colors hover:bg-[#E4D9F2]"
                      >
                        {conn.person?.avatar_emoji ?? '😊'}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/app/profile/${conn.person?.id ?? conn.id}`}
                          className="block truncate text-[13px] font-bold text-[#3D2A52] transition-colors hover:text-plum"
                        >
                          {conn.person?.alias ?? conn.person?.name ?? 'Unknown'}
                        </Link>
                        <p className="mt-0.5 text-[10px] text-warm-gray">
                          {isIncoming ? 'Sent you a request' : 'You sent a request'}
                        </p>
                      </div>
                      <div className={cn('shrink-0 flex gap-2', loading && 'opacity-50')}>
                        <button
                          type="button"
                          onClick={() => doAction('Accept', conn.connection_id ?? conn.id, true)}
                          disabled={loading}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors',
                            'bg-[#2E9E4F] text-white hover:bg-[#25853F]',
                          )}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => doAction('Decline', conn.connection_id ?? conn.id, true)}
                          disabled={loading}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors',
                            'bg-white border border-warm-gray-lighter text-charcoal hover:bg-warm-gray/5',
                          )}
                        >
                          Decline
                        </button>
                      </div>
                      {!isIncoming && (
                        <button
                          type="button"
                          onClick={() => doAction('Withdraw', conn.connection_id ?? conn.id, false)}
                          disabled={loading}
                          className={cn(
                            'shrink-0 rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors',
                            'bg-plum/10 text-plum hover:bg-plum/20',
                            loading && 'opacity-50 cursor-not-allowed',
                          )}
                        >
                          Withdraw
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          {error && (
            <div className="border-t border-warm-gray-lighter/60 px-4 py-2 text-center text-[11px] text-danger">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
