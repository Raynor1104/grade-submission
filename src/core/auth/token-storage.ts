export const AUTH_TOKEN_STORAGE_KEY = 'grade-submission.auth.token'

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const token = window.sessionStorage
    .getItem(AUTH_TOKEN_STORAGE_KEY)
    ?.trim()

  return token || null
}

export function clearStoredAccessToken(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}
