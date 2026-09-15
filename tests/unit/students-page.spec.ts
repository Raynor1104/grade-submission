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
  createMemoryHistory,
  createRouter,
} from 'vue-router'

import StudentsPage from '@/features/students/pages/StudentsPage.vue'

let activeWrapper: VueWrapper | undefined

async function mountPage(initialPath = '/students') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/students', component: StudentsPage },
      { path: '/students/new', component: { template: '<div>Add page</div>' } },
      { path: '/students/:id', component: { template: '<div>Detail page</div>' } },
    ],
  })

  await router.push(initialPath)
  await router.isReady()

  activeWrapper = mount(StudentsPage, {
    attachTo: document.body,
    global: {
      plugins: [router],
    },
  })

  return {
    wrapper: activeWrapper,
    router,
  }
}

afterEach(() => {
  activeWrapper?.unmount()
  activeWrapper = undefined
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('StudentsPage mock-data mode', () => {
  it('renders mock data without HTTP and filters with canonical URL state', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, router } = await mountPage('/students?page=2')

    expect(wrapper.text()).toContain('Phan Duc Long')
    expect(wrapper.text()).toContain('Showing 11–11 of 11 students')
    expect(fetchMock).not.toHaveBeenCalled()

    await wrapper.get('#student-search').setValue('  NGUYEN  ')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ q: 'NGUYEN' })
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.text()).not.toContain('Tran Thi B')
    expect(fetchMock).not.toHaveBeenCalled()

    await wrapper.get('#student-search').setValue('missing student')
    await flushPromises()

    expect(wrapper.text()).toContain('No students found.')
    expect(wrapper.find('[aria-label="Student list pagination"]').exists()).toBe(false)
  })

  it('does not delete on open/cancel and restores focus to the trigger', async () => {
    const { wrapper } = await mountPage()
    const deleteButton = wrapper.findAll('button')
      .find(button => button.text() === 'Delete')

    deleteButton?.element.focus()
    await deleteButton?.trigger('click')

    expect(wrapper.find('dialog').exists()).toBe(true)

    const cancelButton = wrapper.find('dialog').findAll('button')
      .find(button => button.text() === 'Cancel')
    await cancelButton?.trigger('click')
    await flushPromises()

    expect(wrapper.find('dialog').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(document.activeElement).toBe(deleteButton?.element)
  })

  it('deletes mock data locally, prevents duplicate confirmation, and clamps page', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, router } = await mountPage('/students?page=2')
    const rowDeleteButton = wrapper.findAll('button')
      .find(button => button.text() === 'Delete')

    await rowDeleteButton?.trigger('click')

    const confirmButton = wrapper.find('dialog').findAll('button')
      .find(button => button.text() === 'Delete')
    await confirmButton?.trigger('click')
    await confirmButton?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain('Phan Duc Long')
    expect(router.currentRoute.value.query.page).toBeUndefined()
    expect(wrapper.text()).toContain('Showing 1–10 of 10 students')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('navigates Add and View to the canonical routes', async () => {
    const { wrapper, router } = await mountPage()

    const addButton = wrapper.findAll('button')
      .find(button => button.text() === 'Add Student')
    await addButton?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/students/new')

    await router.push('/students')
    await flushPromises()

    const viewButton = wrapper.findAll('button')
      .find(button => button.text() === 'View')
    await viewButton?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/students/1')
  })
})
