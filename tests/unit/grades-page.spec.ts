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

import GradesPage from '@/features/grades/pages/GradesPage.vue'
import { gradeKeys } from '@/core/api/query-keys'

const students = [
  { id: 1, name: 'Student One', birthDate: '2000-01-01' },
  { id: 2, name: 'Student Two', birthDate: '2000-02-02' },
  { id: 3, name: 'Student Without Grade', birthDate: '2000-03-03' },
]

const courses = [
  { id: 10, code: 'JAVA101', subject: 'Java', description: 'Java course' },
  { id: 20, code: 'DBI202', subject: 'Database', description: 'Database course' },
  { id: 30, code: 'SWT301', subject: 'Testing', description: 'Testing course' },
]

const grades = Array.from({ length: 7 }, (_, index) => {
  const isEven = index % 2 === 0

  return {
    id: index + 1,
    score: isEven ? 'A' : 'B+',
    student: isEven
      ? { id: 1, name: 'Student One' }
      : { id: 2, name: 'Student Two' },
    course: isEven
      ? { id: 10, code: 'JAVA101', subject: 'Java' }
      : { id: 20, code: 'DBI202', subject: 'Database' },
  }
})

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

function createApiResponse(path: string): Response {
  if (path === '/api/grade/all') return jsonResponse(grades)
  if (path === '/api/student/all') return jsonResponse(students)
  if (path === '/api/course/all') return jsonResponse(courses)

  return jsonResponse({ message: 'Not found' }, 404)
}

function mountPage() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
        gcTime: Infinity,
      },
    },
  })

  activeWrapper = mount(GradesPage, {
    attachTo: document.body,
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  })

  return activeWrapper
}

afterEach(() => {
  activeWrapper?.unmount()
  activeWrapper = undefined
  queryClient?.clear()
  queryClient = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('GradesPage API mode', () => {
  it('loads grades and filter options from APIs, then filters cached data', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => (
      Promise.resolve(createApiResponse(getPath(input)))
    ))
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Loading grade data...')

    await settleQueries()

    expect(wrapper.text()).toContain('Showing 1–6 of 7 grades')
    expect(wrapper.text()).toContain('Student Without Grade')
    expect(wrapper.text()).toContain('SWT301')
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls.map(([input]) => getPath(input)).sort()).toEqual([
      '/api/course/all',
      '/api/grade/all',
      '/api/student/all',
    ])

    const [studentSelect] = wrapper.findAll('select')
    await studentSelect?.setValue('2')
    const searchButton = wrapper.findAll('button')
      .find(button => button.text() === 'Search')
    await searchButton?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Student Two')
    expect(wrapper.find('tbody').text()).not.toContain('Student One')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('retries only the API source that failed', async () => {
    let gradeAttempts = 0
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const path = getPath(input)

      if (path === '/api/grade/all' && gradeAttempts++ === 0) {
        return Promise.resolve(jsonResponse({ message: 'Failed' }, 500))
      }

      return Promise.resolve(createApiResponse(path))
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mountPage()
    await settleQueries()

    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load grade data')

    const retryButton = wrapper.findAll('button')
      .find(button => button.text() === 'Retry')
    await retryButton?.trigger('click')
    await settleQueries()

    expect(wrapper.text()).toContain('Showing 1–6 of 7 grades')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('deletes by student/course pair and retains the dialog after an API error', async () => {
    let apiGrades = [...grades]
    let deleteAttempts = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = getPath(input)

      if (path === '/api/grade/all') return jsonResponse(apiGrades)
      if (path === '/api/student/all') return jsonResponse(students)
      if (path === '/api/course/all') return jsonResponse(courses)
      if (path === '/api/grade/student/1/course/10' && init?.method === 'DELETE') {
        if (deleteAttempts++ === 0) return jsonResponse({ message: 'Failed' }, 500)
        apiGrades = apiGrades.filter(grade => (
          grade.student.id !== 1 || grade.course.id !== 10
        ))
        return new Response(null, { status: 204 })
      }

      return jsonResponse({ message: 'Not found' }, 404)
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mountPage()
    await settleQueries()

    const trigger = wrapper.findAll('button').find(button => button.text() === 'Delete')
    trigger?.element.focus()
    await trigger?.trigger('click')
    expect(wrapper.get('dialog').text()).toContain('Student One in JAVA101')

    await wrapper.get('dialog').findAll('button')[0]?.trigger('click')
    await flushPromises()
    expect(wrapper.find('dialog').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger?.element)

    await trigger?.trigger('click')
    await wrapper.get('dialog').findAll('button')[1]?.trigger('click')
    await settleQueries()
    expect(wrapper.get('dialog [role="alert"]').text()).toContain('Unable to delete grade')

    await wrapper.get('dialog').findAll('button')[1]?.trigger('click')
    await settleQueries()
    expect(wrapper.find('dialog').exists()).toBe(false)
    expect(wrapper.find('tbody').text()).not.toContain('Student One')
    expect(queryClient?.getQueryData(gradeKeys.all())).toEqual(apiGrades)
    expect(deleteAttempts).toBe(2)
  })
})
