import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'
import {
  flushPromises,
  mount,
  type VueWrapper,
} from '@vue/test-utils'

import GradeForm from '@/features/grades/components/GradeForm.vue'
import {
  normalizeGradeForm,
  parsePositiveRouteId,
  validateGradeForm,
} from '@/features/grades/model/grade-form'

const students = [{ id: 1, name: 'Student One' }]
const courses = [{ id: 10, code: 'JAVA101', subject: 'Java' }]
let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('grade form model', () => {
  it('trims score without changing its string representation', () => {
    expect(normalizeGradeForm({
      studentId: 1,
      courseId: 10,
      score: '  8.50  ',
    })).toEqual({ studentId: 1, courseId: 10, score: '8.50' })
  })

  it('validates Create options and only requires a non-empty score in Edit', () => {
    expect(validateGradeForm({ studentId: null, courseId: 99, score: ' ' }, {
      mode: 'create',
      studentIds: [1],
      courseIds: [10],
    })).toEqual({
      studentId: 'Student is required.',
      courseId: 'Course is required.',
      score: 'Grade is required.',
    })

    expect(validateGradeForm({ studentId: 1, courseId: 10, score: 'Pass' }, {
      mode: 'edit',
    })).toEqual({})
  })

  it('accepts only positive safe-integer route IDs', () => {
    expect(parsePositiveRouteId('12')).toBe(12)
    expect(parsePositiveRouteId('abc')).toBeNull()
    expect(parsePositiveRouteId('0')).toBeNull()
    expect(parsePositiveRouteId('-1')).toBeNull()
    expect(parsePositiveRouteId('1.5')).toBeNull()
    expect(parsePositiveRouteId('9007199254740992')).toBeNull()
  })
})

describe('GradeForm', () => {
  it('renders Create selectors and emits a normalized free-form value', async () => {
    wrapper = mount(GradeForm, {
      attachTo: document.body,
      props: { mode: 'create', students, courses },
    })

    expect(wrapper.get('#grade-student').text()).toContain('Student One - ID: 1')
    expect(wrapper.get('#grade-course').text()).toContain('JAVA101 - Java')
    expect(wrapper.text()).not.toContain('Delete Grade')

    await wrapper.get('#grade-student').setValue('1')
    await wrapper.get('#grade-course').setValue('10')
    await wrapper.get('#grade-score').setValue('  8.50  ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      studentId: 1,
      courseId: 10,
      score: '8.50',
    }])
  })

  it('shows accessible validation and focuses the first invalid field', async () => {
    wrapper = mount(GradeForm, {
      attachTo: document.body,
      props: { mode: 'create', students, courses },
    })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#grade-student').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#grade-course').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#grade-score').attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('#grade-student').element)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('renders Edit identity read-only, protects pristine submit, and emits delete', async () => {
    wrapper = mount(GradeForm, {
      props: {
        mode: 'edit',
        students,
        courses,
        initialValues: { studentId: 1, courseId: 10, score: 'A' },
      },
    })

    expect(wrapper.findAll('select')).toHaveLength(0)
    expect(wrapper.get('#grade-student').text()).toContain('Student One - ID: 1')
    expect(wrapper.get('#grade-course').text()).toContain('JAVA101 - Java')
    expect(wrapper.get('#grade-student').attributes('aria-readonly')).toBe('true')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.findAll('button').find(button => button.text() === 'Delete Grade')?.trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)

    await wrapper.get('#grade-score').setValue(' A+ ')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({ score: 'A+' })
  })

  it('clears a selected option that disappears while preserving score', async () => {
    wrapper = mount(GradeForm, {
      props: { mode: 'create', students, courses },
    })
    await wrapper.get('#grade-student').setValue('1')
    await wrapper.get('#grade-course').setValue('10')
    await wrapper.get('#grade-score').setValue('Pass')

    await wrapper.setProps({ students: [] })
    await flushPromises()

    expect((wrapper.get('#grade-student').element as HTMLSelectElement).value).toBe('')
    expect((wrapper.get('#grade-score').element as HTMLInputElement).value).toBe('Pass')
  })
})
