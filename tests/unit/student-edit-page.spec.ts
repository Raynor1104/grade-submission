import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createMemoryHistory, createRouter } from 'vue-router'

import StudentEditPage from '@/features/students/pages/StudentEditPage.vue'
import { studentKeys } from '@/core/api/query-keys'

const student = { id: 12, name: 'Original', birthDate: '1980-07-31' }
let activeWrapper: VueWrapper | undefined
let queryClient: QueryClient | undefined

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status })
}

async function settle(): Promise<void> {
  await flushPromises()
  await new Promise(resolve => setTimeout(resolve, 0))
  await flushPromises()
}

async function mountEdit(path = '/students/12/edit') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/students/:id/edit', component: StudentEditPage },
      { path: '/students', component: { template: '<div>Students</div>' } },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  await router.push(path)
  await router.isReady()
  activeWrapper = mount(StudentEditPage, {
    global: { plugins: [router, [VueQueryPlugin, { queryClient }]] },
  })
  return { wrapper: activeWrapper, router }
}

afterEach(() => {
  activeWrapper?.unmount()
  activeWrapper = undefined
  queryClient?.clear()
  queryClient = undefined
  vi.unstubAllGlobals()
})

describe('StudentEditPage', () => {
  it('cancels back to the list without a PUT request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(student))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()
    await wrapper.get('#student-name').setValue('Unsaved name')
    await wrapper.findAll('button').find(button => button.text() === 'Cancel')?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/students')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid IDs before issuing a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountEdit('/students/nope/edit')
    expect(wrapper.text()).toContain('Student Not Found')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads student and sends one PUT with route identity', async () => {
    const fetchMock = vi.fn(async (path: string, options?: RequestInit) => {
      if (options?.method === 'PUT') {
        return jsonResponse({ ...student, name: 'Edited' })
      }
      expect(path).toBe('/api/student/12')
      return jsonResponse(student)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    expect(wrapper.text()).toContain('Loading student...')
    await settle()
    expect((wrapper.get('#student-name').element as HTMLInputElement).value).toBe('Original')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.get('#student-name').setValue('  Edited  ')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    await settle()

    const calls = fetchMock.mock.calls.filter(call => call[1]?.method === 'PUT')
    expect(calls).toHaveLength(1)
    expect(calls[0]?.[0]).toBe('/api/student/12')
    expect(JSON.parse(String(calls[0]?.[1]?.body))).toEqual({
      name: 'Edited', birthDate: '1980-07-31',
    })
    expect(queryClient?.getQueryData(studentKeys.detail(12))).toEqual({
      ...student, name: 'Edited',
    })
    expect(router.currentRoute.value.path).toBe('/students')
  })

  it('shows 404 without form and retries a transient GET error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'Missing' }, 404))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountEdit()
    await settle()
    expect(wrapper.text()).toContain('Student Not Found')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries a failed GET without submitting an update', async () => {
    let attempts = 0
    const fetchMock = vi.fn(async () => {
      attempts += 1
      return attempts === 1
        ? jsonResponse({ message: 'Unavailable' }, 503)
        : jsonResponse(student)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountEdit()
    await settle()
    expect(wrapper.text()).toContain('Unable to load student')
    await wrapper.get('button').trigger('click')
    await settle()
    expect((wrapper.get('#student-name').element as HTMLInputElement).value).toBe('Original')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('loads the new entity when the route ID changes', async () => {
    const fetchMock = vi.fn(async (path: string) => jsonResponse(
      path.endsWith('/13')
        ? { id: 13, name: 'Second', birthDate: '1990-01-01' }
        : student,
    ))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()
    await wrapper.get('#student-name').setValue('Unsaved draft')
    await router.push('/students/13/edit')
    await settle()
    expect((wrapper.get('#student-name').element as HTMLInputElement).value).toBe('Second')
    expect(wrapper.text()).toContain('13')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retains edited values when PUT fails', async () => {
    const fetchMock = vi.fn(async (_path: string, options?: RequestInit) =>
      options?.method === 'PUT'
        ? jsonResponse({ message: 'Failure' }, 500)
        : jsonResponse(student))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()
    await wrapper.get('#student-name').setValue('Draft')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(router.currentRoute.value.path).toBe('/students/12/edit')
    expect((wrapper.get('#student-name').element as HTMLInputElement).value).toBe('Draft')
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to update student')
  })
})
