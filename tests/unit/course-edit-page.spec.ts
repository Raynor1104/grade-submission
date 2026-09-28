import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createMemoryHistory, createRouter } from 'vue-router'

import { courseKeys, gradeKeys } from '@/core/api/query-keys'
import CourseDetailPage from '@/features/courses/pages/CourseDetailPage.vue'
import CourseEditPage from '@/features/courses/pages/CourseEditPage.vue'

const course = {
  id: 12,
  code: 'JAVA101',
  subject: 'Java',
  description: 'Original',
}
let activeWrapper: VueWrapper | undefined
let queryClient: QueryClient | undefined

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function settle(): Promise<void> {
  await flushPromises()
  await new Promise(resolve => setTimeout(resolve, 0))
  await flushPromises()
}

async function mountEdit(path = '/courses/12/edit') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/courses', name: 'courses', component: { template: '<div>Courses</div>' } },
      { path: '/courses/:id/edit', name: 'course-edit', component: CourseEditPage },
      { path: '/courses/:id', name: 'course-detail', component: { template: '<div>Detail</div>' } },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  await router.push(path)
  await router.isReady()
  activeWrapper = mount(CourseEditPage, {
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

describe('CourseEditPage', () => {
  it('rejects invalid IDs before issuing a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountEdit('/courses/nope/edit')

    expect(wrapper.text()).toContain('Course Not Found')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads Course and sends one PUT with route identity', async () => {
    const fetchMock = vi.fn(async (path: string, options?: RequestInit) => {
      if (options?.method === 'PUT') {
        return jsonResponse({
          ...course,
          code: 'java201',
          subject: 'Advanced Java',
          description: 'Updated',
        })
      }

      expect(path).toBe('/api/course/12')
      return jsonResponse(course)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    queryClient?.setQueryData(courseKeys.all(), [course])
    queryClient?.setQueryData(gradeKeys.all(), [{ id: 1 }])

    expect(wrapper.text()).toContain('Loading course...')
    await settle()
    expect((wrapper.get('#course-code').element as HTMLInputElement).value).toBe('JAVA101')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.get('#course-code').setValue('  java201  ')
    await wrapper.get('#course-subject').setValue('  Advanced Java  ')
    await wrapper.get('#course-description').setValue('  Updated  ')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    await settle()

    const calls = fetchMock.mock.calls.filter(call => call[1]?.method === 'PUT')
    expect(calls).toHaveLength(1)
    expect(calls[0]?.[0]).toBe('/api/course/12')
    expect(JSON.parse(String(calls[0]?.[1]?.body))).toEqual({
      code: 'java201',
      subject: 'Advanced Java',
      description: 'Updated',
    })
    expect(queryClient?.getQueryData(courseKeys.detail(12))).toEqual({
      ...course,
      code: 'java201',
      subject: 'Advanced Java',
      description: 'Updated',
    })
    expect(queryClient?.getQueryState(courseKeys.all())?.isInvalidated).toBe(true)
    expect(queryClient?.getQueryState(gradeKeys.all())?.isInvalidated).toBe(true)
    expect(router.currentRoute.value.path).toBe('/courses/12')
  })

  it('cancels to Courses without a PUT request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(course))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()

    await wrapper.get('#course-subject').setValue('Unsaved')
    await wrapper.findAll('button').find(button => button.text() === 'Cancel')?.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/courses')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows GET 404 without a form and retries a transient load failure', async () => {
    let attempts = 0
    const fetchMock = vi.fn(async () => {
      attempts += 1
      return attempts === 1
        ? jsonResponse({ message: 'Unavailable' }, 503)
        : jsonResponse(course)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountEdit()
    await settle()

    expect(wrapper.text()).toContain('Unable to load course')
    await wrapper.get('button').trigger('click')
    await settle()

    expect((wrapper.get('#course-subject').element as HTMLInputElement).value).toBe('Java')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('renders Not Found for a missing Course', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'Missing' }, 404)))
    const { wrapper } = await mountEdit()
    await settle()

    expect(wrapper.text()).toContain('Course Not Found')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('loads the new Course when the route ID changes', async () => {
    const fetchMock = vi.fn(async (path: string) => jsonResponse(
      path.endsWith('/13')
        ? { id: 13, code: 'DBI202', subject: 'Database', description: 'Second' }
        : course,
    ))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()

    await wrapper.get('#course-description').setValue('Unsaved draft')
    await router.push('/courses/13/edit')
    await settle()

    expect((wrapper.get('#course-code').element as HTMLInputElement).value).toBe('DBI202')
    expect((wrapper.get('#course-description').element as HTMLTextAreaElement).value).toBe('Second')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retains edited values when PUT fails and handles an update 404 safely', async () => {
    let putStatus = 500
    const fetchMock = vi.fn(async (_path: string, options?: RequestInit) =>
      options?.method === 'PUT'
        ? jsonResponse({ message: 'Failure' }, putStatus)
        : jsonResponse(course))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()

    await wrapper.get('#course-description').setValue('Draft')
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(router.currentRoute.value.path).toBe('/courses/12/edit')
    expect((wrapper.get('#course-description').element as HTMLTextAreaElement).value).toBe('Draft')
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to update the course')

    putStatus = 404
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.text()).toContain('Course Not Found')
    expect(wrapper.find('form').exists()).toBe(false)
  })
})

describe('Course Detail Edit entry point', () => {
  it('navigates a valid Course ID to the Edit route', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/courses/:id', name: 'course-detail', component: CourseDetailPage },
        { path: '/courses/:id/edit', name: 'course-edit', component: { template: '<div>Edit</div>' } },
      ],
    })
    await router.push('/courses/12')
    await router.isReady()
    activeWrapper = mount(CourseDetailPage, { global: { plugins: [router] } })

    await activeWrapper.get('button').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/courses/12/edit')
  })
})
