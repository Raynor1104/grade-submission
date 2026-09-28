import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createMemoryHistory, createRouter } from 'vue-router'

import { courseKeys } from '@/core/api/query-keys'
import CourseCreatePage from '@/features/courses/pages/CourseCreatePage.vue'

let activeWrapper: VueWrapper | undefined
let queryClient: QueryClient | undefined

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function mountCreatePage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/courses', name: 'courses', component: { template: '<div>Courses</div>' } },
      { path: '/courses/new', name: 'course-create', component: CourseCreatePage },
      { path: '/courses/:id', name: 'course-detail', component: { template: '<div>Detail</div>' } },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  await router.push('/courses/new')
  await router.isReady()
  activeWrapper = mount(CourseCreatePage, {
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

describe('CourseCreatePage', () => {
  it('posts one normalized payload, invalidates courses, and navigates to detail', async () => {
    const created = {
      id: 21,
      code: 'java101',
      subject: 'Java Programming',
      description: 'First\nSecond',
    }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(created))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountCreatePage()
    queryClient?.setQueryData(courseKeys.all(), [])

    await wrapper.get('#course-code').setValue('  java101  ')
    await wrapper.get('#course-subject').setValue('  Java Programming  ')
    await wrapper.get('#course-description').setValue('  First\nSecond  ')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/course')
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual({
      code: 'java101',
      subject: 'Java Programming',
      description: 'First\nSecond',
    })
    expect(queryClient?.getQueryState(courseKeys.all())?.isInvalidated).toBe(true)
    expect(router.currentRoute.value.path).toBe('/courses/21')
  })

  it('does not call the API for invalid values and Cancel returns to Courses', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountCreatePage()

    await wrapper.get('form').trigger('submit')
    expect(fetchMock).not.toHaveBeenCalled()

    await wrapper.findAll('button').find(button => button.text() === 'Cancel')?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/courses')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps values and hides raw backend details after failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      message: 'duplicate key violates constraint course_code_key',
    }, 500)))
    const { wrapper, router } = await mountCreatePage()

    await wrapper.get('#course-code').setValue('JAVA101')
    await wrapper.get('#course-subject').setValue('Java')
    await wrapper.get('#course-description').setValue('Draft')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/courses/new')
    expect((wrapper.get('#course-description').element as HTMLTextAreaElement).value).toBe('Draft')
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to save the course')
    expect(wrapper.text()).not.toContain('course_code_key')
  })

  it('does not submit twice while the POST is pending', async () => {
    let finishRequest: ((response: Response) => void) | undefined
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>(resolve => {
      finishRequest = resolve
    }))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountCreatePage()

    await wrapper.get('#course-code').setValue('JAVA101')
    await wrapper.get('#course-subject').setValue('Java')
    await wrapper.get('#course-description').setValue('Description')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    finishRequest?.(jsonResponse({
      id: 21,
      code: 'JAVA101',
      subject: 'Java',
      description: 'Description',
    }))
    await flushPromises()
  })
})
