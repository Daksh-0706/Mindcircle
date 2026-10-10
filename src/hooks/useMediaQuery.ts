'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query.
 *
 * `useSyncExternalStore` is the right primitive here: matchMedia is an external
 * store that notifies on change, and reading it during render keeps the first
 * client paint correct without the extra render pass (and cascading-render lint
 * error) that setting state from an effect would cause. The server snapshot is
 * always false, which is also what the initial client snapshot would be during
 * hydration, so there is no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}
