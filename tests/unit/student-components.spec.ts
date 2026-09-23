import {
  describe,
  expect,
  it,
} from 'vitest'
import { mount } from '@vue/test-utils'

import DeleteConfirmDialog from '@/shared/ui/DeleteConfirmDialog.vue'
import StudentTable from '@/features/students/components/StudentTable.vue'
import StudentToolbar from '@/features/students/components/StudentToolbar.vue'
import type { StudentViewModel } from '@/features/students/model/student.types'

const student: StudentViewModel = {
  id: 12,
  name: 'Nguyen Van A',
  birthDate: '1980-07-31',
}

describe('StudentToolbar', () => {
  it('has an accessible search and emits search/create events', async () => {
    const wrapper = mount(StudentToolbar, {
      props: { search: '' },
    })
    const input = wrapper.get('input')

    expect(input.attributes('aria-label')).toBe('Search students by name or ID')
    await input.setValue('nguyen')
    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:search')?.[0]).toEqual(['nguyen'])
    expect(wrapper.emitted('create')).toHaveLength(1)
  })
})

describe('StudentTable', () => {
  it('renders semantic columns, formatted data, and supported actions', async () => {
    const wrapper = mount(StudentTable, {
      props: { students: [student] },
    })
    const headers = wrapper.findAll('th').map(header => header.text())
    const buttons = wrapper.findAll('button')

    expect(headers).toEqual(['ID', 'Student Name', 'Birth Date', 'Actions'])
    expect(wrapper.text()).toContain('1980/07/31')
    expect(buttons.map(button => button.text())).toEqual(['View', 'Edit', 'Delete'])
    expect(buttons[1]?.attributes('disabled')).toBeUndefined()

    await buttons[0]?.trigger('click')
    await buttons[1]?.trigger('click')
    await buttons[2]?.trigger('click')

    expect(wrapper.emitted('view')?.[0]).toEqual([student])
    expect(wrapper.emitted('edit')?.[0]).toEqual([student])
    expect(wrapper.emitted('delete')?.[0]).toEqual([student])
  })
})

describe('DeleteConfirmDialog', () => {
  it('shows target/cascade warning and does not confirm on cancel', async () => {
    const wrapper = mount(DeleteConfirmDialog, {
      attachTo: document.body,
      props: {
        title: 'Delete student?',
        message: `Are you sure you want to delete “${student.name}” (ID: ${student.id})?`,
        warning: 'Related grade records may also be deleted. This action cannot be undone.',
        isDeleting: false,
        error: null,
      },
    })

    expect(wrapper.get('dialog').attributes('open')).toBeDefined()
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.text()).toContain('ID: 12')
    expect(wrapper.text()).toContain('Related grade records may also be deleted')

    await wrapper.findAll('button')[0]?.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
    wrapper.unmount()
  })

  it('emits cancel for Escape when idle', async () => {
    const wrapper = mount(DeleteConfirmDialog, {
      props: { title: 'Delete?', message: 'Delete this item?' },
    })

    await wrapper.get('dialog').trigger('cancel')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    wrapper.unmount()
  })

  it('locks actions and Escape, and announces an error', async () => {
    const wrapper = mount(DeleteConfirmDialog, {
      props: {
        title: 'Delete student?',
        message: `Delete ${student.name}?`,
        isDeleting: true,
        error: 'Unable to delete student. Please try again.',
      },
    })

    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to delete student')
    await wrapper.get('dialog').trigger('cancel')
    expect(wrapper.emitted('cancel')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toBeUndefined()
    wrapper.unmount()
  })
})
