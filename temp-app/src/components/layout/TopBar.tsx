'use client'

import { Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray size-5" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="input-warm w-full pl-10 pr-4"
              aria-label="Search"
            />
          </form>

          {/* Notifications */}
          <button
            type="button"
            onClick={onNotifications}
            aria-label="Notifications"
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors',
              'hover:bg-plum/5 active:bg-plum/10'
            )}
          >
            <Bell size={22} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-terracotta ring-2 ring-white" />
          </button>

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