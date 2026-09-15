import { getStoredAccessToken } from '@/core/auth/token-storage'
import { appEnv } from '@/core/config/env'

import {
  normalizeRequestError,
  normalizeResponseError,
} from './error-normalizer'
import {
  ApiRequestError,
  createClientError,
} from './types'

export const AUTH_EXPIRED_EVENT = 'grade-submission:auth-expired'

type AccessTokenProvider = () => string | null

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

let accessTokenProvider: AccessTokenProvider = getStoredAccessToken
let lastExpiredToken: string | null | undefined

export function setAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider
  lastExpiredToken = undefined
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${appEnv.apiBaseUrl}${normalizedPath}`
}

function notifyAuthExpired(token: string | null): void {
  if (typeof window === 'undefined' || lastExpiredToken === token) {
    return
  }

  lastExpiredToken = token
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const token = accessTokenProvider()
  const headers = new Headers({
    Accept: 'application/json',
  })

  let body: BodyInit | undefined

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    const response = await fetch(buildUrl(path), {
      method: options.method ?? 'GET',
      headers,
      body,
      signal: options.signal,
    })

    if (!response.ok) {
      if (response.status === 401) {
        notifyAuthExpired(token)
      }

      throw await normalizeResponseError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const responseBody = await response.text()

    if (!responseBody) {
      return undefined as T
    }

    try {
      return JSON.parse(responseBody) as T
    } catch (error) {
      throw createClientError('The server returned an invalid response.', error)
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error
    }

    throw normalizeRequestError(error)
  }
}

export const httpClient = {
  get<T>(path: string, signal?: AbortSignal) {
    return request<T>(path, { signal })
  },
  delete(path: string, signal?: AbortSignal) {
    return request<void>(path, {
      method: 'DELETE',
      signal,
    })
  },
}
