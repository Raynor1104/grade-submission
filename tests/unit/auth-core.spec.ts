import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  createMemoryHistory,
  createRouter,
} from 'vue-router'

import {
  installAuthExpiredHandler,
  logout,
  uninstallAuthExpiredHandler,
} from '@/app/auth/auth-actions'
import { queryClient } from '@/app/providers/query-client'
import { createAuthGuard } from '@/app/router'
import {
  AUTH_EXPIRED_EVENT,
  httpClient,
} from '@/core/api/http-client'
import {
  authSession,
  clearAuthenticatedSession,
  restoreAuthenticatedSession,
  setAuthenticatedSession,
} from '@/core/auth/auth-session'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USERNAME_STORAGE_KEY,
} from '@/core/auth/token-storage'
import { authenticate } from '@/features/auth/api/auth.api'
import { resolveSafeReturnTo } from '@/features/auth/model/return-to'

function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      {
        path: '/',
        component: { template: '<router-view />' },
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            redirect: () => authSession.isAuthenticated
              ? { name: 'dashboard' }
              : { name: 'login' },
          },
          { path: 'dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
          { path: 'students', name: 'students', component: { template: '<div>Students</div>' } },
        ],
      },
    ],
  })

  router.beforeEach(createAuthGuard(router))
  return router
}

afterEach(() => {
  uninstallAuthExpiredHandler()
  clearAuthenticatedSession()
  window.sessionStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('auth storage and session', () => {
  it('stores, restores, and clears token and username without a password key', () => {
    setAuthenticatedSession('  jwt-token  ', '  tanaka  ')

    expect(authSession).toMatchObject({
      token: 'jwt-token',
      username: 'tanaka',
      isAuthenticated: true,
    })
    expect(sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('jwt-token')
    expect(sessionStorage.getItem(AUTH_USERNAME_STORAGE_KEY)).toBe('tanaka')
    expect(Object.keys(sessionStorage)).not.toContain('password')

    clearAuthenticatedSession()
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'restored-token')
    sessionStorage.setItem(AUTH_USERNAME_STORAGE_KEY, 'restored-user')
    restoreAuthenticatedSession()

    expect(authSession).toMatchObject({
      token: 'restored-token',
      username: 'restored-user',
      isAuthenticated: true,
    })

    clearAuthenticatedSession()
    expect(authSession.isAuthenticated).toBe(false)
    expect(sessionStorage.length).toBe(0)
  })

  it('rejects an empty token and leaves the session cleared', () => {
    expect(() => setAuthenticatedSession('   ', 'tanaka')).toThrow()
    expect(authSession.isAuthenticated).toBe(false)
    expect(sessionStorage.length).toBe(0)
  })
})

describe('authentication API', () => {
  it('preserves the password and accepts only a non-empty token', async () => {
    const postSpy = vi.spyOn(httpClient, 'post')
      .mockResolvedValue({ token: '  valid-token  ' })

    await expect(authenticate({
      username: 'tanaka',
      password: '  exact password  ',
    })).resolves.toBe('valid-token')

    expect(postSpy).toHaveBeenCalledWith('/authenticate', {
      username: 'tanaka',
      password: '  exact password  ',
    }, {
      signal: undefined,
      auth: 'omit',
    })
  })

  it.each([
    undefined,
    {},
    { token: '' },
    { token: '   ' },
    { token: 12 },
  ])('rejects a malformed successful payload: %j', async (payload) => {
    vi.spyOn(httpClient, 'post').mockResolvedValue(payload)

    await expect(authenticate({
      username: 'tanaka',
      password: 'password',
    })).rejects.toMatchObject({ source: 'client' })
  })
})

describe('auth router and logout', () => {
  it('resolves the root route from the current client auth state', async () => {
    const guestRouter = createTestRouter()
    await guestRouter.push('/')
    await guestRouter.isReady()
    expect(guestRouter.currentRoute.value.fullPath).toBe('/login')

    setAuthenticatedSession('token', 'tanaka')
    const authenticatedRouter = createTestRouter()
    await authenticatedRouter.push('/')
    await authenticatedRouter.isReady()
    expect(authenticatedRouter.currentRoute.value.fullPath).toBe('/dashboard')
  })

  it('guards protected deep links and restores a safe returnTo after login', async () => {
    const router = createTestRouter()

    await router.push('/students?filter=active')
    await router.isReady()

    expect(router.currentRoute.value.fullPath)
      .toBe('/login?returnTo=/students?filter=active')

    setAuthenticatedSession('token', 'tanaka')
    await router.replace('/dashboard')
    await router.push({
      name: 'login',
      query: { returnTo: '/students?filter=active' },
    })

    expect(router.currentRoute.value.fullPath).toBe('/students?filter=active')
  })

  it('rejects external and unknown returnTo values', () => {
    const router = createTestRouter()

    expect(resolveSafeReturnTo(router, 'https://evil.example'))
      .toBe('/dashboard')
    expect(resolveSafeReturnTo(router, '//evil.example/path'))
      .toBe('/dashboard')
    expect(resolveSafeReturnTo(router, '/missing'))
      .toBe('/dashboard')
    expect(resolveSafeReturnTo(router, ['/students']))
      .toBe('/dashboard')
  })

  it('logs out locally, clears the query cache, and replaces with Login', async () => {
    const router = createTestRouter()
    setAuthenticatedSession('token', 'tanaka')
    await router.push('/dashboard')
    await router.isReady()

    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')
      .mockResolvedValue(undefined)
    const clearSpy = vi.spyOn(queryClient, 'clear')

    await logout(router)

    expect(authSession.isAuthenticated).toBe(false)
    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(clearSpy).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.fullPath).toBe('/login')
  })

  it('handles concurrent auth-expired events as one cleanup and redirect', async () => {
    const router = createTestRouter()
    setAuthenticatedSession('token', 'tanaka')
    await router.push('/dashboard')
    await router.isReady()

    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')
      .mockResolvedValue(undefined)
    const clearSpy = vi.spyOn(queryClient, 'clear')
    installAuthExpiredHandler(router)

    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))

    await vi.waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/login?reason=expired')
    })
    expect(authSession.isAuthenticated).toBe(false)
    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })
})
