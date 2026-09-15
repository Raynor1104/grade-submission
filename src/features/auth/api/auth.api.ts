import { httpClient } from '@/core/api/http-client'
import { createClientError } from '@/core/api/types'

import type { LoginRequest } from '../model/auth.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function authenticate(
  credentials: LoginRequest,
  signal?: AbortSignal,
): Promise<string> {
  const response = await httpClient.post<unknown>(
    '/authenticate',
    credentials,
    {
      signal,
      auth: 'omit',
    },
  )

  if (!isRecord(response) || typeof response.token !== 'string') {
    throw createClientError('The authentication response was invalid.')
  }

  const token = response.token.trim()

  if (!token) {
    throw createClientError('The authentication response was invalid.')
  }

  return token
}
