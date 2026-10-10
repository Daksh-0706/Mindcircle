'use client'

import { Search, ChevronDown, LogOut, User, Settings, UserPlus, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { NotificationBell } from './NotificationBell'

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

function PendingRequestsDropdown() {
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
    <div className="relative" ref={ref}>
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
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 mt-2 w-[min(90vw,340px)] overflow-hidden rounded-xl border border-warm-gray-lighter bg-white shadow-[0_8px_30px_rgba(74,44,94,0.18)]">
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

interface TopBarProps {
  title: string
  userName?: string
  userInitials?: string
  userRole?: string
  onSearch?: (query: string) => void
  onNotifications?: () => void
  onProfile?: () => void
  onSettings?: () => void
  onLogout?: () => void
}

export function TopBar({
  title,
  userName = 'Guest',
  userInitials = 'GU',
  userRole = 'Member',
  onSearch,
  onNotifications,
  onProfile,
  onSettings,
  onLogout,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <header className="glass-card sticky top-0 z-30 h-14 border-b border-white/50 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4">
        <h1 className="font-heading text-xl font-semibold text-charcoal truncate pr-4">
          {title}
        </h1>

        <div className="flex items-center gap-4 flex-1 justify-end">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full max-w-md hidden md:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray size-5" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="input-warm w-full pl-11"
              aria-label="Search"
            />
          </form>

          {/* Pending requests */}
          <PendingRequestsDropdown />

          {/* Notifications */}
          <NotificationBell />

          {/* User dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="User menu"
              aria-expanded={showDropdown}
              aria-haspopup="true"
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors',
                'hover:bg-plum/5'
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum to-terracotta text-sm font-semibold text-white">
                {userInitials}
              </span>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-charcoal">{userName}</p>
                <p className="text-xs text-warm-gray truncate max-w-[120px]">{userRole}</p>
              </div>
              <ChevronDown className="size-4 text-warm-gray" />
            </button>

            {showDropdown && (
              <div className="glass-card absolute right-0 top-full mt-2 w-56 rounded-xl border border-warm-gray-lighter/50 py-2 shadow-medium animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-warm-gray-lighter/50">
                  <p className="text-sm font-semibold text-charcoal">{userName}</p>
                  <p className="text-xs text-warm-gray">{userRole}</p>
                </div>
                <button
                  onClick={() => { onProfile?.(); setShowDropdown(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-plum/5"
                >
                  <User size={18} className="text-warm-gray" />
                  Profile
                </button>
                <button
                  onClick={() => { onSettings?.(); setShowDropdown(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-plum/5"
                >
                  <Settings size={18} className="text-warm-gray" />
                  Settings
                </button>
                <hr className="my-2 border-warm-gray-lighter/50" />
                <button
                  onClick={() => { onLogout?.(); setShowDropdown(false); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}