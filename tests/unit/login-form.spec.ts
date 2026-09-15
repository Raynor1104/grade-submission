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

import LoginForm from '@/features/auth/components/LoginForm.vue'

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe('LoginForm', () => {
  it('renders accessible credential fields and toggles password visibility', async () => {
    wrapper = mount(LoginForm, { attachTo: document.body })
    const username = wrapper.get<HTMLInputElement>('#login-username')
    const password = wrapper.get<HTMLInputElement>('#login-password')

    expect(username.attributes('autocomplete')).toBe('username')
    expect(password.attributes('autocomplete')).toBe('current-password')
    expect(password.element.type).toBe('password')

    await password.setValue('unchanged password')
    const toggle = wrapper.get('button[aria-label="Show password"]')
    await toggle.trigger('click')

    expect(password.element.type).toBe('text')
    expect(password.element.value).toBe('unchanged password')
    expect(wrapper.get('button[aria-label="Hide password"]')).toBeTruthy()
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('blocks an invalid submit, links errors, and focuses the first field', async () => {
    wrapper = mount(LoginForm, { attachTo: document.body })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.text()).toContain('Username is required.')
    expect(wrapper.text()).toContain('Password is required.')
    expect(wrapper.get('[role="alert"]').text())
      .toBe('Username is required. Password is required.')
    expect(wrapper.get('#login-username').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#login-username').attributes('aria-describedby'))
      .toBe('login-username-error')
    expect(document.activeElement).toBe(wrapper.get('#login-username').element)
  })

  it('trims only username and prevents duplicate synchronous submits', async () => {
    wrapper = mount(LoginForm, { attachTo: document.body })
    await wrapper.get('#login-username').setValue('  tanaka  ')
    await wrapper.get('#login-password').setValue('  exact password  ')

    const form = wrapper.get('form')
    void form.trigger('submit')
    void form.trigger('submit')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('submit')).toEqual([[
      {
        username: 'tanaka',
        password: '  exact password  ',
      },
    ]])
  })

  it('announces a safe server error and disables submit while pending', () => {
    wrapper = mount(LoginForm, {
      props: {
        submitting: true,
        serverError: 'Login failed. Please try again.',
      },
    })

    expect(wrapper.get('[role="alert"]').text())
      .toBe('Login failed. Please try again.')
    expect(wrapper.get('button[type="submit"]').attributes('disabled'))
      .toBeDefined()
    expect(wrapper.text()).toContain('Logging in...')
  })
})
