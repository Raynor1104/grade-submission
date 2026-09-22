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
  QueryClient,
  VueQueryPlugin,
} from '@tanstack/vue-query'
import {
  createMemoryHistory,
  createRouter,
} from 'vue-router'

import { mockStudents } from '@/features/students/model/student.mock'
import StudentsPage from '@/features/students/pages/StudentsPage.vue'

let activeWrapper: VueWrapper | undefined
let queryClient: QueryClient | undefined

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function getPath(input: RequestInfo | URL): string {
  return typeof input === 'string' ? input : input.toString()
}

async function settleQueries(): Promise<void> {
  await flushPromises()
  await new Promise(resolve => setTimeout(resolve, 0))
  await flushPromises()
}

async function mountPage(initialPath = '/students') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/students', component: StudentsPage },
      { path: '/students/new', component: { template: '<div>Add page</div>' } },
      { path: '/students/:id', component: { template: '<div>Detail page</div>' } },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
        gcTime: Infinity,
      },
      mutations: { retry: false },
    },
  })

  await router.push(initialPath)
  await router.isReady()

  activeWrapper = mount(StudentsPage, {
    attachTo: document.body,
    global: {
      plugins: [
        router,
        [VueQueryPlugin, { queryClient }],
      ],
    },
  })

  return {
    wrapper: activeWrapper,
    router,
  }
}

afterEach(() => {
  activeWrapper?.unmount()
  activeWrapper = undefined
  queryClient?.clear()
  queryClient = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('StudentsPage API mode', () => {
  it('loads students from the API and filters without another request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(mockStudents))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, router } = await mountPage('/students?page=2')
    expect(wrapper.text()).toContain('Loading students...')

    await settleQueries()

    expect(wrapper.text()).toContain('Phan Duc Long')
    expect(wrapper.text()).toContain('Showing 11–11 of 11 students')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(getPath(fetchMock.mock.calls[0]?.[0])).toBe('/api/student/all')

    await wrapper.get('#student-search').setValue('  NGUYEN  ')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ q: 'NGUYEN' })
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.text()).not.toContain('Tran Thi B')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await wrapper.get('#student-search').setValue('missing student')
    await flushPromises()

    expect(wrapper.text()).toContain('No students found.')
    expect(wrapper.find('[aria-label="Student list pagination"]').exists()).toBe(false)
  })

  it('does not delete on open/cancel and restores focus to the trigger', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(mockStudents))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = await mountPage()
    await settleQueries()

    const deleteButton = wrapper.findAll('button')
      .find(button => button.text() === 'Delete')

    deleteButton?.element.focus()
    await deleteButton?.trigger('click')

    expect(wrapper.find('dialog').exists()).toBe(true)

    const cancelButton = wrapper.find('dialog').findAll('button')
      .find(button => button.text() === 'Cancel')
    await cancelButton?.trigger('click')
    await flushPromises()

    expect(wrapper.find('dialog').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(document.activeElement).toBe(deleteButton?.element)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('deletes through the API, prevents duplicate confirmation, and clamps page', async () => {
    let apiStudents = [...mockStudents]
    const fetchMock = vi.fn(async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const path = getPath(input)

      if (path === '/api/student/all') {
        return jsonResponse(apiStudents)
      }

      if (path === '/api/student/11' && init?.method === 'DELETE') {
        apiStudents = apiStudents.filter(student => student.id !== 11)
        return new Response(null, { status: 204 })
      }

      return jsonResponse({ message: 'Not found' }, 404)
    })
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, router } = await mountPage('/students?page=2')
    await settleQueries()

    const rowDeleteButton = wrapper.findAll('button')
      .find(button => button.text() === 'Delete')
    await rowDeleteButton?.trigger('click')

    const confirmButton = wrapper.find('dialog').findAll('button')
      .find(button => button.text() === 'Delete')
    await confirmButton?.trigger('click')
    await confirmButton?.trigger('click')
    await settleQueries()

    expect(wrapper.text()).not.toContain('Phan Duc Long')
    expect(router.currentRoute.value.query.page).toBeUndefined()
    expect(wrapper.text()).toContain('Showing 1–10 of 10 students')
    const deleteCalls = fetchMock.mock.calls.filter(([, init]) => (
      init?.method === 'DELETE'
    ))
    expect(deleteCalls).toHaveLength(1)
  })

  it('navigates Add and View to the canonical routes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(mockStudents))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, router } = await mountPage()
    await settleQueries()

    const addButton = wrapper.findAll('button')
      .find(button => button.text() === 'Add Student')
    await addButton?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/students/new')

    await router.push('/students')
    await flushPromises()

    const viewButton = wrapper.findAll('button')
      .find(button => button.text() === 'View')
    await viewButton?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/students/1')
  })
})
