import {
  ApiRequestError,
  type ApiError,
} from './types'

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_ERROR_MESSAGE = 'Unable to connect to the server. Please try again.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : undefined
}

export async function normalizeResponseError(
  response: Response,
): Promise<ApiRequestError> {
  let details: unknown

  try {
    const body = await response.text()
    details = body ? JSON.parse(body) : undefined
  } catch {
    details = undefined
  }

  const payload = isRecord(details) ? details : undefined
  const backendMessage = getString(payload?.message) ?? getString(payload?.error)
  const code = getString(payload?.code)

  const error: ApiError = {
    status: response.status,
    message: backendMessage ?? DEFAULT_ERROR_MESSAGE,
    code,
    details,
    source: 'backend',
  }

  return new ApiRequestError(error)
}

export function normalizeRequestError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiRequestError({
      status: 0,
      message: 'The request was cancelled.',
      details: error,
      source: 'client',
    })
  }

  return new ApiRequestError({
    status: 0,
    message: NETWORK_ERROR_MESSAGE,
    details: error,
    source: 'network',
  })
}
