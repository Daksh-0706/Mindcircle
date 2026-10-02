'use client'

import { Menu, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { NotificationBell } from './NotificationBell'

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
      <div className="flex h-full items-center justify-between px-4">
        <button
          type="button"
          onClick={showBack ? onBack : onMenu}
          aria-label={showBack ? 'Go back' : 'Open menu'}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors',
            'hover:bg-plum/5 active:bg-plum/10'
          )}
        >
          {showBack ? <ArrowLeft size={22} /> : <Menu size={22} />}
        </button>

        <h1 className="font-heading truncate px-2 text-lg font-semibold text-charcoal">
          {title}
        </h1>

        <NotificationBell />
      </div>
    </header>
  )
}
