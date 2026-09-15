import {
  reactive,
  readonly,
} from 'vue'

import {
  clearStoredAccessToken,
  clearStoredUsername,
  getStoredAccessToken,
  getStoredUsername,
  setStoredAccessToken,
  setStoredUsername,
} from './token-storage'

interface AuthSessionState {
  token: string | null
  username: string | null
  isAuthenticated: boolean
}

const initialToken = getStoredAccessToken()

const sessionState = reactive<AuthSessionState>({
  token: initialToken,
  username: initialToken ? getStoredUsername() : null,
  isAuthenticated: Boolean(initialToken),
})

export const authSession = readonly(sessionState)

export function getAccessToken(): string | null {
  return sessionState.token
}

export function setAuthenticatedSession(token: string, username: string): void {
  const normalizedToken = token.trim()
  const normalizedUsername = username.trim()

  if (!normalizedToken || !normalizedUsername) {
    throw new Error('A valid token and username are required.')
  }

  try {
    setStoredAccessToken(normalizedToken)
    setStoredUsername(normalizedUsername)
  } catch (error) {
    clearStoredAccessToken()
    clearStoredUsername()
    sessionState.token = null
    sessionState.username = null
    sessionState.isAuthenticated = false
    throw error
  }

  sessionState.token = normalizedToken
  sessionState.username = normalizedUsername
  sessionState.isAuthenticated = true
}

export function clearAuthenticatedSession(): void {
  clearStoredAccessToken()
  clearStoredUsername()
  sessionState.token = null
  sessionState.username = null
  sessionState.isAuthenticated = false
}

export function restoreAuthenticatedSession(): void {
  const token = getStoredAccessToken()

  sessionState.token = token
  sessionState.username = token ? getStoredUsername() : null
  sessionState.isAuthenticated = Boolean(token)
}
