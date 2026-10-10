'use client'

import { Menu, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { NotificationBell } from './NotificationBell'
import { PendingRequestsDropdown } from './PendingRequestsDropdown'

interface MobileHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  onMenu?: () => void
  onNotifications?: () => void
}

export function MobileHeader({
  title,
  showBack = false,
  onBack,
  onMenu,
  onNotifications,
}: MobileHeaderProps) {
  return (
    <header className="glass-card sticky top-0 z-40 h-14 border-b border-white/50 backdrop-blur-md">
      {/* Three equal columns so the title stays optically centred even though
          the right side carries two round buttons and the left side one. */}
      <div className="grid h-full grid-cols-[1fr_minmax(0,auto)_1fr] items-center px-4">
        <button
          type="button"
          onClick={showBack ? onBack : onMenu}
          aria-label={showBack ? 'Go back' : 'Open menu'}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors',
            'justify-self-start',
            'hover:bg-plum/5 active:bg-plum/10'
          )}
        >
          {showBack ? <ArrowLeft size={22} /> : <Menu size={22} />}
        </button>

        <h1 className="truncate px-2 text-center text-lg font-semibold text-charcoal">
          {title}
        </h1>

        {/* Positioning wrapper: the pending-requests panel anchors to this
            group's right edge so it can never spill off the phone screen. */}
        <div className="relative flex items-center gap-1 justify-self-end">
          <PendingRequestsDropdown rootClassName="" />
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
