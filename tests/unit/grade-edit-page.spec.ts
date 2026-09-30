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

import {
  courseKeys,
  gradeKeys,
  studentKeys,
} from '@/core/api/query-keys'
import GradeEditPage from '@/features/grades/pages/GradeEditPage.vue'

const grade = {
  id: 7,
  score: 'A',
  student: { id: 1, name: 'Student One' },
  course: { id: 10, code: 'JAVA101', subject: 'Java' },
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

async function mountEdit(path = '/grades/1/10/edit') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/grades', name: 'grades', component: { template: '<div>Grades</div>' } },
      {
        path: '/grades/:studentId/:courseId/edit',
        name: 'grade-edit',
        component: GradeEditPage,
      },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  await router.push(path)
  await router.isReady()
  activeWrapper = mount(GradeEditPage, {
    attachTo: document.body,
    global: { plugins: [router, [VueQueryPlugin, { queryClient }]] },
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

describe('GradeEditPage', () => {
  it('rejects either invalid pair ID before issuing a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountEdit('/grades/nope/0/edit')

    expect(wrapper.text()).toContain('Grade Not Found')
    expect(wrapper.find('form').exists()).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('loads the pair and sends one PUT containing only the trimmed score', async () => {
    let currentGrade = grade
    const fetchMock = vi.fn(async (path: string, options?: RequestInit) => {
      expect(path).toBe('/api/grade/student/1/course/10')
      if (options?.method === 'PUT') {
        currentGrade = { ...grade, score: 'A+' }
        return jsonResponse(currentGrade)
      }
      return jsonResponse(currentGrade)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    queryClient?.setQueryData(gradeKeys.all(), [grade])
    queryClient?.setQueryData(studentKeys.detail(1), grade.student)
    queryClient?.setQueryData(courseKeys.detail(10), grade.course)
    queryClient?.setQueryData(studentKeys.gradeACounts(), [])

    expect(wrapper.text()).toContain('Loading grade...')
    await settle()
    expect(wrapper.text()).toContain('Student One - ID: 1')
    expect(wrapper.text()).toContain('JAVA101 - Java')
    expect(wrapper.findAll('select')).toHaveLength(0)

    await wrapper.get('#grade-score').setValue('  A+  ')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    await settle()

    const putCalls = fetchMock.mock.calls.filter(call => call[1]?.method === 'PUT')
    expect(putCalls).toHaveLength(1)
    expect(JSON.parse(String(putCalls[0]?.[1]?.body))).toEqual({ score: 'A+' })
    expect(queryClient?.getQueryState(gradeKeys.all())?.isInvalidated).toBe(true)
    expect(queryClient?.getQueryState(studentKeys.detail(1))?.isInvalidated).toBe(true)
    expect(queryClient?.getQueryState(courseKeys.detail(10))?.isInvalidated).toBe(true)
    expect(queryClient?.getQueryState(studentKeys.gradeACounts())?.isInvalidated).toBe(true)
    expect(router.currentRoute.value.path).toBe('/grades')
  })

  it('uses a contextual confirm dialog and deletes by pair after confirmation', async () => {
    let deleted = false
    const fetchMock = vi.fn(async (_path: string, options?: RequestInit) => {
      if (options?.method === 'DELETE') {
        deleted = true
        return new Response(null, { status: 204 })
      }
      return deleted
        ? jsonResponse({ message: 'Missing' }, 404)
        : jsonResponse(grade)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()

    const trigger = wrapper.findAll('button').find(button => button.text() === 'Delete Grade')
    trigger?.element.focus()
    await trigger?.trigger('click')
    expect(wrapper.get('dialog').text()).toContain('Student One in JAVA101')

    await wrapper.get('dialog').findAll('button')[0]?.trigger('click')
    await flushPromises()
    expect(wrapper.find('dialog').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger?.element)

    await trigger?.trigger('click')
    await wrapper.get('dialog').findAll('button')[1]?.trigger('click')
    await settle()

    const deleteCalls = fetchMock.mock.calls.filter(call => call[1]?.method === 'DELETE')
    expect(deleteCalls).toHaveLength(1)
    expect(deleteCalls[0]?.[0]).toBe('/api/grade/student/1/course/10')
    expect(router.currentRoute.value.path).toBe('/grades')
  })

  it('loads a new Grade and discards the previous draft when the route pair changes', async () => {
    const secondGrade = {
      id: 8,
      score: 'Pass',
      student: { id: 2, name: 'Student Two' },
      course: { id: 20, code: 'DBI202', subject: 'Database' },
    }
    const fetchMock = vi.fn(async (path: string) => jsonResponse(
      path.endsWith('/student/2/course/20') ? secondGrade : grade,
    ))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()

    await wrapper.get('#grade-score').setValue('Unsaved draft')
    await router.push('/grades/2/20/edit')
    await settle()

    expect(wrapper.text()).toContain('Student Two - ID: 2')
    expect(wrapper.text()).toContain('DBI202 - Database')
    expect((wrapper.get('#grade-score').element as HTMLInputElement).value).toBe('Pass')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('keeps the draft after PUT failure and turns an update 404 into Not Found', async () => {
    let putStatus = 500
    const fetchMock = vi.fn(async (_path: string, options?: RequestInit) => (
      options?.method === 'PUT'
        ? jsonResponse({ message: 'Raw backend detail' }, putStatus)
        : jsonResponse(grade)
    ))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountEdit()
    await settle()

    await wrapper.get('#grade-score').setValue('Draft')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(router.currentRoute.value.path).toBe('/grades/1/10/edit')
    expect((wrapper.get('#grade-score').element as HTMLInputElement).value).toBe('Draft')
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to update the grade')
    expect(wrapper.text()).not.toContain('Raw backend detail')

    putStatus = 404
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(wrapper.text()).toContain('Grade Not Found')
    expect(wrapper.find('form').exists()).toBe(false)
  })
})
