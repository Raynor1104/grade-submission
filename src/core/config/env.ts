const DEFAULT_API_BASE_URL = '/api'

function normalizeBaseUrl(value: string | undefined): string {
  const normalized = value?.trim() || DEFAULT_API_BASE_URL

  return normalized.replace(/\/+$/, '')
}

const demoUsername = import.meta.env.VITE_AUTH_DEMO_USERNAME?.trim()
const demoPassword = import.meta.env.VITE_AUTH_DEMO_PASSWORD
const isDemoMode = import.meta.env.DEV || import.meta.env.MODE === 'demo'
const isDemoEnabled = import.meta.env.VITE_AUTH_DEMO_ENABLED === 'true'

export const appEnv = Object.freeze({
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
  demoAuth: Object.freeze({
    enabled: Boolean(
      isDemoMode
      && isDemoEnabled
      && demoUsername
      && demoPassword,
    ),
    username: demoUsername ?? '',
    password: demoPassword ?? '',
  }),
})
