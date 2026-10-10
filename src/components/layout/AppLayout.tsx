'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SideNav } from './SideNav'
import { Logo } from '../common/Logo'
import { ArrowLeft } from 'lucide-react'
import { MobileHeader } from './MobileHeader'
import BottomNav from './BottomNav'
import { TopBar } from './TopBar'
import { AppNavProvider, useAppNav } from './AppNavContext'
import { NotificationsProvider } from './NotificationsContext'
import { useIsMobile, useIsTablet, useIsDesktop } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/utils'

const FALLBACK_USER = { name: 'Guest', initials: 'GU', role: 'Member' }

/**
 * Public, pre-login routes that live under `/app/*`. They are reachable
 * without a session (see PUBLIC_APP_PATHS in the Supabase middleware), so
 * rendering the signed-in dashboard chrome around them — SideNav, TopBar,
 * BottomNav, the "Guest" avatar — was misleading. These render standalone:
 * just the page content on the cream background.
 */
const STANDALONE_PATHS = [
  '/app/crisis',
  '/app/help/about',
  '/app/help/faq',
  '/app/help/support',
]

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
  const pathname = usePathname()
  const standalone = STANDALONE_PATHS.includes(pathname)
  const isMobile = useIsMobile()

  // New accounts must complete the 4-step profile setup once. Signup used to
  // rely on a post-OTP redirect to /onboarding, which silently fell through
  // to the dashboard whenever the session wasn't ready yet — so the gate
  // lives here instead, where every /app entry passes through. A cookie keeps
  // it to one request per browser, not one per navigation.
  useEffect(() => {
    if (typeof document === 'undefined') return
    // Public help/crisis pages are reachable without a session, so /api/me
    // would answer 401 and log two pointless failures on every visit.
    if (standalone) return
    if (document.cookie.includes('mc_onboarded=')) return

    let active = true
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return
        const legacy = (json.profile?.settings as Record<string, unknown> | undefined)
          ?.onboarded_at
        const onboardedAt = json.profile?.onboarded_at || legacy
        if (onboardedAt) {
          document.cookie = `mc_onboarded=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
          return
        }
        router.replace('/onboarding')
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [router, standalone])
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authUser, setAuthUser] = useState<typeof FALLBACK_USER | null>(null)
  const compact = isMobile || isTablet

  // Resolve the signed-in user so the shell shows their name instead of "Guest".
  // Runs on the standalone pages too: they are public, so a guest reaches them
  // without a session, but a member who opens Crisis Support from inside the app
  // should still get the bottom nav. With no session getUser() fails locally
  // without a network request, so this costs guests nothing.
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
    // Wait for the sign-out to actually complete before navigating. Without
    // the refresh, Next can serve a cached Server Component tree that still
    // believes a session exists, briefly showing the app after logout.
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <NotificationsProvider>
      <AppNavProvider>
      <Shell
        standalone={standalone}
        compact={compact}
        isDesktop={isDesktop}
        defaultTitle={defaultTitle}
        userName={resolved.name}
        userInitials={resolved.initials}
        userRole={resolved.role}
        onLogout={onLogout}
        signedIn={Boolean(authUser)}
        rightSidebar={rightSidebar}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </Shell>
    </AppNavProvider>
    </NotificationsProvider>
  )
}

function Shell({
  children,
  standalone,
  compact,
  isDesktop,
  defaultTitle,
  userName,
  userInitials,
  userRole,
  onLogout,
  signedIn,
  rightSidebar,
  sidebarOpen,
  setSidebarOpen,
}: {
  children: React.ReactNode
  standalone: boolean
  compact: boolean
  isDesktop: boolean
  defaultTitle: string
  userName?: string
  userInitials?: string
  userRole?: string
  onLogout?: () => void
  /** True once a session exists. Gates the bottom nav on public pages. */
  signedIn: boolean
  rightSidebar?: React.ReactNode
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}) {
  const { nav } = useAppNav()
  const title = nav.title || defaultTitle

  // ── Standalone (public help/crisis pages): content only, no dashboard ──
  if (standalone) {
    const bottomOffset = compact && signedIn ? '4.5rem' : '0rem'
    return (
      <div
        className="min-h-screen bg-cream"
        /* Pages with floating elements (the crisis call pill, the nudge card)
           read this so they clear the bottom nav when there is one and sit at
           a normal margin when there isn't. A CSS custom property is used
           rather than a prop because those elements are `position: fixed` and
           still inherit custom properties from their DOM ancestor. */
        style={{ '--mc-bottom-offset': bottomOffset } as React.CSSProperties}
      >
        {/* Full-bleed on purpose: the crisis hero artwork is a page-wide band
            that fades into the background at its edges, so constraining it
            here would reintroduce the hard rectangle. Each page owns its own
            max-width and gutters. */}
        <header className="sticky top-0 z-40 h-16 bg-cream/85 backdrop-blur-md">
          <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-4 sm:px-6">
            <Link
              href="/"
              aria-label="Back to MindCircle home"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-charcoal shadow-[0_4px_16px_rgba(42,27,61,0.12)] transition-transform hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="/" className="flex items-center" aria-label="MindCircle home">
              <Logo height={30} withWordmark />
            </Link>
          </div>
          {/* A gradient fade instead of `border-b`. The hard 1px rule read as a
              stray line across a phone screen, cutting the page in half for no
              reason; this softens into the page instead. Absolute so it adds no
              height and the h-16 offset below still clears the header. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full h-6 bg-gradient-to-b from-cream/70 to-transparent"
          />
        </header>
        {/* h-16 clears the sticky header so no page starts flush under it.
            pb-24 reserves room for the bottom nav, but only when there is
            one — a guest arriving from the landing page gets none. */}
        <main className={cn('w-full pt-16', compact && signedIn && 'pb-24')}>
          {children}
        </main>
        {/* Shown only to signed-in members. A guest who reached these pages
            from the landing page gets no dashboard nav, and — just as
            importantly — no prefetches of the five guarded /app routes, which
            would 401 and bounce them to the login screen mid-read. */}
        {compact && signedIn && <BottomNav />}
      </div>
    )
  }

  // ── Compact layout: mobile & tablet ───────────────────────────────
  if (compact) {
    return (
      // `min-h-dvh`, not `min-h-screen`: on a phone `100vh` is the *large*
      // viewport (URL bar collapsed) while pages sized in `dvh` — the chat
      // thread pins itself to `100dvh` — are the *dynamic* height. The
      // difference left a strip of scrollable page under every short screen,
      // which was just enough room for the chat's auto-scroll-to-newest to
      // drag the document down and push its own header off the top.
      <div className="min-h-[100dvh] bg-cream flex flex-col">
        {nav.showMobileHeader && (
          <MobileHeader
            title={title}
            showBack={nav.showBack}
            onMenu={() => setSidebarOpen(true)}
            onBack={nav.showBack ? nav.onBack : undefined}
          />
        )}

        {/* Drawer backdrop — darkens the page, sits above header/bottom nav */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[60] bg-charcoal/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sliding SideNav drawer — above the backdrop and all page chrome */}
        <SideNav
          userName={userName}
          userInitials={userInitials}
          userRole={userRole}
          onLogout={onLogout}
          onNavigate={() => setSidebarOpen(false)}
          className={cn(
            'z-[70] transition-transform duration-300 ease-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        />

        <main className="relative flex-1 overflow-x-hidden">
          <div className={cn('mx-auto w-full px-4 pt-3 pb-6', nav.showBottomNav && 'pb-24')}>
            {children}
          </div>
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
  // Same dvh reasoning as the compact shell above.
  return (
    <div className="min-h-[100dvh] bg-cream flex flex-col">
      {nav.showMobileHeader && (
        <MobileHeader title={title} showBack={nav.showBack} onMenu={() => setSidebarOpen(true)} onBack={nav.showBack ? nav.onBack : undefined} />
      )}
      <main className="relative flex-1 overflow-x-hidden">
        <div className={cn('mx-auto w-full px-4 pt-3 pb-6', nav.showBottomNav && 'pb-24')}>
          {children}
        </div>
      </main>
      {nav.showBottomNav && <BottomNav />}
    </div>
  )
}
