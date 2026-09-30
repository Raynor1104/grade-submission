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
import GradeCreatePage from '@/features/grades/pages/GradeCreatePage.vue'

const students = [{ id: 1, name: 'Student One', birthDate: '2000-01-01' }]
const courses = [{ id: 10, code: 'JAVA101', subject: 'Java', description: 'Course' }]
const createdGrade = {
  id: 7,
  score: '8.50',
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

async function mountCreate() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/grades', name: 'grades', component: { template: '<div>Grades</div>' } },
      { path: '/grades/new', name: 'grade-create', component: GradeCreatePage },
      { path: '/students/new', name: 'student-create', component: { template: '<div>Student</div>' } },
      { path: '/courses/new', name: 'course-create', component: { template: '<div>Course</div>' } },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  await router.push('/grades/new')
  await router.isReady()
  activeWrapper = mount(GradeCreatePage, {
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

describe('GradeCreatePage', () => {
  it('loads dependencies, posts one string score, invalidates caches, and returns to Grades', async () => {
    const fetchMock = vi.fn(async (path: string, options?: RequestInit) => {
      if (path === '/api/student/all') return jsonResponse(students)
      if (path === '/api/course/all') return jsonResponse(courses)
      if (path === '/api/grade/student/1/course/10' && options?.method === 'POST') {
        return jsonResponse(createdGrade, 201)
      }
      return jsonResponse({ message: 'Not found' }, 404)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountCreate()

    queryClient?.setQueryData(gradeKeys.all(), [])
    queryClient?.setQueryData(studentKeys.detail(1), students[0])
    queryClient?.setQueryData(courseKeys.detail(10), courses[0])
    queryClient?.setQueryData(studentKeys.gradeACounts(), [])

    expect(wrapper.text()).toContain('Loading students and courses...')
    await settle()
    await wrapper.get('#grade-student').setValue('1')
    await wrapper.get('#grade-course').setValue('10')
    await wrapper.get('#grade-score').setValue('  8.50  ')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    await settle()

    const postCalls = fetchMock.mock.calls.filter(call => call[1]?.method === 'POST')
    expect(postCalls).toHaveLength(1)
    expect(postCalls[0]?.[0]).toBe('/api/grade/student/1/course/10')
    expect(JSON.parse(String(postCalls[0]?.[1]?.body))).toEqual({ score: '8.50' })
    expect(queryClient?.getQueryState(gradeKeys.all())?.isInvalidated).toBe(true)
    expect(queryClient?.getQueryState(studentKeys.detail(1))?.isInvalidated).toBe(true)
    expect(queryClient?.getQueryState(courseKeys.detail(10))?.isInvalidated).toBe(true)
    expect(queryClient?.getQueryState(studentKeys.gradeACounts())?.isInvalidated).toBe(true)
    expect(router.currentRoute.value.path).toBe('/grades')
  })

  it('keeps draft values and hides raw duplicate details after a failed Create', async () => {
    const fetchMock = vi.fn(async (path: string, options?: RequestInit) => {
      if (path === '/api/student/all') return jsonResponse(students)
      if (path === '/api/course/all') return jsonResponse(courses)
      if (options?.method === 'POST') {
        return jsonResponse({ message: 'duplicate key grade_student_course_key' }, 500)
      }
      return jsonResponse({}, 404)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountCreate()
    await settle()

    await wrapper.get('#grade-student').setValue('1')
    await wrapper.get('#grade-course').setValue('10')
    await wrapper.get('#grade-score').setValue('Pass')
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(router.currentRoute.value.path).toBe('/grades/new')
    expect((wrapper.get('#grade-score').element as HTMLInputElement).value).toBe('Pass')
    expect(wrapper.get('[role="alert"]').text()).toContain('already exists or could not be saved')
    expect(wrapper.text()).not.toContain('grade_student_course_key')
  })

  it('refetches stale parents and clears only the missing selection after a 404', async () => {
    let studentLoads = 0
    const fetchMock = vi.fn(async (path: string, options?: RequestInit) => {
      if (path === '/api/student/all') {
        studentLoads += 1
        return jsonResponse(studentLoads === 1 ? students : [])
      }
      if (path === '/api/course/all') return jsonResponse(courses)
      if (options?.method === 'POST') return jsonResponse({ message: 'Student missing' }, 404)
      return jsonResponse({}, 404)
    })
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountCreate()
    await settle()

    await wrapper.get('#grade-student').setValue('1')
    await wrapper.get('#grade-course').setValue('10')
    await wrapper.get('#grade-score').setValue('A')
    await wrapper.get('form').trigger('submit')
    await settle()

    expect((wrapper.get('#grade-student').element as HTMLSelectElement).value).toBe('')
    expect((wrapper.get('#grade-course').element as HTMLSelectElement).value).toBe('10')
    expect((wrapper.get('#grade-score').element as HTMLInputElement).value).toBe('A')
    expect(wrapper.text()).toContain('no longer exists')
    expect(studentLoads).toBe(2)
  })
})
