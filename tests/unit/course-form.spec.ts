import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import CourseForm from '@/features/courses/components/CourseForm.vue'
import {
  normalizeCourseForm,
  validateCourseForm,
} from '@/features/courses/model/course-form'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Course form model', () => {
  it('trims fields without changing code casing or internal description newlines', () => {
    expect(normalizeCourseForm({
      code: '  java101  ',
      subject: '  Java Programming  ',
      description: '  First line\nSecond line  ',
    })).toEqual({
      code: 'java101',
      subject: 'Java Programming',
      description: 'First line\nSecond line',
    })
  })

  it('rejects required fields containing only whitespace', () => {
    expect(validateCourseForm({
      code: '  ',
      subject: '\t',
      description: '\n ',
    })).toEqual({
      code: 'Course Code is required.',
      subject: 'Course Name is required.',
      description: 'Description is required.',
    })
  })
})

describe('CourseForm', () => {
  it('renders create fields, focuses the first error, and emits normalized values', async () => {
    const wrapper = mount(CourseForm, {
      attachTo: document.body,
      props: { mode: 'create' },
    })

    expect(wrapper.get('button[type="submit"]').text()).toContain('Save Course')
    expect(wrapper.get('#course-code').attributes('required')).toBeDefined()
    expect(wrapper.get('#course-subject').attributes('required')).toBeDefined()
    expect(wrapper.get('#course-description').element.tagName).toBe('TEXTAREA')
    expect(wrapper.get('#course-description').attributes('required')).toBeDefined()

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(document.activeElement).toBe(wrapper.get('#course-code').element)
    expect(wrapper.get('#course-code').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#course-code').attributes('aria-describedby'))
      .toBe('course-code-message')

    await wrapper.get('#course-code').setValue('  java101  ')
    await wrapper.get('#course-subject').setValue('  Java Programming  ')
    await wrapper.get('#course-description').setValue('  First\nSecond  ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      code: 'java101',
      subject: 'Java Programming',
      description: 'First\nSecond',
    }])

    await wrapper.get('button[type="button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('renders Edit values, preserves a draft on error, and locks pending actions', async () => {
    const wrapper = mount(CourseForm, {
      props: {
        mode: 'edit',
        initialValues: {
          code: 'JAVA101',
          subject: 'Java',
          description: 'Original',
        },
      },
    })

    expect(wrapper.get('button[type="submit"]').text()).toContain('Update Course')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.get('#course-description').setValue('Draft\nwith another line')
    await wrapper.setProps({ submitError: 'Unable to update the course.' })

    expect((wrapper.get('#course-description').element as HTMLTextAreaElement).value)
      .toBe('Draft\nwith another line')
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to update the course.')

    await wrapper.setProps({ pending: true })
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined))
      .toBe(true)
    expect(wrapper.get('#course-description').attributes('disabled')).toBeDefined()
  })
})
