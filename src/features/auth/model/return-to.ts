import type { Router } from 'vue-router'

export const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard'

export function resolveSafeReturnTo(
  router: Router,
  value: unknown,
): string {
  if (typeof value !== 'string' || value !== value.trim()) {
    return DEFAULT_AUTHENTICATED_ROUTE
  }

  if (
    !value.startsWith('/')
    || value.startsWith('//')
    || value.includes('\\')
    || /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return DEFAULT_AUTHENTICATED_ROUTE
  }

  const resolved = router.resolve(value)
  const isKnownProtectedRoute = resolved.matched.length > 0
    && resolved.matched.some(record => record.meta.requiresAuth === true)

  if (!isKnownProtectedRoute || resolved.name === 'login') {
    return DEFAULT_AUTHENTICATED_ROUTE
  }

  return resolved.fullPath
}
