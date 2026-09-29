'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface AppNavState {
  /** Page title shown in the mobile header / desktop top bar. */
  title: string
  /** Show a back arrow (mobile header) instead of the hamburger menu. */
  showBack: boolean
  /** Called when the back arrow is tapped. */
  onBack: () => void
  /** Render the mobile header (hamburger / back + bell). Defaults true. */
  showMobileHeader: boolean
  /** Render the desktop top bar (search + user menu). Defaults true. */
  showTopBar: boolean
  /** Render the bottom navigation bar on mobile/tablet. Defaults true. */
  showBottomNav: boolean
}

interface AppNavContextValue {
  nav: AppNavState
  setNav: (patch: Partial<AppNavState>) => void
}

const DEFAULT_NAV: AppNavState = {
  title: 'MindCircle',
  showBack: false,
  onBack: () => {},
  showMobileHeader: true,
  showTopBar: true,
  showBottomNav: true,
}

const AppNavContext = createContext<AppNavContextValue>({
  nav: DEFAULT_NAV,
  setNav: () => {},
})

/**
 * Provides app-nav configuration. Lives at the top of AppLayout so every
 * `/app/*` page can register its own chrome preferences via <AppNav />.
 */
export function AppNavProvider({ children }: { children: ReactNode }) {
  const [patch, setPatch] = useState<Partial<AppNavState>>({})

  const setNav = useCallback((next: Partial<AppNavState>) => {
    setPatch((prev) => ({ ...prev, ...next }))
  }, [])

  const value = useMemo<AppNavContextValue>(
    () => ({ nav: { ...DEFAULT_NAV, ...patch }, setNav }),
    [patch, setNav],
  )

  return <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>
}

export function useAppNav() {
  return useContext(AppNavContext)
}

interface AppNavProps extends Partial<AppNavState> {
  /** Optional callback fired when the page unmounts to reset overrides. */
  resetOnUnmount?: boolean
}

/**
 * Renders nothing. A page mounts this to register its nav preferences
 * (title, back button, which chrome to hide). Preferences clear on unmount.
 */
export function AppNav({ resetOnUnmount = true, ...override }: AppNavProps) {
  const { setNav } = useAppNav()

  useEffect(() => {
    setNav(override)
    if (!resetOnUnmount) return
    return () => setNav({ title: '', showBack: false, showBottomNav: true, showMobileHeader: true, showTopBar: true })
  }, [setNav, resetOnUnmount, JSON.stringify(override)])

  return null
}