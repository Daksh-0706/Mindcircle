'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { SideNav } from '@/components/layout/SideNav'
import BottomNav from '@/components/layout/BottomNav'
import { SIDEBAR_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

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
  if (href === '/app') return pathname === '/app'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Authenticated app shell. Provides the persistent navigation chrome:
 * a fixed sidebar on desktop and a bottom nav + slide-in drawer on mobile.
 * Individual pages own their own headers, so this layout deliberately adds
 * no top bar — it only offsets content for the sidebar and bottom nav.
 */
export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SideNav />
      </div>

      {/* Mobile: floating menu trigger — top-right, clear of left-aligned page headers */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
        className="fixed right-4 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-charcoal shadow-medium backdrop-blur-md transition-colors hover:bg-white lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', drawerOpen ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300',
            drawerOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-cream shadow-strong transition-transform duration-300 ease-out',
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-6">
            <span className="font-heading text-xl font-bold gradient-text">MindCircle</span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-plum/5"
            >
              <X size={20} />
            </button>
          </div>

          <nav aria-label="Main" className="scroll-x-hidden flex-1 overflow-y-auto px-3 py-2">
            <ul className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = ICONS[item.icon]
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-charcoal/80 transition-colors',
                        'hover:bg-plum/5 hover:text-plum',
                        active && 'bg-plum/10 text-plum'
                      )}
                    >
                      <Icon size={20} className="shrink-0" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="shrink-0 border-t border-warm-gray-lighter p-3">
            <Link
              href="/app/profile"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal/80 transition-colors hover:bg-plum/5 hover:text-plum"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-plum to-terracotta text-xs font-semibold text-white">
                ME
              </span>
              <span>My Profile</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/5"
            >
              <LogOut size={20} className="shrink-0" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Content — offset for the desktop sidebar, padded for the mobile bottom nav */}
      <div className="lg:pl-60">
        <div className="pb-16 lg:pb-0">{children}</div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
