export type ApiErrorSource = 'backend' | 'network' | 'client'

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: unknown
  source: ApiErrorSource
}

export class ApiRequestError extends Error implements ApiError {
  readonly status: number
  readonly code?: string
  readonly details?: unknown
  readonly source: ApiErrorSource

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = error.status
    this.code = error.code
    this.details = error.details
    this.source = error.source
  }
}

export function createClientError(
  message: string,
  details?: unknown,
): ApiRequestError {
  return new ApiRequestError({
    status: 0,
    message,
    details,
    source: 'client',
  })
}
