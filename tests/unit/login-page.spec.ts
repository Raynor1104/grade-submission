import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  flushPromises,
  mount,
  type VueWrapper,
} from '@vue/test-utils'
import {
  createMemoryHistory,
  createRouter,
} from 'vue-router'

import { clearAuthenticatedSession } from '@/core/auth/auth-session'
import LoginPage from '@/features/auth/pages/LoginPage.vue'

let wrapper: VueWrapper | undefined

async function mountPage(initialPath = '/login') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: LoginPage },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' }, meta: { requiresAuth: true } },
      { path: '/students', name: 'students', component: { template: '<div>Students</div>' }, meta: { requiresAuth: true } },
    ],
  })

  await router.push(initialPath)
  await router.isReady()
  wrapper = mount(LoginPage, {
    attachTo: document.body,
    global: { plugins: [router] },
  })

  return { wrapper, router }
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  clearAuthenticatedSession()
  window.sessionStorage.clear()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('LoginPage', () => {
  it('renders the target content and an expired-session notice', async () => {
    const result = await mountPage('/login?reason=expired')

    expect(result.wrapper.text()).toContain('GRADE SUBMISSION SYSTEM')
    expect(result.wrapper.text()).toContain('Submit grades more')
    expect(result.wrapper.text()).toContain('Access restricted to authorized faculty and staff only')
    expect(result.wrapper.get('[role="alert"]').text())
      .toContain('Your session has expired')
  })

  it('logs in, persists session data, omits Authorization, and follows safe returnTo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ token: 'new-token' }),
      { status: 200 },
    ))
    vi.stubGlobal('fetch', fetchMock)
    const result = await mountPage('/login?returnTo=/students')

    await result.wrapper.get('#login-username').setValue('  tanaka  ')
    await result.wrapper.get('#login-password').setValue(' secret ')
    await result.wrapper.get('form').trigger('submit')
    await flushPromises()

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/authenticate')
    expect(new Headers(options.headers).has('Authorization')).toBe(false)
    expect(options.body).toBe(JSON.stringify({
      username: 'tanaka',
      password: ' secret ',
    }))
    expect(sessionStorage.getItem('grade-submission.auth.token')).toBe('new-token')
    expect(sessionStorage.getItem('grade-submission.auth.username')).toBe('tanaka')
    expect(result.router.currentRoute.value.fullPath).toBe('/students')
  })

  it('keeps the user on Login and shows safe copy for invalid credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ message: 'Internal authentication details' }),
      { status: 401 },
    )))
    const result = await mountPage()

    await result.wrapper.get('#login-username').setValue('tanaka')
    await result.wrapper.get('#login-password').setValue('wrong')
    await result.wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(result.wrapper.get('[role="alert"]').text())
      .toBe('Invalid username or password.')
    expect(result.wrapper.text()).not.toContain('Internal authentication details')
    expect(result.router.currentRoute.value.fullPath).toBe('/login')
    expect(sessionStorage.getItem('grade-submission.auth.token')).toBeNull()
  })
})
