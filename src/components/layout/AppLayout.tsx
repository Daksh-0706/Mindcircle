'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SideNav } from './SideNav'
import { MobileHeader } from './MobileHeader'
import BottomNav from './BottomNav'
import { TopBar } from './TopBar'
import { AppNavProvider, useAppNav } from './AppNavContext'
import { useIsMobile, useIsTablet, useIsDesktop } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/utils'

const FALLBACK_USER = { name: 'Guest', initials: 'GU', role: 'Member' }

function displayName(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const metaName = user.user_metadata?.full_name
  if (typeof metaName === 'string' && metaName.trim()) return metaName.trim()
  if (user.email) return user.email.split('@')[0] || 'User'
  return 'User'
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'GU'
}

interface AppLayoutProps {
  children: React.ReactNode
  /** Fallback title used when the page hasn't registered one via <AppNav />. */
  defaultTitle?: string
  userName?: string
  userInitials?: string
  userRole?: string
  rightSidebar?: React.ReactNode
}

/**
 * The single responsive chrome engine for every `/app/*` route.
 *
 * Breakpoints (mobile-first, per the design spec):
 *  - Mobile (<768) & Tablet (768–1023): MobileHeader (hamburger → drawer or
 *    back button) + BottomNav. No persistent sidebar; the SideNav slides in
 *    as a drawer.
 *  - Desktop (≥1024): fixed 240px SideNav on the left + TopBar over the main
 *    content. No BottomNav, no MobileHeader.
 *
 * Each page may register overrides via <AppNav /> (title, back button, which
 * chrome to show/hide) — see AppNavContext.tsx.
 */
export function AppLayout({
  children,
  defaultTitle = 'MindCircle',
  userName: propUserName,
  userInitials: propUserInitials,
  userRole: propUserRole,
  rightSidebar,
}: AppLayoutProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authUser, setAuthUser] = useState<typeof FALLBACK_USER | null>(null)
  const compact = isMobile || isTablet

  // Resolve the signed-in user so the shell shows their name instead of "Guest".
  useEffect(() => {
    let active = true
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!active || !data.user) return
        const name = displayName(data.user)
        setAuthUser({ name, initials: initialsFor(name), role: 'Member' })
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  // Fall back to caller-provided props, then to the fetched user.
  const resolved = authUser ?? {
    name: propUserName ?? FALLBACK_USER.name,
    initials: propUserInitials ?? FALLBACK_USER.initials,
    role: propUserRole ?? FALLBACK_USER.role,
  }

  const onLogout = async () => {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  return (
    <AppNavProvider>
      <Shell
        compact={compact}
        isDesktop={isDesktop}
        defaultTitle={defaultTitle}
        userName={resolved.name}
        userInitials={resolved.initials}
        userRole={resolved.role}
        onLogout={onLogout}
        rightSidebar={rightSidebar}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </Shell>
    </AppNavProvider>
  )
}

function Shell({
  children,
  compact,
  isDesktop,
  defaultTitle,
  userName,
  userInitials,
  userRole,
  onLogout,
  rightSidebar,
  sidebarOpen,
  setSidebarOpen,
}: {
  children: React.ReactNode
  compact: boolean
  isDesktop: boolean
  defaultTitle: string
  userName?: string
  userInitials?: string
  userRole?: string
  onLogout?: () => void
  rightSidebar?: React.ReactNode
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}) {
  const { nav } = useAppNav()
  const title = nav.title || defaultTitle

  // ── Compact layout: mobile & tablet ───────────────────────────────
  if (compact) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        {nav.showMobileHeader && (
          <MobileHeader
            title={title}
            showBack={nav.showBack}
            onMenu={() => setSidebarOpen(true)}
            onBack={nav.showBack ? nav.onBack : undefined}
          />
        )}

        {/* Drawer backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sliding SideNav drawer */}
        <SideNav
          userName={userName}
          userInitials={userInitials}
          userRole={userRole}
          onLogout={onLogout}
          className={cn(
            'transition-transform duration-300 ease-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        />

        <main className={cn('relative flex-1 overflow-x-hidden', nav.showBottomNav && 'pb-20')}>
          {children}
        </main>

        {nav.showBottomNav && <BottomNav />}
      </div>
    )
  }

  // ── Desktop layout: ≥1024 ─────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-cream flex">
        <SideNav userName={userName} userInitials={userInitials} userRole={userRole} onLogout={onLogout} />
        <div className="flex flex-1 flex-col pl-60 min-w-0">
          {nav.showTopBar && (
            <TopBar
              title={title}
              userName={userName}
              userInitials={userInitials}
              userRole={userRole}
              onLogout={onLogout}
            />
          )}
          <main className="flex flex-1 min-h-0">
            <div className="flex-1 min-w-0 p-6 pt-5">{children}</div>
            {rightSidebar && (
              <aside className="hidden lg:block w-72 shrink-0 border-l border-warm-gray-lighter bg-cream/50 p-6 pt-5">
                {rightSidebar}
              </aside>
            )}
          </main>
        </div>
      </div>
    )
  }

  // ── Tablet caught by neither (safety): treat like compact ─────────
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {nav.showMobileHeader && (
        <MobileHeader title={title} showBack={nav.showBack} onMenu={() => setSidebarOpen(true)} onBack={nav.showBack ? nav.onBack : undefined} />
      )}
      <main className="relative flex-1 overflow-x-hidden">{children}</main>
      {nav.showBottomNav && <BottomNav />}
    </div>
  )
}
