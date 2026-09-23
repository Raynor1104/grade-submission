import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createMemoryHistory, createRouter } from 'vue-router'

import StudentForm from '@/features/students/components/StudentForm.vue'
import StudentCreatePage from '@/features/students/pages/StudentCreatePage.vue'
import {
  isValidCalendarDate,
  normalizeStudentForm,
  validateStudentForm,
} from '@/features/students/model/student-form'
import { studentKeys } from '@/core/api/query-keys'

describe('Student form model', () => {
  it('trims name without changing casing or date-only value', () => {
    expect(normalizeStudentForm({
      name: '  Nguyễn Văn A  ',
      birthDate: '1980-07-31',
    })).toEqual({ name: 'Nguyễn Văn A', birthDate: '1980-07-31' })
  })

  it('validates calendar dates and future dates', () => {
    expect(isValidCalendarDate('2024-02-29')).toBe(true)
    expect(isValidCalendarDate('2025-02-29')).toBe(false)
    expect(isValidCalendarDate('2026-13-01')).toBe(false)
    expect(isValidCalendarDate('2026-2-01')).toBe(false)
    expect(validateStudentForm({ name: '   ', birthDate: '' }, '2026-09-22'))
      .toEqual({
        name: 'Full Name is required.',
        birthDate: 'Birth Date is required.',
      })
    expect(validateStudentForm({ name: 'A', birthDate: '2025-02-29' }, '2026-09-22'))
      .toEqual({ birthDate: 'Enter a valid Birth Date.' })
    expect(validateStudentForm({ name: 'A', birthDate: '2026-09-23' }, '2026-09-22'))
      .toEqual({ birthDate: 'Birth Date cannot be in the future.' })
  })
})

describe('StudentForm', () => {
  it('renders create ID, validates fields, and emits only normalized values', async () => {
    const wrapper = mount(StudentForm, { props: { mode: 'create' } })
    expect(wrapper.text()).toContain('Auto-generated after saving')
    expect(wrapper.find('input[id="student-id"]').exists()).toBe(false)
    expect(wrapper.get('button[type="submit"]').text()).toContain('Save Student')

    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.get('#student-name').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#student-birth-date').attributes('aria-describedby'))
      .toBe('student-birth-date-message')

    await wrapper.get('#student-name').setValue('  Nguyễn Văn A  ')
    await wrapper.get('#student-birth-date').setValue('1980-07-31')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual([{
      name: 'Nguyễn Văn A',
      birthDate: '1980-07-31',
    }])
    await wrapper.get('button[type="button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('renders edit identity, keeps draft on error, and locks pending actions', async () => {
    const wrapper = mount(StudentForm, {
      props: {
        mode: 'edit',
        studentId: 12,
        initialValues: { name: 'Original', birthDate: '1980-07-31' },
      },
    })
    expect(wrapper.text()).toContain('12')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.get('#student-name').setValue('Edited')
    await wrapper.setProps({ submitError: 'Unable to update student.' })
    expect((wrapper.get('#student-name').element as HTMLInputElement).value).toBe('Edited')
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to update student.')

    await wrapper.setProps({ pending: true })
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined))
      .toBe(true)
  })
})

let activeWrapper: VueWrapper | undefined
let queryClient: QueryClient | undefined

afterEach(() => {
  activeWrapper?.unmount()
  activeWrapper = undefined
  queryClient?.clear()
  queryClient = undefined
  vi.unstubAllGlobals()
})

async function mountCreatePage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/students/new', component: StudentCreatePage },
      { path: '/students', component: { template: '<div>Students</div>' } },
    ],
  })
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  await router.push('/students/new')
  await router.isReady()
  activeWrapper = mount(StudentCreatePage, {
    global: { plugins: [router, [VueQueryPlugin, { queryClient }]] },
  })
  return { wrapper: activeWrapper, router }
}

describe('StudentCreatePage', () => {
  it('posts one ID-free payload and navigates after success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 13, name: 'Nguyễn Văn A', birthDate: '1980-07-31',
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper, router } = await mountCreatePage()
    await wrapper.get('#student-name').setValue('  Nguyễn Văn A  ')
    await wrapper.get('#student-birth-date').setValue('1980-07-31')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/student')
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual({
      name: 'Nguyễn Văn A', birthDate: '1980-07-31',
    })
    expect(router.currentRoute.value.path).toBe('/students')
    expect(queryClient?.isFetching({ queryKey: studentKeys.root })).toBe(0)
  })

  it('keeps values and route after failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })))
    const { wrapper, router } = await mountCreatePage()
    await wrapper.get('#student-name').setValue('A')
    await wrapper.get('#student-birth-date').setValue('1980-07-31')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/students/new')
    expect((wrapper.get('#student-name').element as HTMLInputElement).value).toBe('A')
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to save student')
  })

  it('does not submit twice while the POST is pending', async () => {
    let finishRequest: ((response: Response) => void) | undefined
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>(resolve => {
      finishRequest = resolve
    }))
    vi.stubGlobal('fetch', fetchMock)
    const { wrapper } = await mountCreatePage()
    await wrapper.get('#student-name').setValue('A')
    await wrapper.get('#student-birth-date').setValue('1980-07-31')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    finishRequest?.(new Response(null, { status: 200 }))
    await flushPromises()
  })
})
