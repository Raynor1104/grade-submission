export const AUTH_TOKEN_STORAGE_KEY = 'grade-submission.auth.token'
export const AUTH_USERNAME_STORAGE_KEY = 'grade-submission.auth.username'

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function getStoredAccessToken(): string | null {
  const storage = getSessionStorage()

  if (!storage) {
    return null
  }

  try {
    const token = storage.getItem(AUTH_TOKEN_STORAGE_KEY)?.trim()

    return token || null
  } catch {
    return null
  }
}

export function setStoredAccessToken(token: string): void {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    throw new Error('An access token is required.')
  }

  const storage = getSessionStorage()

  if (typeof window !== 'undefined' && !storage) {
    throw new Error('Session storage is unavailable.')
  }

  storage?.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken)
}

export function getStoredUsername(): string | null {
  const storage = getSessionStorage()

  if (!storage) {
    return null
  }

  try {
    const username = storage.getItem(AUTH_USERNAME_STORAGE_KEY)?.trim()

    return username || null
  } catch {
    return null
  }
}

export function setStoredUsername(username: string): void {
  const normalizedUsername = username.trim()

  if (!normalizedUsername) {
    throw new Error('A username is required.')
  }

  const storage = getSessionStorage()

  if (typeof window !== 'undefined' && !storage) {
    throw new Error('Session storage is unavailable.')
  }

  storage?.setItem(AUTH_USERNAME_STORAGE_KEY, normalizedUsername)
}

export function clearStoredAccessToken(): void {
  try {
    getSessionStorage()?.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // Clearing authentication state must remain safe in restricted browsers.
  }
}

export function clearStoredUsername(): void {
  try {
    getSessionStorage()?.removeItem(AUTH_USERNAME_STORAGE_KEY)
  } catch {
    // Clearing authentication state must remain safe in restricted browsers.
  }
}
