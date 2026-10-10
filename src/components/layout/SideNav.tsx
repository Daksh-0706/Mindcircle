'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  Users,
  Compass,
  BarChart3,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Settings,
  Heart,
  Info,
  HelpCircle,
  LifeBuoy,
  UserCog,
  Lock,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { SIDEBAR_ITEMS } from '../../lib/constants'
import { cn } from '../../lib/utils'
import { Logo } from '../common/Logo'

const ICONS: Record<string, LucideIcon> = {
  Home,
  BookOpen,
  Users,
  Compass,
  BarChart3,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Settings,
  Heart,
}

/**
 * Sidebar entries that use custom artwork instead of a Lucide line icon. The
 * artwork is a transparent silhouette used as a CSS mask, so it is painted in
 * `currentColor` exactly like the line icons — idle keeps the muted charcoal,
 * active turns cream on the plum tile.
 */
const MASK_ICONS: Record<string, string> = {
  '/app/activities': '/activities/activities-icon.webp',
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
  /** Called when a link inside the drawer is clicked (mobile) so the shell can close it. */
  onNavigate?: () => void
}

export function SideNav({
  userName = 'Guest',
  userInitials = 'GU',
  userRole = 'Member',
  onLogout,
  className,
  onNavigate,
}: SideNavProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-hidden bg-cream',
        className,
      )}
    >
      {/* Decorative background image + soft overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sidebar-bg.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-cream/60" aria-hidden="true" />

      {/* Brand */}
      <div className="relative shrink-0 px-6 pb-2 pt-6">
        <Link href="/app" onClick={onNavigate} className="block">
          <Logo height={34} withWordmark />
        </Link>
        <p className="mt-0.5 text-xs text-warm-gray">A calmer, brighter you</p>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Sidebar"
        className="scroll-x-hidden relative flex-1 overflow-y-auto px-3 py-3"
      >
        <ul className="space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = ICONS[item.icon]
            const maskSrc = MASK_ICONS[item.href]
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-colors duration-200',
                    active
                      ? 'bg-plum/[0.10] font-semibold text-plum shadow-[0_2px_10px_rgba(74,44,94,0.08)]'
                      : 'font-medium text-charcoal/80 hover:bg-plum/5 hover:text-plum',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                      active ? 'bg-plum text-cream' : 'bg-transparent text-charcoal/80',
                    )}
                  >
                    {maskSrc ? (
                      <span
                        aria-hidden="true"
                        className="block bg-current"
                        style={{
                          width: 20,
                          height: 20,
                          WebkitMaskImage: `url(${maskSrc})`,
                          maskImage: `url(${maskSrc})`,
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                        }}
                      />
                    ) : (
                      <Icon size={18} strokeWidth={active ? 2.3 : 2} aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {active && <ChevronRight size={16} className="shrink-0 text-plum/60" />}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Support section */}
        <p className="px-3.5 pb-1.5 pt-5 text-[10px] font-bold uppercase tracking-[.16em] text-warm-gray">
          Support
        </p>
        <ul className="space-y-0.5">
          {[
            { href: '/app/help/about', label: 'About', icon: Info },
            { href: '/app/help/faq', label: 'FAQ', icon: HelpCircle },
            { href: '/app/help/support', label: 'Contact Support', icon: LifeBuoy },
            { href: '/app/settings/edit-profile', label: 'Edit Profile', icon: UserCog },
            { href: '/app/settings/change-password', label: 'Change Password', icon: Lock },
          ].map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-3.5 py-2 text-[13px] transition-colors duration-200',
                    active
                      ? 'bg-plum/[0.08] font-semibold text-plum'
                      : 'font-medium text-charcoal/70 hover:bg-plum/5 hover:text-plum',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                      active ? 'bg-plum text-cream' : 'bg-plum/[0.06] text-charcoal/70',
                    )}
                  >
                    <item.icon size={14} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User card */}
      <div className="relative shrink-0 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-[0_2px_12px_rgba(74,44,94,0.08)] backdrop-blur-sm">
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-plum/70 transition-colors hover:bg-plum/10 hover:text-plum"
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
