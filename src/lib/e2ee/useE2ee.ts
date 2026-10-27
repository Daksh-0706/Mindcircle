'use client'

import { useSyncExternalStore } from 'react'
import {
  cancelSetup,
  confirmSetup,
  decryptPrivateText,
  encryptPrivateText,
  getE2eeSnapshot,
  initE2ee,
  lockE2ee,
  rotatePhrase,
  selfTestRoundTrip,
  startSetup,
  subscribeE2ee,
  unlockWithPhrase,
} from './client'

/** One hook for every screen that touches private content. */
export function useE2ee() {
  const snapshot = useSyncExternalStore(subscribeE2ee, getE2eeSnapshot, getE2eeSnapshot)
  return {
    ...snapshot,
    init: initE2ee,
    startSetup,
    confirmSetup,
    cancelSetup,
    unlockWithPhrase,
    lock: lockE2ee,
    rotatePhrase,
    encrypt: encryptPrivateText,
    decrypt: decryptPrivateText,
    selfTest: selfTestRoundTrip,
  }
}
