'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Settings,
  Heart,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { SIDEBAR_ITEMS } from '../../lib/constants'
import { cn } from '../../lib/utils'

const ICONS: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  Users,
  BarChart3,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Settings,
  Heart,
}

function isActive(pathname: string, href: string) {
  // Dashboard is the bare '/app' route; everything else is a nested path.
  if (href === '/app') return pathname === '/app'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface SideNavProps {
  userName?: string
  userInitials?: string
  userRole?: string
  onLogout?: () => void
  /** Extra classes applied to the <aside>, used for the mobile drawer positioning. */
  className?: string
}

export function SideNav({
  userName = 'Guest',
  userInitials = 'GU',
  userRole = 'Member',
  onLogout,
  className,
}: SideNavProps) {
  const pathname = usePathname()

  return (
    <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-warm-gray-lighter bg-cream/80 backdrop-blur-md', className)}>
      {/* Brand */}
      <Link href="/app" className="flex h-16 shrink-0 items-center px-6">
        <span className="font-heading text-xl font-bold gradient-text">MindCircle</span>
      </Link>

      {/* Navigation */}
      <nav
        aria-label="Sidebar"
        className="scroll-x-hidden flex-1 overflow-y-auto px-3 py-4"
      >
        <ul className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = ICONS[item.icon]
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal/80 transition-colors duration-200',
                    'hover:bg-plum/5 hover:text-plum',
                    active && 'bg-plum/10 text-plum'
                  )}
                >
                  <Icon
                    size={20}
                    className="shrink-0"
                    strokeWidth={active ? 2.4 : 2}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-warm-gray-lighter p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum to-terracotta text-sm font-semibold text-white">
            {userInitials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-charcoal">{userName}</p>
            <p className="truncate text-xs text-warm-gray">{userRole}</p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-warm-gray transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
