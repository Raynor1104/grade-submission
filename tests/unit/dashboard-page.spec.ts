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
import DashboardPage from '@/features/dashboard/pages/DashboardPage.vue'

const students = [
  { id: 1, name: 'Nguyen Van A', birthDate: '2000-01-01' },
  { id: 2, name: 'Tran Thi B', birthDate: '2000-02-02' },
  { id: 3, name: 'Le Van C', birthDate: '2000-03-03' },
]

const courses = [
  {
    id: 10,
    code: 'JAVA101',
    subject: 'Java Programming',
    description: 'Java',
  },
  {
    id: 20,
    code: 'DBI202',
    subject: 'Database Systems',
    description: 'Database',
  },
]

const grades = [
  {
    id: 101,
    score: 'A',
    student: { id: 1, name: 'Nguyen Van A' },
    course: { id: 10, code: 'JAVA101', subject: 'Java Programming' },
  },
  {
    id: 102,
    score: 'Pass',
    student: { id: 2, name: 'Tran Thi B' },
    course: { id: 20, code: 'DBI202', subject: 'Database Systems' },
  },
]

let wrapper: VueWrapper | undefined
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

async function mountDashboard(warmCache = false) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: DashboardPage },
      { path: '/students/new', component: { template: '<div />' } },
      { path: '/courses/new', component: { template: '<div />' } },
      { path: '/grades', component: { template: '<div />' } },
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

  if (warmCache) {
    queryClient.setQueryData(studentKeys.all(), students)
    queryClient.setQueryData(courseKeys.all(), courses)
    queryClient.setQueryData(gradeKeys.all(), grades)
  }

  await router.push('/dashboard')
  await router.isReady()

  wrapper = mount(DashboardPage, {
    attachTo: document.body,
    global: {
      plugins: [
        router,
        [VueQueryPlugin, { queryClient }],
      ],
    },
  })

  return { wrapper, router, queryClient }
}

async function settleQueries(): Promise<void> {
  await flushPromises()
  await new Promise(resolve => setTimeout(resolve, 0))
  await flushPromises()
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  queryClient?.clear()
  queryClient = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('DashboardPage', () => {
  it('loads all three sources and renders truthful derived sections', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const path = getPath(input)

      if (path.endsWith('/student/all')) return Promise.resolve(jsonResponse(students))
      if (path.endsWith('/course/all')) return Promise.resolve(jsonResponse(courses))
      if (path.endsWith('/grade/all')) return Promise.resolve(jsonResponse(grades))

      return Promise.resolve(jsonResponse({}, 404))
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await mountDashboard()
    await settleQueries()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls.map(call => getPath(call[0]))).toEqual(
      expect.arrayContaining([
        '/api/student/all',
        '/api/course/all',
        '/api/grade/all',
      ]),
    )
    expect(result.wrapper.get('h1').text()).toBe('Dashboard')
    expect(result.wrapper.findAll('.summary-card__count').map(node => node.text()))
      .toEqual(['3', '2', '2'])
    expect(result.wrapper.text()).toContain('JAVA101')
    expect(result.wrapper.text()).toContain('DBI202')
    expect(result.wrapper.text()).toContain('Students without grades')
    expect(result.wrapper.findAll('.attention-item__value').map(node => node.text()))
      .toEqual(['1', '0'])
    expect(result.wrapper.text()).toContain('Pass')
    expect(result.wrapper.text()).not.toContain('Recent Activities')
    expect(result.wrapper.text()).not.toContain('450')
  })

  it('renders successful empty collections as zero and informative empty states', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse([]))))

    const result = await mountDashboard()
    await settleQueries()

    expect(result.wrapper.findAll('.summary-card__count').map(node => node.text()))
      .toEqual(['0', '0', '0'])
    expect(result.wrapper.text()).toContain('No courses available.')
    expect(result.wrapper.text()).toContain('No grade records available.')
    expect(result.wrapper.findAll('.attention-item__value').map(node => node.text()))
      .toEqual(['0', '0'])
  })

  it('reuses fresh domain cache without making duplicate requests', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await mountDashboard(true)
    await settleQueries()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.wrapper.findAll('.summary-card__count').map(node => node.text()))
      .toEqual(['3', '2', '2'])
    expect(result.wrapper.text()).toContain('JAVA101')
    expect(result.wrapper.text()).toContain('Pass')
  })

  it('keeps successful data usable when Students fails and retries only Students', async () => {
    let studentAttempts = 0
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const path = getPath(input)

      if (path.endsWith('/student/all')) {
        studentAttempts += 1

        return Promise.resolve(studentAttempts === 1
          ? jsonResponse({ message: 'Student service failed' }, 500)
          : jsonResponse(students))
      }

      if (path.endsWith('/course/all')) return Promise.resolve(jsonResponse(courses))
      if (path.endsWith('/grade/all')) return Promise.resolve(jsonResponse(grades))

      return Promise.resolve(jsonResponse({}, 404))
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await mountDashboard()
    await settleQueries()

    expect(result.wrapper.get('[aria-label="Retry loading Total Students"]'))
      .toBeTruthy()
    expect(result.wrapper.text()).toContain('Number of grade records for each course')
    expect(result.wrapper.text()).toContain('JAVA101')
    expect(result.wrapper.text()).toContain('Grade Records')
    expect(result.wrapper.text()).toContain('Unavailable')
    expect(result.wrapper.text()).not.toContain('Student service failed')

    await result.wrapper
      .get('[aria-label="Retry loading Total Students"]')
      .trigger('click')
    await settleQueries()

    expect(studentAttempts).toBe(2)
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(result.wrapper.findAll('.summary-card__count').map(node => node.text()))
      .toEqual(['3', '2', '2'])
    expect(result.wrapper.findAll('.attention-item__value').map(node => node.text()))
      .toEqual(['1', '0'])
  })

  it('keeps parent totals visible when Grades fails and marks every grade dependency unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const path = getPath(input)

      if (path.endsWith('/student/all')) return Promise.resolve(jsonResponse(students))
      if (path.endsWith('/course/all')) return Promise.resolve(jsonResponse(courses))
      if (path.endsWith('/grade/all')) {
        return Promise.resolve(jsonResponse({ message: 'Grade service failed' }, 500))
      }

      return Promise.resolve(jsonResponse({}, 404))
    }))

    const result = await mountDashboard()
    await settleQueries()

    expect(result.wrapper.findAll('.summary-card__count').map(node => node.text()))
      .toEqual(['3', '2'])
    expect(result.wrapper.get('[aria-label="Retry loading Total Grades"]'))
      .toBeTruthy()
    expect(result.wrapper.text()).toContain('Course grade counts are unavailable.')
    expect(result.wrapper.text()).toContain('Grade records are unavailable.')
    expect(result.wrapper.findAll('.attention-item__unavailable')).toHaveLength(2)
    expect(result.wrapper.text()).not.toContain('Grade service failed')
  })
})
