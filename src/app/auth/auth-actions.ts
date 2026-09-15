import type { Router } from 'vue-router'

import { queryClient } from '@/app/providers/query-client'
import { AUTH_EXPIRED_EVENT } from '@/core/api/http-client'
import { clearAuthenticatedSession } from '@/core/auth/auth-session'

let authExpiredListener: (() => void) | null = null
let isHandlingAuthExpiry = false

async function clearProtectedClientState(): Promise<void> {
  clearAuthenticatedSession()

  try {
    await queryClient.cancelQueries()
  } finally {
    queryClient.clear()
  }
}

export async function logout(router: Router): Promise<void> {
  await clearProtectedClientState()
  await router.replace({ name: 'login' })
}

async function handleAuthExpired(router: Router): Promise<void> {
  if (isHandlingAuthExpiry) {
    return
  }

  isHandlingAuthExpiry = true

  try {
    await clearProtectedClientState()

    const currentRoute = router.currentRoute.value
    const isExpiredLogin = currentRoute.name === 'login'
      && currentRoute.query.reason === 'expired'

    if (!isExpiredLogin) {
      await router.replace({
        name: 'login',
        query: { reason: 'expired' },
      })
    }
  } finally {
    isHandlingAuthExpiry = false
  }
}

export function installAuthExpiredHandler(router: Router): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  if (!authExpiredListener) {
    authExpiredListener = () => {
      void handleAuthExpired(router)
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, authExpiredListener)
  }

  return uninstallAuthExpiredHandler
}

export function uninstallAuthExpiredHandler(): void {
  if (typeof window !== 'undefined' && authExpiredListener) {
    window.removeEventListener(AUTH_EXPIRED_EVENT, authExpiredListener)
  }

  authExpiredListener = null
  isHandlingAuthExpiry = false
}
