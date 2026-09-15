import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'
import {
  mount,
  type VueWrapper,
} from '@vue/test-utils'
import {
  createMemoryHistory,
  createRouter,
} from 'vue-router'

import DashboardGradeRecords from '@/features/dashboard/components/DashboardGradeRecords.vue'
import DashboardQuickActions from '@/features/dashboard/components/DashboardQuickActions.vue'
import DashboardSummaryCard from '@/features/dashboard/components/DashboardSummaryCard.vue'
import DataAttentionCard from '@/features/dashboard/components/DataAttentionCard.vue'
import GradesByCourseCard from '@/features/dashboard/components/GradesByCourseCard.vue'

let wrapper: VueWrapper | undefined

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/students/new', component: { template: '<div />' } },
      { path: '/courses/new', component: { template: '<div />' } },
      { path: '/grades', component: { template: '<div />' } },
    ],
  })
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('Dashboard components', () => {
  it('distinguishes a loaded zero from loading and error summary states', async () => {
    wrapper = mount(DashboardSummaryCard, {
      props: {
        label: 'Total Students',
        count: 0,
        isLoading: false,
        isError: false,
      },
    })

    expect(wrapper.get('.summary-card__count').text()).toBe('0')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)

    await wrapper.setProps({ isError: true })
    await wrapper.get('button').trigger('click')

    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load.')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('renders two real quick-action links and a non-link disabled Grade action', () => {
    const router = createTestRouter()
    wrapper = mount(DashboardQuickActions, {
      global: { plugins: [router] },
    })

    const links = wrapper.findAll('a')

    expect(links.map(link => link.attributes('href'))).toEqual([
      '/students/new',
      '/courses/new',
    ])
    expect(wrapper.get('[aria-disabled="true"]').text())
      .toContain('Unavailable until grade submission is implemented')
    expect(wrapper.text()).not.toContain('/grades/new')
  })

  it('renders textual course counts and emits retry for the failed source', async () => {
    const router = createTestRouter()
    wrapper = mount(GradesByCourseCard, {
      props: {
        rows: [{
          courseId: 1,
          courseCode: 'JAVA101',
          courseName: 'Java Programming',
          gradeCount: 2,
          barPercent: 100,
        }],
        isLoading: false,
        errorSources: [],
      },
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('JAVA101')
    expect(wrapper.text()).toContain('2 grade records')
    expect(wrapper.get('.course-grades__bar').attributes('style')).toContain('100%')

    await wrapper.setProps({ errorSources: ['courses'] })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toEqual([['courses']])
  })

  it('keeps attention metrics independent and retries their unavailable dependencies', async () => {
    wrapper = mount(DataAttentionCard, {
      props: {
        studentsWithoutGrades: null,
        coursesWithoutGrades: 3,
        studentLoading: false,
        courseLoading: false,
        studentErrorSources: ['students'],
        courseErrorSources: [],
      },
    })

    expect(wrapper.findAll('[role="alert"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('Unavailable')
    expect(wrapper.text()).toContain('3')

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('retry')).toEqual([['students']])
  })

  it('renders grade records with string scores and an empty state', async () => {
    const router = createTestRouter()
    wrapper = mount(DashboardGradeRecords, {
      props: {
        grades: [{
          id: 1,
          score: 'Pass',
          student: { id: 1, name: 'Nguyen Van A' },
          course: { id: 2, code: 'JAVA101', subject: 'Java Programming' },
        }],
        isLoading: false,
        isError: false,
      },
      global: { plugins: [router] },
    })

    expect(wrapper.findAll('th').map(header => header.text())).toEqual([
      'Student',
      'Course',
      'Score',
    ])
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.text()).toContain('Pass')

    await wrapper.setProps({ grades: [] })
    expect(wrapper.text()).toContain('No grade records available.')
  })
})
