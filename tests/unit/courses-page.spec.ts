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

import CoursesPage from '@/features/courses/pages/CoursesPage.vue'

const courses = Array.from({ length: 11 }, (_, index) => ({
  id: index + 1,
  code: index === 10 ? 'DBI202' : `COURSE${index + 1}`,
  subject: index === 10 ? 'Database Systems' : `Course ${index + 1}`,
  description: `Description ${index + 1}`,
}))

let activeWrapper: VueWrapper | undefined
let queryClient: QueryClient | undefined

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function settleQueries(): Promise<void> {
  await flushPromises()
  await new Promise(resolve => setTimeout(resolve, 0))
  await flushPromises()
}

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/courses', component: CoursesPage },
      { path: '/courses/new', component: { template: '<div>Add page</div>' } },
      { path: '/courses/:id', component: { template: '<div>Detail page</div>' } },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
        gcTime: Infinity,
      },
    },
  })

  await router.push('/courses')
  await router.isReady()

  activeWrapper = mount(CoursesPage, {
    attachTo: document.body,
    global: {
      plugins: [
        router,
        [VueQueryPlugin, { queryClient }],
      ],
    },
  })

  return { wrapper: activeWrapper, router }
}

afterEach(() => {
  activeWrapper?.unmount()
  activeWrapper = undefined
  queryClient?.clear()
  queryClient = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('CoursesPage API mode', () => {
  it('loads courses from the API and searches the cached list', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(courses))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = await mountPage()
    expect(wrapper.text()).toContain('Loading courses...')

    await settleQueries()

    expect(wrapper.text()).toContain('Course 1')
    expect(wrapper.text()).not.toContain('Database Systems')
    expect(wrapper.text()).toContain('Showing 1–10 of 11 courses')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/course/all')

    await wrapper.get('input').setValue('database')
    await flushPromises()

    expect(wrapper.text()).toContain('Database Systems')
    expect(wrapper.text()).not.toContain('Course 1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows a load error and retries the API request', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Failed' }, 500))
      .mockResolvedValueOnce(jsonResponse(courses))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = await mountPage()
    await settleQueries()

    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load courses')

    const retryButton = wrapper.findAll('button')
      .find(button => button.text() === 'Retry')
    await retryButton?.trigger('click')
    await settleQueries()

    expect(wrapper.text()).toContain('Course 1')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('navigates Add and View to the course routes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(courses)))

    const { wrapper, router } = await mountPage()
    await settleQueries()

    const addButton = wrapper.findAll('button')
      .find(button => button.text() === 'Add Course')
    await addButton?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/courses/new')

    await router.push('/courses')
    await flushPromises()

    const viewButton = wrapper.findAll('button')
      .find(button => button.text() === 'View')
    await viewButton?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/courses/1')
  })
})
