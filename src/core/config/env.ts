const DEFAULT_API_BASE_URL = '/api'

function normalizeBaseUrl(value: string | undefined): string {
  const normalized = value?.trim() || DEFAULT_API_BASE_URL

  return normalized.replace(/\/+$/, '')
}

export const appEnv = Object.freeze({
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
})
